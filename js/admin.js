/**
 * admin.js - 文山退葆志工班表系統管理端主入口文件
 * 
 * 整合所有模塊，初始化系統
 */

// 組件模塊註冊
const componentsModule = {
  // 儀表板
  dashboard: window.dashboardModule || {
    load: function() {
      console.warn('儀表板模塊未載入');
    }
  },
  
  // 班表管理
  schedules: window.schedulesModule || {
    load: function() {
      console.warn('班表管理模塊未載入');
    }
  },
  
  // 志工管理
  volunteers: window.volunteersModule || {
    load: function() {
      console.warn('志工管理模塊未載入');
    }
  },
  
  // 站點管理
  locations: window.locationsModule || {
    load: function() {
      console.warn('站點管理模塊未載入');
    }
  },
  
  // 通知系統
  notification: window.notificationsModule || {
    load: function() {
      console.warn('通知系統模塊未載入');
    }
  },
  
  // 統計報表
  reports: window.reportsModule || {
    load: function() {
      console.warn('統計報表模塊未載入');
    }
  },
  
  // 管理員設定
  admins: window.adminsModule || {
    load: function() {
      console.warn('管理員設定模塊未載入');
    }
  },
  
  // 系統設定
  system: window.systemModule || {
    load: function() {
      console.warn('系統設定模塊未載入');
    }
  }
};

// 註冊組件模塊到全局
window.componentsModule = componentsModule;

/**
 * 載入初始資料
 */
async function loadInitialData() {
  // 顯示載入指示器
  document.getElementById('mainLoader').classList.remove('d-none');
  document.getElementById('mainContent').classList.add('d-none');
  
  try {
    // 首先加載系統配置
    await loadRemoteConfig();
    
    // 並行載入多個資料
    await Promise.all([
      // 加載班表資料
      window.schedulesModule ? window.schedulesModule.fetchSchedules() : Promise.resolve(),
      
      // 加載志工資料
      window.volunteersModule ? window.volunteersModule.fetchVolunteers() : Promise.resolve(),
      
      // 加載站點資料
      window.locationsModule ? window.locationsModule.fetchLocations() : Promise.resolve()
    ]);
    
    // 顯示儀表板
    window.uiModule.switchView('dashboard');
    
    // 隱藏載入指示器
    window.utilsModule.hideLoadingIndicator();
  } catch (error) {
    console.error('載入初始資料時出錯:', error);
    window.utilsModule.showGlobalError('載入資料時發生錯誤，請重新整理頁面或聯絡系統管理員');
    
    // 隱藏載入指示器
    window.utilsModule.hideLoadingIndicator();
  }
}

/**
 * 初始化應用
 */
function initApp() {
  // 檢查是否已登入
  if (!window.authModule.checkAdminLogin()) {
    // 未登入狀態，但在登入頁面，設置登入表單事件
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', window.authModule.handleAdminLogin);
    }
    return;
  }
  
  // 已登入狀態，設置 UI 事件
  window.uiModule.setupEventListeners();
  
  // 監聽視圖加載事件
  document.addEventListener('view-loaded', function(e) {
    const viewName = e.detail.view;
    
    if (componentsModule[viewName] && typeof componentsModule[viewName].load === 'function') {
      componentsModule[viewName].load();
    }
  });
}

// DOM 載入完成後初始化
document.addEventListener('DOMContentLoaded', function() {
  // 初始化應用
  initApp();
});
