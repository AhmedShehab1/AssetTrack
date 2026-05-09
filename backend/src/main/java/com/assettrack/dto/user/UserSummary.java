package com.assettrack.dto.user;

import com.assettrack.domain.user.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Compact user representation used in nested responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSummary {
    /** User identifier. */
    private UUID id;
    /** User email address. */
    private String email;
    /** Full display name. */
    private String fullName;
    /** Assigned account role. */
    private Role role;
}