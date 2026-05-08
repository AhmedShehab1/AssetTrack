package com.assettrack.dto.asset;

import com.assettrack.domain.asset.AssetStatus;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateAssetRequest {

    // type is intentionally excluded — type cannot change after registration

    @Size(min = 1, max = 100, message = "Brand must be between 1 and 100 characters")
    private String brand;

    @Size(min = 1, max = 150, message = "Model must be between 1 and 150 characters")
    private String model;

    @Pattern(
            regexp = "^[A-Z0-9\\-]{4,30}$",
            message = "Serial number must be 4–30 uppercase alphanumeric characters or hyphens"
    )
    private String serialNumber;

    @PastOrPresent(message = "Purchase date cannot be in the future")
    private LocalDate purchaseDate;

    private LocalDate warrantyExpirationDate;

    private AssetStatus status;

    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    private String notes;

    @AssertTrue(message = "Warranty expiration date must be after purchase date")
    private boolean isWarrantyAfterPurchase() {
        if (purchaseDate == null || warrantyExpirationDate == null) return true;
        return warrantyExpirationDate.isAfter(purchaseDate);
    }
}