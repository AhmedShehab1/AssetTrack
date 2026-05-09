package com.assettrack.exception;

/**
 * Exception thrown when an admin attempts to operate on their own account.
 */
public class SelfOperationException extends BaseException {
    public SelfOperationException(String message) {
        super(message, 403);
    }
}
