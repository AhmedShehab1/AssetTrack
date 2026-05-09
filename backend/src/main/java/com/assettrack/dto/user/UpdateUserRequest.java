package com.assettrack.dto.user;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateUserRequest {
    @Size(min = 2, max = 120, message = "Full name must be between 2 and 120 characters")
    private String fullName;
    
    private Boolean active;
}
