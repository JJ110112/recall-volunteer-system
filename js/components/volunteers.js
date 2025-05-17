/**
 * volunteers.js - 罷免志工班表系統志工管理模組
 * 
 * 處理所有志工相關功能
 */

// 志工資料
let volunteerData = [];

/**
 * 加載志工資料
 * @returns {Promise<Array>} - 志工資料
 */
async function fetchVolunteers() {
  try {
    // 在實際系統中，這應該調用 API 獲取志工資料
    // 目前使用模擬資料
    return new Promise((resolve) => {
      setTimeout(() => {
        volunteerData = [
          { id: 'REG-123456', name: '張志工', area: '南中正', date: '2025-05-20', timeSlot: 'TS-001', location: '捷運古亭站', status: '已報名', contact: '0912-345-678' },
          { id: 'REG-123457', name: '王助人', area: '南中正', date: '2025-05-20', timeSlot: 'TS-002', location: '捷運東門站', status: '已出席', contact: '0923-456-789' },
          { id: 'REG-123458', name: '李參與', area: '景美', date: '2025-05-21', timeSlot: 'TS-003', location: '景美火車站', status: '未簽到', contact: '0934-567-890' }
        ];
        resolve(volunteerData);
        
        // 渲染志工列表
        renderVolunteers();
      }, 300);
    });
  } catch (error) {
    console.error('獲取志工資料時出錯:', error);
    window.utilsModule.showGlobalError('獲取志工資料時發生錯誤，請重新整理頁面或聯絡系統管理員');
    return [];
  }
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
      statusBadge = window.utilsModule.badge('已出席', 'success');
    } else if (volunteer.status === '未簽到') {
      statusBadge = window.utilsModule.badge('未簽到', 'warning');
    } else {
      statusBadge = window.utilsModule.badge('已報名', 'secondary');
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
  registerVolunteerEvents();
}

/**
 * 註冊志工列表事件
 */
function registerVolunteerEvents() {
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
  
  // 註冊過濾按鈕事件
  const applyVolunteerFilterBtn = document.getElementById('applyVolunteerFilter');
  if (applyVolunteerFilterBtn) {
    applyVolunteerFilterBtn.addEventListener('click', filterVolunteers);
  }
}

/**
 * 過濾志工資料
 * @param {Event} e - 事件
 */
function filterVolunteers(e) {
  if (e) e.preventDefault();
  
  const area = document.getElementById('filterVolunteerArea').value;
  const date = document.getElementById('filterVolunteerDate').value;
  const status = document.getElementById('filterVolunteerStatus').value;
  const search = document.getElementById('searchVolunteer').value.trim().toLowerCase();
  
  // 在實際系統中，應該調用 API 獲取過濾結果
  // 目前使用客戶端過濾
  const filteredData = volunteerData.filter(volunteer => {
    if (area && volunteer.area !== area) return false;
    if (date && volunteer.date !== date) return false;
    if (status && volunteer.status !== status) return false;
    if (search && 
        !volunteer.name.toLowerCase().includes(search) && 
        !volunteer.id.toLowerCase().includes(search)) {
      return false;
    }
    
    return true;
  });
  
  let html = '';
  
  if (filteredData.length === 0) {
    html = '<tr><td colspan="7" class="text-center">沒有符合條件的志工</td></tr>';
  } else {
    filteredData.forEach(volunteer => {
      let statusBadge = '';
      if (volunteer.status === '已出席') {
        statusBadge = window.utilsModule.badge('已出席', 'success');
      } else if (volunteer.status === '未簽到') {
        statusBadge = window.utilsModule.badge('未簽到', 'warning');
      } else {
        statusBadge = window.utilsModule.badge('已報名', 'secondary');
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
  }
  
  const volunteersTableBody = document.getElementById('volunteersTableBody');
  if (volunteersTableBody) {
    volunteersTableBody.innerHTML = html;
    registerVolunteerEvents();
  }
}

/**
 * 查看志工詳情
 * @param {string} volunteerId - 志工 ID
 */
function viewVolunteerDetails(volunteerId) {
  // 查找志工資料
  const volunteer = volunteerData.find(v => v.id === volunteerId);
  if (!volunteer) {
    alert('找不到指定的志工');
    return;
  }
  
  // 創建詳情 Modal
  window.uiModule.createModal(
    'volunteerDetailsModal',
    '志工詳情',
    `
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
              <p><strong>時段 ID：</strong> ${volunteer.timeSlot}</p>
              <p><strong>報名 ID：</strong> ${volunteer.id}</p>
              <p><strong>狀態：</strong> ${volunteer.status}</p>
            </div>
          </div>
        </div>
      </div>
    `,
    [
      { text: '關閉', type: 'secondary', onClick: 'close' },
      { 
        text: '更新出席狀態', 
        type: 'primary', 
        onClick: function() {
          // 關閉詳情 Modal
          bootstrap.Modal.getInstance(document.getElementById('volunteerDetailsModal')).hide();
          
          // 打開更新出席狀態 Modal
          setTimeout(() => {
            openUpdateAttendanceModal(volunteerId);
          }, 400);
        }
      },
      { 
        text: '發送通知', 
        type: 'info', 
        onClick: function() {
          // 關閉詳情 Modal
          bootstrap.Modal.getInstance(document.getElementById('volunteerDetailsModal')).hide();
          
          // 打開發送通知 Modal
          setTimeout(() => {
            openSendVolunteerNotificationModal(volunteerId);
          }, 400);
        }
      }
    ]
  );
}

/**
 * 打開更新出席狀態的 Modal
 * @param {string} volunteerId - 志工 ID
 */
function openUpdateAttendanceModal(volunteerId) {
  // 查找志工資料
  const volunteer = volunteerData.find(v => v.id === volunteerId);
  if (!volunteer) {
    alert('找不到指定的志工');
    return;
  }
  
  // 創建表單
  const formFields = [
    { type: 'hidden', id: 'attendanceVolunteerId', value: volunteerId },
    { 
      type: 'text',
      id: 'attendanceVolunteerName',
      label: '志工姓名',
      value: volunteer.name,
      disabled: true
    },
    {
      type: 'select',
      id: 'attendanceStatus',
      label: '出席狀態',
      value: volunteer.status,
      required: true,
      options: [
        { value: '', label: '選擇狀態' },
        { value: '已出席', label: '已出席' },
        { value: '遲到', label: '遲到' },
        { value: '未出席', label: '未出席' },
        { value: '請假', label: '請假' }
      ]
    },
    {
      type: 'textarea',
      id: 'attendanceNotes',
      label: '備註',
      value: '',
      rows: 3
    },
    { type: 'alert', id: 'attendanceResult' }
  ];
  
  // 創建表單對話框
  window.uiModule.createFormDialog(
    'updateAttendance',
    '更新出席狀態',
    formFields,
    submitAttendanceUpdate,
    {
      submitText: '更新狀態',
      submitType: 'primary',
      keepOpen: true
    }
  );
}

/**
 * 提交出席狀態更新
 * @param {Object} formData - 表單資料
 * @returns {boolean} - 是否成功
 */
async function submitAttendanceUpdate(formData) {
  const volunteerId = formData.attendanceVolunteerId;
  const status = formData.attendanceStatus;
  const notes = formData.attendanceNotes;
  
  if (!status) {
    window.utilsModule.showMessage(
      document.getElementById('attendanceResult'),
      'danger',
      '請選擇出席狀態'
    );
    return false;
  }
  
  // 顯示載入中訊息
  window.utilsModule.showMessage(
    document.getElementById('attendanceResult'),
    'info',
    '<i class="bi bi-hourglass-split"></i> 正在更新狀態...'
  );
  
  try {
    // 實際系統中應該調用 API 更新狀態
    // const response = await window.apiModule.updateAttendance(volunteerId, status, notes);
    
    // 目前模擬 API 調用
    await new Promise(resolve => setTimeout(resolve, 1000));
    const response = { success: true };
    
    if (response.success) {
      // 更新本地資料
      const volunteerIndex = volunteerData.findIndex(v => v.id === volunteerId);
      if (volunteerIndex !== -1) {
        volunteerData[volunteerIndex].status = status;
        
        // 重新渲染志工列表
        renderVolunteers();
        
        // 顯示成功訊息
        window.utilsModule.showMessage(
          document.getElementById('attendanceResult'),
          'success',
          '<i class="bi bi-check-circle"></i> 狀態已更新'
        );
        
        // 延遲 1 秒後關閉 Modal
        setTimeout(() => {
          const modal = bootstrap.Modal.getInstance(document.getElementById('updateAttendance'));
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
    console.error('更新出席狀態時出錯:', error);
    window.utilsModule.showMessage(
      document.getElementById('attendanceResult'),
      'danger',
      `<i class="bi bi-exclamation-triangle"></i> 更新狀態時發生錯誤: ${error.message}`
    );
  }
  
  return false;
}

/**
 * 打開發送志工通知 Modal
 * @param {string} volunteerId - 志工 ID
 */
function openSendVolunteerNotificationModal(volunteerId) {
  // 查找志工資料
  const volunteer = volunteerData.find(v => v.id === volunteerId);
  if (!volunteer) {
    alert('找不到指定的志工');
    return;
  }
  
  // 創建表單
  const formFields = [
    { type: 'hidden', id: 'notificationVolunteerId', value: volunteerId },
    { 
      type: 'text',
      id: 'notificationVolunteerName',
      label: '志工姓名',
      value: volunteer.name,
      disabled: true
    },
    {
      type: 'select',
      id: 'volunteerNotificationType',
      label: '通知類型',
      required: true,
      options: [
        { value: '', label: '選擇類型' },
        { value: '行程提醒', label: '行程提醒' },
        { value: '出席確認', label: '出席確認' },
        { value: '行程變更', label: '行程變更' },
        { value: '一般訊息', label: '一般訊息' }
      ]
    },
    {
      type: 'textarea',
      id: 'volunteerNotificationContent',
      label: '通知內容',
      required: true,
      rows: 3
    },
    { type: 'alert', id: 'volunteerNotificationResult' }
  ];
  
  // 創建表單對話框
  window.uiModule.createFormDialog(
    'sendVolunteerNotification',
    '發送志工通知',
    formFields,
    submitVolunteerNotification,
    {
      submitText: '發送通知',
      submitType: 'primary',
      keepOpen: true
    }
  );
}

/**
 * 提交志工通知
 * @param {Object} formData - 表單資料
 * @returns {boolean} - 是否成功
 */
async function submitVolunteerNotification(formData) {
  const volunteerId = formData.notificationVolunteerId;
  const type = formData.volunteerNotificationType;
  const content = formData.volunteerNotificationContent;
  
  if (!type || !content) {
    window.utilsModule.showMessage(
      document.getElementById('volunteerNotificationResult'),
      'danger',
      '請填寫所有必填欄位'
    );
    return false;
  }
  
  // 顯示載入中訊息
  window.utilsModule.showMessage(
    document.getElementById('volunteerNotificationResult'),
    'info',
    '<i class="bi bi-hourglass-split"></i> 正在發送通知...'
  );
  
  try {
    // 實際系統中應該調用 API 發送通知
    // const response = await window.apiModule.sendNotification({
    //   registrationId: volunteerId,
    //   type: type,
    //   content: content
    // });
    
    // 目前模擬 API 調用
    await new Promise(resolve => setTimeout(resolve, 1000));
    const response = { success: true };
    
    if (response.success) {
      // 顯示成功訊息
      window.utilsModule.showMessage(
        document.getElementById('volunteerNotificationResult'),
        'success',
        '<i class="bi bi-check-circle"></i> 通知已發送'
      );
      
      // 延遲 1 秒後關閉 Modal
      setTimeout(() => {
        const modal = bootstrap.Modal.getInstance(document.getElementById('sendVolunteerNotification'));
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
      document.getElementById('volunteerNotificationResult'),
      'danger',
      `<i class="bi bi-exclamation-triangle"></i> 發送通知時發生錯誤: ${error.message}`
    );
  }
  
  return false;
}

/**
 * 初始化模組
 */
function init() {
  // 註冊過濾按鈕事件
  const applyVolunteerFilterBtn = document.getElementById('applyVolunteerFilter');
  if (applyVolunteerFilterBtn) {
    applyVolunteerFilterBtn.addEventListener('click', filterVolunteers);
  }
  
  // 註冊搜尋輸入框的 Enter 鍵事件
  const searchVolunteer = document.getElementById('searchVolunteer');
  if (searchVolunteer) {
    searchVolunteer.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        filterVolunteers(e);
      }
    });
  }
}

/**
 * 加載志工管理模組
 */
function load() {
  fetchVolunteers();
  init();
}

// 導出模塊
window.volunteersModule = {
  load,
  fetchVolunteers,
  renderVolunteers,
  viewVolunteerDetails,
  openUpdateAttendanceModal,
  openSendVolunteerNotificationModal
};
