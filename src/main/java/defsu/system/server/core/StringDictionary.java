package defsu.system.server.core;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;

public class StringDictionary<V> extends HashMap<String, V> {
    private static final long serialVersionUID = 268825543292203277L;
    private List<String> keyList = new ArrayList();

    public StringDictionary<V> copy() {
        StringDictionary<V> output = new StringDictionary();
        Iterator var3 = this.keySet().iterator();

        while (var3.hasNext()) {
            String key = (String) var3.next();
            output.put(key, this.get(key));
        }

        return output;
    }

    public List<V> entryList() {
        List<V> output = new ArrayList();
        Iterator var3 = this.entrySet().iterator();

        while (var3.hasNext()) {
            Entry<String, V> entry = (Entry) var3.next();
            output.add(entry.getValue());
        }

        return output;
    }

    public List<String> keyList() {
        return this.keyList;
    }

    public V get(String key, V defaultValue) {
        V value = this.get(key);
        if (value == null) {
            value = defaultValue;
        }

        return value;
    }

    public V put(String key, V value) {
        this.keyList.add(key);
        return super.put(key, value);
    }

    public void clear() {
        this.keyList.clear();
        super.clear();
    }

    public V remove(Object key) {
        this.keyList.remove(key);
        return super.remove(key);
    }
}
