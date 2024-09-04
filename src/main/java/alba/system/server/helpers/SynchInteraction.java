package alba.system.server.helpers;

import alba.system.server.core.ConnectionCore;
import alba.system.server.core.SessionCore;
import alba.system.server.core.SuResponse;
import alba.system.server.core.WS;

public abstract class SynchInteraction {
    protected abstract SuResponse start();
    protected abstract SuResponse process(String p);
    protected abstract Object end();
    public Object interact() {
        SessionCore sc = SessionCore.getCurrentContext();
        ConnectionCore.ClientHandler clientHandler = sc.getClientHandler();
        if (clientHandler != null) {
            WS webSocket = clientHandler.get_webSocket();
            if (webSocket != null) {
                SuResponse initialMessage = this.start();
                WS.WebSocketMessage msg = new WS.WebSocketMessage('+' + SuResponse.getGSON().toJson(initialMessage));
                webSocket.write(msg);
                String response = "sa.";
                int count = 0;

                while (response.endsWith("sa.")) {
                    response = this.read(webSocket);
                    ++count;
                    if (count > 100) {
                        break;
                    }
                }

                for (SuResponse processResult = this.process(response); processResult != null; processResult = this.process(response)) {
                    msg = new WS.WebSocketMessage(SuResponse.getGSON().toJson(processResult));
                    webSocket.write(msg);
                    response = this.read(webSocket);
                }

                return this.end();
            }
        }

        return null;
    }

    private String read(WS webSocket) {
        WS.WebSocketMessage clientResponse = webSocket.read();
        return clientResponse.getBody();
    }

    public abstract static class SynchronousBox {
        public abstract String getType();
    }
}
