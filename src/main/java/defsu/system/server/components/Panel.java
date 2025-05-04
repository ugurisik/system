package defsu.system.server.components;

import java.io.Serial;

public class Panel extends Container{
    @Serial
    private static final long serialVersionUID = 4492981097415099709L;
    public Panel() {
        this.initialize();
    }

    public Panel(String id) {
        super(id);
        this.initialize();
    }

    public Panel(Conf... configs) {
        super(configs);
        this.initialize();
    }

    private void initialize() {
    }

    public String getXType() {
        return "mpanel";
    }

    public String getIcon() {
        return "sources/assets/icons/panel.png";
    }

    public Panel title(String text){
        this.addConfig(new Component.CPT("title", text));
        return this;
    }

    public Panel id(String dName){
        this.addConfig(new Component.CP("id", dName));
        return this;
    }

    public Panel x(int xVal){
        this.addConfig(new Component.CPI("x", xVal));
        return this;
    }

    public Panel y(int yVal){
        this.addConfig(new Component.CPI("y", yVal));
        return this;
    }

    public Panel width(int width){
        this.addConfig(new Component.CPI("width", width));
        return this;
    }

    public Panel height(int width){
        this.addConfig(new Component.CPI("height", width));
        return this;
    }

    public Panel absolute(){
        this.addConfig(new Component.CPL("layout", new Conf[]{new Component.CP("type", "absolute")}));
        return this;
    }

    public Panel fit(){
        this.addConfig(new Component.CPL("layout", new Conf[]{new Component.CP("type", "fit")}));
        return this;
    }

    public Panel border(){
        this.addConfig(new Component.CPL("layout", new Conf[]{new Component.CP("type", "border")}));
        return this;
    }

    public Panel accordion(){
        this.addConfig(new Component.CPL("layout", new Conf[]{new Component.CP("type", "accordion")}));
        return this;
    }

    public Panel anchor(){
        this.addConfig(new Component.CPL("layout", new Conf[]{new Component.CP("type", "anchor")}));
        return this;
    }

    public Panel hbox(){
        this.addConfig(new Component.CPL("layout", new Conf[]{new Component.CP("type", "hbox")}));
        return this;
    }

    public Panel vbox(){
        this.addConfig(new Component.CPL("layout", new Conf[]{new Component.CP("type", "vbox")}));
        return this;
    }

    public Panel form(){
        this.addConfig(new Component.CPL("layout", new Conf[]{new Component.CP("type", "form")}));
        return this;
    }

    public Panel column(){
        this.addConfig(new Component.CPL("layout", new Conf[]{new Component.CP("type", "column")}));
        return this;
    }

    public Panel table(){
        this.addConfig(new Component.CPL("layout", new Conf[]{new Component.CP("type", "table")}));
        return this;
    }

    public Panel card(){
        this.addConfig(new Component.CPL("layout", new Conf[]{new Component.CP("type", "card")}));
        return this;
    }

    public Panel tabpanel(){
        this.addConfig(new Component.CPL("layout", new Conf[]{new Component.CP("type", "tabpanel")}));
        return this;
    }

    public Panel regionCenter(){
        this.addConfig(new Component.CP("region", "center"));
        return this;
    }

    public Panel regionWest(){
        this.addConfig(new Component.CP("region", "west"));
        return this;
    }

    public Panel regionEast(){
        this.addConfig(new Component.CP("region", "east"));
        return this;
    }

    public Panel regionNorth(){
        this.addConfig(new Component.CP("region", "north"));
        return this;
    }

    public Panel regionSouth(){
        this.addConfig(new Component.CP("region", "south"));
        return this;
    }


}
