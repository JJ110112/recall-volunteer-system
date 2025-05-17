/**
 * utils.js - 罷免志工班表系統通用工具函數
 * 
 * 集中管理所有通用工具函數
 */

/**
 * 顯示訊息
 * @param {HTMLElement} element - 顯示訊息的 DOM 元素
 * @param {string} type - 訊息類型 (success, danger, warning, info)
 * @param {string} message - 訊息內容 (支援 HTML)
 */
function showMessage(element, type, message) {
  if (!element) return;
  
  element.className = `alert alert-${type}`;
  element.innerHTML = message;
  element.classList.remove('d-none');
}

/**
 * 格式化日期為輸入欄位使用格式
 * @param {Date|string} date - 日期物件或字串
 * @returns {string} - 格式化後的日期字串 (YYYY-MM-DD)
 */
function formatDateForInput(date) {
  if (!date) return '';
  
  if (typeof date === 'string') {
    // 嘗試解析日期字串
    try {
      date = new Date(date);
    } catch (e) {
      console.error('日期解析錯誤:', e);
      return '';
    }
  }
  
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/**
 * 格式化日期為顯示格式
 * @param {Date|string} date - 日期物件或字串
 * @returns {string} - 格式化後的日期字串 (YYYY-MM-DD)
 */
function formatDateForDisplay(date) {
  if (!date) return '';
  
  if (typeof date === 'string') {
    // 如果已經是格式化的字串，直接返回
    if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return date;
    }
    
    // 嘗試解析日期字串
    try {
      date = new Date(date);
    } catch (e) {
      console.error('日期解析錯誤:', e);
      return '';
    }
  }
  
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/**
 * 獲取今天的日期
 * @returns {string} - 今天的日期字串 (YYYY-MM-DD)
 */
function getTodayDate() {
  return formatDateForInput(new Date());
}

/**
 * 生成唯一ID
 * @param {string} prefix - ID 前綴
 * @returns {string} - 唯一ID
 */
function generateUniqueId(prefix = 'ID') {
  const timestamp = new Date().getTime().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${timestamp}${random}`;
}

/**
 * 獲取URL參數
 * @param {string} name - 參數名稱
 * @returns {string|null} - 參數值
 */
function getUrlParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
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
 * @param {string} message - 錯誤訊息
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

/**
 * 安全地解析 JSON
 * @param {string} jsonString - JSON 字串
 * @param {*} defaultValue - 解析失敗時的預設值
 * @returns {*} - 解析結果或預設值
 */
function safeParseJSON(jsonString, defaultValue = null) {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.error('JSON 解析錯誤:', e);
    return defaultValue;
  }
}

/**
 * 確認對話框
 * @param {string} message - 確認訊息
 * @returns {Promise<boolean>} - 用戶選擇結果
 */
function confirmDialog(message) {
  return new Promise((resolve) => {
    resolve(window.confirm(message));
  });
}

/**
 * 深複製物件
 * @param {Object} obj - 要複製的物件
 * @returns {Object} - 複製後的物件
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * 輸出包含內容的 <div> 元素
 * @param {string} className - CSS 類名
 * @param {string} innerHTML - HTML 內容
 * @returns {string} - HTML 字串
 */
function div(className, innerHTML) {
  return `<div class="${className}">${innerHTML}</div>`;
}

/**
 * 創建 Badge HTML
 * @param {string} text - 文字
 * @param {string} type - 類型 (primary, success, warning, danger, etc.)
 * @returns {string} - Badge HTML
 */
function badge(text, type) {
  return `<span class="badge bg-${type}">${text}</span>`;
}

// 導出模塊
window.utilsModule = {
  showMessage,
  formatDateForInput,
  formatDateForDisplay,
  getTodayDate,
  generateUniqueId,
  getUrlParam,
  hideLoadingIndicator,
  showGlobalError,
  safeParseJSON,
  confirmDialog,
  deepClone,
  div,
  badge
};
