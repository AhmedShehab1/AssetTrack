package com.assettrack.exception;

public class EmailAlreadyExistsException extends BaseException {
    public EmailAlreadyExistsException(String message) {
        super(message, 409);
    }
}
