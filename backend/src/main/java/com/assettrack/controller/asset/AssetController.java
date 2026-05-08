package com.assettrack.controller.asset;

import com.assettrack.domain.asset.AssetStatus;
import com.assettrack.domain.asset.AssetType;
import com.assettrack.dto.asset.AssetResponse;
import com.assettrack.dto.asset.CreateAssetRequest;
import com.assettrack.dto.asset.UpdateAssetRequest;
import com.assettrack.service.asset.AssetService;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.UUID;

@RequestMapping("/api/assets")
@RequiredArgsConstructor
@RestController
public class AssetController {

    private final AssetService assetService;

    @GetMapping("")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<AssetResponse>> getAssets(
            @Parameter(description = "Filter by status (AVAILABLE, ALLOCATED, EXPIRED)")
            @RequestParam(required = false) AssetStatus status,
            @Parameter(description = "Filter by type (LAPTOP, SCREEN, ACCESSORY)")
            @RequestParam(required = false) AssetType type,
            @Parameter(description = "Filter by brand (case-insensitive partial match)")
            @RequestParam(required = false) String brand,
            @Parameter(description = "Filter by exact serial number")
            @RequestParam(required = false) String serialNumber,
            Pageable pageable){
        return ResponseEntity.ok(assetService.searchAssets(status, type, brand, serialNumber, pageable));
    }


    @PostMapping("")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<AssetResponse> createAsset(@RequestBody @Validated CreateAssetRequest request){
        AssetResponse response = assetService.registerAsset(request);
        URI location = URI.create("/api/assets/" + response.getId());
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AssetResponse> getAssetById(@Parameter(description = "Asset ID") @PathVariable UUID id ){
        return ResponseEntity.ok(assetService.getAssetById(id));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<AssetResponse> updateAsset(@Parameter(description = "Asset ID") @PathVariable UUID id, @RequestBody @Validated UpdateAssetRequest request){
        return ResponseEntity.ok(assetService.updateAsset(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<Void> deleteAsset(@Parameter(description = "Asset ID") @PathVariable UUID id){
        assetService.deleteAsset(id);
        return ResponseEntity.noContent().build();
    }
}
