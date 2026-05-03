package com.assettrack.common.exception.util;

public class JsonPointerUtils {

    /**
     * Converts a Spring FieldError string (e.g., items[0].quantity) 
     * to a valid RFC 6901 JSON pointer (e.g., /items/0/quantity).
     */
    public static String toJsonPointer(String fieldPath) {
        if (fieldPath == null || fieldPath.isEmpty()) {
            return "";
        }
        
        // RFC 6901 escaping: replace ~ with ~0 and / with ~1
        String escaped = fieldPath.replace("~", "~0").replace("/", "~1");
        
        // Convert list/array brackets (e.g., [0]) to /0
        escaped = escaped.replaceAll("\\[(\\d+)\\]", "/$1");
        
        // Convert dot notation to /
        escaped = escaped.replace(".", "/");
        
        // Ensure it starts with /
        if (!escaped.startsWith("/")) {
            escaped = "/" + escaped;
        }
        
        return escaped;
    }
}
