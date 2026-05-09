package com.assettrack.exception;

/**
 * Exception thrown when an email address is already in use.
 */
public class EmailAlreadyExistsException extends BaseException {
    public EmailAlreadyExistsException(String message) {
        super(message, 409);
    }
}
