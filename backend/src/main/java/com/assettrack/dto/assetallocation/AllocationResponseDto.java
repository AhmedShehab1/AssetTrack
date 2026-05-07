package com.assettrack.dto.assetallocation;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AllocationResponseDto {
    private Long allocationId;
    private Long assetId;
    private Long userId;
    private LocalDateTime checkoutDate;
    private LocalDateTime returnDate;
}
