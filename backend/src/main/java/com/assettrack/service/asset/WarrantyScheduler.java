package com.assettrack.service.asset;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class WarrantyScheduler {
    private final AssetService assetService;
    private static final Logger log = LoggerFactory.getLogger(WarrantyScheduler.class);
    @Scheduled(cron = "0 0 0 * * *")
    public void checkWarrantyExpirations() {
        try {
            assetService.expireWarrantiedAssets();
        }
        catch (Exception e) {
            log.error("Warranty expiration job failed", e);
        }
    }

}
