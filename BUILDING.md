# 打包指南 📦

本指南说明如何将应用打包成可执行文件（.exe），用于分发给其他用户。

## 前提条件

- 已安装 Node.js（14.0 或更高版本）
- Windows 10/11 操作系统

## 快速打包

### 方法1：以管理员身份运行（推荐）⭐

**最简单的方法！**

1. 右键点击 `build-admin.bat`
2. 选择 **"以管理员身份运行"**
3. 等待打包完成（首次约 5-10 分钟）
4. 完成！可执行文件在 `dist` 目录中

生成的文件：
```
dist/PC-Hardware-Monitor-1.0.0-portable.exe  (~150 MB)
```

### 方法2：启用开发者模式（一次性设置）

如果不想每次都使用管理员权限，可以启用 Windows 开发者模式：

**Windows 11:**
1. 打开 **设置** → **隐私和安全性** → **开发者选项**
2. 打开 **"开发人员模式"**

**Windows 10:**
1. 打开 **设置** → **更新和安全** → **开发者选项**
2. 选择 **"开发人员模式"**

启用后，直接运行：
```bash
.\build-portable.ps1
```

## 为什么需要管理员权限？

electron-builder 在打包过程中需要创建符号链接，Windows 默认只允许管理员或开发者模式创建符号链接。

## 手动打包命令

如果你熟悉命令行，也可以手动执行：

```bash
# 设置环境变量禁用代码签名
$env:CSC_IDENTITY_AUTO_DISCOVERY = "false"

# 安装依赖（如果还没安装）
npm install

# 打包
npm run build
```

## 发布到 GitHub Release

打包完成后：

1. 访问 https://github.com/keepline/pc-hardware-monitor
2. 点击 **"Releases"** → **"Create a new release"**
3. 填写版本信息（如 `v1.0.0`）
4. 上传 `dist` 目录下的 `.exe` 文件
5. 点击 **"Publish release"**

现在你的小伙伴就可以从 GitHub Release 页面下载使用了！

## 常见问题

**Q: 打包后的文件为什么这么大？**  
A: 因为包含了完整的 Electron（基于 Chromium）运行环境，这样用户才能无需安装任何依赖直接运行。

**Q: 可以打包成安装版吗？**  
A: 可以。修改 `package.json` 中的 `build.win.target` 配置即可。

**Q: 如何减小文件大小？**  
A: 可以使用 `electron-builder` 的压缩选项，或使用 7-Zip 压缩后分发。

## 自动化打包（GitHub Actions）

如果想使用 GitHub 自动打包，参考 [发布指南.md](./发布指南.md) 中的 GitHub Actions 配置。

---

**需要更多帮助？** 查看 [发布指南.md](./发布指南.md) 或提交 Issue。

