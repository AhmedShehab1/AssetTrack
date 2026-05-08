import os
import re
import sys

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original_content = content

    # Add UUID import if not present and if we are going to modify the file
    has_uuid = "java.util.UUID" in content
    
    # Simple regexes to find Long id fields and Long return types
    # It's better to manually specify the replacements or do it semi-automatically
    
    # 1. Replace @Id private Long id; -> @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    content = re.sub(r'@Id\s+(@GeneratedValue[^)]+\)\s+)?private Long id;', 
                     r'@Id\n    @GeneratedValue(strategy = jakarta.persistence.GenerationType.UUID)\n    private java.util.UUID id;', content)
    
    # 2. Replace Long assetId, userId, etc in entities and DTOs
    content = re.sub(r'private Long (\w*Id|id);', r'private java.util.UUID \1;', content)
    content = re.sub(r'public Long get(\w*Id|Id)\(\)', r'public java.util.UUID get\1()', content)
    content = re.sub(r'public void set(\w*Id|Id)\(Long', r'public void set\1(java.util.UUID', content)
    
    # 3. Replace JpaRepository<Entity, Long> -> JpaRepository<Entity, UUID>
    content = re.sub(r'JpaRepository<([^,]+),\s*Long>', r'JpaRepository<\1, java.util.UUID>', content)
    
    # 4. Replace PathVariable Long id -> PathVariable UUID id
    content = re.sub(r'@PathVariable Long (\w*)', r'@PathVariable java.util.UUID \1', content)
    
    # 5. Replace RequestParam Long id -> RequestParam UUID id
    content = re.sub(r'@RequestParam Long (\w*)', r'@RequestParam java.util.UUID \1', content)
    
    # 6. Service methods with Long id
    # This is tricky with regex, we can try matching: Type methodName(..., Long id, ...)
    # Let's replace "Long id" -> "java.util.UUID id"
    content = re.sub(r'\bLong id\b', 'java.util.UUID id', content)
    content = re.sub(r'\bLong assetId\b', 'java.util.UUID assetId', content)
    content = re.sub(r'\bLong userId\b', 'java.util.UUID userId', content)
    content = re.sub(r'\bLong reportedBy\b', 'java.util.UUID reportedBy', content)
    content = re.sub(r'\bLong notificationId\b', 'java.util.UUID notificationId', content)

    # 7. Replace "1L" or "2L" with UUID constants in Tests
    # Let's leave tests for another script or manual fix since they need valid UUID strings
    
    if content != original_content:
        # If the file belongs to domain, make sure GenerationType is imported? 
        # Using full package `jakarta.persistence.GenerationType.UUID` is safer.
        # Adding import java.util.UUID;
        if not has_uuid and 'java.util.UUID' not in content:
            if 'import ' in content:
                content = content.replace('import ', 'import java.util.UUID;\nimport ', 1)
                
        # Clean up `java.util.UUID` -> `UUID` if we imported it
        if 'import java.util.UUID;' in content:
            content = content.replace('java.util.UUID', 'UUID')

        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, _, files in os.walk('src/main/java'):
    for file in files:
        if file.endswith('.java'):
            process_file(os.path.join(root, file))

# Fix tests
def process_test_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original_content = content
    
    content = re.sub(r'\bLong id\b', 'java.util.UUID id', content)
    content = re.sub(r'\bLong assetId\b', 'java.util.UUID assetId', content)
    content = re.sub(r'\bLong userId\b', 'java.util.UUID userId', content)
    content = re.sub(r'\bLong notificationId\b', 'java.util.UUID notificationId', content)
    
    # Replace literal longs like 1L with UUID.randomUUID() or a constant
    # Wait, UUID strings in JSON: "123e4567-e89b-12d3-a456-426614174000"
    # Actually let's just do it manually for tests or see how many fail.
    
    if content != original_content:
        if 'import ' in content and 'import java.util.UUID;' not in content:
            content = content.replace('import ', 'import java.util.UUID;\nimport ', 1)
        content = content.replace('java.util.UUID', 'UUID')
        
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated test {filepath}")

for root, _, files in os.walk('src/test/java'):
    for file in files:
        if file.endswith('.java'):
            process_test_file(os.path.join(root, file))
