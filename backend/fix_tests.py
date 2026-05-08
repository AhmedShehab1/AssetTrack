import os
import re

for root, _, files in os.walk('src/test/java'):
    for file in files:
        if file.endswith('.java'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()
            
            # fix invalid imports
            content = content.replace('import UUID;', 'import java.util.UUID;')
            
            # replace 1L, 2L, 7L, etc with UUIDs. We can use UUID.fromString("00000000-0000-0000-0000-000000000001") etc.
            # actually we can just map the longs to valid UUID strings.
            def replace_long(match):
                num = int(match.group(1))
                return f'UUID.fromString("00000000-0000-0000-0000-{num:012d}")'
            
            # Watch out for any Long ids that are passed to functions requiring UUID
            content = re.sub(r'\b(\d+)L\b', replace_long, content)
            
            # "id(1L)" -> "id(UUID.fromString(...))"
            # But wait, what if it's "Long reportId = 44L;" -> "UUID reportId = UUID.fromString(...)"
            content = content.replace('Long ', 'UUID ')
            
            with open(filepath, 'w') as f:
                f.write(content)
