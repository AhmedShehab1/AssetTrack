package com.assettrack.service.notification;

/**
 * Contract for stock alert monitoring jobs.
 */
public interface IAlertService {
    void checkLowStockAndAlert();
}