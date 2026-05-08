package com.assettrack.service.allocation;

import com.assettrack.domain.asset.Asset;
import com.assettrack.domain.asset.AssetAllocation;
import com.assettrack.domain.asset.AssetStatus;
import com.assettrack.domain.user.User;
import com.assettrack.dto.allocation.AllocationHistoryDto;
import com.assettrack.dto.allocation.AllocationRequestDto;
import com.assettrack.dto.allocation.AllocationResponseDto;
import com.assettrack.exception.ConflictException;
import com.assettrack.mapper.allocation.AllocationMapper;
import com.assettrack.repository.asset.AssetAllocationRepository;
import com.assettrack.repository.asset.AssetRepository;
import com.assettrack.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import com.assettrack.exception.ResourceNotFoundException;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AllocationService implements IAllocationService {

    private final AssetRepository assetRepository;
    private final UserRepository userRepository;
    private final AssetAllocationRepository allocationRepository;
    private final AllocationMapper allocationMapper;
    private static final Logger log = LoggerFactory.getLogger(AllocationService.class);

    /**
     * Allocates an available asset to a user.
     *
     * @param dto contains the assetId and userId for the allocation
     * @return the created allocation record as a response DTO
     * @throws ResourceNotFoundException if the asset or user does not exist
     * @throws ConflictException if the asset is not in AVAILABLE status
     */
    @Transactional
    @Override
    public AllocationResponseDto allocate(AllocationRequestDto dto) {
        log.info("Allocating asset {} to user {}", dto.getAssetId(), dto.getUserId());
        Asset asset = assetRepository.findById(dto.getAssetId())
                .orElseThrow(() -> new ResourceNotFoundException("asset is not found"));
        if(AssetStatus.AVAILABLE != asset.getStatus()){
            throw new ConflictException("Asset is not available");
        }
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("user is not found"));
        asset.setStatus(AssetStatus.ALLOCATED);
        assetRepository.save(asset);
        AssetAllocation allocation = new AssetAllocation();
        allocation.setAsset(asset);
        allocation.setUser(user);
        allocation.setCheckoutDate(LocalDateTime.now());
        allocationRepository.save(allocation);
        log.info("Asset {} successfully allocated to user {}", asset.getId(), user.getId());
        return allocationMapper.toResponseDto(allocation);
    }

    /**
     * Deallocates a currently allocated asset, marking it as available.
     * Sets the returnDate on the active allocation record.
     *
     * @param assetId the ID of the asset to deallocate
     * @throws ResourceNotFoundException if the asset does not exist or
     *         no active allocation record is found
     * @throws ConflictException if the asset is not in ALLOCATED status
     */
    @Transactional
    @Override
    public void deallocate(java.util.UUID assetId) {
        log.info("Deallocating asset {}", assetId);
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new ResourceNotFoundException("asset is not found"));
        if(AssetStatus.ALLOCATED != asset.getStatus()){
            throw new ConflictException("Asset is not currently allocated");
        }
        AssetAllocation allocation = allocationRepository
                .findByAssetIdAndReturnDateIsNull(assetId)
                .orElseThrow(() -> new ResourceNotFoundException("No active allocation found for asset"));
        allocation.setReturnDate(LocalDateTime.now());
        asset.setStatus(AssetStatus.AVAILABLE);
        assetRepository.save(asset);
        allocationRepository.save(allocation);
    }

    /**
     * Retrieves the full allocation history for a specific asset,
     * ordered by checkout date descending.
     *
     * @param assetId the ID of the asset whose history is requested
     * @return list of allocation history records, empty list if never allocated
     * @throws ResourceNotFoundException if the asset does not exist
     */
    @Override
    public List<AllocationHistoryDto> getAllocationHistory(java.util.UUID assetId) {
        assetRepository.findById(assetId)
                .orElseThrow(() -> new ResourceNotFoundException("Asset is not found"));
        List<AssetAllocation> allocationList = allocationRepository.findByAssetIdOrderByCheckoutDateDesc(assetId);
        return allocationMapper.toHistoryDtoList(allocationList);
    }
}
