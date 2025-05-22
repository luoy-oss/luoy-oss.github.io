// 存储所有链接的状态数据
let linksData = [];
let filteredLinks = [];

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  // 从本地存储加载数据（如果有）
  const savedData = localStorage.getItem('monitoringData');
  if (savedData) {
    try {
      linksData = JSON.parse(savedData);
      updateUI();
    } catch (e) {
      console.error('无法解析保存的监测数据', e);
    }
  }
  
  // 获取友情链接数据
  fetchLinks();
});

/**
 * 获取友情链接数据
 */
async function fetchLinks() {
  try {
    // 这里应该替换为实际获取友链的API或方法
    // 示例：从 /links/data.json 获取数据
    const response = await fetch('/links/data.json');
    if (!response.ok) throw new Error('无法获取友链数据');
    
    const data = await response.json();
    
    // 处理数据格式，确保与我们的结构匹配
    linksData = data.map(link => ({
      name: link.name,
      url: link.url,
      status: 'unknown',
      responseTime: null,
      lastChecked: null
    }));
    
    // 更新UI并检查所有链接状态
    updateUI();
    refreshAllStatus();
  } catch (error) {
    console.error('获取友链数据失败:', error);
    // 如果无法获取数据，显示一些示例数据
    showSampleData();
  }
}

/**
 * 显示示例数据（当无法获取实际数据时）
 */
function showSampleData() {
  linksData = [
    {
      name: '示例站点 1',
      url: 'https://www.drluo.top/',
      status: 'online',
      responseTime: 120,
      lastChecked: new Date().toISOString()
    },
    {
      name: '示例站点 2',
      url: 'https://example.org',
      status: 'offline',
      responseTime: null,
      lastChecked: new Date().toISOString()
    }
  ];
  updateUI();
}

/**
 * 刷新所有链接状态
 */
async function refreshAllStatus() {
  const list = document.getElementById('monitoring-list');
  list.innerHTML = '<div class="monitoring-loading">正在检查所有链接状态...</div>';
  
  // 更新每个链接的状态
  for (let i = 0; i < linksData.length; i++) {
    await checkLinkStatus(i);
  }
  
  // 保存到本地存储
  localStorage.setItem('monitoringData', JSON.stringify(linksData));
  
  // 更新UI
  updateUI();
}

/**
 * 检查单个链接状态
 * @param {number} index - 链接在数组中的索引
 */
async function checkLinkStatus(index) {
  const link = linksData[index];
  const startTime = Date.now();
  
  try {
    // 使用代理服务检查链接状态，避免跨域问题
    // 注意：实际使用时需要替换为你自己的代理服务
    const proxyUrl = `/api/check-status?url=${encodeURIComponent(link.url)}`;
    
    // 模拟检查过程（实际环境中应使用真实的API）
    // 在实际应用中，你需要创建一个服务端API来检查链接状态
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
    
    // 随机模拟在线/离线状态（仅用于演示）
    const isOnline = Math.random() > 0.3;
    
    // 更新链接状态
    linksData[index] = {
      ...link,
      status: isOnline ? 'online' : 'offline',
      responseTime: isOnline ? Math.floor(Math.random() * 500 + 100) : null,
      lastChecked: new Date().toISOString()
    };
  } catch (error) {
    console.error(`检查链接 ${link.url} 失败:`, error);
    linksData[index] = {
      ...link,
      status: 'offline',
      responseTime: null,
      lastChecked: new Date().toISOString()
    };
  }
}

/**
 * 根据状态筛选链接
 */
function filterLinks() {
  const filter = document.getElementById('status-filter').value;
  
  if (filter === 'all') {
    filteredLinks = [...linksData];
  } else {
    filteredLinks = linksData.filter(link => link.status === filter);
  }
  
  renderLinksList();
}

/**
 * 更新UI
 */
function updateUI() {
  // 更新统计数据
  const totalLinks = linksData.length;
  const onlineLinks = linksData.filter(link => link.status === 'online').length;
  const offlineLinks = linksData.filter(link => link.status === 'offline').length;
  
  document.getElementById('total-links').textContent = totalLinks;
  document.getElementById('online-links').textContent = onlineLinks;
  document.getElementById('offline-links').textContent = offlineLinks;
  
  // 应用当前筛选
  filterLinks();
}

/**
 * 渲染链接列表
 */
function renderLinksList() {
  const list = document.getElementById('monitoring-list');
  list.innerHTML = '';
  
  if (filteredLinks.length === 0) {
    list.innerHTML = '<div class="monitoring-loading">没有符合条件的链接</div>';
    return;
  }
  
  filteredLinks.forEach(link => {
    const item = document.createElement('div');
    item.className = `monitoring-item status-${link.status}`;
    
    const lastCheckedTime = link.lastChecked 
      ? new Date(link.lastChecked).toLocaleString('zh-CN', {hour: '2-digit', minute: '2-digit', second: '2-digit'}) 
      : '未检查';
    
    item.innerHTML = `
      <div class="monitoring-item-header">
        <div class="site-name">${link.name}</div>
        <span class="status-badge status-${link.status}">${link.status === 'online' ? '在线' : '离线'}</span>
      </div>
      <div class="monitoring-item-body">
        <div class="site-url">
          <a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.url}</a>
        </div>
        <div class="monitoring-details">
          <div class="detail-item">
            <div class="detail-value">${link.responseTime ? link.responseTime + 'ms' : 'N/A'}</div>
            <div class="detail-label">响应时间</div>
          </div>
          <div class="detail-item">
            <div class="detail-value">${lastCheckedTime}</div>
            <div class="detail-label">最后检查</div>
          </div>
        </div>
      </div>
    `;
    
    list.appendChild(item);
  });
}