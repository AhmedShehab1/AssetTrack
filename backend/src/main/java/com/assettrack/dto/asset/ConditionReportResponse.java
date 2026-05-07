package com.assettrack.dto.asset;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConditionReportResponse {
    private Long id;
    private Long assetId;
    private String assetSerialNumber;
    private Long reportedById;
    private String reportedByEmail;
    private String issueDescription;
    private LocalDate reportDate;
    private String status;
}
