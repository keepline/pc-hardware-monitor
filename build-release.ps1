# PC硬件监控工具 - 打包发布脚本
# 自动打包生成可执行文件

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  PC硬件监控工具 - 打包发布脚本" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# 检查Node.js
Write-Host "[1/4] 检查环境..." -ForegroundColor Yellow
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ 错误：未找到Node.js，请先安装Node.js" -ForegroundColor Red
    Write-Host "下载地址：https://nodejs.org/" -ForegroundColor Yellow
    pause
    exit 1
}
Write-Host "✅ Node.js版本：$(node --version)" -ForegroundColor Green

# 安装依赖
Write-Host ""
Write-Host "[2/4] 安装依赖..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 依赖安装失败" -ForegroundColor Red
    pause
    exit 1
}
Write-Host "✅ 依赖安装完成" -ForegroundColor Green

# 清理旧的构建文件
Write-Host ""
Write-Host "[3/4] 清理旧的构建文件..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Path "dist" -Recurse -Force
    Write-Host "✅ 已清理旧文件" -ForegroundColor Green
}

# 开始打包
Write-Host ""
Write-Host "[4/4] 开始打包（这可能需要几分钟）..." -ForegroundColor Yellow
Write-Host "提示：首次打包需要下载Electron，可能较慢" -ForegroundColor Gray
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=====================================" -ForegroundColor Green
    Write-Host "  ✅ 打包成功！" -ForegroundColor Green
    Write-Host "=====================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "📦 生成的文件位于 'dist' 目录：" -ForegroundColor Cyan
    Write-Host ""
    
    if (Test-Path "dist") {
        Get-ChildItem "dist\*.exe" | ForEach-Object {
            $size = [math]::Round($_.Length / 1MB, 2)
            Write-Host "  📄 $($_.Name) ($size MB)" -ForegroundColor White
        }
    }
    
    Write-Host ""
    Write-Host "🎉 下一步：" -ForegroundColor Yellow
    Write-Host "  1. 访问 https://github.com/keepline/pc-hardware-monitor" -ForegroundColor White
    Write-Host "  2. 点击 'Releases' -> 'Create a new release'" -ForegroundColor White
    Write-Host "  3. 上传 dist 目录下的 .exe 文件" -ForegroundColor White
    Write-Host "  4. 发布后分享链接给小伙伴！" -ForegroundColor White
    Write-Host ""
    
    # 询问是否打开dist目录
    Write-Host "是否打开 dist 目录？(Y/N)" -ForegroundColor Cyan -NoNewline
    $response = Read-Host " "
    if ($response -eq "Y" -or $response -eq "y" -or $response -eq "") {
        Start-Process "dist"
    }
    
} else {
    Write-Host ""
    Write-Host "❌ 打包失败" -ForegroundColor Red
    Write-Host "请检查错误信息并重试" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "按任意键退出..." -ForegroundColor Gray
pause

