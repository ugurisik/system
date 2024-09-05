package alba.system.server.helpers;

import alba.system.server.components.Conf;
import lombok.Getter;
import lombok.Setter;

import java.awt.*;
import java.io.Serial;
import java.io.Serializable;

@Getter
@Setter
public class StyleSheet implements Conf, Serializable {
    @Serial
    private static final long serialVersionUID = -26581695728916220L;
    private String key_;
    private String value_ = "";

    public StyleSheet(String name) {
        setKey_(name);
    }

    public static String getColor(int r, int g, int b) {
        Color c = new Color(r, g, b);
        return String.format("#%06x", c.getRGB() & 0xFFFFFF);
    }

    @Override
    public String getKey() {
       return getKey_();
    }

    @Override
    public Object getValue() {
        return getValue_();
    }

    @Override
    public void setValue(Object o) {
        setValue_(o.toString());
    }

    public StyleSheet setBackgroundColor(int r, int g, int b) {
        String color = String.format("#%06x", (new Color(r, g, b)).getRGB() & 0xFFFFFF);
        appendNamedStyle("background-color", color);
        return this;
    }
    public StyleSheet setCSS(String key, String value) {
        appendNamedStyle(key, value);
        return this;
    }
    public StyleSheet setFontColor(int r, int g, int b) {
        String color = String.format("#%06x", (new Color(r, g, b)).getRGB() & 0xFFFFFF);
        appendNamedStyle("color", color);
        return this;
    }

    public StyleSheet appendNamedStyle(String name, String style) {
        setValue_(getValue_() + name + ':' + style + " !important;");
        return this;
    }
}
