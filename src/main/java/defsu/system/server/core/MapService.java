package defsu.system.server.core;

import defsu.system.server.helpers.InteractionMessage;
import defsu.system.server.utils.Enums;
import defsu.system.server.utils.Logger;

import java.util.ArrayList;

public abstract class MapService {
    public static final String ACTION = "action";

    public abstract ArrayList<ServiceAbility> getActions();

    public SuResponse handle(String actionName, StringDictionary<ServerObject> params) {
        ArrayList<ServiceAbility> actions = this.getActions();
        SuResponse response = new SuResponse();
        ServiceAbility action = null;
        for (int k = 0; k < actions.size(); ++k) {
            ServiceAbility cAction = (ServiceAbility) actions.get(k);
            if (cAction != null && actionName.equals(cAction.getName())) {
                action = cAction;
                break;
            }
        }
        if (action != null) {
            try {
                response = action.getHandle().handle(params);
            } catch (Exception e) {
                Logger.Error(e, "Error while handling action", true);
            }
        } else {
            response.setStatusCode("404");
        }
        return response;
    }

    public static SuResponse call(String serviceClassName, String action, StringDictionary<ServerObject> params) {
        SuResponse response = new SuResponse();
        boolean notAuthorized = true;
        Class cls;
        try {
            // TODO::Burada yetki kontrolü yapılacak
            cls = Class.forName(serviceClassName);
        } catch (Exception e) {
            Logger.Error(e, "Error while calling service", true);
        }

        if(!notAuthorized){
            InteractionMessage message = new InteractionMessage();
            message.setType(Enums.InteractionMessageType.ERROR);
            message.setMessage("Not authorized");
            message.setTitle("Error");
            response.getMessages().add(message);
            return response;
        }else{
            cls = null;
            Object o = null;
            try{
                cls = Class.forName(serviceClassName);
                try{
                    o = cls.newInstance();
                }catch (InstantiationException | IllegalAccessException e){
                    Logger.Error(e, "Error while creating instance", true);
                    response.setStatusCode("306");
                }
                if(o instanceof MapService service){
                    response = service.handle(action, params);
                }
            }catch (ClassNotFoundException e){
                Logger.Error(e, "Error while calling service EOI:304", true);
                response.setStatusCode("304");
            }
        }
        return response;
    }

    public static void appendSearch(StringDictionary<String> list, String key, String searchVal) {
        appendSearch(list, key, searchVal, true);
    }

    public static void appendSearch(StringDictionary<String> list, String key, String searchVal, boolean limitSubscriber) {
        // Null veya geçersiz parametre kontrolü
        if (list == null || key == null || searchVal == null || searchVal.isEmpty()) {
            return;
        }

        String search = list.containsKey("@search") ? list.get("@search") : "";

        // Mevcut arama string'i boş değilse ayırıcı ekle
        if (!search.isEmpty()) {
            search += ";";
        }

        // Yeni arama kriterini ekle
        search += key + "=" + searchVal + (limitSubscriber ? "" : "~");

        // Güncellenen aramayı kaydet
        list.put("@search", search);
    }

    public static void removeSearch(StringDictionary<String> list, String key) {
        // Null veya geçersiz parametre kontrolü
        if (list == null || key == null || !list.containsKey("@search")) {
            return;
        }

        String search = list.get("@search");
        if (search == null || search.isEmpty()) {
            return;
        }

        String[] searchItems = search.split(";");
        StringBuilder newSearch = new StringBuilder();

        // Key ile başlamayan öğeleri yeni arama string'ine ekle
        for (String item : searchItems) {
            if (item != null && !item.startsWith(key)) {
                if (newSearch.length() > 0) {
                    newSearch.append(";");
                }
                newSearch.append(item);
            }
        }

        // Güncellenen aramayı kaydet
        list.put("@search", newSearch.toString());
    }

    public static String join(String[] input, String delimiter) {
        // Null veya boş dizi kontrolü
        if (input == null || input.length == 0) {
            return "";
        }

        // String.join kullanımı (Java 8+)
        return String.join(delimiter, input);
    }

    public static String or(String... vals) {
        // Null veya boş dizi kontrolü
        if (vals == null || vals.length == 0) {
            return "";
        }

        // String.join kullanımı (Java 8+)
        return String.join("|", vals);
    }

    public static void appendSort(StringDictionary<String> list, String key, String sortVal) {
        // Null veya geçersiz parametre kontrolü
        if (list == null || key == null || sortVal == null || sortVal.isEmpty()) {
            return;
        }

        String sort = list.containsKey("@sort") ? list.get("@sort") : "";

        sort = sort.replace("undefined=D","");
        // Mevcut sıralama string'i boş değilse ayırıcı ekle
        if (!sort.isEmpty()) {
            sort += ";";
        }

        // Yeni sıralama kriterini ekle
        sort += key + "=" + sortVal;

        // Güncellenen sıralamayı kaydet
        list.put("@sort", sort);
    }
}
