package com.assettrack.service.asset;

import com.assettrack.domain.asset.Asset;
import com.assettrack.domain.asset.AssetStatus;
import com.assettrack.domain.asset.AssetType;
import com.assettrack.domain.asset.ConditionReport;
import com.assettrack.domain.asset.ReportStatus;
import com.assettrack.domain.user.User;
import com.assettrack.dto.asset.AssetResponse;
import com.assettrack.dto.asset.ConditionReportResponse;
import com.assettrack.dto.asset.CreateConditionReportRequest;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Service layer for asset search and condition reporting.
 */
@Service
@RequiredArgsConstructor
public class AssetService {

    private final AssetRepository assetRepository;
    private final ConditionReportRepository conditionReportRepository;
    private final AssetAllocationRepository assetAllocationRepository;
    private final UserRepository userRepository;
    private final AssetMapper assetMapper;
    private final SecurityUtils securityUtils;

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
        return createConditionReport(request.getAssetId(), request.getIssueDescription(), authentication);
    }

    /**
     * Creates a condition report for an asset.
     * Managers and admins can report on any asset; regular users must currently own it.
     */
    @Transactional
    public ConditionReportResponse createConditionReport(Long assetId,
                                                          String issueDescription,
                                                          Authentication authentication) {
        Long userId = securityUtils.getCurrentUserId(authentication);

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
                .issueDescription(issueDescription)
                .reportDate(LocalDate.now())
                .status(ReportStatus.OPEN)
                .build();

        return assetMapper.toResponse(conditionReportRepository.save(report));
    }

    /**
     * Returns all condition reports visible to the current user.
     */
    @Transactional(readOnly = true)
    public List<ConditionReportResponse> getConditionReports(Authentication authentication) {
        Long userId = securityUtils.getCurrentUserId(authentication);
        List<ConditionReport> reports = securityUtils.isManagerOrAdmin(authentication)
                ? conditionReportRepository.findAllByOrderByReportDateDesc()
                : conditionReportRepository.findByReportedByIdOrderByReportDateDesc(userId);

        return reports.stream()
                .map(assetMapper::toResponse)
                .toList();
    }

    /**
     * Returns all condition reports for a specific asset, newest first.
     */
    @Transactional(readOnly = true)
    public List<ConditionReportResponse> getReportsByAsset(Long assetId,
                                                            Authentication authentication) {
        if (!assetRepository.existsById(assetId)) {
            throw new ResourceNotFoundException("Asset not found with id: " + assetId);
        }

        Long userId = securityUtils.getCurrentUserId(authentication);
        List<ConditionReport> reports = securityUtils.isManagerOrAdmin(authentication)
                ? conditionReportRepository.findByAssetIdOrderByReportDateDesc(assetId)
                : conditionReportRepository.findByAssetIdAndReportedByIdOrderByReportDateDesc(assetId, userId);

        return reports
                .stream()
                .map(assetMapper::toResponse)
                .toList();
    }

    /**
     * Returns a single condition report by ID.
     */
    @Transactional(readOnly = true)
    public ConditionReportResponse getReportById(Long reportId,
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
    public ConditionReportResponse resolveReport(Long reportId) {
        ConditionReport report = conditionReportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Condition report not found with id: " + reportId));
        report.setStatus(ReportStatus.RESOLVED);
        return assetMapper.toResponse(conditionReportRepository.save(report));
    }

    private void ensureCanSubmitConditionReport(Long assetId, Long userId, Authentication authentication) {
        if (securityUtils.isManagerOrAdmin(authentication)) {
            return;
        }

        boolean ownsAsset = assetAllocationRepository.existsByAssetIdAndUserIdAndReturnDateIsNull(assetId, userId);
        if (!ownsAsset) {
            throw new SelfOperationException("You can only submit condition reports for assets currently assigned to you");
        }
    }

    private void ensureCanViewConditionReport(ConditionReport report, Authentication authentication) {
        if (securityUtils.isManagerOrAdmin(authentication)) {
            return;
        }

        Long userId = securityUtils.getCurrentUserId(authentication);
        if (!report.getReportedBy().getId().equals(userId)) {
            throw new SelfOperationException("You can only view your own condition reports");
        }
    }
}
