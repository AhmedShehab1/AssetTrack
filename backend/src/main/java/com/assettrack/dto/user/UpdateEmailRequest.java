package com.assettrack.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Request payload for changing the authenticated user's email address.
 */
@Data
public class UpdateEmailRequest {

    /** New email address to assign to the account. */
    @NotBlank
    @Email
    private String newEmail;

    /** Current password used to confirm the change. */
    @NotBlank
    private String password;

}
