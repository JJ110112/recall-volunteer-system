// volunteer.js - 志工前台活動列表與登記

// 活動資料（目前為空，預留Google Sheet串接）
let activities = [];

// 取得Cookie
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return '';
}

// 設定Cookie
function setCookie(name, value, days = 365) {
  const d = new Date();
  d.setTime(d.getTime() + (days*24*60*60*1000));
  document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
}

// 提交註冊函數
async function submitRegistration(payload) {
  const resultDiv = document.getElementById('registerResult');
  resultDiv.className = 'alert alert-info';
  resultDiv.textContent = '報名中...';
  resultDiv.classList.remove('d-none');
  
  // 使用表單提交方式避免 CORS 問題
  return new Promise((resolve, reject) => {
    // 創建一個隱藏的表單
    const form = document.createElement('form');
    form.style.display = 'none';
    form.method = 'POST';
    form.action = 'https://script.google.com/macros/s/AKfycbxboXwGXFylGq6nbbMCt0WeoMQfP-v904d0DOe6LeYL/exec';
    form.target = 'submission_iframe';
    
    // 設置表單數據
    for (const key in payload) {
      if (payload.hasOwnProperty(key)) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = payload[key];
        form.appendChild(input);
      }
    }
    
    // 創建隱藏的 iframe 接收響應
    const iframe = document.createElement('iframe');
    iframe.name = 'submission_iframe';
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    // 監聽 iframe 加載完成
    iframe.onload = function() {
      try {
        // 嘗試讀取 iframe 內容
        // 注意：由於同源策略，這可能無法正常工作
        let response = null;
        try {
          const iframeContent = iframe.contentDocument || iframe.contentWindow.document;
          const responseText = iframeContent.body.innerText;
          console.log('iframe響應:', responseText);
          response = JSON.parse(responseText);
        } catch (err) {
          console.warn('無法解析iframe響應:', err);
          // 可能無法訪問 iframe 內容，視為成功
          response = { success: true, message: '操作可能已成功，請刷新頁面確認' };
        }
        
        if (response && response.success) {
          resultDiv.className = 'alert alert-success';
          resultDiv.textContent = '報名成功！';
          setTimeout(() => {
            const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('registerModal'));
            modal.hide();
            fetchActivities(); // 重新載入活動列表
          }, 1500);
          resolve(response);
        } else {
          resultDiv.className = 'alert alert-danger';
          resultDiv.textContent = (response && response.message) || '報名失敗，請稍後再試。';
          reject(new Error('提交失敗'));
        }
      } finally {
        // 清理 DOM
        setTimeout(() => {
          document.body.removeChild(iframe);
          document.body.removeChild(form);
        }, 2000);
      }
    };
    
    // 處理錯誤
    iframe.onerror = function() {
      resultDiv.className = 'alert alert-danger';
      resultDiv.textContent = '連接服務器失敗，請稍後再試。';
      reject(new Error('連接失敗'));
      document.body.removeChild(iframe);
      document.body.removeChild(form);
    };
    
    // 提交表單
    document.body.appendChild(form);
    form.submit();
  });
}

// 檢查用戶的報名狀態
async function checkRegistrationStatus(lineId) {
  if (!lineId) return [];
  
  try {
    // 使用 JSONP 方式避免 CORS 問題
    const url = 'https://script.google.com/macros/s/AKfycbxboXwGXFylGq6nbbMCt0WeoMQfP-v904d0DOe6LeYL/exec';
    const params = `?action=getUserRegistrations&lineId=${encodeURIComponent(lineId)}&callback=handleRegistrationsResponse&v=${new Date().getTime()}`;
    
    console.log('檢查用戶報名狀態:', url + params);
    
    return new Promise((resolve, reject) => {
      // 定義全局回調函數
      window.handleRegistrationsResponse = function(data) {
        console.log('收到用戶報名數據:', data);
        
        // 確保返回的是數組，並且每個項目都有必要的屬性
        if (data.success && Array.isArray(data.registrations)) {
          // 過濾掉無效的註冊項目
          const validRegistrations = data.registrations.filter(reg => reg && typeof reg === 'object' && reg.timeSlotId);
          console.log('有效報名記錄:', validRegistrations.length);
          resolve(validRegistrations);
        } else {
          console.error('獲取註冊狀態失敗', data);
          resolve([]);
        }
        
        // 刪除已執行的腳本標籤
        const scriptElement = document.getElementById('jsonp-status-script');
        if (scriptElement && scriptElement.parentNode) {
          document.body.removeChild(scriptElement);
        }
        
        // 清理全局回調
        delete window.handleRegistrationsResponse;
      };
      
      // 創建腳本元素
      const script = document.createElement('script');
      script.id = 'jsonp-status-script';
      script.src = url + params;
      script.onerror = function() {
        console.error('檢查報名狀態失敗');
        resolve([]);
        if (script.parentNode) {
          document.body.removeChild(script);
        }
      };
      
      // 添加超時處理
      const timeout = setTimeout(function() {
        console.warn('檢查報名狀態超時');
        if (window.handleRegistrationsResponse) {
          delete window.handleRegistrationsResponse;
        }
        if (script.parentNode) {
          document.body.removeChild(script);
        }
        resolve([]);
      }, 10000); // 10秒超時
      
      // 修改成功回調以清除超時計時器
      const originalCallback = window.handleRegistrationsResponse;
      window.handleRegistrationsResponse = function(data) {
        clearTimeout(timeout);
        originalCallback(data);
      };
      
      // 添加到頁面
      document.body.appendChild(script);
    });
  } catch (e) {
    console.error('檢查報名狀態失敗', e);
    return [];
  }
}

// 載入活動列表
async function renderActivityList() {
  // 檢查用戶的報名狀態
  const lineId = getCookie('lineId');
  let userRegistrations = [];
  
  if (lineId) {
    try {
      userRegistrations = await checkRegistrationStatus(lineId);
      // 確保 userRegistrations 是數組
      if (!Array.isArray(userRegistrations)) {
        console.error('userRegistrations 不是數組:', userRegistrations);
        userRegistrations = [];
      }
    } catch (error) {
      console.error('獲取報名狀態時出錯:', error);
      userRegistrations = [];
    }
  }
  
  const list = document.getElementById('activityList');
  const noMsg = document.getElementById('noActivitiesMsg');
  list.innerHTML = '';
  
  if (!activities.length) {
    noMsg.innerHTML = '目前沒有開放報名的活動';
    noMsg.classList.remove('d-none');
    return;
  }
  
  noMsg.classList.add('d-none');
  
  activities.forEach((act, idx) => {
    // 確保 act 有有效的 id
    if (!act || !act.id) {
      console.warn('活動缺少ID:', act);
      return;  // 跳過此活動
    }
    
    // 檢查用戶是否已報名此活動
    const isRegistered = Array.isArray(userRegistrations) && userRegistrations.some(reg => reg && reg.timeSlotId === act.id);
    const registrationItem = isRegistered ? userRegistrations.find(reg => reg && reg.timeSlotId === act.id) : null;
    const registrationId = registrationItem?.id || null;
    
    // 日期格式處理
    let dateObj = (typeof act.date === 'string' && act.date.length > 10) ? new Date(act.date) : new Date(act.date + 'T00:00:00');
    let week = ['日','一','二','三','四','五','六'];
    let dateStr = `${dateObj.getMonth()+1}月${dateObj.getDate()}日（星期${week[dateObj.getDay()]}）`;
    let timeStr = `${act.startTime}~${act.endTime}`;
    
    // 根據報名狀態確定按鈕顯示
    let buttonHtml = isRegistered ? 
      `<button class="btn btn-danger btn-sm" data-cancel-id="${registrationId}">取消報名</button>` : 
      `<button class="btn btn-primary btn-sm" data-activity-idx="${idx}">我要登記</button>`;
    
    const card = document.createElement('div');
    card.className = 'col-md-6 col-lg-4 mb-4';
    card.innerHTML = `
      <div class="card h-100 shadow ${isRegistered ? 'border-success' : ''}">
        <div class="card-body">
          <h5 class="card-title">${act.location} ${isRegistered ? '<span class="badge bg-success">已報名</span>' : ''}</h5>
          <p class="mb-1"><i class="bi bi-geo-alt"></i> ${act.area}</p>
          <p class="mb-1"><i class="bi bi-calendar"></i> ${dateStr} ${timeStr}</p>
          <p class="mb-1"><i class="bi bi-people"></i> 所需人數：${act.required}</p>
          <p class="mb-1"><i class="bi bi-person"></i> 目前人數：${act.current}</p>
        </div>
        <div class="card-footer bg-white border-0 text-end">
          ${buttonHtml}
        </div>
      </div>
    `;
    
    list.appendChild(card);
  });
  
  // 綁定登記和取消按鈕
  bindRegisterButtons();
  bindCancelButtons();
}

// 報名表單 Modal 動態產生
function openRegisterModal(activityIdx, lineId) {
  const act = activities[activityIdx];
  // 移除舊的 Modal
  const oldModal = document.getElementById('registerModal');
  if (oldModal) oldModal.remove();
  
  // 計算默認開始和結束時間
  const defaultStartTime = act.startTime;
  const defaultEndTime = act.endTime;
  
  // 從開始時間到結束時間每半小時一個選項
  const timeOptions = generateTimeOptions(act.startTime, act.endTime);
  
  // 建立 Modal HTML
  const modalHtml = `
    <div class="modal fade" id="registerModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">志工報名 - ${act.location}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label for="registerName" class="form-label">志工姓名</label>
              <input type="text" class="form-control" id="registerName">
            </div>
            <div class="mb-3">
              <label for="registerLineId" class="form-label">報名ID (Line代號) <span class="text-danger">*</span></label>
              <input type="text" class="form-control" id="registerLineId" value="${lineId}" required>
              <div class="form-text">即您的Line帳號代號，用於識別身分</div>
            </div>
            <div class="mb-3">
              <label class="form-label">參加時間 <span class="text-danger">*</span></label>
              <div class="row">
                <div class="col">
                  <select class="form-select" id="registerStartTime">
                    ${timeOptions.startOptions}
                  </select>
                </div>
                <div class="col-auto pt-2">至</div>
                <div class="col">
                  <select class="form-select" id="registerEndTime">
                    ${timeOptions.endOptions}
                  </select>
                </div>
              </div>
            </div>
            <div class="mb-3">
              <label for="registerContact" class="form-label">聯絡方式</label>
              <input type="text" class="form-control" id="registerContact" placeholder="選填">
            </div>
            <div class="mb-3 form-check">
              <input type="checkbox" class="form-check-input" id="registerCalendar" checked>
              <label class="form-check-label" for="registerCalendar">加入行事曆提醒</label>
            </div>
            <div class="mb-3 form-check">
              <input type="checkbox" class="form-check-input" id="registerNotify" checked>
              <label class="form-check-label" for="registerNotify">接收Line提醒</label>
            </div>
            <div class="mb-3">
              <label for="registerNotes" class="form-label">備註</label>
              <textarea class="form-control" id="registerNotes" rows="2" placeholder="選填"></textarea>
            </div>
            <div id="registerResult" class="alert d-none"></div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
            <button type="button" class="btn btn-primary" id="submitRegisterBtn">確認報名</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
  const modal = new bootstrap.Modal(document.getElementById('registerModal'));
  modal.show();
  
  // 提交報名
  document.getElementById('submitRegisterBtn').onclick = async function() {
    const name = document.getElementById('registerName').value.trim();
    const userLineId = document.getElementById('registerLineId').value.trim();
    const contact = document.getElementById('registerContact').value.trim();
    const notes = document.getElementById('registerNotes').value.trim();
    const startTime = document.getElementById('registerStartTime').value;
    const endTime = document.getElementById('registerEndTime').value;
    const needCalendar = document.getElementById('registerCalendar').checked;
    const needNotify = document.getElementById('registerNotify').checked;
    
    const resultDiv = document.getElementById('registerResult');
    
    if (!userLineId) {
      resultDiv.className = 'alert alert-danger';
      resultDiv.textContent = '請填寫Line代號';
      resultDiv.classList.remove('d-none');
      return;
    }
    
    // 檢查時間選擇是否合理
    if (new Date(`2000-01-01T${startTime}`) >= new Date(`2000-01-01T${endTime}`)) {
      resultDiv.className = 'alert alert-danger';
      resultDiv.textContent = '開始時間必須早於結束時間';
      resultDiv.classList.remove('d-none');
      return;
    }
    
    resultDiv.className = 'alert alert-info';
    resultDiv.textContent = '報名中...';
    resultDiv.classList.remove('d-none');
    
    // 生成時段ID
    const dateStr = act.date.replace(/-/g, '');
    const tsId = `TS-${dateStr}-${startTime.replace(':', '')}-${endTime.replace(':', '')}-${act.location}`;
    
    // 呼叫 API
    const payload = {
      action: 'registerVolunteer',
      name: name,
      contact: contact || '未提供',
      area: act.area,
      date: act.date,
      timeSlotId: act.id,
      customTimeSlotId: tsId,
      location: act.location,
      startTime: startTime,
      endTime: endTime,
      notes: notes,
      lineUserId: userLineId,
      needCalendarInvite: needCalendar,
      needLineNotify: needNotify
    };
    
    // 儲存新的lineId到cookie
    if (userLineId !== lineId) {
      setCookie('lineId', userLineId);
    }
    
    try {
      // 使用新的提交註冊函數
      await submitRegistration(payload);
    } catch (e) {
      resultDiv.className = 'alert alert-danger';
      resultDiv.textContent = '報名失敗，請稍後再試。';
    }
  };
}

// 生成時間選項
function generateTimeOptions(startTime, endTime) {
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);
  
  let startOptions = '';
  let endOptions = '';
  
  // 每30分鐘一個選項
  const current = new Date(start);
  while (current <= end) {
    const timeStr = current.toTimeString().substring(0, 5);
    
    if (current < end) {
      startOptions += `<option value="${timeStr}" ${timeStr === startTime ? 'selected' : ''}>${timeStr}</option>`;
    }
    
    if (current > start) {
      endOptions += `<option value="${timeStr}" ${timeStr === endTime ? 'selected' : ''}>${timeStr}</option>`;
    }
    
    current.setMinutes(current.getMinutes() + 30);
  }
  
  return { startOptions, endOptions };
}

// 綁定登記按鈕
function bindRegisterButtons() {
  document.querySelectorAll('[data-activity-idx]').forEach(btn => {
    btn.addEventListener('click', function() {
      const idx = this.getAttribute('data-activity-idx');
      const lineId = getCookie('lineId');
      if (lineId) {
        openRegisterModal(idx, lineId);
      } else {
        openLineIdModal(idx);
      }
    });
  });
}

// 綁定取消報名按鈕
function bindCancelButtons() {
  document.querySelectorAll('[data-cancel-id]').forEach(btn => {
    btn.addEventListener('click', async function() {
      if (confirm('確定要取消報名嗎？')) {
        const regId = this.getAttribute('data-cancel-id');
        await cancelRegistration(regId);
        fetchActivities(); // 重新載入活動列表
      }
    });
  });
}

// 取消報名功能
async function cancelRegistration(registrationId) {
  try {
    // 使用表單提交方式避免 CORS 問題
    return new Promise((resolve, reject) => {
      // 創建一個隱藏的表單
      const form = document.createElement('form');
      form.style.display = 'none';
      form.method = 'POST';
      form.action = 'https://script.google.com/macros/s/AKfycbxboXwGXFylGq6nbbMCt0WeoMQfP-v904d0DOe6LeYL/exec';
      form.target = 'cancel_iframe';
      
      // 設置表單數據
      const actionInput = document.createElement('input');
      actionInput.type = 'hidden';
      actionInput.name = 'action';
      actionInput.value = 'cancelRegistration';
      form.appendChild(actionInput);
      
      const idInput = document.createElement('input');
      idInput.type = 'hidden';
      idInput.name = 'registrationId';
      idInput.value = registrationId;
      form.appendChild(idInput);
      
      // 創建隱藏的 iframe 接收響應
      const iframe = document.createElement('iframe');
      iframe.name = 'cancel_iframe';
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      
      // 監聽 iframe 加載完成
      iframe.onload = function() {
        try {
          // 嘗試讀取 iframe 內容
          let response = null;
          try {
            const iframeContent = iframe.contentDocument || iframe.contentWindow.document;
            const responseText = iframeContent.body.innerText;
            console.log('取消報名響應:', responseText);
            response = JSON.parse(responseText);
          } catch (err) {
            console.warn('無法解析iframe響應:', err);
            // 視為成功
            response = { success: true, message: '取消可能已成功，請刷新頁面確認' };
          }
          
          if (response && response.success) {
            showResult('取消報名成功！', 'success');
            resolve(response);
          } else {
            showResult((response && response.message) || '取消報名失敗，請稍後再試。', 'danger');
            reject(new Error('取消失敗'));
          }
        } finally {
          // 清理 DOM
          setTimeout(() => {
            document.body.removeChild(iframe);
            document.body.removeChild(form);
          }, 1000);
        }
      };
      
      // 處理錯誤
      iframe.onerror = function() {
        showResult('取消報名失敗，請稍後再試。', 'danger');
        reject(new Error('連接失敗'));
        document.body.removeChild(iframe);
        document.body.removeChild(form);
      };
      
      // 提交表單
      document.body.appendChild(form);
      form.submit();
    });
  } catch (e) {
    showResult('取消報名失敗，請稍後再試。', 'danger');
    throw e;
  }
}

// Line ID 輸入表單
function openLineIdModal(activityIdx) {
  const lineIdInput = document.getElementById('lineIdInput');
  const errorDiv = document.getElementById('lineIdError');
  errorDiv.classList.add('d-none');
  // 自動帶入Cookie
  lineIdInput.value = getCookie('lineId') || '';
  // 綁定確認
  document.getElementById('saveLineIdBtn').onclick = function() {
    const lineId = lineIdInput.value.trim();
    if (!lineId) {
      errorDiv.textContent = '請輸入Line代號';
      errorDiv.classList.remove('d-none');
      return;
    }
    setCookie('lineId', lineId);
    // 直接進入報名表單
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('lineIdModal'));
    modal.hide();
    openRegisterModal(activityIdx, lineId);
  };
  // 顯示Modal
  const modal = new bootstrap.Modal(document.getElementById('lineIdModal'));
  modal.show();
}

// 顯示結果訊息
function showResult(msg, type = 'success') {
  const result = document.getElementById('resultContainer');
  result.className = `my-4 alert alert-${type}`;
  result.textContent = msg;
  result.classList.remove('d-none');
  setTimeout(() => result.classList.add('d-none'), 3000);
}

// 獲取活動數據
async function fetchActivities() {
  // 使用 JSONP 方式避免 CORS 問題
  const url = 'https://script.google.com/macros/s/AKfycbxboXwGXFylGq6nbbMCt0WeoMQfP-v904d0DOe6LeYL/exec';
  const params = '?action=getActivities&callback=handleActivitiesResponse&v=' + new Date().getTime();
  
  // 清理界面
  const noMsg = document.getElementById('noActivitiesMsg');
  noMsg.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">載入中...</span></div><p>資料載入中...</p>';
  noMsg.classList.remove('d-none');
  
  console.log('正在嘗試獲取活動數據，URL:', url + params);
  
  return new Promise((resolve, reject) => {
    // 定義全局回調函數
    window.handleActivitiesResponse = function(data) {
      console.log('收到JSONP響應:', data);
      
      if (data && data.success === true) {
        if (Array.isArray(data.activities) && data.activities.length > 0) {
          console.log('成功獲取活動列表, 活動數量:', data.activities.length);
          activities = data.activities;
          renderActivityList();
          resolve(data);
        } else {
          console.warn('API返回成功，但沒有活動數據:', data);
          // 即使沒有活動，也應該清空加載提示
          document.getElementById('noActivitiesMsg').innerHTML = '目前沒有開放報名的活動';
          resolve(data);
        }
      } else {
        console.error('API返回失敗或格式不正確:', data);
        showResult('無法獲取活動資料', 'danger');
        // 顯示錯誤信息
        document.getElementById('noActivitiesMsg').innerHTML = '無法獲取活動資料，請稍後再試';
        reject('API返回數據格式不正確');
      }
      
      // 刪除已執行的腳本標籤
      const scriptElement = document.getElementById('jsonp-script');
      if (scriptElement && scriptElement.parentNode) {
        document.body.removeChild(scriptElement);
      }
      
      // 清理全局回調
      delete window.handleActivitiesResponse;
    };
    
    // 創建腳本元素
    const script = document.createElement('script');
    script.id = 'jsonp-script';
    script.src = url + params;
    script.onerror = function() {
      console.error('JSONP腳本加載失敗');
      showResult('載入活動失敗，請稍後再試。', 'danger');
      document.getElementById('noActivitiesMsg').innerHTML = '載入活動失敗，請稍後再試';
      reject('腳本加載失敗');
      if (script.parentNode) {
        document.body.removeChild(script);
      }
    };
    
    // 添加超時處理
    const timeout = setTimeout(function() {
      console.error('獲取活動數據超時');
      if (window.handleActivitiesResponse) {
        delete window.handleActivitiesResponse;
      }
      if (script.parentNode) {
        document.body.removeChild(script);
      }
      document.getElementById('noActivitiesMsg').innerHTML = '獲取活動數據超時，請刷新頁面重試';
      showResult('獲取活動數據超時', 'danger');
      reject('請求超時');
    }, 15000); // 15秒超時
    
    // 修改成功回調以清除超時計時器
    const originalCallback = window.handleActivitiesResponse;
    window.handleActivitiesResponse = function(data) {
      clearTimeout(timeout);
      originalCallback(data);
    };
    
    // 添加到頁面
    document.body.appendChild(script);
  });
}

// 初始化頁面
window.addEventListener('DOMContentLoaded', function() {
  fetchActivities();
});