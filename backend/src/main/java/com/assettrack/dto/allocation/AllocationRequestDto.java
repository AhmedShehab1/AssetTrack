package com.assettrack.dto.allocation;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AllocationRequestDto {

    @NotNull
    private Long assetId;

    @NotNull
    private Long userId;
}
