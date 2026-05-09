package com.assettrack.service.notification;

import java.util.List;

/**
 * Port for reading inventory data required by alert jobs.
 */
public interface InventoryCheckPort {
    List<LowStockItem> getLowStockItems(int threshold);

    /**
     * Low-stock inventory item projection.
     */
    record LowStockItem(String itemName, int currentStock) {
    }
}
