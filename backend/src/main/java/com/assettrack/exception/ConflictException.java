package com.assettrack.exception;

public class ConflictException extends BaseException {
    public ConflictException(String message) {
        super(message, 409);
    }
}
