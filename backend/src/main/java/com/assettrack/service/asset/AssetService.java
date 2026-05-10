package com.assettrack.service.asset;

import com.assettrack.domain.asset.Asset;
import com.assettrack.domain.asset.AssetStatus;
import com.assettrack.domain.asset.AssetType;
import com.assettrack.domain.asset.ConditionReport;
import com.assettrack.domain.asset.ConditionSeverity;
import com.assettrack.domain.asset.ConditionReportStatus;
import com.assettrack.domain.user.User;
import com.assettrack.dto.asset.*;
import com.assettrack.dto.user.UserSummary;
import com.assettrack.exception.ConflictException;
import com.assettrack.exception.DuplicateSerialNumberException;
import com.assettrack.exception.ResourceNotFoundException;
import com.assettrack.exception.SelfOperationException;
import com.assettrack.mapper.asset.AssetMapper;
import com.assettrack.mapper.user.UserMapper;
import com.assettrack.repository.asset.AssetAllocationRepository;
import com.assettrack.repository.asset.AssetRepository;
import com.assettrack.repository.asset.AssetSpecifications;
import com.assettrack.repository.asset.ConditionReportRepository;
import com.assettrack.repository.user.UserRepository;
import com.assettrack.security.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

/**
 * Service layer for asset search and condition reporting.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AssetService implements IAssetService {

    private final AssetRepository assetRepository;
    private final ConditionReportRepository conditionReportRepository;
    private final AssetAllocationRepository assetAllocationRepository;
    private final UserRepository userRepository;
    private final AssetMapper assetMapper;
    private final SecurityUtils securityUtils;
    private final UserMapper userMapper;
    // ──────────────────────────── Asset Search ────────────────────────────

    /**
     * Dynamic asset search using JPA Specifications.
     * All parameters are optional; {@code null} values are ignored.
     *
     * @param status       filter by asset status
     * @param type         filter by asset type
     * @param brand        filter by brand (case-insensitive partial match)
     * @param serialNumber filter by exact serial number
     * @param pageable     pagination and sorting
     * @return page of matching assets
     */
    @Transactional(readOnly = true)
    public Page<AssetResponse> searchAssets(AssetStatus status, AssetType type,
            String brand, String serialNumber,
            Pageable pageable) {
        Specification<Asset> spec = Specification
                .where(AssetSpecifications.hasStatus(status))
                .and(AssetSpecifications.hasType(type))
                .and(AssetSpecifications.hasBrand(brand))
                .and(AssetSpecifications.hasSerialNumber(serialNumber));

        return assetRepository.findAll(spec, pageable).map(assetMapper::toResponse);
    }

    // ──────────────────────── Condition Reports ──────────────────────────

    /**
     * Creates a condition report for an asset.
     * The reporter is automatically derived from the current JWT.
     */
    @Transactional
    public ConditionReportResponse createConditionReport(CreateConditionReportRequest request,
            Authentication authentication) {
        return createConditionReport(request.getAssetId(), request.getDescription(), request.getSeverity(),
                authentication);
    }

    /**
     * Creates a condition report for an asset.
     * Managers and admins can report on any asset; regular users must currently own
     * it.
     */
    @Transactional
    public ConditionReportResponse createConditionReport(java.util.UUID assetId,
            String description,
            ConditionSeverity severity,
            Authentication authentication) {
        if (assetId == null) {
            throw new ResourceNotFoundException("Asset not found with id: null");
        }
        java.util.UUID userId = securityUtils.getCurrentUserId(authentication);

        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Asset not found with id: " + assetId));

        User reporter = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with id: " + userId));

        ensureCanSubmitConditionReport(asset.getId(), userId, authentication);

        ConditionReport report = ConditionReport.builder()
                .asset(asset)
                .reportedBy(reporter)
                .issueDescription(description)
                .reportDate(LocalDateTime.now())
                .severity(severity)
                .status(ConditionReportStatus.OPEN)
                .build();

        return assetMapper.toResponse(conditionReportRepository.save(report));
    }

    /**
     * Returns all condition reports visible to the current user.
     */
    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<ConditionReportResponse> getConditionReports(Authentication authentication, org.springframework.data.domain.Pageable pageable) {
        java.util.UUID userId = securityUtils.getCurrentUserId(authentication);
        org.springframework.data.domain.Page<ConditionReport> reports = securityUtils.isManagerOrAdmin(authentication)
                ? conditionReportRepository.findAllByOrderByReportDateDesc(pageable)
                : conditionReportRepository.findByReportedByIdOrderByReportDateDesc(userId, pageable);

        return reports.map(assetMapper::toResponse);
    }

    /**
     * Returns all condition reports for a specific asset, newest first.
     */
    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<ConditionReportResponse> getReportsByAsset(java.util.UUID assetId,
            Authentication authentication, org.springframework.data.domain.Pageable pageable) {
        if (!assetRepository.existsById(assetId)) {
            throw new ResourceNotFoundException("Asset not found with id: " + assetId);
        }

        java.util.UUID userId = securityUtils.getCurrentUserId(authentication);
        org.springframework.data.domain.Page<ConditionReport> reports = securityUtils.isManagerOrAdmin(authentication)
                ? conditionReportRepository.findByAssetIdOrderByReportDateDesc(assetId, pageable)
                : conditionReportRepository.findByAssetIdAndReportedByIdOrderByReportDateDesc(assetId, userId, pageable);

        return reports.map(assetMapper::toResponse);
    }

    /**
     * Returns a single condition report by ID.
     */
    @Transactional(readOnly = true)
    public ConditionReportResponse getReportById(java.util.UUID reportId,
            Authentication authentication) {
        ConditionReport report = conditionReportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Condition report not found with id: " + reportId));
        ensureCanViewConditionReport(report, authentication);
        return assetMapper.toResponse(report);
    }

    /**
     * Resolves an open condition report.
     */
    @Transactional
    public ConditionReportResponse resolveReport(java.util.UUID reportId) {
        ConditionReport report = conditionReportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Condition report not found with id: " + reportId));
        report.setStatus(ConditionReportStatus.RESOLVED);
        report.setUpdatedAt(LocalDateTime.now());
        return assetMapper.toResponse(conditionReportRepository.save(report));
    }

    @Transactional
    public AssetResponse registerAsset(CreateAssetRequest request) {
        log.info("Registering asset: {}", request);
        if (assetRepository.existsBySerialNumber(request.getSerialNumber())) {
            log.warn("Asset already registered");
            throw new DuplicateSerialNumberException("Asset already registered");
        }
        Asset asset = Asset.builder()
                .type(request.getType())
                .brand(request.getBrand())
                .model(request.getModel())
                .serialNumber(request.getSerialNumber())
                .status(AssetStatus.AVAILABLE)
                .warrantyExpirationDate(request.getWarrantyExpirationDate())
                .purchaseDate(request.getPurchaseDate())
                .createdAt(LocalDateTime.now())
                .build();
        log.info("Saving asset: {}", asset);
        return assetMapper.toResponse(assetRepository.save(asset));
    }

    @Transactional(readOnly = true)
    public AssetResponse getAssetById(UUID id) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with id: " + id));
        AssetResponse response = assetMapper.toResponse(asset);

        return response;
    }

    @Transactional
    public AssetResponse updateAsset(UUID id, UpdateAssetRequest request) {
        log.info("Updating asset with id {}: {}", id, request);
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with id: " + id));

        if (request.getSerialNumber() != null
                && !request.getSerialNumber().equals(asset.getSerialNumber())
                && assetRepository.existsBySerialNumber(request.getSerialNumber())) {
            log.warn("Asset with serial number {} already exists", request.getSerialNumber());
            throw new DuplicateSerialNumberException(
                    "Asset with serial number " + request.getSerialNumber() + " already exists");
        }
        assetMapper.updateAssetFromRequest(request, asset);
        return assetMapper.toResponse(assetRepository.save(asset));
    }

    @Transactional
    public void deleteAsset(UUID id) {
        log.info("Deleting asset with id {}", id);
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with id: " + id));
        if (asset.getStatus() != AssetStatus.AVAILABLE) {
            log.warn("Asset is currently allocated");
            throw new ConflictException("Asset cannot be deleted because its status is: " + asset.getStatus());
        }
        assetRepository.deleteById(id);
    }

    @Transactional
    public void expireWarrantiedAssets() {
        int count = assetRepository.markExpiredAssets(LocalDate.now());
        log.info("Marked {} assets as expired", count);
    }

    private void ensureCanSubmitConditionReport(java.util.UUID assetId, java.util.UUID userId,
            Authentication authentication) {
        if (securityUtils.isManagerOrAdmin(authentication)) {
            return;
        }

        boolean ownsAsset = assetAllocationRepository.existsByAssetIdAndUserIdAndReturnDateIsNull(assetId, userId);
        if (!ownsAsset) {
            throw new SelfOperationException(
                    "You can only submit condition reports for assets currently assigned to you");
        }
    }

    private void ensureCanViewConditionReport(ConditionReport report, Authentication authentication) {
        if (securityUtils.isManagerOrAdmin(authentication)) {
            return;
        }

        java.util.UUID userId = securityUtils.getCurrentUserId(authentication);
        if (!report.getReportedBy().getId().equals(userId)) {
            throw new SelfOperationException("You can only view your own condition reports");
        }
    }

    // GET /assets
    @Transactional(readOnly = true)
    public Page<AssetResponse> listAssets(AssetStatus status, AssetType type,
                                          Integer warrantyExpiringWithinDays, Boolean warrantyExpired,
                                          Pageable pageable) {

        Specification<Asset> spec = Specification
                .where(AssetSpecifications.hasStatus(status))
                .and(AssetSpecifications.hasType(type));

        if (Boolean.TRUE.equals(warrantyExpired)) {
            spec = spec.and(AssetSpecifications.warrantyExpired(LocalDate.now()));
        } else if (warrantyExpiringWithinDays != null) {
            LocalDate cutoff = LocalDate.now().plusDays(warrantyExpiringWithinDays);
            spec = spec.and(AssetSpecifications.warrantyExpiringBefore(cutoff));
        }

        return assetRepository.findAll(spec, pageable).map(assetMapper::toResponse);
    }

    // GET /users/{userId}/assets
    @Transactional(readOnly = true)
    public Page<AssetResponse> getAssetsForUser(UUID userId, Pageable pageable) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }
        return assetAllocationRepository
                .findByUserIdAndReturnDateIsNull(userId, pageable)
                .map(allocation -> assetMapper.toResponse(allocation.getAsset()));
    }

    // GET /dashboard/expiring-warranties
    @Transactional(readOnly = true)
    public Page<ExpiringAssetSummary> getExpiringWarranties(int withinDays, Pageable pageable) {
        LocalDate today = LocalDate.now();
        LocalDate cutoff = today.plusDays(withinDays);

        // fetch assets expiring on or before cutoff (includes already expired)
        Page<Asset> assets = assetRepository.findByWarrantyExpirationDateLessThanEqualOrderByWarrantyExpirationDateAsc(
                cutoff, pageable);

        return assets.map(asset -> {
            int daysLeft = (int) ChronoUnit.DAYS.between(today, asset.getWarrantyExpirationDate());
            UserSummary currentOwner = resolveCurrentOwner(asset);
            ExpiringAssetSummary.SuggestedAction action = suggestAction(asset, daysLeft);

            return new ExpiringAssetSummary(
                    asset.getId(),
                    asset.getSerialNumber(),
                    asset.getBrand(),
                    asset.getModel(),
                    asset.getType(),
                    asset.getWarrantyExpirationDate(),
                    daysLeft,
                    currentOwner,
                    action
            );
        });
    }

    // PATCH /assets/{assetId}/condition-reports/{reportId}
    @Transactional
    public ConditionReportResponse updateConditionReport(UUID reportId,
                                                         UpdateConditionReportRequest request) {
        ConditionReport report = conditionReportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Condition report not found with id: " + reportId));

        if (request.status() != null) {
            report.setStatus(request.status());
        }
        if (request.resolutionNotes() != null) {
            report.setResolutionNotes(request.resolutionNotes());
        }
        report.setUpdatedAt(LocalDateTime.now());

        return assetMapper.toResponse(conditionReportRepository.save(report));
    }

// ── private helpers for getExpiringWarranties ─────────────────────────────────

    private UserSummary resolveCurrentOwner(Asset asset) {
        return assetAllocationRepository
                .findByAssetIdAndReturnDateIsNull(asset.getId())
                .map(a -> userMapper.toSummary(a.getUser()))
                .orElse(null);
    }

    private ExpiringAssetSummary.SuggestedAction suggestAction(Asset asset, int daysLeft) {
        if (asset.getStatus() == AssetStatus.DECOMMISSIONED) {
            return ExpiringAssetSummary.SuggestedAction.REVIEW;
        }
        if (daysLeft < 0) {
            return asset.getStatus() == AssetStatus.ALLOCATED
                    ? ExpiringAssetSummary.SuggestedAction.REASSIGN_AS_SPARE
                    : ExpiringAssetSummary.SuggestedAction.DECOMMISSION;
        }
        return daysLeft <= 30
                ? ExpiringAssetSummary.SuggestedAction.RENEW_WARRANTY
                : ExpiringAssetSummary.SuggestedAction.REVIEW;
    }
}
