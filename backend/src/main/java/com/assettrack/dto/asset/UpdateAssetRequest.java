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

/**
 * Request payload used to update an asset.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateAssetRequest {

    // type is intentionally excluded — type cannot change after registration

    /** Updated brand name. */
    @Size(min = 1, max = 100, message = "Brand must be between 1 and 100 characters")
    private String brand;

    /** Updated model name. */
    @Size(min = 1, max = 150, message = "Model must be between 1 and 150 characters")
    private String model;

    /** Updated serial number. */
    @Pattern(regexp = "^[A-Z0-9\\-]{4,30}$", message = "Serial number must be 4–30 uppercase alphanumeric characters or hyphens")
    private String serialNumber;

    /** Updated purchase date. */
    @PastOrPresent(message = "Purchase date cannot be in the future")
    private LocalDate purchaseDate;

    /** Updated warranty expiration date. */
    private LocalDate warrantyExpirationDate;

    /** Updated asset status. */
    private AssetStatus status;

    /** Updated internal notes. */
    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    private String notes;

    @AssertTrue(message = "Warranty expiration date must be after purchase date")
    private boolean isWarrantyAfterPurchase() {
        if (purchaseDate == null || warrantyExpirationDate == null)
            return true;
        return warrantyExpirationDate.isAfter(purchaseDate);
    }
}