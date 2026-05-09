package com.assettrack.dto.asset;

import com.assettrack.domain.asset.AssetType;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Request payload used to register a new asset.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateAssetRequest {

    /** Asset type. */
    @NotNull(message = "Asset type is required")
    private AssetType type;

    /** Manufacturer or brand name. */
    @NotBlank(message = "Brand is required")
    @Size(min = 1, max = 100, message = "Brand must be between 1 and 100 characters")
    private String brand;

    /** Product model name. */
    @NotBlank(message = "Model is required")
    @Size(min = 1, max = 150, message = "Model must be between 1 and 150 characters")
    private String model;

    /** Unique serial number. */
    @NotBlank(message = "Serial number is required")
    @Pattern(regexp = "^[A-Z0-9\\-]{4,30}$", message = "Serial number must be 4–30 uppercase alphanumeric characters or hyphens")
    private String serialNumber;

    /** Date the asset was purchased. */
    @NotNull(message = "Purchase date is required")
    @PastOrPresent(message = "Purchase date cannot be in the future")
    private LocalDate purchaseDate;

    /** Warranty expiration date. */
    @NotNull(message = "Warranty expiration date is required")
    @Future(message = "Warranty expiration date must be in the future")
    private LocalDate warrantyExpirationDate;

    /** Optional internal notes. */
    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    private String notes;

    @AssertTrue(message = "Warranty expiration date must be after purchase date")
    private boolean isWarrantyAfterPurchase() {
        if (purchaseDate == null || warrantyExpirationDate == null)
            return true;
        return warrantyExpirationDate.isAfter(purchaseDate);
    }
}
