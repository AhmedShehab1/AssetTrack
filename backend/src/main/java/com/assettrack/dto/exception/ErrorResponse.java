package com.assettrack.dto.exception;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * Legacy error response used by older exception handlers.
 */
@Data
@AllArgsConstructor
public class ErrorResponse {
    private int statusCode;
    private String message;
}
