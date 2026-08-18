import { addProject, updateProject, isAdmin, getTasks, getMembers, isMaster, uploadImage } from '../data/store.js';
import { generateId, escapeHtml, initLucide, renderProjectAvatar, renderAvatar, sortTasks, formatDate, getModalOverlayStyle, getPublicUrl } from '../utils/helpers.js';
import { customAlert, customConfirm } from './CustomModal.js';

const COLORS = ['#F97316', '#EF4444', '#8B5CF6', '#3B82F6', '#10B981', '#EC4899', '#F59E0B', '#6366F1', '#14B8A6', '#0EA5E9'];

function statusSelectHTML(id, selectedStatus) {
  const statuses = [
    { id: 'running', name: '⏳ Đang chạy' },
    { id: 'ended', name: '🔒 Đã kết thúc' }
  ];
  const sel = statuses.find(s => s.id === selectedStatus) || statuses[0];
  return `
    <div class="search-select" id="${id}-wrap">
      <input class="search-select-input" id="${id}" value="${escapeHtml(sel.name)}" data-value="${sel.id}" autocomplete="off" readonly style="cursor:pointer;" />
      <div class="search-select-dropdown" id="${id}-dd">
        ${statuses.map(s => `
          <div class="search-select-item ${s.id === sel.id ? 'selected' : ''}" data-value="${s.id}">
            <span>${escapeHtml(s.name)}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function bindSearchSelect(id) {
  const input = document.getElementById(id);
  const dd = document.getElementById(id + '-dd');
  if (!input || !dd) return;
  input.addEventListener('focus', () => { dd.classList.add('open'); input.select(); });
  input.addEventListener('input', () => {
    const q = input.value.toLowerCase();
    dd.querySelectorAll('.search-select-item').forEach(item => {
      item.style.display = item.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
    dd.classList.add('open');
  });
  dd.querySelectorAll('.search-select-item').forEach(item => {
    item.addEventListener('click', () => {
      input.value = item.textContent.trim();
      input.dataset.value = item.dataset.value;
      dd.classList.remove('open');
      dd.querySelectorAll('.search-select-item').forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
    });
  });
  document.addEventListener('click', (e) => { if (!e.target.closest('#' + id + '-wrap')) dd.classList.remove('open'); });
}

export function showProjectModal(project = null, isViewMode = false) {
  return new Promise((resolve) => {
    const root = document.getElementById('modal-root');
    const editing = !!project && !isViewMode;
    const localProj = project ? { ...project } : { name: '', code: '', description: '', milestones: [], links: [], status: 'running', color: COLORS[0] };
    const milestones = localProj.milestones;
    const links = localProj.links;
    let selColor = localProj.color;
    let pendingLogo = null; // base64 string for new logo

    const originalPath = window.location.pathname;
    const basePath = (originalPath.includes('/', 1) ? originalPath.split('/').slice(0, 2).join('/') : originalPath) || '/projects';

    const finalize = (res = true) => {
      window.history.replaceState(null, null, basePath);
      root.innerHTML = '';
      resolve(res);
    };

    function buildHtml() {
      const logoPreview = pendingLogo || localProj.logo || '';

      if (project) {
        window.history.replaceState(null, null, '/projects/' + (localProj.code || localProj.id));
      }

      if (isViewMode && project) {
        const allTasks = sortTasks(getTasks().filter(t => t.projectId === project.id));
        const members = getMembers();
        const completedTaskCount = allTasks.filter(t => t.status === 'complete').length;

        return `
          <div class="modal-overlay" id="proj-modal-overlay" style="${getModalOverlayStyle()}">
            <div class="modal-content" style="max-width:600px; max-height: 90vh; overflow-y:auto;">
              <div class="modal-header">
                <h2>Thông tin dự án</h2>
                <div style="display:flex;gap:8px;margin-left:auto;">
                  <button class="btn-icon btn-ghost sm" id="copy-proj-link-view" title="Copy Link"><i data-lucide="link" class="lucide-sm"></i></button>
                  ${isMaster() ? `<button class="btn-icon btn-ghost sm" id="proj-edit-from-view"><i data-lucide="edit-2" class="lucide-sm"></i></button>` : ''}
                  <button class="btn-icon btn-ghost sm" id="proj-close-view"><i data-lucide="x" class="lucide-sm"></i></button>
                </div>
              </div>
              <div class="modal-body">
                <div style="display:flex;gap:16px;align-items:flex-start;margin-bottom:20px;">
                  ${renderProjectAvatar(localProj, 'avatar-xl')}
                  <div style="flex:1;">
                    <h3 style="margin:0 0 4px 0;font-size:1.2rem;">${escapeHtml(localProj.name)}</h3>
                    <div style="color:var(--text-secondary);font-size:var(--fs-xs);line-height:1.5;">${escapeHtml(localProj.description || 'Không có mô tả')}</div>
                    <div style="margin-top:8px;font-size:var(--fs-2xs);font-weight:600;color:${localProj.color};">
                      ${completedTaskCount} / ${allTasks.length} task hoàn thành
                    </div>
                  </div>
                </div>

                ${milestones.length ? `
                <div style="margin-bottom:20px;">
                  <h4 style="font-size:var(--fs-xs);margin-bottom:8px;text-transform:uppercase;color:var(--text-tertiary);letter-spacing:0.5px;">Mốc thời gian</h4>
                  <div style="display:flex;flex-direction:column;gap:6px;">
                  ${milestones.map(m => `
                    <div style="display:flex;align-items:center;gap:8px;font-size:var(--fs-xs);padding:6px;background:var(--bg-body);border-radius:var(--r-sm);">
                      <span style="width:8px;height:8px;border-radius:50%;background:${localProj.color};"></span>
                      <span style="flex:1;font-weight:500;">${escapeHtml(m.title)}</span>
                      <span style="color:var(--text-tertiary);">${formatDate(m.date)}</span>
                    </div>
                  `).join('')}
                  </div>
                </div>` : ''}

                ${links.length ? `
                <div style="margin-bottom:20px;">
                  <h4 style="font-size:var(--fs-xs);margin-bottom:8px;text-transform:uppercase;color:var(--text-tertiary);letter-spacing:0.5px;">Liên kết</h4>
                  <div style="display:flex;flex-wrap:wrap;gap:8px;">
                    ${links.map(l => `<a href="${escapeHtml(l.url)}" target="_blank" class="tag-chip" style="text-decoration:none;color:var(--text-link);background:var(--bg-badge);"><i data-lucide="external-link" class="lucide-sm"></i>${escapeHtml(l.label)}</a>`).join('')}
                  </div>
                </div>` : ''}

                <div style="margin-top:20px;">
                  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
                    <div style="display:flex;align-items:center;cursor:pointer;user-select:none;" onclick="const c=document.getElementById('proj-tasks-list');const i=this.querySelector('.chevron-icon');if(c.style.display==='none'){c.style.display='flex';if(i)i.style.transform='rotate(90deg)';}else{c.style.display='none';if(i)i.style.transform='rotate(0deg)';}">
                      <i data-lucide="chevron-right" class="chevron-icon" style="width:16px;height:16px;color:var(--text-tertiary);transition:transform 0.2s;transform:rotate(0deg);"></i>
                      <div style="font-size:var(--fs-xs);font-weight:600;text-transform:uppercase;color:var(--text-tertiary);letter-spacing:0.5px;margin-left:6px;">Danh sách Task</div>
                    </div>
                  </div>
                  ${allTasks.length ? `
                    <div id="proj-tasks-list" style="display:none;flex-direction:column;gap:8px;">
                      ${allTasks.map(t => {
          const assignee = members.find(m => m.id === t.assigneeId);
          const isComplete = t.status === 'complete';
          return `
                        <div style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--bg-card);border:1px solid var(--border-light);border-radius:var(--r-md);opacity:${isComplete ? '0.6' : '1'};">
                          <div style="flex:1;min-width:0;">
                            <div style="font-size:var(--fs-xs);font-weight:600;text-decoration:none;color:${isComplete ? 'var(--text-tertiary)' : 'var(--text-primary)'};" class="truncate">${escapeHtml(t.title)}</div>
                            <div style="font-size:var(--fs-2xs);color:var(--text-tertiary);margin-top:4px;display:flex;gap:12px;">
                                <span><i data-lucide="clock" class="lucide-sm" style="vertical-align:-2px;margin-right:2px;"></i> ${t.deadline ? formatDate(t.deadline.split('T')[0]) : '—'}</span>
                                <span style="color:${t.status === 'pending_approval' ? 'var(--warning)' : (isComplete ? 'var(--success)' : 'var(--info)')}">${t.status === 'pending_approval' ? 'Chờ duyệt' : (isComplete ? 'Hoàn thành' : 'Đang làm')}</span>
                            </div>
                          </div>
                          ${assignee ? renderAvatar(assignee, 'avatar-xs', false) : ''}
                        </div>
                        `;
        }).join('')}
                    </div>
                  ` : '<div style="font-size:var(--fs-xs);color:var(--text-tertiary);padding:12px;text-align:center;background:var(--bg-body);border-radius:var(--r-sm);">Chưa có task nào trong dự án này.</div>'}
                </div>

              </div>
            </div>
          </div>`;
      }

      return `
      <div class="modal-overlay" id="proj-modal-overlay" style="${getModalOverlayStyle()}">
        <div class="modal-content" style="max-width:520px;">
          <div class="modal-header">
            <div style="display:flex;align-items:center;gap:8px;">
              <h2>${editing ? 'Chỉnh sửa dự án' : 'Tạo dự án'}</h2>
              ${editing ? `<button class="btn-icon btn-ghost sm" id="copy-proj-link-edit" title="Copy Link"><i data-lucide="link" class="lucide-sm"></i></button>` : ''}
            </div>
            <button class="btn-icon btn-ghost" id="proj-close"><i data-lucide="x"></i></button>
          </div>
          <div class="modal-body">
            <!-- Logo + Name row -->
            <div style="display:flex;gap:16px;align-items:flex-start;margin-bottom:16px;">
              <!-- Logo upload -->
              <div style="flex-shrink:0;">
                <label style="cursor:pointer;display:block;" title="Upload logo">
                  <div id="proj-logo-preview" style="width:56px;height:56px;border-radius:var(--r-md);background:${selColor};display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:800;color:white;overflow:hidden;${logoPreview ? `background-image:url(${logoPreview});background-size:cover;background-position:center;font-size:0;` : ''}">
                    ${logoPreview ? '' : `<span>${localProj.name?.[0] || '?'}</span>`}
                  </div>
                  <input type="file" id="proj-logo-upload" accept="image/*" style="display:none;" />
                </label>
                <div style="font-size:9px;color:var(--text-disabled);text-align:center;margin-top:3px;">Logo</div>
              </div>
              <div style="flex:1;min-width:0;">
                <div class="form-row">
                  <div class="form-group" style="margin-bottom:8px;">
                    <label>Tên dự án *</label>
                    <input class="form-control" id="proj-name" value="${escapeHtml(localProj.name || '')}" placeholder="Tên..." />
                  </div>
                  <div class="form-group" style="margin-bottom:8px;">
                    <label>Mã (3 chữ cái) *</label>
                    <input class="form-control" id="proj-code" value="${escapeHtml(localProj.code || '')}" placeholder="VD: FEH" maxlength="3" style="text-transform:uppercase;" />
                  </div>
                </div>
                <div class="form-group" style="margin-bottom:0;">
                  <label>Mô tả</label>
                  <input class="form-control" id="proj-desc" value="${escapeHtml(localProj.description || '')}" placeholder="Mô tả ngắn..." style="font-size:var(--fs-xs);" />
                </div>
              </div>
            </div>

            <!-- Color picker & Status -->
            <div class="form-row">
              <div class="form-group">
                <label>Màu nhận diện</label>
                <div class="color-picker" id="color-picker">
                  ${COLORS.map(c => `<div class="color-option ${selColor === c ? 'selected' : ''}" data-color="${c}" style="background:${c}"></div>`).join('')}
                </div>
              </div>
              <div class="form-group">
                <label>Trạng thái</label>
                ${statusSelectHTML('proj-status', localProj.status || 'running')}
              </div>
            </div>

            <!-- Milestones -->
            <div class="form-group">
              <label>Mốc thời gian</label>
              <div id="milestones-list" style="display:flex;flex-direction:column;gap:6px;">
                ${milestones.map((m, i) => `
                  <div style="display:flex;gap:6px;align-items:center;">
                    <input class="form-control ms-title" value="${escapeHtml(m.title)}" placeholder="Tên mốc" style="flex:1;font-size:var(--fs-xs);padding:6px 8px;" />
                    <input class="form-control ms-date" type="date" value="${m.date}" style="width:140px;font-size:var(--fs-xs);padding:6px 8px;" />
                    <button class="btn-icon btn-ghost sm ms-del" data-idx="${i}"><i data-lucide="x"></i></button>
                  </div>
                `).join('')}
              </div>
              <button class="btn btn-sm" id="add-ms" style="margin-top:6px;"><i data-lucide="plus"></i> Thêm mốc</button>
            </div>

            <!-- Links -->
            <div class="form-group">
              <label>Links</label>
              <div id="links-list" style="display:flex;flex-direction:column;gap:6px;">
                ${links.map((l, i) => `
                  <div style="display:flex;gap:6px;align-items:center;">
                    <input class="form-control lk-label" value="${escapeHtml(l.label)}" placeholder="Tên" style="width:120px;font-size:var(--fs-xs);padding:6px 8px;" />
                    <input class="form-control lk-url" value="${escapeHtml(l.url)}" placeholder="URL" style="flex:1;font-size:var(--fs-xs);padding:6px 8px;" />
                    <button class="btn-icon btn-ghost sm lk-del" data-idx="${i}"><i data-lucide="x"></i></button>
                  </div>
                `).join('')}
              </div>
              <button class="btn btn-sm" id="add-lk" style="margin-top:6px;"><i data-lucide="plus"></i> Thêm link</button>
            </div>
          </div>
          <div class="modal-footer" style="padding: 16px 24px; border-top: 1px solid var(--border-light); gap: 10px; display: flex; align-items: center; justify-content: space-between; background: var(--bg-card); border-radius: 0 0 var(--r-xl) var(--r-xl); min-height:72px;">
            <div style="display:flex; gap:8px; align-items:center;">
              ${isMaster() && project ? `<button class="btn btn-danger" id="proj-delete" style="height:36px; padding: 0 16px; border-radius: var(--r-md); font-weight: 700; font-size: 11px; letter-spacing:0.02em; background:var(--danger-bg); color:var(--danger); border:none;"><i data-lucide="trash-2" style="width:14px; height:14px;"></i> XÓA</button>` : ''}
            </div>
            <div style="display:flex; gap:8px; align-items:center;">
              <button class="btn btn-outline" id="proj-cancel" style="height:36px; padding: 0 24px; border-radius: var(--r-md); font-weight: 700; font-size: 11px; color:var(--text-primary); background:var(--bg-hover); border:1px solid var(--border-light); letter-spacing:0.02em;">HỦY</button>
              <button class="btn btn-primary" id="proj-save" style="height:36px; padding: 0 24px; border-radius: var(--r-md); font-weight: 700; font-size: 11px; box-shadow: 0 4px 12px var(--primary)40; letter-spacing:0.02em;">${editing ? 'CẬP NHẬT' : 'TẠO'}</button>
            </div>
          </div>
        </div>
      </div>`;
    }

    function mount() {
      root.innerHTML = buildHtml();
      initLucide();
      bindSearchSelect('proj-status');
      bindEvents();
    }

    function bindEvents() {
      const close = () => {
        window.history.replaceState(null, null, basePath);
        root.innerHTML = ''; resolve(false);
      };

      if (isViewMode && project) {
        root.querySelector('#proj-close-view')?.addEventListener('click', close);
        root.querySelector('#proj-modal-overlay')?.addEventListener('click', e => { if (e.target.id === 'proj-modal-overlay') close(); });
        root.querySelector('#proj-edit-from-view')?.addEventListener('click', () => {
          root.innerHTML = '';
          showProjectModal(project, false).then(r => resolve(r));
        });

        root.querySelector('#copy-proj-link-view')?.addEventListener('click', () => {
          navigator.clipboard.writeText(getPublicUrl());
          const btn = root.querySelector('#copy-proj-link-view');
          btn.innerHTML = '<i data-lucide="check" class="lucide-sm"></i>';
          initLucide();
          setTimeout(() => { btn.innerHTML = '<i data-lucide="link" class="lucide-sm"></i>'; initLucide(); }, 1500);
        });

        return; // Skip edit bindings in view mode
      }

      root.querySelector('#proj-close')?.addEventListener('click', () => finalize(false));
      root.querySelector('#proj-cancel')?.addEventListener('click', () => finalize(false));
      root.querySelector('#proj-modal-overlay')?.addEventListener('click', e => { if (e.target.id === 'proj-modal-overlay') finalize(false); });

      root.querySelector('#copy-proj-link-edit')?.addEventListener('click', () => {
        navigator.clipboard.writeText(getPublicUrl());
        const btn = root.querySelector('#copy-proj-link-edit');
        btn.innerHTML = '<i data-lucide="check" class="lucide-sm"></i>';
        initLucide();
        setTimeout(() => { btn.innerHTML = '<i data-lucide="link" class="lucide-sm"></i>'; initLucide(); }, 1500);
      });

      // Logo upload
      root.querySelector('#proj-logo-upload')?.addEventListener('change', async (e) => {
        const file = e.target.files[0]; if (!file) return;
        const preview = root.querySelector('#proj-logo-preview');

        if (preview) {
          preview.innerHTML = '<i data-lucide="loader-2" class="lucide-sm animate-spin" style="color:white;width:24px;height:24px;"></i>';
          initLucide();
        }

        const url = await uploadImage(file, 'projects');

        if (url && preview) {
          pendingLogo = url;
          preview.style.backgroundImage = `url(${pendingLogo})`; preview.style.backgroundSize = 'cover'; preview.style.fontSize = '0'; preview.innerHTML = '';
        } else if (preview) {
          await customAlert('Lỗi tải ảnh. Vui lòng thử lại!', 'Lỗi');
          preview.innerHTML = '';
        }
      });

      // Color selection
      root.querySelectorAll('.color-option').forEach(el => el.addEventListener('click', () => {
        root.querySelectorAll('.color-option').forEach(e => e.classList.remove('selected'));
        el.classList.add('selected');
        selColor = el.dataset.color;
        localProj.color = selColor;
        const preview = root.querySelector('#proj-logo-preview');
        if (preview && !pendingLogo && !(localProj.logo)) preview.style.background = selColor;
      }));

      // Milestone / link management
      root.querySelector('#add-ms')?.addEventListener('click', () => {
        syncInputs();
        milestones.push({ title: '', date: '' }); mount();
      });
      root.querySelector('#add-lk')?.addEventListener('click', () => {
        syncInputs();
        links.push({ label: '', url: '' }); mount();
      });
      root.querySelectorAll('.ms-del').forEach(b => b.addEventListener('click', () => {
        syncInputs();
        milestones.splice(+b.dataset.idx, 1); mount();
      }));
      root.querySelectorAll('.lk-del').forEach(b => b.addEventListener('click', () => {
        syncInputs();
        links.splice(+b.dataset.idx, 1); mount();
      }));

      root.querySelector('#proj-delete')?.addEventListener('click', async () => {
        if (await customConfirm('Xóa dự án này?', 'Xác nhận xóa', true)) { import('../data/store.js').then(s => { s.deleteProject(project.id); finalize(true); }); }
      });

      root.querySelector('#proj-save').addEventListener('click', async (e) => {
        const btn = e.currentTarget;
        const name = root.querySelector('#proj-name').value.trim();
        const code = (root.querySelector('#proj-code').value || '').trim().toUpperCase();
        if (!name) { await customAlert('Nhập tên dự án', 'Thiếu thông tin'); return; }
        if (!code || code.length !== 3 || !/^[A-Z]{3}$/.test(code)) { await customAlert('Mã dự án phải gồm đúng 3 chữ cái in hoa (VD: FEH)', 'Lỗi định dạng'); return; }
        btn.innerHTML = '<i data-lucide="loader-2" style="animation: spin 1s linear infinite; width:14px; height:14px;"></i> ĐANG XỬ LÝ';
        btn.style.pointerEvents = 'none';
        btn.style.opacity = '0.7';
        initLucide();
        await new Promise(r => setTimeout(r, 600));

        const ms = getMillestones().filter(m => m.title);
        const lks = getLinks().filter(l => l.label && l.url);
        const data = {
          name, code, description: root.querySelector('#proj-desc').value.trim(),
          color: selColor, milestones: ms, links: lks,
          status: root.querySelector('#proj-status').dataset.value,
          logo: pendingLogo ?? (project?.logo || '')
        };
        if (editing) await updateProject(project.id, data);
        else await addProject({ id: generateId(), ...data });
        finalize(true);
      });
    }

    function syncInputs() {
      const name = root.querySelector('#proj-name'); if (name) localProj.name = name.value;
      const code = root.querySelector('#proj-code'); if (code) localProj.code = code.value.toUpperCase();
      const desc = root.querySelector('#proj-desc'); if (desc) localProj.description = desc.value;
      const status = root.querySelector('#proj-status'); if (status) localProj.status = status.dataset.value;

      const msList = root.querySelectorAll('#milestones-list > div');
      if (msList.length) {
        milestones.splice(0, milestones.length, ...[...msList].map(d => ({
          title: d.querySelector('.ms-title').value.trim(),
          date: d.querySelector('.ms-date').value
        })));
      }
      const lkList = root.querySelectorAll('#links-list > div');
      if (lkList.length) {
        links.splice(0, links.length, ...[...lkList].map(d => ({
          label: d.querySelector('.lk-label').value.trim(),
          url: d.querySelector('.lk-url').value.trim()
        })));
      }
    }

    function getMillestones() {
      return [...root.querySelectorAll('#milestones-list > div')].map(d => ({
        title: d.querySelector('.ms-title').value.trim(),
        date: d.querySelector('.ms-date').value
      }));
    }
    function getLinks() {
      return [...root.querySelectorAll('#links-list > div')].map(d => ({
        label: d.querySelector('.lk-label').value.trim(),
        url: d.querySelector('.lk-url').value.trim()
      }));
    }

    mount();
  });
}
