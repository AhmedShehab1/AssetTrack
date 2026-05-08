package com.assettrack.dto.user;

import com.assettrack.domain.user.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSummary {
    private UUID id;
    private String email;
    private String fullName;
    private Role role;
}