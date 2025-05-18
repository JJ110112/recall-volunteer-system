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

// 載入活動列表（目前為空，預留Google Sheet串接）
function renderActivityList() {
  const list = document.getElementById('activityList');
  const noMsg = document.getElementById('noActivitiesMsg');
  list.innerHTML = '';
  if (!activities.length) {
    noMsg.classList.remove('d-none');
    return;
  }
  noMsg.classList.add('d-none');
  activities.forEach((act, idx) => {
    // 日期格式處理
    let dateObj = (typeof act.date === 'string' && act.date.length > 10) ? new Date(act.date) : new Date(act.date + 'T00:00:00');
    let week = ['日','一','二','三','四','五','六'];
    let dateStr = `${dateObj.getMonth()+1}月${dateObj.getDate()}日（星期${week[dateObj.getDay()]}）`;
    let timeStr = `${act.startTime}~${act.endTime}`;
    const card = document.createElement('div');
    card.className = 'col-md-6 col-lg-4 mb-4';
    card.innerHTML = `
      <div class="card h-100 shadow">
        <div class="card-body">
          <h5 class="card-title">${act.location}</h5>
          <p class="mb-1"><i class="bi bi-geo-alt"></i> ${act.area}</p>
          <p class="mb-1"><i class="bi bi-calendar"></i> ${dateStr} ${timeStr}</p>
          <p class="mb-1"><i class="bi bi-people"></i> 所需人數：${act.required}</p>
          <p class="mb-1"><i class="bi bi-person"></i> 目前人數：${act.current}</p>
        </div>
        <div class="card-footer bg-white border-0 text-end">
          <button class="btn btn-primary btn-sm" data-activity-idx="${idx}">我要登記</button>
        </div>
      </div>
    `;
    list.appendChild(card);
  });
  // 綁定登記按鈕
  bindRegisterButtons();
}

// 報名表單 Modal 動態產生
function openRegisterModal(activityIdx, lineId) {
  const act = activities[activityIdx];
  // 移除舊的 Modal
  const oldModal = document.getElementById('registerModal');
  if (oldModal) oldModal.remove();
  // 建立 Modal HTML
  const modalHtml = `
    <div class="modal fade" id="registerModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">志工報名</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label for="registerName" class="form-label">志工姓名</label>
              <input type="text" class="form-control" id="registerName" required>
            </div>
            <div class="mb-3">
              <label for="registerContact" class="form-label">聯絡方式</label>
              <input type="text" class="form-control" id="registerContact" required>
            </div>
            <div class="mb-3">
              <label for="registerNotes" class="form-label">備註</label>
              <textarea class="form-control" id="registerNotes" rows="2"></textarea>
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
  document.getElementById('submitRegisterBtn').onclick = async function() {
    const name = document.getElementById('registerName').value.trim();
    const contact = document.getElementById('registerContact').value.trim();
    const notes = document.getElementById('registerNotes').value.trim();
    const resultDiv = document.getElementById('registerResult');
    if (!name || !contact) {
      resultDiv.className = 'alert alert-danger';
      resultDiv.textContent = '請填寫姓名和聯絡方式';
      resultDiv.classList.remove('d-none');
      return;
    }
    resultDiv.className = 'alert alert-info';
    resultDiv.textContent = '報名中...';
    resultDiv.classList.remove('d-none');
    // 呼叫 API
    const payload = {
      action: 'registerVolunteer',
      name: name,
      contact: contact,
      area: act.area,
      date: act.date,
      timeSlot: act.id,
      location: act.location,
      startTime: act.startTime,
      endTime: act.endTime,
      notes: notes,
      lineUserId: lineId,
      needCalendarInvite: false,
      lineNotify: true
    };
    try {
      const url = 'https://script.google.com/macros/s/AKfycbweFq6yYsv6YAbd7qiHSSsVIOjl88FiC6suYUWL3s8LsSIo45duVhDMX_lo9_erP9inWw/exec';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        resultDiv.className = 'alert alert-success';
        resultDiv.textContent = '報名成功！';
        setTimeout(() => { modal.hide(); }, 1500);
      } else {
        resultDiv.className = 'alert alert-danger';
        resultDiv.textContent = data.message || '報名失敗，請稍後再試。';
      }
    } catch (e) {
      resultDiv.className = 'alert alert-danger';
      resultDiv.textContent = '報名失敗，請稍後再試。';
    }
  };
}

// 修改登記按鈕邏輯
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

// 修改 openLineIdModal，填完 Line ID 後直接進入報名表單
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

async function fetchActivities() {
  const url = 'https://script.google.com/macros/s/AKfycbweFq6yYsv6YAbd7qiHSSsVIOjl88FiC6suYUWL3s8LsSIo45duVhDMX_lo9_erP9inWw/exec?action=getActivities';
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.success && Array.isArray(data.activities)) {
      activities = data.activities;
      renderActivityList();
    } else {
      showResult('目前無法取得活動資料', 'danger');
    }
  } catch (e) {
    showResult('載入活動失敗，請稍後再試。', 'danger');
  }
}

window.addEventListener('DOMContentLoaded', function() {
  fetchActivities();
}); 