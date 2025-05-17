/**
 * 罷免志工班表系統 - 配置檔案
 */

const CONFIG = {
  // API 網址 (Google Apps Script 部署網址)
  API_URL: 'https://script.google.com/macros/s/AKfycbzBydYi14NWQSPfcb7_yYIKCO1C4CgC5waUdBVSU9lD7pDQU2vF5Dgg03j4XPoHxEEW/exec',
    
  // 系統名稱
  SYSTEM_NAME: '罷免志工班表系統',
  
  // 版本號
  VERSION: '1.0.0',
  
  // 組織名稱
  ORGANIZATION: '罷免行動小組',
  
  // 聯絡資訊
  CONTACT_EMAIL: 'volunteer@example.org',
  
  // 區域設定
  AREAS: ['南中正', '景美', '木柵'],
  
  // 時區設定 (8 = GMT+8)
  TIMEZONE_OFFSET: 8,
  
  // 是否啟用 LINE 通知
  LINE_NOTIFY_ENABLED: true,
  
  // 志工配額不足閾值 (低於此百分比標記為不足)
  VOLUNTEER_SHORTAGE_THRESHOLD: 0.7,
  
  // 志工配額極度不足閾值 (低於此百分比標記為極度不足)
  VOLUNTEER_CRITICAL_THRESHOLD: 0.3,
  
  // 資料重新載入間隔 (毫秒)
  REFRESH_INTERVAL: 300000, // 5分鐘
};
