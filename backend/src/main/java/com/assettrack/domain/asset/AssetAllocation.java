package com.assettrack.domain.asset;

import com.assettrack.domain.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Asset allocation entity representing a checkout record.
 */
@Entity
@Table(name = "asset_allocations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssetAllocation {

    /** Allocation identifier. */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /** Allocated asset. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    /** User receiving the asset. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** UTC checkout timestamp. */
    @Column(nullable = false)
    private LocalDateTime checkoutDate;

    /** UTC return timestamp; null while the allocation is active. */
    private LocalDateTime returnDate;

    /** Optional allocation notes. */
    @Column(length = 500)
    private String notes;
}
