package com.assettrack.dto.assetallocation;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AllocationRequestDto {

    @NotNull(message = "Asset ID is required")
    private Long assetId;

    @NotNull(message = "User ID is required")
    private Long userId;
}
