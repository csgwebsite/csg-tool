const fs = require('fs');

const code = `import { addProject, updateProject, isAdmin, getTasks, getMembers } from '../data/store.js';
import { generateId, escapeHtml, initLucide, renderProjectAvatar, renderAvatar, sortTasks, formatDate } from '../utils/helpers.js';

const COLORS = ['#F97316', '#EF4444', '#8B5CF6', '#3B82F6', '#10B981', '#EC4899', '#F59E0B', '#6366F1', '#14B8A6', '#0EA5E9'];

export function showProjectModal(project = null, isViewMode = false) {
  return new Promise((resolve) => {
    const root = document.getElementById('modal-root');
    const editing = !!project && !isViewMode;
    const milestones = project?.milestones ? [...project.milestones] : [];
    const links = project?.links ? [...project.links] : [];
    let selColor = project?.color || COLORS[0];
    let pendingLogo = null; // base64 string for new logo

    function buildHtml() {
      const logoPreview = pendingLogo || project?.logo || '';
      
      if (isViewMode && project) {
          const allTasks = sortTasks(getTasks().filter(t => t.projectId === project.id));
          const members = getMembers();
          const completedTaskCount = allTasks.filter(t => t.status === 'complete').length;

          return \`
          <div class="modal-overlay" id="proj-modal-overlay">
            <div class="modal-content" style="max-width:600px; max-height: 90vh; overflow-y:auto;">
              <div class="modal-header">
                <h2>Thông tin dự án</h2>
                <div style="display:flex;gap:8px;margin-left:auto;">
                  \${isAdmin() ? \`<button class="btn-icon btn-ghost" id="proj-edit-from-view"><i data-lucide="edit-2"></i></button>\` : ''}
                  <button class="btn-icon btn-ghost" id="proj-close-view"><i data-lucide="x"></i></button>
                </div>
              </div>
              <div class="modal-body">
                <div style="display:flex;gap:16px;align-items:flex-start;margin-bottom:20px;">
                  \${renderProjectAvatar(project, 'avatar-xl')}
                  <div style="flex:1;">
                    <h3 style="margin:0 0 4px 0;font-size:1.2rem;">\${escapeHtml(project.name)}</h3>
                    <div style="color:var(--text-secondary);font-size:var(--fs-sm);line-height:1.5;">\${escapeHtml(project.description || 'Không có mô tả')}</div>
                    <div style="margin-top:8px;font-size:var(--fs-2xs);font-weight:600;color:\${project.color};">
                      \${completedTaskCount} / \${allTasks.length} task hoàn thành
                    </div>
                  </div>
                </div>

                \${milestones.length ? \`
                <div style="margin-bottom:20px;">
                  <h4 style="font-size:var(--fs-sm);margin-bottom:8px;text-transform:uppercase;color:var(--text-tertiary);letter-spacing:0.5px;">Mốc thời gian</h4>
                  <div style="display:flex;flex-direction:column;gap:6px;">
                  \${milestones.map(m => \`
                    <div style="display:flex;align-items:center;gap:8px;font-size:var(--fs-sm);padding:6px;background:var(--bg-body);border-radius:var(--r-sm);">
                      <span style="width:8px;height:8px;border-radius:50%;background:\${project.color};"></span>
                      <span style="flex:1;font-weight:500;">\${escapeHtml(m.title)}</span>
                      <span style="color:var(--text-tertiary);">\${formatDate(m.date)}</span>
                    </div>
                  \`).join('')}
                  </div>
                </div>\` : ''}

                \${links.length ? \`
                <div style="margin-bottom:20px;">
                  <h4 style="font-size:var(--fs-sm);margin-bottom:8px;text-transform:uppercase;color:var(--text-tertiary);letter-spacing:0.5px;">Liên kết</h4>
                  <div style="display:flex;flex-wrap:wrap;gap:8px;">
                    \${links.map(l => \`<a href="\${escapeHtml(l.url)}" target="_blank" class="tag-chip" style="text-decoration:none;color:var(--text-link);background:var(--bg-badge);"><i data-lucide="external-link" class="lucide-sm"></i>\${escapeHtml(l.label)}</a>\`).join('')}
                  </div>
                </div>\` : ''}

                <div>
                  <h4 style="font-size:var(--fs-sm);margin-bottom:12px;text-transform:uppercase;color:var(--text-tertiary);letter-spacing:0.5px;">Danh sách Task</h4>
                  \${allTasks.length ? \`
                    <div style="display:flex;flex-direction:column;gap:8px;">
                      \${allTasks.map(t => {
                        const assignee = members.find(m => m.id === t.assigneeId);
                        const isComplete = t.status === 'complete';
                        return \`
                        <div style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--bg-card);border:1px solid var(--border-light);border-radius:var(--r-md);opacity:\${isComplete ? '0.6' : '1'};">
                          <div style="flex:1;min-width:0;">
                            <div style="font-size:var(--fs-sm);font-weight:600;text-decoration:\${isComplete ? 'line-through' : 'none'};color:\${isComplete ? 'var(--text-tertiary)' : 'var(--text-primary)'};" class="truncate">\${escapeHtml(t.title)}</div>
                            <div style="font-size:var(--fs-2xs);color:var(--text-tertiary);margin-top:4px;display:flex;gap:12px;">
                                <span><i data-lucide="clock" class="lucide-sm" style="vertical-align:-2px;margin-right:2px;"></i> \${t.deadline ? formatDate(t.deadline.split('T')[0]) : '—'}</span>
                                <span style="color:\${t.status === 'pending_approval' ? 'var(--warning)' : (isComplete ? 'var(--success)' : 'var(--info)')}">\${t.status === 'pending_approval' ? 'Chờ duyệt' : (isComplete ? 'Hoàn thành' : 'Đang làm')}</span>
                            </div>
                          </div>
                          \${assignee ? renderAvatar(assignee, 'avatar-xs') : ''}
                        </div>
                        \`;
                      }).join('')}
                    </div>
                  \` : '<div style="font-size:var(--fs-sm);color:var(--text-tertiary);padding:12px;text-align:center;background:var(--bg-body);border-radius:var(--r-sm);">Chưa có task nào trong dự án này.</div>'}
                </div>
              </div>
            </div>
          </div>\`;
      }

      return \`
      <div class="modal-overlay" id="proj-modal-overlay">
        <div class="modal-content" style="max-width:520px;">
          <div class="modal-header">
            <h2>\${editing ? 'Chỉnh sửa dự án' : 'Tạo dự án'}</h2>
            <button class="btn-icon btn-ghost" id="proj-close"><i data-lucide="x"></i></button>
          </div>
          <div class="modal-body">
            <!-- Logo + Name row -->
            <div style="display:flex;gap:16px;align-items:flex-start;margin-bottom:16px;">
              <!-- Logo upload -->
              <div style="flex-shrink:0;">
                <label style="cursor:pointer;display:block;" title="Upload logo">
                  <div id="proj-logo-preview" style="width:56px;height:56px;border-radius:var(--r-md);background:\${selColor};display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:800;color:white;overflow:hidden;\${logoPreview ? \`background-image:url(\${logoPreview});background-size:cover;background-position:center;font-size:0;\` : ''}">
                    \${logoPreview ? '' : \`<span>\${project?.name?.[0] || '?'}</span>\`}
                  </div>
                  <input type="file" id="proj-logo-upload" accept="image/*" style="display:none;" />
                </label>
                <div style="font-size:9px;color:var(--text-disabled);text-align:center;margin-top:3px;">Logo</div>
              </div>
              <div style="flex:1;min-width:0;">
                <div class="form-group" style="margin-bottom:8px;">
                  <label>Tên dự án *</label>
                  <input class="form-control" id="proj-name" value="\${escapeHtml(project?.name || '')}" placeholder="Tên..." />
                </div>
                <div class="form-group" style="margin-bottom:0;">
                  <label>Mô tả</label>
                  <input class="form-control" id="proj-desc" value="\${escapeHtml(project?.description || '')}" placeholder="Mô tả ngắn..." style="font-size:var(--fs-sm);" />
                </div>
              </div>
            </div>

            <!-- Color picker -->
            <div class="form-group">
              <label>Màu nhận diện</label>
              <div class="color-picker" id="color-picker">
                \${COLORS.map(c => \`<div class="color-option \${selColor === c ? 'selected' : ''}" data-color="\${c}" style="background:\${c}"></div>\`).join('')}
              </div>
            </div>

            <!-- Milestones -->
            <div class="form-group">
              <label>Mốc thời gian</label>
              <div id="milestones-list" style="display:flex;flex-direction:column;gap:6px;">
                \${milestones.map((m, i) => \`
                  <div style="display:flex;gap:6px;align-items:center;">
                    <input class="form-control ms-title" value="\${escapeHtml(m.title)}" placeholder="Tên mốc" style="flex:1;font-size:var(--fs-sm);padding:6px 8px;" />
                    <input class="form-control ms-date" type="date" value="\${m.date}" style="width:140px;font-size:var(--fs-sm);padding:6px 8px;" />
                    <button class="btn-icon btn-ghost sm ms-del" data-idx="\${i}"><i data-lucide="x"></i></button>
                  </div>
                \`).join('')}
              </div>
              <button class="btn btn-sm" id="add-ms" style="margin-top:6px;"><i data-lucide="plus"></i> Thêm mốc</button>
            </div>

            <!-- Links -->
            <div class="form-group">
              <label>Links</label>
              <div id="links-list" style="display:flex;flex-direction:column;gap:6px;">
                \${links.map((l, i) => \`
                  <div style="display:flex;gap:6px;align-items:center;">
                    <input class="form-control lk-label" value="\${escapeHtml(l.label)}" placeholder="Tên" style="width:120px;font-size:var(--fs-sm);padding:6px 8px;" />
                    <input class="form-control lk-url" value="\${escapeHtml(l.url)}" placeholder="URL" style="flex:1;font-size:var(--fs-sm);padding:6px 8px;" />
                    <button class="btn-icon btn-ghost sm lk-del" data-idx="\${i}"><i data-lucide="x"></i></button>
                  </div>
                \`).join('')}
              </div>
              <button class="btn btn-sm" id="add-lk" style="margin-top:6px;"><i data-lucide="plus"></i> Thêm link</button>
            </div>
          </div>
          <div class="modal-footer">
            \${editing ? \`<button class="btn btn-ghost" id="proj-delete" style="margin-right:auto;color:var(--danger);"><i data-lucide="trash-2"></i> Xóa</button>\` : ''}
            <button class="btn" id="proj-cancel">Hủy</button>
            <button class="btn btn-primary" id="proj-save">\${editing ? 'Cập nhật' : 'Tạo'}</button>
          </div>
        </div>
      </div>\`;
    }

    function mount() {
      root.innerHTML = buildHtml();
      initLucide();
      bindEvents();
    }

    function bindEvents() {
      const close = () => { root.innerHTML = ''; resolve(false); };
      
      if (isViewMode && project) {
          root.querySelector('#proj-close-view')?.addEventListener('click', close);
          root.querySelector('#proj-modal-overlay')?.addEventListener('click', e => { if (e.target.id === 'proj-modal-overlay') close(); });
          root.querySelector('#proj-edit-from-view')?.addEventListener('click', () => {
              root.innerHTML = '';
              showProjectModal(project, false).then(r => resolve(r));
          });
          return; // Skip edit bindings in view mode
      }

      root.querySelector('#proj-close')?.addEventListener('click', close);
      root.querySelector('#proj-cancel')?.addEventListener('click', close);
      root.querySelector('#proj-modal-overlay')?.addEventListener('click', e => { if (e.target.id === 'proj-modal-overlay') close(); });

      // Logo upload
      root.querySelector('#proj-logo-upload')?.addEventListener('change', (e) => {
        const file = e.target.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          pendingLogo = ev.target.result;
          const preview = root.querySelector('#proj-logo-preview');
          if (preview) { preview.style.backgroundImage = \`url(\${pendingLogo})\`; preview.style.backgroundSize = 'cover'; preview.style.fontSize = '0'; preview.innerHTML = ''; }
        };
        reader.readAsDataURL(file);
      });

      // Color selection
      root.querySelectorAll('.color-option').forEach(el => el.addEventListener('click', () => {
        root.querySelectorAll('.color-option').forEach(e => e.classList.remove('selected'));
        el.classList.add('selected');
        selColor = el.dataset.color;
        const preview = root.querySelector('#proj-logo-preview');
        if (preview && !pendingLogo && !(project?.logo)) preview.style.background = selColor;
      }));

      // Milestone / link management
      root.querySelector('#add-ms')?.addEventListener('click', () => {
        const ms = getMillestones(); ms.push({ title: '', date: '' }); milestones.splice(0, Infinity, ...ms); mount();
      });
      root.querySelector('#add-lk')?.addEventListener('click', () => {
        const lks = getLinks(); lks.push({ label: '', url: '' }); links.splice(0, Infinity, ...lks); mount();
      });
      root.querySelectorAll('.ms-del').forEach(b => b.addEventListener('click', () => {
        const ms = getMillestones(); ms.splice(+b.dataset.idx, 1); milestones.splice(0, Infinity, ...ms); mount();
      }));
      root.querySelectorAll('.lk-del').forEach(b => b.addEventListener('click', () => {
        const lks = getLinks(); lks.splice(+b.dataset.idx, 1); links.splice(0, Infinity, ...lks); mount();
      }));

      root.querySelector('#proj-delete')?.addEventListener('click', () => {
        if (confirm('Xóa dự án này?')) { import('../data/store.js').then(s => { s.deleteProject(project.id); root.innerHTML = ''; resolve(true); }); }
      });

      root.querySelector('#proj-save').addEventListener('click', () => {
        const name = root.querySelector('#proj-name').value.trim();
        if (!name) { alert('Nhập tên dự án'); return; }
        const ms = getMillestones().filter(m => m.title);
        const lks = getLinks().filter(l => l.label && l.url);
        const data = {
          name, description: root.querySelector('#proj-desc').value.trim(),
          color: selColor, milestones: ms, links: lks,
          logo: pendingLogo ?? (project?.logo || '')
        };
        if (editing) updateProject(project.id, data);
        else addProject({ id: generateId(), ...data });
        root.innerHTML = ''; resolve(true);
      });
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
`;
fs.writeFileSync('src/components/ProjectModal.js', code);
