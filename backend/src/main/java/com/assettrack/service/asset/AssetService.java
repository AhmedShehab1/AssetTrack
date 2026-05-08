package com.assettrack.service.asset;

import com.assettrack.domain.asset.Asset;
import com.assettrack.domain.asset.AssetStatus;
import com.assettrack.domain.asset.AssetType;
import com.assettrack.domain.asset.ConditionReport;
import com.assettrack.domain.asset.ConditionSeverity;
import com.assettrack.domain.asset.ConditionReportStatus;
import com.assettrack.domain.user.User;
import com.assettrack.dto.asset.*;
import com.assettrack.exception.ConflictException;
import com.assettrack.exception.DuplicateSerialNumberException;
import com.assettrack.exception.ResourceNotFoundException;
import com.assettrack.exception.SelfOperationException;
import com.assettrack.mapper.asset.AssetMapper;
import com.assettrack.repository.asset.AssetAllocationRepository;
import com.assettrack.repository.asset.AssetRepository;
import com.assettrack.repository.asset.AssetSpecifications;
import com.assettrack.repository.asset.ConditionReportRepository;
import com.assettrack.repository.user.UserRepository;
import com.assettrack.security.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
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
import java.util.List;
import java.util.UUID;

/**
 * Service layer for asset search and condition reporting.
 */
@Service
@RequiredArgsConstructor
public class AssetService implements IAssetService {

    private final AssetRepository assetRepository;
    private final ConditionReportRepository conditionReportRepository;
    private final AssetAllocationRepository assetAllocationRepository;
    private final UserRepository userRepository;
    private final AssetMapper assetMapper;
    private final SecurityUtils securityUtils;
    private static final Logger log = LoggerFactory.getLogger(AssetService.class);
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
}
