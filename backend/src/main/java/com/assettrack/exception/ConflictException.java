package com.assettrack.exception;

/**
 * Exception thrown when a request conflicts with the current resource state.
 */
public class ConflictException extends BaseException {
    public ConflictException(String message) {
        super(message, 409);
    }
}
