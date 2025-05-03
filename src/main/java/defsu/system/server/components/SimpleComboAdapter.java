package defsu.system.server.components;

import defsu.system.server.core.ObjectCore;
import defsu.system.server.core.RecordCore;
import defsu.system.server.helpers.ForeignKeyPair;
import com.google.gson.annotations.Expose;
import com.google.gson.annotations.SerializedName;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;

public class SimpleComboAdapter extends ComboAdapter {
    private static final long serialVersionUID = -2692543564779615801L;

    @Expose
    @SerializedName("pairs")
    private List<ForeignKeyPair> _pairs = new ArrayList<>();

    protected HashMap<String, ForeignKeyPair> _pairsHash = new HashMap<>();

    public SimpleComboAdapter(String pairs) {
        String[] rawPairs = pairs.split("~");

        for (String rawPair : rawPairs) {
            String[] values = rawPair.split("\\|");

            try {
                ForeignKeyPair pair = createForeignKeyPair(values);
                if (pair != null) {
                    this._pairs.add(pair);
                    this._pairsHash.put(ObjectCore.toString(pair.key), pair);
                }
            } catch (NumberFormatException e) {
                System.err.println("Hatalı sayı formatı: " + Arrays.toString(values));
            }
        }
    }

    private ForeignKeyPair createForeignKeyPair(String[] values) {
        if (values.length < 2) {
            System.err.println("Eksik değerler: " + Arrays.toString(values));
            return null;
        }

        int key = Integer.parseInt(values[0]);
        String displayName = values[1];
        byte[] parentKey = (values.length == 3) ? RecordCore.i2B(Integer.parseInt(values[2])) : null;

        return (parentKey != null)
                ? new ForeignKeyPair(RecordCore.i2B(key), displayName, parentKey)
                : new ForeignKeyPair(RecordCore.i2B(key), displayName);
    }

    public List<ForeignKeyPair> getPairs() {
        return this._pairs;
    }

    public HashMap<String, ForeignKeyPair> getPairsHash() {
        return this._pairsHash;
    }
}
