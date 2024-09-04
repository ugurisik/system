package alba.system.server.pages;

import alba.system.server.components.Table;
import alba.system.server.core.HttpCore;

public class MainPage extends HttpCore {
    public HttpCore.ActivePageResponse run2R(HttpCore.ActivePageParameters parameters){
        String html = "";

        Table table = new Table();
        table.addAttribute("style", "width: 100%");
        table.addAttribute("border", "1");
        table.addAttribute("bordercolor", "#000000");
        table.addAttribute("class", "table");
        table.addAttribute("id", "table");

        Table.Row row = new Table.Row();

        Table.Row.Col Title = new Table.Row.Col("Title");
        Title.addAttribute("style", "font-size: 20px");
        row.addCol(Title);

        Table.Row.Col SubTitle = new Table.Row.Col("Sub Title");
        SubTitle.addAttribute("style", "font-size: 15px");
        row.addCol(SubTitle);

        table.addRow(row);


        Table.Row row2 = new Table.Row();
        Table.Row.Col Title2 = new Table.Row.Col("Title2");
        Title2.addAttribute("style", "font-size: 20px");
        row2.addCol(Title2);

        Table.Row.Col SubTitle2 = new Table.Row.Col("Sub Title2");
        SubTitle2.addAttribute("style", "font-size: 15px");
        row2.addCol(SubTitle2);

        table.addRow(row2);


        html = table.render();




        return new HttpCore.ActivePageResponse(table.toJson());
    }
}
