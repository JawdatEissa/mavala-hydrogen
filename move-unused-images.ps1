# Move unused image folders to a backup location

$unusedFolders = Get-Content "definitely-unused.txt"
$backupDir = "..\mavala-images-backup"
$sourceDir = "public\images"

Write-Host "=== MOVING UNUSED IMAGE FOLDERS ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Total folders to move: $($unusedFolders.Count)" -ForegroundColor Yellow
Write-Host "Backup location: $backupDir" -ForegroundColor Yellow
Write-Host ""

# Create backup directory
if (!(Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
    Write-Host "Created backup directory: $backupDir" -ForegroundColor Green
}

# Move folders
$moved = 0
$failed = 0
$savedSize = 0

foreach ($folder in $unusedFolders) {
    $sourcePath = Join-Path $sourceDir $folder
    $destPath = Join-Path $backupDir $folder
    
    if (Test-Path $sourcePath) {
        try {
            # Calculate size before moving
            $size = (Get-ChildItem $sourcePath -File -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
            if ($size -eq $null) { $size = 0 }
            $savedSize += $size
            
            # Move the folder
            Move-Item -Path $sourcePath -Destination $destPath -Force -ErrorAction Stop
            $moved++
            
            if ($moved % 50 -eq 0) {
                Write-Host "Moved $moved folders..." -ForegroundColor Gray
            }
        } catch {
            Write-Host "Failed to move: $folder - $($_.Exception.Message)" -ForegroundColor Red
            $failed++
        }
    }
}

Write-Host ""
Write-Host "=== COMPLETE ===" -ForegroundColor Green
Write-Host "Successfully moved: $moved folders" -ForegroundColor Green
Write-Host "Failed: $failed folders" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Green" })
Write-Host "Space saved: $([math]::Round($savedSize / 1GB, 2)) GB" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backup location: $((Resolve-Path $backupDir).Path)" -ForegroundColor Yellow
Write-Host ""
Write-Host "You can now deploy your project!" -ForegroundColor Green

