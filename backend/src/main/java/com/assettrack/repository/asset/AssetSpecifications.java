package com.assettrack.repository.asset;

import com.assettrack.domain.asset.Asset;
import com.assettrack.domain.asset.AssetStatus;
import com.assettrack.domain.asset.AssetType;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

/**
 * JPA Specifications for building dynamic, composable queries against the Asset entity.
 * <p>
 * Each method returns a null-safe {@link Specification}: when a filter value is {@code null},
 * the specification evaluates to a tautology (always-true predicate), making it safe to
 * chain with {@code Specification.where(...).and(...)} without null checks at the call site.
 * <p>
 * Example usage:
 * <pre>
 * Specification&lt;Asset&gt; spec = Specification
 *     .where(AssetSpecifications.hasStatus(AssetStatus.AVAILABLE))
 *     .and(AssetSpecifications.hasBrand("Dell"));
 *
 * Page&lt;Asset&gt; results = assetRepository.findAll(spec, pageable);
 * </pre>
 */
public final class AssetSpecifications {

    private AssetSpecifications() {
        // utility class — no instantiation
    }

    /**
     * Filters assets by exact status match.
     */
    public static Specification<Asset> hasStatus(AssetStatus status) {
        return (root, query, cb) ->
                status == null ? cb.conjunction() : cb.equal(root.get("status"), status);
    }

    /**
     * Filters assets by exact type match.
     */
    public static Specification<Asset> hasType(AssetType type) {
        return (root, query, cb) ->
                type == null ? cb.conjunction() : cb.equal(root.get("type"), type);
    }

    /**
     * Filters assets by case-insensitive partial brand match (LIKE %brand%).
     */
    public static Specification<Asset> hasBrand(String brand) {
        return (root, query, cb) ->
                brand == null || brand.isBlank()
                        ? cb.conjunction()
                        : cb.like(cb.lower(root.get("brand")), "%" + brand.toLowerCase() + "%");
    }

    /**
     * Filters assets by exact serial number match.
     */
    public static Specification<Asset> hasSerialNumber(String serialNumber) {
        return (root, query, cb) ->
                serialNumber == null || serialNumber.isBlank()
                        ? cb.conjunction()
                        : cb.equal(root.get("serialNumber"), serialNumber);
    }

    public static Specification<Asset> warrantyExpired(LocalDate today) {
        return (root, query, cb) ->
                cb.lessThan(root.get("warrantyExpirationDate"), today);
    }

    public static Specification<Asset> warrantyExpiringBefore(LocalDate cutoff) {
        return (root, query, cb) ->
                cb.lessThanOrEqualTo(root.get("warrantyExpirationDate"), cutoff);
    }
}
