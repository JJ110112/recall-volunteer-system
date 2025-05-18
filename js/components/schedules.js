/**
 * schedules.js - 文山退葆志工班表系統班表管理模組
 * 
 * 處理所有班表相關功能
 */

// 班表資料
let scheduleData = [];
// 站點資料（用於初始化班表表單）
let locationData = [];

/**
 * 獲取班表資料
 * @returns {Promise<Array>} - 班表資料
 */
async function fetchSchedules() {
  try {
    // 在實際系統中，這應該調用 API 獲取班表資料
    // 目前使用模擬資料
    return new Promise((resolve) => {
      setTimeout(() => {
        scheduleData = [
          { id: 'TS-001', area: '南中正', date: '2025-05-20', time: '08:00 - 10:00', location: '捷運古亭站', requiredCount: 3, currentCount: 2, status: '不足' },
          { id: 'TS-002', area: '南中正', date: '2025-05-20', time: '10:00 - 12:00', location: '捷運東門站', requiredCount: 2, currentCount: 2, status: '充足' },
          { id: 'TS-003', area: '景美', date: '2025-05-21', time: '14:00 - 16:00', location: '景美火車站', requiredCount: 4, currentCount: 1, status: '極度不足' }
        ];
        resolve(scheduleData);
        
        // 渲染班表
        renderSchedules();
      }, 300);
    });
  } catch (error) {
    console.error('獲取班表資料時出錯:', error);
    window.utilsModule.showGlobalError('獲取班表資料時發生錯誤，請重新整理頁面或聯絡系統管理員');
    return [];
  }
}

/**
 * 獲取站點資料
 * @returns {Promise<Array>} - 站點資料
 */
async function fetchLocationsForSchedule() {
  try {
    // 在實際系統中，這應該調用 API 獲取站點資料
    // 目前使用模擬資料
    return new Promise((resolve) => {
      setTimeout(() => {
        locationData = [
          { id: 'LOC-001', name: '捷運古亭站', area: '南中正', address: '台北市中正區羅斯福路二段', mapLink: 'https://goo.gl/maps/example1', suggestedCount: 3 },
          { id: 'LOC-002', name: '捷運東門站', area: '南中正', address: '台北市大安區信義路二段', mapLink: 'https://goo.gl/maps/example2', suggestedCount: 2 },
          { id: 'LOC-003', name: '景美火車站', area: '景美', address: '台北市文山區景中街', mapLink: 'https://goo.gl/maps/example3', suggestedCount: 4 }
        ];
        resolve(locationData);
        
        // 更新新增班表表單的站點選項
        updateLocationOptions();
      }, 300);
    });
  } catch (error) {
    console.error('獲取站點資料時出錯:', error);
    return [];
  }
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
      statusBadge = window.utilsModule.badge('充足', 'success');
    } else if (slot.status === '不足') {
      statusBadge = window.utilsModule.badge('不足', 'warning');
    } else if (slot.status === '極度不足') {
      statusBadge = window.utilsModule.badge('極度不足', 'danger');
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
  
  // 註冊事件
  registerScheduleEvents();
}

/**
 * 註冊班表事件
 */
function registerScheduleEvents() {
  // 查看班表細節按鈕
  document.querySelectorAll('.view-slot-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const slotId = this.getAttribute('data-slot-id');
      viewSlotDetails(slotId);
    });
  });
  
  // 發送通知按鈕
  document.querySelectorAll('.send-notification-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const slotId = this.getAttribute('data-slot-id');
      openSendNotificationModal(slotId);
    });
  });
  
  // 刪除班表按鈕
  document.querySelectorAll('.delete-slot-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const slotId = this.getAttribute('data-slot-id');
      confirmDeleteSlot(slotId);
    });
  });
  
  // 註冊過濾按鈕事件
  const applyScheduleFilterBtn = document.getElementById('applyScheduleFilter');
  if (applyScheduleFilterBtn) {
    applyScheduleFilterBtn.addEventListener('click', filterSchedules);
  }
}

/**
 * 過濾班表資料
 * @param {Event} e - 事件
 */
function filterSchedules(e) {
  if (e) e.preventDefault();
  
  const area = document.getElementById('filterScheduleArea').value;
  const date = document.getElementById('filterScheduleDate').value;
  const status = document.getElementById('filterScheduleStatus').value;
  
  // 在實際系統中，應該調用 API 獲取過濾結果
  // 目前使用客戶端過濾
  const filteredData = scheduleData.filter(slot => {
    if (area && slot.area !== area) return false;
    if (date && slot.date !== date) return false;
    if (status && slot.status !== status) return false;
    
    return true;
  });
  
  let html = '';
  
  if (filteredData.length === 0) {
    html = '<tr><td colspan="7" class="text-center">沒有符合條件的班表</td></tr>';
  } else {
    filteredData.forEach(slot => {
      let statusBadge = '';
      if (slot.status === '充足') {
        statusBadge = window.utilsModule.badge('充足', 'success');
      } else if (slot.status === '不足') {
        statusBadge = window.utilsModule.badge('不足', 'warning');
      } else if (slot.status === '極度不足') {
        statusBadge = window.utilsModule.badge('極度不足', 'danger');
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
  }
  
  const schedulesTableBody = document.getElementById('schedulesTableBody');
  if (schedulesTableBody) {
    schedulesTableBody.innerHTML = html;
    registerScheduleEvents();
  }
}

/**
 * 查看時段詳情
 * @param {string} slotId - 時段 ID
 */
function viewSlotDetails(slotId) {
  // 根據 slotId 獲取時段資訊
  const slot = scheduleData.find(s => s.id === slotId);
  
  if (!slot) {
    alert('找不到指定的時段');
    return;
  }
  
  // 準備志工名單（實際系統中應該是從 API 獲取）
  // 目前模擬資料 - 尋找時段對應的志工
  const slotVolunteers = window.volunteersModule ? 
    (Array.isArray(window.volunteersData) ? 
      window.volunteersData.filter(v => v.timeSlot === slotId) : 
      []) : 
    [];
  
  let volunteersHtml = '';
  
  if (slotVolunteers.length > 0) {
    slotVolunteers.forEach(v => {
      let statusBadge = '';
      if (v.status === '已出席') {
        statusBadge = window.utilsModule.badge('已出席', 'success');
      } else if (v.status === '未簽到') {
        statusBadge = window.utilsModule.badge('未簽到', 'warning');
      } else {
        statusBadge = window.utilsModule.badge('已報名', 'secondary');
      }
      
      volunteersHtml += `
        <tr>
          <td>${v.name}</td>
          <td>${v.contact}</td>
          <td>${statusBadge}</td>
        </tr>
      `;
    });
  } else {
    volunteersHtml = '<tr><td colspan="3" class="text-center">目前沒有志工報名此時段</td></tr>';
  }
  
  // 創建 Modal
  window.uiModule.createModal(
    'slotDetailsModal',
    '時段詳情',
    `
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
            <button class="btn btn-sm btn-success" onclick="window.schedulesModule.addVolunteerToSlot('${slotId}')">
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
    `,
    [
      { text: '關閉', type: 'secondary', onClick: 'close' },
      { 
        text: '編輯時段', 
        type: 'primary', 
        onClick: function() {
          // 關閉詳情 Modal
          bootstrap.Modal.getInstance(document.getElementById('slotDetailsModal')).hide();
          
          // 打開編輯時段 Modal
          setTimeout(() => {
            editSlot(slotId);
          }, 400);
        }
      },
      { 
        text: '發送通知', 
        type: 'success', 
        onClick: function() {
          // 關閉詳情 Modal
          bootstrap.Modal.getInstance(document.getElementById('slotDetailsModal')).hide();
          
          // 打開發送通知 Modal
          setTimeout(() => {
            openSendNotificationModal(slotId);
          }, 400);
        }
      }
    ],
    { size: 'modal-lg' }
  );
}

/**
 * 添加志工到時段
 * @param {string} slotId - 時段 ID
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
  
  // 創建表單
  const formFields = [
    { type: 'hidden', id: 'addVolunteerSlotId', value: slotId },
    { 
      type: 'text',
      id: 'slotInfo',
      label: '時段資訊',
      value: `${slot.area} - ${slot.location} (${slot.date} ${slot.time})`,
      disabled: true
    },
    {
      type: 'text',
      id: 'volunteerName',
      label: '志工姓名',
      required: true
    },
    {
      type: 'text',
      id: 'volunteerContact',
      label: '聯絡方式',
      required: true
    },
    {
      type: 'textarea',
      id: 'volunteerNotes',
      label: '備註',
      rows: 2
    },
    {
      type: 'checkbox',
      id: 'volunteerLineNotify',
      label: '接收 LINE 通知'
    },
    {
      type: 'checkbox',
      id: 'volunteerCalendarInvite',
      label: '加入行事曆'
    },
    { type: 'alert', id: 'addVolunteerResult' }
  ];
  
  // 創建表單對話框
  window.uiModule.createFormDialog(
    'addVolunteerModal',
    '新增志工',
    formFields,
    submitAddVolunteer,
    {
      submitText: '新增志工',
      submitType: 'primary',
      keepOpen: true
    }
  );
}

/**
 * 提交新增志工
 * @param {Object} formData - 表單資料
 * @returns {boolean} - 是否成功
 */
async function submitAddVolunteer(formData) {
  const slotId = formData.addVolunteerSlotId;
  const name = formData.volunteerName;
  const contact = formData.volunteerContact;
  const notes = formData.volunteerNotes;
  const lineNotify = formData.volunteerLineNotify;
  const calendarInvite = formData.volunteerCalendarInvite;
  
  if (!name || !contact) {
    window.utilsModule.showMessage(
      document.getElementById('addVolunteerResult'),
      'danger',
      '請填寫姓名和聯絡方式'
    );
    return false;
  }
  
  // 顯示載入中訊息
  window.utilsModule.showMessage(
    document.getElementById('addVolunteerResult'),
    'info',
    '<i class="bi bi-hourglass-split"></i> 正在新增志工...'
  );
  
  try {
    // 獲取時段資訊
    const slot = scheduleData.find(s => s.id === slotId);
    
    // 實際系統中應該調用 API 新增志工
    // const response = await window.apiModule.adminRegisterVolunteer({
    //   name: name,
    //   contact: contact,
    //   area: slot.area,
    //   date: slot.date,
    //   timeSlot: slotId,
    //   notes: notes,
    //   lineNotify: lineNotify,
    //   needCalendarInvite: calendarInvite
    // });
    
    // 目前模擬 API 調用
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newVolunteerId = 'REG-' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    const response = { success: true, registrationId: newVolunteerId };
    
    if (response.success) {
      // 如果存在志工模組，更新志工資料
      if (window.volunteersModule && Array.isArray(window.volunteersData)) {
        window.volunteersData.push({
          id: response.registrationId,
          name: name,
          contact: contact,
          area: slot.area,
          date: slot.date,
          timeSlot: slotId,
          location: slot.location,
          status: '已報名'
        });
      }
      
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
      
      // 顯示成功訊息
      window.utilsModule.showMessage(
        document.getElementById('addVolunteerResult'),
        'success',
        `<i class="bi bi-check-circle"></i> 已成功新增志工 (ID: ${response.registrationId})`
      );
      
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
      
      return true;
    } else {
      throw new Error(response.message || '新增失敗');
    }
  } catch (error) {
    console.error('新增志工時出錯:', error);
    window.utilsModule.showMessage(
      document.getElementById('addVolunteerResult'),
      'danger',
      `<i class="bi bi-exclamation-triangle"></i> 新增志工時發生錯誤: ${error.message}`
    );
  }
  
  return false;
}

/**
 * 編輯時段
 * @param {string} slotId - 時段 ID
 */
function editSlot(slotId) {
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
  
  // 創建表單
  const formFields = [
    { type: 'hidden', id: 'editSlotId', value: slotId },
    {
      type: 'select',
      id: 'editSlotArea',
      label: '區域',
      value: slot.area,
      required: true,
      options: [
        { value: '南中正', label: '南中正' },
        { value: '景美', label: '景美' },
        { value: '木柵', label: '木柵' }
      ]
    },
    {
      type: 'date',
      id: 'editSlotDate',
      label: '日期',
      value: slot.date,
      required: true
    },
    {
      type: 'time',
      id: 'editSlotStartTime',
      label: '開始時間',
      value: startTime,
      required: true
    },
    {
      type: 'time',
      id: 'editSlotEndTime',
      label: '結束時間',
      value: endTime,
      required: true
    },
    {
      type: 'select',
      id: 'editSlotLocation',
      label: '站點',
      value: slot.location,
      required: true,
      options: getLocationOptionsForArea(slot.area, slot.location)
    },
    {
      type: 'number',
      id: 'editSlotRequiredCount',
      label: '所需人數',
      value: slot.requiredCount,
      required: true,
      min: 1
    },
    {
      type: 'textarea',
      id: 'editSlotNotes',
      label: '備註',
      value: slot.notes || '',
      rows: 2
    },
    {
      type: 'checkbox',
      id: 'editSlotEnabled',
      label: '啟用此時段',
      checked: true
    },
    { type: 'alert', id: 'editSlotResult' }
  ];
  
  // 創建表單對話框
  window.uiModule.createFormDialog(
    'editSlotModal',
    '編輯時段',
    formFields,
    submitEditSlot,
    {
      submitText: '儲存變更',
      submitType: 'primary',
      keepOpen: true
    }
  );
  
  // 監聽區域變更以更新站點選項
  setTimeout(() => {
    const areaSelect = document.getElementById('editSlotArea');
    if (areaSelect) {
      areaSelect.addEventListener('change', function() {
        const locationSelect = document.getElementById('editSlotLocation');
        if (locationSelect) {
          const options = getLocationOptionsForArea(this.value);
          
          // 清空選項
          locationSelect.innerHTML = '';
          
          // 添加新選項
          options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.label;
            locationSelect.appendChild(optionElement);
          });
        }
      });
    }
  }, 100);
}

/**
 * 獲取指定區域的站點選項
 * @param {string} area - 區域
 * @param {string} [selectedLocation] - 已選擇的站點
 * @returns {Array} - 選項陣列
 */
function getLocationOptionsForArea(area, selectedLocation = null) {
  // 過濾該區域的站點
  const locations = locationData.filter(loc => loc.area === area);
  
  if (locations.length === 0) {
    return [{ value: selectedLocation || '', label: selectedLocation || '無可用站點' }];
  }
  
  return locations.map(loc => ({
    value: loc.name,
    label: loc.name
  }));
}

/**
 * 提交編輯時段
 * @param {Object} formData - 表單資料
 * @returns {boolean} - 是否成功
 */
async function submitEditSlot(formData) {
  const slotId = formData.editSlotId;
  const area = formData.editSlotArea;
  const date = formData.editSlotDate;
  const startTime = formData.editSlotStartTime;
  const endTime = formData.editSlotEndTime;
  const location = formData.editSlotLocation;
  const requiredCount = parseInt(formData.editSlotRequiredCount);
  const notes = formData.editSlotNotes;
  const enabled = formData.editSlotEnabled;
  
  if (!area || !date || !startTime || !endTime || !location || !requiredCount) {
    window.utilsModule.showMessage(
      document.getElementById('editSlotResult'),
      'danger',
      '請填寫所有必填欄位'
    );
    return false;
  }
  
  // 顯示載入中訊息
  window.utilsModule.showMessage(
    document.getElementById('editSlotResult'),
    'info',
    '<i class="bi bi-hourglass-split"></i> 正在更新時段...'
  );
  
  try {
    // 實際系統中應該調用 API 更新時段
    // const response = await window.apiModule.updateSchedule({
    //   slotId: slotId,
    //   area: area,
    //   date: date,
    //   startTime: startTime,
    //   endTime: endTime,
    //   location: location,
    //   requiredCount: requiredCount,
    //   notes: notes,
    //   enabled: enabled
    // });
    
    // 目前模擬 API 調用
    await new Promise(resolve => setTimeout(resolve, 1000));
    const response = { success: true };
    
    if (response.success) {
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
        scheduleData[slotIndex].notes = notes;
        
        // 根據目前人數和所需人數更新狀態
        if (currentCount >= requiredCount) {
          scheduleData[slotIndex].status = '充足';
        } else if (currentCount > 0) {
          scheduleData[slotIndex].status = '不足';
        }
        
        // 重新渲染班表
        renderSchedules();
        
        // 顯示成功訊息
        window.utilsModule.showMessage(
          document.getElementById('editSlotResult'),
          'success',
          '<i class="bi bi-check-circle"></i> 時段已更新'
        );
        
        // 延遲 1 秒後關閉 Modal
        setTimeout(() => {
          const modal = bootstrap.Modal.getInstance(document.getElementById('editSlotModal'));
          if (modal) {
            modal.hide();
          }
        }, 1000);
        
        return true;
      }
    } else {
      throw new Error(response.message || '更新失敗');
    }
  } catch (error) {
    console.error('更新時段時出錯:', error);
    window.utilsModule.showMessage(
      document.getElementById('editSlotResult'),
      'danger',
      `<i class="bi bi-exclamation-triangle"></i> 更新時段時發生錯誤: ${error.message}`
    );
  }
  
  return false;
}

/**
 * 確認刪除時段
 * @param {string} slotId - 時段 ID
 */
function confirmDeleteSlot(slotId) {
  // 查找時段資訊
  const slot = scheduleData.find(s => s.id === slotId);
  
  if (!slot) {
    alert('找不到指定的時段');
    return;
  }
  
  // 檢查是否有志工已報名（實際系統中應該從 API 獲取）
  const hasVolunteers = slot.currentCount > 0;
  
  // 創建確認對話框
  window.uiModule.createConfirmDialog(
    '確認刪除',
    `
      <p>您確定要刪除以下時段嗎？</p>
      <div class="alert alert-info">
        <p><strong>區域：</strong> ${slot.area}</p>
        <p><strong>站點：</strong> ${slot.location}</p>
        <p><strong>日期：</strong> ${slot.date}</p>
        <p><strong>時間：</strong> ${slot.time}</p>
      </div>
      ${hasVolunteers ? 
        '<div class="alert alert-warning"><i class="bi bi-exclamation-triangle"></i> 警告：已有志工報名此時段，刪除將會取消所有相關報名。</div>' : 
        ''}
    `,
    async function() {
      await deleteSlot(slotId);
    },
    '確認刪除',
    'danger'
  );
}

/**
 * 刪除時段
 * @param {string} slotId - 時段 ID
 * @returns {Promise<boolean>} - 是否成功
 */
async function deleteSlot(slotId) {
  try {
    // 實際系統中應該調用 API 刪除時段
    // const response = await window.apiModule.deleteSchedule(slotId);
    
    // 目前模擬 API 調用
    await new Promise(resolve => setTimeout(resolve, 1000));
    const response = { success: true };
    
    if (response.success) {
      // 從本地資料中移除時段
      scheduleData = scheduleData.filter(s => s.id !== slotId);
      
      // 重新渲染班表
      renderSchedules();
      
      // 如果存在儀表板模組，更新急需人力班表
      if (window.dashboardModule && typeof window.dashboardModule.updateUrgentSlots === 'function') {
        window.dashboardModule.updateUrgentSlots();
      }
      
      // 顯示成功訊息
      alert('時段已成功刪除');
      
      return true;
    } else {
      throw new Error(response.message || '刪除失敗');
    }
  } catch (error) {
    console.error('刪除時段時出錯:', error);
    alert(`刪除時段時發生錯誤: ${error.message}`);
    return false;
  }
}

/**
 * 打開發送通知 Modal
 * @param {string} slotId - 時段 ID
 */
function openSendNotificationModal(slotId) {
  // 查找時段資訊
  const slot = scheduleData.find(s => s.id === slotId);
  
  if (!slot) {
    alert('找不到指定的時段');
    return;
  }
  
  // 創建表單
  const formFields = [
    { type: 'hidden', id: 'notificationSlotId', value: slotId },
    { 
      type: 'text',
      id: 'slotInfo',
      label: '時段資訊',
      value: `${slot.area} - ${slot.location} (${slot.date} ${slot.time})`,
      disabled: true
    },
    {
      type: 'select',
      id: 'slotNotificationType',
      label: '通知類型',
      required: true,
      options: [
        { value: '', label: '選擇類型' },
        { value: '緊急需求', label: '緊急需求' },
        { value: '提醒通知', label: '提醒通知' },
        { value: '行程變更', label: '行程變更' },
        { value: '一般訊息', label: '一般訊息' }
      ]
    },
    {
      type: 'textarea',
      id: 'slotNotificationContent',
      label: '通知內容',
      required: true,
      rows: 3
    },
    { type: 'alert', id: 'slotNotificationResult' }
  ];
  
  // 創建表單對話框
  window.uiModule.createFormDialog(
    'sendNotificationModal',
    '發送通知',
    formFields,
    submitSlotNotification,
    {
      submitText: '發送通知',
      submitType: 'primary',
      keepOpen: true
    }
  );
}

/**
 * 提交時段通知
 * @param {Object} formData - 表單資料
 * @returns {boolean} - 是否成功
 */
async function submitSlotNotification(formData) {
  const slotId = formData.notificationSlotId;
  const type = formData.slotNotificationType;
  const content = formData.slotNotificationContent;
  
  if (!type || !content) {
    window.utilsModule.showMessage(
      document.getElementById('slotNotificationResult'),
      'danger',
      '請填寫所有必填欄位'
    );
    return false;
  }
  
  // 顯示載入中訊息
  window.utilsModule.showMessage(
    document.getElementById('slotNotificationResult'),
    'info',
    '<i class="bi bi-hourglass-split"></i> 正在發送通知...'
  );
  
  try {
    // 實際系統中應該調用 API 發送通知
    // const response = await window.apiModule.sendNotification({
    //   timeSlotId: slotId,
    //   type: type,
    //   content: content
    // });
    
    // 目前模擬 API 調用
    await new Promise(resolve => setTimeout(resolve, 1000));
    const response = { success: true };
    
    if (response.success) {
      // 顯示成功訊息
      window.utilsModule.showMessage(
        document.getElementById('slotNotificationResult'),
        'success',
        '<i class="bi bi-check-circle"></i> 通知已發送'
      );
      
      // 延遲 1 秒後關閉 Modal
      setTimeout(() => {
        const modal = bootstrap.Modal.getInstance(document.getElementById('sendNotificationModal'));
        if (modal) {
          modal.hide();
        }
      }, 1000);
      
      return true;
    } else {
      throw new Error(response.message || '發送失敗');
    }
  } catch (error) {
    console.error('發送通知時出錯:', error);
    window.utilsModule.showMessage(
      document.getElementById('slotNotificationResult'),
      'danger',
      `<i class="bi bi-exclamation-triangle"></i> 發送通知時發生錯誤: ${error.message}`
    );
  }
  
  return false;
}

/**
 * 新增時段
 * @returns {boolean} - 是否成功
 */
async function addNewSchedule() {
  // 獲取表單資料
  const area = document.getElementById('newScheduleArea').value;
  const date = document.getElementById('newScheduleDate').value;
  const startTime = document.getElementById('newScheduleStartTime').value;
  const endTime = document.getElementById('newScheduleEndTime').value;
  const location = document.getElementById('newScheduleLocation').value;
  const requiredCount = parseInt(document.getElementById('newScheduleRequiredCount').value);
  const notes = document.getElementById('newScheduleNotes').value;
  
  // 檢查必填欄位
  if (!area || !date || !startTime || !endTime || !location || !requiredCount) {
    window.utilsModule.showMessage(
      document.getElementById('newScheduleResult'),
      'danger',
      '請填寫所有必填欄位'
    );
    return false;
  }
  
  // 顯示載入中訊息
  window.utilsModule.showMessage(
    document.getElementById('newScheduleResult'),
    'info',
    '<i class="bi bi-hourglass-split"></i> 正在新增時段...'
  );
  
  try {
    // 實際系統中應該調用 API 新增時段
    // const response = await window.apiModule.addSchedule({
    //   area: area,
    //   date: date,
    //   startTime: startTime,
    //   endTime: endTime,
    //   location: location,
    //   requiredCount: requiredCount,
    //   notes: notes
    // });
    
    // 目前模擬 API 調用
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newSlotId = 'TS-' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    const response = { success: true, slotId: newSlotId };
    
    if (response.success) {
      // 添加到本地資料
      scheduleData.push({
        id: response.slotId,
        area: area,
        date: date,
        time: `${startTime} - ${endTime}`,
        location: location,
        requiredCount: requiredCount,
        currentCount: 0,
        status: '極度不足',
        notes: notes
      });
      
      // 重新渲染班表
      renderSchedules();
      
      // 如果存在儀表板模組，更新急需人力班表
      if (window.dashboardModule && typeof window.dashboardModule.updateUrgentSlots === 'function') {
        window.dashboardModule.updateUrgentSlots();
      }
      
      // 清空表單
      document.getElementById('newScheduleArea').value = '';
      document.getElementById('newScheduleLocation').value = '';
      document.getElementById('newScheduleRequiredCount').value = '';
      document.getElementById('newScheduleNotes').value = '';
      
      // 顯示成功訊息
      window.utilsModule.showMessage(
        document.getElementById('newScheduleResult'),
        'success',
        '<i class="bi bi-check-circle"></i> 時段已新增'
      );
      
      // 隱藏 Modal
      const modal = bootstrap.Modal.getInstance(document.getElementById('addScheduleModal'));
      if (modal) {
        modal.hide();
      }
      
      return true;
    } else {
      throw new Error(response.message || '新增失敗');
    }
  } catch (error) {
    console.error('新增時段時出錯:', error);
    window.utilsModule.showMessage(
      document.getElementById('newScheduleResult'),
      'danger',
      `<i class="bi bi-exclamation-triangle"></i> 新增時段時發生錯誤: ${error.message}`
    );
  }
  
  return false;
}

/**
 * 更新站點選項
 */
function updateLocationOptions() {
  // 獲取新增班表表單的區域選擇元素
  const areaSelect = document.getElementById('newScheduleArea');
  const locationSelect = document.getElementById('newScheduleLocation');
  
  if (!areaSelect || !locationSelect) return;
  
  // 監聽區域變更以更新站點選項
  areaSelect.addEventListener('change', function() {
    const selectedArea = this.value;
    
    // 清空選項
    locationSelect.innerHTML = '';
    
    if (!selectedArea) {
      // 如果沒有選擇區域，顯示提示並禁用選擇框
      locationSelect.innerHTML = '<option value="">請先選擇區域</option>';
      locationSelect.disabled = true;
      return;
    }
    
    // 添加選項
    const options = getLocationOptionsForArea(selectedArea);
    
    // 啟用選擇框
    locationSelect.disabled = false;
    
    // 添加提示選項
    locationSelect.innerHTML = '<option value="">選擇站點</option>';
    
    // 添加站點選項
    options.forEach(option => {
      const optionElement = document.createElement('option');
      optionElement.value = option.value;
      optionElement.textContent = option.label;
      locationSelect.appendChild(optionElement);
    });
  });
}

/**
 * 初始化模組
 */
function init() {
  // 註冊事件
  // 新增時段表單提交事件
  const addScheduleForm = document.getElementById('addScheduleForm');
  if (addScheduleForm) {
    addScheduleForm.addEventListener('submit', function(e) {
      e.preventDefault();
      addNewSchedule();
    });
  }
  
  // 註冊過濾按鈕事件
  const applyScheduleFilterBtn = document.getElementById('applyScheduleFilter');
  if (applyScheduleFilterBtn) {
    applyScheduleFilterBtn.addEventListener('click', filterSchedules);
  }
  
  // 更新站點選項
  updateLocationOptions();
}

/**
 * 加載班表管理模組
 */
function load() {
  fetchSchedules();
  fetchLocationsForSchedule();
  init();
}

/**
 * 獲取急需人力的班表
 * @returns {Array} - 急需人力的班表
 */
function getUrgentSlots() {
  return scheduleData.filter(slot => slot.status === '極度不足' || slot.status === '不足');
}

/**
 * 獲取特定日期的班表
 * @param {string} date - 日期 (YYYY-MM-DD)
 * @returns {Array} - 該日期的班表
 */
function getSlotsByDate(date) {
  return scheduleData.filter(slot => slot.date === date);
}

/**
 * 獲取所有班表
 * @returns {Array} - 所有班表
 */
function getAllSlots() {
  return scheduleData;
}

// 導出模塊
window.schedulesModule = {
  load,
  fetchSchedules,
  renderSchedules,
  viewSlotDetails,
  editSlot,
  addVolunteerToSlot,
  openSendNotificationModal,
  confirmDeleteSlot,
  addNewSchedule,
  getUrgentSlots,
  getSlotsByDate,
  getAllSlots
};
