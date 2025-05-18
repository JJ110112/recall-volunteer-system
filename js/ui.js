/**
 * ui.js - 文山退葆志工班表系統 UI 模組
 * 
 * 統一管理 UI 操作和交互
 */

// 當前顯示的視圖
let currentView = 'dashboard';

/**
 * 設置事件監聽器
 */
function setupEventListeners() {
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
    logoutBtn.addEventListener('click', window.authModule.handleLogout);
  }
  
  // 登入表單提交
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', window.authModule.handleAdminLogin);
  }
}

/**
 * 切換主要視圖
 * @param {string} viewName - 視圖名稱
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
    
    // 觸發視圖加載事件
    const viewLoadedEvent = new CustomEvent('view-loaded', { 
      detail: { view: viewName } 
    });
    document.dispatchEvent(viewLoadedEvent);
    
    // 如果存在對應模組的加載方法，調用它
    if (window.componentsModule && window.componentsModule[viewName] && 
        typeof window.componentsModule[viewName].load === 'function') {
      window.componentsModule[viewName].load();
    }
  }
}

/**
 * 動態創建 Modal 對話框
 * @param {string} id - Modal ID
 * @param {string} title - 標題
 * @param {string} bodyContent - 內容 HTML
 * @param {Array} buttons - 按鈕配置數組，格式：[{text, type, onClick}]
 * @param {Object} options - 額外選項
 * @returns {bootstrap.Modal} - Bootstrap Modal 實例
 */
function createModal(id, title, bodyContent, buttons = [], options = {}) {
  // 移除可能存在的相同 ID 的 modal
  const existingModal = document.getElementById(id);
  if (existingModal) {
    existingModal.remove();
  }
  
  // 默認按鈕
  if (buttons.length === 0) {
    buttons = [
      {
        text: '關閉',
        type: 'secondary',
        onClick: 'close'
      }
    ];
  }
  
  // 建構按鈕 HTML
  let buttonsHtml = '';
  buttons.forEach(button => {
    const clickAttr = button.onClick === 'close' 
      ? 'data-bs-dismiss="modal"' 
      : `onclick="document.getElementById('${id}').dispatchEvent(new CustomEvent('button-click', {detail: '${button.text}'}))"`; 
    
    buttonsHtml += `
      <button type="button" class="btn btn-${button.type}" ${clickAttr}>
        ${button.text}
      </button>
    `;
  });
  
  // 建構 Modal HTML
  const modalHtml = `
    <div class="modal fade" id="${id}" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog ${options.size || ''}">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${title}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            ${bodyContent}
          </div>
          <div class="modal-footer">
            ${buttonsHtml}
          </div>
        </div>
      </div>
    </div>
  `;
  
  // 添加到 DOM
  document.body.insertAdjacentHTML('beforeend', modalHtml);
  
  // 獲取 Modal 元素
  const modalElement = document.getElementById(id);
  
  // 註冊按鈕點擊事件
  modalElement.addEventListener('button-click', function(e) {
    const buttonText = e.detail;
    const button = buttons.find(b => b.text === buttonText);
    
    if (button && typeof button.onClick === 'function') {
      button.onClick();
    }
  });
  
  // 創建 Bootstrap Modal 實例
  const modal = new bootstrap.Modal(modalElement);
  
  // 監聽 Modal 關閉事件
  modalElement.addEventListener('hidden.bs.modal', function() {
    if (options.removeOnClose !== false) {
      this.remove();
    }
    
    if (options.onClose && typeof options.onClose === 'function') {
      options.onClose();
    }
  });
  
  // 顯示 Modal
  modal.show();
  
  return modal;
}

/**
 * 創建確認對話框
 * @param {string} title - 標題
 * @param {string} message - 訊息
 * @param {Function} onConfirm - 確認回調
 * @param {string} confirmText - 確認按鈕文字
 * @param {string} confirmType - 確認按鈕類型
 * @returns {bootstrap.Modal} - Bootstrap Modal 實例
 */
function createConfirmDialog(title, message, onConfirm, confirmText = '確認', confirmType = 'danger') {
  return createModal(
    'confirmDialog',
    title,
    `<p>${message}</p>`,
    [
      {
        text: '取消',
        type: 'secondary',
        onClick: 'close'
      },
      {
        text: confirmText,
        type: confirmType,
        onClick: function() {
          if (typeof onConfirm === 'function') {
            onConfirm();
          }
          bootstrap.Modal.getInstance(document.getElementById('confirmDialog')).hide();
        }
      }
    ]
  );
}

/**
 * 建立表單 HTML
 * @param {Array} fields - 表單欄位配置
 * @returns {string} - 表單 HTML
 */
function createFormHtml(fields) {
  let html = '';
  
  fields.forEach(field => {
    switch (field.type) {
      case 'text':
      case 'number':
      case 'email':
      case 'password':
      case 'date':
      case 'time':
      case 'url':
        html += `
          <div class="mb-3">
            <label for="${field.id}" class="form-label">${field.label}</label>
            <input type="${field.type}" class="form-control" id="${field.id}" 
                   value="${field.value || ''}" ${field.required ? 'required' : ''} 
                   ${field.min !== undefined ? `min="${field.min}"` : ''}
                   ${field.max !== undefined ? `max="${field.max}"` : ''}
                   ${field.disabled ? 'disabled' : ''}>
          </div>
        `;
        break;
        
      case 'select':
        let optionsHtml = '';
        if (field.placeholder) {
          optionsHtml += `<option value="">${field.placeholder}</option>`;
        }
        
        if (field.options && Array.isArray(field.options)) {
          field.options.forEach(option => {
            const selected = option.value === field.value ? 'selected' : '';
            optionsHtml += `<option value="${option.value}" ${selected}>${option.label}</option>`;
          });
        }
        
        html += `
          <div class="mb-3">
            <label for="${field.id}" class="form-label">${field.label}</label>
            <select class="form-select" id="${field.id}" ${field.required ? 'required' : ''} ${field.disabled ? 'disabled' : ''}>
              ${optionsHtml}
            </select>
          </div>
        `;
        break;
        
      case 'textarea':
        html += `
          <div class="mb-3">
            <label for="${field.id}" class="form-label">${field.label}</label>
            <textarea class="form-control" id="${field.id}" rows="${field.rows || 3}" 
                      ${field.required ? 'required' : ''} ${field.disabled ? 'disabled' : ''}>${field.value || ''}</textarea>
          </div>
        `;
        break;
        
      case 'checkbox':
        html += `
          <div class="mb-3 form-check">
            <input type="checkbox" class="form-check-input" id="${field.id}" ${field.checked ? 'checked' : ''} ${field.disabled ? 'disabled' : ''}>
            <label class="form-check-label" for="${field.id}">${field.label}</label>
          </div>
        `;
        break;
        
      case 'hidden':
        html += `<input type="hidden" id="${field.id}" value="${field.value || ''}">`;
        break;
        
      case 'alert':
        html += `<div id="${field.id}" class="alert d-none"></div>`;
        break;
    }
  });
  
  return html;
}

/**
 * 從表單獲取數據
 * @param {Array} fields - 表單欄位配置
 * @returns {Object} - 表單數據
 */
function getFormData(fields) {
  const data = {};
  
  fields.forEach(field => {
    if (field.type === 'alert') return;
    
    const element = document.getElementById(field.id);
    if (!element) return;
    
    if (field.type === 'checkbox') {
      data[field.id] = element.checked;
    } else {
      data[field.id] = element.value;
    }
  });
  
  return data;
}

/**
 * 創建表單對話框
 * @param {string} id - 對話框 ID
 * @param {string} title - 標題
 * @param {Array} fields - 表單欄位配置
 * @param {Function} onSubmit - 提交回調
 * @param {Object} options - 額外選項
 * @returns {bootstrap.Modal} - Bootstrap Modal 實例
 */
function createFormDialog(id, title, fields, onSubmit, options = {}) {
  const formHtml = createFormHtml(fields);
  
  const bodyContent = `
    <form id="${id}Form">
      ${formHtml}
    </form>
  `;
  
  const modal = createModal(
    id,
    title,
    bodyContent,
    [
      {
        text: '取消',
        type: 'secondary',
        onClick: 'close'
      },
      {
        text: options.submitText || '提交',
        type: options.submitType || 'primary',
        onClick: function() {
          const formData = getFormData(fields);
          
          if (typeof onSubmit === 'function') {
            const result = onSubmit(formData);
            
            // 如果返回 false，不關閉對話框
            if (result === false) {
              return;
            }
          }
          
          if (!options.keepOpen) {
            bootstrap.Modal.getInstance(document.getElementById(id)).hide();
          }
        }
      }
    ],
    options
  );
  
  return modal;
}

// 導出模塊
window.uiModule = {
  setupEventListeners,
  switchView,
  createModal,
  createConfirmDialog,
  createFormDialog,
  getCurrentView: () => currentView
};
