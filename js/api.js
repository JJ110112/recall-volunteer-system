/**
 * api.js - 罷免志工班表系統 API 模組
 * 
 * 統一管理所有與後端 API 的通信
 */

/**
 * 封裝 API 請求
 * @param {string} action - API 操作名稱
 * @param {Object} data - 請求資料
 * @param {string} method - HTTP 方法，預設為 'POST'
 * @returns {Promise<Object>} - API 回應
 */
async function apiRequest(action, data = {}, method = 'POST') {
  try {
    const url = CONFIG.API_URL;
    const currentAdmin = window.authModule?.getCurrentAdmin();
    
    // 如果是已登入狀態，自動添加管理員資訊
    if (currentAdmin && method === 'POST') {
      data.adminId = currentAdmin.id;
      data.adminName = currentAdmin.name;
    }
    
    // 添加 action 參數
    data.action = action;
    
    let response;
    
    if (method === 'GET') {
      // 構建 URL 參數
      const params = new URLSearchParams();
      
      Object.entries(data).forEach(([key, value]) => {
        params.append(key, value);
      });
      
      response = await fetch(`${url}?${params.toString()}`);
    } else {
      // POST 請求
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
    }
    
    const responseData = await response.json();
    
    if (!responseData.success && responseData.message === '管理員身份驗證失敗') {
      // 管理員驗證失敗，可能是會話過期
      localStorage.removeItem(CONFIG.STORAGE_KEYS.ADMIN_SESSION);
      alert('您的登入已過期，請重新登入');
      window.location.href = 'admin.html';
      return { success: false };
    }
    
    return responseData;
  } catch (error) {
    console.error(`API 請求失敗 (${action}):`, error);
    return {
      success: false,
      message: `伺服器連接失敗: ${error.message}`
    };
  }
}

/**
 * 獲取系統資訊
 * @returns {Promise<Object>} - 系統資訊
 */
async function getSystemInfo() {
  return apiRequest('getSystemInfo', {}, 'GET');
}

/**
 * 獲取可用區域
 * @returns {Promise<Object>} - 區域列表
 */
async function getAreas() {
  return apiRequest('getAreas', {}, 'GET');
}

/**
 * 獲取特定區域的站點
 * @param {string} area - 區域名稱
 * @returns {Promise<Object>} - 站點列表
 */
async function getLocations(area) {
  return apiRequest('getLocations', { area }, 'GET');
}

/**
 * 獲取可用的班表時段
 * @param {string} area - 區域名稱
 * @param {string} date - 日期
 * @returns {Promise<Object>} - 時段列表
 */
async function getAvailableSlots(area, date) {
  return apiRequest('getAvailableSlots', { area, date }, 'GET');
}

/**
 * 管理員代為報名志工
 * @param {Object} volunteerData - 志工資料
 * @returns {Promise<Object>} - 報名結果
 */
async function adminRegisterVolunteer(volunteerData) {
  return apiRequest('adminRegister', volunteerData);
}

/**
 * 更新志工出席狀態
 * @param {string} registrationId - 報名 ID
 * @param {string} status - 新的狀態
 * @param {string} notes - 備註
 * @returns {Promise<Object>} - 更新結果
 */
async function updateAttendance(registrationId, status, notes) {
  return apiRequest('updateAttendance', {
    registrationId,
    status,
    notes
  });
}

/**
 * 發送通知
 * @param {Object} notificationData - 通知資料
 * @returns {Promise<Object>} - 發送結果
 */
async function sendNotification(notificationData) {
  return apiRequest('sendNotification', notificationData);
}

/**
 * 新增時段
 * @param {Object} scheduleData - 時段資料
 * @returns {Promise<Object>} - 新增結果
 */
async function addSchedule(scheduleData) {
  return apiRequest('addSchedule', scheduleData);
}

/**
 * 更新時段
 * @param {Object} scheduleData - 時段資料
 * @returns {Promise<Object>} - 更新結果
 */
async function updateSchedule(scheduleData) {
  return apiRequest('updateSlot', scheduleData);
}

/**
 * 刪除時段
 * @param {string} slotId - 時段 ID
 * @returns {Promise<Object>} - 刪除結果
 */
async function deleteSchedule(slotId) {
  return apiRequest('deleteSlot', { slotId });
}

/**
 * 新增站點
 * @param {Object} locationData - 站點資料
 * @returns {Promise<Object>} - 新增結果
 */
async function addLocation(locationData) {
  return apiRequest('addLocation', locationData);
}

/**
 * 更新站點
 * @param {Object} locationData - 站點資料
 * @returns {Promise<Object>} - 更新結果
 */
async function updateLocation(locationData) {
  return apiRequest('updateLocation', locationData);
}

/**
 * 刪除站點
 * @param {string} locationId - 站點 ID
 * @returns {Promise<Object>} - 刪除結果
 */
async function deleteLocation(locationId) {
  return apiRequest('deleteLocation', { locationId });
}

/**
 * 新增管理員
 * @param {Object} adminData - 管理員資料
 * @returns {Promise<Object>} - 新增結果
 */
async function addAdmin(adminData) {
  return apiRequest('addAdmin', adminData);
}

/**
 * 更新管理員
 * @param {Object} adminData - 管理員資料
 * @returns {Promise<Object>} - 更新結果
 */
async function updateAdmin(adminData) {
  return apiRequest('updateAdmin', adminData);
}

/**
 * 切換管理員狀態
 * @param {string} targetAdminId - 目標管理員 ID
 * @param {boolean} enabled - 是否啟用
 * @returns {Promise<Object>} - 更新結果
 */
async function toggleAdminStatus(targetAdminId, enabled) {
  return apiRequest('toggleAdminStatus', {
    targetAdminId,
    enabled
  });
}

/**
 * 保存系統設定
 * @param {Object} settings - 系統設定
 * @returns {Promise<Object>} - 保存結果
 */
async function saveSystemSettings(settings) {
  return apiRequest('updateSystemSettings', settings);
}

// 導出模塊
window.apiModule = {
  getSystemInfo,
  getAreas,
  getLocations,
  getAvailableSlots,
  adminRegisterVolunteer,
  updateAttendance,
  sendNotification,
  addSchedule,
  updateSchedule,
  deleteSchedule,
  addLocation,
  updateLocation,
  deleteLocation,
  addAdmin,
  updateAdmin,
  toggleAdminStatus,
  saveSystemSettings
};
