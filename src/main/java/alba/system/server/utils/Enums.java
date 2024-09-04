package alba.system.server.utils;

public class Enums {
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

    public static enum ChannelProtocol {
        PERSISTENCE(1),
        INFORMATION(2),
        ADMINISTRATION(3);

        final int _value;

        private ChannelProtocol(int value) {
            this._value = value;
        }

        public int value() {
            return this._value;
        }
    }

    public static enum SocketType {
        NOTSELECTED(0),
        RAW(1),
        WEBSOCKET(2),
        HTTP(3);

        private final int _value;

        private SocketType(int value) {
            this._value = value;
        }

        public int value() {
            return this._value;
        }
    }
    public static enum PayloadOriginType {
        SYSTEM(1),
        USER(2),
        ADMINISTRATOR(3);

        final int _value;

        private PayloadOriginType(int value) {
            this._value = value;
        }

        public int value() {
            return this._value;
        }
    }

    public static enum InteractionButtonType {
        BRIGHT(1),
        PALE(2);

        private final int _value;

        private InteractionButtonType(int value) {
            this._value = value;
        }

        public int value() {
            return this._value;
        }
    }

    public static enum InteractionMessageType {
        NEUTRAL(0),
        ERROR(1),
        WARNING(2),
        INFO(3),
        SUCCESS(4);

        private final int _value;

        private InteractionMessageType(int value) {
            this._value = value;
        }

        public int value() {
            return this._value;
        }
    }

    public static enum ArgumentType {
        BYTE_ARRAY("[byte"),
        INTEGER("Integer"),
        STRING("String"),
        DATE_TIME("Date"),
        BOOLEAN("Boolean");

        private final String _value;

        private ArgumentType(String value) {
            this._value = value;
        }

        public String value() {
            return this._value;
        }
    }

    public static enum DisplayType {
        TEXTBOX(1),
        TEXTAREA(2),
        CHECKBOX(3),
        DATEPICKER(4),
        DATETIMEPICKER(5),
        COMBOBOX(6);

        private final int _value;

        private DisplayType(int value) {
            this._value = value;
        }

        public int value() {
            return this._value;
        }
    }
    public static enum ManipulationType {
        NONE(0),
        INSERT(1),
        UPDATE(2),
        DELETE(3);

        private final int _value;

        private ManipulationType(int value) {
            this._value = value;
        }

        public int value() {
            return this._value;
        }
    }

    public static enum StatusType {
        NONE(0),
        SUCCESS(1),
        FAIL(2),
        DUBLICATE(3);

        private final int _value;

        private StatusType(int value) {
            this._value = value;
        }

        public int value() {
            return this._value;
        }
    }
}
