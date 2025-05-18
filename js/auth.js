/**
 * auth.js - 文山退葆志工班表系統認證模組
 * 
 * 處理管理員認證、會話管理相關功能
 */

// 當前登入的管理員資訊
let currentAdmin = null;

/**
 * 處理管理員登入
 * @param {Event} e - 表單提交事件
 */
async function handleAdminLogin(e) {
  e.preventDefault();
  
  const adminId = document.getElementById('adminId').value.trim();
  const adminName = document.getElementById('adminName').value.trim();
  const resultDiv = document.getElementById('loginResult');
  
  if (!adminId || !adminName) {
    showMessage(resultDiv, 'danger', '請填寫所有必填欄位');
    return;
  }
  
  // 顯示載入中訊息
  showMessage(resultDiv, 'info', '<i class="bi bi-hourglass-split"></i> 正在驗證管理員身份...');
  
  // 準備驗證資料
  const loginData = {
    adminId: adminId,
    adminName: adminName
  };
  
  try {
    // 替代方案：如果是 Demo 管理員，允許直接登入（不調用 API）
    if (adminId === 'ADMIN001' && adminName === 'Demo管理員') {
      // 模擬成功登入
      currentAdmin = {
        id: adminId,
        name: adminName,
        role: 'admin',
        permissions: ['manage_volunteers', 'manage_schedules', 'manage_admins', 'manage_locations']
      };
      
      // 儲存登入資訊到 localStorage
      saveAdminSession(currentAdmin);
      
      // 顯示成功訊息
      showMessage(resultDiv, 'success', '<i class="bi bi-check-circle"></i> 登入成功！正在轉到管理儀表板...');
      
      // 延遲 1 秒後轉到管理儀表板
      setTimeout(() => {
        window.location.href = 'admin-dashboard.html';
      }, 1000);
      return;
    }
    
    // 正式環境中的 API 調用
    const response = await fetch(CONFIG.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'adminLogin',
        adminId: adminId,
        adminName: adminName
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // 登入成功
      currentAdmin = {
        id: adminId,
        name: adminName,
        role: data.role || 'admin',
        permissions: data.permissions || ['manage_volunteers', 'manage_schedules']
      };
      
      // 儲存登入資訊到 localStorage
      saveAdminSession(currentAdmin);
      
      // 顯示成功訊息
      showMessage(resultDiv, 'success', '<i class="bi bi-check-circle"></i> 登入成功！正在轉到管理儀表板...');
      
      // 延遲 1 秒後轉到管理儀表板
      setTimeout(() => {
        window.location.href = 'admin-dashboard.html';
      }, 1000);
    } else {
      // 登入失敗
      showMessage(resultDiv, 'danger', '<i class="bi bi-exclamation-triangle"></i> ' + (data.message || '管理員 ID 或姓名錯誤'));
    }
  } catch (error) {
    console.error('登入錯誤:', error);
    showMessage(resultDiv, 'danger', '<i class="bi bi-exclamation-triangle"></i> 連接伺服器時發生錯誤，請稍後再試');
  }
}

/**
 * 儲存管理員登入資訊到 localStorage
 * @param {Object} adminData - 管理員資料
 */
function saveAdminSession(adminData) {
  localStorage.setItem(CONFIG.STORAGE_KEYS.ADMIN_SESSION, JSON.stringify({
    admin: adminData,
    timestamp: new Date().getTime()
  }));
}

/**
 * 檢查管理員是否已登入
 * @returns {boolean} - 是否已登入
 */
function checkAdminLogin() {
  const adminSession = localStorage.getItem(CONFIG.STORAGE_KEYS.ADMIN_SESSION);
  
  if (adminSession) {
    try {
      const session = JSON.parse(adminSession);
      const currentTime = new Date().getTime();
      const sessionTime = session.timestamp;
      
      // 檢查登入是否在24小時內
      if (currentTime - sessionTime < CONFIG.SESSION_TIMEOUT) {
        currentAdmin = session.admin;
        
        // 如果在登入頁面但已登入，重定向到儀表板
        if (window.location.pathname.includes('admin.html')) {
          window.location.href = 'admin-dashboard.html';
          return true;
        }
        
        // 更新頁面上的管理員資訊
        updateAdminInfo();
        
        // 調用加載初始資料的函數（如果存在）
        if (typeof loadInitialData === 'function') {
          loadInitialData();
        }
        
        return true;
      }
    } catch (e) {
      console.error('解析登入資訊時出錯:', e);
    }
  }
  
  // 如果不在登入頁面但尚未登入，重定向到登入頁面
  if (!window.location.pathname.includes('admin.html') && !window.location.pathname.includes('index.html')) {
    window.location.href = 'admin.html';
  }
  
  return false;
}

/**
 * 處理登出
 */
function handleLogout() {
  // 清除 localStorage
  localStorage.removeItem(CONFIG.STORAGE_KEYS.ADMIN_SESSION);
  
  // 重定向到登入頁面
  window.location.href = 'admin.html';
}

/**
 * 更新頁面上的管理員資訊
 */
function updateAdminInfo() {
  const adminNameElement = document.getElementById('adminName');
  if (adminNameElement && currentAdmin) {
    adminNameElement.textContent = currentAdmin.name;
  }
  
  // 根據管理員權限顯示/隱藏特定功能
  updateUIByPermissions();
}

/**
 * 根據管理員權限更新 UI
 */
function updateUIByPermissions() {
  if (!currentAdmin || !currentAdmin.permissions) return;
  
  // 隱藏沒有權限的功能
  if (!currentAdmin.permissions.includes('manage_admins')) {
    const adminManagementNav = document.querySelector('[data-view="admins"]');
    if (adminManagementNav) {
      adminManagementNav.classList.add('d-none');
    }
  }
  
  if (!currentAdmin.permissions.includes('manage_system')) {
    const systemSettingsNav = document.querySelector('[data-view="system"]');
    if (systemSettingsNav) {
      systemSettingsNav.classList.add('d-none');
    }
  }
}

/**
 * 獲取當前登入的管理員
 * @returns {Object|null} - 當前管理員資訊
 */
function getCurrentAdmin() {
  return currentAdmin;
}

// 導出模塊
window.authModule = {
  handleAdminLogin,
  checkAdminLogin,
  handleLogout,
  updateAdminInfo,
  getCurrentAdmin
};
