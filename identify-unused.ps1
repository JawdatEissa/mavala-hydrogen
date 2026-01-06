# Identify unused image folders

Write-Host "=== ANALYZING IMAGE USAGE ===" -ForegroundColor Cyan
Write-Host ""

# Get all folder names in public/images
$allFolders = Get-ChildItem "public\images" -Directory | Select-Object -ExpandProperty Name

# Read all code and data files
Write-Host "Reading code files..." -ForegroundColor Yellow
$allCode = ""
Get-ChildItem "app" -Recurse -Include *.tsx,*.ts,*.jsx,*.js,*.json | ForEach-Object {
    $allCode += Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
}

Write-Host "Total folders to check: $($allFolders.Count)" -ForegroundColor Cyan
Write-Host ""

# Check each folder
$used = @()
$unused = @()

foreach ($folder in $allFolders) {
    if ($allCode -match [regex]::Escape($folder)) {
        $used += $folder
    } else {
        $unused += $folder
    }
}

Write-Host "RESULTS:" -ForegroundColor Green
Write-Host "  Used folders: $($used.Count)" -ForegroundColor Green
Write-Host "  Unused folders: $($unused.Count)" -ForegroundColor Red
Write-Host ""

# Calculate sizes
Write-Host "Calculating sizes of unused folders..." -ForegroundColor Yellow
$unusedWithSize = @()
$totalUnusedSize = 0

foreach ($folder in $unused) {
    $folderPath = Join-Path "public\images" $folder
    $size = (Get-ChildItem $folderPath -File -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
    if ($size -eq $null) { $size = 0 }
    $totalUnusedSize += $size
    
    $unusedWithSize += [PSCustomObject]@{
        Folder = $folder
        SizeMB = [math]::Round($size / 1MB, 2)
        Files = (Get-ChildItem $folderPath -File -ErrorAction SilentlyContinue).Count
    }
}

Write-Host ""
Write-Host "TOTAL UNUSED SIZE: $([math]::Round($totalUnusedSize / 1GB, 2)) GB" -ForegroundColor Red
Write-Host ""

# Show top 50 largest unused folders
Write-Host "TOP 50 LARGEST UNUSED FOLDERS:" -ForegroundColor Yellow
$unusedWithSize | Sort-Object -Property SizeMB -Descending | Select-Object -First 50 | Format-Table -AutoSize

# Save complete lists
$unused | Out-File "unused-folders-list.txt" -Encoding UTF8
$used | Out-File "used-folders-list.txt" -Encoding UTF8
$unusedWithSize | Sort-Object -Property SizeMB -Descending | ConvertTo-Json | Out-File "unused-folders-details.json" -Encoding UTF8

Write-Host ""
Write-Host "FILES SAVED:" -ForegroundColor Green
Write-Host "  - unused-folders-list.txt (list of unused folder names)" -ForegroundColor White
Write-Host "  - used-folders-list.txt (list of used folder names)" -ForegroundColor White
Write-Host "  - unused-folders-details.json (detailed size info)" -ForegroundColor White
Write-Host ""
Write-Host "To move unused folders out, run: .\move-unused-folders.ps1" -ForegroundColor Cyan

