package defsu.system.server.components;

import defsu.system.server.core.RecordCore;
import defsu.system.server.utils.Json;
import lombok.Getter;
import lombok.Setter;

import java.util.*;

@Getter
@Setter
public class Table {
    private Map<String, String> attributes;
    private String css;
    private String style;
    private List<Row> rows;
    public Table() {
        setAttributes(new HashMap<>());
        setRows(new ArrayList<>());
    }

    public void addAttribute(String key, String value){
        if(key.equals("style")){
            if(getStyle() != null){
                setStyle(getStyle() + ";" + value);
            }else{
                setStyle(value);
            }
        }else if(key.equals("class")){
            if(getCss() != null){
                setCss(getCss() + " " + value);
            }else{
                setCss(value);
            }
        }else{
            getAttributes().put(key, value);
        }
    }

    public void addRow(Row row){
        getRows().add(row);
    }

    public String toJson(){
        return Json.convertToJson(this);
    }

    public String render(){
        StringBuilder output = new StringBuilder();
        output.append("<table");
        if(getCss() != null){
            output.append(" class=\"").append(getCss()).append("\"");
        }
        if(getStyle() != null){
            output.append(" style=\"").append(getStyle()).append("\"");
        }
        for(Map.Entry<String, String> entry : getAttributes().entrySet()){
            output.append(" ").append(entry.getKey()).append("=\"").append(entry.getValue()).append("\" ");
        }
        output.append(">");
        for(Row row : getRows()){
            output.append(row.getHtml());
        }
        output.append("</table>");
        return output.toString();
    }

    @Getter
    @Setter
    public static class Row{
        private List<Col> cols;
        private Map<String, String> attributes;
        private String css;
        private String style;
        public Row() {
            setCols(new ArrayList<>());
            setAttributes(new HashMap<>());
        }
        public void addAttribute(String key, String value){
            if(key.equals("style")){
                if(getStyle() != null){
                    setStyle(getStyle() + ";" + value);
                }else{
                    setStyle(value);
                }
            }else if(key.equals("class")){
                if(getCss() != null){
                    setCss(getCss() + " " + value);
                }else{
                    setCss(value);
                }
            }else{
                getAttributes().put(key, value);
            }
        }
        public void addCol(Col column){
            getCols().add(column);
        }

        public String getHtml(){
            StringBuilder output = new StringBuilder();
            output.append("<tr");
            if(getCss() != null){
                output.append(" class=\"").append(getCss()).append("\"");
            }
            if(getStyle() != null){
                output.append(" style=\"").append(getStyle()).append("\"");
            }
            for(Map.Entry<String, String> entry : getAttributes().entrySet()){
                output.append(" ").append(entry.getKey()).append("=\"").append(entry.getValue()).append("\" ");
            }
            output.append(">");
            for(Col col : getCols()){
                output.append(col.getHtml());
            }
            output.append("</tr>");
            return output.toString();
        }

        @Getter
        @Setter
        public static class Col{
            private String content;
            private Map<String, String> attributes;
            private String css;
            private String style;
            private List<Object> contentList;
            public Col(Object content) {
                setAttributes(new HashMap<>());
                if(content instanceof String){
                    setContent(RecordCore.convertToString(content,null));
                    setContentList(new ArrayList<>());
                }else if(content instanceof Table){
                    setContent(null);
                    setContentList(new ArrayList<>());
                    getContentList().add(content);
                }else{
                    setContent(RecordCore.convertToString(content,null));
                    setContentList(new ArrayList<>());
                }
            }
            public void addAttribute(String key, String value){
                if(key.equals("style")){
                    if(getStyle() != null){
                        setStyle(getStyle() + ";" + value);
                    }else{
                        setStyle(value);
                    }
                }else if(key.equals("class")){
                    if(getCss() != null){
                        setCss(getCss() + " " + value);
                    }else{
                        setCss(value);
                    }
                }else{
                    getAttributes().put(key, value);
                }
            }

            public String getHtml(){
                StringBuilder output = new StringBuilder();
                output.append("<td");
                if(getCss() != null){
                    output.append(" class=\"").append(getCss()).append("\"");
                }
                if(getStyle() != null){
                    output.append(" style=\"").append(getStyle()).append("\"");
                }
                for(Map.Entry<String, String> entry : getAttributes().entrySet()){
                    output.append(" ").append(entry.getKey()).append("=\"").append(entry.getValue()).append("\" ");
                }
                output.append(">");
                if(getContent() != null){
                    output.append(getContent());
                }
                for(Object obj : getContentList()){
                    if(obj instanceof String){
                        output.append(obj);
                    }else if(obj instanceof Table){
                        output.append(((Table)obj).render());
                    }
                }
                output.append("</td>");
                return output.toString();
            }
        }
    }
}
