// 监听标签页关闭事件
chrome.tabs.onRemoved.addListener((tabId) => {
  // 清理关闭标签页的状态
  chrome.storage.local.get(['jsStatus'], function(result) {
    if (result.jsStatus && result.jsStatus[tabId]) {
      const jsStatus = result.jsStatus;
      delete jsStatus[tabId];
      chrome.storage.local.set({jsStatus: jsStatus});
    }
  });
}); 