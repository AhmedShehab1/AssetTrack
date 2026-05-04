package com.assettrack.service.notification;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AlertServiceTest {

    @Mock
    private EmailNotificationService emailNotificationService;

    @Mock
    private InventoryCheckPort inventoryCheckPort;

    @InjectMocks
    private AlertService alertService;

    @Test
    void checkLowStockAndAlert_SendsEmail_WhenLowStock() {
        when(inventoryCheckPort.getLowStockItems(5)).thenReturn(List.of(
                new InventoryCheckPort.LowStockItem("Item 1", 2)
        ));

        alertService.checkLowStockAndAlert();

        verify(emailNotificationService).sendEmail(eq("admin@assettrack.com"), eq("Low Stock Alert"), anyString(), eq(true));
    }

    @Test
    void checkLowStockAndAlert_DoesNotSendEmail_WhenNoLowStock() {
        when(inventoryCheckPort.getLowStockItems(5)).thenReturn(List.of());

        alertService.checkLowStockAndAlert();

        verify(emailNotificationService, never()).sendEmail(anyString(), anyString(), anyString(), anyBoolean());
    }
}
