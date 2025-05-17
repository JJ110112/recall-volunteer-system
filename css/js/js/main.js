// 頁面載入完成後執行
document.addEventListener('DOMContentLoaded', function() {
  // 獲取系統資訊
  fetchSystemInfo();
});

// 獲取系統資訊
function fetchSystemInfo() {
  fetch(`${CONFIG.API_URL}?action=getSystemInfo`)
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // 更新版本號
        document.getElementById('version').textContent = data.version;
        
        // 更新頁面標題
        document.title = data.systemName;
      } else {
        console.error('無法獲取系統資訊:', data.message);
      }
    })
    .catch(error => {
      console.error('API請求錯誤:', error);
      document.getElementById('version').textContent = 'API連接錯誤';
    });
}
