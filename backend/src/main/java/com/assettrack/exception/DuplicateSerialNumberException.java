package com.assettrack.exception;

public class DuplicateSerialNumberException extends BaseException{
    public DuplicateSerialNumberException(String message){super(message,409);}
}
