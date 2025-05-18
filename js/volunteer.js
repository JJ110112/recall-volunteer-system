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
    // act: {id, title, area, date, time, location, required, current}
    const card = document.createElement('div');
    card.className = 'col-md-6 col-lg-4 mb-4';
    card.innerHTML = `
      <div class="card h-100 shadow">
        <div class="card-body">
          <h5 class="card-title">${act.title}</h5>
          <p class="mb-1"><i class="bi bi-geo-alt"></i> ${act.area} - ${act.location}</p>
          <p class="mb-1"><i class="bi bi-calendar"></i> ${act.date} ${act.time}</p>
          <p class="mb-1"><i class="bi bi-people"></i> 需求：${act.current}/${act.required}</p>
        </div>
        <div class="card-footer bg-white border-0 text-end">
          <button class="btn btn-primary btn-sm" data-activity-idx="${idx}">我要登記</button>
        </div>
      </div>
    `;
    list.appendChild(card);
  });
  // 綁定登記按鈕
  document.querySelectorAll('[data-activity-idx]').forEach(btn => {
    btn.addEventListener('click', function() {
      const idx = this.getAttribute('data-activity-idx');
      openLineIdModal(idx);
    });
  });
}

// 彈出Line代號輸入Modal
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
    // 執行登記（目前僅顯示成功，預留串接Google Sheet）
    showResult('登記成功！您的Line代號已記錄，下次自動帶入。', 'success');
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('lineIdModal'));
    modal.hide();
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