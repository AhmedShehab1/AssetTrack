package com.assettrack.dto.allocation;

import com.assettrack.dto.user.UserSummary;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonFormat;

/**
 * Historical allocation entry used for asset allocation timelines.
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AllocationHistoryDto {
    /** Allocation identifier. */
    private java.util.UUID allocationId;

    /** Related asset identifier. */
    private java.util.UUID assetId;

    /** Asset serial number. */
    private String assetSerialNumber;

    /** Asset brand. */
    private String assetBrand;

    /** Asset model. */
    private String assetModel;

    /** User assigned to the asset. */
    private UserSummary assignedTo;

    /** Allocation start timestamp. */
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private LocalDateTime allocatedAt;

    /** Allocation end timestamp, if returned. */
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private LocalDateTime deallocatedAt;

    /** Number of whole days the allocation lasted. */
    private Integer durationDays;
}
