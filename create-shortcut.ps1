# PC硬件监控工具 - 创建桌面快捷方式脚本

Write-Host "正在创建桌面快捷方式..." -ForegroundColor Cyan

# 获取桌面路径
$desktopPath = [Environment]::GetFolderPath("Desktop")

# 获取当前脚本所在目录（项目根目录）
$projectPath = $PSScriptRoot

# 快捷方式路径
$shortcutPath = Join-Path $desktopPath "硬件监控工具.lnk"

# 创建WScript.Shell对象
$WScriptShell = New-Object -ComObject WScript.Shell

# 创建快捷方式
$Shortcut = $WScriptShell.CreateShortcut($shortcutPath)

# 设置快捷方式的目标（批处理文件）
$Shortcut.TargetPath = Join-Path $projectPath "start-monitor.bat"

# 设置工作目录
$Shortcut.WorkingDirectory = $projectPath

# 设置快捷方式的描述
$Shortcut.Description = "PC硬件监控工具 - 实时查看系统硬件信息"

# 设置图标（使用系统默认的监控图标）
$Shortcut.IconLocation = "shell32.dll,109"

# 设置窗口样式（1=正常窗口, 3=最大化, 7=最小化）
$Shortcut.WindowStyle = 7

# 保存快捷方式
$Shortcut.Save()

Write-Host ""
Write-Host "✓ 桌面快捷方式创建成功！" -ForegroundColor Green
Write-Host "  位置: $shortcutPath" -ForegroundColor Gray
Write-Host ""
Write-Host "现在你可以通过桌面的 '硬件监控工具' 快捷方式启动应用了！" -ForegroundColor Yellow
Write-Host ""

# 等待用户按键
Read-Host "按任意键退出"


