package com.assettrack.dto.allocation;

import com.assettrack.dto.user.UserSummary;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonFormat;

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

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private LocalDateTime allocatedAt;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private LocalDateTime deallocatedAt;

    private Integer durationDays;
}
