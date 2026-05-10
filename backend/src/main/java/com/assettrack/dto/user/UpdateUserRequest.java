package com.assettrack.dto.user;

import jakarta.validation.constraints.Size;

public record UpdateUserRequest(
        @Size(min = 2, max = 120) String fullName,
        Boolean active
) {}