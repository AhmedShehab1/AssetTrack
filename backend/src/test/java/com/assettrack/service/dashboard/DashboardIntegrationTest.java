package com.assettrack.service.dashboard;

import com.assettrack.domain.asset.Asset;
import com.assettrack.domain.asset.AssetStatus;
import com.assettrack.domain.asset.AssetType;
import com.assettrack.dto.dashboard.DashboardSummaryDto;
import com.assettrack.dto.dashboard.QuickSpareAssetDto;
import com.assettrack.exception.ResourceNotFoundException;
import com.assettrack.repository.asset.AssetRepository;
import com.nimbusds.jose.jwk.JWK;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.test.context.ActiveProfiles;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1",
    "spring.datasource.driverClassName=org.h2.Driver",
    "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
    "spring.main.allow-bean-definition-overriding=true"
})
@ActiveProfiles("test")
public class DashboardIntegrationTest {

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private AssetRepository assetRepository;

    @TestConfiguration
    static class TestRsaKeyConfig {

        private static final KeyPair KEY_PAIR;

        static {
            try {
                KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
                generator.initialize(2048);
                KEY_PAIR = generator.generateKeyPair();
            } catch (Exception e) {
                throw new RuntimeException("Failed to generate test RSA key pair", e);
            }
        }

        @Bean
        public RSAPublicKey publicKey() {
            return (RSAPublicKey) KEY_PAIR.getPublic();
        }

        @Bean
        public RSAPrivateKey privateKey() {
            return (RSAPrivateKey) KEY_PAIR.getPrivate();
        }

        @Bean
        public JwtEncoder jwtEncoder(RSAPublicKey publicKey, RSAPrivateKey privateKey) {
            JWK jwk = new RSAKey.Builder(publicKey).privateKey(privateKey).build();
            return new NimbusJwtEncoder(new ImmutableJWKSet<>(new JWKSet(jwk)));
        }

        @Bean
        public JwtDecoder jwtDecoder(RSAPublicKey publicKey) {
            return NimbusJwtDecoder.withPublicKey(publicKey).build();
        }
    }

    @BeforeEach
    void setUp() {
        assetRepository.deleteAll();
    }

    @Test
    void testDashboardSummaryAggregation() {
        assetRepository.save(Asset.builder().type(AssetType.LAPTOP).status(AssetStatus.AVAILABLE).build());
        assetRepository.save(Asset.builder().type(AssetType.LAPTOP).status(AssetStatus.ALLOCATED).build());
        assetRepository.save(Asset.builder().type(AssetType.SCREEN).status(AssetStatus.AVAILABLE).build());

        DashboardSummaryDto summary = dashboardService.getSummary();

        assertThat(summary.getTotalAssets()).isEqualTo(3L);

        List<String> statusLabels = summary.getStatusDistribution().getLabels();
        List<Long> statusData = summary.getStatusDistribution().getData();
        assertThat(statusLabels).containsExactly("AVAILABLE", "ALLOCATED", "EXPIRED");
        assertThat(statusData.get(statusLabels.indexOf("AVAILABLE"))).isEqualTo(2L);
        assertThat(statusData.get(statusLabels.indexOf("ALLOCATED"))).isEqualTo(1L);
        assertThat(statusData.get(statusLabels.indexOf("EXPIRED"))).isEqualTo(0L);

        List<String> typeLabels = summary.getTypeDistribution().getLabels();
        List<Long> typeData = summary.getTypeDistribution().getData();
        assertThat(typeLabels).containsExactly("LAPTOP", "SCREEN", "ACCESSORY");
        assertThat(typeData.get(typeLabels.indexOf("LAPTOP"))).isEqualTo(2L);
        assertThat(typeData.get(typeLabels.indexOf("SCREEN"))).isEqualTo(1L);
        assertThat(typeData.get(typeLabels.indexOf("ACCESSORY"))).isEqualTo(0L);
    }

    @Test
    void testGetQuickSpareLaptop_Found() {
        Asset laptop1 = Asset.builder().type(AssetType.LAPTOP).status(AssetStatus.AVAILABLE).build();
        Asset laptop2 = Asset.builder().type(AssetType.LAPTOP).status(AssetStatus.AVAILABLE).build();
        
        assetRepository.save(laptop1);
        assetRepository.save(laptop2);

        QuickSpareAssetDto found = dashboardService.getQuickSpareLaptop();
        assertThat(found).isNotNull();
        assertThat(found.getType()).isEqualTo("LAPTOP");
        assertThat(found.getStatus()).isEqualTo("AVAILABLE");
    }

    @Test
    void testGetQuickSpareLaptop_NotFound() {
        assetRepository.save(Asset.builder().type(AssetType.LAPTOP).status(AssetStatus.ALLOCATED).build());
        assetRepository.save(Asset.builder().type(AssetType.SCREEN).status(AssetStatus.AVAILABLE).build());

        assertThatThrownBy(() -> dashboardService.getQuickSpareLaptop())
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
