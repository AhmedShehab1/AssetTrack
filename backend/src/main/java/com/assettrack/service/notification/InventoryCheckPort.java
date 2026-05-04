package com.assettrack.service.notification;

import java.util.List;

public interface InventoryCheckPort {
    List<LowStockItem> getLowStockItems(int threshold);

    record LowStockItem(String itemName, int currentStock) {}
}
