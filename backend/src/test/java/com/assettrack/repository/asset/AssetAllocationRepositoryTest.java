package com.assettrack.repository.asset;

import com.assettrack.domain.asset.Asset;
import com.assettrack.domain.asset.AssetAllocation;
import com.assettrack.domain.asset.AssetStatus;
import com.assettrack.domain.asset.AssetType;
import com.assettrack.domain.user.Role;
import com.assettrack.domain.user.User;
import com.assettrack.repository.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class AssetAllocationRepositoryTest {

    @Autowired
    private AssetAllocationRepository allocationRepository;

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private UserRepository userRepository;

    private Asset testAsset;
    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = userRepository.save(User.builder()
                .email("testuser@assettrack.com")
                .passwordHash("$2a$12$hashed_password")
                .role(Role.DEVELOPER)
                .build());

        testAsset = assetRepository.save(Asset.builder()
                .type(AssetType.LAPTOP)
                .brand("Apple")
                .model("MacBook Pro 16")
                .serialNumber("SN-ALLOC-001")
                .purchaseDate(LocalDate.of(2025, 3, 1))
                .warrantyExpirationDate(LocalDate.of(2028, 3, 1))
                .status(AssetStatus.ALLOCATED)
                .build());
    }

    @Test
    void save_AllocationWithAssetAndUser_PersistsCorrectly() {
        AssetAllocation allocation = AssetAllocation.builder()
                .asset(testAsset)
                .user(testUser)
                .checkoutDate(LocalDateTime.of(2025, 4, 1, 10, 0))
                .build();

        AssetAllocation saved = allocationRepository.save(allocation);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getAsset().getId()).isEqualTo(testAsset.getId());
        assertThat(saved.getUser().getId()).isEqualTo(testUser.getId());
        assertThat(saved.getCheckoutDate()).isEqualTo(LocalDateTime.of(2025, 4, 1, 10, 0));
        assertThat(saved.getReturnDate()).isNull();
    }

    @Test
    void findByAssetIdOrderByCheckoutDateDesc_ReturnsAllocationsInDescOrder() {
        AssetAllocation older = allocationRepository.save(AssetAllocation.builder()
                .asset(testAsset)
                .user(testUser)
                .checkoutDate(LocalDateTime.of(2025, 1, 1, 9, 0))
                .returnDate(LocalDateTime.of(2025, 2, 1, 17, 0))
                .build());

        AssetAllocation newer = allocationRepository.save(AssetAllocation.builder()
                .asset(testAsset)
                .user(testUser)
                .checkoutDate(LocalDateTime.of(2025, 4, 1, 9, 0))
                .build());

        List<AssetAllocation> allocations =
                allocationRepository.findByAssetIdOrderByCheckoutDateDesc(testAsset.getId());

        assertThat(allocations).hasSize(2);
        assertThat(allocations.get(0).getCheckoutDate()).isAfter(allocations.get(1).getCheckoutDate());
        assertThat(allocations.get(0).getId()).isEqualTo(newer.getId());
        assertThat(allocations.get(1).getId()).isEqualTo(older.getId());
    }

    @Test
    void findByAssetIdOrderByCheckoutDateDesc_WhenNoAllocations_ReturnsEmptyList() {
        Asset anotherAsset = assetRepository.save(Asset.builder()
                .type(AssetType.SCREEN)
                .brand("Samsung")
                .model("Odyssey G9")
                .serialNumber("SN-NO-ALLOC")
                .status(AssetStatus.AVAILABLE)
                .build());

        List<AssetAllocation> allocations =
                allocationRepository.findByAssetIdOrderByCheckoutDateDesc(anotherAsset.getId());

        assertThat(allocations).isEmpty();
    }

    @Test
    void allocation_MapsToCorrectUserAndAsset() {
        AssetAllocation allocation = allocationRepository.save(AssetAllocation.builder()
                .asset(testAsset)
                .user(testUser)
                .checkoutDate(LocalDateTime.now())
                .build());

        AssetAllocation found = allocationRepository.findById(allocation.getId()).orElseThrow();

        assertThat(found.getAsset().getSerialNumber()).isEqualTo("SN-ALLOC-001");
        assertThat(found.getAsset().getBrand()).isEqualTo("Apple");
        assertThat(found.getUser().getEmail()).isEqualTo("testuser@assettrack.com");
        assertThat(found.getUser().getRole()).isEqualTo(Role.DEVELOPER);
    }
}
