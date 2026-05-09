package com.assettrack.dto.allocation;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Request payload for allocating an asset to a user.
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AllocationRequestDto {

    @NotNull
    private java.util.UUID assignedToUserId;

    private String notes;
}
