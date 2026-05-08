package com.assettrack.dto.asset;

import com.assettrack.domain.asset.AssetType;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateAssetRequest {

    @NotNull(message = "Asset type is required")
    private AssetType type;

    @NotBlank(message = "Brand is required")
    @Size(min = 1, max = 100, message = "Brand must be between 1 and 100 characters")
    private String brand;

    @NotBlank(message = "Model is required")
    @Size(min = 1, max = 150, message = "Model must be between 1 and 150 characters")
    private String model;

    @NotBlank(message = "Serial number is required")
    @Pattern(
            regexp = "^[A-Z0-9\\-]{4,30}$",
            message = "Serial number must be 4–30 uppercase alphanumeric characters or hyphens"
    )
    private String serialNumber;

    @NotNull(message = "Purchase date is required")
    @PastOrPresent(message = "Purchase date cannot be in the future")
    private LocalDate purchaseDate;

    @NotNull(message = "Warranty expiration date is required")
    @Future(message = "Warranty expiration date must be in the future")
    private LocalDate warrantyExpirationDate;

    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    private String notes;

    @AssertTrue(message = "Warranty expiration date must be after purchase date")
    private boolean isWarrantyAfterPurchase() {
        if (purchaseDate == null || warrantyExpirationDate == null) return true;
        return warrantyExpirationDate.isAfter(purchaseDate);
    }
}
