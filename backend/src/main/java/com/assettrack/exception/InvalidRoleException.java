package com.assettrack.exception;

public class InvalidRoleException extends BaseException{
    public InvalidRoleException(String message){super(message,400);}
}
