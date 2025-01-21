// 更新JavaScript状态
function updateJavaScript(tabId, enabled) {
  if (!enabled) {
    // 禁用JavaScript
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      function: () => {
        // 保存原始的定时器函数
        window._originalSetTimeout = window.setTimeout;
        window._originalSetInterval = window.setInterval;
        
        // 禁用所有定时器
        window.setTimeout = function() { return 0; };
        window.setInterval = function() { return 0; };
        
        // 禁用事件监听器
        const originalAddEventListener = EventTarget.prototype.addEventListener;
        EventTarget.prototype.addEventListener = function() { return; };
        
        // 禁用所有现有的事件处理器
        document.querySelectorAll('*').forEach(element => {
          const clone = element.cloneNode(true);
          element.parentNode.replaceChild(clone, element);
        });
      }
    });

    // 显示通知
    chrome.notifications.create('js-disabled', {
      type: 'basic',
      iconUrl: '/images/js128.png',
      title: 'JavaScript 控制器',
      message: '当前页面JavaScript已禁用',
      priority: 0,
      requireInteraction: false
    });

    // 1秒后自动关闭通知
    setTimeout(() => {
      chrome.notifications.clear('js-disabled');
    }, 2500);
  }
}

// 监听图标点击事件
chrome.action.onClicked.addListener((tab) => {
  const tabId = tab.id;
  
  // 获取当前状态并切换
  chrome.storage.local.get(['jsStatus'], function(result) {
    const jsStatus = result.jsStatus || {};
    const currentStatus = jsStatus[tabId] !== false;
    const newStatus = !currentStatus;
    
    // 更新状态
    jsStatus[tabId] = newStatus;
    chrome.storage.local.set({jsStatus: jsStatus});
    
    // 更新JavaScript
    updateJavaScript(tabId, newStatus);
  });
});

// 监听标签页关闭事件
chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.local.get(['jsStatus'], function(result) {
    if (result.jsStatus && result.jsStatus[tabId]) {
      const jsStatus = result.jsStatus;
      delete jsStatus[tabId];
      chrome.storage.local.set({jsStatus: jsStatus});
    }
  });
}); 