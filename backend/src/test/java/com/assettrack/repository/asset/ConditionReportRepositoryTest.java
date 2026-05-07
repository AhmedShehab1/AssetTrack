package com.assettrack.repository.asset;

import com.assettrack.domain.asset.Asset;
import com.assettrack.domain.asset.AssetStatus;
import com.assettrack.domain.asset.AssetType;
import com.assettrack.domain.asset.ConditionReport;
import com.assettrack.domain.asset.ReportStatus;
import com.assettrack.domain.user.Role;
import com.assettrack.domain.user.User;
import com.assettrack.repository.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class ConditionReportRepositoryTest {

    @Autowired
    private ConditionReportRepository reportRepository;

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private UserRepository userRepository;

    private Asset testAsset;
    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = userRepository.save(User.builder()
                .email("reporter@assettrack.com")
                .passwordHash("$2a$12$hashed_password")
                .role(Role.DEVELOPER)
                .build());

        testAsset = assetRepository.save(Asset.builder()
                .type(AssetType.LAPTOP)
                .brand("Dell")
                .model("Latitude 5540")
                .serialNumber("SN-CR-001")
                .purchaseDate(LocalDate.of(2025, 1, 1))
                .status(AssetStatus.ALLOCATED)
                .build());
    }

    @Test
    void save_ConditionReport_PersistsCorrectly() {
        ConditionReport report = ConditionReport.builder()
                .asset(testAsset)
                .reportedBy(testUser)
                .issueDescription("Screen flickering under load")
                .reportDate(LocalDate.of(2025, 5, 1))
                .status(ReportStatus.OPEN)
                .build();

        ConditionReport saved = reportRepository.save(report);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getAsset().getId()).isEqualTo(testAsset.getId());
        assertThat(saved.getReportedBy().getId()).isEqualTo(testUser.getId());
        assertThat(saved.getIssueDescription()).isEqualTo("Screen flickering under load");
        assertThat(saved.getStatus()).isEqualTo(ReportStatus.OPEN);
    }

    @Test
    void findByAssetIdOrderByReportDateDesc_ReturnsReportsNewestFirst() {
        reportRepository.save(ConditionReport.builder()
                .asset(testAsset).reportedBy(testUser)
                .issueDescription("Old issue")
                .reportDate(LocalDate.of(2025, 1, 1))
                .build());

        reportRepository.save(ConditionReport.builder()
                .asset(testAsset).reportedBy(testUser)
                .issueDescription("Recent issue")
                .reportDate(LocalDate.of(2025, 5, 1))
                .build());

        List<ConditionReport> reports =
                reportRepository.findByAssetIdOrderByReportDateDesc(testAsset.getId());

        assertThat(reports).hasSize(2);
        assertThat(reports.get(0).getReportDate()).isAfter(reports.get(1).getReportDate());
        assertThat(reports.get(0).getIssueDescription()).isEqualTo("Recent issue");
    }

    @Test
    void findByReportedByIdOrderByReportDateDesc_ReturnsUserReports() {
        reportRepository.save(ConditionReport.builder()
                .asset(testAsset).reportedBy(testUser)
                .issueDescription("Keyboard malfunction")
                .reportDate(LocalDate.now())
                .build());

        List<ConditionReport> reports =
                reportRepository.findByReportedByIdOrderByReportDateDesc(testUser.getId());

        assertThat(reports).hasSize(1);
        assertThat(reports.get(0).getReportedBy().getEmail()).isEqualTo("reporter@assettrack.com");
    }

    @Test
    void findByStatus_FiltersCorrectly() {
        reportRepository.save(ConditionReport.builder()
                .asset(testAsset).reportedBy(testUser)
                .issueDescription("Open issue")
                .reportDate(LocalDate.now())
                .status(ReportStatus.OPEN)
                .build());

        reportRepository.save(ConditionReport.builder()
                .asset(testAsset).reportedBy(testUser)
                .issueDescription("Resolved issue")
                .reportDate(LocalDate.now())
                .status(ReportStatus.RESOLVED)
                .build());

        List<ConditionReport> openReports = reportRepository.findByStatus(ReportStatus.OPEN);
        List<ConditionReport> resolvedReports = reportRepository.findByStatus(ReportStatus.RESOLVED);

        assertThat(openReports).hasSize(1);
        assertThat(openReports.get(0).getIssueDescription()).isEqualTo("Open issue");
        assertThat(resolvedReports).hasSize(1);
        assertThat(resolvedReports.get(0).getIssueDescription()).isEqualTo("Resolved issue");
    }

    @Test
    void conditionReport_MapsToCorrectAssetAndUser() {
        ConditionReport report = reportRepository.save(ConditionReport.builder()
                .asset(testAsset).reportedBy(testUser)
                .issueDescription("Battery drain issue")
                .reportDate(LocalDate.now())
                .build());

        ConditionReport found = reportRepository.findById(report.getId()).orElseThrow();

        assertThat(found.getAsset().getSerialNumber()).isEqualTo("SN-CR-001");
        assertThat(found.getAsset().getBrand()).isEqualTo("Dell");
        assertThat(found.getReportedBy().getEmail()).isEqualTo("reporter@assettrack.com");
        assertThat(found.getReportedBy().getRole()).isEqualTo(Role.DEVELOPER);
    }
}
