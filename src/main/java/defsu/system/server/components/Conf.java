package defsu.system.server.components;

import java.io.Serializable;

public interface Conf extends Serializable {
    String getKey();

    Object getValue();

    void setValue(Object o);
}
