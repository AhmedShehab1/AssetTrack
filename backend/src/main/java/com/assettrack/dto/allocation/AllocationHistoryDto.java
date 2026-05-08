package com.assettrack.dto.allocation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AllocationHistoryDto {
    private java.util.UUID id;

    private com.assettrack.dto.user.UserResponse user;

    private LocalDateTime checkoutDate;

    private LocalDateTime returnDate;
}
