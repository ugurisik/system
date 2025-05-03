package defsu.system.server.components;

public class Img extends Container{
    private static final long serialVersionUID = -46697745362090765L;

    public Img() {
        this._initialize();
    }

    public Img(String id) {
        super(id);
        this._initialize();
    }

    public Img(Conf... configs) {
        super(configs);
        this._initialize();
    }

    public Img id(String dName){
        this.addConfig(new Component.CP("id", dName));
        return this;
    }

    public Img x(int xVal){
        this.addConfig(new Component.CPI("x", xVal));
        return this;
    }

    public Img y(int yVal){
        this.addConfig(new Component.CPI("y", yVal));
        return this;
    }

    public Img width(int width){
        this.addConfig(new Component.CPI("width", width));
        return this;
    }

    public Img height(int width){
        this.addConfig(new Component.CPI("height", width));
        return this;
    }

    public Img regionCenter(){
        this.addConfig(new Component.CP("region", "center"));
        return this;
    }

    public Img regionWest(){
        this.addConfig(new Component.CP("region", "west"));
        return this;
    }

    public Img regionEast(){
        this.addConfig(new Component.CP("region", "east"));
        return this;
    }

    public Img regionNorth(){
        this.addConfig(new Component.CP("region", "north"));
        return this;
    }

    public Img regionSouth(){
        this.addConfig(new Component.CP("region", "south"));
        return this;
    }

    public Img src(String src){
        this.addConfig(new Component.CPT("src", src));
        return this;
    }


    private void _initialize() {
    }

    public String getXType() {
        return "mimage";
    }

    public Object getInputValue() {
        return this.getConfigs().containsKey("src") ? (String)((Conf)this.getConfigs().get("src")).getValue() : "";
    }
}
