package com.assettrack.dto.allocation;

import com.assettrack.dto.user.UserSummary;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonFormat;

/**
 * Allocation response returned after allocation and deallocation operations.
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AllocationResponseDto {

    /** Allocation identifier. */
    private java.util.UUID id;

    /** Related asset identifier. */
    private java.util.UUID assetId;

    /** User assigned to the asset. */
    private UserSummary assignedTo;

    /** Allocation start timestamp. */
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private LocalDateTime allocatedAt;

    /** Allocation end timestamp, if returned. */
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private LocalDateTime deallocatedAt;

    /** Optional notes attached to the allocation. */
    private String notes;

    /** Whether the allocation is currently active. */
    private boolean active;
}
