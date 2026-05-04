package com.assettrack.controller.asset;

import com.assettrack.domain.asset.Asset;
import com.assettrack.service.dashboard.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
public class AssetActionController {

    private final DashboardService dashboardService;

    @GetMapping("/quick-spare")
    public ResponseEntity<Asset> getQuickSpareLaptop() {
        return ResponseEntity.ok(dashboardService.getQuickSpareLaptop());
    }
}
