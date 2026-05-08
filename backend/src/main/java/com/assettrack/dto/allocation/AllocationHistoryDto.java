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
    private Long id;

    private Long  userId;

    private String userEmail;

    private LocalDateTime checkoutDate;

    private LocalDateTime returnDate;
}
