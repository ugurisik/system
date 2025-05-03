package defsu.system.server.components;

import defsu.system.server.helpers.ForeignKeyPair;

import java.io.Serializable;
import java.util.HashMap;
import java.util.List;

public abstract class ComboAdapter implements Serializable {
    private static final long serialVersionUID = -8033964705478799343L;

    public abstract List<ForeignKeyPair> getPairs();

    public abstract HashMap<String, ForeignKeyPair> getPairsHash();
}
