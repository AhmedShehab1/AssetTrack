package com.assettrack.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuickSpareAssetDto {
    private java.util.UUID id;
    private String type;
    private String status;
}
