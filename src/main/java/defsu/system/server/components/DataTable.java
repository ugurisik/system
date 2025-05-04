package defsu.system.server.components;

import defsu.system.server.core.*;
import defsu.system.server.helpers.ForeignKeyPair;
import defsu.system.server.helpers.SuField;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;
import java.util.stream.Collectors;

public class DataTable extends Container{
    public static int PAGESIZE = 50;
    private Class<? extends SuRecord> _targetClass;
    private List<SuRecord> changedRecords = new ArrayList<>();
    private SuRecord lastChangedRecord;
    private String lastChangedColumn;
    private String _service;
    private String _channel;

    public DataTable(){
        this.initialize();
    }

    public DataTable(String id){
        super(id);
        this.initialize();
    }

    public DataTable(Conf... configs){
        super(configs);
        this.initialize();
    }

    private void initialize(){
        this.addConfig(new Component.CPI("storePageSize", PAGESIZE));
    }

    public String getXType() {
        return "mgrid";
    }

    public DataTable paginate(){
        Component.CPL pagination = new Component.CPL("pagination", new Conf[]{new Component.CP("id", this.getId() + "-pagination"), new Component.CP("xtype", "pagingtoolbar"), new Component.CP("dock", "bottom"), new Component.CPB("displayInfo", true), new Component.CPT("beforePageText", "Gösterilen"), new Component.CPT("afterPageText", " Toplam: {0}"), new Component.CPT("displayMsg", "Toplam {2} kayıttan {0} - {1} arasındakiler gösteriliyor")});
        if (this.getConfigs().containsKey("dockedItems")) {
            ((Component.CPA) this.getConfigs().get("dockedItems")).add(pagination);
        } else {
            this.addConfig(new Component.CPA("dockedItems", new Conf[]{pagination}));
        }
        return this;
    }

    public DataTable id(String dName){
        this.addConfig(new Component.CP("id", dName));
        return this;
    }

    public DataTable title(String text){
        this.addConfig(new Component.CPT("title", text));
        return this;
    }

    public DataTable addService(Class<? extends MapService> cls) {
        this._service = cls.getName();
        this.addConfig(new Component.CP("service", cls.getName()));
        return this;
    }

    public DataTable addParameter(String key, String value) {
        if (this.getConfigs().containsKey("gParameters")) {
            ((Component.CPL) this.getConfigs().get("gParameters")).add(new Component.CP(key, value));
        } else {
            this.addConfig(new Component.CPL("gParameters", new Conf[]{new Component.CP(key, value)}));
        }
        return this;
    }

    public DataTable setAttribute(Class<? extends SuRecord> cls) {
        this._targetClass = cls;
        // Erken çıkış kontrolü - sınıf null ise hemen dön
        if (cls == null) {
            return this;
        }

        SuRecord r = ObjectCore.createInstance(cls);
        if (r == null) {
            return this;
        }

        SuField.SuFieldList fields = r.getField().fields;
        Conf columns = this.getConfigs().get("columns");

        // Columns null ise erken çıkış yap
        if (columns == null) {
            return this;
        }

        ArrayList<Conf> cols = (ArrayList) columns.getValue();
        if (cols == null || cols.isEmpty()) {
            return this;
        }

        // Enhanced for loop - Iterator'dan daha okunabilir ve genellikle daha hızlı
        for (Conf column : cols) {
            processColumn(column, fields, r);
        }

        return this;
    }

    private void processColumn(Conf column, SuField.SuFieldList fields, SuRecord r) {
        // Null kontrolü
        if (column == null || column.getValue() == null) {
            return;
        }

        StringDictionary colValue = (StringDictionary) column.getValue();
        Conf dataIndexConf = (Conf) colValue.get("dataIndex");
        if (dataIndexConf == null) {
            return;
        }

        String dataIndex = dataIndexConf.getValue().toString();
        SuField field = fields.get(dataIndex);

        if (field == null) {
            field = ObjectCore.findForeignField(r, dataIndex, r.getClass());
            if (field == null) {
                return;
            }
        }

        Col col = (Col) column;
        configureFilter(col, field);

        if (col.getConfigs().containsKey("editor")) {
            configureEditor(col, field);
        }
    }

    private void configureFilter(Col col, SuField field) {
        String filterType = getFilterType(field);

        // Sadece gerekli durumda ekstra konfigürasyon ekle
        if (field.fieldType == SuField.FT.DATE) {
            col.addConfig(new Conf[]{new Component.CP("dateFormat", ServerUtility.DATE_FORMAT)});
        } else if (field.fieldType == SuField.FT.DATETIME) {
            col.addConfig(new Conf[]{new Component.CP("dateFormat", ServerUtility.DATETIME_FORMAT)});
        } else if (isComboBoxField(field)) {
            addComboBoxFilterOptions(col, field);
        }

        // Tüm sütunlar için ortak konfigürasyon
        col.addConfig(new Conf[]{
                new Component.CPB("sortable", field.sortable),
                new Component.CPB("searchable", field.searchable),
                new Component.CP("align", field.align.value()),
                new Component.CP("filterType", filterType)
        });
    }

    private String getFilterType(SuField field) {
        if (field.fieldType == SuField.FT.BOOLEAN) {
            return "boolean";
        } else if (field.fieldType == SuField.FT.DATE || field.fieldType == SuField.FT.DATETIME) {
            return "date";
        } else if (isNumericField(field)) {
            return "numeric";
        } else if (field.fieldType == SuField.FT.BYTE_ARRAY && field.displayAs == SuField.DT.COMBOBOX) {
            if (field.comboAdapter instanceof DynamicComboAdapter) {
                return "string";
            } else {
                return "list";
            }
        }
        return "string"; // Varsayılan tip
    }

    private boolean isNumericField(SuField field) {
        return field.fieldType == SuField.FT.DOUBLE ||
                field.fieldType == SuField.FT.DOUBLE_2 ||
                field.fieldType == SuField.FT.INTEGER ||
                field.fieldType == SuField.FT.CURRENCY ||
                field.fieldType == SuField.FT.CURRENCY_2;
    }

    private boolean isComboBoxField(SuField field) {
        return field.fieldType == SuField.FT.BYTE_ARRAY &&
                field.displayAs == SuField.DT.COMBOBOX &&
                !(field.comboAdapter instanceof DynamicComboAdapter);
    }

    private void addComboBoxFilterOptions(Col col, SuField field) {
        Component.CPA listOptions = new Component.CPA("options", new Conf[0]);
        List<ForeignKeyPair> pairs = field.comboAdapter.getPairs();

        // Gereğinden fazla obje oluşturmayı önlemek için ön-tahsis
        if (pairs != null) {
            for (ForeignKeyPair pair : pairs) {
                if (pair != null) {
                    listOptions.add(new Component.CPL(Component.genId(), new Conf[]{
                            new Component.CP("id", RecordCore.b2H(pair.key)),
                            new Component.CP("name", pair.value)
                    }));
                }
            }
            col.addConfig(new Conf[]{listOptions});
        }
    }

    private void configureEditor(Col col, SuField field) {
        Component.CPL editorConfig = (Component.CPL) col.getConfigs().get("editor");
        if (editorConfig == null) {
            return;
        }

        String editorType = getEditorType(field);

        // Alan tipine göre özel konfigürasyonlar
        if (field.fieldType == SuField.FT.DATE) {
            editorConfig.add(new Component.CP("format", ServerUtility.DATE_FORMAT));
        } else if (field.fieldType == SuField.FT.DATETIME) {
            editorConfig.add(new Component.CP("format", ServerUtility.DATETIME_FORMAT));
        } else if (field.fieldType == SuField.FT.BYTE_ARRAY && field.searchField != null) {
            configureSearchBox(editorConfig, field);
        } else if (field.fieldType == SuField.FT.BYTE_ARRAY && field.displayAs == SuField.DT.COMBOBOX) {
            configureComboBox(editorConfig, field);
        } else if (isNumericField(field)) {
            configureNumericField(editorConfig, field);
        }

        if (field.translateable) {
            editorConfig.add(new Component.CPB("readOnly", true));
        }

        // Son olarak xtype'ı ekle
        editorConfig.add(new Component.CP("xtype", editorType));
    }

    private String getEditorType(SuField field) {
        if (field.fieldType == SuField.FT.BOOLEAN) {
            return "checkcolumn";
        } else if (field.fieldType == SuField.FT.DATE || field.fieldType == SuField.FT.DATETIME) {
            return "datefield";
        } else if (field.fieldType == SuField.FT.BYTE_ARRAY && field.searchField != null) {
            return "mcellsearchbox";
        } else if (field.fieldType == SuField.FT.BYTE_ARRAY && field.displayAs == SuField.DT.COMBOBOX) {
            return "combobox";
        } else if (isNumericField(field)) {
            return "mcellnumberfield";
        }
        return "textfield"; // Varsayılan tip
    }

    private void configureSearchBox(Component.CPL editorConfig, SuField field) {
        // String.join kullanımı
        String targetField = field.searchField != null ?
                String.join(";", field.searchField) : "";

        editorConfig.add(new Component.CPL("gParameters", new Conf[]{
                new Component.CP("searchArgs", field.searchArgs),
                new Component.CP("targetClass", field.databaseRecord.getName()),
                new Component.CP("targetField", targetField),
                new Component.CP("displayField", field.displayField)
        }));

        editorConfig.add(new Component.CP("displayField", field.displayField));

        if (field.service != null) {
            editorConfig.add(new Component.CP("service", field.service.getName()));
        }
    }

    private void configureComboBox(Component.CPL editorConfig, SuField field) {
        Component.CPA listOptions = new Component.CPA("store", new Conf[0]);
        List<ForeignKeyPair> pairs = field.comboAdapter.getPairs();

        if (pairs != null) {
            for (ForeignKeyPair pair : pairs) {
                if (pair != null) {
                    listOptions.add(new Component.CA(
                            RecordCore.b2H(RecordCore.guid()),
                            new String[]{RecordCore.b2H(pair.key), pair.value}
                    ));
                }
            }
            editorConfig.add(listOptions);
        }
    }

    private void configureNumericField(Component.CPL editorConfig, SuField field) {
        if (field.fieldType == SuField.FT.DOUBLE) {
            editorConfig.add(C.Text.Mask.decimal(field.isNegative));
            addSeparators(editorConfig);
        } else if (field.fieldType == SuField.FT.DOUBLE_2) {
            editorConfig.add(C.Text.Mask.decimal_2(field.isNegative));
            addSeparators(editorConfig);
        } else if (field.fieldType == SuField.FT.CURRENCY) {
            editorConfig.add(C.Text.Mask.currency());
            addSeparators(editorConfig);
            editorConfig.add(new Component.CP("currencyPrefix", ServerUtility.CURRENCY_PREFIX));
            editorConfig.add(new Component.CP("currencySuffix", ServerUtility.CURRENCY_SUFFIX));
        }
    }

    private void addSeparators(Component.CPL editorConfig) {
        editorConfig.add(new Component.CP("dSeparator", String.valueOf(ServerUtility.DECIMAL_SEPARATOR)));
        editorConfig.add(new Component.CP("tSeparator", String.valueOf(ServerUtility.THOUSAND_SEPARATOR)));
    }


    public DataTable addChannel(String channel) {
        this._channel = channel;
        this.addConfig(new Component.CP("channel", channel));
        return this;
    }

    public String getInputValue() {
        return this.getConfigs().containsKey("selected") ? (String) ((Conf) this.getConfigs().get("selected")).getValue() : "";
    }

    public String getIcon() {
        return "../icons/components/grid.png";
    }

    public DataTable setEditable(boolean editable) {
        if (!this.getConfigs().containsKey("isEditable")) {
            this.addConfig(new Component.CPB("isEditable", editable));
        }
        return this;
    }

    public Component addConfig(Conf... configs) {
        // Erken return için kontrol
        if (configs == null || configs.length == 0) {
            return this;
        }

        boolean isChange = false;
        if (configs.length == 1 && "changed".equals(configs[0].getKey())) {
            isChange = true;

            // Değer kontrolü
            if (configs[0].getValue() == null || this._targetClass == null) {
                return this;
            }

            String cfg = configs[0].getValue().toString();
            String[] cfgParts = cfg.split(";");

            // Geçerli formatta değilse işlem yapma
            if (cfgParts.length == 3) {
                // Boş ID kontrolü
                if (cfgParts[0] != null && !cfgParts[0].isEmpty()) {
                    byte[] recordId = RecordCore.h2B(cfgParts[0]);
                    SuRecord r = this.findChangedRecord(recordId);
                    boolean inChangeList = false;

                    if (r == null) {
                        r = ObjectCore.getByPK(this._targetClass, cfgParts[0]);
                    } else {
                        inChangeList = true;
                    }

                    // Record null değilse devam et
                    if (r != null) {
                        // Primary key değeri yoksa ayarla
                        if (ObjectCore.getPrimaryKeyValue(r) == null) {
                            ObjectCore.setFieldValue(r, r.getField().primaryKey, recordId);
                        }

                        // Alan adı kontrolü
                        if (cfgParts[1] != null) {
                            SuField field = r.getField().fields.get(cfgParts[1]);

                            // Alan mevcutsa değeri ayarla
                            if (field != null) {
                                ObjectCore.setFieldValue(r, cfgParts[1], ObjectCore.parse(cfgParts[2], field));

                                // Değişiklik listesine ekle
                                if (!inChangeList) {
                                    this.changedRecords.add(r);
                                }

                                // Son değişiklikleri kaydet
                                this.lastChangedColumn = cfgParts[1];
                                this.lastChangedRecord = r;
                            }
                        }
                    }
                }
            }
        }

        return (Component) (!isChange ? super.addConfig(configs) : this);
    }

    private SuRecord findChangedRecord(byte[] pk) {
        if (pk == null || this.changedRecords == null || this.changedRecords.isEmpty()) {
            return null;
        }
        for (SuRecord r : this.changedRecords) {
            if (r != null) {
                byte[] recordPk = (byte[]) ObjectCore.getFieldValue(r, r.getField().primaryKey);
                if (recordPk != null && Arrays.equals(pk, recordPk)) {
                    return r;
                }
            }
        }
        return null;
    }

    public void commitChanges() {
        // Erken çıkış - boş liste kontrolü
        if (this.changedRecords == null || this.changedRecords.isEmpty()) {
            return;
        }

        // Enhanced for-loop ile daha temiz döngü
        for (SuRecord r : this.changedRecords) {
            if (r != null) {
                r.save();
            }
        }

        this.changedRecords.clear();
    }

    public void commitChangesFast() {
        // Boş liste kontrolü
        if (this.changedRecords == null || this.changedRecords.isEmpty()) {
            return;
        }
        // TODO
        // ObjectCore.saveAll(this.changedRecords);
        this.changedRecords.clear();
    }

    public List<SuRecord> getChanges() {
        return this.changedRecords != null ? this.changedRecords : new ArrayList<>();
    }

    public SuRecord getLastChange() {
        return this.lastChangedRecord;
    }

    public String getLastChangedColumn() {
        return this.lastChangedColumn;
    }

    public static class Events {
        public static final String AFTER_SELECT = "afterselect";
        public static final String AFTER_ROW_EDIT = "afterrowedit";
        public static final String AFTER_DBL_CLICK = "itemdblclick";
        public static final String AFTER_LOAD = "afterload";
    }

    public static class SelectorGrid extends DataTable {
        private static final long serialVersionUID = 3865709567010742697L;

        public SelectorGrid(Conf... configs) {
            super(configs);
        }
    }
}
