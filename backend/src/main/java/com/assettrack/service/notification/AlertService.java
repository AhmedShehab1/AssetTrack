package com.assettrack.service.notification;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlertService {

    private final EmailNotificationService emailNotificationService;
    private final InventoryCheckPort inventoryCheckPort;

    @Value("${alerts.low-stock-threshold:5}")
    private int lowStockThreshold;

    @Value("${alerts.recipient-email:admin@assettrack.com}")
    private String recipientEmail;

    @Scheduled(cron = "0 0 0 * * ?") // Daily at midnight
    public void checkLowStockAndAlert() {
        log.info("Running low stock check...");
        List<InventoryCheckPort.LowStockItem> lowStockItems = inventoryCheckPort.getLowStockItems(lowStockThreshold);
        
        if (!lowStockItems.isEmpty()) {
            StringBuilder htmlBody = new StringBuilder("<h3>Low Stock Alert</h3><ul>");
            for (InventoryCheckPort.LowStockItem item : lowStockItems) {
                htmlBody.append("<li>").append(HtmlUtils.htmlEscape(item.itemName()))
                        .append(": ").append(item.currentStock()).append(" units left</li>");
            }
            htmlBody.append("</ul>");
            
            emailNotificationService.sendEmail(recipientEmail, "Low Stock Alert", htmlBody.toString(), true);
        }
    }
}
