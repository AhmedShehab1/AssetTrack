import os
import re

files_to_fix = [
    "src/test/java/com/assettrack/security/SecurityFilterChainTest.java",
    "src/test/java/com/assettrack/service/dashboard/DashboardIntegrationTest.java",
    "src/test/java/com/assettrack/service/dashboard/DashboardServiceTest.java",
    "src/test/java/com/assettrack/service/notification/NotificationServiceTest.java"
]

for filepath in files_to_fix:
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            content = f.read()
            
        if 'import java.util.UUID;' not in content:
            content = content.replace('import ', 'import java.util.UUID;\nimport ', 1)
            
        with open(filepath, 'w') as f:
            f.write(content)
            print(f"Fixed {filepath}")
