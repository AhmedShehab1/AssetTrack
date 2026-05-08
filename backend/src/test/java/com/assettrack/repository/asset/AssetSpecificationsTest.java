package com.assettrack.repository.asset;

import com.assettrack.domain.asset.Asset;
import com.assettrack.domain.asset.AssetStatus;
import com.assettrack.domain.asset.AssetType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class AssetSpecificationsTest {

    @Autowired
    private AssetRepository assetRepository;

    @BeforeEach
    void setUp() {
        assetRepository.save(Asset.builder()
                .type(AssetType.LAPTOP).brand("Dell").model("Latitude 5540")
                .serialNumber("SN-SPEC-001").status(AssetStatus.AVAILABLE)
                .purchaseDate(LocalDate.of(2025, 1, 1))
                .build());

        assetRepository.save(Asset.builder()
                .type(AssetType.LAPTOP).brand("Apple").model("MacBook Pro 16")
                .serialNumber("SN-SPEC-002").status(AssetStatus.ALLOCATED)
                .purchaseDate(LocalDate.of(2025, 2, 1))
                .build());

        assetRepository.save(Asset.builder()
                .type(AssetType.MONITOR).brand("Dell").model("U2723QE")
                .serialNumber("SN-SPEC-003").status(AssetStatus.AVAILABLE)
                .purchaseDate(LocalDate.of(2025, 3, 1))
                .build());

        assetRepository.save(Asset.builder()
                .type(AssetType.OTHER).brand("Logitech").model("MX Master 3")
                .serialNumber("SN-SPEC-004").status(AssetStatus.EXPIRED)
                .purchaseDate(LocalDate.of(2023, 6, 1))
                .build());
    }

    @Test
    void hasStatus_FiltersCorrectly() {
        Specification<Asset> spec = AssetSpecifications.hasStatus(AssetStatus.AVAILABLE);
        Page<Asset> results = assetRepository.findAll(spec, PageRequest.of(0, 10));

        assertThat(results.getContent()).hasSize(2);
        assertThat(results.getContent()).allMatch(a -> a.getStatus() == AssetStatus.AVAILABLE);
    }

    @Test
    void hasType_FiltersCorrectly() {
        Specification<Asset> spec = AssetSpecifications.hasType(AssetType.LAPTOP);
        Page<Asset> results = assetRepository.findAll(spec, PageRequest.of(0, 10));

        assertThat(results.getContent()).hasSize(2);
        assertThat(results.getContent()).allMatch(a -> a.getType() == AssetType.LAPTOP);
    }

    @Test
    void hasBrand_CaseInsensitivePartialMatch() {
        Specification<Asset> spec = AssetSpecifications.hasBrand("dell");
        Page<Asset> results = assetRepository.findAll(spec, PageRequest.of(0, 10));

        assertThat(results.getContent()).hasSize(2);
        assertThat(results.getContent()).allMatch(a -> a.getBrand().equalsIgnoreCase("Dell"));
    }

    @Test
    void hasSerialNumber_ExactMatch() {
        Specification<Asset> spec = AssetSpecifications.hasSerialNumber("SN-SPEC-002");
        Page<Asset> results = assetRepository.findAll(spec, PageRequest.of(0, 10));

        assertThat(results.getContent()).hasSize(1);
        assertThat(results.getContent().get(0).getBrand()).isEqualTo("Apple");
    }

    @Test
    void combinedFilters_StatusAndType() {
        Specification<Asset> spec = Specification
                .where(AssetSpecifications.hasStatus(AssetStatus.AVAILABLE))
                .and(AssetSpecifications.hasType(AssetType.LAPTOP));

        Page<Asset> results = assetRepository.findAll(spec, PageRequest.of(0, 10));

        assertThat(results.getContent()).hasSize(1);
        assertThat(results.getContent().get(0).getBrand()).isEqualTo("Dell");
        assertThat(results.getContent().get(0).getSerialNumber()).isEqualTo("SN-SPEC-001");
    }

    @Test
    void combinedFilters_BrandAndStatus() {
        Specification<Asset> spec = Specification
                .where(AssetSpecifications.hasBrand("Dell"))
                .and(AssetSpecifications.hasStatus(AssetStatus.AVAILABLE));

        Page<Asset> results = assetRepository.findAll(spec, PageRequest.of(0, 10));

        assertThat(results.getContent()).hasSize(2);
    }

    @Test
    void combinedFilters_AllFilters() {
        Specification<Asset> spec = Specification
                .where(AssetSpecifications.hasStatus(AssetStatus.AVAILABLE))
                .and(AssetSpecifications.hasType(AssetType.MONITOR))
                .and(AssetSpecifications.hasBrand("dell"))
                .and(AssetSpecifications.hasSerialNumber("SN-SPEC-003"));

        Page<Asset> results = assetRepository.findAll(spec, PageRequest.of(0, 10));

        assertThat(results.getContent()).hasSize(1);
        assertThat(results.getContent().get(0).getModel()).isEqualTo("U2723QE");
    }

    @Test
    void nullFilters_ReturnAllAssets() {
        Specification<Asset> spec = Specification
                .where(AssetSpecifications.hasStatus(null))
                .and(AssetSpecifications.hasType(null))
                .and(AssetSpecifications.hasBrand(null))
                .and(AssetSpecifications.hasSerialNumber(null));

        Page<Asset> results = assetRepository.findAll(spec, PageRequest.of(0, 10));

        assertThat(results.getContent()).hasSize(4);
    }

    @Test
    void noMatchingResults_ReturnsEmptyPage() {
        Specification<Asset> spec = Specification
                .where(AssetSpecifications.hasBrand("NonExistentBrand"));

        Page<Asset> results = assetRepository.findAll(spec, PageRequest.of(0, 10));

        assertThat(results.getContent()).isEmpty();
        assertThat(results.getTotalElements()).isZero();
    }
}
