package com.assettrack.common.exception;

import com.assettrack.common.exception.dto.ApiError;
import com.assettrack.common.exception.dto.FieldError;
import com.assettrack.exception.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;

/**
 * Global exception handler that converts backend exceptions into ApiError
 * responses.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

        private ApiError buildApiError(HttpStatus status, String message, String path) {
                return ApiError.builder()
                                .timestamp(Instant.now().toString())
                                .status(status.value())
                                .error(status.getReasonPhrase())
                                .message(message)
                                .path(path)
                                .build();
        }

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ApiError> handleValidationExceptions(MethodArgumentNotValidException ex,
                        HttpServletRequest request) {
                log.warn("Validation failed for {}: {}", request.getRequestURI(), ex.getMessage());
                List<FieldError> fieldErrors = ex.getBindingResult().getFieldErrors().stream()
                                .map(error -> FieldError.builder()
                                                .field(error.getField())
                                                .message(error.getDefaultMessage())
                                                .build())
                                .collect(Collectors.toList());

                ApiError apiError = ApiError.builder()
                                .timestamp(Instant.now().toString())
                                .status(HttpStatus.BAD_REQUEST.value())
                                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                                .message("Validation failed")
                                .path(request.getRequestURI())
                                .fieldErrors(fieldErrors)
                                .build();

                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(apiError);
        }

        @ExceptionHandler({ NoHandlerFoundException.class, NoResourceFoundException.class,
                        com.assettrack.exception.ResourceNotFoundException.class })
        public ResponseEntity<ApiError> handleNotFound(Exception ex, HttpServletRequest request) {
                log.warn("Not found at {}: {}", request.getRequestURI(), ex.getMessage());
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body(buildApiError(HttpStatus.NOT_FOUND, ex.getMessage(), request.getRequestURI()));
        }

        @ExceptionHandler(HttpMessageNotReadableException.class)
        public ResponseEntity<ApiError> handleHttpMessageNotReadable(HttpMessageNotReadableException ex,
                        HttpServletRequest request) {
                log.warn("Malformed JSON at {}", request.getRequestURI(), ex);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(buildApiError(HttpStatus.BAD_REQUEST, "Malformed JSON request",
                                                request.getRequestURI()));
        }

        @ExceptionHandler(EmailAlreadyExistsException.class)
        public ResponseEntity<ApiError> handleEmailExists(EmailAlreadyExistsException ex, HttpServletRequest request) {
                log.warn("Conflict at {}: {}", request.getRequestURI(), ex.getMessage());
                return ResponseEntity.status(HttpStatus.CONFLICT)
                                .body(buildApiError(HttpStatus.CONFLICT, ex.getMessage(), request.getRequestURI()));
        }

        @ExceptionHandler({ ConflictException.class })
        public ResponseEntity<ApiError> handleBadRequest(RuntimeException ex, HttpServletRequest request) {
                log.warn("Bad request at {}: {}", request.getRequestURI(), ex.getMessage());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(buildApiError(HttpStatus.BAD_REQUEST, ex.getMessage(), request.getRequestURI()));
        }

        @ExceptionHandler(BadCredentialsException.class)
        public ResponseEntity<ApiError> handleBadCredentials(BadCredentialsException ex, HttpServletRequest request) {
                log.warn("Unauthorized access at {}", request.getRequestURI());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body(buildApiError(HttpStatus.UNAUTHORIZED, "Invalid email or password",
                                                request.getRequestURI()));
        }

        @ExceptionHandler(AccessDeniedException.class)
        public ResponseEntity<ApiError> handleAccessDenied(AccessDeniedException ex, HttpServletRequest request) {
                log.warn("Access denied at {}", request.getRequestURI());
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(buildApiError(HttpStatus.FORBIDDEN, "Access denied", request.getRequestURI()));
        }

        @ExceptionHandler(MethodArgumentTypeMismatchException.class)
        public ResponseEntity<ApiError> handleTypeMismatch(MethodArgumentTypeMismatchException ex,
                        HttpServletRequest request) {
                String expectedType = ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "Unknown";

                FieldError fieldError = FieldError.builder()
                                .field(ex.getName())
                                .message(String.format("Type mismatch for parameter: expected type %s", expectedType))
                                .rejectedValue(ex.getValue())
                                .build();

                ApiError apiError = ApiError.builder()
                                .timestamp(Instant.now().toString())
                                .status(HttpStatus.BAD_REQUEST.value())
                                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                                .message("Type mismatch")
                                .path(request.getRequestURI())
                                .fieldErrors(Collections.singletonList(fieldError))
                                .build();

                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(apiError);
        }

        @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
        public ResponseEntity<ApiError> handleMethodNotSupported(HttpRequestMethodNotSupportedException ex,
                        HttpServletRequest request) {
                log.warn("Method not supported at {}: {}", request.getRequestURI(), ex.getMethod());
                return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED)
                                .body(buildApiError(HttpStatus.METHOD_NOT_ALLOWED, ex.getMessage(),
                                                request.getRequestURI()));
        }

        @ExceptionHandler(Exception.class)
        public ResponseEntity<ApiError> handleAllExceptions(Exception ex, HttpServletRequest request) {
                if (ex instanceof com.assettrack.exception.BaseException baseException) {
                        HttpStatus status = HttpStatus.resolve(baseException.getStatusCode());
                        if (status == null) {
                                status = HttpStatus.INTERNAL_SERVER_ERROR;
                        }

                        log.warn("Application exception at {}: {}", request.getRequestURI(),
                                        baseException.getMessage());

                        return ResponseEntity.status(status)
                                        .body(buildApiError(status, baseException.getMessage(),
                                                        request.getRequestURI()));
                }

                log.error("Unexpected exception at {}", request.getRequestURI(), ex);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(buildApiError(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred",
                                                request.getRequestURI()));
        }
}
