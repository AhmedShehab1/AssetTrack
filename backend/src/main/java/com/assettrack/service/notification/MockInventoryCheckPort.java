package com.assettrack.service.notification;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
@Profile("!prod")
public class MockInventoryCheckPort implements InventoryCheckPort {
    @Override
    public List<LowStockItem> getLowStockItems(int threshold) {
        // Mock data to return items with stock < threshold
        return List.of(
            new LowStockItem("Laptop Charger", 2),
            new LowStockItem("Wireless Mouse", 4)
        );
    }
}
