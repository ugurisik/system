package defsu.system.server.utils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.HashMap;
import java.util.Map;

public class Json {
    public static String convertToJson(Object obj) {
        try {
            return new ObjectMapper().writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error while converting object to json", e);
        }
    }
    public static String responseJson(String message,boolean status){
        Map<String, Object> response = new HashMap<>();
        response.put("message", message);
        response.put("status", status);
        return convertToJson(response);
    }
    public static HashMap convertToMap(String json) {
        try {
            return new ObjectMapper().readValue(json, HashMap.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error while converting json to map", e);
        }
    }
}
