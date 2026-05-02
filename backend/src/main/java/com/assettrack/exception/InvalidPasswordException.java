package com.assettrack.exception;

public class InvalidPasswordException extends BaseException {
    public InvalidPasswordException(String message) {
        super(message, 401);
    }
}


