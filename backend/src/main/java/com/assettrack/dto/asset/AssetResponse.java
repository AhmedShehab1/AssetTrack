package com.assettrack.dto.asset;

import com.assettrack.domain.asset.AssetStatus;
import com.assettrack.domain.asset.AssetType;
import com.assettrack.dto.user.UserSummary;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssetResponse {
    private java.util.UUID id;
    private AssetType type;
    private String brand;
    private String model;
    private String serialNumber;
    private LocalDate purchaseDate;
    private LocalDate warrantyExpirationDate;
    private AssetStatus status;
    private boolean warrantyExpired;
    private Integer warrantyExpiresInDays;
    private UserSummary currentOwner;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
