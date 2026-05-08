import os
import re

filepath = 'src/test/java/com/assettrack/service/asset/AssetServiceTest.java'
if os.path.exists(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Replace .assetId(assetId) with .asset(AssetResponse.builder().id(assetId).build())
    content = content.replace('.assetId(', '.asset(com.assettrack.dto.asset.AssetResponse.builder().id(')
    content = re.sub(r'\.asset\(com\.assettrack\.dto\.asset\.AssetResponse\.builder\(\)\.id\(([^)]+)\)\)', r'.asset(com.assettrack.dto.asset.AssetResponse.builder().id(\1).build())', content)
    
    # Replace .reportedById(userId) with .reportedBy(UserResponse.builder().id(userId).build())
    # Note: UserResponse doesn't have @Builder!
    # UserResponse has @AllArgsConstructor: UserResponse(UUID id, String email, String role, boolean isActive, LocalDateTime createdAt, LocalDateTime updatedAt, String fullName)
    # Since it doesn't have builder, let's just use new UserResponse() and setters, or the AllArgsConstructor.
    # Actually, the easiest is to just let compilation fail and see. Or fix it properly:
    # We can add @Builder to UserResponse.
    
    with open(filepath, 'w') as f:
        f.write(content)
