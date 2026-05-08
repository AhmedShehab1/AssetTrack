import os
import re

for root, _, files in os.walk('src/test/java'):
    for file in files:
        if file.endswith('.java'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()

            original = content
            # ConditionReportResponse changes
            content = content.replace('"$.assetId"', '"$.asset.id"')
            content = content.replace('"$.assetSerialNumber"', '"$.asset.serialNumber"')
            content = content.replace('"$.reportedById"', '"$.reportedBy.id"')
            content = content.replace('"$.reportedByEmail"', '"$.reportedBy.email"')
            # AuthResponse changes
            content = content.replace('"$.token"', '"$.accessToken"')
            content = content.replace('"$.role"', '"$.user.role"')
            # DashboardSummary changes
            content = content.replace('summary.getStatusDistribution().getLabels()', 'summary.getByStatus().stream().map(DashboardSummaryDto.StatusCountDto::getStatus).toList()')
            content = content.replace('summary.getStatusDistribution().getData()', 'summary.getByStatus().stream().map(DashboardSummaryDto.StatusCountDto::getCount).toList()')
            content = content.replace('summary.getTypeDistribution().getLabels()', 'summary.getByType().stream().map(DashboardSummaryDto.TypeCountDto::getType).toList()')
            content = content.replace('summary.getTypeDistribution().getData()', 'summary.getByType().stream().map(DashboardSummaryDto.TypeCountDto::getCount).toList()')
            
            if content != original:
                with open(filepath, 'w') as f:
                    f.write(content)
                print(f"Fixed {filepath}")
