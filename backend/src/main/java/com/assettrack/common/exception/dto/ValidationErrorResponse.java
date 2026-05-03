package com.assettrack.common.exception.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidationErrorResponse {
    @Builder.Default
    private String code = "VALIDATION_ERROR";
    private String message;
    private List<ValidationErrorDetail> errors;
}
