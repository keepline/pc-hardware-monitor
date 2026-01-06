const { ipcRenderer } = require('electron');

// 文本清理函数 - 处理可能的乱码和无效字符
function sanitizeText(text) {
  if (!text || typeof text !== 'string') return text;
  
  // 移除不可见字符和控制字符（保留换行和制表符）
  let cleaned = text.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, '');
  
  // 移除替换字符（�）和无效的Unicode字符
  cleaned = cleaned.replace(/\uFFFD/g, '');
  
  // 如果清理后的字符串为空或只包含空白字符，返回 'N/A'
  if (!cleaned || cleaned.trim() === '') {
    return 'N/A';
  }
  
  return cleaned.trim();
}

// 安全获取值 - 清理并返回文本
function safeValue(value, defaultValue = 'N/A') {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  return sanitizeText(String(value));
}

// 格式化字节大小
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// 格式化速度
function formatSpeed(bytesPerSecond) {
  return formatBytes(bytesPerSecond) + '/s';
}

// 创建进度条
function createProgressBar(label, value, max, className = 'cpu') {
  const percentage = max > 0 ? ((value / max) * 100).toFixed(1) : 0;
  const displayValue = typeof value === 'number' && max ? `${percentage}%` : value;
  
  // 根据百分比确定颜色
  let barClass = className;
  if (typeof percentage === 'string') {
    const numPercentage = parseFloat(percentage);
    if (numPercentage > 90) {
      barClass = 'warning';
    }
  }
  
  return `
    <div class="progress-container">
      <div class="progress-header">
        <span class="progress-label">${label}</span>
        <span class="progress-value">${displayValue}</span>
      </div>
      <div class="progress-bar-bg">
        <div class="progress-bar-fill ${barClass}" style="width: ${percentage}%"></div>
      </div>
    </div>
  `;
}

// 创建信息行
function createInfoRow(label, value) {
  return `
    <div class="info-row">
      <span class="info-label">${label}</span>
      <span class="info-value">${value}</span>
    </div>
  `;
}

// 更新系统信息
async function updateSystemInfo() {
  const data = await ipcRenderer.invoke('get-system-info');
  const { system, bios, baseboard, osInfo } = data;
  
  const html = `
    <div class="specs-grid">
      <div class="spec-item">
        <div class="spec-label">制造商</div>
        <div class="spec-value">${safeValue(system.manufacturer)}</div>
      </div>
      <div class="spec-item">
        <div class="spec-label">型号</div>
        <div class="spec-value">${safeValue(system.model)}</div>
      </div>
      <div class="spec-item">
        <div class="spec-label">操作系统</div>
        <div class="spec-value">${safeValue(osInfo.distro)}</div>
      </div>
      <div class="spec-item">
        <div class="spec-label">版本</div>
        <div class="spec-value">${safeValue(osInfo.release)}</div>
      </div>
      <div class="spec-item">
        <div class="spec-label">架构</div>
        <div class="spec-value">${safeValue(osInfo.arch)}</div>
      </div>
      <div class="spec-item">
        <div class="spec-label">主板</div>
        <div class="spec-value">${safeValue(baseboard.manufacturer)} ${safeValue(baseboard.model, '')}</div>
      </div>
      <div class="spec-item">
        <div class="spec-label">BIOS</div>
        <div class="spec-value">${safeValue(bios.vendor)} ${safeValue(bios.version, '')}</div>
      </div>
      <div class="spec-item">
        <div class="spec-label">序列号</div>
        <div class="spec-value">${safeValue(system.serial)}</div>
      </div>
    </div>
  `;
  
  document.getElementById('systemInfo').innerHTML = html;
}

// 更新CPU信息
async function updateCpuInfo() {
  const data = await ipcRenderer.invoke('get-cpu-info');
  const { cpu, cpuLoad, cpuTemp } = data;
  
  const coresHtml = cpuLoad.cpus.map((core, index) => {
    return createProgressBar(`核心 ${index + 1}`, core.load, 100, 'cpu');
  }).join('');
  
  const tempDisplay = cpuTemp.main > 0 ? `${cpuTemp.main.toFixed(1)}°C` : 'N/A';
  const tempMax = cpuTemp.max > 0 ? `${cpuTemp.max.toFixed(1)}°C` : 'N/A';
  
  const html = `
    <div class="specs-grid">
      <div class="spec-item">
        <div class="spec-label">处理器</div>
        <div class="spec-value">${safeValue(cpu.brand)}</div>
      </div>
      <div class="spec-item">
        <div class="spec-label">制造商</div>
        <div class="spec-value">${safeValue(cpu.manufacturer)}</div>
      </div>
      <div class="spec-item">
        <div class="spec-label">核心数</div>
        <div class="spec-value">${cpu.cores || 'N/A'}</div>
      </div>
      <div class="spec-item">
        <div class="spec-label">线程数</div>
        <div class="spec-value">${cpu.physicalCores || 'N/A'}</div>
      </div>
      <div class="spec-item">
        <div class="spec-label">基础频率</div>
        <div class="spec-value">${cpu.speed || 'N/A'} GHz</div>
      </div>
      <div class="spec-item">
        <div class="spec-label">最大频率</div>
        <div class="spec-value">${cpu.speedMax || 'N/A'} GHz</div>
      </div>
      <div class="spec-item">
        <div class="spec-label">温度</div>
        <div class="spec-value">${tempDisplay}</div>
      </div>
      <div class="spec-item">
        <div class="spec-label">最高温度</div>
        <div class="spec-value">${tempMax}</div>
      </div>
    </div>
    ${createProgressBar('总体使用率', cpuLoad.currentLoad, 100, 'cpu')}
    <div style="margin-top: 20px;">
      <h3 style="color: var(--text-secondary); font-size: 14px; margin-bottom: 12px; font-weight: 600;">各核心使用率</h3>
      ${coresHtml}
    </div>
  `;
  
  document.getElementById('cpuInfo').innerHTML = html;
}

// 更新内存信息
async function updateMemoryInfo() {
  const data = await ipcRenderer.invoke('get-memory-info');
  const { mem, memLayout } = data;
  
  const totalGB = (mem.total / (1024 ** 3)).toFixed(2);
  const usedGB = (mem.used / (1024 ** 3)).toFixed(2);
  const freeGB = (mem.free / (1024 ** 3)).toFixed(2);
  const availableGB = (mem.available / (1024 ** 3)).toFixed(2);
  
  let html = `
    <div class="specs-grid">
      <div class="spec-item">
        <div class="spec-label">总容量</div>
        <div class="spec-value">${totalGB} GB</div>
      </div>
      <div class="spec-item">
        <div class="spec-label">已使用</div>
        <div class="spec-value">${usedGB} GB</div>
      </div>
      <div class="spec-item">
        <div class="spec-label">空闲</div>
        <div class="spec-value">${freeGB} GB</div>
      </div>
      <div class="spec-item">
        <div class="spec-label">可用</div>
        <div class="spec-value">${availableGB} GB</div>
      </div>
    </div>
    ${createProgressBar('内存使用率', mem.used, mem.total, 'memory')}
    ${createProgressBar('活动内存', mem.active, mem.total, 'memory')}
  `;
  
  // 添加内存模块详细信息
  if (memLayout && memLayout.length > 0) {
    html += '<div style="margin-top: 20px;">';
    html += '<h3 style="color: var(--text-secondary); font-size: 14px; margin-bottom: 12px; font-weight: 600;">内存模块详情</h3>';
    
    memLayout.forEach((module, index) => {
      if (module.size > 0) {
        const sizeGB = (module.size / (1024 ** 3)).toFixed(0);
        const type = safeValue(module.type, 'Unknown');
        const speed = module.clockSpeed ? `${module.clockSpeed} MHz` : 'N/A';
        const manufacturer = safeValue(module.manufacturer);
        const partNum = safeValue(module.partNum, '');
        const voltage = module.voltage ? `${module.voltage}V` : '';
        
        html += `
          <div class="disk-item">
            <div class="disk-header">
              <span class="disk-name">插槽 ${index + 1} - ${sizeGB} GB ${type}</span>
              <span class="disk-type">${type}</span>
            </div>
            <div class="specs-grid" style="margin-top: 12px;">
              <div class="spec-item">
                <div class="spec-label">容量</div>
                <div class="spec-value">${sizeGB} GB</div>
              </div>
              <div class="spec-item">
                <div class="spec-label">类型</div>
                <div class="spec-value">${type}</div>
              </div>
              <div class="spec-item">
                <div class="spec-label">频率</div>
                <div class="spec-value">${speed}</div>
              </div>
              <div class="spec-item">
                <div class="spec-label">制造商</div>
                <div class="spec-value">${manufacturer}</div>
              </div>
              ${partNum && partNum !== 'N/A' ? `
              <div class="spec-item">
                <div class="spec-label">型号</div>
                <div class="spec-value">${partNum}</div>
              </div>
              ` : ''}
              ${voltage ? `
              <div class="spec-item">
                <div class="spec-label">电压</div>
                <div class="spec-value">${voltage}</div>
              </div>
              ` : ''}
            </div>
          </div>
        `;
      }
    });
    
    html += '</div>';
  }
  
  document.getElementById('memoryInfo').innerHTML = html;
}

// 更新磁盘信息
async function updateDiskInfo() {
  const data = await ipcRenderer.invoke('get-disk-info');
  const { diskLayout, fsSize } = data;
  
  let html = '<div style="margin-bottom: 20px;">';
  
  // 物理磁盘信息
  diskLayout.forEach((disk, index) => {
    const sizeGB = (disk.size / (1024 ** 3)).toFixed(2);
    const diskName = safeValue(disk.name);
    const diskType = safeValue(disk.type);
    const diskVendor = safeValue(disk.vendor, '');
    const diskInterface = safeValue(disk.interfaceType);
    
    html += `
      <div class="disk-item">
        <div class="disk-header">
          <span class="disk-name">磁盘 ${index + 1}: ${diskName}</span>
          <span class="disk-type">${diskType}</span>
        </div>
        <div class="disk-info">
          ${diskVendor} ${disk.size > 0 ? sizeGB + ' GB' : 'N/A'} | 接口: ${diskInterface}
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  
  // 分区信息
  if (fsSize && fsSize.length > 0) {
    html += '<h3 style="color: var(--text-secondary); font-size: 14px; margin-bottom: 12px; font-weight: 600;">分区使用情况</h3>';
    fsSize.forEach(fs => {
      if (fs.size > 0) {
        const totalGB = (fs.size / (1024 ** 3)).toFixed(2);
        const usedGB = (fs.used / (1024 ** 3)).toFixed(2);
        const freeGB = ((fs.size - fs.used) / (1024 ** 3)).toFixed(2);
        const fsName = safeValue(fs.fs);
        const fsMount = safeValue(fs.mount);
        const fsType = safeValue(fs.type);
        
        html += `
          <div class="disk-item">
            <div class="disk-header">
              <span class="disk-name">${fsName} (${fsMount})</span>
            </div>
            <div class="disk-info">
              ${totalGB} GB 总容量 | ${usedGB} GB 已使用 | ${freeGB} GB 可用 | ${fsType}
            </div>
            ${createProgressBar('使用率', fs.used, fs.size, 'disk')}
          </div>
        `;
      }
    });
  }
  
  document.getElementById('diskInfo').innerHTML = html;
}

// 更新GPU信息
async function updateGpuInfo() {
  const data = await ipcRenderer.invoke('get-gpu-info');
  
  let html = '';
  
  if (data.controllers && data.controllers.length > 0) {
    data.controllers.forEach((gpu, index) => {
      const vramGB = gpu.vram ? (gpu.vram / 1024).toFixed(2) : 'N/A';
      const temp = gpu.temperatureGpu > 0 ? `${gpu.temperatureGpu}°C` : 'N/A';
      const usage = gpu.utilizationGpu > 0 ? `${gpu.utilizationGpu}%` : 'N/A';
      const gpuModel = safeValue(gpu.model);
      const gpuVendor = safeValue(gpu.vendor);
      
      html += `
        <div class="gpu-item">
          <div class="gpu-name">GPU ${index + 1}: ${gpuModel}</div>
          <div class="specs-grid">
            <div class="spec-item">
              <div class="spec-label">制造商</div>
              <div class="spec-value">${gpuVendor}</div>
            </div>
            <div class="spec-item">
              <div class="spec-label">显存</div>
              <div class="spec-value">${vramGB} GB</div>
            </div>
            <div class="spec-item">
              <div class="spec-label">温度</div>
              <div class="spec-value">${temp}</div>
            </div>
            <div class="spec-item">
              <div class="spec-label">使用率</div>
              <div class="spec-value">${usage}</div>
            </div>
          </div>
          ${gpu.utilizationGpu > 0 ? createProgressBar('GPU使用率', gpu.utilizationGpu, 100, 'gpu') : ''}
          ${gpu.memoryUsed && gpu.memoryTotal ? createProgressBar('显存使用', gpu.memoryUsed, gpu.memoryTotal, 'gpu') : ''}
        </div>
      `;
    });
  } else {
    html = '<div class="loading">未检测到独立显卡</div>';
  }
  
  document.getElementById('gpuInfo').innerHTML = html;
}

// 更新网络信息
async function updateNetworkInfo() {
  const data = await ipcRenderer.invoke('get-network-info');
  const { networkInterfaces, networkStats } = data;
  
  let html = '';
  
  networkInterfaces.forEach((netif, index) => {
    if (netif.iface) {
      const stats = networkStats[index] || {};
      const statusClass = netif.operstate === 'up' ? 'connected' : 'disconnected';
      const statusText = netif.operstate === 'up' ? '已连接' : '未连接';
      const ifaceName = safeValue(netif.iface);
      const ifaceType = safeValue(netif.type);
      const ip4 = safeValue(netif.ip4);
      const ip6 = safeValue(netif.ip6);
      const mac = safeValue(netif.mac);
      
      html += `
        <div class="network-item">
          <div class="network-name">${ifaceName}</div>
          <span class="network-status ${statusClass}">${statusText}</span>
          <div class="specs-grid">
            <div class="spec-item">
              <div class="spec-label">类型</div>
              <div class="spec-value">${ifaceType}</div>
            </div>
            <div class="spec-item">
              <div class="spec-label">IP地址</div>
              <div class="spec-value">${ip4}</div>
            </div>
            <div class="spec-item">
              <div class="spec-label">IPv6地址</div>
              <div class="spec-value">${ip6}</div>
            </div>
            <div class="spec-item">
              <div class="spec-label">MAC地址</div>
              <div class="spec-value">${mac}</div>
            </div>
            <div class="spec-item">
              <div class="spec-label">速度</div>
              <div class="spec-value">${netif.speed > 0 ? netif.speed + ' Mbps' : 'N/A'}</div>
            </div>
            <div class="spec-item">
              <div class="spec-label">下载速度</div>
              <div class="spec-value">${stats.rx_sec ? formatSpeed(stats.rx_sec) : 'N/A'}</div>
            </div>
            <div class="spec-item">
              <div class="spec-label">上传速度</div>
              <div class="spec-value">${stats.tx_sec ? formatSpeed(stats.tx_sec) : 'N/A'}</div>
            </div>
            <div class="spec-item">
              <div class="spec-label">总下载量</div>
              <div class="spec-value">${stats.rx_bytes ? formatBytes(stats.rx_bytes) : 'N/A'}</div>
            </div>
          </div>
        </div>
      `;
    }
  });
  
  document.getElementById('networkInfo').innerHTML = html;
}

// 更新电池信息
async function updateBatteryInfo() {
  const data = await ipcRenderer.invoke('get-battery-info');
  
  if (!data.hasBattery) {
    document.getElementById('batteryCard').classList.add('hidden');
    return;
  }
  
  document.getElementById('batteryCard').classList.remove('hidden');
  
  const isCharging = data.isCharging ? '充电中' : '放电中';
  const timeRemaining = data.timeRemaining > 0 ? `${Math.floor(data.timeRemaining / 60)} 分钟` : 'N/A';
  const batteryManufacturer = safeValue(data.manufacturer);
  
  const html = `
    <div class="specs-grid">
      <div class="spec-item">
        <div class="spec-label">电池状态</div>
        <div class="spec-value">${isCharging}</div>
      </div>
      <div class="spec-item">
        <div class="spec-label">剩余容量</div>
        <div class="spec-value">${data.percent || 'N/A'}%</div>
      </div>
      <div class="spec-item">
        <div class="spec-label">剩余时间</div>
        <div class="spec-value">${timeRemaining}</div>
      </div>
      <div class="spec-item">
        <div class="spec-label">设计容量</div>
        <div class="spec-value">${data.maxCapacity || 'N/A'} mWh</div>
      </div>
      <div class="spec-item">
        <div class="spec-label">当前容量</div>
        <div class="spec-value">${data.currentCapacity || 'N/A'} mWh</div>
      </div>
      <div class="spec-item">
        <div class="spec-label">健康度</div>
        <div class="spec-value">${data.capacityHealth || 'N/A'}%</div>
      </div>
      <div class="spec-item">
        <div class="spec-label">循环次数</div>
        <div class="spec-value">${data.cycleCount || 'N/A'}</div>
      </div>
      <div class="spec-item">
        <div class="spec-label">制造商</div>
        <div class="spec-value">${batteryManufacturer}</div>
      </div>
    </div>
    ${createProgressBar('电量', data.percent, 100, data.isCharging ? 'disk' : 'memory')}
  `;
  
  document.getElementById('batteryInfo').innerHTML = html;
}

// 更新所有信息
async function updateAllInfo() {
  try {
    await Promise.all([
      updateSystemInfo(),
      updateCpuInfo(),
      updateMemoryInfo(),
      updateDiskInfo(),
      updateGpuInfo(),
      updateNetworkInfo(),
      updateBatteryInfo()
    ]);
    
    // 更新时间戳
    const now = new Date();
    const timeString = now.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
    document.getElementById('lastUpdate').textContent = timeString;
  } catch (error) {
    console.error('更新数据失败:', error);
  }
}

// 刷新按钮点击事件
document.getElementById('refreshBtn').addEventListener('click', () => {
  updateAllInfo();
});

// 导航标签点击事件
function initNavTabs() {
  const navTabs = document.querySelectorAll('.nav-tab');
  
  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // 移除所有标签的active类
      navTabs.forEach(t => t.classList.remove('active'));
      
      // 给当前标签添加active类
      tab.classList.add('active');
      
      // 获取目标卡片ID并滚动到该位置
      const targetId = tab.getAttribute('data-target');
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        // 检查电池卡片是否隐藏
        if (targetId === 'batteryCard' && targetElement.classList.contains('hidden')) {
          return; // 如果电池卡片隐藏，不执行滚动
        }
        
        // 平滑滚动到目标
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// 根据滚动位置更新active标签
function updateActiveTabOnScroll() {
  const cards = document.querySelectorAll('.card[id]');
  const navTabs = document.querySelectorAll('.nav-tab');
  
  let currentActiveCard = null;
  
  // 找到当前视口中最靠上的卡片
  cards.forEach(card => {
    if (card.classList.contains('hidden')) return;
    
    const rect = card.getBoundingClientRect();
    // 如果卡片的顶部在视口的上半部分
    if (rect.top <= window.innerHeight / 2 && rect.bottom > 0) {
      if (!currentActiveCard || rect.top > currentActiveCard.rect.top) {
        currentActiveCard = { element: card, rect };
      }
    }
  });
  
  if (currentActiveCard) {
    const cardId = currentActiveCard.element.id;
    
    // 更新对应的标签
    navTabs.forEach(tab => {
      if (tab.getAttribute('data-target') === cardId) {
        if (!tab.classList.contains('active')) {
          navTabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
        }
      }
    });
  }
}

// 页面加载完成后更新数据
window.addEventListener('DOMContentLoaded', () => {
  updateAllInfo();
  
  // 初始化导航标签
  initNavTabs();
  
  // 监听滚动事件以更新active标签
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(updateActiveTabOnScroll, 100);
  }, { passive: true });
  
  // 每5秒自动更新一次
  setInterval(updateAllInfo, 5000);
});

