package defsu.system.server.helpers;

import defsu.system.server.components.ComboAdapter;
import defsu.system.server.core.StringDictionary;
import defsu.system.server.core.SuRecord;
import com.google.gson.annotations.Expose;
import com.google.gson.annotations.SerializedName;
import lombok.Getter;

import java.io.Serial;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class SuField implements Serializable {
    private static final long serialVersionUID = 7765746604867230741L;
    @Expose
    @SerializedName("name")
    public String name;
    @Expose
    @SerializedName("title")
    public String title;
    public Object defaultValue;
    public boolean searchable;
    public boolean sortable;
    public boolean translateable;
    public boolean classified;
    public boolean isNegative;
    @Expose
    @SerializedName("type")
    public SuField.FT fieldType;

    public ComboAdapter comboAdapter;
    public Class<?> service;
    public String searchArgs;
    public Class<?> databaseRecord;
    public String[] searchField;
    public String displayField;
    public SuField.FieldVisualizer visualize;
    public SuField.FieldAlign align;
    public RecordComparator comparator;
    @Expose
    @SerializedName("displayAs")
    public SuField.DT displayAs;
    public String fetchFrom;
    public SuField.FieldRelation relation;
    public StringDictionary<List<SuField>> path;
    @Getter
    private StringDictionary<SuField.LanguageColumn> languageColumns;

    public SuField() {
        this.align = SuField.FieldAlign.LEFT;
        this.path = new StringDictionary();
        this.name = "";
        this.title = "";
        this.defaultValue = "";
        this.fieldType = SuField.FT.STRING;
        this.displayAs = SuField.DT.TEXTBOX;
        this.searchable = false;
        this.sortable = false;
        this.translateable = false;
       // this.service = ServiceSearch.class;
        this.searchField = null;
        this.searchArgs = "";
        this.isNegative = false;
    }

    public void addLanguageColumn(SuField.LanguageColumn lColumn) {
        if (this.languageColumns == null) {
            this.languageColumns = new StringDictionary();
        }

        this.languageColumns.put((String) lColumn.languageCode, lColumn);
    }

    public static enum DT {
        TEXTBOX(1),
        TEXTAREA(2),
        CHECKBOX(3),
        DATEPICKER(4),
        DATETIMEPICKER(5),
        COMBOBOX(6),
        COLORPICKER(7),
        SEARCHBOX(8);

        private final int _value;

        private DT(int value) {
            this._value = value;
        }

        public int value() {
            return this._value;
        }
    }

    public static enum FT {
        BYTE_ARRAY("[byte"),
        INTEGER("Integer"),
        STRING("String"),
        DATETIME("Date"),
        DATE("Date"),
        BOOLEAN("Boolean"),
        DOUBLE("Double"),
        DOUBLE_2("Double"),
        DOUBLE_3("Double"),
        CURRENCY("Double"),
        ONLY_DATE("Date"),
        ONLY_DATE_2("Date"),
        CURRENCY_2("Double");

        private final String _value;

        private FT(String value) {
            this._value = value;
        }

        public String value() {
            return this._value;
        }
    }

    public static enum FieldAlign {
        LEFT("left"),
        RIGHT("right"),
        CENTER("center"),
        JUSTIFY("justify");

        private final String _value;

        private FieldAlign(String value) {
            this._value = value;
        }

        public String value() {
            return this._value;
        }
    }

    public static enum FieldRelationType {
        ONE_TO_ONE(1),
        ONE_TO_MANY(2),
        MANY_TO_MANY(3),
        MANY_TO_ONE(4);

        private final int _value;

        private FieldRelationType(int value) {
            this._value = value;
        }

        public int value() {
            return this._value;
        }
    }

    public static class SuFieldList implements Serializable {
        private final ArrayList<SuField> _fields;
        private final ArrayList<String> _fieldNames;

        public SuFieldList() {
            this._fields = new ArrayList<>();
            this._fieldNames = new ArrayList<>();
        }

        public SuFieldList(int count) {
            this._fields = new ArrayList<>(count);
            this._fieldNames = new ArrayList<>(count);
        }

        public int getCount() {
            return this._fields.size();
        }

        public SuField get(int index) {
            return (SuField) this._fields.get(index);
        }

        public SuField get(String name) {
            for (int k = 0; k < this._fieldNames.size(); ++k) {
                if (((String) this._fieldNames.get(k)).equals(name)) {
                    return (SuField) this._fields.get(k);
                }
            }

            return null;
        }

        public void set(int index, SuField field) {
            this._fields.set(index, field);
            this._fieldNames.set(index, field.name);
        }

        public void add(SuField field) {
            this._fields.add(field);
            this._fieldNames.add(field.name);
        }

        public int getSize() {
            return this._fields.size();
        }
    }

    public static class FieldRelation implements Serializable {
        @Serial
        private static final long serialVersionUID = 1266670556716730608L;
        public Class<?> targetClass;
        public SuField.FieldRelationType type;
        public String[] displayFields;
        public String propagationField;
        public int propagationCount = 3;

        public FieldRelation(Class<?> cls, SuField.FieldRelationType type) {
            this.targetClass = cls;
            this.type = type;
        }

        public FieldRelation(Class<?> cls) {
            this.targetClass = cls;
            this.type = SuField.FieldRelationType.MANY_TO_ONE;
        }
    }

    public static class FieldVisualizer {
        public String morph(SuRecord r) {
            return "visualizer not set";
        }
    }

    public static class LanguageColumn {
        public String languageCode;
        public String columnName;

        public LanguageColumn(String languageCode, String columnName) {
            this.languageCode = languageCode;
            this.columnName = columnName;
        }
    }
}
