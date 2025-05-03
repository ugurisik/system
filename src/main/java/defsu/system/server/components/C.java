package defsu.system.server.components;

import defsu.system.server.helpers.StyleSheet;
import defsu.system.server.core.ServerUtility;

public class C {
    public static Component.CP id(String id) {
        return new Component.CP("id", id);
    }
    public static Component.CP cls(String cls) {
        return new Component.CP("cls", cls);
    }

    public static Component.CP actualText(String text) {
        return new Component.CP("actualText", text);
    }

    public static Component.CPI top(int top) {
        return new Component.CPI("top", top);
    }

    public static Component.CPI right(int right) {
        return new Component.CPI("right", right);
    }

    public static Component.CPI width(int width) {
        return new Component.CPI("width", width);
    }

    public static Component.CPI height(int height) {
        return new Component.CPI("height", height);
    }

    public static Component.CPI x(int x) {
        return new Component.CPI("x", x);
    }

    public static Component.CPI y(int y) {
        return new Component.CPI("y", y);
    }

    public static Component.CPB autoScroll(boolean scroll) {
        return new Component.CPB("autoScroll", scroll);
    }

    public static Component.CPB autoScroll() {
        return autoScroll(true);
    }

    public static Component.CPI activeTab(int activeTab) {
        return new Component.CPI("activeTab", activeTab);
    }

    public static Component.CPT title(String titleKey) {
        return new Component.CPT("title", titleKey);
    }

    public static Component.CPT label(String labelKey) {
        return new Component.CPT("fieldLabel", labelKey);
    }

    public static Component.CPB booleanData(String key, boolean val){
        return new Component.CPB(key, val);
    }

    public static Component.CPT stringData(String key, String val){
        return new Component.CPT(key, val);
    }

    public static Component.CPI integerData(String key, int val){
        return new Component.CPI(key, val);
    }

    public static Component.CPI bodyPadding(int padding) {
        return new Component.CPI("bodyPadding", padding);
    }

    public static Component.CP dataName(String argumentName) {
        return new Component.CP("argumentName", argumentName);
    }

    public static Component.CP anchor(String anchor) {
        return new Component.CP("anchor", anchor);
    }

    public static Component.CPB enableKeyEvents(boolean enable) {
        return new Component.CPB("enableKeyEvents", enable);
    }

    public static Component.CP format(String format) {
        return new Component.CP("format", format);
    }

    public static Component.CPB hidden(boolean hidden) {
        return new Component.CPB("hidden", hidden);
    }

    public static Component.CPB hidden() {
        return hidden(true);
    }

    public static Component.CPB enableKeyEvents() {
        return enableKeyEvents(true);
    }

    public static Component.CPI border(int border) {
        return new Component.CPI("border", border);
    }

    public static Component.CPI labelWidth(int labelWidth) {
        return new Component.CPI("labelWidth", labelWidth);
    }

    public static Tab tab(Conf... items) {
        return new Tab(items);
    }

    public static Panel panel(Conf... items) {
        return new Panel(items);
    }

    // TODO:: Change to Translatable
    public static Conf text(String text, boolean text_is_translateable) {
        return (Conf)(text_is_translateable ? new Component.CPT("text", text) : new Component.CP("text", text));
    }
    public static Conf text(String text) {
        return new Component.CP("text", text);
    }

    public static Conf src(String src) {
        return new Component.CPT("src", src);
    }

    public static Component.CP iconFolder(String iconFolder) {
        return new Component.CP("iconFolder", iconFolder);
    }

    public static Component.CP padding(String padding) {
        return new Component.CP("padding", padding);
    }

    public static Component.CPI padding(int padding) {
        return new Component.CPI("padding", padding);
    }

    public static Component.CP iconFile(String iconFile) {
        return new Component.CP("iconFile", iconFile);
    }

    public static Component.CPI flex(int flex) {
        return new Component.CPI("flex", flex);
    }

    public static Component.CPB closeable(boolean closeable) {
        return new Component.CPB("closeable", closeable);
    }

    public static Component.CPB maximizable(boolean maximizable) {
        return new Component.CPB("maximizable", maximizable);
    }

    public static Component.CPB minimizable(boolean minimizable) {
        return new Component.CPB("minimizable", minimizable);
    }

    public static Component.CPB split(boolean split) {
        return new Component.CPB("split", split);
    }

    public static Component.CPB split() {
        return split(true);
    }

    public static Component.CPB collapsible(boolean collapsible) {
        return new Component.CPB("collapsible", collapsible);
    }

    public static Component.CPB collapsible() {
        return collapsible(true);
    }

    public static Component.CPB collapsed(boolean collapsed) {
        return new Component.CPB("collapsed", collapsed);
    }

    public static Component.CPB collapsed() {
        return collapsed(true);
    }

    public static Component.CPA items(Conf... items) {
        return new Component.CPA("items", items);
    }

    public static Component.CPA dockedItems(Conf... items) {
        return new Component.CPA("dockedItems", items);
    }

    public static Component.CPB disabled(boolean disabled) {
        return new Component.CPB("disabled", disabled);
    }

    public static Component.CPI minValue(int minValue) {
        return new Component.CPI("minValue", minValue);
    }

    public static Component.CPI maxValue(int maxValue) {
        return new Component.CPI("maxValue", maxValue);
    }

    public static Component.CPI increment(int increment) {
        return new Component.CPI("increment", increment);
    }

    public static Component.CPB disabled() {
        return disabled(true);
    }

    public static class Button {
        public static Component.CPT confirmMessage(String message) {
            return new Component.CPT("confirmMessage", message);
        }

        public static Component.CPB lockUntilResponse(boolean lock) {
            return new Component.CPB("lockUntilResponse", lock);
        }

        public static Component.CPB lockUntilResponse() {
            return lockUntilResponse(true);
        }

        public static Component.CPT lockMessage(String msg) {
            return new Component.CPT("lockMessage", msg);
        }
    }

    public static class Chart {
        public static Component.CPA axes(Conf... axes) {
            return new Component.CPA("axes", axes);
        }

        public static Component.CPB animate(boolean animate) {
            return new Component.CPB("animate", animate);
        }

        public static Component.CPB animate() {
            return animate(true);
        }

        public static Component.CPB shadow(boolean shadow) {
            return new Component.CPB("shadow", shadow);
        }

        public static Component.CPB shadow() {
            return shadow(true);
        }

        public static Component.CPL axe(String name, Conf... configs) {
            return new Component.CPL(name, configs);
        }
    }
    public static class Dock {
        public static Component.CP bottom() {
            return new Component.CP("dock", "bottom");
        }

        public static Component.CP top() {
            return new Component.CP("dock", "top");
        }
    }

    public static class Drawing {
        public static Component.CPA drawingItems(Conf... items) {
            return new Component.CPA("drawingItems", items);
        }

        public static Component.CPL drawing(Conf... configs) {
            return new Component.CPL("drawing", configs);
        }
    }

    public static class File {
        public static Component.CP acceptMime(String mime) {
            return new Component.CP("acceptMime", mime);
        }

        public static Component.CP acceptImage() {
            return acceptMime("image/*");
        }
    }

    public static class Grid {
        public static Component.CPA columns(Conf... columns) {
            return new Component.CPA("columns", columns);
        }

        public static Component.CPA columns(String id, Conf... columns) {
            boolean hasId = false;
            int counter = 0;
            Conf[] cols = new Conf[columns.length + 1];

            for (Conf c : columns) {
                Col col = (Col) c;
                col.setId(id + "-" + counter + "col");
                cols[counter] = col;
                ++counter;
            }
            // TODO:: Add default columns like USER, CREATED_DATE, UPDATED_DATE, VISIBLE, etc.
            return new Component.CPA("columns", columns);
        }

        public static Component.CPT toolTipHint(String hint) {
            return new Component.CPT("toolTipHint", hint);
        }

        public static Component.CPB multiSelect(boolean multiSelect) {
            return new Component.CPB("multiSelect", multiSelect);
        }

        public static Component.CPB multiSelect() {
            return multiSelect(true);
        }

        public static Component.CPB maskOnLoad(boolean maskOnLoad) {
            return new Component.CPB("maskOnLoad", maskOnLoad);
        }

        public static Component.CPB maskOnLoad() {
            return maskOnLoad(true);
        }

        public static Component.CP selectColumnName(String column) {
            return new Component.CP("selectColumnName", column);
        }

        public static Component.CPA legendItems(Conf... items) {
            return new Component.CPA("legendItems", items);
        }

        public static Component.CPL legendColor(int r, int g, int b, String title) {
            return new Component.CPL("color" + r + g + b, new Conf[]{new Component.CPT("title", title), new Component.CP("color", StyleSheet.getColor(r, g, b))});
        }

        public static Component.CPB lockUntilResponse(boolean lock) {
            return new Component.CPB("lockUntilResponse", lock);
        }

        public static Component.CPB lockUntilResponse() {
            return lockUntilResponse(true);
        }

        public static Component.CPT lockMessage(String message) {
            return new Component.CPT("lockMessage", message);
        }

        public static class Column {
            public static Component.CP dataIndex(String dataIndex) {
                return new Component.CP("dataIndex", dataIndex);
            }
            // TODO:: Add default columns like USER, CREATED_DATE, UPDATED_DATE, VISIBLE, etc.
        }
    }

    public static class Layout {
        public static Component.CPL fit() {
            return new Component.CPL("layout", new Conf[]{new Component.CP("type", "fit")});
        }

        public static Component.CPL border() {
            return new Component.CPL("layout", new Conf[]{new Component.CP("type", "border")});
        }

        public static Component.CPL accordion() {
            return new Component.CPL("layout", new Conf[]{new Component.CP("type", "accordion")});
        }

        public static Component.CPL absolute() {
            return new Component.CPL("layout", new Conf[]{new Component.CP("type", "absolute")});
        }

        public static Component.CPL anchor() {
            return new Component.CPL("layout", new Conf[]{new Component.CP("type", "anchor")});
        }

        public static Component.CPL hbox() {
            return new Component.CPL("layout", new Conf[]{new Component.CP("type", "hbox")});
        }
        public static Component.CPL vbox() {
            return new Component.CPL("layout", new Conf[]{new Component.CP("type", "vbox")});
        }

        public static Component.CPL form() {
            return new Component.CPL("layout", new Conf[]{new Component.CP("type", "form")});
        }

        public static Component.CPL column() {
            return new Component.CPL("layout", new Conf[]{new Component.CP("type", "column")});
        }

        public static Component.CPL table() {
            return new Component.CPL("layout", new Conf[]{new Component.CP("type", "table")});
        }

        public static Component.CPL card() {
            return new Component.CPL("layout", new Conf[]{new Component.CP("type", "card")});
        }
        public static Component.CPL tabpanel() {
            return new Component.CPL("layout", new Conf[]{new Component.CP("type", "tabpanel")});
        }
    }

    public static class Map {
        public static Component.CPA mapItems(Conf... items) {
            return new Component.CPA("mapItems", items);
        }
        public static class Line {
            public static Component.CPB editable(boolean editable) {
                return new Component.CPB("editable", editable);
            }

            public static Component.CPB editable() {
                return editable(true);
            }

            public static Component.CPA path(Conf... path) {
                return new Component.CPA("path", path);
            }

            public static Component.CPI strokeWeight(int weight) {
                return new Component.CPI("strokeWeight", weight);
            }

            public static Component.CP strokeColor(int rgb) {
                String color = String.format("#%06X", (rgb & 0xFFFFFF));
                return new Component.CP("strokeColor", color);
            }

            public static Component.CPF strokeOpacity(int opacity) {
                return new Component.CPF("strokeOpacity", (double)((float)opacity / 100.0F));
            }
        }

        public static class Marker {
            public static Component.CPB draggable(boolean draggable) {
                return new Component.CPB("draggable", draggable);
            }

            public static Component.CPB draggable() {
                return draggable(true);
            }

            public static Component.CP icon(String icon) {
                return new Component.CP("icon", icon);
            }
        }

        public static class Poly {
            public static Component.CPB editable(boolean editable) {
                return new Component.CPB("editable", editable);
            }

            public static Component.CPB editable() {
                return editable(true);
            }

            public static Component.CPA paths(Conf... paths) {
                return new Component.CPA("paths", paths);
            }

            public static Component.CPI strokeWeight(int weight) {
                return new Component.CPI("strokeWeight", weight);
            }

            public static Component.CP strokeColor(int rgb) {
                String color = String.format("#%06X", (rgb & 0xFFFFFF));
                return new Component.CP("strokeColor", color);
            }

            public static Component.CPF strokeOpacity(int opacity) {
                return new Component.CPF("strokeOpacity", (double)((float)opacity / 100.0F));
            }

            public static Component.CPF fillOpacity(int opacity) {
                return new Component.CPF("fillOpacity", (double)((float)opacity / 100.0F));
            }

            public static Component.CP fillColor(int rgb) {
                String color = String.format("#%06X", (rgb & 0xFFFFFF));
                return new Component.CP("fillColor", color);
            }
        }
    }

    public static class Region {
        public static Component.CP center() {
            return new Component.CP("region", "center");
        }

        public static Component.CP west() {
            return new Component.CP("region", "west");
        }

        public static Component.CP east() {
            return new Component.CP("region", "east");
        }

        public static Component.CP north() {
            return new Component.CP("region", "north");
        }

        public static Component.CP south() {
            return new Component.CP("region", "south");
        }
    }

    public static class Text {
        public static Component.CP password() {
            return new Component.CP("inputType", "password");
        }

        public static Component.CPI maxLength(int maxLength) {
            return new Component.CPI("maxLength", maxLength);
        }

        public static Component.CPI minLength(int minLength) {
            return new Component.CPI("minLength", minLength);
        }

        public static Component.CPT maxLengthText(String text, String maxLength) {
            // TODO:: Change to new Function
            String formattedText = text.replace("%s", maxLength);
            return new Component.CPT("maxLengthText", formattedText);
        }

        public static Component.CPT minLengthText(String text, String minLength) {
            // TODO:: Change to new Function
            String formattedText = String.format(text, minLength);
            return new Component.CPT("minLengthText", formattedText);
        }

        public static class Mask {
            public static Component.CPL currency() {
                String separator;
                if (ServerUtility.DECIMAL_SEPARATOR == '.') {
                    separator = "\\" + ServerUtility.DECIMAL_SEPARATOR;
                } else {
                    separator = String.valueOf(ServerUtility.DECIMAL_SEPARATOR);
                }

                return new Component.CPL("currencyFormat", new Conf[]{new Component.CP("regexp", "^" + ServerUtility.CURRENCY_PREFIX + "[\\d" + "" + "]+(" + separator + "\\d{0,4})?$"), new Component.CP("dSeparator", String.valueOf(ServerUtility.DECIMAL_SEPARATOR)), new Component.CP("tSeparator", String.valueOf(ServerUtility.THOUSAND_SEPARATOR)), new Component.CP("currencyPrefix", ""), new Component.CP("currencySuffix", "")});
            }

            public static Component.CP decimal(boolean allowNegative) {
                String separator;
                if (ServerUtility.DECIMAL_SEPARATOR == '.') {
                    separator = "\\" + ServerUtility.DECIMAL_SEPARATOR;
                } else {
                    separator = String.valueOf(ServerUtility.DECIMAL_SEPARATOR);
                }

                return new Component.CP("maskRe", "^[" + (allowNegative ? "\\-" : "") + "\\d" + ServerUtility.THOUSAND_SEPARATOR + "]+(" + separator + "\\d{0,3})?$");
            }

            public static Component.CP decimal_2(boolean allowNegative) {
                String separator;
                if (ServerUtility.DECIMAL_SEPARATOR == '.') {
                    separator = "\\" + ServerUtility.DECIMAL_SEPARATOR;
                } else {
                    separator = String.valueOf(ServerUtility.DECIMAL_SEPARATOR);
                }

                return new Component.CP("maskRe", "^[" + (allowNegative ? "\\-" : "") + "\\d" + ServerUtility.THOUSAND_SEPARATOR + "]+(" + separator + "\\d{0,2})?$");
            }

            public static Component.CP decimal() {
                return decimal(false);
            }

            public static Component.CP highPrecisionDecimal(boolean allowNegative) {
                String separator;
                if (ServerUtility.DECIMAL_SEPARATOR == '.') {
                    separator = "\\" + ServerUtility.DECIMAL_SEPARATOR;
                } else {
                    separator = String.valueOf(ServerUtility.DECIMAL_SEPARATOR);
                }

                return new Component.CP("maskRe", "^[" + (allowNegative ? "\\-" : "") + "\\d" + ServerUtility.THOUSAND_SEPARATOR + "]+(" + separator + "\\d{0,9})?$");
            }

            public static Component.CP highPrecisionDecimal() {
                return highPrecisionDecimal(false);
            }

            public static Component.CP highPrecisionDecimal(int decimalPrecision, boolean allowNegative) {
                String separator;
                if (ServerUtility.DECIMAL_SEPARATOR == '.') {
                    separator = "\\" + ServerUtility.DECIMAL_SEPARATOR;
                } else {
                    separator = String.valueOf(ServerUtility.DECIMAL_SEPARATOR);
                }

                return new Component.CP("maskRe", "^[" + (allowNegative ? "\\-" : "") + "\\d" + ServerUtility.THOUSAND_SEPARATOR + "]+(" + separator + "\\d{0," + decimalPrecision + "})?$");
            }

            public static Component.CP highPrecisionDecimal(int decimalPrecision) {
                return highPrecisionDecimal(decimalPrecision, false);
            }

            public static Component.CP number(boolean allowNegative) {
                return new Component.CP("maskRe", "^[0-9" + (allowNegative ? "\\-" : "") + "]+$");
            }

            public static Component.CP number() {
                return number(false);
            }
        }
    }

    public static class Tree {
        public static Component.CPB rootVisible(boolean rootVisible) {
            return new Component.CPB("rootVisible", rootVisible);
        }
    }
}
