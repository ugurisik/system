package alba.system.server.core;

import lombok.Getter;
import lombok.Setter;

import java.io.*;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Getter
@Setter
public class WS {
    private static final String LOG_UNIT = "WebSocket";
    private DataInputStream dataInputStream;
    private DataOutputStream dataOutputStream;
    private boolean busy = false;
    public WS(DataInputStream dataInputStream, DataOutputStream dataOutputStream) {
        setDataInputStream(dataInputStream);
        setDataOutputStream(dataOutputStream);
    }



    public static BitSet bitSetFromByte(byte b) {
        BitSet bits = new BitSet(8);
        for (int i = 0; i < 8; ++i) {
            bits.set(i, (b & 1) == 1);
            b = (byte) (b >> 1);
        }
        return bits;
    }

    public static BitSet bitSetFromShort(short s) {
        BitSet bits = new BitSet(16);
        for (int i = 0; i < 16; ++i) {
            bits.set(i, (s & 1) == 1);
            s = (short) (s >> 1);
        }
        return bits;
    }

    public static BitSet bitSetFromInt(int v) {
        BitSet bits = new BitSet(32);
        for (int i = 0; i < 32; ++i) {
            bits.set(i, (v & 1) == 1);
            v >>= 1;
        }
        return bits;
    }

    public static BitSet bitSetFromLong(long l) {
        BitSet bits = new BitSet(64);
        for (int i = 0; i < 64; ++i) {
            bits.set(i, (l & 1L) == 1L);
            l >>= 1;
        }
        return bits;
    }
    private long getFrameLength(BitSet maskAndLength) {
        long length = 0;
        for (int readCount = 6; readCount > -1; --readCount) {
            length <<= 1;
            if (maskAndLength.get(readCount)) {
                ++length;
            }
        }
        return length;
    }

    private long readExtendedLengthLong() throws IOException {
        BitSet eLength = bitSetFromLong(getDataInputStream().readLong());
        long length = 0;
        for (int k = 63; k > -1; --k) {
            length <<= 1;
            if (eLength.get(k)) {
                ++length;
            }
        }
        return length;
    }

    private long readExtendedLengthShort() throws IOException {
        BitSet eLength = bitSetFromShort(getDataInputStream().readShort());
        long length = 0;
        for (int k = 15; k > -1; --k) {
            length <<= 1;
            if (eLength.get(k)) {
                ++length;
            }
        }
        return length;
    }

    private byte[] readMask() throws IOException {
        byte[] mask = new byte[4];
        for (int i = 0; i < 4; i++) {
            mask[i] = getDataInputStream().readByte();
        }
        return mask;
    }

    private void unmaskPayload(WS.WebSocketFrame frame) {
        for (int readCount = 0; readCount < frame.getPayload().length; ++readCount) {
            byte mask = frame.getMask()[readCount % 4];
            frame.getPayload()[readCount] ^= mask;
        }
    }
    private byte[] readPayload(WS.WebSocketFrame frame) throws IOException, InterruptedException {
        byte[] payload = new byte[(int) frame.length];

        if (frame.length > 65536L) {
            long remainingBytes = frame.length;
            int bytesRead = 0;

            while (remainingBytes > 0) {
                while (getDataInputStream().available() < Math.min(65536, remainingBytes)) {
                    Thread.sleep(300L);
                }

                int availableBytes = getDataInputStream().available();
                int toRead = (int) Math.min(availableBytes, remainingBytes);

                getDataInputStream().read(payload, bytesRead, toRead);

                bytesRead += toRead;
                remainingBytes -= toRead;
            }
        } else {
            while (getDataInputStream().available() < frame.length) {
                Thread.sleep(200L);
            }
            getDataInputStream().read(payload);
        }

        return payload;
    }

    public boolean write(WS.WebSocketMessage message) {
        WS.WebSocketFrame[] frames = message.getFrames();

        for (int k = 0; k < frames.length; k++) {
            try {
                synchronized (this) {
                    while (isBusy()) {
                        try {
                            wait(200L);
                        } catch (InterruptedException e) {
                            Thread.currentThread().interrupt();
                            System.out.println("Error21: " + e.getMessage());
                            return false;
                        }
                    }
                    setBusy(true);
                }
                getDataOutputStream().write(frames[k].payload);
                getDataOutputStream().flush();
                synchronized (this) {
                    setBusy(false);
                    notifyAll();
                }
            } catch (IOException e) {
                System.out.println("Error32: " + e.getMessage());
                return false;
            } catch (Exception e) {
                System.out.println("Error12: " + e.getMessage());
                return false;
            }
        }

        return true;
    }
    public WS.WebSocketMessage read() {
        boolean isFinalFrame = false;
        ArrayList<WS.WebSocketFrame> frames = new ArrayList<>();

        while (!isFinalFrame) {
            try {
                WS.WebSocketFrame frame = new WS.WebSocketFrame(false);

                byte bFrameStart = getDataInputStream().readByte();
                BitSet frameStartBits = bitSetFromByte(bFrameStart);
                BitSet maskAndLengthBits = bitSetFromByte(getDataInputStream().readByte());

                frame.setFine(frameStartBits.get(7));
                frame.setRsv1(frameStartBits.get(6));
                frame.setRsv2(frameStartBits.get(5));
                frame.setRsv3(frameStartBits.get(4));

                frame.setOpcode(extractOpCode(frameStartBits));

                frame.setHashMask(maskAndLengthBits.get(7));

                frame.setLength(getFrameLength(maskAndLengthBits));

                if (frame.length == 127L) {
                    frame.length = readExtendedLengthLong();
                } else if (frame.length == 126L) {
                    frame.length = readExtendedLengthShort();
                }

                if (frame.isHashMask()) {
                    frame.setMask(readMask());
                }

                frame.setPayload(readPayload(frame));

                if (frame.payload != null && frame.isHashMask()) {
                    unmaskPayload(frame);
                }

                isFinalFrame = frame.fine;
                frames.add(frame);

            } catch (EOFException eof) {
                System.out.println("End of stream reached unexpectedly: " + eof.getMessage());
                return null;  // Dosya sonuna ulaşıldıysa veya veri bittiğinde işlem durdurulur
            } catch (IOException e) {
                System.out.println("I/O Error: " + e.getMessage());
                return null;  // Diğer IO hataları yönetilir
            } catch (Exception e) {
                System.out.println("Error: " + e.getMessage());
                return null;  // Genel hata yönetimi
            }
        }

        return new WS.WebSocketMessage(frames.toArray(new WS.WebSocketFrame[0]));
    }

    private byte extractOpCode(BitSet frameStartBits) {
        byte opCode = 0;
        for (int i = 3; i >= 0; i--) {
            opCode = (byte) (opCode << 1);
            if (frameStartBits.get(i)) {
                opCode++;
            }
        }
        return opCode;
    }

    @Getter
    @Setter
    public static class WebSocketFrame {
        private boolean fine = true;
        private boolean rsv1;
        private boolean rsv2;
        private boolean rsv3;
        private byte opcode = 1;
        private boolean hashMask;
        private byte[] mask;
        private byte[] payload;
        private long length;

        public WebSocketFrame(boolean fromServer) {
            this.hashMask = !fromServer;
        }

        public WebSocketFrame(byte[] payload, boolean fromServer) {
            this.hashMask = !fromServer;
            processPayload(payload);
        }

        private void processPayload(byte[] payload) {
            int maskLength = hashMask ? 4 : 0;
            int headerLength = (payload.length < 126) ? 2 : 4;
            byte[] frame = new byte[headerLength + maskLength + payload.length];

            ByteBuffer buffer = ByteBuffer.wrap(frame);

            byte frameStart = (byte) ((fine ? 1 : 0) << 7 | opcode);
            buffer.put(frameStart);

            byte maskAndLength = (byte) ((hashMask ? 1 : 0) << 7);

            if (payload.length < 126) {
                buffer.put((byte) (maskAndLength | payload.length));
            } else {
                buffer.put((byte) (maskAndLength | 126));
                buffer.putShort((short) payload.length);
            }

            if (hashMask) {
                mask = generateMask();
                buffer.put(mask);
                applyMask(payload);
            }

            buffer.put(payload);
            this.payload = frame;
        }

        private void applyMask(byte[] payload) {
            for (int i = 0; i < payload.length; i++) {
                payload[i] ^= mask[i % 4]; // XOR the payload with the mask
            }
        }

        private static byte[] generateMask() {
            byte[] mask = new byte[4];
            new Random().nextBytes(mask); // More concise mask generation
            return mask;
        }
    }

    @Getter
    @Setter
    public static class WebSocketMessage{
        private String body;
        private WS.WebSocketFrame[] frames;

        public WebSocketMessage(String body){
            setBody(body);
            processMessage();
        }

        private void processMessage(){
            byte[] payLoad;
            payLoad = getBody().getBytes(StandardCharsets.UTF_8);
            int maxFrameSize = 65535;
            if (payLoad.length < maxFrameSize) {
                setFrames(new WS.WebSocketFrame[1]);
                getFrames()[0] = new WS.WebSocketFrame(payLoad, true);
            } else {
                int numFrames = (int) Math.ceil((double) payLoad.length / maxFrameSize);
                setFrames(new WS.WebSocketFrame[numFrames]);

                for (int k = 0; k < numFrames; k++) {
                    getFrames()[k] = new WS.WebSocketFrame(true);
                    getFrames()[k].setFine(k == numFrames - 1);
                    getFrames()[k].setOpcode((byte) (k == 0 ? 1 : 0));

                    int start = k * maxFrameSize;
                    int end = Math.min((k + 1) * maxFrameSize, payLoad.length);
                    getFrames()[k].processPayload(Arrays.copyOfRange(payLoad, start, end));
                }
            }
        }
        public WebSocketMessage(WS.WebSocketFrame[] frames) {
            setFrames(frames);

            int totalLength = Arrays.stream(frames)
                    .filter(frame -> frame.payload != null)
                    .mapToInt(frame -> frame.payload.length)
                    .sum();


            byte[] payLoad = new byte[totalLength];
            ByteBuffer buffer = ByteBuffer.wrap(payLoad);


            for (WS.WebSocketFrame frame : frames) {
                if (frame.payload != null) {
                    buffer.put(frame.payload);
                }
            }
            setBody(new String(payLoad, StandardCharsets.UTF_8));
        }
    }
}
