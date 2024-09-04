package alba.system.server.helpers;

import alba.system.server.core.SuRecord;

import java.io.Serial;
import java.io.Serializable;
import java.util.Comparator;

public class RecordComparator implements Comparator<SuRecord>, Serializable {
    @Serial
    private static final long serialVersionUID = -5023815669371096473L;
    public boolean asc = true;

    @Override
    public int compare(SuRecord o1, SuRecord o2) {
        return 0;
    }
}
