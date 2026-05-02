package com.assettrack.exception;

public class ActiveUserDeletionException extends BaseException {
    public ActiveUserDeletionException(String message) {
        super(message, 409);
    }
}
