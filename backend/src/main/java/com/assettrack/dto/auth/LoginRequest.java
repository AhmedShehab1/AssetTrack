package com.assettrack.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Login payload used to authenticate an existing user.
 */
@Data
public class LoginRequest {
    /** User email address. */
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    /** Raw password used for authentication. */
    @NotBlank(message = "Password is required")
    private String password;
}