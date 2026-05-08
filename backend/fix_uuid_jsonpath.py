import os
import re

for root, _, files in os.walk('src/test/java'):
    for file in files:
        if file.endswith('.java'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()

            # Find .value(obj.getId()) and replace with .value(obj.getId().toString())
            original = content
            content = re.sub(r'\.value\(([^)]+\.getId\(\))\)', r'.value(\1.toString())', content)
            
            if content != original:
                with open(filepath, 'w') as f:
                    f.write(content)
                print(f"Fixed {filepath}")
