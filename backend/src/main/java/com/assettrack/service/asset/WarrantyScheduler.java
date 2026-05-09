package com.assettrack.service.asset;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduled job that marks expiring warranties as expired.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class WarrantyScheduler {
    private final IAssetService assetService;

    @Scheduled(cron = "0 0 0 * * *")
    public void checkWarrantyExpirations() {
        try {
            assetService.expireWarrantiedAssets();
        } catch (Exception e) {
            log.error("Warranty expiration job failed", e);
        }
    }

}
