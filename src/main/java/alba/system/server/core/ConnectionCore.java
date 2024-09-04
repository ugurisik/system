package alba.system.server.core;

import alba.system.server.utils.Enums;
import alba.system.server.utils.Logger;
import alba.system.server.utils.ServerUtility;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import lombok.Getter;
import lombok.Setter;
import org.apache.commons.codec.binary.Base64;
import org.apache.http.*;
import org.apache.http.impl.DefaultHttpRequestFactory;
import org.apache.http.impl.entity.EntityDeserializer;
import org.apache.http.impl.entity.LaxContentLengthStrategy;
import org.apache.http.impl.io.AbstractSessionInputBuffer;
import org.apache.http.impl.io.HttpRequestParser;
import org.apache.http.io.HttpMessageParser;
import org.apache.http.io.SessionInputBuffer;
import org.apache.http.message.BasicHttpEntityEnclosingRequest;
import org.apache.http.message.BasicLineParser;
import org.apache.http.params.BasicHttpParams;

import java.io.*;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class ConnectionCore {
    public static final String WEB_SOCKET_KEY = "Sec-WebSocket-Key";
    public static final String WEB_SOCKET_ACCEPT = "Sec-WebSocket-Accept";
    public static final String WEB_SOCKET_MAGIC_STRING = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
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
            System.out.println("Error2: " + e.getMessage());
            System.exit(1);
        }
    }

    public void startListening() {
        while (true) {
            try {
                _socket = this._serverSocket.accept();
                System.out.println("Client connected: " + _socket.getInetAddress().getHostAddress());
                Runnable r = new ConnectionCore.ClientHandler(_socket);
                (new Thread(r)).start();
            } catch (Exception e) {
                System.out.println("Error1: " + e.getMessage());
            }
        }
    }

    private static String _getMessageId(String message) {
        Matcher m = _messageIdPattern.matcher(message);
        return m.find() ? m.group(1) : null;
    }
    private static String[] _getArgs(String message) {
        Matcher m = _argumentPattern.matcher(message);
        ArrayList result = new ArrayList();

        while (m.find()) {
            if (m.group(1) != null) {
                result.add(m.group(1));
            } else {
                result.add(m.group(2));
            }
        }

        return (String[]) result.toArray(new String[result.size()]);
    }
    public static String processMessage(String message) {
        try {
            String messageId = _getMessageId(message);
            if (messageId != null) {
                message = message.substring(5 + messageId.length());
            }

            String output = null;
            if (message.startsWith("{")) {
                JsonElement eMsg = SuResponse.getGSONParser().parse(message);
                JsonObject oMsg = (JsonObject) eMsg;
                if (oMsg.has("action")) {
                    StringDictionary<ServerObject> sInputs = new StringDictionary();
                    StringDictionary<String> mem = ServerUtility.getMemory();
                    if (mem == null) {
                        mem = new StringDictionary();
                    }

                    String action = oMsg.get("action").getAsString();
                    if (oMsg.get("args").isJsonArray()) {
                        JsonArray args = oMsg.get("args").getAsJsonArray();

                        for (int k = 0; k < args.size(); ++k) {
                            JsonObject oArg = (JsonObject) args.get(k);
                            String key;
                            String value;
                            if (oArg.get("value").isJsonObject()) {
                                key = oArg.get("key").getAsString();
                                value = ((JsonObject) oArg.get("value")).get("value").getAsString();
                                mem.put((String) key, value);
                            } else if (!oArg.get("value").isJsonNull()) {
                                key = oArg.get("key").getAsString();
                                value = oArg.get("value").getAsString();
                                mem.put((String) key, value);
                            }
                        }
                    }

                  /*  ServerObject sInput = new ServerObject();
                    sInput.args = new String[]{action};
                    sInput.memory = mem;
                    sInputs.put((String) "ARGS", sInput);
                    SuResponse response = MapService.call(oMsg.get("cls").getAsString(), action, sInputs);
                    ServerUtility.clearMemory();
                    if (response.getForm() == null) {
                        Translateable.translateAll(response);
                        output = SuResponse.getGSON().toJson(response);
                    } else {
                        output = SuResponse.getGSON().toJson(response.getForm());
                    }*/
                    output = "E005:INeedSomething!";
                }
            } else {
                String[] args = _getArgs(message);
                if (args.length > 0) {
                    if (args[0].equals("parameter")) {
                        if (args.length > 1) {
                            if (args[1].equals("set")) {
                                if (args.length > 3) {
                                    ServerUtility.setParameter(args[2], args[3].replace("&quot;", "\""));
                                    output = "OK.";
                                } else {
                                    output = "E005:INeedNameAndValue!";
                                }
                            } else if (args[1].startsWith("get")) {
                                if (args.length > 2) {
                                    output = ServerUtility.getParameter(args[2]);
                                } else {
                                    output = "E004:INeedName!";
                                }
                            }
                        } else {
                            output = "E003:INeedMore!";
                        }
                    } else {
                        StringDictionary mem;
                        if (args[0].equals("memory")) {
                            mem = ServerUtility.getMemory();
                            if (args.length > 1) {
                                if (args[1].equals("set")) {
                                    if (args.length > 3) {
                                        mem.put((String) args[2], args[3].replace("&quot;", "\""));
                                        output = "GoAhead.";
                                    } else {
                                        output = "E005:INeedNameAndValue!";
                                    }
                                } else if (args[1].equals("get")) {
                                    if (args.length > 2) {
                                        output = (String) mem.get(args[2]);
                                    } else {
                                        output = "E004:INeedName!";
                                    }
                                } else if (args[1].equals("clear")) {
                                    ServerUtility.clearMemory();
                                    output = "Done.";
                                }
                            } else {
                                output = "E003:INeedMore!";
                            }
                        } else if (args[0].equals("service")) {
                            if (args.length > 2) {
                                mem = new StringDictionary();
                                String[] sArgs = new String[args.length - 3];

                                for (int k = 3; k < args.length; ++k) {
                                    sArgs[k - 3] = args[k];
                                }

                             /*   ServerObject sInput = new ServerObject();
                                sInput.args = sArgs;
                                sInput.memory = ServerUtility.getMemory();
                                mem.put((String) "ARGS", sInput);
                                SuResponse response = MapService.call(args[1], args[2], mem);
                                ServerUtility.clearMemory();
                                if (response.getForm() == null) {
                                    output = SuResponse.getGSON().toJson(response);
                                } else {
                                    output = SuResponse.getGSON().toJson(response.getForm());
                                }*/
                                output = "E003:INeedMore!";
                            } else {
                                output = "E003:INeedMore!";
                            }
                        } else if (args[0].equals("form")) {
                            mem = ServerUtility.getMemory();
                            if (args.length > 1) {
                             //   WindowForm form;
                                if (args[1].equals("activate")) {
                                    if (args.length > 2) {
                                      /*  form = WindowForm.getFormByUuid(args[2]);
                                        if (form != null) {
                                            ServerUtility.setForm(form);
                                            output = "Activated.";
                                        } else {
                                            output = "E504:FormNotFound!";
                                        }*/
                                        output = "E504:FormNotFound!";
                                    } else {
                                        output = "E005:INeedNameAndValue!";
                                    }
                                } else if (args[1].equals("set")) {
                                    if (args.length > 4) {
                                        /*form = ServerUtility.getForm();
                                        if (form == null) {
                                            output = "E502:NotEnoughParameters!";
                                        } else if (form.setComponent(args[2], args[3], args[4])) {
                                            output = "Set.";
                                        } else {
                                            output = "E507:ComponentNotSet!";
                                        }*/
                                        output = "E507:ComponentNotSet!";
                                    } else {
                                        output = "E004:INeedMore!";
                                    }
                                } else if (args[1].equals("clear")) {
                                    ServerUtility.clearMemory();
                                    output = "Done.";
                                }
                            } else {
                                output = "E003:INeedMore!";
                            }
                        } else if (args[0].equals("channel")) {
                            if (args[1].equals("push")) {
                                WSUpdateCore.Payload p = new WSUpdateCore.Payload();
                                p.customData = args[3];
                                WSUpdateCore.pump(args[2], p);
                                output = "Sent.";
                            }
                        } else if (args[0].equals("sa.")) {
                            output = "as.";
                        } else {
                            output = "E002:DidntGetWhatYouMean!";
                        }
                    }
                }
            }

            if (output == null) {
                output = "E001:RetryWhenYouHaveSomethingToSay!";
            }

            System.out.println("!-- --IP!" + ConnectionCore._socket.getInetAddress() + "!-- --M!" + message + "!--");
            return messageId != null ? "MID:" + messageId + " " + output : output;
        } catch (Exception e) {
            StringWriter errors = new StringWriter();
            e.printStackTrace(new PrintWriter(errors));
            System.out.println("Error71: " + errors.toString());
            e.printStackTrace(System.out);
            return "E000:ServerError!";
        }
    }


    @Getter
    @Setter

    public static class ClientHandler implements Runnable {
        private Socket clientSocket;
        private Enums.SocketType type;
        private PrintWriter _writer;
        private BufferedReader _reader;
        private WS _webSocket;
        private OutputStream _outputStream;
        private InputStream _inputStream;
        private boolean closeRequest;

        public ClientHandler(Socket _clientSocket) {
            setClientSocket(_clientSocket);
            setType(Enums.SocketType.NOTSELECTED);
            setCloseRequest(false);
        }

        public void closeConnection(String lastMessage) {
            try {
                this._writer.write(lastMessage);
                this._writer.flush();
                Thread.sleep(1000L);
                getClientSocket().close();
                setCloseRequest(true);
            } catch (Exception var3) {
                System.out.println("Error closing connection: " + var3.toString());
            }
        }

        @Override
        public void run() {
            int errorCount = 0;
            try {
                OutputStream out = getClientSocket().getOutputStream();
                InputStream in = getClientSocket().getInputStream();
                set_outputStream(out);
                set_inputStream(in);
                set_writer(new PrintWriter(out, true));
                set_reader(new BufferedReader(new InputStreamReader(in)));
                set_webSocket(new WS(new DataInputStream(in), new DataOutputStream(out)));
                while (!this.closeRequest) {
                    try {
                        Thread.sleep(10);
                        if (getClientSocket().isClosed()) {
                            break;
                        }
                        String output;
                        if (getType() == Enums.SocketType.WEBSOCKET) {
                            WS.WebSocketMessage wsMessage = get_webSocket().read();
                            if (wsMessage == null) {
                                closeConnection("No message. Goodbye.");
                            } else {
                                output = '>' + ConnectionCore.processMessage(wsMessage.getBody());
                                get_webSocket().write(new WS.WebSocketMessage(output));
                            }
                        } else {
                            String message = null;
                            try {
                                if (getType() == Enums.SocketType.HTTP) {
                                    getClientSocket().setSoTimeout(0);
                                    message = get_reader().readLine();
                                } else {
                                    getClientSocket().setSoTimeout(0);
                                    message = get_reader().readLine();
                                }
                            } catch (Exception e) {
                                System.out.println("Error3: " + e.getMessage());
                            }

                            if (message == null) {
                                closeConnection("Null Message!");
                                return;
                            }

                            if (getType() != Enums.SocketType.NOTSELECTED || !message.startsWith("GET") && !message.startsWith("POST")) {
                                if (getType() == Enums.SocketType.NOTSELECTED) {
                                    closeConnection("Can not determine socket type.");
                                } else if (getType() == Enums.SocketType.HTTP) {
                                    processRequest(message, false);
                                } else if (getType() == Enums.SocketType.RAW) {
                                    output = ConnectionCore.processMessage(message);
                                    get_writer().write(">" + output + "\r\n");
                                    get_writer().flush();
                                }
                            } else {
                                webSocketHandshake(message);
                            }
                        }
                    } catch (Exception e) {
                        System.out.println("Error4: " + e.getMessage());
                        get_writer().write(">E1000:SystemFailure | " + e.getMessage());
                        get_writer().flush();
                        ++errorCount;
                        if (errorCount > 50) {
                            closeConnection("Too many errors. Goodbye.");
                            break;
                        }
                    }
                }

            } catch (Exception e) {
                System.out.println("Error5: " + e.getMessage());
            }
        }
        private HttpMessage _parseHttp(String input) {
            try {
                SessionInputBuffer inputBuffer = new AbstractSessionInputBuffer() {
                    {
                        this.init(new ByteArrayInputStream(input.getBytes()), 10, new BasicHttpParams());
                    }

                    public boolean isDataAvailable(int timeout) throws IOException {
                        throw new RuntimeException("have to override but probably not even called");
                    }
                };
                HttpMessageParser parser = new HttpRequestParser(inputBuffer, new BasicLineParser(new ProtocolVersion("HTTP", 1, 1)), new DefaultHttpRequestFactory(), new BasicHttpParams());
                HttpMessage message = parser.parse();
                if (message instanceof BasicHttpEntityEnclosingRequest) {
                    BasicHttpEntityEnclosingRequest request = (BasicHttpEntityEnclosingRequest) message;
                    EntityDeserializer entityDeserializer = new EntityDeserializer(new LaxContentLengthStrategy());
                    HttpEntity entity = entityDeserializer.deserialize(inputBuffer, message);
                    request.setEntity(entity);
                }

                return message;
            } catch (IOException | HttpException e) {
                throw new RuntimeException("Error parsing http header", e);
            }
        }

        public void switchType(Enums.SocketType type) {
            if (type == Enums.SocketType.RAW) {
                get_writer().write("Hello\r\n");
                get_writer().flush();
                SessionCore sc = SessionCore.getCurrentContext();
                get_writer().write("SID: " + sc.getSessionID() + "\r\n");
                get_writer().flush();
                setType(Enums.SocketType.RAW);
                ConnectionCore.UpdateHandler uHandler = new ConnectionCore.UpdateHandler();
                uHandler.clientSocket = getClientSocket();
                uHandler.parent = Thread.currentThread();
                uHandler.type = getType();
                uHandler.writer = get_writer();
                ConnectionCore.ExtendedThread thread = new ConnectionCore.ExtendedThread(uHandler);
                thread.uHandler = uHandler;
                thread.start();
            } else if (type == Enums.SocketType.WEBSOCKET) {
                ConnectionCore.UpdateHandler uHandler = new ConnectionCore.UpdateHandler();
                uHandler.clientSocket = getClientSocket();
                uHandler.parent = Thread.currentThread();
                uHandler.type = type;
                uHandler.websocket = get_webSocket();
                uHandler.writer = get_writer();
                ConnectionCore.ExtendedThread thread = new ConnectionCore.ExtendedThread(uHandler);
                thread.uHandler = uHandler;
                thread.start();
            }

            setType(type);
        }

        private void webSocketHandshake(String message) {
            boolean endOfMessage = false;
            int lineCount = 0;

            // Mesajın sonuna kadar oku
            while (!endOfMessage) {
                try {
                    String nMessage = this._reader.readLine();
                    if (nMessage.isEmpty()) {
                        endOfMessage = true;
                    } else {
                        message += "\r\n" + nMessage;
                    }
                } catch (Exception e) {
                    System.out.println("Error websocket handshake: " + e.toString());
                    this.switchType(Enums.SocketType.RAW);
                    this.closeConnection("error");
                    return;
                }

                // Çok fazla header kontrolü
                if (++lineCount > 20) {
                    this.closeConnection("Too many headers.");
                    return;
                }
            }

            // HTTP mesajını parse et
            HttpMessage httpMessage = this._parseHttp(message);

            // WebSocket isteği olup olmadığını kontrol et
            if (httpMessage.containsHeader("Sec-WebSocket-Key")) {
                SessionCore sc = SessionCore.getCurrentContext();
                StringDictionary<String> cookies = new StringDictionary<>();

                // Cookie başlıklarını al
                for (Header header : httpMessage.getHeaders("Cookie")) {
                    for (HeaderElement element : header.getElements()) {
                        if (element.getParameters().length > 0) {
                            for (NameValuePair nvp : element.getParameters()) {
                                cookies.put(nvp.getName(), nvp.getValue());
                            }
                        } else {
                            cookies.put(element.getName(), element.getValue());
                        }
                    }
                }

                // ARKS Cookie kontrolü
                if (cookies.containsKey("ARKS")) {
                    SessionCore changedContext = SessionCore.change(cookies.get("ARKS"));
                    if (changedContext == null) {
                        this.closeConnection("Cannot change session context for session id: " + cookies.get("ARKS"));
                        return;
                    }
                }

                // ARKL Cookie kontrolü
                if (cookies.containsKey("ALBAN")) {
                    ServerUtility.setParameter("lang", cookies.get("ALBAL"));
                }

                // WebSocket kabul mesajı oluştur
                String key = httpMessage.getHeaders("Sec-WebSocket-Key")[0].getValue() + WEB_SOCKET_MAGIC_STRING;
                try {
                    MessageDigest md = MessageDigest.getInstance("SHA-1");
                    byte[] hash = md.digest(key.getBytes(StandardCharsets.UTF_8));
                    String hashBase64 = Base64.encodeBase64String(hash);

                    String response = "HTTP/1.1 101 Switching Protocols\r\n"
                            + "Upgrade: websocket\r\n"
                            + "Connection: Upgrade\r\n"
                            + "Sec-WebSocket-Accept: " + hashBase64 + "\r\n\r\n";

                    this._writer.write(response);
                    this._writer.flush();
                    this.switchType(Enums.SocketType.WEBSOCKET);
                    sc.setClientHandler(this);

                } catch (NoSuchAlgorithmException e) {
                    this.closeConnection("SHA-1 Digest error.");
                }
            } else {
                // Eğer WebSocket değilse HTTP olarak devam et
                this.switchType(Enums.SocketType.HTTP);
                this.processRequest(message, true);
            }
        }


        public void processRequest(String message, boolean complete) {
            StringBuilder httpData = new StringBuilder(message);
            String nMessage;

            if (!complete) {
                boolean endOfMessage = false;
                int lineCount = 0;

                while (!endOfMessage) {
                    try {
                        nMessage = this._reader.readLine();
                        if (nMessage == null) {
                            break;
                        }

                        if (nMessage.isEmpty()) {
                            endOfMessage = true;
                        } else {
                            httpData.append("\r\n").append(nMessage);
                        }

                    } catch (Exception e) {
                        Logger.Error(e, "Error websocket handshake", true);
                        this.switchType(Enums.SocketType.RAW);
                        this.closeConnection("");
                        return;
                    }

                    if (++lineCount > 30) {
                        this.closeConnection("Too many headers.");
                        return;
                    }
                }
            }

            String query = "";
            try {
                String uri = httpData.toString().split("\r\n")[0].split(" ")[1];
                StringDictionary<String> queryValues = new StringDictionary<>();

                if (uri.contains("?")) {
                    query = uri.substring(uri.indexOf('?') + 1);
                    uri = uri.substring(0, uri.indexOf('?'));
                    String[] pairs = query.split("&");
                    for (String pair : pairs) {
                        String[] nameValue = pair.split("=");
                        if (nameValue.length > 1) {
                            queryValues.put(URLDecoder.decode(nameValue[0], StandardCharsets.UTF_8), URLDecoder.decode(nameValue[1], StandardCharsets.UTF_8));
                        }
                    }
                }

                if (uri.startsWith("/gtsp/") || (HttpCore.getPage(uri) != null)) {
                    HttpMessage httpMessage = this._parseHttp(message);
                    int length = getContentLength(message);
                    StringDictionary<String> formData = new StringDictionary();
                    StringDictionary<PostFile> files = new StringDictionary();
                    String pair;
                    if (length > 0) {
                        Thread.sleep(100L);
                        char[] chars = new char[length];
                        int read = 0;

                        while (read < length) {
                            this._reader.read(chars, read, 1);
                            read++;
                        }

                        String allMessage = new String(chars);
                        Header[] contentHeaders = httpMessage.getHeaders("Content-Type");
                        String contentType = "";

                        if (contentHeaders != null && contentHeaders.length > 0) {
                            contentType = contentHeaders[0].getValue();
                        }

                        if (!contentType.startsWith("multipart/form-data")) {
                            httpData = new StringBuilder();
                            httpData.append(URLDecoder.decode(allMessage, StandardCharsets.UTF_8));
                        } else {
                            String boundary = contentHeaders[0].getElements()[0].getParameterByName("boundary").getValue();
                            allMessage = allMessage.substring(boundary.length() + 4, allMessage.length() - boundary.length() - 8);
                            String[] multiParts = allMessage.split("\r\n--" + boundary + "\r\n");

                            for (String part : multiParts) {
                                if (!part.isEmpty() && !part.startsWith("--")) {
                                    StringDictionary<String> mimeHeaders = new StringDictionary<>();
                                    String[] subParts = part.split("\r\n\r\n");
                                    String[] partHeaders = subParts[0].split("\r\n");

                                    for (String disposition : partHeaders) {
                                        String[] partHeaderElements = disposition.split(":");
                                        mimeHeaders.put(partHeaderElements[0].trim(), partHeaderElements[1].trim());
                                    }

                                    if (!mimeHeaders.containsKey("Content-Type")) {
                                        String disposition = mimeHeaders.get("Content-Disposition");
                                        String[] params = disposition.split(";");

                                        for (String param : params) {
                                            String[] paramParts = param.split("=");
                                            if ("name".equals(paramParts[0].trim())) {
                                                String name = paramParts[1].replace("\"", "");
                                                formData.put(name, subParts.length > 1 ? new String(subParts[1].getBytes(StandardCharsets.ISO_8859_1), StandardCharsets.UTF_8) : "");
                                            }
                                        }
                                    } else {
                                        PostFile pFile = new PostFile();
                                        pFile.setMimeType(mimeHeaders.get("Content-Type").trim());
                                        String disposition = mimeHeaders.get("Content-Disposition");
                                        String[] params = disposition.split(";");
                                        String fileId = "";

                                        for (String param : params) {
                                            String[] paramParts = param.split("=");
                                            if ("name".equals(paramParts[0].trim())) {
                                                fileId = paramParts[1].replace("\"", "");
                                            } else if ("filename".equals(paramParts[0].trim())) {
                                                pFile.setFileName(paramParts[1].replace("\"", ""));
                                            }
                                        }

                                        if (subParts.length > 1) {
                                            pFile.setContent(subParts[1].getBytes(StandardCharsets.ISO_8859_1));
                                            files.put(fileId, pFile);
                                        }
                                    }
                                }
                            }
                        }
                    }

                    HttpCore page = HttpCore.getPage(uri);
                    String output;
                    String header;

                    if (page == null) {
                        String newUri = uri.substring(6);
                        page = HttpCore.getPage(newUri);
                    }

                    if (page == null) {
                        output = "bulunamadı";
                        header = "HTTP/1.0 404 Not Found\r\n"
                                + "Content-Length: " + output.getBytes("UTF-8").length + "\r\n"
                                + "Pragma: no-cache\r\n"
                                + "Content-Type: text/html; charset=utf-8\r\n\r\n";
                    } else {
                        HttpCore.ActivePageParameters parameters = new HttpCore.ActivePageParameters();
                        parameters.cookies = HttpCore.collectCookies(httpMessage);
                        parameters.pageData = httpData.toString();
                        parameters.query = query;
                        parameters.queryValues = queryValues;
                        parameters.files = files;
                        parameters.formValues = formData;
                        parameters.uri = uri;
                        parameters.clientIP = getClientSocket().getInetAddress().getHostAddress();
                        parameters.httpMessage = httpMessage;


                        if (!httpData.isEmpty()) {
                            for (String data : httpData.toString().split("&")) {
                                String[] values = data.split("=");
                                parameters.formValues.put(values[0], values.length > 1 ? values[1] : "");
                            }
                        }


                        if (page.isStatefull()) {
                            page = HttpCore.getStatefullPage(page, parameters);
                        }



                        HttpCore.ActivePageResponse response = page.run2R(parameters);


                        if (page.isStatefull()) {
                            HttpCore.ActivePageCookie cookie = new HttpCore.ActivePageCookie("ugur", page.getStatefullKey(), 86400);
                            response.addCookie(cookie);
                        }

                        header = response.getHeader();
                        output = response.getResponseText();

                        if (response.getResponseOutput() != null) {
                            get_writer().write(header);
                            get_writer().flush();
                            get_outputStream().write(response.getResponseOutput());
                            get_outputStream().flush();
                            this.closeConnection("");
                            return;
                        }
                    }
                    get_writer().write(header);
                    get_writer().flush();
                    get_writer().write(output);
                    get_writer().flush();
                    this.closeConnection("");
                }

            } catch (Exception e) {
                Logger.Error(e, "Error parsing http header", true);
            }
        }
    }
    private static int getContentLength(String message) {
        String[] lines = message.split("\r\n");
        for (String line : lines) {
            if (line.startsWith("Content-Length:")) {
                return Integer.parseInt(line.split(":")[1].trim());
            }
        }
        return 0;
    }

    public static class ExtendedThread extends Thread {
        public ConnectionCore.UpdateHandler uHandler;
        public Object tag;

        public ExtendedThread(Runnable r) {
            super(r);
        }
    }

    public static class UpdateHandler implements Runnable {
        public PrintWriter writer;
        public WS websocket;
        public Enums.SocketType type;
        public Thread parent;
        public Socket clientSocket;
        private int pingCount = 0;

        public void run() {
            while (true) {
                if (!this.clientSocket.isClosed() && this.parent.isAlive()) {
                    try {
                        SessionCore sc = SessionCore.getCurrentContext(false);
                        Thread.sleep(300L);
                        ++this.pingCount;
                        if (this.pingCount <= 10) {
                            if (sc == null) {
                                continue;
                            }

                            List payloads;
                            if (this.type == Enums.SocketType.WEBSOCKET) {
                                payloads = WSUpdateCore.processQueue();
                                if (payloads.size() > 0) {
                                    this.websocket.write(new WS.WebSocketMessage('+' + SuResponse.getGSON().toJson(payloads)));
                                    System.out.println("Payloads: " + payloads);
                                }
                                continue;
                            }

                            if (this.type != Enums.SocketType.RAW) {
                                continue;
                            }

                            payloads = WSUpdateCore.processQueue();
                            if (payloads.size() > 0) {
                                this.writer.write('+' + SuResponse.getGSON().toJson(payloads) + "\r\n");
                                this.writer.flush();
                            }
                            continue;
                        }

                        if (this.websocket == null) {
                            continue;
                        }

                        if (this.websocket.write(new WS.WebSocketMessage("sa"))) {
                            this.pingCount = 0;
                            continue;
                        }
                    } catch (Exception var5) {
                        System.out.println("Dynamic update error: " + var5.toString());
                        var5.printStackTrace(System.out);

                        try {
                            this.clientSocket.close();
                        } catch (Exception var4) {
                        }
                    }
                }

                try {
                    this.clientSocket.close();
                } catch (Exception var3) {
                }

                return;
            }
        }
    }



}
