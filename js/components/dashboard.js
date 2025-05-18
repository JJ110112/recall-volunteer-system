/**
 * dashboard.js - 文山退葆志工班表系統儀表板模組
 * 
 * 處理儀表板相關功能
 */

/**
 * 渲染儀表板
 */
function renderDashboard() {
  // 獲取今天的日期
  const today = new Date();
  const formattedToday = window.utilsModule.formatDateForInput(today);
  
  // 更新統計數字
  updateStatistics();
  
  // 更新急需人力班表
  updateUrgentSlots();
  
  // 更新今日班表
  updateTodaySlots(formattedToday);
}

/**
 * 更新統計數字
 */
function updateStatistics() {
  // 獲取志工和班表數據
  const volunteers = window.volunteersModule ? window.volunteersData || [] : [];
  const slots = window.schedulesModule ? window.schedulesModule.getAllSlots() || [] : [];
  
  // 總志工人數
  document.getElementById('totalVolunteers').textContent = volunteers.length || 0;
  
  // 已簽到志工
  const checkedIn = volunteers.filter(v => v && v.status === '已出席').length;
  document.getElementById('checkedInVolunteers').textContent = checkedIn || 0;
  
  // 總班表數量
  document.getElementById('totalSlots').textContent = slots.length || 0;
  
  // 人力不足班表
  const urgentSlots = slots.filter(s => s && (s.status === '極度不足' || s.status === '不足')).length;
  document.getElementById('urgentSlots').textContent = urgentSlots || 0;
}

/**
 * 更新急需人力班表
 */
function updateUrgentSlots() {
  const urgentSlotsElement = document.getElementById('urgentSlotsList');
  if (!urgentSlotsElement) return;
  
  // 獲取急需人力的班表
  let urgentSlots = [];
  
  if (window.schedulesModule && typeof window.schedulesModule.getUrgentSlots === 'function') {
    urgentSlots = window.schedulesModule.getUrgentSlots();
  }
  
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
    
    // 註冊點擊事件
    urgentSlotsElement.querySelectorAll('.card').forEach((card, index) => {
      card.addEventListener('click', function() {
        if (window.schedulesModule && typeof window.schedulesModule.viewSlotDetails === 'function') {
          window.schedulesModule.viewSlotDetails(urgentSlots[index].id);
        }
      });
      
      // 添加滑鼠懸停效果
      card.style.cursor = 'pointer';
      card.addEventListener('mouseenter', function() {
        this.classList.add('shadow-sm');
      });
      card.addEventListener('mouseleave', function() {
        this.classList.remove('shadow-sm');
      });
    });
  } else {
    urgentSlotsElement.innerHTML = '<div class="alert alert-success">目前沒有人力不足的班表</div>';
  }
}

/**
 * 更新今日班表
 * @param {string} todayDate - 今日日期 (YYYY-MM-DD)
 */
function updateTodaySlots(todayDate) {
  const todaySlotsElement = document.getElementById('todaySlotsList');
  if (!todaySlotsElement) return;
  
  // 獲取今日班表
  let todaySlots = [];
  
  if (window.schedulesModule && typeof window.schedulesModule.getSlotsByDate === 'function') {
    todaySlots = window.schedulesModule.getSlotsByDate(todayDate);
  }
  
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
    
    // 註冊點擊事件
    todaySlotsElement.querySelectorAll('.card').forEach((card, index) => {
      card.addEventListener('click', function() {
        if (window.schedulesModule && typeof window.schedulesModule.viewSlotDetails === 'function') {
          window.schedulesModule.viewSlotDetails(todaySlots[index].id);
        }
      });
      
      // 添加滑鼠懸停效果
      card.style.cursor = 'pointer';
      card.addEventListener('mouseenter', function() {
        this.classList.add('shadow-sm');
      });
      card.addEventListener('mouseleave', function() {
        this.classList.remove('shadow-sm');
      });
    });
  } else {
    todaySlotsElement.innerHTML = '<div class="alert alert-info">今日沒有班表</div>';
  }
}

/**
 * 發送今日提醒
 */
async function sendTodayReminders() {
  // 獲取今天的日期
  const today = new Date();
  const formattedToday = window.utilsModule.formatDateForInput(today);
  
  // 獲取今日班表
  let todaySlots = [];
  
  if (window.schedulesModule && typeof window.schedulesModule.getSlotsByDate === 'function') {
    todaySlots = window.schedulesModule.getSlotsByDate(formattedToday);
  }
  
  if (todaySlots.length === 0) {
    alert('今日沒有班表，無法發送提醒');
    return;
  }
  
  // 確認是否發送提醒
  if (!confirm(`確定要發送今日 (${formattedToday}) 的${todaySlots.length}個班表提醒嗎？`)) {
    return;
  }
  
  try {
    // 實際系統中應該調用 API 發送提醒
    // const response = await window.apiModule.sendNotification({
    //   date: formattedToday,
    //   type: '提醒通知',
    //   content: `親愛的志工，提醒您今日(${formattedToday})有班表，請準時出席並留意天氣狀況。`
    // });
    
    // 目前模擬 API 調用
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    alert('已成功發送今日班表提醒');
  } catch (error) {
    console.error('發送今日提醒時出錯:', error);
    alert(`發送今日提醒時發生錯誤: ${error.message}`);
  }
}

/**
 * 初始化模組
 */
function init() {
  // 註冊今日提醒按鈕事件
  const sendTodayReminderBtn = document.querySelector('#todaySlotsList + .card-footer button');
  if (sendTodayReminderBtn) {
    sendTodayReminderBtn.addEventListener('click', sendTodayReminders);
  }
}

/**
 * 加載儀表板模組
 */
function load() {
  renderDashboard();
  init();
}

// 導出模塊
window.dashboardModule = {
  load,
  renderDashboard,
  updateStatistics,
  updateUrgentSlots,
  updateTodaySlots,
  sendTodayReminders
};
