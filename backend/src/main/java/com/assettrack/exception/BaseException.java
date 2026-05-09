package com.assettrack.exception;

/**
 * Base runtime exception carrying an HTTP status code.
 */
public abstract class BaseException extends RuntimeException {
    private final int statusCode;

    public BaseException(String message, int statusCode) {
        super(message);
        this.statusCode = statusCode;
    }

    public int getStatusCode() {
        return statusCode;
    }
}