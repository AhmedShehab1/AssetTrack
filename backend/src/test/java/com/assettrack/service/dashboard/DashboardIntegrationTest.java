package com.assettrack.service.dashboard;

import com.assettrack.domain.asset.Asset;
import com.assettrack.domain.asset.AssetStatus;
import com.assettrack.domain.asset.AssetType;
import com.assettrack.dto.dashboard.DashboardSummaryDto;
import com.assettrack.exception.ResourceNotFoundException;
import com.assettrack.repository.asset.AssetRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1",
    "spring.datasource.driverClassName=org.h2.Driver",
    "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect"
})
@ActiveProfiles("test")
public class DashboardIntegrationTest {

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private AssetRepository assetRepository;

    @BeforeEach
    void setUp() {
        assetRepository.deleteAll();
    }

    @Test
    void testDashboardSummaryAggregation() {
        assetRepository.save(Asset.builder().type(AssetType.LAPTOP).status(AssetStatus.AVAILABLE).build());
        assetRepository.save(Asset.builder().type(AssetType.LAPTOP).status(AssetStatus.ALLOCATED).build());
        assetRepository.save(Asset.builder().type(AssetType.MONITOR).status(AssetStatus.AVAILABLE).build());

        DashboardSummaryDto summary = dashboardService.getSummary();

        assertThat(summary.getTotalAssets()).isEqualTo(3L);
        assertThat(summary.getStatusDistribution()).containsEntry("AVAILABLE", 2L).containsEntry("ALLOCATED", 1L);
        assertThat(summary.getTypeDistribution()).containsEntry("LAPTOP", 2L).containsEntry("MONITOR", 1L);
    }

    @Test
    void testGetQuickSpareLaptop_Found() {
        Asset laptop1 = Asset.builder().type(AssetType.LAPTOP).status(AssetStatus.AVAILABLE).build();
        Asset laptop2 = Asset.builder().type(AssetType.LAPTOP).status(AssetStatus.AVAILABLE).build();
        
        assetRepository.save(laptop1);
        assetRepository.save(laptop2);

        Asset found = dashboardService.getQuickSpareLaptop();
        assertThat(found).isNotNull();
        assertThat(found.getType()).isEqualTo(AssetType.LAPTOP);
        assertThat(found.getStatus()).isEqualTo(AssetStatus.AVAILABLE);
    }

    @Test
    void testGetQuickSpareLaptop_NotFound() {
        assetRepository.save(Asset.builder().type(AssetType.LAPTOP).status(AssetStatus.ALLOCATED).build());
        assetRepository.save(Asset.builder().type(AssetType.MONITOR).status(AssetStatus.AVAILABLE).build());

        assertThatThrownBy(() -> dashboardService.getQuickSpareLaptop())
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
