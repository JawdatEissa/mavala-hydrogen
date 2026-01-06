# Get all image folders
$imageFolders = Get-ChildItem "public\images" -Directory | Select-Object -ExpandProperty Name

# Get all code content
$codeFiles = Get-ChildItem "app" -Recurse -Include *.tsx,*.ts,*.jsx,*.js,*.json | Where-Object { $_.FullName -notmatch 'node_modules' }
$allCode = ""
foreach ($file in $codeFiles) {
    $allCode += Get-Content $file.FullName -Raw
}

Write-Host "Total image folders: $($imageFolders.Count)" -ForegroundColor Cyan
Write-Host "Checking which folders are referenced in code...`n" -ForegroundColor Cyan

$usedFolders = @()
$unusedFolders = @()

foreach ($folder in $imageFolders) {
    if ($allCode -like "*$folder*") {
        $usedFolders += $folder
    } else {
        $unusedFolders += $folder
    }
}

Write-Host "USED folders: $($usedFolders.Count)" -ForegroundColor Green
Write-Host "UNUSED folders: $($unusedFolders.Count)" -ForegroundColor Red

# Calculate size of unused folders
Write-Host "`nCalculating size of unused folders..." -ForegroundColor Yellow
$unusedSize = 0
$unusedDetails = @()

foreach ($folder in $unusedFolders) {
    $folderPath = Join-Path "public\images" $folder
    $size = (Get-ChildItem $folderPath -File -Recurse | Measure-Object -Property Length -Sum).Sum
    $unusedSize += $size
    $unusedDetails += [PSCustomObject]@{
        Folder = $folder
        SizeMB = [math]::Round($size / 1MB, 2)
        Files = (Get-ChildItem $folderPath -File).Count
    }
}

Write-Host "`nTotal unused size: $([math]::Round($unusedSize / 1MB, 2)) MB`n" -ForegroundColor Red

Write-Host "Top 30 largest UNUSED folders:" -ForegroundColor Yellow
$unusedDetails | Sort-Object -Property SizeMB -Descending | Select-Object -First 30 | Format-Table

# Save full list
$unusedFolders | Out-File "unused-image-folders.txt"
Write-Host "Full list of unused folders saved to: unused-image-folders.txt" -ForegroundColor Green

