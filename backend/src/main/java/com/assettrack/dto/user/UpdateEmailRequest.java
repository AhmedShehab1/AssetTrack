package com.assettrack.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateEmailRequest {

    @NotBlank
    @Email
    private String newEmail;

    @NotBlank
    private String password;

}
