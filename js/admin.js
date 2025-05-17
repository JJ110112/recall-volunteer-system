/**
 * 罷免志工班表系統 - 管理員頁面 JavaScript
 * 
 * 此文件包含管理員儀表板和功能的所有 JavaScript 代碼
 * 連接到 Google Apps Script 後端 API
 */

// 全局變數
let currentAdmin = null;
let systemConfig = {};
let currentView = 'dashboard';
let volunteerData = [];
let scheduleData = [];
let locationData = [];
let adminData = [];

// API 基礎 URL (應從 config.js 獲取)
const API_BASE_URL = CONFIG.API_URL || 'https://script.google.com/macros/s/your-script-id/exec';

// DOM 載入完成後初始化
document.addEventListener('DOMContentLoaded', function() {
  // 檢查是否已登入
  checkAdminLogin();
  
  // 註冊事件監聽器
  setupEventListeners();
});

/**
 * 設置事件監聽器
 */
function setupEventListeners() {
  // 登入表單提交
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleAdminLogin);
  }
  
  // 側邊欄導航點擊
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
      if (this.getAttribute('data-view')) {
        e.preventDefault();
        switchView(this.getAttribute('data-view'));
      }
    });
  });
  
  // 登出按鈕
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
}

/**
 * 處理管理員登入
 */
function handleAdminLogin(e) {
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
  
  // 驗證管理員身份 (模擬 API 調用)
  if (adminId === 'ADMIN001' && adminName === 'Demo管理員') {
    // 模擬成功登入 (在實際實現中，這裡應該呼叫 API 進行驗證)
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
  } else {
    // 模擬 API 呼叫
    fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'adminLogin',
        adminId: adminId,
        adminName: adminName
      })
    })
    .then(response => response.json())
    .then(data => {
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
    })
    .catch(error => {
      console.error('登入錯誤:', error);
      showMessage(resultDiv, 'danger', '<i class="bi bi-exclamation-triangle"></i> 連接伺服器時發生錯誤，請稍後再試');
    });
  }
}

/**
 * 儲存管理員登入資訊到 localStorage
 */
function saveAdminSession(adminData) {
  localStorage.setItem('adminSession', JSON.stringify({
    admin: adminData,
    timestamp: new Date().getTime()
  }));
}

/**
 * 檢查管理員是否已登入
 */
function checkAdminLogin() {
  const adminSession = localStorage.getItem('adminSession');
  
  if (adminSession) {
    try {
      const session = JSON.parse(adminSession);
      const currentTime = new Date().getTime();
      const sessionTime = session.timestamp;
      
      // 檢查登入是否在24小時內
      if (currentTime - sessionTime < 24 * 60 * 60 * 1000) {
        currentAdmin = session.admin;
        
        // 如果在登入頁面但已登入，重定向到儀表板
        if (window.location.pathname.includes('admin.html')) {
          window.location.href = 'admin-dashboard.html';
          return;
        }
        
        // 更新頁面上的管理員資訊
        updateAdminInfo();
        
        // 載入初始資料
        loadInitialData();
        return;
      }
    } catch (e) {
      console.error('解析登入資訊時出錯:', e);
    }
  }
  
  // 如果不在登入頁面但尚未登入，重定向到登入頁面
  if (!window.location.pathname.includes('admin.html') && !window.location.pathname.includes('index.html')) {
    window.location.href = 'admin.html';
  }
}

/**
 * 處理登出
 */
function handleLogout() {
  // 清除 localStorage
  localStorage.removeItem('adminSession');
  
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
 * 載入初始資料
 */
function loadInitialData() {
  // 並行載入多個資料
  Promise.all([
    fetchSystemInfo(),
    fetchVolunteers(),
    fetchSchedules(),
    fetchLocations()
  ])
  .then(() => {
    // 顯示儀表板
    switchView('dashboard');
    
    // 隱藏載入指示器
    hideLoadingIndicator();
  })
  .catch(error => {
    console.error('載入初始資料時出錯:', error);
    showGlobalError('載入資料時發生錯誤，請重新整理頁面或聯絡系統管理員');
  });
}

/**
 * 獲取系統資訊
 */
function fetchSystemInfo() {
  return fetch(`${API_BASE_URL}?action=getSystemInfo`)
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        systemConfig = data;
        updateSystemInfo(data);
      } else {
        console.error('獲取系統資訊失敗:', data.message);
      }
    })
    .catch(error => {
      console.error('獲取系統資訊時出錯:', error);
      return Promise.reject(error);
    });
}

/**
 * 獲取志工資料
 */
function fetchVolunteers() {
  // 模擬資料獲取 (實際實現應調用 API)
  return new Promise((resolve) => {
    setTimeout(() => {
      volunteerData = [
        { id: 'REG-123456', name: '張志工', area: '南中正', date: '2025-05-20', timeSlot: 'TS-001', location: '捷運古亭站', status: '已報名', contact: '0912-345-678' },
        { id: 'REG-123457', name: '王助人', area: '南中正', date: '2025-05-20', timeSlot: 'TS-002', location: '捷運東門站', status: '已出席', contact: '0923-456-789' },
        { id: 'REG-123458', name: '李參與', area: '景美', date: '2025-05-21', timeSlot: 'TS-003', location: '景美火車站', status: '未簽到', contact: '0934-567-890' }
      ];
      resolve(volunteerData);
    }, 300);
  });
}

/**
 * 獲取班表資料
 */
function fetchSchedules() {
  // 模擬資料獲取 (實際實現應調用 API)
  return new Promise((resolve) => {
    setTimeout(() => {
      scheduleData = [
        { id: 'TS-001', area: '南中正', date: '2025-05-20', time: '08:00 - 10:00', location: '捷運古亭站', requiredCount: 3, currentCount: 2, status: '不足' },
        { id: 'TS-002', area: '南中正', date: '2025-05-20', time: '10:00 - 12:00', location: '捷運東門站', requiredCount: 2, currentCount: 2, status: '充足' },
        { id: 'TS-003', area: '景美', date: '2025-05-21', time: '14:00 - 16:00', location: '景美火車站', requiredCount: 4, currentCount: 1, status: '極度不足' }
      ];
      resolve(scheduleData);
    }, 300);
  });
}

/**
 * 獲取站點資料
 */
function fetchLocations() {
  // 模擬資料獲取 (實際實現應調用 API)
  return new Promise((resolve) => {
    setTimeout(() => {
      locationData = [
        { id: 'LOC-001', name: '捷運古亭站', area: '南中正', address: '台北市中正區羅斯福路二段', mapLink: 'https://goo.gl/maps/example1', suggestedCount: 3 },
        { id: 'LOC-002', name: '捷運東門站', area: '南中正', address: '台北市大安區信義路二段', mapLink: 'https://goo.gl/maps/example2', suggestedCount: 2 },
        { id: 'LOC-003', name: '景美火車站', area: '景美', address: '台北市文山區景中街', mapLink: 'https://goo.gl/maps/example3', suggestedCount: 4 }
      ];
      resolve(locationData);
    }, 300);
  });
}

/**
 * 獲取管理員資料
 */
function fetchAdmins() {
  // 模擬資料獲取 (實際實現應調用 API)
  return new Promise((resolve) => {
    setTimeout(() => {
      adminData = [
        { id: 'ADMIN001', name: 'Demo管理員', role: '總管理員', area: '全區域', status: '啟用' },
        { id: 'ADMIN002', name: '南中正組長', role: '區域組長', area: '南中正', status: '啟用' },
        { id: 'ADMIN003', name: '景美組長', role: '區域組長', area: '景美', status: '啟用' }
      ];
      resolve(adminData);
    }, 300);
  });
}

/**
 * 更新系統資訊顯示
 */
function updateSystemInfo(data) {
  const systemNameElement = document.getElementById('systemName');
  if (systemNameElement) {
    systemNameElement.textContent = data.systemName || '罷免志工班表系統';
  }
  
  const versionElement = document.getElementById('versionInfo');
  if (versionElement) {
    versionElement.textContent = `版本: ${data.version || '1.0.0'}`;
  }
}

/**
 * 切換主要視圖
 */
function switchView(viewName) {
  // 保存當前視圖
  currentView = viewName;
  
  // 更新導航高亮
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('data-view') === viewName) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
  
  // 隱藏所有視圖容器
  document.querySelectorAll('.view-container').forEach(container => {
    container.classList.add('d-none');
  });
  
  // 顯示選定的視圖
  const selectedView = document.getElementById(`${viewName}View`);
  if (selectedView) {
    selectedView.classList.remove('d-none');
    
    // 載入特定視圖的資料
    loadViewData(viewName);
  }
}

/**
 * 載入特定視圖的資料
 */
function loadViewData(viewName) {
  switch (viewName) {
    case 'dashboard':
      renderDashboard();
      break;
    case 'schedules':
      renderSchedules();
      break;
    case 'volunteers':
      renderVolunteers();
      break;
    case 'locations':
      fetchLocations().then(renderLocations);
      break;
    case 'admins':
      fetchAdmins().then(renderAdmins);
      break;
    case 'notification':
      renderNotificationSystem();
      break;
    case 'reports':
      renderReports();
      break;
    case 'system':
      renderSystemSettings();
      break;
  }
}

/**
 * 渲染儀表板
 */
function renderDashboard() {
  const urgentSlotsElement = document.getElementById('urgentSlotsList');
  if (urgentSlotsElement) {
    const urgentSlots = scheduleData.filter(slot => slot.status === '極度不足' || slot.status === '不足');
    
    if (urgentSlots.length > 0) {
      let html = '';
      
      urgentSlots.forEach(slot => {
        const statusClass = slot.status === '極度不足' ? 'danger' : 'warning';
        html += `
          <div class="card mb-2">
            <div class="card-body p-3">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="mb-0">${slot.location}</h6>
                  <small class="text-muted">${slot.date} ${slot.time}</small>
                </div>
                <div>
                  <span class="badge bg-${statusClass}">${slot.status}</span>
                  <span class="ms-2">${slot.currentCount}/${slot.requiredCount}</span>
                </div>
              </div>
            </div>
          </div>
        `;
      });
      
      urgentSlotsElement.innerHTML = html;
    } else {
      urgentSlotsElement.innerHTML = '<div class="alert alert-success">目前沒有人力不足的班表</div>';
    }
  }
  
  const todaySlotsElement = document.getElementById('todaySlotsList');
  if (todaySlotsElement) {
    // 獲取今天的日期
    const today = new Date();
    const formattedToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const todaySlots = scheduleData.filter(slot => slot.date === formattedToday);
    
    if (todaySlots.length > 0) {
      let html = '';
      
      todaySlots.forEach(slot => {
        let statusClass = 'success';
        if (slot.status === '不足') statusClass = 'warning';
        if (slot.status === '極度不足') statusClass = 'danger';
        
        html += `
          <div class="card mb-2">
            <div class="card-body p-3">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="mb-0">${slot.location}</h6>
                  <small class="text-muted">${slot.area} ${slot.time}</small>
                </div>
                <div>
                  <span class="badge bg-${statusClass}">${slot.status}</span>
                  <span class="ms-2">${slot.currentCount}/${slot.requiredCount}</span>
                </div>
              </div>
            </div>
          </div>
        `;
      });
      
      todaySlotsElement.innerHTML = html;
    } else {
      todaySlotsElement.innerHTML = '<div class="alert alert-info">今日沒有班表</div>';
    }
  }
  
  // 更新統計數字
  updateStatistics();
}

/**
 * 更新統計數字
 */
function updateStatistics() {
  // 總志工人數
  document.getElementById('totalVolunteers').textContent = volunteerData.length;
  
  // 總班表數量
  document.getElementById('totalSlots').textContent = scheduleData.length;
  
  // 人力不足班表
  const urgentSlots = scheduleData.filter(slot => slot.status === '極度不足' || slot.status === '不足').length;
  document.getElementById('urgentSlots').textContent = urgentSlots;
  
  // 已簽到志工
  const checkedIn = volunteerData.filter(volunteer => volunteer.status === '已出席').length;
  document.getElementById('checkedInVolunteers').textContent = checkedIn;
}

/**
 * 渲染班表管理
 */
function renderSchedules() {
  const schedulesTableBody = document.getElementById('schedulesTableBody');
  if (!schedulesTableBody) return;
  
  let html = '';
  
  scheduleData.forEach(slot => {
    let statusBadge = '';
    if (slot.status === '充足') {
      statusBadge = '<span class="badge bg-success">充足</span>';
    } else if (slot.status === '不足') {
      statusBadge = '<span class="badge bg-warning">不足</span>';
    } else if (slot.status === '極度不足') {
      statusBadge = '<span class="badge bg-danger">極度不足</span>';
    }
    
    html += `
      <tr data-slot-id="${slot.id}">
        <td>${slot.area}</td>
        <td>${slot.date}</td>
        <td>${slot.time}</td>
        <td>${slot.location}</td>
        <td>${slot.currentCount}/${slot.requiredCount}</td>
        <td>${statusBadge}</td>
        <td>
          <button class="btn btn-sm btn-primary view-slot-btn" data-slot-id="${slot.id}">
            <i class="bi bi-eye"></i>
          </button>
          <button class="btn btn-sm btn-success send-notification-btn" data-slot-id="${slot.id}">
            <i class="bi bi-bell"></i>
          </button>
          <button class="btn btn-sm btn-danger delete-slot-btn" data-slot-id="${slot.id}">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `;
  });
  
  schedulesTableBody.innerHTML = html;
  
  // 註冊點擊事件
  document.querySelectorAll('.view-slot-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const slotId = this.getAttribute('data-slot-id');
      viewSlotDetails(slotId);
    });
  });
  
  document.querySelectorAll('.send-notification-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const slotId = this.getAttribute('data-slot-id');
      openSendNotificationModal(slotId);
    });
  });
  
  document.querySelectorAll('.delete-slot-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const slotId = this.getAttribute('data-slot-id');
      confirmDeleteSlot(slotId);
    });
  });
}

/**
 * 渲染志工管理
 */
function renderVolunteers() {
  const volunteersTableBody = document.getElementById('volunteersTableBody');
  if (!volunteersTableBody) return;
  
  let html = '';
  
  volunteerData.forEach(volunteer => {
    let statusBadge = '';
    if (volunteer.status === '已出席') {
      statusBadge = '<span class="badge bg-success">已出席</span>';
    } else if (volunteer.status === '未簽到') {
      statusBadge = '<span class="badge bg-warning">未簽到</span>';
    } else {
      statusBadge = '<span class="badge bg-secondary">已報名</span>';
    }
    
    html += `
      <tr data-volunteer-id="${volunteer.id}">
        <td>${volunteer.name}</td>
        <td>${volunteer.contact}</td>
        <td>${volunteer.area}</td>
        <td>${volunteer.date}</td>
        <td>${volunteer.location}</td>
        <td>${statusBadge}</td>
        <td>
          <button class="btn btn-sm btn-primary view-volunteer-btn" data-volunteer-id="${volunteer.id}">
            <i class="bi bi-eye"></i>
          </button>
          <button class="btn btn-sm btn-success update-attendance-btn" data-volunteer-id="${volunteer.id}">
            <i class="bi bi-check-circle"></i>
          </button>
          <button class="btn btn-sm btn-info send-volunteer-notification-btn" data-volunteer-id="${volunteer.id}">
            <i class="bi bi-bell"></i>
          </button>
        </td>
      </tr>
    `;
  });
  
  volunteersTableBody.innerHTML = html;
  
  // 註冊點擊事件
  document.querySelectorAll('.view-volunteer-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const volunteerId = this.getAttribute('data-volunteer-id');
      viewVolunteerDetails(volunteerId);
    });
  });
  
  document.querySelectorAll('.update-attendance-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const volunteerId = this.getAttribute('data-volunteer-id');
      openUpdateAttendanceModal(volunteerId);
    });
  });
  
  document.querySelectorAll('.send-volunteer-notification-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const volunteerId = this.getAttribute('data-volunteer-id');
      openSendVolunteerNotificationModal(volunteerId);
    });
  });
}

/**
 * 渲染站點管理
 */
function renderLocations(locations) {
  const locationsTableBody = document.getElementById('locationsTableBody');
  if (!locationsTableBody) return;
  
  let html = '';
  
  locations.forEach(location => {
    html += `
      <tr data-location-id="${location.id}">
        <td>${location.name}</td>
        <td>${location.area}</td>
        <td>${location.address}</td>
        <td>${location.suggestedCount}</td>
        <td>
          <button class="btn btn-sm btn-primary edit-location-btn" data-location-id="${location.id}">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-danger delete-location-btn" data-location-id="${location.id}">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `;
  });
  
  locationsTableBody.innerHTML = html;
  
  // 註冊點擊事件
  document.querySelectorAll('.edit-location-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const locationId = this.getAttribute('data-location-id');
      openEditLocationModal(locationId);
    });
  });
  
  document.querySelectorAll('.delete-location-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const locationId = this.getAttribute('data-location-id');
      confirmDeleteLocation(locationId);
    });
  });
}

/**
 * 渲染管理員管理
 */
function renderAdmins(admins) {
  const adminsTableBody = document.getElementById('adminsTableBody');
  if (!adminsTableBody) return;
  
  let html = '';
  
  admins.forEach(admin => {
    const statusBadge = admin.status === '啟用' 
      ? '<span class="badge bg-success">啟用</span>' 
      : '<span class="badge bg-danger">停用</span>';
    
    html += `
      <tr data-admin-id="${admin.id}">
        <td>${admin.name}</td>
        <td>${admin.role}</td>
        <td>${admin.area}</td>
        <td>${statusBadge}</td>
        <td>
          <button class="btn btn-sm btn-primary edit-admin-btn" data-admin-id="${admin.id}">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-danger toggle-admin-status-btn" data-admin-id="${admin.id}">
            <i class="bi bi-power"></i>
          </button>
        </td>
      </tr>
    `;
  });
  
  adminsTableBody.innerHTML = html;
  
  // 註冊點擊事件
  document.querySelectorAll('.edit-admin-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const adminId = this.getAttribute('data-admin-id');
      openEditAdminModal(adminId);
    });
  });
  
  document.querySelectorAll('.toggle-admin-status-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const adminId = this.getAttribute('data-admin-id');
      toggleAdminStatus(adminId);
    });
  });
}

/**
 * 渲染通知系統
 */
function renderNotificationSystem() {
  // 載入區域選項
  const areaSelectElement = document.getElementById('notificationAreaSelect');
  if (areaSelectElement) {
    const areas = [...new Set(locationData.map(location => location.area))];
    
    let html = '<option value="">選擇區域</option>';
    areas.forEach(area => {
      html += `<option value="${area}">${area}</option>`;
    });
    
    areaSelectElement.innerHTML = html;
    
    // 註冊變更事件
    areaSelectElement.addEventListener('change', function() {
      const selectedArea = this.value;
      updateTimeSlotOptions(selectedArea);
    });
  }
  
  // 註冊發送通知按鈕
  const sendNotificationBtn = document.getElementById('sendNotificationBtn');
  if (sendNotificationBtn) {
    sendNotificationBtn.addEventListener('click', sendNotification);
  }
}

/**
 * 更新時段選項
 */
function updateTimeSlotOptions(area) {
  const timeSlotSelectElement = document.getElementById('notificationTimeSlotSelect');
  if (!timeSlotSelectElement) return;
  
  if (!area) {
    timeSlotSelectElement.innerHTML = '<option value="">請先選擇區域</option>';
    timeSlotSelectElement.disabled = true;
    return;
  }
  
  // 過濾該區域的時段
  const slots = scheduleData.filter(slot => slot.area === area);
  
  let html = '<option value="">選擇時段</option>';
  slots.forEach(slot => {
    html += `<option value="${slot.id}">${slot.date} ${slot.time} - ${slot.location}</option>`;
  });
  
  timeSlotSelectElement.innerHTML = html;
  timeSlotSelectElement.disabled = false;
}

/**
 * 發送通知
 */
function sendNotification() {
  const type = document.getElementById('notificationType').value;
  const area = document.getElementById('notificationAreaSelect').value;
  const timeSlotId = document.getElementById('notificationTimeSlotSelect').value;
  const content = document.getElementById('notificationContent').value;
  
  if (!type || !content) {
    showMessage(document.getElementById('notificationResult'), 'danger', '通知類型和內容為必填');
    return;
  }
  
  if (!area && !timeSlotId) {
    showMessage(document.getElementById('notificationResult'), 'danger', '請選擇區域或時段');
    return;
  }
  
  // 顯示載入中訊息
  showMessage(document.getElementById('notificationResult'), 'info', '<i class="bi bi-hourglass-split"></i> 正在發送通知...');
  
  // 準備請求資料
  const notificationData = {
    action: 'sendNotification',
    adminId: currentAdmin.id,
    adminName: currentAdmin.name,
    type: type,
    content: content
  };
  
  if (area) notificationData.area = area;
  if (timeSlotId) notificationData.timeSlotId = timeSlotId;
  
  // 模擬 API 呼叫
  setTimeout(() => {
    // 模擬成功發送
    showMessage(document.getElementById('notificationResult'), 'success', '<i class="bi bi-check-circle"></i> 通知已成功發送給符合條件的志工');
    
    // 清空表單
    document.getElementById('notificationContent').value = '';
  }, 1000);
}

/**
 * 渲染報表頁面
 */
function renderReports() {
  // 獲取日期範圍
  const today = new Date();
  const lastMonth = new Date(today);
  lastMonth.setMonth(today.getMonth() - 1);
  
  const startDate = document.getElementById('reportStartDate');
  const endDate = document.getElementById('reportEndDate');
  
  if (startDate && endDate) {
    // 設置默認日期範圍為過去一個月
    startDate.value = formatDateForInput(lastMonth);
    endDate.value = formatDateForInput(today);
    
    // 註冊生成報表按鈕事件
    const generateReportBtn = document.getElementById('generateReportBtn');
    if (generateReportBtn) {
      generateReportBtn.addEventListener('click', generateReport);
    }
  }
}

/**
 * 格式化日期為 input 元素使用的格式
 */
function formatDateForInput(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/**
 * 生成報表
 */
function generateReport() {
  const reportType = document.getElementById('reportType').value;
  const startDate = document.getElementById('reportStartDate').value;
  const endDate = document.getElementById('reportEndDate').value;
  
  if (!reportType || !startDate || !endDate) {
    showMessage(document.getElementById('reportResult'), 'danger', '請填寫所有必填欄位');
    return;
  }
  
  // 顯示載入中訊息
  showMessage(document.getElementById('reportResult'), 'info', '<i class="bi bi-hourglass-split"></i> 正在生成報表...');
  
  // 模擬生成報表
  setTimeout(() => {
    const reportContainer = document.getElementById('reportContainer');
    
    if (reportType === 'volunteer-hours') {
      reportContainer.innerHTML = renderVolunteerHoursReport();
    } else if (reportType === 'attendance-rate') {
      reportContainer.innerHTML = renderAttendanceRateReport();
    } else if (reportType === 'location-popularity') {
      reportContainer.innerHTML = renderLocationPopularityReport();
    } else if (reportType === 'time-distribution') {
      reportContainer.innerHTML = renderTimeDistributionReport();
    }
    
    showMessage(document.getElementById('reportResult'), 'success', '<i class="bi bi-check-circle"></i> 報表已生成');
    
    // 顯示報表容器
    reportContainer.classList.remove('d-none');
  }, 1000);
}

/**
 * 渲染志工時數報表
 */
function renderVolunteerHoursReport() {
  return `
    <div class="card mb-4">
      <div class="card-header">
        <h5 class="mb-0">志工時數統計</h5>
      </div>
      <div class="card-body">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>姓名</th>
              <th>參與場次</th>
              <th>總時數</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>張志工</td>
              <td>5</td>
              <td>10</td>
            </tr>
            <tr>
              <td>王助人</td>
              <td>3</td>
              <td>6</td>
            </tr>
            <tr>
              <td>李參與</td>
              <td>4</td>
              <td>8</td>
            </tr>
          </tbody>
        </table>
        <div class="text-center mt-3">
          <button class="btn btn-primary" onclick="exportReport('volunteer-hours')">
            <i class="bi bi-download"></i> 下載報表
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * 渲染出席率報表
 */
function renderAttendanceRateReport() {
  return `
    <div class="card mb-4">
      <div class="card-header">
        <h5 class="mb-0">出席率統計</h5>
      </div>
      <div class="card-body">
        <div class="chart-container" style="height: 300px;">
          <canvas id="attendanceChart"></canvas>
        </div>
        <div class="mt-3">
          <table class="table table-striped">
            <thead>
              <tr>
                <th>區域</th>
                <th>已報名人數</th>
                <th>出席人數</th>
                <th>出席率</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>南中正</td>
                <td>20</td>
                <td>18</td>
                <td>90%</td>
              </tr>
              <tr>
                <td>景美</td>
                <td>15</td>
                <td>12</td>
                <td>80%</td>
              </tr>
              <tr>
                <td>木柵</td>
                <td>10</td>
                <td>9</td>
                <td>90%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="text-center mt-3">
          <button class="btn btn-primary" onclick="exportReport('attendance-rate')">
            <i class="bi bi-download"></i> 下載報表
          </button>
        </div>
      </div>
    </div>
    <script>
      setTimeout(() => {
        const ctx = document.getElementById('attendanceChart').getContext('2d');
        new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['南中正', '景美', '木柵'],
            datasets: [{
              label: '出席率',
              data: [90, 80, 90],
              backgroundColor: [
                'rgba(75, 192, 192, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(153, 102, 255, 0.2)'
              ],
              borderColor: [
                'rgba(75, 192, 192, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(153, 102, 255, 1)'
              ],
              borderWidth: 1
            }]
          },
          options: {
            scales: {
              y: {
                beginAtZero: true,
                max: 100
              }
            }
          }
        });
      }, 100);
    </script>
  `;
}

/**
 * 渲染站點熱門度報表
 */
function renderLocationPopularityReport() {
  return `
    <div class="card mb-4">
      <div class="card-header">
        <h5 class="mb-0">站點熱門度分析</h5>
      </div>
      <div class="card-body">
        <div class="chart-container" style="height: 300px;">
          <canvas id="locationChart"></canvas>
        </div>
        <div class="mt-3">
          <table class="table table-striped">
            <thead>
              <tr>
                <th>站點</th>
                <th>區域</th>
                <th>總志工人數</th>
                <th>平均每場人數</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>捷運古亭站</td>
                <td>南中正</td>
                <td>25</td>
                <td>3.1</td>
              </tr>
              <tr>
                <td>捷運東門站</td>
                <td>南中正</td>
                <td>18</td>
                <td>2.2</td>
              </tr>
              <tr>
                <td>景美火車站</td>
                <td>景美</td>
                <td>20</td>
                <td>2.5</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="text-center mt-3">
          <button class="btn btn-primary" onclick="exportReport('location-popularity')">
            <i class="bi bi-download"></i> 下載報表
          </button>
        </div>
      </div>
    </div>
    <script>
      setTimeout(() => {
        const ctx = document.getElementById('locationChart').getContext('2d');
        new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['捷運古亭站', '捷運東門站', '景美火車站'],
            datasets: [{
              label: '總志工人數',
              data: [25, 18, 20],
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1
            }, {
              label: '平均每場人數',
              data: [3.1, 2.2, 2.5],
              backgroundColor: 'rgba(153, 102, 255, 0.2)',
              borderColor: 'rgba(153, 102, 255, 1)',
              borderWidth: 1
            }]
          },
          options: {
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
      }, 100);
    </script>
  `;
}

/**
 * 渲染時段分佈報表
 */
function renderTimeDistributionReport() {
  return `
    <div class="card mb-4">
      <div class="card-header">
        <h5 class="mb-0">時段分佈圖</h5>
      </div>
      <div class="card-body">
        <div class="chart-container" style="height: 300px;">
          <canvas id="timeChart"></canvas>
        </div>
        <div class="mt-3">
          <table class="table table-striped">
            <thead>
              <tr>
                <th>時段</th>
                <th>場次數量</th>
                <th>總志工人數</th>
                <th>平均每場人數</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>08:00 - 10:00</td>
                <td>10</td>
                <td>22</td>
                <td>2.2</td>
              </tr>
              <tr>
                <td>10:00 - 12:00</td>
                <td>12</td>
                <td>30</td>
                <td>2.5</td>
              </tr>
              <tr>
                <td>12:00 - 14:00</td>
                <td>8</td>
                <td>16</td>
                <td>2.0</td>
              </tr>
              <tr>
                <td>14:00 - 16:00</td>
                <td>10</td>
                <td>25</td>
                <td>2.5</td>
              </tr>
              <tr>
                <td>16:00 - 18:00</td>
                <td>12</td>
                <td>32</td>
                <td>2.7</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="text-center mt-3">
          <button class="btn btn-primary" onclick="exportReport('time-distribution')">
            <i class="bi bi-download"></i> 下載報表
          </button>
        </div>
      </div>
    </div>
    <script>
      setTimeout(() => {
        const ctx = document.getElementById('timeChart').getContext('2d');
        new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['08:00 - 10:00', '10:00 - 12:00', '12:00 - 14:00', '14:00 - 16:00', '16:00 - 18:00'],
            datasets: [{
              label: '總志工人數',
              data: [22, 30, 16, 25, 32],
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
              tension: 0.1
            }]
          },
          options: {
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
      }, 100);
    </script>
  `;
}

/**
 * 導出報表
 */
function exportReport(reportType) {
  alert(`將導出 ${reportType} 報表（此功能僅為示範）`);
}

/**
 * 渲染系統設定
 */
function renderSystemSettings() {
  // 載入系統設定
  const systemNameInput = document.getElementById('systemName');
  if (systemNameInput) {
    systemNameInput.value = systemConfig.systemName || '罷免志工班表系統';
  }
  
  const versionInput = document.getElementById('versionNumber');
  if (versionInput) {
    versionInput.value = systemConfig.version || '1.0.0';
  }
  
  // 註冊保存設定按鈕
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', saveSystemSettings);
  }
}

/**
 * 保存系統設定
 */
function saveSystemSettings() {
  const systemName = document.getElementById('systemName').value;
  const version = document.getElementById('versionNumber').value;
  
  if (!systemName) {
    showMessage(document.getElementById('settingsResult'), 'danger', '系統名稱為必填');
    return;
  }
  
  // 顯示載入中訊息
  showMessage(document.getElementById('settingsResult'), 'info', '<i class="bi bi-hourglass-split"></i> 正在保存設定...');
  
  // 模擬 API 呼叫
  setTimeout(() => {
    // 更新本地系統設定
    systemConfig.systemName = systemName;
    systemConfig.version = version;
    
    // 更新頁面顯示
    updateSystemInfo(systemConfig);
    
    // 顯示成功訊息
    showMessage(document.getElementById('settingsResult'), 'success', '<i class="bi bi-check-circle"></i> 設定已保存');
  }, 1000);
}

/**
 * 查看時段詳情
 */
function viewSlotDetails(slotId) {
  // 根據 slotId 獲取時段資訊
  const slot = scheduleData.find(s => s.id === slotId);
  
  if (!slot) {
    alert('找不到指定的時段');
    return;
  }
  
  // 準備志工名單
  const slotVolunteers = volunteerData.filter(v => v.timeSlot === slotId);
  
  let volunteersHtml = '';
  slotVolunteers.forEach(v => {
    let statusBadge = '';
    if (v.status === '已出席') {
      statusBadge = '<span class="badge bg-success">已出席</span>';
    } else if (v.status === '未簽到') {
      statusBadge = '<span class="badge bg-warning">未簽到</span>';
    } else {
      statusBadge = '<span class="badge bg-secondary">已報名</span>';
    }
    
    volunteersHtml += `
      <tr>
        <td>${v.name}</td>
        <td>${v.contact}</td>
        <td>${statusBadge}</td>
      </tr>
    `;
  });
  
  // 如果沒有志工
  if (slotVolunteers.length === 0) {
    volunteersHtml = '<tr><td colspan="3" class="text-center">目前沒有志工報名此時段</td></tr>';
  }
  
  // 創建 Modal
  const modalHtml = `
    <div class="modal fade" id="slotDetailsModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">時段詳情</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="card mb-3">
              <div class="card-header">
                <h6 class="mb-0">基本資訊</h6>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6">
                    <p><strong>區域：</strong> ${slot.area}</p>
                    <p><strong>日期：</strong> ${slot.date}</p>
                    <p><strong>時間：</strong> ${slot.time}</p>
                  </div>
                  <div class="col-md-6">
                    <p><strong>站點：</strong> ${slot.location}</p>
                    <p><strong>人力狀態：</strong> ${slot.status}</p>
                    <p><strong>人數：</strong> ${slot.currentCount}/${slot.requiredCount}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h6 class="mb-0">報名志工</h6>
                <div>
                  <button class="btn btn-sm btn-success" onclick="addVolunteerToSlot('${slotId}')">
                    <i class="bi bi-plus-circle"></i> 新增志工
                  </button>
                </div>
              </div>
              <div class="card-body">
                <div class="table-responsive">
                  <table class="table table-striped">
                    <thead>
                      <tr>
                        <th>姓名</th>
                        <th>聯絡方式</th>
                        <th>狀態</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${volunteersHtml}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">關閉</button>
            <button type="button" class="btn btn-primary" onclick="editSlot('${slotId}')">
              <i class="bi bi-pencil"></i> 編輯時段
            </button>
            <button type="button" class="btn btn-success" onclick="openSendNotificationModal('${slotId}')">
              <i class="bi bi-bell"></i> 發送通知
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // 添加到 DOM
  document.body.insertAdjacentHTML('beforeend', modalHtml);
  
  // 顯示 Modal
  const modal = new bootstrap.Modal(document.getElementById('slotDetailsModal'));
  modal.show();
  
  // 監聽 Modal 關閉事件移除它
  document.getElementById('slotDetailsModal').addEventListener('hidden.bs.modal', function() {
    this.remove();
  });
}

/**
 * 查看志工詳情
 */
function viewVolunteerDetails(volunteerId) {
  // 根據 volunteerId 獲取志工資訊
  const volunteer = volunteerData.find(v => v.id === volunteerId);
  
  if (!volunteer) {
    alert('找不到指定的志工');
    return;
  }
  
  // 獲取時段資訊
  const slot = scheduleData.find(s => s.id === volunteer.timeSlot);
  
  // 創建 Modal
  const modalHtml = `
    <div class="modal fade" id="volunteerDetailsModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">志工詳情</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="card">
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6">
                    <p><strong>姓名：</strong> ${volunteer.name}</p>
                    <p><strong>聯絡方式：</strong> ${volunteer.contact}</p>
                    <p><strong>區域：</strong> ${volunteer.area}</p>
                    <p><strong>日期：</strong> ${volunteer.date}</p>
                  </div>
                  <div class="col-md-6">
                    <p><strong>站點：</strong> ${volunteer.location}</p>
                    <p><strong>時段：</strong> ${slot ? slot.time : '未知'}</p>
                    <p><strong>報名 ID：</strong> ${volunteer.id}</p>
                    <p><strong>狀態：</strong> ${volunteer.status}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">關閉</button>
            <button type="button" class="btn btn-primary" onclick="openUpdateAttendanceModal('${volunteerId}')">
              <i class="bi bi-check-circle"></i> 更新出席狀態
            </button>
            <button type="button" class="btn btn-info" onclick="openSendVolunteerNotificationModal('${volunteerId}')">
              <i class="bi bi-bell"></i> 發送通知
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // 添加到 DOM
  document.body.insertAdjacentHTML('beforeend', modalHtml);
  
  // 顯示 Modal
  const modal = new bootstrap.Modal(document.getElementById('volunteerDetailsModal'));
  modal.show();
  
  // 監聽 Modal 關閉事件移除它
  document.getElementById('volunteerDetailsModal').addEventListener('hidden.bs.modal', function() {
    this.remove();
  });
}

/**
 * 打開更新出席狀態的 Modal
 */
function openUpdateAttendanceModal(volunteerId) {
  // 關閉可能已打開的詳情 Modal
  const detailsModal = document.getElementById('volunteerDetailsModal');
  if (detailsModal) {
    bootstrap.Modal.getInstance(detailsModal).hide();
  }
  
  // 根據 volunteerId 獲取志工資訊
  const volunteer = volunteerData.find(v => v.id === volunteerId);
  
  if (!volunteer) {
    alert('找不到指定的志工');
    return;
  }
  
  // 創建 Modal
  const modalHtml = `
    <div class="modal fade" id="updateAttendanceModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">更新出席狀態</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="updateAttendanceForm">
              <input type="hidden" id="attendanceVolunteerId" value="${volunteerId}">
              
              <div class="mb-3">
                <label class="form-label">志工姓名</label>
                <input type="text" class="form-control" value="${volunteer.name}" disabled>
              </div>
              
              <div class="mb-3">
                <label for="attendanceStatus" class="form-label">出席狀態</label>
                <select class="form-select" id="attendanceStatus" required>
                  <option value="">選擇狀態</option>
                  <option value="已出席" ${volunteer.status === '已出席' ? 'selected' : ''}>已出席</option>
                  <option value="遲到" ${volunteer.status === '遲到' ? 'selected' : ''}>遲到</option>
                  <option value="未出席" ${volunteer.status === '未出席' ? 'selected' : ''}>未出席</option>
                  <option value="請假" ${volunteer.status === '請假' ? 'selected' : ''}>請假</option>
                </select>
              </div>
              
              <div class="mb-3">
                <label for="attendanceNotes" class="form-label">備註</label>
                <textarea class="form-control" id="attendanceNotes" rows="3"></textarea>
              </div>
              
              <div id="attendanceResult" class="alert d-none"></div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
            <button type="button" class="btn btn-primary" onclick="submitAttendanceUpdate()">
              <i class="bi bi-check-circle"></i> 更新狀態
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // 添加到 DOM
  document.body.insertAdjacentHTML('beforeend', modalHtml);
  
  // 顯示 Modal
  const modal = new bootstrap.Modal(document.getElementById('updateAttendanceModal'));
  modal.show();
  
  // 監聽 Modal 關閉事件移除它
  document.getElementById('updateAttendanceModal').addEventListener('hidden.bs.modal', function() {
    this.remove();
  });
}

/**
 * 提交出席狀態更新
 */
function submitAttendanceUpdate() {
  const volunteerId = document.getElementById('attendanceVolunteerId').value;
  const status = document.getElementById('attendanceStatus').value;
  const notes = document.getElementById('attendanceNotes').value;
  
  if (!status) {
    showMessage(document.getElementById('attendanceResult'), 'danger', '請選擇出席狀態');
    return;
  }
  
  // 顯示載入中訊息
  showMessage(document.getElementById('attendanceResult'), 'info', '<i class="bi bi-hourglass-split"></i> 正在更新狀態...');
  
  // 準備請求資料
  const updateData = {
    action: 'updateAttendance',
    adminId: currentAdmin.id,
    adminName: currentAdmin.name,
    registrationId: volunteerId,
    status: status,
    notes: notes
  };
  
  // 模擬 API 呼叫
  setTimeout(() => {
    // 更新本地資料
    const volunteerIndex = volunteerData.findIndex(v => v.id === volunteerId);
    if (volunteerIndex !== -1) {
      volunteerData[volunteerIndex].status = status;
      
      // 重新渲染志工列表
      renderVolunteers();
      
      // 顯示成功訊息
      showMessage(document.getElementById('attendanceResult'), 'success', '<i class="bi bi-check-circle"></i> 狀態已更新');
      
      // 延遲 1 秒後關閉 Modal
      setTimeout(() => {
        const modal = bootstrap.Modal.getInstance(document.getElementById('updateAttendanceModal'));
        if (modal) {
          modal.hide();
        }
      }, 1000);
    }
  }, 1000);
}

/**
 * 打開發送通知 Modal
 */
function openSendNotificationModal(slotId) {
  // 關閉可能已打開的詳情 Modal
  const detailsModal = document.getElementById('slotDetailsModal');
  if (detailsModal) {
    bootstrap.Modal.getInstance(detailsModal).hide();
  }
  
  // 根據 slotId 獲取時段資訊
  const slot = scheduleData.find(s => s.id === slotId);
  
  if (!slot) {
    alert('找不到指定的時段');
    return;
  }
  
  // 創建 Modal
  const modalHtml = `
    <div class="modal fade" id="sendNotificationModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">發送通知</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="sendNotificationForm">
              <input type="hidden" id="notificationSlotId" value="${slotId}">
              
              <div class="mb-3">
                <label class="form-label">時段資訊</label>
                <input type="text" class="form-control" value="${slot.area} - ${slot.location} (${slot.date} ${slot.time})" disabled>
              </div>
              
              <div class="mb-3">
                <label for="notificationType" class="form-label">通知類型</label>
                <select class="form-select" id="slotNotificationType" required>
                  <option value="">選擇類型</option>
                  <option value="緊急需求">緊急需求</option>
                  <option value="提醒通知">提醒通知</option>
                  <option value="行程變更">行程變更</option>
                  <option value="一般訊息">一般訊息</option>
                </select>
              </div>
              
              <div class="mb-3">
                <label for="slotNotificationContent" class="form-label">通知內容</label>
                <textarea class="form-control" id="slotNotificationContent" rows="3" required></textarea>
              </div>
              
              <div id="slotNotificationResult" class="alert d-none"></div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
            <button type="button" class="btn btn-primary" onclick="submitSlotNotification()">
              <i class="bi bi-send"></i> 發送通知
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // 添加到 DOM
  document.body.insertAdjacentHTML('beforeend', modalHtml);
  
  // 顯示 Modal
  const modal = new bootstrap.Modal(document.getElementById('sendNotificationModal'));
  modal.show();
  
  // 監聽 Modal 關閉事件移除它
  document.getElementById('sendNotificationModal').addEventListener('hidden.bs.modal', function() {
    this.remove();
  });
}

/**
 * 提交時段通知
 */
function submitSlotNotification() {
  const slotId = document.getElementById('notificationSlotId').value;
  const type = document.getElementById('slotNotificationType').value;
  const content = document.getElementById('slotNotificationContent').value;
  
  if (!type || !content) {
    showMessage(document.getElementById('slotNotificationResult'), 'danger', '請填寫所有必填欄位');
    return;
  }
  
  // 顯示載入中訊息
  showMessage(document.getElementById('slotNotificationResult'), 'info', '<i class="bi bi-hourglass-split"></i> 正在發送通知...');
  
  // 準備請求資料
  const notificationData = {
    action: 'sendNotification',
    adminId: currentAdmin.id,
    adminName: currentAdmin.name,
    timeSlotId: slotId,
    type: type,
    content: content
  };
  
  // 模擬 API 呼叫
  setTimeout(() => {
    // 顯示成功訊息
    showMessage(document.getElementById('slotNotificationResult'), 'success', '<i class="bi bi-check-circle"></i> 通知已發送');
    
    // 延遲 1 秒後關閉 Modal
    setTimeout(() => {
      const modal = bootstrap.Modal.getInstance(document.getElementById('sendNotificationModal'));
      if (modal) {
        modal.hide();
      }
    }, 1000);
  }, 1000);
}

/**
 * 打開發送志工通知 Modal
 */
function openSendVolunteerNotificationModal(volunteerId) {
  // 關閉可能已打開的詳情 Modal
  const detailsModal = document.getElementById('volunteerDetailsModal');
  if (detailsModal) {
    bootstrap.Modal.getInstance(detailsModal).hide();
  }
  
  // 根據 volunteerId 獲取志工資訊
  const volunteer = volunteerData.find(v => v.id === volunteerId);
  
  if (!volunteer) {
    alert('找不到指定的志工');
    return;
  }
  
  // 創建 Modal
  const modalHtml = `
    <div class="modal fade" id="sendVolunteerNotificationModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">發送志工通知</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="sendVolunteerNotificationForm">
              <input type="hidden" id="notificationVolunteerId" value="${volunteerId}">
              
              <div class="mb-3">
                <label class="form-label">志工姓名</label>
                <input type="text" class="form-control" value="${volunteer.name}" disabled>
              </div>
              
              <div class="mb-3">
                <label for="volunteerNotificationType" class="form-label">通知類型</label>
                <select class="form-select" id="volunteerNotificationType" required>
                  <option value="">選擇類型</option>
                  <option value="行程提醒">行程提醒</option>
                  <option value="出席確認">出席確認</option>
                  <option value="行程變更">行程變更</option>
                  <option value="一般訊息">一般訊息</option>
                </select>
              </div>
              
              <div class="mb-3">
                <label for="volunteerNotificationContent" class="form-label">通知內容</label>
                <textarea class="form-control" id="volunteerNotificationContent" rows="3" required></textarea>
              </div>
              
              <div id="volunteerNotificationResult" class="alert d-none"></div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
            <button type="button" class="btn btn-primary" onclick="submitVolunteerNotification()">
              <i class="bi bi-send"></i> 發送通知
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // 添加到 DOM
  document.body.insertAdjacentHTML('beforeend', modalHtml);
  
  // 顯示 Modal
  const modal = new bootstrap.Modal(document.getElementById('sendVolunteerNotificationModal'));
  modal.show();
  
  // 監聽 Modal 關閉事件移除它
  document.getElementById('sendVolunteerNotificationModal').addEventListener('hidden.bs.modal', function() {
    this.remove();
  });
}

/**
 * 提交志工通知
 */
function submitVolunteerNotification() {
  const volunteerId = document.getElementById('notificationVolunteerId').value;
  const type = document.getElementById('volunteerNotificationType').value;
  const content = document.getElementById('volunteerNotificationContent').value;
  
  if (!type || !content) {
    showMessage(document.getElementById('volunteerNotificationResult'), 'danger', '請填寫所有必填欄位');
    return;
  }
  
  // 顯示載入中訊息
  showMessage(document.getElementById('volunteerNotificationResult'), 'info', '<i class="bi bi-hourglass-split"></i> 正在發送通知...');
  
  // 準備請求資料
  const notificationData = {
    action: 'sendNotification',
    adminId: currentAdmin.id,
    adminName: currentAdmin.name,
    registrationId: volunteerId,
    type: type,
    content: content
  };
  
  // 模擬 API 呼叫
  setTimeout(() => {
    // 顯示成功訊息
    showMessage(document.getElementById('volunteerNotificationResult'), 'success', '<i class="bi bi-check-circle"></i> 通知已發送');
    
    // 延遲 1 秒後關閉 Modal
    setTimeout(() => {
      const modal = bootstrap.Modal.getInstance(document.getElementById('sendVolunteerNotificationModal'));
      if (modal) {
        modal.hide();
      }
    }, 1000);
  }, 1000);
}

/**
 * 添加志工到時段
 */
function addVolunteerToSlot(slotId) {
  // 關閉可能已打開的詳情 Modal
  const detailsModal = document.getElementById('slotDetailsModal');
  if (detailsModal) {
    bootstrap.Modal.getInstance(detailsModal).hide();
  }
  
  // 根據 slotId 獲取時段資訊
  const slot = scheduleData.find(s => s.id === slotId);
  
  if (!slot) {
    alert('找不到指定的時段');
    return;
  }
  
  // 創建 Modal
  const modalHtml = `
    <div class="modal fade" id="addVolunteerModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">新增志工</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="addVolunteerForm">
              <input type="hidden" id="addVolunteerSlotId" value="${slotId}">
              
              <div class="mb-3">
                <label class="form-label">時段資訊</label>
                <input type="text" class="form-control" value="${slot.area} - ${slot.location} (${slot.date} ${slot.time})" disabled>
              </div>
              
              <div class="mb-3">
                <label for="volunteerName" class="form-label">志工姓名</label>
                <input type="text" class="form-control" id="volunteerName" required>
              </div>
              
              <div class="mb-3">
                <label for="volunteerContact" class="form-label">聯絡方式</label>
                <input type="text" class="form-control" id="volunteerContact" required>
              </div>
              
              <div class="mb-3">
                <label for="volunteerNotes" class="form-label">備註</label>
                <textarea class="form-control" id="volunteerNotes" rows="2"></textarea>
              </div>
              
              <div class="mb-3 form-check">
                <input type="checkbox" class="form-check-input" id="volunteerLineNotify">
                <label class="form-check-label" for="volunteerLineNotify">接收 LINE 通知</label>
              </div>
              
              <div class="mb-3 form-check">
                <input type="checkbox" class="form-check-input" id="volunteerCalendarInvite">
                <label class="form-check-label" for="volunteerCalendarInvite">加入行事曆</label>
              </div>
              
              <div id="addVolunteerResult" class="alert d-none"></div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
            <button type="button" class="btn btn-primary" onclick="submitAddVolunteer()">
              <i class="bi bi-person-plus"></i> 新增志工
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // 添加到 DOM
  document.body.insertAdjacentHTML('beforeend', modalHtml);
  
  // 顯示 Modal
  const modal = new bootstrap.Modal(document.getElementById('addVolunteerModal'));
  modal.show();
  
  // 監聽 Modal 關閉事件移除它
  document.getElementById('addVolunteerModal').addEventListener('hidden.bs.modal', function() {
    this.remove();
  });
}

/**
 * 提交新增志工
 */
function submitAddVolunteer() {
  const slotId = document.getElementById('addVolunteerSlotId').value;
  const name = document.getElementById('volunteerName').value.trim();
  const contact = document.getElementById('volunteerContact').value.trim();
  const notes = document.getElementById('volunteerNotes').value.trim();
  const lineNotify = document.getElementById('volunteerLineNotify').checked;
  const calendarInvite = document.getElementById('volunteerCalendarInvite').checked;
  
  if (!name || !contact) {
    showMessage(document.getElementById('addVolunteerResult'), 'danger', '請填寫姓名和聯絡方式');
    return;
  }
  
  // 顯示載入中訊息
  showMessage(document.getElementById('addVolunteerResult'), 'info', '<i class="bi bi-hourglass-split"></i> 正在新增志工...');
  
  // 獲取時段資訊
  const slot = scheduleData.find(s => s.id === slotId);
  
  // 準備請求資料
  const registerData = {
    action: 'adminRegister',
    adminId: currentAdmin.id,
    adminName: currentAdmin.name,
    name: name,
    contact: contact,
    area: slot.area,
    date: slot.date,
    timeSlot: slotId,
    notes: notes,
    lineNotify: lineNotify,
    needCalendarInvite: calendarInvite
  };
  
  // 模擬 API 呼叫
  setTimeout(() => {
    // 模擬生成新志工 ID
    const newVolunteerId = 'REG-' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    
    // 添加到本地資料
    volunteerData.push({
      id: newVolunteerId,
      name: name,
      contact: contact,
      area: slot.area,
      date: slot.date,
      timeSlot: slotId,
      location: slot.location,
      status: '已報名'
    });
    
    // 更新時段人數
    const slotIndex = scheduleData.findIndex(s => s.id === slotId);
    if (slotIndex !== -1) {
      scheduleData[slotIndex].currentCount++;
      
      // 如果人數現在足夠，更新狀態
      if (scheduleData[slotIndex].currentCount >= scheduleData[slotIndex].requiredCount) {
        scheduleData[slotIndex].status = '充足';
      } else if (scheduleData[slotIndex].currentCount > 0) {
        scheduleData[slotIndex].status = '不足';
      }
      
      // 重新渲染班表
      renderSchedules();
    }
    
    // 重新渲染志工列表
    renderVolunteers();
    
    // 顯示成功訊息
    showMessage(document.getElementById('addVolunteerResult'), 'success', `<i class="bi bi-check-circle"></i> 已成功新增志工 (ID: ${newVolunteerId})`);
    
    // 延遲 1.5 秒後關閉 Modal
    setTimeout(() => {
      const modal = bootstrap.Modal.getInstance(document.getElementById('addVolunteerModal'));
      if (modal) {
        modal.hide();
      }
      
      // 重新打開時段詳情
      setTimeout(() => {
        viewSlotDetails(slotId);
      }, 500);
    }, 1500);
  }, 1000);
}

/**
 * 編輯時段
 */
function editSlot(slotId) {
  // 關閉可能已打開的詳情 Modal
  const detailsModal = document.getElementById('slotDetailsModal');
  if (detailsModal) {
    bootstrap.Modal.getInstance(detailsModal).hide();
  }
  
  // 根據 slotId 獲取時段資訊
  const slot = scheduleData.find(s => s.id === slotId);
  
  if (!slot) {
    alert('找不到指定的時段');
    return;
  }
  
  // 解析時間範圍
  let startTime = '';
  let endTime = '';
  
  if (slot.time) {
    const timeParts = slot.time.split(' - ');
    if (timeParts.length === 2) {
      startTime = timeParts[0];
      endTime = timeParts[1];
    }
  }
  
  // 創建 Modal
  const modalHtml = `
    <div class="modal fade" id="editSlotModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">編輯時段</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="editSlotForm">
              <input type="hidden" id="editSlotId" value="${slotId}">
              
              <div class="mb-3">
                <label for="editSlotArea" class="form-label">區域</label>
                <select class="form-select" id="editSlotArea" required>
                  <option value="南中正" ${slot.area === '南中正' ? 'selected' : ''}>南中正</option>
                  <option value="景美" ${slot.area === '景美' ? 'selected' : ''}>景美</option>
                  <option value="木柵" ${slot.area === '木柵' ? 'selected' : ''}>木柵</option>
                </select>
              </div>
              
              <div class="mb-3">
                <label for="editSlotDate" class="form-label">日期</label>
                <input type="date" class="form-control" id="editSlotDate" value="${slot.date}" required>
              </div>
              
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="editSlotStartTime" class="form-label">開始時間</label>
                  <input type="time" class="form-control" id="editSlotStartTime" value="${startTime}" required>
                </div>
                <div class="col-md-6 mb-3">
                  <label for="editSlotEndTime" class="form-label">結束時間</label>
                  <input type="time" class="form-control" id="editSlotEndTime" value="${endTime}" required>
                </div>
              </div>
              
              <div class="mb-3">
                <label for="editSlotLocation" class="form-label">站點</label>
                <select class="form-select" id="editSlotLocation" required>
                  <option value="${slot.location}" selected>${slot.location}</option>
                </select>
              </div>
              
              <div class="mb-3">
                <label for="editSlotRequiredCount" class="form-label">所需人數</label>
                <input type="number" class="form-control" id="editSlotRequiredCount" value="${slot.requiredCount}" min="1" required>
              </div>
              
              <div class="mb-3">
                <label for="editSlotNotes" class="form-label">備註</label>
                <textarea class="form-control" id="editSlotNotes" rows="2"></textarea>
              </div>
              
              <div class="mb-3 form-check">
                <input type="checkbox" class="form-check-input" id="editSlotEnabled" checked>
                <label class="form-check-label" for="editSlotEnabled">啟用此時段</label>
              </div>
              
              <div id="editSlotResult" class="alert d-none"></div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
            <button type="button" class="btn btn-danger me-auto" onclick="confirmDeleteSlot('${slotId}')">
              <i class="bi bi-trash"></i> 刪除時段
            </button>
            <button type="button" class="btn btn-primary" onclick="submitEditSlot()">
              <i class="bi bi-save"></i> 儲存變更
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // 添加到 DOM
  document.body.insertAdjacentHTML('beforeend', modalHtml);
  
  // 顯示 Modal
  const modal = new bootstrap.Modal(document.getElementById('editSlotModal'));
  modal.show();
  
  // 監聽 Modal 關閉事件移除它
  document.getElementById('editSlotModal').addEventListener('hidden.bs.modal', function() {
    this.remove();
  });
  
  // 監聽區域變更以更新站點選項
  document.getElementById('editSlotArea').addEventListener('change', function() {
    updateLocationOptions(this.value);
  });
  
  // 初始載入該區域的站點選項
  updateLocationOptions(slot.area, slot.location);
}

/**
 * 更新站點選項
 */
function updateLocationOptions(area, selectedLocation = null) {
  const locationSelect = document.getElementById('editSlotLocation');
  if (!locationSelect) return;
  
  // 過濾該區域的站點
  const locations = locationData.filter(loc => loc.area === area);
  
  let html = '';
  locations.forEach(loc => {
    html += `<option value="${loc.name}" ${loc.name === selectedLocation ? 'selected' : ''}>${loc.name}</option>`;
  });
  
  locationSelect.innerHTML = html;
}

/**
 * 提交編輯時段
 */
function submitEditSlot() {
  const slotId = document.getElementById('editSlotId').value;
  const area = document.getElementById('editSlotArea').value;
  const date = document.getElementById('editSlotDate').value;
  const startTime = document.getElementById('editSlotStartTime').value;
  const endTime = document.getElementById('editSlotEndTime').value;
  const location = document.getElementById('editSlotLocation').value;
  const requiredCount = parseInt(document.getElementById('editSlotRequiredCount').value);
  const notes = document.getElementById('editSlotNotes').value;
  const enabled = document.getElementById('editSlotEnabled').checked;
  
  if (!area || !date || !startTime || !endTime || !location || !requiredCount) {
    showMessage(document.getElementById('editSlotResult'), 'danger', '請填寫所有必填欄位');
    return;
  }
  
  // 顯示載入中訊息
  showMessage(document.getElementById('editSlotResult'), 'info', '<i class="bi bi-hourglass-split"></i> 正在更新時段...');
  
  // 準備請求資料
  const slotData = {
    action: 'updateSlot',
    adminId: currentAdmin.id,
    adminName: currentAdmin.name,
    slotId: slotId,
    area: area,
    date: date,
    startTime: startTime,
    endTime: endTime,
    location: location,
    requiredCount: requiredCount,
    notes: notes,
    enabled: enabled
  };
  
  // 模擬 API 呼叫
  setTimeout(() => {
    // 更新本地資料
    const slotIndex = scheduleData.findIndex(s => s.id === slotId);
    if (slotIndex !== -1) {
      const currentCount = scheduleData[slotIndex].currentCount;
      
      // 更新資料
      scheduleData[slotIndex].area = area;
      scheduleData[slotIndex].date = date;
      scheduleData[slotIndex].time = `${startTime} - ${endTime}`;
      scheduleData[slotIndex].location = location;
      scheduleData[slotIndex].requiredCount = requiredCount;
      
      // 根據目前人數和所需人數更新狀態
      if (currentCount >= requiredCount) {
        scheduleData[slotIndex].status = '充足';
      } else if (currentCount > 0) {
        scheduleData[slotIndex].status = '不足';
      } else {
        scheduleData[slotIndex].status = '極度不足';
      }
      
      // 重新渲染班表
      renderSchedules();
      
      // 更新該時段相關的志工資訊
      volunteerData.forEach(volunteer => {
        if (volunteer.timeSlot === slotId) {
          volunteer.area = area;
          volunteer.date = date;
          volunteer.location = location;
        }
      });
      
      // 重新渲染志工列表
      renderVolunteers();
      
      // 顯示成功訊息
      showMessage(document.getElementById('editSlotResult'), 'success', '<i class="bi bi-check-circle"></i> 時段已更新');
      
      // 延遲 1 秒後關閉 Modal
      setTimeout(() => {
        const modal = bootstrap.Modal.getInstance(document.getElementById('editSlotModal'));
        if (modal) {
          modal.hide();
        }
      }, 1000);
    }
  }, 1000);
}

/**
 * 確認刪除時段
 */
function confirmDeleteSlot(slotId) {
  // 確保獲取 slotId
  const id = slotId || document.getElementById('editSlotId')?.value;
  
  if (!id) {
    alert('找不到時段 ID');
    return;
  }
  
  // 關閉可能已打開的編輯 Modal
  const editModal = document.getElementById('editSlotModal');
  if (editModal) {
    bootstrap.Modal.getInstance(editModal).hide();
  }
  
  // 根據 slotId 獲取時段資訊
  const slot = scheduleData.find(s => s.id === id);
  
  if (!slot) {
    alert('找不到指定的時段');
    return;
  }
  
  // 檢查是否有志工已報名
  const hasVolunteers = volunteerData.some(v => v.timeSlot === id);
  
  // 創建確認 Modal
  const modalHtml = `
    <div class="modal fade" id="deleteSlotConfirmModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">確認刪除</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>您確定要刪除以下時段嗎？</p>
            <div class="alert alert-info">
              <p><strong>區域：</strong> ${slot.area}</p>
              <p><strong>站點：</strong> ${slot.location}</p>
              <p><strong>日期：</strong> ${slot.date}</p>
              <p><strong>時間：</strong> ${slot.time}</p>
            </div>
            ${hasVolunteers ? '<div class="alert alert-warning"><i class="bi bi-exclamation-triangle"></i> 警告：已有志工報名此時段，刪除將會取消所有相關報名。</div>' : ''}
            <div id="deleteSlotResult" class="alert d-none"></div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
            <button type="button" class="btn btn-danger" onclick="deleteSlot('${id}')">
              <i class="bi bi-trash"></i> 確認刪除
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // 添加到 DOM
  document.body.insertAdjacentHTML('beforeend', modalHtml);
  
  // 顯示 Modal
  const modal = new bootstrap.Modal(document.getElementById('deleteSlotConfirmModal'));
  modal.show();
  
  // 監聽 Modal 關閉事件移除它
  document.getElementById('deleteSlotConfirmModal').addEventListener('hidden.bs.modal', function() {
    this.remove();
  });
}

/**
 * 刪除時段
 */
function deleteSlot(slotId) {
  // 顯示載入中訊息
  showMessage(document.getElementById('deleteSlotResult'), 'info', '<i class="bi bi-hourglass-split"></i> 正在刪除時段...');
  
  // 準備請求資料
  const deleteData = {
    action: 'deleteSlot',
    adminId: currentAdmin.id,
    adminName: currentAdmin.name,
    slotId: slotId
  };
  
  // 模擬 API 呼叫
  setTimeout(() => {
    // 從本地資料中移除時段
    scheduleData = scheduleData.filter(s => s.id !== slotId);
    
    // 更新相關志工狀態
    volunteerData.forEach(volunteer => {
      if (volunteer.timeSlot === slotId) {
        volunteer.status = '已取消';
      }
    });
    
    // 重新渲染班表
    renderSchedules();
    
    // 重新渲染志工列表
    renderVolunteers();
    
    // 更新統計數字
    updateStatistics();
    
    // 顯示成功訊息
    showMessage(document.getElementById('deleteSlotResult'), 'success', '<i class="bi bi-check-circle"></i> 時段已刪除');
    
    // 延遲 1 秒後關閉 Modal
    setTimeout(() => {
      const modal = bootstrap.Modal.getInstance(document.getElementById('deleteSlotConfirmModal'));
      if (modal) {
        modal.hide();
      }
    }, 1000);
  }, 1000);
}

/**
 * 打開編輯站點 Modal
 */
function openEditLocationModal(locationId) {
  // 根據 locationId 獲取站點資訊
  const location = locationData.find(loc => loc.id === locationId);
  
  if (!location) {
    alert('找不到指定的站點');
    return;
  }
  
  // 創建 Modal
  const modalHtml = `
    <div class="modal fade" id="editLocationModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">編輯站點</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="editLocationForm">
              <input type="hidden" id="editLocationId" value="${locationId}">
              
              <div class="mb-3">
                <label for="editLocationName" class="form-label">站點名稱</label>
                <input type="text" class="form-control" id="editLocationName" value="${location.name}" required>
              </div>
              
              <div class="mb-3">
                <label for="editLocationArea" class="form-label">區域</label>
                <select class="form-select" id="editLocationArea" required>
                  <option value="南中正" ${location.area === '南中正' ? 'selected' : ''}>南中正</option>
                  <option value="景美" ${location.area === '景美' ? 'selected' : ''}>景美</option>
                  <option value="木柵" ${location.area === '木柵' ? 'selected' : ''}>木柵</option>
                </select>
              </div>
              
              <div class="mb-3">
                <label for="editLocationAddress" class="form-label">地址</label>
                <input type="text" class="form-control" id="editLocationAddress" value="${location.address}" required>
              </div>
              
              <div class="mb-3">
                <label for="editLocationMapLink" class="form-label">地圖連結</label>
                <input type="url" class="form-control" id="editLocationMapLink" value="${location.mapLink || ''}">
              </div>
              
              <div class="mb-3">
                <label for="editLocationSuggestedCount" class="form-label">建議人數</label>
                <input type="number" class="form-control" id="editLocationSuggestedCount" value="${location.suggestedCount}" min="1" required>
              </div>
              
              <div class="mb-3 form-check">
                <input type="checkbox" class="form-check-input" id="editLocationEnabled" checked>
                <label class="form-check-label" for="editLocationEnabled">啟用此站點</label>
              </div>
              
              <div id="editLocationResult" class="alert d-none"></div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
            <button type="button" class="btn btn-primary" onclick="submitEditLocation()">
              <i class="bi bi-save"></i> 儲存變更
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // 添加到 DOM
  document.body.insertAdjacentHTML('beforeend', modalHtml);
  
  // 顯示 Modal
  const modal = new bootstrap.Modal(document.getElementById('editLocationModal'));
  modal.show();
  
  // 監聽 Modal 關閉事件移除它
  document.getElementById('editLocationModal').addEventListener('hidden.bs.modal', function() {
    this.remove();
  });
}

/**
 * 提交編輯站點
 */
function submitEditLocation() {
  const locationId = document.getElementById('editLocationId').value;
  const name = document.getElementById('editLocationName').value.trim();
  const area = document.getElementById('editLocationArea').value;
  const address = document.getElementById('editLocationAddress').value.trim();
  const mapLink = document.getElementById('editLocationMapLink').value.trim();
  const suggestedCount = parseInt(document.getElementById('editLocationSuggestedCount').value);
  const enabled = document.getElementById('editLocationEnabled').checked;
  
  if (!name || !area || !address || !suggestedCount) {
    showMessage(document.getElementById('editLocationResult'), 'danger', '請填寫所有必填欄位');
    return;
  }
  
  // 顯示載入中訊息
  showMessage(document.getElementById('editLocationResult'), 'info', '<i class="bi bi-hourglass-split"></i> 正在更新站點...');
  
  // 準備請求資料
  const locationData = {
    action: 'updateLocation',
    adminId: currentAdmin.id,
    adminName: currentAdmin.name,
    locationId: locationId,
    name: name,
    area: area,
    address: address,
    mapLink: mapLink,
    suggestedCount: suggestedCount,
    enabled: enabled
  };
  
  // 模擬 API 呼叫
  setTimeout(() => {
    // 更新本地資料
    const locationIndex = locationData.findIndex(loc => loc.id === locationId);
    if (locationIndex !== -1) {
      locationData[locationIndex].name = name;
      locationData[locationIndex].area = area;
      locationData[locationIndex].address = address;
      locationData[locationIndex].mapLink = mapLink;
      locationData[locationIndex].suggestedCount = suggestedCount;
      
      // 重新渲染站點列表
      renderLocations(locationData);
      
      // 顯示成功訊息
      showMessage(document.getElementById('editLocationResult'), 'success', '<i class="bi bi-check-circle"></i> 站點已更新');
      
      // 延遲 1 秒後關閉 Modal
      setTimeout(() => {
        const modal = bootstrap.Modal.getInstance(document.getElementById('editLocationModal'));
        if (modal) {
          modal.hide();
        }
      }, 1000);
    }
  }, 1000);
}

/**
 * 確認刪除站點
 */
function confirmDeleteLocation(locationId) {
  // 根據 locationId 獲取站點資訊
  const location = locationData.find(loc => loc.id === locationId);
  
  if (!location) {
    alert('找不到指定的站點');
    return;
  }
  
  // 檢查是否有時段使用此站點
  const hasSlots = scheduleData.some(slot => slot.location === location.name);
  
  // 創建確認 Modal
  const modalHtml = `
    <div class="modal fade" id="deleteLocationConfirmModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">確認刪除</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>您確定要刪除以下站點嗎？</p>
            <div class="alert alert-info">
              <p><strong>站點名稱：</strong> ${location.name}</p>
              <p><strong>區域：</strong> ${location.area}</p>
              <p><strong>地址：</strong> ${location.address}</p>
            </div>
            ${hasSlots ? '<div class="alert alert-warning"><i class="bi bi-exclamation-triangle"></i> 警告：已有時段使用此站點，刪除將會影響這些時段。</div>' : ''}
            <div id="deleteLocationResult" class="alert d-none"></div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
            <button type="button" class="btn btn-danger" onclick="deleteLocation('${locationId}')">
              <i class="bi bi-trash"></i> 確認刪除
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // 添加到 DOM
  document.body.insertAdjacentHTML('beforeend', modalHtml);
  
  // 顯示 Modal
  const modal = new bootstrap.Modal(document.getElementById('deleteLocationConfirmModal'));
  modal.show();
  
  // 監聽 Modal 關閉事件移除它
  document.getElementById('deleteLocationConfirmModal').addEventListener('hidden.bs.modal', function() {
    this.remove();
  });
}

/**
 * 刪除站點
 */
function deleteLocation(locationId) {
  // 顯示載入中訊息
  showMessage(document.getElementById('deleteLocationResult'), 'info', '<i class="bi bi-hourglass-split"></i> 正在刪除站點...');
  
  // 準備請求資料
  const deleteData = {
    action: 'deleteLocation',
    adminId: currentAdmin.id,
    adminName: currentAdmin.name,
    locationId: locationId
  };
  
  // 模擬 API 呼叫
  setTimeout(() => {
    // 從本地資料中移除站點
    const location = locationData.find(loc => loc.id === locationId);
    locationData = locationData.filter(loc => loc.id !== locationId);
    
    // 重新渲染站點列表
    renderLocations(locationData);
    
    // 顯示成功訊息
    showMessage(document.getElementById('deleteLocationResult'), 'success', '<i class="bi bi-check-circle"></i> 站點已刪除');
    
    // 延遲 1 秒後關閉 Modal
    setTimeout(() => {
      const modal = bootstrap.Modal.getInstance(document.getElementById('deleteLocationConfirmModal'));
      if (modal) {
        modal.hide();
      }
    }, 1000);
  }, 1000);
}

/**
 * 打開編輯管理員 Modal
 */
function openEditAdminModal(adminId) {
  // 根據 adminId 獲取管理員資訊
  const admin = adminData.find(a => a.id === adminId);
  
  if (!admin) {
    alert('找不到指定的管理員');
    return;
  }
  
  // 創建 Modal
  const modalHtml = `
    <div class="modal fade" id="editAdminModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">編輯管理員</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="editAdminForm">
              <input type="hidden" id="editAdminId" value="${adminId}">
              
              <div class="mb-3">
                <label for="editAdminName" class="form-label">姓名</label>
                <input type="text" class="form-control" id="editAdminName" value="${admin.name}" required>
              </div>
              
              <div class="mb-3">
                <label for="editAdminRole" class="form-label">角色</label>
                <select class="form-select" id="editAdminRole" required>
                  <option value="總管理員" ${admin.role === '總管理員' ? 'selected' : ''}>總管理員</option>
                  <option value="區域組長" ${admin.role === '區域組長' ? 'selected' : ''}>區域組長</option>
                  <option value="副組長" ${admin.role === '副組長' ? 'selected' : ''}>副組長</option>
                </select>
              </div>
              
              <div class="mb-3">
                <label for="editAdminArea" class="form-label">管理區域</label>
                <select class="form-select" id="editAdminArea" required>
                  <option value="全區域" ${admin.area === '全區域' ? 'selected' : ''}>全區域</option>
                  <option value="南中正" ${admin.area === '南中正' ? 'selected' : ''}>南中正</option>
                  <option value="景美" ${admin.area === '景美' ? 'selected' : ''}>景美</option>
                  <option value="木柵" ${admin.area === '木柵' ? 'selected' : ''}>木柵</option>
                </select>
              </div>
              
              <div class="mb-3 form-check">
                <input type="checkbox" class="form-check-input" id="editAdminEnabled" ${admin.status === '啟用' ? 'checked' : ''}>
                <label class="form-check-label" for="editAdminEnabled">啟用帳號</label>
              </div>
              
              <div id="editAdminResult" class="alert d-none"></div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
            <button type="button" class="btn btn-primary" onclick="submitEditAdmin()">
              <i class="bi bi-save"></i> 儲存變更
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // 添加到 DOM
  document.body.insertAdjacentHTML('beforeend', modalHtml);
  
  // 顯示 Modal
  const modal = new bootstrap.Modal(document.getElementById('editAdminModal'));
  modal.show();
  
  // 監聽 Modal 關閉事件移除它
  document.getElementById('editAdminModal').addEventListener('hidden.bs.modal', function() {
    this.remove();
  });
}

/**
 * 提交編輯管理員
 */
function submitEditAdmin() {
  const adminId = document.getElementById('editAdminId').value;
  const name = document.getElementById('editAdminName').value.trim();
  const role = document.getElementById('editAdminRole').value;
  const area = document.getElementById('editAdminArea').value;
  const enabled = document.getElementById('editAdminEnabled').checked;
  
  if (!name || !role || !area) {
    showMessage(document.getElementById('editAdminResult'), 'danger', '請填寫所有必填欄位');
    return;
  }
  
  // 顯示載入中訊息
  showMessage(document.getElementById('editAdminResult'), 'info', '<i class="bi bi-hourglass-split"></i> 正在更新管理員資訊...');
  
  // 準備請求資料
  const adminUpdateData = {
    action: 'updateAdmin',
    adminId: currentAdmin.id,
    adminName: currentAdmin.name,
    targetAdminId: adminId,
    name: name,
    role: role,
    area: area,
    enabled: enabled
  };
  
  // 模擬 API 呼叫
  setTimeout(() => {
    // 更新本地資料
    const adminIndex = adminData.findIndex(a => a.id === adminId);
    if (adminIndex !== -1) {
      adminData[adminIndex].name = name;
      adminData[adminIndex].role = role;
      adminData[adminIndex].area = area;
      adminData[adminIndex].status = enabled ? '啟用' : '停用';
      
      // 重新渲染管理員列表
      renderAdmins(adminData);
      
      // 顯示成功訊息
      showMessage(document.getElementById('editAdminResult'), 'success', '<i class="bi bi-check-circle"></i> 管理員資訊已更新');
      
      // 延遲 1 秒後關閉 Modal
      setTimeout(() => {
        const modal = bootstrap.Modal.getInstance(document.getElementById('editAdminModal'));
        if (modal) {
          modal.hide();
        }
      }, 1000);
    }
  }, 1000);
}

/**
 * 切換管理員狀態
 */
function toggleAdminStatus(adminId) {
  // 根據 adminId 獲取管理員資訊
  const admin = adminData.find(a => a.id === adminId);
  
  if (!admin) {
    alert('找不到指定的管理員');
    return;
  }
  
  // 顯示確認提示
  if (!confirm(`確定要${admin.status === '啟用' ? '停用' : '啟用'}「${admin.name}」的管理員帳號嗎？`)) {
    return;
  }
  
  // 準備請求資料
  const statusData = {
    action: 'toggleAdminStatus',
    adminId: currentAdmin.id,
    adminName: currentAdmin.name,
    targetAdminId: adminId,
    enabled: admin.status !== '啟用'
  };
  
  // 模擬 API 呼叫
  setTimeout(() => {
    // 更新本地資料
    const adminIndex = adminData.findIndex(a => a.id === adminId);
    if (adminIndex !== -1) {
      adminData[adminIndex].status = admin.status === '啟用' ? '停用' : '啟用';
      
      // 重新渲染管理員列表
      renderAdmins(adminData);
    }
  }, 500);
}

/**
 * 顯示訊息
 */
function showMessage(element, type, message) {
  if (!element) return;
  
  element.className = `alert alert-${type}`;
  element.innerHTML = message;
  element.classList.remove('d-none');
}

/**
 * 隱藏載入指示器
 */
function hideLoadingIndicator() {
  const loader = document.getElementById('mainLoader');
  if (loader) {
    loader.classList.add('d-none');
  }
  
  const content = document.getElementById('mainContent');
  if (content) {
    content.classList.remove('d-none');
  }
}

/**
 * 顯示全局錯誤
 */
function showGlobalError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'alert alert-danger';
  errorDiv.innerHTML = `<i class="bi bi-exclamation-triangle-fill"></i> ${message}`;
  
  const container = document.querySelector('.container-fluid');
  if (container) {
    container.prepend(errorDiv);
  } else {
    document.body.prepend(errorDiv);
  }
}

// 新增時段表單處理
document.addEventListener('DOMContentLoaded', function() {
  const addScheduleForm = document.getElementById('addScheduleForm');
  if (addScheduleForm) {
    addScheduleForm.addEventListener('submit', function(e) {
      e.preventDefault();
      addNewSchedule();
    });
  }
  
  // 新增站點表單處理
  const addLocationForm = document.getElementById('addLocationForm');
  if (addLocationForm) {
    addLocationForm.addEventListener('submit', function(e) {
      e.preventDefault();
      addNewLocation();
    });
  }
  
  // 新增管理員表單處理
  const addAdminForm = document.getElementById('addAdminForm');
  if (addAdminForm) {
    addAdminForm.addEventListener('submit', function(e) {
      e.preventDefault();
      addNewAdmin();
    });
  }
});

/**
 * 新增時段
 */
function addNewSchedule() {
  const area = document.getElementById('newScheduleArea').value;
  const date = document.getElementById('newScheduleDate').value;
  const startTime = document.getElementById('newScheduleStartTime').value;
  const endTime = document.getElementById('newScheduleEndTime').value;
  const location = document.getElementById('newScheduleLocation').value;
  const requiredCount = parseInt(document.getElementById('newScheduleRequiredCount').value);
  const notes = document.getElementById('newScheduleNotes').value;
  
  if (!area || !date || !startTime || !endTime || !location || !requiredCount) {
    showMessage(document.getElementById('newScheduleResult'), 'danger', '請填寫所有必填欄位');
    return;
  }
  
  // 顯示載入中訊息
  showMessage(document.getElementById('newScheduleResult'), 'info', '<i class="bi bi-hourglass-split"></i> 正在新增時段...');
  
  // 準備請求資料
  const scheduleData = {
    action: 'addSchedule',
    adminId: currentAdmin.id,
    adminName: currentAdmin.name,
    area: area,
    date: date,
    startTime: startTime,
    endTime: endTime,
    location: location,
    requiredCount: requiredCount,
    notes: notes
  };
  
  // 模擬 API 呼叫
  setTimeout(() => {
    // 生成唯一 ID
    const newSlotId = 'TS-' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    
    // 添加到本地資料
    scheduleData.push({
      id: newSlotId,
      area: area,
      date: date,
      time: `${startTime} - ${endTime}`,
      location: location,
      requiredCount: requiredCount,
      currentCount: 0,
      status: '極度不足'
    });
    
    // 重新渲染班表
    renderSchedules();
    
    // 清空表單
    document.getElementById('newScheduleArea').value = '';
    document.getElementById('newScheduleLocation').value = '';
    document.getElementById('newScheduleRequiredCount').value = '';
    document.getElementById('newScheduleNotes').value = '';
    
    // 顯示成功訊息
    showMessage(document.getElementById('newScheduleResult'), 'success', '<i class="bi bi-check-circle"></i> 時段已新增');
  }, 1000);
}

/**
 * 新增站點
 */
function addNewLocation() {
  const name = document.getElementById('newLocationName').value.trim();
  const area = document.getElementById('newLocationArea').value;
  const address = document.getElementById('newLocationAddress').value.trim();
  const mapLink = document.getElementById('newLocationMapLink').value.trim();
  const suggestedCount = parseInt(document.getElementById('newLocationSuggestedCount').value);
  
  if (!name || !area || !address || !suggestedCount) {
    showMessage(document.getElementById('newLocationResult'), 'danger', '請填寫所有必填欄位');
    return;
  }
  
  // 顯示載入中訊息
  showMessage(document.getElementById('newLocationResult'), 'info', '<i class="bi bi-hourglass-split"></i> 正在新增站點...');
  
  // 準備請求資料
  const newLocationData = {
    action: 'addLocation',
    adminId: currentAdmin.id,
    adminName: currentAdmin.name,
    name: name,
    area: area,
    address: address,
    mapLink: mapLink,
    suggestedCount: suggestedCount
  };
  
  // 模擬 API 呼叫
  setTimeout(() => {
    // 生成唯一 ID
    const newLocationId = 'LOC-' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    
    // 添加到本地資料
    locationData.push({
      id: newLocationId,
      name: name,
      area: area,
      address: address,
      mapLink: mapLink,
      suggestedCount: suggestedCount
    });
    
    // 重新渲染站點列表
    renderLocations(locationData);
    
    // 清空表單
    document.getElementById('newLocationName').value = '';
    document.getElementById('newLocationAddress').value = '';
    document.getElementById('newLocationMapLink').value = '';
    document.getElementById('newLocationSuggestedCount').value = '';
    
    // 顯示成功訊息
    showMessage(document.getElementById('newLocationResult'), 'success', '<i class="bi bi-check-circle"></i> 站點已新增');
  }, 1000);
}

/**
 * 新增管理員
 */
function addNewAdmin() {
  const name = document.getElementById('newAdminName').value.trim();
  const role = document.getElementById('newAdminRole').value;
  const area = document.getElementById('newAdminArea').value;
  
  if (!name || !role || !area) {
    showMessage(document.getElementById('newAdminResult'), 'danger', '請填寫所有必填欄位');
    return;
  }
  
  // 顯示載入中訊息
  showMessage(document.getElementById('newAdminResult'), 'info', '<i class="bi bi-hourglass-split"></i> 正在新增管理員...');
  
  // 準備請求資料
  const newAdminData = {
    action: 'addAdmin',
    adminId: currentAdmin.id,
    adminName: currentAdmin.name,
    name: name,
    role: role,
    area: area
  };
  
  // 模擬 API 呼叫
  setTimeout(() => {
    // 生成唯一 ID
    const newAdminId = 'ADMIN' + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    // 添加到本地資料
    adminData.push({
      id: newAdminId,
      name: name,
      role: role,
      area: area,
      status: '啟用'
    });
    
    // 重新渲染管理員列表
    renderAdmins(adminData);
    
    // 清空表單
    document.getElementById('newAdminName').value = '';
    
    // 顯示成功訊息及 ID
    showMessage(document.getElementById('newAdminResult'), 'success', `<i class="bi bi-check-circle"></i> 管理員已新增<br><strong>ID: ${newAdminId}</strong> (請記下此 ID)`);
  }, 1000);
}
