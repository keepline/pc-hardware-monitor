# PC Hardware Monitor - Build Portable Version (No Code Signing)
# Build portable executable without administrator privileges

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Build Portable Version (No Signing)" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Disable code signing
$env:CSC_IDENTITY_AUTO_DISCOVERY = "false"
$env:WIN_CSC_LINK = ""

# Check Node.js
Write-Host "[1/4] Checking environment..." -ForegroundColor Yellow
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[X] Error: Node.js not found" -ForegroundColor Red
    pause
    exit 1
}
$nodeVersion = node --version
Write-Host "[OK] Node.js version: $nodeVersion" -ForegroundColor Green

# Install dependencies
Write-Host ""
Write-Host "[2/4] Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "[X] Failed to install dependencies" -ForegroundColor Red
    pause
    exit 1
}
Write-Host "[OK] Dependencies installed" -ForegroundColor Green

# Clean old build files
Write-Host ""
Write-Host "[3/4] Cleaning old build files..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Path "dist" -Recurse -Force
    Write-Host "[OK] Old files cleaned" -ForegroundColor Green
}

# Start building
Write-Host ""
Write-Host "[4/4] Building portable version..." -ForegroundColor Yellow
Write-Host "Note: Code signing disabled, no admin rights needed" -ForegroundColor Gray
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=====================================" -ForegroundColor Green
    Write-Host "  [OK] Build successful!" -ForegroundColor Green
    Write-Host "=====================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Generated files in 'dist' directory:" -ForegroundColor Cyan
    Write-Host ""
    
    if (Test-Path "dist") {
        Get-ChildItem "dist\*.exe" | ForEach-Object {
            $sizeMB = [math]::Round($_.Length / 1MB, 2)
            Write-Host "  * $($_.Name) - $sizeMB MB" -ForegroundColor White
        }
    }
    
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Upload to GitHub Release" -ForegroundColor White
    Write-Host "  2. Share with friends!" -ForegroundColor White
    Write-Host ""
    
    # Ask to open dist directory
    Write-Host "Open dist directory? (Y/N): " -ForegroundColor Cyan -NoNewline
    $response = Read-Host
    if ($response -eq "Y" -or $response -eq "y" -or $response -eq "") {
        Start-Process "dist"
    }
    
} else {
    Write-Host ""
    Write-Host "[X] Build failed" -ForegroundColor Red
    Write-Host "Please check error messages above" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
pause

