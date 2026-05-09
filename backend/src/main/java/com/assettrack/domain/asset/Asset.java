package com.assettrack.domain.asset;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Asset entity representing a tracked hardware item.
 */
@Entity
@Table(name = "assets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Asset {

    /** Asset identifier. */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /** Asset type. */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssetType type;

    /** Brand name. */
    @Column(nullable = false, length = 100)
    private String brand;

    /** Model name. */
    @Column(nullable = false, length = 150)
    private String model;

    /** Unique serial number. */
    @Column(nullable = false, unique = true, length = 30)
    private String serialNumber;

    /** Purchase date. */
    private LocalDate purchaseDate;

    /** Warranty expiration date. */
    private LocalDate warrantyExpirationDate;

    /** Current asset status. */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssetStatus status;

    /** Optional internal notes. */
    @Column(length = 1000)
    private String notes;

    /** Allocation history for this asset. */
    @OneToMany(mappedBy = "asset", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("checkoutDate DESC")
    @Builder.Default
    private List<AssetAllocation> allocations = new ArrayList<>();

    /** Condition reports filed against this asset. */
    @OneToMany(mappedBy = "asset", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("reportDate DESC")
    @Builder.Default
    private List<ConditionReport> conditionReports = new ArrayList<>();

    /** UTC creation timestamp. */
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /** UTC last update timestamp. */
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}