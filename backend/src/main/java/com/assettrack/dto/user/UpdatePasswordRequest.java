package com.assettrack.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

/**
 * Request payload for changing the authenticated user's password.
 */
@Data
public class UpdatePasswordRequest {

    /** Current password used for verification. */
    @NotBlank
    private String currentPassword;

    /** New password to store for the account. */
    @NotBlank
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$", message = "Password must be at least 8 characters, contain uppercase, lowercase, and a number")
    private String newPassword;
}
