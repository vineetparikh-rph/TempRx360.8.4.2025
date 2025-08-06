# Batch fix for useSession -> useUser conversion
# This script will fix the most critical files

$files = @(
    "src\components\pharmacy\pharmacytemperaturedashboard.tsx",
    "src\app\(admin)\sensors\status\page.tsx",
    "src\app\(admin)\sensors\page.tsx",
    "src\app\(admin)\reports\page.tsx",
    "src\app\(admin)\reports\logs\page.tsx",
    "src\app\(admin)\reports\export\page.tsx"
)

foreach ($file in $files) {
    $fullPath = "c:\Users\pharm\OneDrive\Desktop\admin dashboard\$file"
    if (Test-Path $fullPath) {
        Write-Host "Fixing: $file"
        
        # Read file content
        $content = Get-Content $fullPath -Raw
        
        # Replace imports
        $content = $content -replace "import \{ useSession \} from 'next-auth/react';", "import { useUser } from '@clerk/nextjs';"
        
        # Replace hook usage
        $content = $content -replace "const \{ data: session.*?\} = useSession\(\);", "const { user, isLoaded } = useUser();"
        $content = $content -replace "const \{ data: session \} = useSession\(\);", "const { user, isLoaded } = useUser();"
        
        # Replace loading checks
        $content = $content -replace 'status === "loading"', '!isLoaded'
        
        # Replace auth checks
        $content = $content -replace '!session', '!user'
        $content = $content -replace 'session\?\.user\?\.', 'user?.'
        
        # Write back to file
        Set-Content $fullPath $content -NoNewline
        
        Write-Host "Fixed: $file" -ForegroundColor Green
    } else {
        Write-Host "File not found: $file" -ForegroundColor Red
    }
}

Write-Host "Batch fix completed!" -ForegroundColor Cyan