// 更新JavaScript状态
function updateJavaScript(tabId) {
  // 直接禁用JavaScript，不需要检查enabled状态
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
  }, 750);
}

// 监听图标点击事件
chrome.action.onClicked.addListener((tab) => {
  // 直接执行禁用操作，不再检查状态
  updateJavaScript(tab.id);
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