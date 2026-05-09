package com.assettrack.exception;

/**
 * Exception thrown when an asset serial number is already registered.
 */
public class DuplicateSerialNumberException extends BaseException {
    public DuplicateSerialNumberException(String message) {
        super(message, 409);
    }
}
