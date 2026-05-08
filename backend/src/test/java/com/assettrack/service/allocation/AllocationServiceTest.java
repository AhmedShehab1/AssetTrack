package com.assettrack.service.allocation;

import com.assettrack.domain.asset.*;
import com.assettrack.domain.user.Role;
import com.assettrack.domain.user.User;
import com.assettrack.dto.allocation.AllocationHistoryDto;
import com.assettrack.dto.allocation.AllocationRequestDto;
import com.assettrack.dto.allocation.AllocationResponseDto;
import com.assettrack.dto.user.UserSummary;
import com.assettrack.exception.ConflictException;
import com.assettrack.exception.ResourceNotFoundException;
import com.assettrack.mapper.allocation.AllocationMapper;
import com.assettrack.repository.asset.AssetAllocationRepository;
import com.assettrack.repository.asset.AssetRepository;
import com.assettrack.repository.user.UserRepository;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AllocationService")
class AllocationServiceTest {

        @Mock
        AssetRepository assetRepository;
        @Mock
        UserRepository userRepository;
        @Mock
        AssetAllocationRepository allocationRepository;
        @Mock
        AllocationMapper allocationMapper;

        @InjectMocks
        AllocationService allocationService;

        // ── Fixtures ──────────────────────────────────────────────────────────────

        private Asset buildAsset(java.util.UUID id, AssetStatus status) {
                return Asset.builder()
                                .id(id)
                                .type(AssetType.LAPTOP)
                                .brand("Dell")
                                .model("XPS 15")
                                .serialNumber("SN-00" + id)
                                .status(status)
                                .createdAt(LocalDateTime.now())
                                .build();
        }

        private User buildUser(java.util.UUID id) {
                return User.builder()
                                .id(id)
                                .email("user" + id + "@example.com")
                                .passwordHash("hash")
                                .role(Role.DEVELOPER)
                                .isActive(true)
                                .build();
        }

        private AssetAllocation buildAllocation(java.util.UUID id, Asset asset, User user) {
                return AssetAllocation.builder()
                                .id(id)
                                .asset(asset)
                                .user(user)
                                .checkoutDate(LocalDateTime.now())
                                .build();
        }

        // ── allocate ──────────────────────────────────────────────────────────────

        @Nested
        @DisplayName("allocate")
        class Allocate {

                @Test
                @DisplayName("allocates available asset to user and returns response")
                void success() {
                        java.util.UUID testId = java.util.UUID.randomUUID();
                        Asset asset = buildAsset(testId, AssetStatus.AVAILABLE);
                        User user = buildUser(testId);
                        AssetAllocation allocation = buildAllocation(testId, asset, user);
                        AllocationResponseDto response = AllocationResponseDto.builder()
                                        .id(testId)
                                        .assetId(asset.getId())
                                        .assignedTo(UserSummary.builder().id(user.getId()).email(user.getEmail())
                                                        .role(Role.DEVELOPER).build())
                                        .allocatedAt(LocalDateTime.now())
                                        .notes("Urgent allocation")
                                        .active(true)
                                        .build();

                        AllocationRequestDto dto = AllocationRequestDto.builder()
                                        .assignedToUserId(testId)
                                        .notes("Urgent allocation")
                                        .build();

                        when(assetRepository.findById(testId)).thenReturn(Optional.of(asset));
                        when(userRepository.findById(testId)).thenReturn(Optional.of(user));
                        when(allocationRepository.save(any())).thenReturn(allocation);
                        when(allocationMapper.toResponseDto(any(AssetAllocation.class))).thenReturn(response);

                        AllocationResponseDto result = allocationService.allocate(testId, dto);

                        assertThat(result.getId()).isEqualTo(testId);
                        assertThat(asset.getStatus()).isEqualTo(AssetStatus.ALLOCATED);
                        verify(assetRepository).save(asset);
                        verify(allocationRepository).save(any(AssetAllocation.class));
                }

                @Test
                @DisplayName("throws ResourceNotFoundException when asset not found")
                void assetNotFound() {
                        java.util.UUID testId = java.util.UUID.randomUUID();
                        when(assetRepository.findById(testId)).thenReturn(Optional.empty());

                        AllocationRequestDto dto = AllocationRequestDto.builder()
                                        .assignedToUserId(testId)
                                        .build();

                        assertThatThrownBy(() -> allocationService.allocate(testId, dto))
                                        .isInstanceOf(ResourceNotFoundException.class)
                                        .hasMessageContaining("asset");
                }

                @Test
                @DisplayName("throws ConflictException when asset is not AVAILABLE")
                void assetNotAvailable() {
                        java.util.UUID testId = java.util.UUID.randomUUID();
                        Asset asset = buildAsset(testId, AssetStatus.ALLOCATED);
                        when(assetRepository.findById(testId)).thenReturn(Optional.of(asset));

                        AllocationRequestDto dto = AllocationRequestDto.builder()
                                        .assignedToUserId(testId)
                                        .build();

                        assertThatThrownBy(() -> allocationService.allocate(testId, dto))
                                        .isInstanceOf(ConflictException.class)
                                        .hasMessageContaining("not available");
                }

                @Test
                @DisplayName("throws ResourceNotFoundException when user not found")
                void userNotFound() {
                        java.util.UUID testId = java.util.UUID.randomUUID();
                        Asset asset = buildAsset(testId, AssetStatus.AVAILABLE);
                        when(assetRepository.findById(testId)).thenReturn(Optional.of(asset));
                        when(userRepository.findById(testId)).thenReturn(Optional.empty());

                        AllocationRequestDto dto = AllocationRequestDto.builder()
                                        .assignedToUserId(testId)
                                        .build();

                        assertThatThrownBy(() -> allocationService.allocate(testId, dto))
                                        .isInstanceOf(ResourceNotFoundException.class)
                                        .hasMessageContaining("user");
                }
        }

        // ── deallocate ────────────────────────────────────────────────────────────

        @Nested
        @DisplayName("deallocate")
        class Deallocate {

                @Test
                @DisplayName("sets returnDate, marks asset AVAILABLE, and saves both")
                void success() {
                        java.util.UUID testId = java.util.UUID.randomUUID();
                        Asset asset = buildAsset(testId, AssetStatus.ALLOCATED);
                        User user = buildUser(testId);
                        AssetAllocation allocation = buildAllocation(testId, asset, user);

                        when(assetRepository.findById(testId)).thenReturn(Optional.of(asset));
                        when(allocationRepository.findByAssetIdAndReturnDateIsNull(testId))
                                        .thenReturn(Optional.of(allocation));

                        allocationService.deallocate(testId);

                        assertThat(asset.getStatus()).isEqualTo(AssetStatus.AVAILABLE);
                        assertThat(allocation.getReturnDate()).isNotNull();
                        verify(assetRepository).save(asset);
                        verify(allocationRepository).save(allocation);
                }

                @Test
                @DisplayName("throws ResourceNotFoundException when asset not found")
                void assetNotFound() {
                        java.util.UUID testId = java.util.UUID.randomUUID();
                        when(assetRepository.findById(testId)).thenReturn(Optional.empty());

                        assertThatThrownBy(() -> allocationService.deallocate(testId))
                                        .isInstanceOf(ResourceNotFoundException.class);
                }

                @Test
                @DisplayName("throws ConflictException when asset is not ALLOCATED")
                void assetNotAllocated() {
                        java.util.UUID testId = java.util.UUID.randomUUID();
                        Asset asset = buildAsset(testId, AssetStatus.AVAILABLE);
                        when(assetRepository.findById(testId)).thenReturn(Optional.of(asset));

                        assertThatThrownBy(() -> allocationService.deallocate(testId))
                                        .isInstanceOf(ConflictException.class)
                                        .hasMessageContaining("not currently allocated");
                }

                @Test
                @DisplayName("throws ResourceNotFoundException when no active allocation found")
                void noActiveAllocation() {
                        java.util.UUID testId = java.util.UUID.randomUUID();
                        Asset asset = buildAsset(testId, AssetStatus.ALLOCATED);
                        when(assetRepository.findById(testId)).thenReturn(Optional.of(asset));
                        when(allocationRepository.findByAssetIdAndReturnDateIsNull(testId))
                                        .thenReturn(Optional.empty());

                        assertThatThrownBy(() -> allocationService.deallocate(testId))
                                        .isInstanceOf(ResourceNotFoundException.class)
                                        .hasMessageContaining("No active allocation");
                }
        }

        // ── getAllocationHistory ───────────────────────────────────────────────────

        @Nested
        @DisplayName("getAllocationHistory")
        class GetAllocationHistory {

                @Test
                @DisplayName("returns history list for existing asset")
                void success() {
                        java.util.UUID testId = java.util.UUID.randomUUID();
                        Asset asset = buildAsset(testId, AssetStatus.AVAILABLE);
                        User user = buildUser(testId);
                        AssetAllocation allocation = buildAllocation(testId, asset, user);
                        AllocationHistoryDto dto = AllocationHistoryDto.builder()
                                        .allocationId(testId)
                                        .assetId(asset.getId())
                                        .assetSerialNumber(asset.getSerialNumber())
                                        .assetBrand(asset.getBrand())
                                        .assetModel(asset.getModel())
                                        .assignedTo(UserSummary.builder().id(user.getId()).email("user2@example.com")
                                                        .role(Role.DEVELOPER).build())
                                        .allocatedAt(allocation.getCheckoutDate())
                                        .deallocatedAt(allocation.getReturnDate())
                                        .durationDays(0)
                                        .build();

                        when(assetRepository.findById(testId)).thenReturn(Optional.of(asset));
                        when(allocationRepository.findByAssetIdOrderByCheckoutDateDesc(testId))
                                        .thenReturn(List.of(allocation));
                        when(allocationMapper.toHistoryDtoList(List.of(allocation)))
                                        .thenReturn(List.of(dto));

                        List<AllocationHistoryDto> result = allocationService.getAllocationHistory(testId);

                        assertThat(result).hasSize(1);
                        assertThat(result.get(0).getAllocationId()).isEqualTo(testId);
                }

                @Test
                @DisplayName("returns empty list when asset has never been allocated")
                void empty() {
                        java.util.UUID testId = java.util.UUID.randomUUID();
                        Asset asset = buildAsset(testId, AssetStatus.AVAILABLE);
                        when(assetRepository.findById(testId)).thenReturn(Optional.of(asset));
                        when(allocationRepository.findByAssetIdOrderByCheckoutDateDesc(testId))
                                        .thenReturn(List.of());
                        when(allocationMapper.toHistoryDtoList(List.of())).thenReturn(List.of());

                        assertThat(allocationService.getAllocationHistory(testId)).isEmpty();
                }

                @Test
                @DisplayName("throws ResourceNotFoundException when asset not found")
                void assetNotFound() {
                        java.util.UUID testId = java.util.UUID.randomUUID();
                        when(assetRepository.findById(testId)).thenReturn(Optional.empty());

                        assertThatThrownBy(() -> allocationService.getAllocationHistory(testId))
                                        .isInstanceOf(ResourceNotFoundException.class);
                }
        }
}