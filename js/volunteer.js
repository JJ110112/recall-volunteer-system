// 頁面載入完成後執行
document.addEventListener('DOMContentLoaded', function() {
  // 解析 URL 參數
  const urlParams = new URLSearchParams(window.location.search);
  const areaParam = urlParams.get('area');
  const dateParam = urlParams.get('date');
  
  // 初始化
  init(areaParam, dateParam);
  
  // 事件監聽
  document.getElementById('area').addEventListener('change', updateTimeSlots);
  document.getElementById('date').addEventListener('change', updateTimeSlots);
  document.getElementById('volunteerForm').addEventListener('submit', submitForm);
});

// 初始化頁面
function init(area, date) {
  // 顯示載入中
  document.getElementById('loading').classList.remove('d-none');
  document.getElementById('volunteerForm').classList.add('d-none');
  
  // 設定區域
  if (area) {
    document.getElementById('areaAlert').classList.remove('d-none');
    document.getElementById('selectedArea').textContent = area;
    document.getElementById('areaSelectDiv').classList.add('d-none');
    document.getElementById('hiddenArea').value = area;
    
    // 在區域下拉選單中選擇對應的選項（如果選單可見）
    const areaSelect = document.getElementById('area');
    if (areaSelect) {
      for (let i = 0; i < areaSelect.options.length; i++) {
        if (areaSelect.options[i].value === area) {
          areaSelect.selectedIndex = i;
          break;
        }
      }
    }
  }
  
  // 初始化日期選項
  initDates(date);
  
  // 如果已指定區域和日期，自動載入時段
  if (area && date) {
    updateTimeSlots();
  } else {
    // 隱藏載入中，顯示表單
    document.getElementById('loading').classList.add('d-none');
    document.getElementById('volunteerForm').classList.remove('d-none');
  }
}

// 初始化日期選項
function initDates(selectedDate) {
  const dateSelect = document.getElementById('date');
  const today = new Date();
  
  // 清空現有選項
  dateSelect.innerHTML = '<option value="">請選擇日期</option>';
  
  // 添加未來14天的選項
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    const dateStr = date.toISOString().split('T')[0];
    const dateOption = document.createElement('option');
    dateOption.value = dateStr;
    
    const weekday = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()];
    dateOption.text = `${dateStr} (${weekday})`;
    
    dateSelect.appendChild(dateOption);
    
    // 如果有預設日期，選中它
    if (selectedDate && dateStr === selectedDate) {
      dateOption.selected = true;
    }
  }
}

// 更新時段選項
function updateTimeSlots() {
  const area = document.getElementById('hiddenArea').value || document.getElementById('area').value;
  const date = document.getElementById('date').value;
  
  if (!area || !date) {
    document.getElementById('timeSlotsContainer').innerHTML = 
      '<div class="alert alert-info">請先選擇區域和日期</div>';
    return;
  }
  
  // 顯示載入中
  document.getElementById('timeSlotsContainer').innerHTML = 
    '<div class="text-center py-4"><div class="spinner-border text-primary" role="status"></div><p class="mt-2">載入時段中...</p></div>';

  // 呼叫 API 獲取時段
  fetch(`${CONFIG.API_URL}?action=getAvailableSlots&area=${encodeURIComponent(area)}&date=${encodeURIComponent(date)}`)
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        renderTimeSlots(data.slots);
      } else {
        document.getElementById('timeSlotsContainer').innerHTML = 
          `<div class="alert alert-danger">載入失敗: ${data.message}</div>`;
      }
    })
    .catch(error => {
      document.getElementById('timeSlotsContainer').innerHTML = 
        `<div class="alert alert-danger">載入失敗: ${error.message}</div>`;
    });
  
  // 隱藏載入中，顯示表單
  document.getElementById('loading').classList.add('d-none');
  document.getElementById('volunteerForm').classList.remove('d-none');
}

// 渲染時段選項
function renderTimeSlots(slots) {
  const container = document.getElementById('timeSlotsContainer');
  
  if (!slots || slots.length === 0) {
    container.innerHTML = '<div class="alert alert-warning">目前沒有可用的時段，請選擇其他日期或區域。</div>';
    return;
  }
  
  let html = '';
  slots.forEach(function(slot) {
    const fullClass = slot.isFull ? 'full' : '';
    const urgentClass = slot.isUrgent ? 'urgent' : '';
    const badgeClass = slot.isFull ? 'danger' : (slot.isUrgent ? 'warning' : 'info');
    
    html += `
      <div class="time-slot ${fullClass} ${urgentClass}" data-value="${slot.id}" onclick="selectTimeSlot(this)">
        <div class="row">
          <div class="col-md-8">
            <strong>${slot.time}</strong><br>
            ${slot.location}
          </div>
          <div class="col-md-4 text-end">
            <span class="badge bg-${badgeClass}">
              ${slot.currentCount}/${slot.requiredCount} 人
            </span>
          </div>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

// 選擇時段
function selectTimeSlot(element) {
  if (element.classList.contains('full')) {
    alert('此時段已經額滿，請選擇其他時段');
    return;
  }
  
  // 移除其他選中狀態
  document.querySelectorAll('.time-slot').forEach(function(el) {
    el.classList.remove('selected');
  });
  
  // 選中當前時段
  element.classList.add('selected');
  document.getElementById('selectedTimeSlot').value = element.dataset.value;
}

// 提交表單
function submitForm(e) {
  e.preventDefault();
  
  // 檢查是否選擇了時段
  if (!document.getElementById('selectedTimeSlot').value) {
    alert('請選擇一個時段');
    return;
  }
  
  // 禁用提交按鈕
  const submitBtn = this.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> 提交中...';
  
  // 收集表單資料
  const formData = {
    name: document.getElementById('name').value,
    contact: document.getElementById('contact').value,
    area: document.getElementById('hiddenArea').value || document.getElementById('area').value,
    date: document.getElementById('date').value,
    timeSlot: document.getElementById('selectedTimeSlot').value,
    needCalendarInvite: document.getElementById('needCalendarInvite').checked,
    lineNotify: document.getElementById('lineNotify').checked,
    notes: document.getElementById('notes').value,
    email: document.getElementById('contact').value.includes('@') ? document.getElementById('contact').value : ''
  };
  
  // 提交到 API
  fetch(CONFIG.API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData)
  })
  .then(response => response.json())
  .then(data => {
    // 還原提交按鈕
    submitBtn.disabled = false;
    submitBtn.innerHTML = '提交報名';
    
    // 顯示結果
    const resultContainer = document.getElementById('resultContainer');
    resultContainer.classList.remove('d-none');
    
    if (data.success) {
      resultContainer.innerHTML = `
        <div class="alert alert-success">
          <h4 class="alert-heading">報名成功！</h4>
          <p>${data.message}</p>
          ${data.calendarLink ? `
          <div class="mt-3">
            <a href="${data.calendarLink}" class="btn btn-outline-success btn-sm" target="_blank">
              <i class="bi bi-calendar-plus"></i> 加到 Google 日曆
            </a>
            ${data.icsFile ? `
            <a href="data:text/calendar;charset=utf8,${encodeURIComponent(data.icsFile)}" class="btn btn-outline-primary btn-sm ms-2" download="volunteer-schedule.ics">
              <i class="bi bi-download"></i> 下載 .ics 檔案
            </a>
            ` : ''}
          </div>
          ` : ''}
        </div>
      `;
      
      // 清空表單
      document.getElementById('volunteerForm').reset();
      document.querySelectorAll('.time-slot').forEach(function(el) {
        el.classList.remove('selected');
      });
      document.getElementById('selectedTimeSlot').value = '';
      
      // 更新時段顯示
      updateTimeSlots();
    } else {
      resultContainer.innerHTML = `
        <div class="alert alert-danger">
          <h4 class="alert-heading">報名失敗</h4>
          <p>${data.message}</p>
        </div>
      `;
    }
  })
  .catch(error => {
    // 還原提交按鈕
    submitBtn.disabled = false;
    submitBtn.innerHTML = '提交報名';
    
    // 顯示錯誤
    const resultContainer = document.getElementById('resultContainer');
    resultContainer.classList.remove('d-none');
    resultContainer.innerHTML = `
      <div class="alert alert-danger">
        <h4 class="alert-heading">系統錯誤</h4>
        <p>${error.message}</p>
      </div>
    `;
  });
}
