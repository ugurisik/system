Java WebSocket ExtJS Application - ALBATROS







Table class usage
-----------------

```java
import com.albatros.app.table.Table;

Table table = new Table();
table.addAttribute("style", "width: 100%");
table.addAttribute("border", "1");
table.addAttribute("class", "table"); // class, id etc. All attributes are supported.

Table.Row row = new Table.Row();
row.addAttribute("style", "background-color: #f0f0f0"); // Like table, row also supports attributes.

Table.Col col = new Table.Col(Object value);
col.addAttribute("style", "text-align: center"); // Like table, row, col also supports attributes.

row.addCol(col);
table.addRow(row);

table.render(); // Returns the HTML code of the table.

// Also, you can get table as a json object.
// table.toJson();
```

EndPoints Usage
----------------------------
>```java
>SystemApplication.projects should follow this structure:
>projectName;projectName;.......
>The endpoints should adhere to this structure:
>alba.system.server.endpoints.projectName.class
>Each class must extend `HttpCore`. 
>If you need to specify a custom endpoint name, include it in the constructor using `setRoute("routeName")`**.
>```






