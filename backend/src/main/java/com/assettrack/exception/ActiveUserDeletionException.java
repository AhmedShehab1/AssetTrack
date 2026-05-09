package com.assettrack.exception;

/**
 * Exception thrown when trying to delete an account that is still active.
 */
public class ActiveUserDeletionException extends BaseException {
    public ActiveUserDeletionException(String message) {
        super(message, 409);
    }
}
