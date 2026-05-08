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
public class AllocationHistoryDto {
    private java.util.UUID allocationId;

    private java.util.UUID assetId;

    private String assetSerialNumber;

    private String assetBrand;

    private String assetModel;

    private UserSummary assignedTo;

    private LocalDateTime allocatedAt;

    private LocalDateTime deallocatedAt;

    private Integer durationDays;
}
