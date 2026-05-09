package com.assettrack.exception;

/**
 * Exception thrown when a supplied role value is invalid.
 */
public class InvalidRoleException extends BaseException {
    public InvalidRoleException(String message) {
        super(message, 400);
    }
}
