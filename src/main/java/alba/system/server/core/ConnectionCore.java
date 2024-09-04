package alba.system.server.core;

import lombok.Getter;
import lombok.Setter;

import java.io.*;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.regex.Pattern;

public class ConnectionCore {
    public static final String WEB_SOCKET_KEY = "Sec-WebSocket-Key";
    public static final String WEB_SOCKET_ACCEPT = "Sec-WebSocket-Accept";
    public static final String WEB_SOCKET_MAGIC_STRING = "228EAFA5-E914-422A-95CA-C5AB0DC85B22";
    public static final String WEB_SOCKET_RESPONSE = "HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade";
    public static final String WEB_SOCKET_COOKIE = "Set-Cookie: ";
    public static final String WEB_SOCKET_COOKIE_NAME = "ALBAN";
    public static final String WEB_SOCKET_COOKIE_LANG = "ALBAL";
    public static final String WEB_URI_KEY = "uri";
    private static final String LOG_UNIT = "ClientHolder";
    public static Socket _socket;
    private static Pattern _argumentPattern = Pattern.compile("\"([^\"]*)\"|(\\S+)");
    private static Pattern _messageIdPattern = Pattern.compile("MID:([0-9]*)");
    private int _port = 1920;
    private ServerSocket _serverSocket;
    private String _rootFolder = System.getProperty("user.dir");

    public ConnectionCore() {
        this.ready();
    }

    public ConnectionCore(int port) {
        this._port = port;
        this.ready();
    }

    private void ready() {
        try {
            System.out.println("Server is running... on port " + this._port);
            this._serverSocket = new ServerSocket(this._port);
        } catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
            System.exit(1);
        }
    }

    public void startListening(){
        while (true) {
            try{
                _socket = this._serverSocket.accept();
                System.out.println("Client connected: " + _socket.getInetAddress().getHostAddress());
                Runnable r = new ConnectionCore.ClientHandler(_socket);
                (new Thread(r)).start();
            }catch (Exception e){
                System.out.println("Error: " + e.getMessage());
            }
        }
    }




    @Getter
    @Setter

    public static class ClientHandler implements Runnable{
        private Socket clientSocket;
        private ConnectionCore.SocketType type;
        private PrintWriter _writer;
        private BufferedReader _reader;
        private WS _webSocket;
        private OutputStream _outputStream;
        private InputStream _inputStream;
        private boolean closeRequest;

        public ClientHandler(Socket _clientSocket){
            setClientSocket(_clientSocket);
            setType(SocketType.NOTSELECTED);
            setCloseRequest(false);
        }

        @Override
        public void run() {
            try{
                OutputStream out = getClientSocket().getOutputStream();
                InputStream in = getClientSocket().getInputStream();
                set_outputStream(out);
                set_inputStream(in);
                set_writer(new PrintWriter(out, true));
                set_reader(new BufferedReader(new InputStreamReader(in)));
                set_webSocket(new WS(new DataInputStream(in), new DataOutputStream(out)));
                while(!this.closeRequest){
                    try{
                        Thread.sleep(10);
                        if(getClientSocket().isClosed()){
                            break;
                        }
                        String output;
                        if(getType() == SocketType.WEBSOCKET){

                        }
                    }catch (Exception e){
                        System.out.println("Error: " + e.getMessage());
                    }
                }

            }catch (Exception e){
                System.out.println("Error: " + e.getMessage());
            }
        }
    }

    public static enum SocketType {
        NOTSELECTED(0),
        RAW(1),
        WEBSOCKET(2),
        HTTP(3);

        private final int _value;

        private SocketType(int value) {
            this._value = value;
        }

        public int value() {
            return this._value;
        }
    }
}
