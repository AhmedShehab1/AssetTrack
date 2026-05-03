package com.assettrack.common.exception;

import com.assettrack.common.exception.dto.ErrorResponse;
import com.assettrack.common.exception.dto.ValidationErrorDetail;
import com.assettrack.common.exception.dto.ValidationErrorResponse;
import com.assettrack.common.exception.util.JsonPointerUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.util.List;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ValidationErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex) {
        List<ValidationErrorDetail> details = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> ValidationErrorDetail.builder()
                        .pointer(JsonPointerUtils.toJsonPointer(error.getField()))
                        .message(error.getDefaultMessage())
                        .errorType(error.getCode())
                        .build())
                .collect(Collectors.toList());

        ValidationErrorResponse response = ValidationErrorResponse.builder()
                .code("VALIDATION_ERROR")
                .message("Validation failed")
                .errors(details)
                .build();

        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(response);
    }

    @ExceptionHandler({NoHandlerFoundException.class, com.assettrack.exception.ResourceNotFoundException.class})
    public ResponseEntity<ErrorResponse> handleNotFound(Exception ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ErrorResponse.builder().code("NOT_FOUND").message(ex.getMessage()).build());
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleHttpMessageNotReadable(HttpMessageNotReadableException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse.builder().code("BAD_REQUEST").message("Malformed JSON request").build());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleAllExceptions(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ErrorResponse.builder().code("INTERNAL_SERVER_ERROR").message("An unexpected error occurred").build());
    }
}
