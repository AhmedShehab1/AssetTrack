package com.assettrack.dto.allocation;

import com.assettrack.dto.user.UserSummary;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AllocationResponseDto {

    private java.util.UUID id;

    private java.util.UUID assetId;

    private UserSummary assignedTo;

    private LocalDateTime allocatedAt;

    private LocalDateTime deallocatedAt;

    private String notes;

    private boolean active;
}