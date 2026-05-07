package com.assettrack.service.assets;

import com.assettrack.domain.asset.Asset;
import com.assettrack.domain.asset.AssetAllocation;
import com.assettrack.domain.asset.AssetStatus;
import com.assettrack.domain.user.User;
import com.assettrack.dto.assetallocation.AllocationHistoryDto;
import com.assettrack.dto.assetallocation.AllocationRequestDto;
import com.assettrack.dto.assetallocation.AllocationResponseDto;
import com.assettrack.exception.ConflictException;
import com.assettrack.exception.ResourceNotFoundException;
import com.assettrack.mapper.assetallocation.AllocationMapper;
import com.assettrack.repository.asset.AssetAllocationRepository;
import com.assettrack.repository.asset.AssetRepository;
import com.assettrack.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AllocationService implements IAllocationService {

    private final AssetAllocationRepository assetAllocationRepository;
    private final AssetRepository assetRepository;
    private final UserRepository userRepository;
    private final AllocationMapper allocationMapper;

    @Override
    @Transactional
    public AllocationResponseDto allocate(AllocationRequestDto dto) {
        Asset asset = assetRepository.findById(dto.getAssetId())
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with id: " + dto.getAssetId()));

        if (asset.getStatus() != AssetStatus.AVAILABLE) {
            throw new ConflictException("Asset is not available for allocation");
        }

        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + dto.getUserId()));

        AssetAllocation allocation = AssetAllocation.builder()
                .asset(asset)
                .user(user)
                .checkoutDate(LocalDateTime.now())
                .build();

        AssetAllocation savedAllocation = assetAllocationRepository.save(allocation);
        asset.setStatus(AssetStatus.ALLOCATED);
        assetRepository.save(asset);

        return allocationMapper.toResponse(savedAllocation);
    }

    @Override
    @Transactional
    public void deallocate(Long assetId) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with id: " + assetId));

        if (asset.getStatus() != AssetStatus.ALLOCATED) {
            throw new ConflictException("Asset is not currently allocated");
        }

        AssetAllocation activeAllocation = assetAllocationRepository
                .findFirstByAssetIdAndReturnDateIsNullOrderByCheckoutDateDesc(assetId)
                .orElseThrow(() -> new ResourceNotFoundException("Active allocation not found for asset id: " + assetId));

        activeAllocation.setReturnDate(LocalDateTime.now());
        assetAllocationRepository.save(activeAllocation);

        asset.setStatus(AssetStatus.AVAILABLE);
        assetRepository.save(asset);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AllocationHistoryDto> getAllocationHistory(Long assetId) {
        if (!assetRepository.existsById(assetId)) {
            throw new ResourceNotFoundException("Asset not found with id: " + assetId);
        }

        return assetAllocationRepository.findByAssetIdOrderByCheckoutDateDesc(assetId).stream()
                .map(allocationMapper::toHistoryDto)
                .toList();
    }
}
