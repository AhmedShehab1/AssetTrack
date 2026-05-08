package com.assettrack.service.asset;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class WarrantySchedulerTest {

    @Mock
    private IAssetService assetService;

    @InjectMocks
    private WarrantyScheduler warrantyScheduler;

    @Test
    void checkWarrantyExpirations_delegatesToAssetService() {
        warrantyScheduler.checkWarrantyExpirations();

        verify(assetService).expireWarrantiedAssets();
    }

    @Test
    void checkWarrantyExpirations_swallowsServiceExceptions() {
        doThrow(new RuntimeException("boom")).when(assetService).expireWarrantiedAssets();

        assertThatCode(() -> warrantyScheduler.checkWarrantyExpirations())
                .doesNotThrowAnyException();

        verify(assetService).expireWarrantiedAssets();
    }
}