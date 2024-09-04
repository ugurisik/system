package alba.system.server.core;

import lombok.Getter;
import lombok.Setter;

import java.io.DataInputStream;
import java.io.DataOutputStream;

@Getter
@Setter
public class WS {
    private static final String LOG_UNIT = "WebSocket";
    private DataInputStream _dataInputStream;
    private DataOutputStream _dataOutputStream;
    public WS(DataInputStream dataInputStream, DataOutputStream dataOutputStream) {
        set_dataInputStream(dataInputStream);
        set_dataOutputStream(dataOutputStream);
    }
}
