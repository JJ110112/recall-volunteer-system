/**
 * notifications.js - 罷免志工班表系統通知模組
 * 
 * 處理通知系統相關功能
 */

// 通知歷史記錄
let notificationHistory = [];

/**
 * 渲染通知系統
 */
function renderNotificationSystem() {
  // 載入區域選項
  const areaSelectElement = document.getElementById('notificationAreaSelect');
  if (areaSelectElement) {
    loadAreaOptions(areaSelectElement);
    
    // 註冊變更事件
    areaSelectElement.addEventListener('change', function() {
      const selectedArea = this.value;
      updateTimeSlotOptions(selectedArea);
    });
  }
  
  // 載入通知類型選項
  const notificationTypeElement = document.getElementById('notificationType');
  if (notificationTypeElement) {
    loadNotificationTypes(notificationTypeElement);
  }
  
  // 載入通知歷史記錄
  loadNotificationHistory();
  
  // 註冊發送通知按鈕
  const sendNotificationBtn = document.getElementById('sendNotificationBtn');
  if (sendNotificationBtn) {
    sendNotificationBtn.addEventListener('click', sendNotification);
  }
}

/**
 * 載入區域選項
 * @param {HTMLElement} selectElement - 選擇框元素
 */
function loadAreaOptions(selectElement) {
  // 獲取區域列表（實際系統中應該從 API 獲取）
  let areas = CONFIG.DEFAULT_AREAS || ['南中正', '景美', '木柵'];
  
  // 如果有 locationsModule，則從站點模組獲取區域列表
  if (window.locationsModule && window.locationsModule.getAllLocations) {
    const locations = window.locationsModule.getAllLocations();
    areas = [...new Set(locations.map(loc => loc.area))];
  }
  
  let html = '<option value="">選擇區域</option>';
  areas.forEach(area => {
    html += `<option value="${area}">${area}</option>`;
  });
  
  selectElement.innerHTML = html;
}

/**
 * 載入通知類型選項
 * @param {HTMLElement} selectElement - 選擇框元素
 */
function loadNotificationTypes(selectElement) {
  // 通知類型（可從配置中獲取）
  const types = CONFIG.NOTIFICATION_TYPES || [
    { id: '緊急需求', label: '緊急需求' },
    { id: '提醒通知', label: '提醒通知' },
    { id: '行程變更', label: '行程變更' },
    { id: '一般訊息', label: '一般訊息' }
  ];
  
  let html = '<option value="">選擇類型</option>';
  types.forEach(type => {
    html += `<option value="${type.id}">${type.label}</option>`;
  });
  
  selectElement.innerHTML = html;
}

/**
 * 更新時段選項
 * @param {string} area - 區域
 */
function updateTimeSlotOptions(area) {
  const timeSlotSelectElement = document.getElementById('notificationTimeSlotSelect');
  if (!timeSlotSelectElement) return;
  
  if (!area) {
    timeSlotSelectElement.innerHTML = '<option value="">請先選擇區域</option>';
    timeSlotSelectElement.disabled = true;
    return;
  }
  
  // 過濾該區域的時段（實際系統中應該從 API 獲取）
  let slots = [];
  
  if (window.schedulesModule && window.schedulesModule.getAllSlots) {
    const allSlots = window.schedulesModule.getAllSlots();
    slots = allSlots.filter(slot => slot.area === area);
  }
  
  let html = '<option value="">選擇時段</option>';
  slots.forEach(slot => {
    html += `<option value="${slot.id}">${slot.date} ${slot.time} - ${slot.location}</option>`;
  });
  
  timeSlotSelectElement.innerHTML = html;
  timeSlotSelectElement.disabled = false;
}

/**
 * 載入通知歷史記錄
 */
async function loadNotificationHistory() {
  try {
    // 實際系統中應該調用 API 獲取通知歷史
    // const response = await window.apiModule.getNotificationHistory();
    // if (response.success) {
    //   notificationHistory = response.history;
    // }
    
    // 目前使用模擬資料
    await new Promise(resolve => setTimeout(resolve, 300));
    
    notificationHistory = [
      {
        id: 'NOTIF-001',
        type: '緊急需求',
        sentTime: new Date(new Date().getTime() - 2 * 60 * 60 * 1000), // 2小時前
        recipientCount: 5,
        area: '南中正',
        location: '捷運東門站'
      },
      {
        id: 'NOTIF-002',
        type: '提醒通知',
        sentTime: new Date(new Date().getTime() - 20 * 60 * 60 * 1000), // 20小時前
        recipientCount: 12,
        area: '木柵',
        location: '全區域'
      }
    ];
    
    // 更新通知記錄顯示
    updateNotificationHistoryDisplay();
  } catch (error) {
    console.error('獲取通知歷史記錄時出錯:', error);
  }
}

/**
 * 更新通知歷史記錄顯示
 */
function updateNotificationHistoryDisplay() {
  const historyContainer = document.querySelector('.card:nth-of-type(2) .card-body ul');
  if (!historyContainer) return;
  
  if (notificationHistory.length === 0) {
    historyContainer.innerHTML = '<li class="list-group-item">暫無通知記錄</li>';
    return;
  }
  
  let html = '';
  
  // 取最近 5 筆記錄
  const recentHistory = notificationHistory.slice(0, 5);
  
  recentHistory.forEach(notification => {
    const timeString = formatNotificationTime(notification.sentTime);
    
    html += `
      <li class="list-group-item">
        <div class="d-flex w-100 justify-content-between">
          <h6 class="mb-1">${notification.type}通知</h6>
          <small>${timeString}</small>
        </div>
        <p class="mb-1">已發送給 ${notification.recipientCount} 位志工</p>
        <small class="text-muted">${notification.area}區 ${notification.location}</small>
      </li>
    `;
  });
  
  historyContainer.innerHTML = html;
  
  // 註冊點擊事件
  historyContainer.querySelectorAll('.list-group-item').forEach((item, index) => {
    item.addEventListener('click', function() {
      viewNotificationDetails(recentHistory[index].id);
    });
    
    // 添加滑鼠懸停效果
    item.style.cursor = 'pointer';
    item.addEventListener('mouseenter', function() {
      this.classList.add('list-group-item-action');
    });
    item.addEventListener('mouseleave', function() {
      this.classList.remove('list-group-item-action');
    });
  });
}

/**
 * 格式化通知時間
 * @param {Date|string} time - 時間
 * @returns {string} - 格式化後的時間字串
 */
function formatNotificationTime(time) {
  if (!time) return '';
  
  if (typeof time === 'string') {
    time = new Date(time);
  }
  
  const now = new Date();
  const diffMs = now - time;
  const diffMinutes = Math.floor(diffMs / (60 * 1000));
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  
  if (diffMinutes < 60) {
    return `${diffMinutes} 分鐘前`;
  } else if (diffHours < 24) {
    return `${diffHours} 小時前`;
  } else if (diffDays < 7) {
    return `${diffDays} 天前`;
  } else {
    return `${time.getFullYear()}-${String(time.getMonth() + 1).padStart(2, '0')}-${String(time.getDate()).padStart(2, '0')}`;
  }
}

/**
 * 查看通知詳情
 * @param {string} notificationId - 通知 ID
 */
function viewNotificationDetails(notificationId) {
  // 實際系統中應該調用 API 獲取通知詳情
  const notification = notificationHistory.find(n => n.id === notificationId);
  
  if (!notification) {
    alert('找不到指定的通知');
    return;
  }
  
  // 創建 Modal
  window.uiModule.createModal(
    'notificationDetailsModal',
    '通知詳情',
    `
      <div class="card">
        <div class="card-body">
          <div class="mb-3">
            <strong>通知類型：</strong> ${notification.type}
          </div>
          <div class="mb-3">
            <strong>發送時間：</strong> ${notification.sentTime.toLocaleString()}
          </div>
          <div class="mb-3">
            <strong>接收者：</strong> ${notification.area}區 ${notification.location} 的志工 (共 ${notification.recipientCount} 人)
          </div>
          <div class="mb-3">
            <strong>通知內容：</strong>
            <p class="mt-2">緊急通知內容已省略...</p>
          </div>
        </div>
      </div>
    `,
    [
      { text: '關閉', type: 'secondary', onClick: 'close' }
    ]
  );
}

/**
 * 發送通知
 */
async function sendNotification() {
  const type = document.getElementById('notificationType').value;
  const area = document.getElementById('notificationAreaSelect').value;
  const timeSlotId = document.getElementById('notificationTimeSlotSelect').value;
  const content = document.getElementById('notificationContent').value;
  
  if (!type || !content) {
    window.utilsModule.showMessage(
      document.getElementById('notificationResult'),
      'danger',
      '通知類型和內容為必填'
    );
    return;
  }
  
  if (!area && !timeSlotId) {
    window.utilsModule.showMessage(
      document.getElementById('notificationResult'),
      'danger',
      '請選擇區域或時段'
    );
    return;
  }
  
  // 顯示載入中訊息
  window.utilsModule.showMessage(
    document.getElementById('notificationResult'),
    'info',
    '<i class="bi bi-hourglass-split"></i> 正在發送通知...'
  );
  
  try {
    // 準備請求資料
    const notificationData = {
      type: type,
      content: content
    };
    
    if (area) notificationData.area = area;
    if (timeSlotId) notificationData.timeSlotId = timeSlotId;
    
    // 實際系統中應該調用 API 發送通知
    // const response = await window.apiModule.sendNotification(notificationData);
    
    // 目前模擬 API 調用
    await new Promise(resolve => setTimeout(resolve, 1000));
    const response = { 
      success: true,
      message: '通知已成功發送',
      recipientCount: Math.floor(Math.random() * 10) + 5
    };
    
    if (response.success) {
      // 添加到通知歷史
      const newNotification = {
        id: 'NOTIF-' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0'),
        type: type,
        sentTime: new Date(),
        recipientCount: response.recipientCount,
        area: area || '特定時段',
        location: timeSlotId ? '特定站點' : (area ? '全區域' : '全系統')
      };
      
      notificationHistory.unshift(newNotification);
      
      // 更新通知記錄顯示
      updateNotificationHistoryDisplay();
      
      // 顯示成功訊息
      window.utilsModule.showMessage(
        document.getElementById('notificationResult'),
        'success',
        `<i class="bi bi-check-circle"></i> 通知已成功發送給 ${response.recipientCount} 位志工`
      );
      
      // 清空表單
      document.getElementById('notificationContent').value = '';
    } else {
      throw new Error(response.message || '發送失敗');
    }
  } catch (error) {
    console.error('發送通知時出錯:', error);
    window.utilsModule.showMessage(
      document.getElementById('notificationResult'),
      'danger',
      `<i class="bi bi-exclamation-triangle"></i> 發送通知時發生錯誤: ${error.message}`
    );
  }
}

/**
 * 使用通知範本
 * @param {string} templateType - 範本類型
 */
function useTemplate(templateType) {
  const typeSelect = document.getElementById('notificationType');
  const contentTextarea = document.getElementById('notificationContent');
  
  if (!typeSelect || !contentTextarea) return;
  
  // 選擇對應類型
  Array.from(typeSelect.options).forEach(option => {
    if (option.text === templateType) {
      typeSelect.value = option.value;
    }
  });
  
  // 填入範本內容
  let templateContent = '';
  
  switch (templateType) {
    case '緊急需求':
      templateContent = '親愛的志工，{區域}{站點}目前人力不足，急需支援！時間：{日期} {時間}。如果您有空，請點選連結報名：{連結}。感謝您的支持！';
      break;
    case '提醒通知':
      templateContent = '親愛的志工，提醒您明日({日期})有班表：{時間} {站點}。請準時出席並留意天氣狀況。若有任何問題，請聯繫您的組長。';
      break;
    case '行程變更':
      templateContent = '親愛的志工，因應狀況變化，原定於{日期} {時間}的{站點}班表有所調整：{調整內容}。請查看最新資訊，如有疑問請聯繫我們。';
      break;
    default:
      templateContent = '';
  }
  
  contentTextarea.value = templateContent;
}

/**
 * 初始化模組
 */
function init() {
  // 註冊範本點擊事件
  document.querySelectorAll('.list-group-item-action').forEach(btn => {
    btn.addEventListener('click', function() {
      const templateType = this.querySelector('small').textContent;
      useTemplate(templateType);
    });
  });
}

/**
 * 加載通知系統模組
 */
function load() {
  renderNotificationSystem();
  init();
  
  // 綁定範本使用函數到全局以供 HTML 中的 onclick 使用
  window.useTemplate = useTemplate;
}

// 導出模塊
window.notificationsModule = {
  load,
  renderNotificationSystem,
  sendNotification,
  useTemplate,
  viewNotificationDetails
};
