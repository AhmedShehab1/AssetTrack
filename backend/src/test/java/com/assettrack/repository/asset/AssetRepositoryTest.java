package com.assettrack.repository.asset;

import com.assettrack.domain.asset.Asset;
import com.assettrack.domain.asset.AssetStatus;
import com.assettrack.domain.asset.AssetType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DataJpaTest
class AssetRepositoryTest {

    @Autowired
    private AssetRepository assetRepository;

    private Asset buildAsset(String serialNumber) {
        return Asset.builder()
                .type(AssetType.LAPTOP)
                .brand("Dell")
                .model("Latitude 5540")
                .serialNumber(serialNumber)
                .purchaseDate(LocalDate.of(2025, 1, 15))
                .warrantyExpirationDate(LocalDate.of(2028, 1, 15))
                .status(AssetStatus.AVAILABLE)
                .build();
    }

    @Test
    void findBySerialNumber_WhenAssetExists_ReturnsAsset() {
        assetRepository.save(buildAsset("SN-001"));

        Optional<Asset> result = assetRepository.findBySerialNumber("SN-001");

        assertThat(result).isPresent();
        assertThat(result.get().getSerialNumber()).isEqualTo("SN-001");
        assertThat(result.get().getBrand()).isEqualTo("Dell");
        assertThat(result.get().getModel()).isEqualTo("Latitude 5540");
    }

    @Test
    void findBySerialNumber_WhenAssetDoesNotExist_ReturnsEmpty() {
        Optional<Asset> result = assetRepository.findBySerialNumber("NONEXISTENT");

        assertThat(result).isEmpty();
    }

    @Test
    void save_DuplicateSerialNumber_ThrowsDataIntegrityViolationException() {
        assetRepository.save(buildAsset("SN-DUPLICATE"));

        assertThatThrownBy(() -> {
            assetRepository.saveAndFlush(buildAsset("SN-DUPLICATE"));
        }).isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void save_AssetWithAllFields_PersistsCorrectly() {
        Asset asset = Asset.builder()
                .type(AssetType.SCREEN)
                .brand("LG")
                .model("27UK850")
                .serialNumber("SN-SCREEN-001")
                .purchaseDate(LocalDate.of(2024, 6, 1))
                .warrantyExpirationDate(LocalDate.of(2027, 6, 1))
                .status(AssetStatus.ALLOCATED)
                .build();

        Asset saved = assetRepository.save(asset);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getType()).isEqualTo(AssetType.SCREEN);
        assertThat(saved.getBrand()).isEqualTo("LG");
        assertThat(saved.getModel()).isEqualTo("27UK850");
        assertThat(saved.getStatus()).isEqualTo(AssetStatus.ALLOCATED);
        assertThat(saved.getPurchaseDate()).isEqualTo(LocalDate.of(2024, 6, 1));
        assertThat(saved.getWarrantyExpirationDate()).isEqualTo(LocalDate.of(2027, 6, 1));
    }

    @Test
    void save_AssetWithEnumStrings_PersistsCorrectly() {
        Asset asset = buildAsset("SN-ENUM-TEST");
        asset.setStatus(AssetStatus.EXPIRED);
        asset.setType(AssetType.ACCESSORY);

        Asset saved = assetRepository.saveAndFlush(asset);

        Optional<Asset> retrieved = assetRepository.findById(saved.getId());
        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().getStatus()).isEqualTo(AssetStatus.EXPIRED);
        assertThat(retrieved.get().getType()).isEqualTo(AssetType.ACCESSORY);
    }
}
