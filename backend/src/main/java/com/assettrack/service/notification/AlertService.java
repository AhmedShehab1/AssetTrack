package com.assettrack.service.notification;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlertService {

    private final EmailNotificationService emailNotificationService;
    private final InventoryCheckPort inventoryCheckPort;

    @Scheduled(cron = "0 0 0 * * ?") // Daily at midnight
    public void checkLowStockAndAlert() {
        log.info("Running low stock check...");
        List<InventoryCheckPort.LowStockItem> lowStockItems = inventoryCheckPort.getLowStockItems(5);
        
        if (!lowStockItems.isEmpty()) {
            StringBuilder htmlBody = new StringBuilder("<h3>Low Stock Alert</h3><ul>");
            for (InventoryCheckPort.LowStockItem item : lowStockItems) {
                htmlBody.append("<li>").append(item.itemName())
                        .append(": ").append(item.currentStock()).append(" units left</li>");
            }
            htmlBody.append("</ul>");
            
            emailNotificationService.sendEmail("admin@assettrack.com", "Low Stock Alert", htmlBody.toString(), true);
        }
    }
}
