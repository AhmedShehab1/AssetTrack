package com.assettrack.exception;

/**
 * Exception thrown when a password check fails.
 */
public class InvalidPasswordException extends BaseException {
    public InvalidPasswordException(String message) {
        super(message, 400);
    }
}
