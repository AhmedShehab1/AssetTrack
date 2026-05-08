import os
import re

filepath = 'src/test/java/com/assettrack/service/asset/AssetServiceTest.java'
if os.path.exists(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Replace .reportedById(userId) with .reportedBy(UserResponse.builder().id(userId).build())
    content = content.replace('.reportedById(', '.reportedBy(com.assettrack.dto.user.UserResponse.builder().id(')
    content = re.sub(r'\.reportedBy\(com\.assettrack\.dto\.user\.UserResponse\.builder\(\)\.id\(([^)]+)\)\)', r'.reportedBy(com.assettrack.dto.user.UserResponse.builder().id(\1).build())', content)
    
    with open(filepath, 'w') as f:
        f.write(content)
