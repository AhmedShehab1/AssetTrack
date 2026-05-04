package com.assettrack.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuickSpareAssetDto {
    private Long id;
    private String type;
    private String status;
}
