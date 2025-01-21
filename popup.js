document.addEventListener('DOMContentLoaded', function() {
  const toggle = document.getElementById('jsToggle');
  const status = document.getElementById('status');

  // 获取当前标签页
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0]) {
      const tabId = tabs[0].id;
      
      // 从storage中读取当前标签页的状态
      chrome.storage.local.get(['jsStatus'], function(result) {
        const jsStatus = result.jsStatus || {};
        toggle.checked = jsStatus[tabId] !== false;
        updateStatus(toggle.checked);
        updateJavaScript(tabId, toggle.checked);
      });

      toggle.addEventListener('change', function() {
        const enabled = toggle.checked;
        
        // 保存当前标签页的状态
        chrome.storage.local.get(['jsStatus'], function(result) {
          const jsStatus = result.jsStatus || {};
          jsStatus[tabId] = enabled;
          chrome.storage.local.set({jsStatus: jsStatus});
        });
        
        // 更新JavaScript状态
        updateJavaScript(tabId, enabled);
        
        updateStatus(enabled);
      });
    }
  });

  function updateStatus(enabled) {
    if (enabled) {
      status.textContent = 'JavaScript 已启用（需要手动刷新页面生效）';
    } else {
      status.textContent = 'JavaScript 已禁用';
    }
  }

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
    }
  }
}); 