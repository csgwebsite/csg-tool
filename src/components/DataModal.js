import { addDataItem, updateDataItem, deleteDataItem, isAdmin, getCurrentUser } from '../data/store.js';
import { generateId, escapeHtml, initLucide, getModalOverlayStyle, getPublicUrl } from '../utils/helpers.js';
import { customAlert, customConfirm } from './CustomModal.js';

const CATS = { meeting: 'Biên bản họp', drive: 'Link Drive', tool: 'Công cụ', document: 'Tài liệu' };

const PRIVACY_OPTIONS = [
  { id: 'Cán bộ', label: 'Cán bộ' },
  { id: 'Thực tập sinh', label: 'Thực tập sinh' },
  { id: 'Cộng tác viên', label: 'Cộng tác viên' }
];

export function showDataModal(item = null) {
  return new Promise((resolve) => {
    import('../data/store.js').then(({ getMembers }) => {
      const members = getMembers();
      const root = document.getElementById('modal-root');
      const editingItem = !!item;
      let viewMode = !!item;
      const currentUser = getCurrentUser();
      const isOwner = item?.createdBy === currentUser?.id;
      const canEdit = isAdmin() || isOwner || !editingItem;
      const canDelete = editingItem && (isAdmin() || isOwner);
      const canEditPrivacy = isAdmin() || (!editingItem) || isOwner;

      const allowedViewers = item?.allowedViewers || [];

      const originalPath = window.location.pathname;
      const basePath = (originalPath.includes('/', 1) ? originalPath.split('/').slice(0, 2).join('/') : originalPath) || '/data';

      if (item) {
        window.history.replaceState(null, null, '/data/' + item.id);
      }

      const finalize = (res = true) => {
        window.history.replaceState(null, null, basePath);
        root.innerHTML = '';
        resolve(res);
      };

      const renderModal = () => {
        root.innerHTML = `
        <div class="modal-overlay" id="data-modal-overlay" style="${getModalOverlayStyle()}">
          <div class="modal-content" style="max-width:480px;">
            <div class="modal-header">
              <div style="display:flex;align-items:center;gap:8px;">
                <h2>${!editingItem ? 'Thêm tài liệu' : (viewMode ? 'Chi tiết tài liệu' : 'Chỉnh sửa tài liệu')}</h2>
                ${editingItem ? `<button class="btn-icon btn-ghost sm" id="copy-data-link" title="Copy Link"><i data-lucide="link" class="lucide-sm"></i></button>` : ''}
              </div>
              <button class="btn-icon btn-ghost" id="data-close"><i data-lucide="x"></i></button>
            </div>
            <div class="modal-body">
              ${viewMode ? `
              <div style="display:flex;flex-direction:column;gap:16px;">
                <div>
                  <div style="font-size:var(--fs-xs);color:var(--text-tertiary);margin-bottom:4px;">Tiêu đề</div>
                  <div style="font-size:var(--fs-md);font-weight:600;">${escapeHtml(item?.title || '')}</div>
                </div>
                <div>
                  <div style="font-size:var(--fs-xs);color:var(--text-tertiary);margin-bottom:4px;">Loại</div>
                  <div style="display:inline-block;padding:4px 10px;background:var(--bg-body);border-radius:var(--r-sm);font-size:var(--fs-xs);font-weight:500;">
                    ${CATS[item?.category] || 'Khác'}
                  </div>
                </div>
                ${item?.description ? `
                <div>
                  <div style="font-size:var(--fs-xs);color:var(--text-tertiary);margin-bottom:4px;">Mô tả</div>
                  <div style="font-size:var(--fs-xs);line-height:1.5;color:var(--text-secondary);white-space:pre-wrap;">${escapeHtml(item.description)}</div>
                </div>` : ''}
                ${item?.link ? `
                <div>
                  <div style="font-size:var(--fs-xs);color:var(--text-tertiary);margin-bottom:4px;">Link</div>
                  <a href="${escapeHtml(item.link)}" target="_blank" style="display:flex;align-items:center;gap:6px;font-size:var(--fs-xs);color:var(--primary);text-decoration:none;padding:10px 12px;background:var(--primary-bg);border-radius:var(--r-sm);border:1px solid var(--primary)20;">
                    <i data-lucide="external-link" class="lucide-sm"></i>
                    <span style="font-weight:500;word-break:break-all;">${escapeHtml(item.link)}</span>
                  </a>
                </div>` : ''}
                ${item?.allowedViewers && item.allowedViewers.length > 0 ? `
                <div>
                  <div style="font-size:var(--fs-xs);color:var(--text-tertiary);margin-bottom:4px;">Quyền xem</div>
                  <div style="font-size:var(--fs-xs);color:var(--text-secondary);">${escapeHtml(item.allowedViewers.join(', '))}</div>
                </div>` : ''}
              </div>
              ` : `
              <div class="form-group"><label>Tiêu đề *</label><input class="form-control" id="data-title" value="${escapeHtml(item?.title || '')}" placeholder="Tiêu đề..." /></div>
              <div class="form-group"><label>Mô tả</label><textarea class="form-control" id="data-desc" placeholder="Mô tả...">${escapeHtml(item?.description || '')}</textarea></div>
              <div class="form-row">
                <div class="form-group">
                  <label>Loại</label>
                  <select class="form-control" id="data-cat">
                    ${Object.entries(CATS).map(([k, v]) => `<option value="${k}" ${item?.category === k ? 'selected' : ''}>${v}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group"><label>Link *</label><input class="form-control" id="data-link" value="${escapeHtml(item?.link || '')}" placeholder="https://..." /></div>
              </div>
              
              ${canEditPrivacy ? `
              <div class="form-group">
                <label>Quyền xem (Bỏ trống = Mọi chức vụ đều xem được)</label>
                <div style="border:1px solid var(--border);border-radius:var(--r-sm);padding:12px;display:flex;flex-direction:column;gap:10px;background:var(--bg-app);">
                  ${PRIVACY_OPTIONS.map(opt => `
                    <label style="display:flex;align-items:center;gap:10px;font-size:var(--fs-xs);cursor:pointer;">
                      <input type="checkbox" class="data-viewer-cb" value="${opt.id}" ${allowedViewers.includes(opt.id) ? 'checked' : ''} />
                      <span style="font-weight:500;">${opt.label}</span>
                    </label>
                  `).join('')}
                </div>
              </div>
              ` : ''}
              `}
            </div>
            <div class="modal-footer" style="padding: 16px 24px; border-top: 1px solid var(--border-light); gap: 10px; display: flex; align-items: center; justify-content: space-between; background: var(--bg-card); border-radius: 0 0 var(--r-xl) var(--r-xl); min-height:72px;">
              <div style="display:flex; gap:8px; align-items:center;">
                ${(!viewMode && canDelete) ? `<button class="btn btn-danger" id="data-del" style="height:36px; padding: 0 16px; border-radius: var(--r-md); font-weight: 700; font-size: 11px; letter-spacing:0.02em; background:var(--danger-bg); color:var(--danger); border:none;"><i data-lucide="trash-2" style="width:14px; height:14px;"></i> XÓA</button>` : ''}
              </div>
              <div style="display:flex; gap:8px; align-items:center;">
                ${viewMode ? `
                  <button class="btn btn-outline" id="data-cancel" style="height:36px; padding: 0 24px; border-radius: var(--r-md); font-weight: 700; font-size: 11px; color:var(--text-primary); background:var(--bg-hover); border:1px solid var(--border-light); letter-spacing:0.02em;">ĐÓNG</button>
                  ${canEdit ? `<button class="btn btn-primary" id="data-edit-btn" style="height:36px; padding: 0 24px; border-radius: var(--r-md); font-weight: 700; font-size: 11px; box-shadow: 0 4px 12px var(--primary)40; letter-spacing:0.02em;"><i data-lucide="edit-2" class="lucide-sm"></i> CHỈNH SỬA</button>` : ''}
                ` : `
                  <button class="btn btn-outline" id="data-cancel-edit" style="height:36px; padding: 0 24px; border-radius: var(--r-md); font-weight: 700; font-size: 11px; color:var(--text-primary); background:var(--bg-hover); border:1px solid var(--border-light); letter-spacing:0.02em;">${!editingItem ? 'HỦY' : 'HỦY SỬA'}</button>
                  <button class="btn btn-primary" id="data-save" style="height:36px; padding: 0 24px; border-radius: var(--r-md); font-weight: 700; font-size: 11px; box-shadow: 0 4px 12px var(--primary)40; letter-spacing:0.02em;">${editingItem ? 'CẬP NHẬT' : 'THÊM'}</button>
                `}
              </div>
            </div>
          </div>
        </div>
        `;
        initLucide();

        root.querySelector('#data-close').addEventListener('click', () => finalize(false));
        const cancelBtn = root.querySelector('#data-cancel');
        if (cancelBtn) cancelBtn.addEventListener('click', () => finalize(false));
        const cancelEditBtn = root.querySelector('#data-cancel-edit');
        if (cancelEditBtn) {
          cancelEditBtn.addEventListener('click', () => {
            if (!editingItem) finalize(false);
            else {
              viewMode = true;
              renderModal();
            }
          });
        }

        root.querySelector('#data-modal-overlay').addEventListener('click', e => { if (e.target.id === 'data-modal-overlay') finalize(false); });

        root.querySelector('#data-del')?.addEventListener('click', async () => { if (await customConfirm('Xóa?', 'Xác nhận xóa', true)) { deleteDataItem(item.id); finalize(true); } });

        root.querySelector('#copy-data-link')?.addEventListener('click', () => {
          navigator.clipboard.writeText(getPublicUrl());
          const btn = root.querySelector('#copy-data-link');
          btn.innerHTML = '<i data-lucide="check" class="lucide-sm"></i>';
          initLucide();
          setTimeout(() => { btn.innerHTML = '<i data-lucide="link" class="lucide-sm"></i>'; initLucide(); }, 1500);
        });

        root.querySelector('#data-edit-btn')?.addEventListener('click', () => {
          viewMode = false;
          renderModal();
        });

        root.querySelector('#data-save')?.addEventListener('click', async (e) => {
          const btn = e.currentTarget;
          const title = root.querySelector('#data-title').value.trim();
          const link = root.querySelector('#data-link').value.trim();
          if (!title || !link) { await customAlert('Điền đầy đủ thông tin bắt buộc', 'Thiếu thông tin'); return; }
          btn.innerHTML = '<i data-lucide="loader-2" style="animation: spin 1s linear infinite; width:14px; height:14px;"></i> ĐANG XỬ LÝ';
          btn.style.pointerEvents = 'none';
          btn.style.opacity = '0.7';
          initLucide();
          await new Promise(r => setTimeout(r, 600));

          let newAllowedViewers = allowedViewers;
          if (canEditPrivacy) {
            newAllowedViewers = Array.from(root.querySelectorAll('.data-viewer-cb:checked')).map(cb => cb.value);
          }

          const desc = root.querySelector('#data-desc').value.trim();
          const cat = root.querySelector('#data-cat').value;

          const data = {
            title, description: desc,
            category: cat, link,
            allowedViewers: newAllowedViewers
          };

          if (editingItem) updateDataItem(item.id, data);
          else addDataItem({ id: generateId(), ...data, createdAt: new Date().toISOString().split('T')[0], createdBy: currentUser?.id });
          finalize(true);
        });
      };

      renderModal();
    });
  });
}
