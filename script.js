const state = {
  search: '',
  department: '',
  category: ''
};

const form = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const departmentSelect = document.getElementById('departmentSelect');
const categorySelect = document.getElementById('categorySelect');
const uploadForm = document.getElementById('uploadForm');
const uploadStatus = document.getElementById('uploadStatus');
const resultsBox = document.getElementById('results');
const totalCount = document.getElementById('totalCount');
const depSummary = document.getElementById('depSummary');

async function fetchDocuments() {
  const params = new URLSearchParams();

  if (state.search) params.append('search', state.search);
  if (state.department) params.append('department', state.department);
  if (state.category) params.append('category', state.category);

  const url = `/api/documents?${params.toString()}`;

  try {
    const res = await fetch(url);
    const json = await res.json();

    if (!json.success) {
      resultsBox.innerHTML = `<div class="empty-state">${json.message}</div>`;
      return;
    }

    renderDocuments(json.data || []);
    totalCount.textContent = json.count || 0;

    const deptLabel = state.department ? ` • Bộ phận: ${state.department}` : '';
    depSummary.textContent = `${json.count || 0} tài liệu${deptLabel}`;
  } catch (error) {
    resultsBox.innerHTML = `<div class="empty-state">Lỗi kết nối API: ${error.message}</div>`;
  }
}

function renderDocuments(items) {
  if (!items.length) {
    resultsBox.innerHTML = '<div class="empty-state">Không tìm thấy tài liệu phù hợp với điều kiện lọc.</div>';
    return;
  }

  resultsBox.innerHTML = items.map((item) => {
    const fileLink = item.file_url && item.file_url !== '#' ? item.file_url : '#';
    const name = (item.ten_tai_lieu || 'Tài liệu').replace(/['"]/g, '\\$&');

    return `
      <article class="doc-card">
        <div class="doc-top">
          <div>
            <span class="doc-code">${item.ma_tai_lieu || 'N/A'}</span>
            <h3>${item.ten_tai_lieu || 'Tài liệu không tên'}</h3>
          </div>
          <span class="tag">v${item.version || '1.0'}</span>
        </div>

        <div class="doc-meta">
          <span>📁 ${item.ten_bo_phan || 'Chưa cập nhật'}</span>
          <span>🏷️ ${item.danh_muc || 'Khác'}</span>
          <span>👤 ${item.nguoi_tao || 'Chưa cập nhật'}</span>
        </div>

        <p class="doc-description">${item.mo_ta || 'Không có mô tả chi tiết.'}</p>

        <div class="doc-actions">
          <a class="btn-primary link-btn" href="${fileLink}" target="_blank" rel="noopener">📥 Tải xuống</a>
          <button class="btn-secondary view-detail-btn" type="button" data-name="${name}">👁 Xem chi tiết</button>
        </div>
      </article>
    `;
  }).join('');

  document.querySelectorAll('.view-detail-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const name = button.getAttribute('data-name');
      alert(`Tài liệu: ${name}`);
    });
  });
}

form.addEventListener('submit', function (e) {
  e.preventDefault();
  state.search = searchInput.value.trim();
  state.department = departmentSelect.value;
  state.category = categorySelect.value;
  fetchDocuments();
});

document.getElementById('clearBtn').addEventListener('click', function () {
  state.search = '';
  state.department = '';
  state.category = '';
  searchInput.value = '';
  departmentSelect.value = '';
  categorySelect.value = '';
  fetchDocuments();
});

uploadForm.addEventListener('submit', async function (event) {
  event.preventDefault();

  const formData = new FormData(uploadForm);
  formData.append('action', 'upload');

  const submitButton = uploadForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = 'Đang tải lên...';
  uploadStatus.textContent = 'Đang xử lý file...';
  uploadStatus.className = 'status-box info';

  try {
    const response = await fetch('/api/documents/upload', {
      method: 'POST',
      body: formData
    });

    const json = await response.json();

    if (!json.success) {
      throw new Error(json.message || 'Tải lên thất bại.');
    }

    uploadStatus.textContent = json.message || 'Tải lên thành công.';
    uploadStatus.className = 'status-box success';
    uploadForm.reset();
    fetchDocuments();
  } catch (error) {
    uploadStatus.textContent = error.message || 'Có lỗi xảy ra khi tải lên.';
    uploadStatus.className = 'status-box error';
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = '📤 Tải lên';
  }
});

fetchDocuments();
