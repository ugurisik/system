package alba.system.server.components;

import alba.system.server.core.HibernateCore;
import alba.system.server.core.ObjectCore;
import alba.system.server.core.RecordCore;
import alba.system.server.core.SuRecord;
import alba.system.server.helpers.ForeignKeyPair;
import com.google.gson.annotations.Expose;
import com.google.gson.annotations.SerializedName;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Root;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;

public abstract class DynamicComboAdapter extends ComboAdapter {
    private static final long serialVersionUID = -1948006953349991005L;
    private static final String LOG_UNIT = "DynamicComboAdapter";
    protected Class<? extends SuRecord> _targetClass;
    @Expose
    @SerializedName("pairs")
    protected List<ForeignKeyPair> _pairs;
    protected HashMap<String, ForeignKeyPair> _pairsHash;
    private String _nameField;
    private String _orderField = null;
    private SuRecord.RecordProperties _targetProps;

    public DynamicComboAdapter(Class<? extends SuRecord> targetCls, String nameField) {
        this._nameField = nameField;
        this._targetClass = targetCls;
    }

    public DynamicComboAdapter(Class<? extends SuRecord> targetCls, String nameField, String orderField) {
        this._nameField = nameField;
        this._targetClass = targetCls;
        this._orderField = orderField;
    }

    public ForeignKeyPair generate(SuRecord r) {
        if (this._targetProps == null) {
            this._targetProps = r.getField();
        }

        try {
            byte[] key = (byte[]) ObjectCore.getFieldValue(r, this._targetProps.primaryKey);
            String value = ObjectCore.getFieldValue(r, this._nameField).toString();
            return new ForeignKeyPair(key, value);
        } catch (Exception var4) {
            return new ForeignKeyPair(new byte[16], "");
        }
    }

    public void resetPairs() {
        this._pairs = null;
        this._pairsHash = null;
    }

    public List<ForeignKeyPair> getPairs() {
        if (this._pairs == null) {
            this._pairs = new ArrayList<>();
            this._pairsHash = new HashMap<>();

            CriteriaBuilder builder = HibernateCore.getMainSessionFactory().getCriteriaBuilder();
            CriteriaQuery<SuRecord> criteriaQuery = (CriteriaQuery<SuRecord>) builder.createQuery(this._targetClass);
            Root<SuRecord> root = (Root<SuRecord>) criteriaQuery.from(this._targetClass);

            criteriaQuery.orderBy(
                    builder.asc(root.get(this._orderField != null ? this._orderField : this._nameField))
            );

            criteriaQuery.select(root).where(builder.equal(root.get("visible"), true));

            List<SuRecord> list = ObjectCore.list((Class<SuRecord>)this._targetClass, criteriaQuery, null).records;

            ForeignKeyPair pairNull = new ForeignKeyPair(RecordCore.i2B(0), "Lütfen Seçiniz");
            this._pairs.add(pairNull);

            for (SuRecord record : list) {
                ForeignKeyPair pair = this.generate(record);
                if (pair != null) {
                    this._pairs.add(pair);
                    this._pairsHash.put(ObjectCore.toString(pair.key), pair);
                }
            }
        }

        return this._pairs;
    }



    public HashMap<String, ForeignKeyPair> getPairsHash() {
        if (this._pairsHash == null) {
            this._pairsHash = new HashMap();
            if (this._pairs == null) {
                this.getPairs();
            }

            Iterator var2 = this.getPairs().iterator();

            while (var2.hasNext()) {
                ForeignKeyPair pair = (ForeignKeyPair) var2.next();
                this._pairsHash.put(ObjectCore.toString(pair.key), pair);
            }
        }

        return this._pairsHash;
    }

    public Class<? extends SuRecord> getTargetClass() {
        return this._targetClass;
    }
}
