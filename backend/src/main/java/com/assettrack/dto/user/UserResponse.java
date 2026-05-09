package com.assettrack.dto.user;

import com.assettrack.domain.user.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.util.UUID;

/**
 * Full user response returned by user and auth endpoints.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse {
    /** User identifier. */
    private UUID id;
    /** User email address. */
    private String email;
    /** Full display name. */
    private String fullName;
    /** Assigned account role. */
    private Role role;

    /** UTC creation timestamp. */
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private LocalDateTime createdAt;
    /** UTC last update timestamp. */
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private LocalDateTime updatedAt;
    /** Whether the account is active. */
    private boolean active;
}
