package com.assettrack.controller;

import com.assettrack.common.exception.dto.ApiError;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import java.time.Instant;

/**
 * Fallback controller that renders a structured ApiError response.
 */
@Controller
public class CustomErrorController implements ErrorController {

    @RequestMapping("/error")
    public ResponseEntity<ApiError> handleError(HttpServletRequest request) {
        Object status = request.getAttribute("jakarta.servlet.error.status_code");
        Object exceptionMessage = request.getAttribute("jakarta.servlet.error.message");
        Object requestUri = request.getAttribute("jakarta.servlet.error.request_uri");

        int statusCode = HttpStatus.INTERNAL_SERVER_ERROR.value();
        if (status != null) {
            try {
                statusCode = Integer.parseInt(status.toString());
            } catch (Exception e) {
                // ignore
            }
        }

        HttpStatus httpStatus = HttpStatus.resolve(statusCode);
        if (httpStatus == null) {
            httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        }

        String message = (exceptionMessage != null && !exceptionMessage.toString().isEmpty())
                ? exceptionMessage.toString()
                : httpStatus.getReasonPhrase();

        String path = requestUri != null ? requestUri.toString() : request.getRequestURI();

        ApiError apiError = ApiError.builder()
                .timestamp(Instant.now().toString())
                .status(statusCode)
                .error(httpStatus.getReasonPhrase())
                .message(message)
                .path(path)
                .build();

        return ResponseEntity.status(statusCode).body(apiError);
    }
}
