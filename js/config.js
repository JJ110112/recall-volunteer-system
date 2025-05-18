/**
 * config.js - 文山退葆志工班表系統配置文件
 * 
 * 集中管理所有系統配置和常量
 */

// 全局配置物件
const CONFIG = {
  // API 基礎 URL
  API_URL: 'https://script.google.com/macros/s/AKfycbzBydYi14NWQSPfcb7_yYIKCO1C4CgC5waUdBVSU9lD7pDQU2vF5Dgg03j4XPoHxEEW/exec',
  
  // 系統版本
  VERSION: '1.0.0',
  
  // 系統名稱
  SYSTEM_NAME: '文山退葆志工班表系統',
  
  // 本地存儲鍵名
  STORAGE_KEYS: {
    ADMIN_SESSION: 'adminSession'
  },
  
  // 會話超時設定（毫秒） - 24小時
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000,
  
  // 預設區域列表
  DEFAULT_AREAS: ['南中正', '景美', '木柵'],
  
  // 通知類型
  NOTIFICATION_TYPES: [
    { id: '緊急需求', label: '緊急需求' },
    { id: '提醒通知', label: '提醒通知' },
    { id: '行程變更', label: '行程變更' },
    { id: '一般訊息', label: '一般訊息' }
  ],
  
  // 志工狀態
  VOLUNTEER_STATUS: {
    REGISTERED: '已報名',
    CHECKED_IN: '已出席',
    ABSENT: '未簽到',
    CANCELED: '已取消'
  },
  
  // 管理員角色
  ADMIN_ROLES: [
    { id: '總管理員', label: '總管理員' },
    { id: '區域組長', label: '區域組長' },
    { id: '副組長', label: '副組長' }
  ]
};

// 如果需要從遠端獲取配置
async function loadRemoteConfig() {
  try {
    const response = await fetch(`${CONFIG.API_URL}?action=getSystemInfo`);
    const data = await response.json();
    
    if (data.success) {
      // 更新配置
      CONFIG.SYSTEM_NAME = data.systemName || CONFIG.SYSTEM_NAME;
      CONFIG.VERSION = data.version || CONFIG.VERSION;
      
      // 觸發配置加載完成事件
      const event = new CustomEvent('config-loaded', { detail: CONFIG });
      document.dispatchEvent(event);
      
      return CONFIG;
    }
  } catch (error) {
    console.error('載入遠程配置失敗:', error);
  }
  
  return CONFIG;
}

// 導出配置
window.CONFIG = CONFIG;
window.loadRemoteConfig = loadRemoteConfig;
