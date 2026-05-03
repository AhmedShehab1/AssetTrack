package com.assettrack.exception;

public class SelfOperationException extends BaseException{
    public SelfOperationException(String message){super(message,403);}
}
