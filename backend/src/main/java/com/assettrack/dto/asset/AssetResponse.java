package com.assettrack.dto.asset;

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
    private String type;
    private String brand;
    private String model;
    private String serialNumber;
    private LocalDate purchaseDate;
    private LocalDate warrantyExpirationDate;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean warrantyExpired;
    private String currentOwner;
}
