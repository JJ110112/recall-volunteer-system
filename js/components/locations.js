/**
 * locations.js - 文山退葆志工班表系統站點管理模組
 * 
 * 處理所有站點相關功能
 */

// 站點資料
let locationData = [];

/**
 * 獲取站點資料
 * @returns {Promise<Array>} - 站點資料
 */
async function fetchLocations() {
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
        
        // 渲染站點列表
        renderLocations();
      }, 300);
    });
  } catch (error) {
    console.error('獲取站點資料時出錯:', error);
    window.utilsModule.showGlobalError('獲取站點資料時發生錯誤，請重新整理頁面或聯絡系統管理員');
    return [];
  }
}

/**
 * 渲染站點管理
 */
function renderLocations() {
  const locationsTableBody = document.getElementById('locationsTableBody');
  if (!locationsTableBody) return;
  
  let html = '';
  
  locationData.forEach(location => {
    html += `
      <tr data-location-id="${location.id}">
        <td>${location.name}</td>
        <td>${location.area}</td>
        <td>${location.address}</td>
        <td>${location.suggestedCount}</td>
        <td>
          <button class="btn btn-sm btn-primary edit-location-btn" data-location-id="${location.id}">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-danger delete-location-btn" data-location-id="${location.id}">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `;
  });
  
  locationsTableBody.innerHTML = html;
  
  // 註冊事件
  registerLocationEvents();
}

/**
 * 註冊站點事件
 */
function registerLocationEvents() {
  // 編輯站點按鈕
  document.querySelectorAll('.edit-location-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const locationId = this.getAttribute('data-location-id');
      openEditLocationModal(locationId);
    });
  });
  
  // 刪除站點按鈕
  document.querySelectorAll('.delete-location-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const locationId = this.getAttribute('data-location-id');
      confirmDeleteLocation(locationId);
    });
  });
}

/**
 * 打開編輯站點 Modal
 * @param {string} locationId - 站點 ID
 */
function openEditLocationModal(locationId) {
  // 根據 locationId 獲取站點資訊
  const location = locationData.find(loc => loc.id === locationId);
  
  if (!location) {
    alert('找不到指定的站點');
    return;
  }
  
  // 創建表單
  const formFields = [
    { type: 'hidden', id: 'editLocationId', value: locationId },
    {
      type: 'text',
      id: 'editLocationName',
      label: '站點名稱',
      value: location.name,
      required: true
    },
    {
      type: 'select',
      id: 'editLocationArea',
      label: '區域',
      value: location.area,
      required: true,
      options: [
        { value: '南中正', label: '南中正' },
        { value: '景美', label: '景美' },
        { value: '木柵', label: '木柵' }
      ]
    },
    {
      type: 'text',
      id: 'editLocationAddress',
      label: '地址',
      value: location.address,
      required: true
    },
    {
      type: 'url',
      id: 'editLocationMapLink',
      label: '地圖連結',
      value: location.mapLink || ''
    },
    {
      type: 'number',
      id: 'editLocationSuggestedCount',
      label: '建議人數',
      value: location.suggestedCount,
      required: true,
      min: 1
    },
    {
      type: 'checkbox',
      id: 'editLocationEnabled',
      label: '啟用此站點',
      checked: true
    },
    { type: 'alert', id: 'editLocationResult' }
  ];
  
  // 創建表單對話框
  window.uiModule.createFormDialog(
    'editLocationModal',
    '編輯站點',
    formFields,
    submitEditLocation,
    {
      submitText: '儲存變更',
      submitType: 'primary',
      keepOpen: true
    }
  );
}

/**
 * 提交編輯站點
 * @param {Object} formData - 表單資料
 * @returns {boolean} - 是否成功
 */
async function submitEditLocation(formData) {
  const locationId = formData.editLocationId;
  const name = formData.editLocationName;
  const area = formData.editLocationArea;
  const address = formData.editLocationAddress;
  const mapLink = formData.editLocationMapLink;
  const suggestedCount = parseInt(formData.editLocationSuggestedCount);
  const enabled = formData.editLocationEnabled;
  
  if (!name || !area || !address || !suggestedCount) {
    window.utilsModule.showMessage(
      document.getElementById('editLocationResult'),
      'danger',
      '請填寫所有必填欄位'
    );
    return false;
  }
  
  // 顯示載入中訊息
  window.utilsModule.showMessage(
    document.getElementById('editLocationResult'),
    'info',
    '<i class="bi bi-hourglass-split"></i> 正在更新站點...'
  );
  
  try {
    // 實際系統中應該調用 API 更新站點
    // const response = await window.apiModule.updateLocation({
    //   locationId: locationId,
    //   name: name,
    //   area: area,
    //   address: address,
    //   mapLink: mapLink,
    //   suggestedCount: suggestedCount,
    //   enabled: enabled
    // });
    
    // 目前模擬 API 調用
    await new Promise(resolve => setTimeout(resolve, 1000));
    const response = { success: true };
    
    if (response.success) {
      // 更新本地資料
      const locationIndex = locationData.findIndex(loc => loc.id === locationId);
      if (locationIndex !== -1) {
        locationData[locationIndex].name = name;
        locationData[locationIndex].area = area;
        locationData[locationIndex].address = address;
        locationData[locationIndex].mapLink = mapLink;
        locationData[locationIndex].suggestedCount = suggestedCount;
        locationData[locationIndex].enabled = enabled;
        
        // 重新渲染站點列表
        renderLocations();
        
        // 顯示成功訊息
        window.utilsModule.showMessage(
          document.getElementById('editLocationResult'),
          'success',
          '<i class="bi bi-check-circle"></i> 站點已更新'
        );
        
        // 延遲 1 秒後關閉 Modal
        setTimeout(() => {
          const modal = bootstrap.Modal.getInstance(document.getElementById('editLocationModal'));
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
    console.error('更新站點時出錯:', error);
    window.utilsModule.showMessage(
      document.getElementById('editLocationResult'),
      'danger',
      `<i class="bi bi-exclamation-triangle"></i> 更新站點時發生錯誤: ${error.message}`
    );
  }
  
  return false;
}

/**
 * 確認刪除站點
 * @param {string} locationId - 站點 ID
 */
function confirmDeleteLocation(locationId) {
  // 查找站點資訊
  const location = locationData.find(loc => loc.id === locationId);
  
  if (!location) {
    alert('找不到指定的站點');
    return;
  }
  
  // 檢查是否有時段使用此站點（實際系統中應該從 API 獲取）
  // 目前簡單檢查 scheduleData 中是否有使用此站點
  const hasSlots = window.schedulesModule ? 
    (Array.isArray(window.schedulesModule.getAllSlots()) ? 
      window.schedulesModule.getAllSlots().some(slot => slot.location === location.name) : 
      false) : 
    false;
  
  // 創建確認對話框
  window.uiModule.createConfirmDialog(
    '確認刪除',
    `
      <p>您確定要刪除以下站點嗎？</p>
      <div class="alert alert-info">
        <p><strong>站點名稱：</strong> ${location.name}</p>
        <p><strong>區域：</strong> ${location.area}</p>
        <p><strong>地址：</strong> ${location.address}</p>
      </div>
      ${hasSlots ? 
        '<div class="alert alert-warning"><i class="bi bi-exclamation-triangle"></i> 警告：已有時段使用此站點，刪除將會影響這些時段。</div>' : 
        ''}
    `,
    async function() {
      await deleteLocation(locationId);
    },
    '確認刪除',
    'danger'
  );
}

/**
 * 刪除站點
 * @param {string} locationId - 站點 ID
 * @returns {Promise<boolean>} - 是否成功
 */
async function deleteLocation(locationId) {
  try {
    // 實際系統中應該調用 API 刪除站點
    // const response = await window.apiModule.deleteLocation(locationId);
    
    // 目前模擬 API 調用
    await new Promise(resolve => setTimeout(resolve, 1000));
    const response = { success: true };
    
    if (response.success) {
      // 從本地資料中移除站點
      locationData = locationData.filter(loc => loc.id !== locationId);
      
      // 重新渲染站點列表
      renderLocations();
      
      // 顯示成功訊息
      alert('站點已成功刪除');
      
      return true;
    } else {
      throw new Error(response.message || '刪除失敗');
    }
  } catch (error) {
    console.error('刪除站點時出錯:', error);
    alert(`刪除站點時發生錯誤: ${error.message}`);
    return false;
  }
}

/**
 * 新增站點
 * @returns {boolean} - 是否成功
 */
async function addNewLocation() {
  // 獲取表單資料
  const name = document.getElementById('newLocationName').value.trim();
  const area = document.getElementById('newLocationArea').value;
  const address = document.getElementById('newLocationAddress').value.trim();
  const mapLink = document.getElementById('newLocationMapLink').value.trim();
  const suggestedCount = parseInt(document.getElementById('newLocationSuggestedCount').value);
  
  // 檢查必填欄位
  if (!name || !area || !address || !suggestedCount) {
    window.utilsModule.showMessage(
      document.getElementById('newLocationResult'),
      'danger',
      '請填寫所有必填欄位'
    );
    return false;
  }
  
  // 顯示載入中訊息
  window.utilsModule.showMessage(
    document.getElementById('newLocationResult'),
    'info',
    '<i class="bi bi-hourglass-split"></i> 正在新增站點...'
  );
  
  try {
    // 實際系統中應該調用 API 新增站點
    // const response = await window.apiModule.addLocation({
    //   name: name,
    //   area: area,
    //   address: address,
    //   mapLink: mapLink,
    //   suggestedCount: suggestedCount
    // });
    
    // 目前模擬 API 調用
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newLocationId = 'LOC-' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    const response = { success: true, locationId: newLocationId };
    
    if (response.success) {
      // 添加到本地資料
      locationData.push({
        id: response.locationId,
        name: name,
        area: area,
        address: address,
        mapLink: mapLink,
        suggestedCount: suggestedCount,
        enabled: true
      });
      
      // 重新渲染站點列表
      renderLocations();
      
      // 清空表單
      document.getElementById('newLocationName').value = '';
      document.getElementById('newLocationAddress').value = '';
      document.getElementById('newLocationMapLink').value = '';
      document.getElementById('newLocationSuggestedCount').value = '2';
      
      // 顯示成功訊息
      window.utilsModule.showMessage(
        document.getElementById('newLocationResult'),
        'success',
        '<i class="bi bi-check-circle"></i> 站點已新增'
      );
      
      // 隱藏 Modal
      const modal = bootstrap.Modal.getInstance(document.getElementById('addLocationModal'));
      if (modal) {
        modal.hide();
      }
      
      return true;
    } else {
      throw new Error(response.message || '新增失敗');
    }
  } catch (error) {
    console.error('新增站點時出錯:', error);
    window.utilsModule.showMessage(
      document.getElementById('newLocationResult'),
      'danger',
      `<i class="bi bi-exclamation-triangle"></i> 新增站點時發生錯誤: ${error.message}`
    );
  }
  
  return false;
}

/**
 * 初始化模組
 */
function init() {
  // 註冊事件
  // 新增站點表單提交事件
  const addLocationForm = document.getElementById('addLocationForm');
  if (addLocationForm) {
    addLocationForm.addEventListener('submit', function(e) {
      e.preventDefault();
      addNewLocation();
    });
  }
}

/**
 * 加載站點管理模組
 */
function load() {
  fetchLocations();
  init();
}

/**
 * 獲取特定區域的站點
 * @param {string} area - 區域
 * @returns {Array} - 該區域的站點
 */
function getLocationsByArea(area) {
  return locationData.filter(loc => loc.area === area);
}

/**
 * 獲取所有站點
 * @returns {Array} - 所有站點
 */
function getAllLocations() {
  return locationData;
}

/**
 * 獲取站點建議人數
 * @param {string} locationName - 站點名稱
 * @returns {number} - 建議人數
 */
function getSuggestedCount(locationName) {
  const location = locationData.find(loc => loc.name === locationName);
  return location ? location.suggestedCount : 2;
}

// 導出模塊
window.locationsModule = {
  load,
  fetchLocations,
  renderLocations,
  openEditLocationModal,
  confirmDeleteLocation,
  addNewLocation,
  getLocationsByArea,
  getAllLocations,
  getSuggestedCount
};
