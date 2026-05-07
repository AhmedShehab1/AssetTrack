package com.assettrack.controller.asset;

import com.assettrack.dto.dashboard.QuickSpareAssetDto;
import com.assettrack.service.dashboard.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
@Tag(name = "Assets", description = "Asset management and lookup endpoints")
public class AssetActionController {

    private final DashboardService dashboardService;

    @GetMapping("/quick-spare")
    @Operation(summary = "Get a quick spare laptop", description = "Returns the oldest available laptop asset for quick allocation")
    @ApiResponse(responseCode = "200", description = "Spare asset found",
            content = @Content(schema = @Schema(implementation = QuickSpareAssetDto.class)))
    @ApiResponse(responseCode = "404", description = "No available spare asset")
    public ResponseEntity<QuickSpareAssetDto> getQuickSpareLaptop() {
        return ResponseEntity.ok(dashboardService.getQuickSpareLaptop());
    }
}
