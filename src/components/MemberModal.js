import { updateMember, addMember, isAdmin, getCurrentUser, setCurrentUser, getProjects, getSettings, updateSettings, getTasks, getTags, isMaster, deleteMember, uploadImage } from '../data/store.js';
import { generateId, escapeHtml, daysWorking, formatDate, renderAvatar, initLucide, renderProjectAvatar, getModalOverlayStyle, getPublicUrl } from '../utils/helpers.js';
import { ADMIN_POSITIONS, MEMBER_POSITIONS } from '../data/sampleData.js';
import { customAlert, customConfirm } from './CustomModal.js';

export function showMemberModal(member = null, forceViewOnly = false, forceEdit = false) {
  return new Promise((resolve) => {
    const root = document.getElementById('modal-root');
    const currentUser = getCurrentUser();
    const settings = getSettings();
    const isDark = settings.theme === 'dark';
    const editing = !!member;
    const isAddNew = !member && isMaster();
    const canEdit = !forceViewOnly && (!member || forceEdit);
    const days = member?.startDate ? daysWorking(member.startDate) : 0;
    const projects = getProjects();

    const sections = [
      {
        title: 'Liên hệ', fields: [
          { key: 'phone', label: 'SĐT', type: 'tel' },
          { key: 'emailFE', label: 'Email FE', type: 'email' },
          { key: 'emailFPT', label: 'Email FPT', type: 'email' },
          { key: 'gmail', label: 'Gmail', type: 'email' },
          { key: 'facebook', label: 'Facebook', type: 'url' },
          { key: 'tiktok', label: 'Tiktok', type: 'url' },
        ]
      },
      {
        title: 'Công việc', fields: [
          { key: 'location', label: 'Nơi làm', type: 'text' },
          { key: 'school', label: 'Trường', type: 'text' },
          { key: 'generation', label: 'Khóa', type: 'text' },
          { key: 'startDate', label: 'Làm việc từ', type: 'date' },
        ]
      },
      {
        title: 'Cá nhân', fields: [
          { key: 'dob', label: 'Ngày sinh', type: 'date' },
          { key: 'cccd', label: 'CCCD', type: 'text' },
          { key: 'mst', label: 'MST', type: 'text' },
        ]
      },
      {
        title: 'Tài khoản ngân hàng', fields: [
          { key: 'bankName', label: 'Ngân hàng', type: 'text' },
          { key: 'bankAccount', label: 'Số tài khoản', type: 'text' },
          { key: 'bankAccountName', label: 'Tên tài khoản', type: 'text' },
          { key: 'bankBranch', label: 'Chi nhánh', type: 'text' },
        ]
      },
    ];
    const allFields = sections.flatMap(s => s.fields);

    const originalPath = window.location.pathname;
    const basePath = (originalPath.includes('/', 1) ? originalPath.split('/').slice(0, 2).join('/') : originalPath) || '/members';

    if (member && !isAddNew) {
      const displayId = member.id.startsWith('MEM') ? member.id.slice(3) : member.id;
      window.history.replaceState(null, null, '/members/' + displayId);
    }

    const finalize = (res = true) => {
      document.body.classList.remove('modal-open');
      window.history.replaceState(null, null, basePath);
      root.innerHTML = '';
      resolve(res);
    };

    document.body.classList.add('modal-open');

    root.innerHTML = `
      <div class="modal-overlay" id="member-modal-overlay" style="${getModalOverlayStyle()}">
        <div class="modal-content" style="max-width:540px; padding-bottom: env(safe-area-inset-bottom);">
          <div class="modal-header" style="display:flex; align-items:center; justify-content:space-between;">
            <div style="display:flex; align-items:center; gap:12px;">
              <h2>${isAddNew ? 'Thêm thành viên' : canEdit ? 'Chỉnh sửa' : 'Thông tin'}</h2>
              ${!forceViewOnly ? `<button class="btn-icon btn-ghost" id="modal-theme-toggle" title="${isDark ? 'Chuyển sang Light mode' : 'Chuyển sang Dark mode'}" style="width:28px;height:28px;">
                <i data-lucide="${isDark ? 'sun' : 'moon'}" class="lucide-sm"></i>
              </button>` : ''}
              ${member && !isAddNew ? `<button class="btn-icon btn-ghost sm" id="copy-member-link" title="Copy Link"><i data-lucide="link" class="lucide-sm"></i></button>` : ''}
            </div>
            <button class="btn-icon btn-ghost" id="member-modal-close"><i data-lucide="x"></i></button>
          </div>
          <div class="modal-body">
            ${member ? `
              <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;padding:16px;background:var(--bg-app);border-radius:var(--r-md);">
                <div style="position:relative;">
                  ${renderAvatar(member, 'avatar-2xl')}
                  ${canEdit ? `<label style="position:absolute;bottom:-4px;right:-4px;width:24px;height:24px;border-radius:50%;background:var(--primary);color:white;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:var(--shadow-sm);"><i data-lucide="camera" class="lucide-sm"></i><input type="file" id="avatar-upload" accept="image/*" style="display:none;" /></label>` : ''}
                </div>
                <div style="flex:1;min-width:0;">
                  ${canEdit ? `
                    <input class="form-control" id="member-fullName" value="${escapeHtml(member.fullName)}" style="font-weight:600;font-size:var(--fs-lg);margin-bottom:8px;" />
                    <select class="form-control" id="member-position" style="font-size:var(--fs-xs);" ${!isMaster() ? 'disabled' : ''}>
                      ${MEMBER_POSITIONS.map(p => `<option value="${p}" ${member.position === p ? 'selected' : ''}>${p}</option>`).join('')}
                    </select>
                  ` : `
                    <div style="font-size:var(--fs-lg);font-weight:700;color:var(--text-primary);">${escapeHtml(member.fullName)}</div>
                    <div style="font-size:var(--fs-xs);color:var(--text-secondary);margin-top:2px;">${escapeHtml(member.position || '')}</div>
                  `}
                  <div style="display:flex;align-items:center;gap:8px;margin-top:6px;">
                    ${days > 0 ? `<div style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;background:var(--primary-bg);color:var(--primary);border-radius:var(--r-full);font-size:var(--fs-xs);font-weight:600;"><i data-lucide="heart" class="lucide-sm"></i>${days} ngày</div>` : ''}
                    ${!canEdit && member?.facebook ? `<a href="${escapeHtml(member.facebook)}" target="_blank" title="Facebook" class="social-link facebook">
                      <svg width="18" height="18" viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg">
                        <path d="M240 363.3L240 576L356 576L356 363.3L442.5 363.3L460.5 265.5L356 265.5L356 230.9C356 179.2 376.3 159.4 428.7 159.4C445 159.4 458.1 159.8 465.7 160.6L465.7 71.9C451.4 68 416.4 64 396.2 64C289.3 64 240 114.5 240 223.4L240 265.5L174 265.5L174 363.3L240 363.3z" fill="currentColor"/>
                      </svg>
                    </a>` : ''}
                    ${!canEdit && member?.tiktok ? `<a href="${escapeHtml(member.tiktok)}" target="_blank" title="Tiktok" class="social-link tiktok">
                      <svg width="18" height="18" viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg">
                        <path d="M544.5 273.9C500.5 274 457.5 260.3 421.7 234.7L421.7 413.4C421.7 446.5 411.6 478.8 392.7 506C373.8 533.2 347.1 554 316.1 565.6C285.1 577.2 251.3 579.1 219.2 570.9C187.1 562.7 158.3 545 136.5 520.1C114.7 495.2 101.2 464.1 97.5 431.2C93.8 398.3 100.4 365.1 116.1 336C131.8 306.9 156.1 283.3 185.7 268.3C215.3 253.3 248.6 247.8 281.4 252.3L281.4 342.2C266.4 337.5 250.3 337.6 235.4 342.6C220.5 347.6 207.5 357.2 198.4 369.9C189.3 382.6 184.4 398 184.5 413.8C184.6 429.6 189.7 444.8 199 457.5C208.3 470.2 221.4 479.6 236.4 484.4C251.4 489.2 267.5 489.2 282.4 484.3C297.3 479.4 310.4 469.9 319.6 457.2C328.8 444.5 333.8 429.1 333.8 413.4L333.8 64L421.8 64C421.7 71.4 422.4 78.9 423.7 86.2C426.8 102.5 433.1 118.1 442.4 131.9C451.7 145.7 463.7 157.5 477.6 166.5C497.5 179.6 520.8 186.6 544.6 186.6L544.6 274z" fill="currentColor"/>
                      </svg>
                    </a>` : ''}
                  </div>
                </div>
              </div>
            ` : `
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px;">
                <div class="form-group" style="margin-bottom:0;"><label>Họ tên *</label><input class="form-control" id="member-fullName" placeholder="Họ tên..." /></div>
                <div class="form-group" style="margin-bottom:0;"><label>Vị trí *</label>
                  <select class="form-control" id="member-position">
                    ${MEMBER_POSITIONS.map(p => `<option value="${p}">${p}</option>`).join('')}
                  </select>
                </div>
              </div>
            `}

            ${canEdit ? sections.map(s => `
              <div style="margin-bottom:16px;">
                <div style="font-size:var(--fs-xs);font-weight:600;text-transform:uppercase;color:var(--text-tertiary);margin-bottom:8px;letter-spacing:0.04em;">${s.title}</div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                  ${s.fields.map(f => `
                    <div class="form-group" style="margin-bottom:0;">
                      <label style="text-transform:none;letter-spacing:0;">${f.label}</label>
                      <input class="form-control" type="${f.type}" id="member-${f.key}" value="${escapeHtml(member?.[f.key] || '')}" placeholder="${f.label}" style="font-size:var(--fs-xs);padding:6px 8px;" />
                    </div>
                  `).join('')}
                </div>
              </div>
            `).join('') : sections.map(s => {
      const hasData = s.fields.some(f => member?.[f.key]);
      if (!hasData) return '';
      return `
                <div style="margin-bottom:16px;">
                  <div style="font-size:var(--fs-xs);font-weight:600;text-transform:uppercase;color:var(--text-tertiary);margin-bottom:8px;">${s.title}</div>
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
                    ${s.fields.filter(f => member?.[f.key] && f.key !== 'facebook' && f.key !== 'tiktok').map(f => `
                      <div style="padding:8px 10px;background:var(--bg-app);border-radius:var(--r-sm);">
                        <div style="font-size:var(--fs-2xs);color:var(--text-tertiary);margin-bottom:2px;display:flex;align-items:center;gap:4px;">
                          ${f.label}
                          ${f.type === 'email' && currentUser?.sessionEmail && (member[f.key] || '').toLowerCase().trim() === currentUser.sessionEmail.toLowerCase().trim() ? `<i data-lucide="check-circle-2" style="width:10px;height:10px;color:var(--success);fill:var(--success);" title="Đang kết nối"></i>` : ''}
                        </div>
                        <div style="font-size:var(--fs-xs);font-weight:500;color:var(--text-primary);word-break:break-all; display:flex; align-items:center; gap:8px;">
                          ${f.key === 'phone' ? `
                            <span>${escapeHtml(member[f.key])}</span>
                            <div style="display:flex;gap:4px;margin-left:auto;">
                              <a href="tel:${escapeHtml(member[f.key])}" class="btn-icon btn-ghost" style="width:24px;height:24px;" title="Gọi đi"><i data-lucide="phone" class="lucide-sm"></i></a>
                            </div>
                          ` :
          f.type === 'url' ? `<a href="${escapeHtml(member[f.key])}" target="_blank" style="color:var(--primary);">Xem</a>` :
            f.type === 'date' ? formatDate(member[f.key]) : escapeHtml(member[f.key])}
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              `;
    }).join('')}

            ${isMaster() && canEdit ? `
                <div style="margin-bottom:16px;">
                  <div style="font-size:var(--fs-xs);font-weight:600;text-transform:uppercase;color:var(--text-tertiary);margin-bottom:8px;letter-spacing:0.04em;">Phân quyền hệ thống</div>
                  <div style="display:flex;gap:12px;">
                    <label style="display:flex;align-items:center;gap:6px;cursor:pointer;user-select:none;">
                      <input type="checkbox" id="member-isAdmin" ${member?.isAdmin ? 'checked' : ''} style="margin:0;" />
                      <span style="font-size:var(--fs-xs);font-weight:500;">Quyền Admin</span>
                    </label>
                    <label style="display:flex;align-items:center;gap:6px;cursor:pointer;user-select:none;">
                      <input type="checkbox" id="member-isMaster" ${member?.isMaster ? 'checked' : ''} style="margin:0;" />
                      <span style="font-size:var(--fs-xs);font-weight:500;color:var(--primary);">Quyền Master</span>
                    </label>
                  </div>
                </div>
            ` : ''}

            ${(isMaster() || isAdmin()) && canEdit ? (() => {
        const mTags = getTags().filter(t => t.type === 'member');
        if (!mTags.length) return '';
        return `
                <div style="margin-bottom:16px;">
                  <div style="font-size:var(--fs-xs);font-weight:600;text-transform:uppercase;color:var(--text-tertiary);margin-bottom:8px;letter-spacing:0.04em;">Tags nhân sự</div>
                  <div style="display:flex;flex-wrap:wrap;gap:6px;">
                    ${mTags.map(t => {
          const isChecked = member?.tags?.includes(t.id);
          return `
                        <label style="display:flex;align-items:center;gap:4px;padding:4px 8px;background:var(--bg-app);border-radius:var(--r-sm);cursor:pointer;user-select:none;">
                          <input type="checkbox" class="member-tag-cb" value="${t.id}" ${isChecked ? 'checked' : ''} style="margin:0;" />
                          <span style="font-size:var(--fs-xs);font-weight:600;color:${t.color};">${escapeHtml(t.name)}</span>
                        </label>
                      `;
        }).join('')}
                  </div>
                </div>
              `;
      })() : ''}

            ${/* Project roles section - master only to edit member roles */ isMaster() && canEdit && projects.length ? `
              <div style="margin-bottom:16px;">
                <div style="font-size:var(--fs-xs);font-weight:600;text-transform:uppercase;color:var(--text-tertiary);margin-bottom:8px;letter-spacing:0.04em;">Vai trò trong dự án</div>
                <div style="display:flex;flex-direction:column;gap:6px;">
                  ${projects.map(p => {
        const currentRole = member?.projectRoles?.[p.id] || '';
        return `
                    <div style="display:flex;align-items:center;gap:8px;padding:6px 10px;background:var(--bg-app);border-radius:var(--r-sm);">
                      <div style="width:8px;height:8px;border-radius:50%;background:${p.color};flex-shrink:0;"></div>
                      <span style="font-size:var(--fs-xs);font-weight:500;flex:1;">${escapeHtml(p.name)}</span>
                      <input class="form-control proj-role" data-pid="${p.id}" value="${escapeHtml(currentRole)}" placeholder="Vai trò..." style="width:160px;font-size:var(--fs-xs);padding:4px 8px;" />
                    </div>`;
      }).join('')}
                </div>
              </div>
            ` : ''}

            ${!canEdit && member ? (() => {
        const roleEntries = Object.entries(member.projectRoles || {}).map(([pid, role]) => {
          const proj = projects.find(p => p.id === pid);
          return proj ? { proj, role } : null;
        }).filter(Boolean);
        if (!roleEntries.length) return '';
        return `
                <div style="margin-bottom:16px;">
                  <div style="display:flex;align-items:center;cursor:pointer;user-select:none;margin-bottom:8px;" onclick="const c=document.getElementById('member-projects-list');const i=this.querySelector('.chevron-icon');if(c.style.display==='none'){c.style.display='flex';if(i)i.style.transform='rotate(90deg)';}else{c.style.display='none';if(i)i.style.transform='rotate(0deg)';}">
                    <i data-lucide="chevron-right" class="chevron-icon" style="width:16px;height:16px;color:var(--text-tertiary);transition:transform 0.2s;transform:rotate(0deg);"></i>
                    <div style="font-size:var(--fs-xs);font-weight:600;text-transform:uppercase;color:var(--text-tertiary);letter-spacing:0.04em;">Dự án đang tham gia</div>
                  </div>
                  <div id="member-projects-list" style="display:none;flex-direction:column;gap:6px;">
                    ${roleEntries.map(({ proj, role }) => `
                      <div style="display:flex;align-items:center;gap:12px;padding:8px 12px;background:var(--bg-app);border-radius:var(--r-md);border-left:3px solid ${proj.color};">
                        <div style="flex-shrink:0;">
                          ${renderProjectAvatar(proj, 'avatar-md')}
                        </div>
                        <div style="flex:1;min-width:0;">
                          <div style="font-size:var(--fs-xs);font-weight:700;color:var(--text-primary);" class="truncate">${escapeHtml(proj.name)}</div>
                          <div style="font-size:11px;color:var(--text-secondary);">${escapeHtml(role)}</div>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              `;
      })() : ''}

            ${!canEdit && member ? (() => {
        const allTasks = getTasks();
        const memberTasks = allTasks.filter(t => (t.assigneeId === member.id || t.reviewerId === member.id || t.assignerId === member.id || t.createdBy === member.id) && t.status !== 'complete')
          .sort((a, b) => {
            const statusOrder = { 'pending_approval': 1, 'incomplete': 2 };
            return (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99) || (new Date(a.deadline) - new Date(b.deadline));
          });

        if (!memberTasks.length) return `<div style="margin-top:20px;text-align:center;color:var(--text-tertiary);font-size:var(--fs-xs);">Không có task nào liên quan</div>`;
        return `
              <div style="margin-top:20px;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
                  <div style="display:flex;align-items:center;cursor:pointer;user-select:none;" onclick="const c=document.getElementById('member-tasks-list');const i=this.querySelector('.chevron-icon');if(c.style.display==='none'){c.style.display='flex';if(i)i.style.transform='rotate(90deg)';}else{c.style.display='none';if(i)i.style.transform='rotate(0deg)';}">
                    <i data-lucide="chevron-right" class="chevron-icon" style="width:16px;height:16px;color:var(--text-tertiary);transition:transform 0.2s;transform:rotate(0deg);"></i>
                    <div style="font-size:var(--fs-xs);font-weight:600;text-transform:uppercase;color:var(--text-tertiary);letter-spacing:0.04em;display:flex;align-items:center;gap:6px;"><i data-lucide="list-todo" class="lucide-sm"></i> Task liên quan</div>
                  </div>
                  <div style="font-size:10px; opacity:0.7;color:var(--text-tertiary);">${memberTasks.length} task</div>
                </div>
                <div id="member-tasks-list" style="display:none;flex-direction:column;gap:10px;margin-top:4px;">
                  ${memberTasks.map(t => {
          const overdue = t.deadline && new Date(t.deadline) < new Date() && t.status !== 'complete';
          let roleLabel = '';
          let roleColor = 'var(--text-tertiary)';
          if (t.assigneeId === member.id) { roleLabel = 'Làm'; roleColor = 'var(--primary)'; }
          else if (t.reviewerId === member.id) { roleLabel = 'Duyệt'; roleColor = 'var(--warning)'; }
          else { roleLabel = 'Tạo'; roleColor = 'var(--info)'; }

          return `
                      <div style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--bg-app);border-radius:var(--r-md);border:1px solid var(--border-color);position:relative;overflow:hidden;flex-shrink:0;">
                        <div style="position:absolute;left:0;top:0;bottom:0;width:4px;background:${roleColor};"></div>
                        <div style="flex:1;min-width:0;">
                          <div style="display:flex;align-items:start;gap:8px;margin-bottom:6px;">
                            <span style="font-size:9px;font-weight:700;padding:2px 6px;border-radius:4px;background:${roleColor}15;color:${roleColor};text-transform:uppercase;margin-top:2px;flex-shrink:0;">${roleLabel}</span>
                            <div style="font-size:var(--fs-xs);font-weight:600;line-height:1.4;color:var(--text-primary);word-break:break-word;">${escapeHtml(t.title)}</div>
                          </div>
                          <div style="display:flex;align-items:center;flex-wrap:wrap;gap:x:12px;gap-y:4px;margin-left:45px;">
                            ${t.projectId ? `<span style="font-size:10px;color:var(--text-tertiary);display:flex;align-items:center;gap:4px;margin-right:8px;"><div style="width:6px;height:6px;border-radius:50%;background:${projects.find(p => p.id === t.projectId)?.color || '#ccc'};"></div>${escapeHtml(projects.find(p => p.id === t.projectId)?.name || '—')}</span>` : ''}
                            ${t.status === 'pending_approval' ? `<span class="badge badge-warning" style="font-size:9px;padding:1px 6px;height:16px;margin-right:8px;">Biên tập xong</span>` : ''}
                            ${t.deadline ? `<span style="font-size:10px;display:flex;align-items:center;gap:3px;margin-left:auto;${overdue ? 'color:var(--danger);font-weight:600;' : 'color:var(--text-disabled);'}"><i data-lucide="calendar-days" style="width:10px;height:10px;"></i>${formatDate(t.deadline)}</span>` : ''}
                          </div>
                        </div>
                      </div>
                    `;
        }).join('')}
                </div>
              </div>
            `;
      })() : ''}
          </div>
          <div class="modal-footer" style="padding: 16px 24px; border-top: 1px solid var(--border-light); gap: 10px; display: flex; align-items: center; justify-content: space-between; background: var(--bg-card); border-radius: 0 0 var(--r-xl) var(--r-xl); min-height:72px;">
            <div style="display:flex; gap:8px; align-items:center;">
              ${canEdit && member && isMaster() ? `<button class="btn btn-danger" id="member-delete" style="height:36px; padding: 0 16px; border-radius: var(--r-md); font-weight: 700; font-size: 11px; letter-spacing:0.02em; background:var(--danger-bg); color:var(--danger); border:none;"><i data-lucide="trash-2" style="width:14px; height:14px;"></i> XÓA</button>` : ''}
              ${!canEdit && member && member.id === currentUser?.id ? `<button class="btn btn-danger" id="member-logout-btn" style="height:36px; padding: 0 16px; border-radius: var(--r-md); font-weight: 700; font-size: 11px; letter-spacing:0.02em; background:var(--danger-bg); color:var(--danger); border:none;"><i data-lucide="log-out" style="width:14px; height:14px;"></i> ĐĂNG XUẤT</button>` : ''}
              ${!canEdit && member && (member.id === currentUser?.id || isMaster()) && member.id !== currentUser?.id ? `<button class="btn btn-outline" id="member-edit-btn" style="height:36px; padding: 0 24px; border-radius: var(--r-md); font-weight: 700; font-size: 11px; color:var(--text-primary); background:var(--bg-hover); border:1px solid var(--border-light); letter-spacing:0.02em;"><i data-lucide="pencil" style="width:14px; height:14px;"></i> CHỈNH SỬA</button>` : ''}
              ${member && isAdmin() && member.id !== currentUser?.id && member.status !== 'closed' ? `<button class="btn btn-danger" id="member-close-btn" style="height:36px; padding: 0 16px; border-radius: var(--r-md); font-weight: 700; font-size: 11px; letter-spacing:0.02em; background:var(--danger-bg); color:var(--danger); border:none;"><i data-lucide="user-x" style="width:14px; height:14px;"></i> ĐÓNG TÀI KHOẢN</button>` : ''}
            </div>
            
            <div style="display:flex; gap:8px; align-items:center;">
              ${!canEdit && member && (member.id === currentUser?.id || isMaster()) && member.id === currentUser?.id ? `<button class="btn btn-outline" id="member-edit-btn" style="height:36px; padding: 0 24px; border-radius: var(--r-md); font-weight: 700; font-size: 11px; color:var(--text-primary); background:var(--bg-hover); border:1px solid var(--border-light); letter-spacing:0.02em;"><i data-lucide="pencil" style="width:14px; height:14px;"></i> CHỈNH SỬA</button>` : ''}
              
              ${canEdit ? `<button class="btn btn-outline" id="member-cancel" style="height:36px; padding: 0 24px; border-radius: var(--r-md); font-weight: 700; font-size: 11px; color:var(--text-primary); background:var(--bg-hover); border:1px solid var(--border-light); letter-spacing:0.02em;">HỦY</button>` : ''}
              ${canEdit ? `<button class="btn btn-primary" id="member-save" style="height:36px; padding: 0 24px; border-radius: var(--r-md); font-weight: 700; font-size: 11px; box-shadow: 0 4px 12px var(--primary)40; letter-spacing:0.02em;">${isAddNew ? 'THÊM' : 'LƯU'}</button>` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
    initLucide();

    root.querySelector('#modal-theme-toggle')?.addEventListener('click', () => {
      const s = getSettings();
      const t = s.theme === 'dark' ? 'light' : 'dark';
      updateSettings({ theme: t });
      document.documentElement.setAttribute('data-theme', t);
      // Re-open the modal cleanly to show correct icon
      root.innerHTML = '';
      showMemberModal(member, forceViewOnly, forceEdit).then(resolve);
      // Optional: trigger full re-render logic if needed, but not strictly possible easily here without global reference
      const p = document.getElementById('page-container');
      if (p && window.renderApp) {
        window.location.reload(); // Quick hack to sync external views
      }
    });

    // Re-render in edit mode
    root.querySelector('#member-edit-btn')?.addEventListener('click', () => {
      root.innerHTML = '';
      showMemberModal(member, false, true).then(resolve);
    });

    // Logout
    root.querySelector('#member-logout-btn')?.addEventListener('click', () => {
      const btn = root.querySelector('#member-logout-btn');
      btn.innerHTML = '<i data-lucide="loader-2" class="lucide-sm animate-spin"></i> Đang đăng xuất...';
      import('../data/store.js').then(async ({ logout }) => {
        await logout();
        window.history.replaceState(null, '', '/');
        window.location.reload();
      });
    });

    root.querySelector('#avatar-upload')?.addEventListener('change', async (e) => {
      const file = e.target.files[0]; if (!file) return;
      const el = root.querySelector('.avatar-2xl');
      if (el) {
        el.textContent = '';
        el.innerHTML = '<i data-lucide="loader-2" class="lucide-sm animate-spin" style="color:white;width:24px;height:24px;"></i>';
        initLucide();
      }

      const url = await uploadImage(file, 'avatars');
      if (url && el) {
        el.innerHTML = '';
        el.style.backgroundImage = `url(${url})`;
        el.dataset.newAvatar = url;
      } else if (el) {
        await customAlert('Lỗi tải ảnh. Vui lòng thử lại!', 'Lỗi');
        el.innerHTML = '';
      }
    });

    root.querySelector('#member-modal-close')?.addEventListener('click', () => finalize(false));
    root.querySelector('#member-cancel')?.addEventListener('click', () => finalize(false));
    root.querySelector('#member-modal-overlay')?.addEventListener('click', e => { if (e.target.id === 'member-modal-overlay') finalize(false); });

    root.querySelector('#copy-member-link')?.addEventListener('click', () => {
      navigator.clipboard.writeText(getPublicUrl());
      const btn = root.querySelector('#copy-member-link');
      btn.innerHTML = '<i data-lucide="check" class="lucide-sm"></i>';
      initLucide();
      setTimeout(() => { btn.innerHTML = '<i data-lucide="link" class="lucide-sm"></i>'; initLucide(); }, 1500);
    });

    root.querySelector('#member-delete')?.addEventListener('click', async () => {
      if (await customConfirm('Xóa thành viên ' + member.fullName + '?', 'Xác nhận xóa', true)) {
        deleteMember(member.id);
        root.innerHTML = ''; resolve(true);
      }
    });

    root.querySelector('#member-close-btn')?.addEventListener('click', async () => {
      if (await customConfirm('Bạn có chắc chắn muốn đóng tài khoản ' + member.fullName + '? Sau khi đóng, tài khoản đó sẽ không thể truy cập hệ thống nữa.', 'Xác nhận đóng tài khoản', true)) {
        updateMember(member.id, { status: 'closed' });
        finalize(true);
      }
    });

    root.querySelector('#member-save')?.addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      const fullName = root.querySelector('#member-fullName').value.trim();
      const position = root.querySelector('#member-position')?.value || '';
      if (!fullName) { await customAlert('Vui lòng nhập họ tên', 'Thiếu thông tin'); return; }
      btn.innerHTML = '<i data-lucide="loader-2" style="animation: spin 1s linear infinite; width:14px; height:14px;"></i> ĐANG XỬ LÝ';
      btn.style.pointerEvents = 'none';
      btn.style.opacity = '0.7';
      initLucide();
      await new Promise(r => setTimeout(r, 600));

      const data = { fullName, position };
      allFields.forEach(f => { const el = root.querySelector('#member-' + f.key); if (el) data[f.key] = el.value.trim(); });
      const avatarEl = root.querySelector('.avatar-2xl');
      if (avatarEl?.dataset.newAvatar) data.avatar = avatarEl.dataset.newAvatar;

      if (isMaster()) {
        data.isAdmin = root.querySelector('#member-isAdmin')?.checked || false;
        data.isMaster = root.querySelector('#member-isMaster')?.checked || false;
      }

      if (isMaster() && canEdit) {
        data.tags = Array.from(root.querySelectorAll('.member-tag-cb:checked')).map(cb => cb.value);
      }

      // Project roles
      if (isMaster() && canEdit) {
        const projectRoles = { ...(member?.projectRoles || {}) };
        root.querySelectorAll('.proj-role').forEach(inp => {
          const pid = inp.dataset.pid;
          const role = inp.value.trim();
          if (role) projectRoles[pid] = role;
          else delete projectRoles[pid];
        });
        data.projectRoles = projectRoles;
      }

      if (isAddNew) addMember({ id: generateId(), ...data, avatar: data.avatar || '', projectRoles: data.projectRoles || {} });
      else if (member) {
        updateMember(member.id, data);
        if (member.id === currentUser?.id) setCurrentUser({ ...currentUser, ...data });
      }
      finalize(true);
    });
  });
}
