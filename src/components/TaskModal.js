import { getMembers, addTask, updateTask, deleteTask, getProjects, getTags, getCurrentUser, isAdmin, generateTaskId, createNotification } from '../data/store.js';
import { generateId, escapeHtml, renderAvatar, renderProjectAvatar, initLucide, searchSelectHTML, bindSearchSelect, tagSelectHTML, projectSelectHTML, statusSelectHTML, shortenName, getResponsiveName, abbreviateName, getModalOverlayStyle, getPublicUrl } from '../utils/helpers.js';
import { customAlert, customConfirm, customPrompt } from './CustomModal.js';

export function showTaskModal(task = null, defaultProjectId = null, forceEdit = false, passedResolve = null) {
  return new Promise((resolve) => {
    if (passedResolve) resolve = passedResolve;
    const isMobile = window.innerWidth <= 480;
    const members = getMembers()
      .filter(m => m.status !== 'closed' || m.id === task?.assigneeId || m.id === task?.reviewerId || m.id === task?.createdBy || m.id === task?.assignerId)
      .map(m => ({
        ...m,
        shortName: isMobile ? abbreviateName(m.fullName) : shortenName(m.fullName)
      }));
    const projects = getProjects();
    const tags = getTags().filter(t => !t.type || t.type === 'data');
    const currentUser = getCurrentUser();
    const editing = !!(task && task.id);
    const canDelete = editing && (isAdmin() || task.createdBy === currentUser?.id);
    const root = document.getElementById('modal-root');
    const taskTags = task?.tags || [];

    // Permission: assignee can only edit AI, Status, Links
    const isReviewer = task?.reviewerId === currentUser?.id || (!task?.reviewerId && task?.createdBy === currentUser?.id);
    const isAssigner = task?.assignerId === currentUser?.id; // fallback for old tasks
    const isCreator = task?.createdBy === currentUser?.id;
    const canEditAll = !editing || isAdmin() || isReviewer || isAssigner || isCreator;
    const isAssigneeOnly = editing && !canEditAll && task?.assigneeId === currentUser?.id && task?.status !== 'complete';
    const isViewMode = editing && !forceEdit;
    const canEditLinksInView = (isViewMode || isAssigneeOnly) && (task?.status === 'incomplete' || task?.status === 'pending_approval') && (canEditAll || task?.assigneeId === currentUser?.id);
    const originalPath = window.location.pathname;
    const basePath = (originalPath.includes('/', 1) ? originalPath.split('/').slice(0, 2).join('/') : originalPath) || '/tasks';

    const initialProjectId = task?.projectId || defaultProjectId;
    const initialReviewerId = task?.reviewerId || task?.createdBy || task?.assignerId || currentUser?.id;
    let initialAssignees = initialProjectId ? members.filter(m => m.projectRoles && m.projectRoles[initialProjectId]) : [];

    // Ensure the initial reviewer is in the list so they can be rendered even if blocked/no project
    const currentReviewer = members.find(m => m.id === initialReviewerId);
    if (currentReviewer && !initialAssignees.find(m => m.id === initialReviewerId)) {
      initialAssignees = [currentReviewer, ...initialAssignees];
    }

    const finalizeAndReload = () => {
      root.innerHTML = '';
      import('../data/store.js').then(({ getTask }) => showTaskModal(getTask(task.id)).then(resolve));
    };

    if (task && task.id) {
      // task.id với task mới = code (ví dụ 'AYG00021'), nên URL tự nhiên là /tasks/AYG00021.
      // Task cũ vẫn dùng UUID làm id → URL vẫn hoạt động bình thường.
      window.history.replaceState(null, null, '/tasks/' + task.id);
    }

    const finalize = (res = true) => {
      document.body.classList.remove('modal-open');
      window.history.replaceState(null, null, basePath);
      root.innerHTML = '';
      resolve(res);
    };

    document.body.classList.add('modal-open');

    const commentsHtml = editing ? `
            <div style="margin-top:24px;border-top:1px solid var(--border-light);padding-top:24px;">
              <div class="view-label" style="margin-bottom:16px;"><i data-lucide="message-square" style="width:14px;height:14px;"></i> BÌNH LUẬN (${task?.comments?.length || 0})</div>
              
              <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:16px;max-height:200px;overflow-y:auto;padding-right:4px;" id="task-comments-list">
                ${(task?.comments || []).map(c => {
      const u = members.find(m => m.id === (c.userId || c.createdBy));
      const d = new Date(c.createdAt);
      const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')} ${d.getDate()}/${d.getMonth() + 1}`;
      return `
                    <div style="display:flex;gap:10px;">
                      ${renderAvatar(u, 'avatar-sm', false)}
                      <div style="flex:1;min-width:0;">
                        <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px;">
                          <span style="font-size:var(--fs-xs);font-weight:600;">${escapeHtml(shortenName(u?.fullName || 'User'))}</span>
                          <span style="font-size:10px;color:var(--text-tertiary);">${timeStr}</span>
                        </div>
                        <div style="font-size:var(--fs-xs);color:var(--text-secondary);background:var(--bg-app);padding:8px 12px;border-radius:0 var(--r-md) var(--r-md) var(--r-md);display:inline-block;word-break:break-word;">
                          ${escapeHtml(c.text)}
                        </div>
                        ${(c.userId === currentUser?.id || isAdmin()) ? `
                          <div style="display:flex;gap:8px;margin-top:4px;">
                            <button class="comment-edit" data-id="${c.id}" style="font-size:10px;color:var(--primary);background:none;border:none;padding:0;cursor:pointer;">Chỉnh sửa</button>
                            <button class="comment-delete" data-id="${c.id}" style="font-size:10px;color:var(--danger);background:none;border:none;padding:0;cursor:pointer;">Xóa</button>
                          </div>
                        ` : ''}
                      </div>
                    </div>
                  `;
    }).join('') || '<div style="font-size:var(--fs-xs);color:var(--text-disabled);text-align:center;padding:12px;">Chưa có bình luận nào.</div>'}
              </div>

              <div style="display:flex;gap:8px;">
                ${renderAvatar(currentUser, 'avatar-sm', false)}
                <input class="form-control" id="task-new-comment" placeholder="Viết bình luận..." style="flex:1;font-size:var(--fs-xs);" />
                <button class="btn btn-primary btn-sm" id="task-post-comment" style="padding:0 12px;"><i data-lucide="send" class="lucide-sm"></i></button>
              </div>
            </div>
    ` : '';

    let defaultDeadline = task?.deadline || '';
    if (!defaultDeadline) {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      const coeff = 1000 * 60 * 10;
      const rounded = new Date(Math.ceil(d.getTime() / coeff) * coeff);
      const pad = n => n.toString().padStart(2, '0');
      defaultDeadline = `${rounded.getFullYear()}-${pad(rounded.getMonth() + 1)}-${pad(rounded.getDate())}T${pad(rounded.getHours())}:${pad(rounded.getMinutes())}`;
    }

    const initReviewerCanComplete = isAdmin() || initialReviewerId === currentUser?.id;
    const validProjects = projects.filter(p => {
      if (p.id === task?.projectId) return true;
      if (p.status !== 'running' && p.status !== undefined) return false;
      if (isAdmin()) return true;
      if (currentUser?.projectRoles?.[p.id]) return true;
      return false;
    });

    const disableField = !canEditAll && !isAssigneeOnly ? 'disabled style="opacity:0.6;pointer-events:none;"' : (isAssigneeOnly ? 'disabled style="opacity:0.6;pointer-events:none;"' : '');
    const taskCodeDisplay = task?.code ? `<span style="font-size:var(--fs-xs);color:var(--text-tertiary);font-family:monospace;background:var(--bg-app);padding:2px 8px;border-radius:var(--r-sm);">${task.code}</span>` : '';

    root.innerHTML = `
      <style>
        .modal-content {
          background: var(--bg-card);
          border-radius: var(--r-xl);
          width: 100%;
          max-width: 640px;
          box-shadow: var(--shadow-xl);
          animation: scaleIn 200ms ease;
          margin: 0 auto;
          overflow: visible;
          flex-shrink: 0;
          padding-bottom: env(safe-area-inset-bottom);
        }
        input[type="datetime-local"].form-control {
          min-width: 0 !important;
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
          background: var(--bg-badge);
          color: var(--text-primary);
          border-radius: var(--r-md);
          text-align: center;
          display: block;
          -webkit-appearance: none;
          appearance: none;
          padding: 8px 6px; /* Slightly less padding to gain space */
        }
        input[type="datetime-local"]::-webkit-datetime-edit-fields-wrapper {
            overflow: hidden;
        }
        .form-row > * {
            min-width: 0;
        }
        .form-control {
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
          -webkit-appearance: none;
          appearance: none;
        }
        .search-select-input {
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
          -webkit-appearance: none;
          appearance: none;
        }
        .task-bottom-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 16px;
        }
        .task-bottom-grid-status-tag {
          display: contents;
        }
        @media (max-width: 768px) {
          .task-bottom-grid {
            grid-template-columns: 1fr;
            margin-bottom: 16px;
          }
          .task-bottom-grid-status-tag {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }
        }
      </style>
      <div class="modal-overlay" id="task-modal-overlay" style="${getModalOverlayStyle()}">
        <div class="modal-content" style="max-width:640px;">
          <div class="modal-header">
            <div style="display:flex;align-items:center;gap:8px;">
              <h2>${isViewMode ? 'Thông tin Task' : (editing ? 'Cập nhật Task' : 'Tạo Task mới')}</h2>
              ${!isViewMode && !editing ? `<button class="btn-icon btn-ghost sm" id="voice-input-btn" title="Dùng giọng nói tạo nhanh bằng AI" style="color:var(--primary);"><i data-lucide="mic" class="lucide-sm"></i></button>` : ''}
              ${taskCodeDisplay}
              ${editing ? `<button class="btn-icon btn-ghost sm" id="copy-task-link" title="Copy Link"><i data-lucide="link" class="lucide-sm"></i></button>` : ''}
            </div>
            <div style="display:flex;align-items:center;gap:4px;">
              ${isViewMode && (canEditAll || isAssigneeOnly) ? `<button class="btn-icon btn-ghost sm" id="task-edit-btn" title="Chỉnh sửa"><i data-lucide="edit-3" class="lucide-sm"></i></button>` : ''}
              <button class="btn-icon btn-ghost" id="task-modal-close" style="outline:none;border:none;box-shadow:none;"><i data-lucide="x"></i></button>
            </div>
          </div>
          <div class="modal-body">
            
            ${isViewMode ? `
            <!-- View Only Layout -->
            <div style="display:flex;flex-direction:column;">
              <style>
                @media (max-width: 600px) {
                  .view-proj-name { display: none; }
                  .view-proj-section { flex: 0 0 auto !important; min-width: 44px !important; }
                }
                .res-name-wrap { container-type: inline-size; width: 100%; min-width: 0; }
                .res-name .res-full { display: inline; }
                .res-name .res-last2, .res-name .res-abbr, .res-name .res-last { display: none; }
                
                @container (max-width: 180px) {
                  .res-name-wrap .res-full { display: none; }
                  .res-name-wrap .res-last2 { display: inline; }
                }
                @container (max-width: 110px) {
                  .res-name-wrap .res-last2 { display: none; }
                  .res-name-wrap .res-abbr { display: inline; }
                }
                @container (max-width: 60px) {
                  .res-name-wrap .res-abbr { display: none; }
                  .res-name-wrap .res-last { display: inline; }
                }
              </style>
              <!-- Row 1: Title & Description -->
              <div class="view-section" style="border-left: 4px solid var(--primary); padding: 12px 16px; margin-bottom: 8px;">
                <div class="view-value" style="font-size:18px;font-weight:700;letter-spacing:-0.02em;line-height:1.2;margin:0;">${escapeHtml(task?.title || '')}</div>
                ${task?.description ? `
                  <div style="margin-top:6px; font-size:13px; color:var(--text-secondary); line-height:1.5; white-space:pre-wrap; opacity:0.9; word-break: break-word; overflow-wrap: anywhere;">${escapeHtml(task.description).replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" style="color:var(--primary);text-decoration:underline; word-break: break-all;">$1</a>')}</div>
                ` : ''}
              </div>

              <!-- Row 2: Status, Priority, AI (Moved up) -->
              <div style="display:block; margin-bottom: 8px;">
                 <div class="view-section" style="display:flex; align-items:center; gap:0; min-height:36px; padding:0; width:100%; border-radius:var(--r-md); overflow:hidden;">
                    <div style="flex:1; display:flex; align-items:center; justify-content:center; padding:4px 2px; border-right:1px solid var(--border-light); min-width:0;">
                      ${isAssigneeOnly
          ? statusSelectHTML('task-status', task?.status || 'incomplete', isAdmin() || task?.reviewerId === currentUser?.id)
          : `<div class="view-value" style="font-weight:600; font-size:10px; display:inline-flex; align-items:center; gap:3px; margin:0; padding:3px 8px; border-radius:var(--r-full); background:${task?.status === 'complete' ? 'var(--success-bg)' : task?.status === 'pending_approval' ? 'var(--warning-bg)' : 'var(--info-bg)'}; color:${task?.status === 'complete' ? 'var(--success)' : task?.status === 'pending_approval' ? 'var(--warning-text)' : 'var(--info-text)'}; border:1px solid transparent; white-space:nowrap;">
              <i data-lucide="${task?.status === 'complete' ? 'check-circle' : task?.status === 'pending_approval' ? 'clock' : 'play-circle'}" style="width:10px;height:10px;"></i>
              ${task?.status === 'complete' ? 'Hoàn thành' : task?.status === 'pending_approval' ? 'Chờ duyệt' : 'Đang làm'}
             </div>`
        }
                    </div>
                    
                    <div style="flex:1; display:flex; align-items:center; justify-content:center; padding:4px 2px; border-right:1px solid var(--border-light); min-width:0;">
                      <div class="view-value" style="font-weight:600; font-size:10px; display:inline-flex; align-items:center; gap:3px; margin:0; padding:3px 8px; border-radius:var(--r-full); background:${task?.priority === 'high' ? 'var(--danger-bg)' : 'transparent'}; color:${task?.priority === 'high' ? 'var(--danger)' : 'var(--text-secondary)'}; border:1px solid ${task?.priority === 'high' ? 'transparent' : 'var(--border)'}; white-space:nowrap;">
                        ${task?.priority === 'high' ? '<i data-lucide="alert-triangle" style="width:10px;height:10px;"></i> Ưu tiên' : '<i data-lucide="flag" style="width:10px;height:10px;"></i> Thường'}
                      </div>
                    </div>
                    
                    <div style="flex:1; display:flex; align-items:center; justify-content:center; padding:4px 2px; min-width:0;">
                      <button id="task-ai-toggle-btn" class="view-value" style="font-family:inherit; cursor:${canEditLinksInView ? 'pointer' : 'default'}; border:none; outline:none; font-weight:600; font-size:10px; display:inline-flex; align-items:center; gap:3px; justify-content:center; margin:0; padding:3px 8px; border-radius:var(--r-full); background:${task?.usesAI ? 'var(--primary-bg)' : 'transparent'}; color:${task?.usesAI ? 'var(--primary)' : 'var(--text-secondary)'}; transition:all 0.2s; border:1px solid ${task?.usesAI ? 'transparent' : 'var(--border)'}; white-space:nowrap;" ${!canEditLinksInView ? 'disabled' : ''} ${canEditLinksInView ? 'title="Nhấn để bật/tắt AI"' : ''}>
                        ${task?.usesAI ? '<i data-lucide="bot" style="width:10px;height:10px;"></i> Có AI' : '<i data-lucide="x-circle" style="width:10px;height:10px;"></i> Không AI'}
                      </button>
                    </div>
                 </div>
              </div>

              <!-- Row 3: Project & Deadline -->
              <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom: 8px;">
                <div class="view-section view-proj-section" style="padding:6px 12px; display:flex; align-items:center; gap:8px; flex:1; min-width:140px;">
                  ${(() => {
          const pLogo = renderProjectAvatar(projects.find(p => p.id === task?.projectId), 'avatar-xs');
          return pLogo ? pLogo : `<div style="width:20px;height:20px;border-radius:4px;background:var(--primary-bg);display:flex;align-items:center;justify-content:center;"><i data-lucide="folder" style="width:10px;height:10px;color:var(--primary);"></i></div>`;
        })()}
                  <span class="view-proj-name" style="font-weight:700; font-size:13px; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(projects.find(p => p.id === task?.projectId)?.name || 'Project Team')}</span>
                </div>
                <div class="view-section" style="padding:6px 12px; display:flex; align-items:center; gap:8px; flex:1; min-width:140px;">
                  <div class="view-label" style="margin:0; font-size:9px; white-space:nowrap;">DEADLINE</div>
                  <div class="view-value" style="font-weight:700; font-size:13px; margin:0; white-space:nowrap; ${task?.deadline && new Date(task.deadline) < new Date() ? 'color:var(--danger);' : ''}">${task?.deadline ? (() => {
          const d = new Date(task.deadline);
          return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' &nbsp;&bull;&nbsp; ' + d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        })() : 'Không có'}</div>
                </div>
              </div>

              <!-- Row 4: Responsibility Chain -->
              <div class="view-section" style="margin-bottom: 8px; padding:8px 12px;">
                <div class="view-label" style="margin-bottom:4px; font-size:9px;"><i data-lucide="users" style="width:11px;height:11px;"></i> CHUỖI TRÁCH NHIỆM</div>
                <div style="display:flex; align-items:center; width:100%; gap:4px;">
                  ${(() => {
          const creatorId = task?.createdBy || task?.assignerId || currentUser?.id;
          const reviewerId = task?.reviewerId || creatorId;
          const assigneeId = task?.assigneeId;
          const c = members.find(m => m.id === creatorId) || currentUser;
          const r = members.find(m => m.id === reviewerId);
          const a = members.find(m => m.id === assigneeId);

          const roles = [];
          if (r) roles.push({ user: r, type: 'reviewer' });
          if (c && c.id !== r?.id) roles.push({ user: c, type: 'creator' });
          if (a) roles.push({ user: a, type: 'assignee' });

          return roles.map((role, idx) => {
            const isLast = idx === roles.length - 1;
            const u = role.user;
            return `
              <div class="res-name-wrap" style="flex:1; display:flex; align-items:center; justify-content:center; gap:6px; min-width:0;">
                <div style="position:relative; display:inline-flex; flex-shrink:0;">
                  ${renderAvatar(u, 'avatar-xs', false)}
                  ${role.type === 'reviewer' ? '<i data-lucide="check-circle" style="position:absolute;bottom:-2px;right:-2px;width:10px;height:10px;color:var(--warning);background:var(--bg-app);border-radius:50%;"></i>' : ''}
                </div>
                <span style="font-weight:600; font-size:12px; white-space:nowrap; min-width:0; overflow:hidden;">${getResponsiveName(u.fullName)}</span>
                ${!isLast ? `<i data-lucide="arrow-right" style="width:12px;height:12px;color:var(--text-tertiary);margin-left:auto;flex-shrink:0;"></i>` : ''}
              </div>
            `;
          }).join('');
        })()}
                </div>
              </div>

              <!-- Row 5: Links -->
              ${canEditLinksInView ? `
              <div class="view-section">
                <div class="view-label"><i data-lucide="link" style="width:14px;height:14px;"></i> Link Report / Sản phẩm / Kết quả</div>
                <div id="task-links-list" style="display:flex;flex-direction:column;gap:8px;margin-top:10px;">
                  ${(task?.links || (task?.fileLink ? [{ label: 'File', url: task.fileLink }] : [])).map((l, i) => `
                    <div style="display:flex;gap:6px;align-items:center;">
                      <input class="form-control lk-label" value="${escapeHtml(l.label)}" placeholder="Tên" style="width:100px;font-size:var(--fs-xs);padding:6px 8px;" />
                      <input class="form-control lk-url" value="${escapeHtml(l.url)}" placeholder="URL" style="flex:1;font-size:var(--fs-xs);padding:6px 8px;" />
                      ${l.url ? `<a href="${escapeHtml(l.url.startsWith('http') ? l.url : 'http://' + l.url)}" target="_blank" class="btn-icon btn-ghost sm lk-open" title="Mở link" style="color:var(--primary);"><i data-lucide="external-link"></i></a>` : ''}
                      <button class="btn-icon btn-ghost sm lk-del" title="Xóa" style="color:var(--danger);"><i data-lucide="x"></i></button>
                    </div>
                  `).join('')}
                </div>
                <button class="btn btn-sm btn-outline" id="task-add-lk" style="margin-top:12px;width:100%;"><i data-lucide="plus"></i> Thêm link report</button>
              </div>
              ` : ((task?.links && task.links.length > 0) || task?.fileLink ? `
              <div class="view-section" style="margin-bottom: 0;">
                <div class="view-label" style="font-size:9px; color:var(--text-tertiary); margin-bottom:8px;"><i data-lucide="link" style="width:11px;height:11px;"></i> TÀI LIỆU / SẢN PHẨM</div>
                <div style="display:flex; flex-wrap:wrap; gap:8px;">
                  ${(task?.links || (task?.fileLink ? [{ label: 'File', url: task.fileLink }] : [])).map(l => `
                    <a href="${escapeHtml(l.url)}" target="_blank" style="display:inline-flex; align-items:center; gap:6px; font-size:12px; color:var(--primary); text-decoration:none; padding:6px 14px; background:var(--primary)10; border-radius:100px; border:1px solid var(--primary)20; transition:all 0.2s;" class="link-item-hover">
                      <i data-lucide="external-link" style="width:12px; height:12px;"></i>
                      <span style="font-weight:700;">${escapeHtml(l.label)}</span>
                    </a>
                  `).join('')}
                </div>
              </div>
              ` : '')}
            </div>
            ` : `
            <!-- Form Edit Layout -->
            <div class="form-group">
              <label>Tên task *</label>
              <input class="form-control" id="task-title" value="${escapeHtml(task?.title || '')}" placeholder="Nhập tên task..." ${isAssigneeOnly ? 'disabled style="opacity:0.6;"' : ''} />
            </div>
            <div class="form-group">
              <label>Mô tả</label>
              <textarea class="form-control" id="task-desc" placeholder="Mô tả chi tiết..." style="resize:none; overflow:hidden; min-height:80px; ${isAssigneeOnly ? 'opacity:0.6;' : ''}" ${isAssigneeOnly ? 'disabled' : ''}>${escapeHtml(task?.description || '')}</textarea>
            </div>
            <div class="form-group">
                <label>Dự án *</label>
                ${projectSelectHTML('task-project', validProjects, task?.projectId || defaultProjectId, 'Chọn dự án', isAssigneeOnly)}
            </div>
            <div class="form-row" style="grid-template-columns: 1fr 1fr; margin-bottom: 12px; gap: 12px;">
              <div class="form-group" style="margin-bottom:0; display:flex; align-items:center; justify-content:space-between; background:var(--bg-app); padding:8px 12px; border-radius:var(--r-md); border:1px solid var(--border-light);">
                <label style="display:flex;align-items:center;gap:6px;margin:0;"><i data-lucide="flag" class="lucide-sm" style="color:var(--danger);"></i> Ưu tiên</label>
                <div class="toggle ${task?.priority === 'high' ? 'active' : ''}" id="flag-toggle"></div>
              </div>
              <div class="form-group" style="margin-bottom:0; display:flex; align-items:center; justify-content:space-between; background:var(--bg-app); padding:8px 12px; border-radius:var(--r-md); border:1px solid var(--border-light);">
                <label style="display:flex;align-items:center;gap:6px;margin:0;"><i data-lucide="bot" class="lucide-sm" style="color:var(--primary);"></i> Có AI</label>
                <div class="toggle ${task?.usesAI ? 'active' : ''}" id="ai-toggle"></div>
              </div>
            </div>
            <div class="form-row" style="grid-template-columns: repeat(3, 1fr); gap:12px;">
              <div class="form-group" style="padding-bottom:12px;">
                <label>Người giao</label>
                <div style="font-size:var(--fs-xs);padding:8px 12px;background:var(--bg-app);border-radius:var(--r-md);border:1.5px solid var(--border);color:var(--text-secondary);display:flex;align-items:center;height:40px;box-sizing:border-box;gap:6px;">
                  ${(() => {
        const creatorId = task?.createdBy || task?.assignerId || currentUser?.id;
        const c = members.find(m => m.id === creatorId) || currentUser;
        return (c ? renderAvatar(c, 'avatar-xs', false) : '') + `<span>${escapeHtml(c?.shortName || c?.fullName || 'Hệ thống')}</span>`;
      })()}
                </div>
              </div>
              <div class="form-group" style="padding-bottom:12px;">
                <label>Người duyệt *</label>
                ${searchSelectHTML('task-reviewer', initialAssignees, initialReviewerId, initialProjectId ? 'Chọn người duyệt' : 'Chọn dự án trước', !initialProjectId || disableField !== '', { valField: 'shortName' })}
              </div>
              <div class="form-group flex-1">
                <label>Người làm</label>
                ${searchSelectHTML('task-assignee', initialAssignees, task?.assigneeId, initialProjectId ? 'Tìm người...' : 'Chọn dự án trước', !initialProjectId || isAssigneeOnly, { valField: 'shortName' })}
              </div>
            </div>
            <div class="task-bottom-grid">
              <div class="form-group" style="margin-bottom:0;">
                <label>Deadline</label>
                <input class="form-control" type="datetime-local" id="task-deadline" value="${defaultDeadline}" step="600" ${isAssigneeOnly ? 'disabled style="opacity:0.6;"' : ''} />
              </div>
              <div class="task-bottom-grid-status-tag">
                <div class="form-group" style="margin-bottom:0;" id="status-group-container">
                  <label>Trạng thái</label>
                  ${statusSelectHTML('task-status', task?.status || 'incomplete', initReviewerCanComplete)}
                </div>
                <div class="form-group" style="margin-bottom:0;">
                  <label>Tag *</label>
                  ${tagSelectHTML('task-tag', tags, (task?.tags || [])[0], 'Chọn tag...', isAssigneeOnly)}
                </div>
              </div>
            </div>
            <div class="form-group" style="margin-bottom:16px;">
              <label>Link Report/ Sản phẩm/ Kết quả</label>
              <div id="task-links-list" style="display:flex;flex-direction:column;gap:6px;">
                ${(task?.links || (task?.fileLink ? [{ label: 'File', url: task.fileLink }] : [])).map((l, i) => `
                  <div style="display:flex;gap:6px;align-items:center;">
                    <input class="form-control lk-label" value="${escapeHtml(l.label)}" placeholder="Tên link" style="width:120px;font-size:var(--fs-xs);padding:6px 8px;" />
                    <input class="form-control lk-url" value="${escapeHtml(l.url)}" placeholder="URL" style="flex:1;font-size:var(--fs-xs);padding:6px 8px;" />
                    ${l.url ? `<a href="${escapeHtml(l.url.startsWith('http') ? l.url : 'http://' + l.url)}" target="_blank" class="btn-icon btn-ghost sm lk-open" title="Mở link" style="color:var(--primary);"><i data-lucide="external-link"></i></a>` : ''}
                    <button class="btn-icon btn-ghost sm lk-del" title="Xóa" style="color:var(--danger);"><i data-lucide="x"></i></button>
                  </div>
                `).join('')}
              </div>
              <button class="btn btn-sm" id="task-add-lk" style="margin-top:6px;"><i data-lucide="plus"></i> Thêm link</button>
            </div>
            `}

            <!-- Comments Section -->
            ${commentsHtml}

          </div >
      <div class="modal-footer" style="padding: 12px 16px; border-top: 1px solid var(--border-light); gap: 8px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; background: var(--bg-card); border-radius: 0 0 var(--r-xl) var(--r-xl); min-height:60px;">
        <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;">
          ${canDelete ? `<button class="btn-icon btn-ghost" id="task-delete" title="Xóa" style="color:var(--danger); width:32px; height:32px; padding:0;"><i data-lucide="trash-2" style="width:16px; height:16px;"></i></button>` : ''}
          ${isViewMode ? `<button class="btn-icon btn-ghost" id="task-duplicate-btn" title="Nhân bản" style="color:var(--text-secondary); width:32px; height:32px; padding:0;"><i data-lucide="copy" style="width:16px; height:16px;"></i></button>` : ''}
        </div>
        <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;">
          ${isViewMode && task?.status === 'incomplete' && (canEditAll || task?.assigneeId === currentUser?.id) ? `
            <button class="btn btn-primary" id="task-report-done" style="height:32px; padding: 0 16px; border-radius: var(--r-md); font-weight: 700; font-size: 11px; background:var(--primary); box-shadow:none; border:none; letter-spacing:0.02em; flex-shrink:0;">
              <i data-lucide="send" style="width:14px; height:14px;"></i> BÁO CÁO XONG
            </button>
          ` : ''}
          ${isViewMode && task?.status === 'pending_approval' && (canEditAll || task?.reviewerId === currentUser?.id || task?.createdBy === currentUser?.id) ? `
            <button class="btn btn-outline" id="task-reject" style="height:32px; padding: 0 16px; border-radius: var(--r-md); font-weight: 700; font-size: 11px; color:var(--danger); border:none; background:var(--danger-bg); letter-spacing:0.02em; flex-shrink:0;">
              <i data-lucide="x-circle" style="width:14px; height:14px;"></i> TỪ CHỐI
            </button>
            <button class="btn btn-primary" id="task-approve" style="height:32px; padding: 0 16px; border-radius: var(--r-md); font-weight: 700; font-size: 11px; background:var(--primary); box-shadow:none; border:none; letter-spacing:0.02em; flex-shrink:0;">
              <i data-lucide="check-circle" style="width:14px; height:14px;"></i> PHÊ DUYỆT
            </button>
          ` : ''}
          ${!isViewMode ? `
            <button class="btn btn-primary" id="task-save" style="height:32px; padding: 0 16px; border-radius: var(--r-md); font-weight: 700; font-size: 11px; box-shadow: 0 4px 12px var(--primary)40; letter-spacing:0.02em; flex-shrink:0;">
              <i data-lucide="${editing ? 'cloud-upload' : 'plus-circle'}" style="width:14px; height:14px;"></i>
              ${editing ? 'CẬP NHẬT' : 'TẠO TASK'}
            </button>
          ` : ''}
        </div>
      </div>
        </div >
      </div >
      `;

    initLucide();

    const descInput = root.querySelector('#task-desc');
    if (descInput) {
      const adjustHeight = () => {
        descInput.style.height = 'auto';
        descInput.style.height = descInput.scrollHeight + 'px';
      };
      descInput.addEventListener('input', adjustHeight);
      setTimeout(adjustHeight, 0); // adjust initially
    }

    root.querySelector('#task-edit-btn')?.addEventListener('click', () => {
      showTaskModal(task, defaultProjectId, true, resolve);
    });

    root.querySelector('#task-ai-toggle-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (canEditLinksInView && task && task.id) {
        updateTask(task.id, { usesAI: !task.usesAI });
        finalizeAndReload();
      }
    });

    root.querySelector('#task-duplicate-btn')?.addEventListener('click', () => {
      const duplicatedTask = {
        ...task,
        title: task.title + ' (Bản sao)',
        id: undefined,
        code: undefined,
        createdAt: undefined,
        createdBy: currentUser.id,
        reviewerId: currentUser.id,
        assignerId: currentUser.id,
        status: 'incomplete',
        comments: [],
        links: []
      };
      root.innerHTML = '';
      showTaskModal(duplicatedTask, task.projectId, false, resolve);
    });

    const updateDropdown = (projectId, dropdownId, inputId) => {
      const dd = root.querySelector('#' + dropdownId);
      const input = root.querySelector('#' + inputId);
      if (!dd || !input) return;

      const filtered = members.filter(m => m.projectRoles && m.projectRoles[projectId]);

      dd.innerHTML = filtered.map(m => `
          <div class="search-select-item ${m.id === input.dataset.value ? 'selected' : ''}" data-value="${m.id}">
            ${renderAvatar(m, 'avatar-sm', false)}
            <span>${escapeHtml(isMobile ? m.shortName : (m.shortName || m.fullName))}</span>
          </div>
        `).join('');

      // If current value is no longer in the list, clear it
      if (input.dataset.value && !filtered.find(m => m.id === input.dataset.value)) {
        input.value = '';
        input.dataset.value = '';
        const preview = input.parentElement.querySelector('.search-select-preview');
        if (preview) preview.remove();
        input.style.paddingLeft = '';
      }

      // Enable/placeholder update
      if (projectId) {
        const isReallyDisabled = (inputId === 'task-assignee' && isAssigneeOnly) || (disableField !== '' && inputId === 'task-reviewer');
        input.disabled = isReallyDisabled;
        const wrap = root.querySelector('#' + inputId + '-wrap');
        if (!isReallyDisabled) {
          input.style.opacity = '';
          input.style.pointerEvents = '';
          input.style.background = '';
          if (wrap) {
            wrap.classList.remove('disabled');
            wrap.style.cursor = '';
            wrap.style.opacity = '';
          }
          input.placeholder = inputId === 'task-reviewer' ? 'Chọn người duyệt' : 'Tìm người...';
        } else {
          // Forced disabled
          input.style.opacity = '0.6';
          input.style.pointerEvents = 'none';
          input.style.background = 'var(--bg-frozen)';
          if (wrap) {
            wrap.classList.add('disabled');
            wrap.style.cursor = 'not-allowed';
            wrap.style.opacity = '0.6';
          }
        }
      } else {
        // No project
        input.disabled = true;
        input.style.opacity = '0.6';
        input.style.pointerEvents = 'none';
        input.style.background = 'var(--bg-frozen)';
        input.placeholder = 'Chọn dự án trước';
        const wrap = root.querySelector('#' + inputId + '-wrap');
        if (wrap) {
          wrap.classList.add('disabled');
          wrap.style.cursor = 'not-allowed';
          wrap.style.opacity = '0.8';
        }
      }

      if (input.dataset.value && input._updatePreview) {
        const item = dd.querySelector(`.search-select-item[data-value="${input.dataset.value}"]`);
        if (item) input._updatePreview(item);
      }
    };

    const updateAssigneeDropdown = (projectId) => {
      updateDropdown(projectId, 'task-assignee-dd', 'task-assignee');
      updateDropdown(projectId, 'task-reviewer-dd', 'task-reviewer');
    };

    bindSearchSelect('task-assignee');
    bindSearchSelect('task-reviewer', (newReviewerId) => {
      const statusGroup = root.querySelector('#status-group-container');
      if (!statusGroup) return; // if in view mode
      const canCompleteNow = isAdmin() || newReviewerId === currentUser?.id;
      const currentStatusInput = root.querySelector('#task-status');
      let currentStatus = currentStatusInput ? currentStatusInput.dataset.value : (task?.status || 'incomplete');

      // If complete was selected but now they cannot complete, switch to pending_approval
      if (!canCompleteNow && currentStatus === 'complete') {
        currentStatus = 'pending_approval';
      }

      statusGroup.innerHTML = `
        <label>Trạng thái</label>
        ${statusSelectHTML('task-status', currentStatus, canCompleteNow)}
      `;
      bindSearchSelect('task-status');
    });
    bindSearchSelect('task-tag');
    bindSearchSelect('task-project', (pid) => {
      updateAssigneeDropdown(pid);
    });
    bindSearchSelect('task-status');

    if (task?.projectId || defaultProjectId) {
      updateAssigneeDropdown(task?.projectId || defaultProjectId);
    }

    // Voice input (Web Speech API)
    const voiceBtn = root.querySelector('#voice-input-btn');
    const voiceStatus = root.querySelector('#voice-status');
    if (voiceBtn && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      let recognizing = false;
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'vi-VN';
      recognition.interimResults = true;
      recognition.continuous = true;

      let finalTranscript = '';

      voiceBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (recognizing) {
          try { recognition.stop(); } catch (err) { }
          return;
        }
        try {
          finalTranscript = '';
          recognition.start();
          recognizing = true;
          voiceBtn.innerHTML = '<i data-lucide="mic-off" class="lucide-sm"></i> <span id="voice-status">Đang nghe...</span>';
          voiceBtn.style.background = 'var(--danger)';
          voiceBtn.style.color = 'white';
          initLucide();
        } catch (err) {
          console.error("Lỗi khởi tạo giọng nói:", err);
        }
      });

      recognition.onresult = (e) => {
        let interimTranscript = '';
        for (let i = e.resultIndex; i < e.results.length; ++i) {
          if (e.results[i].isFinal) finalTranscript += e.results[i][0].transcript + ' ';
          else interimTranscript += e.results[i][0].transcript;
        }

        const textToParse = (finalTranscript + interimTranscript).trim();
        if (textToParse) {
          let titlePart = '';
          const titleMatch = textToParse.match(/^(.*?)(?:\s+(?:cho\s+dự\s+án|deadline|hạn|giao\s+cho|vào\s+ngày|mô\s+tả|chi\s+tiết))/i);
          if (titleMatch && titleMatch[1].trim()) titlePart = titleMatch[1].trim();
          else titlePart = textToParse.split(' ').slice(0, 8).join(' ');

          titlePart = titlePart.charAt(0).toUpperCase() + titlePart.slice(1);
          const titleInput = root.querySelector('#task-title');
          if (titleInput && !isViewMode) titleInput.value = titlePart;
          const descInput = root.querySelector('#task-desc');
          if (descInput && !isViewMode) descInput.value = textToParse;

          const lowerText = textToParse.toLowerCase();
          const dlInput = root.querySelector('#task-deadline');
          if (dlInput && !isViewMode) {
            const today = new Date();
            let d = null;
            if (lowerText.match(/ngày mai/)) { d = new Date(today); d.setDate(today.getDate() + 1); }
            else if (lowerText.match(/ngày kia|mốt/)) { d = new Date(today); d.setDate(today.getDate() + 2); }
            if (d) {
              const pad = n => n.toString().padStart(2, '0');
              dlInput.value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T17:00`;
            }
          }
        }
      };

      recognition.onend = () => {
        recognizing = false;
        voiceBtn.innerHTML = '<i data-lucide="mic" class="lucide-sm"></i> <span id="voice-status">✅ Xong — Kiểm tra lại thông tin</span>';
        voiceBtn.style.background = ''; voiceBtn.style.color = '';
        initLucide();
        setTimeout(() => {
          if (root.querySelector('#voice-input-btn')) {
            voiceBtn.innerHTML = '<i data-lucide="mic" class="lucide-sm"></i> <span id="voice-status">Dùng giọng nói tạo Task nhanh bằng AI</span>';
            initLucide();
          }
        }, 3000);
      };

      recognition.onerror = () => {
        recognizing = false;
        voiceBtn.innerHTML = '<i data-lucide="mic" class="lucide-sm"></i> <span id="voice-status">Lỗi nhận diện. Thử lại?</span>';
        voiceBtn.style.background = ''; voiceBtn.style.color = '';
        initLucide();
      };
    }

    // Post comment immediate handler
    root.querySelector('#task-post-comment')?.addEventListener('click', () => {
      const input = root.querySelector('#task-new-comment');
      const text = input.value.trim();
      if (!text) return;
      if (text) {
        if (!task.comments) task.comments = [];
        task.comments.push({ id: generateId(), userId: currentUser.id, text, createdAt: new Date().toISOString() });
        updateTask(task.id, { comments: task.comments });
        // Notify assignees & stakeholders
        const involvedIds = new Set([task.assigneeId, task.reviewerId, task.createdBy, task.assignerId].filter(id => id && id !== currentUser.id));
        involvedIds.forEach(id => {
          createNotification({
            id: generateId(),
            userId: id,
            title: 'Bình luận mới',
            content: `${currentUser.fullName} đã bình luận trong task "${task.title}"`,
            type: 'task',
            linkId: task.id,
            isRead: false
          });
        });
        showTaskModal(JSON.parse(JSON.stringify(task)), defaultProjectId, forceEdit, resolve);
      }
    });
    root.querySelector('#task-new-comment')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') root.querySelector('#task-post-comment').click();
    });

    root.querySelectorAll('.comment-edit').forEach(btn => btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const c = task.comments.find(x => x.id === id);
      const text = await customPrompt('Sửa bình luận:', c.text, 'Sửa bình luận');
      if (text !== null && text.trim()) {
        const nc = task.comments.map(x => x.id === id ? { ...x, text: text.trim() } : x);
        const data = !isViewMode ? getModalData() : {};
        updateTask(task.id, { comments: nc, ...data });
        finalizeAndReload();
      }
    }));

    root.querySelectorAll('.comment-delete').forEach(btn => btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      if (await customConfirm('Xóa bình luận này?', 'Xác nhận xóa', true)) {
        const nc = task.comments.filter(x => x.id !== id);
        const data = !isViewMode ? getModalData() : {};
        updateTask(task.id, { comments: nc, ...data });
        finalizeAndReload();
      }
    }));

    const getModalData = () => {
      const tagEl = root.querySelector('#task-tag');
      const statusEl = root.querySelector('#task-status');
      const projEl = root.querySelector('#task-project');
      const titleEl = root.querySelector('#task-title');
      const descEl = root.querySelector('#task-desc');
      const assigneeEl = root.querySelector('#task-assignee');
      const reviewerEl = root.querySelector('#task-reviewer');
      const deadlineEl = root.querySelector('#task-deadline');

      const selectedTag = tagEl?.dataset?.value;
      const status = statusEl?.dataset?.value || task?.status;
      const links = [...root.querySelectorAll('#task-links-list > div')].map(d => {
        const lInp = d.querySelector('.lk-label');
        const uInp = d.querySelector('.lk-url');
        return uInp ? {
          label: lInp?.value?.trim() || 'Link',
          url: uInp?.value?.trim()
        } : null;
      }).filter(l => l && l.url);

      // For assignee-only mode, only return permitted fields
      if (isAssigneeOnly) {
        return {
          usesAI: isAIToggled,
          status,
          links,
          fileLink: links.length ? links[0].url : (task?.fileLink || ''),
        };
      }

      // If in view mode and not Edit/Assignee mode, don't try to harvest non-existent form fields
      if (isViewMode && !isAssigneeOnly) {
        if (canEditLinksInView) {
          return {
            links,
            fileLink: links.length ? links[0].url : (task?.fileLink || '')
          };
        }
        return {};
      }

      const data = {
        title: titleEl?.value?.trim() || task?.title || '',
        description: descEl?.value?.trim() || task?.description || '',
        projectId: projEl?.dataset?.value || task?.projectId,
        priority: isHighPriority ? 'high' : 'medium',
        usesAI: isAIToggled,
        assigneeId: assigneeEl?.dataset?.value || task?.assigneeId,
        reviewerId: reviewerEl ? reviewerEl.dataset.value : (task?.reviewerId || task?.createdBy || currentUser?.id),
        deadline: deadlineEl?.value || task?.deadline || '',
        status,
        links,
        fileLink: links.length ? links[0].url : (task?.fileLink || ''),
        tags: selectedTag ? [selectedTag] : (task?.tags || []),
      };
      if (status === 'complete' && !task?.approvedBy) data.approvedBy = currentUser?.id;
      return data;
    };

    // Link dynamic list handlers
    root.querySelector('#task-add-lk')?.addEventListener('click', () => {
      const div = document.createElement('div');
      div.style.cssText = 'display:flex;gap:6px;align-items:center;';
      div.innerHTML = `
          <input class="form-control lk-label" placeholder="Tên" style="width:100px;font-size:var(--fs-xs);padding:6px 8px;" />
          <input class="form-control lk-url" placeholder="URL" style="flex:1;font-size:var(--fs-xs);padding:6px 8px;" />
          <button class="btn-icon btn-ghost sm lk-del" title="Xóa" style="color:var(--danger);"><i data-lucide="x"></i></button>
        `;
      root.querySelector('#task-links-list')?.appendChild(div);
      initLucide();
    });

    root.querySelector('#task-links-list')?.addEventListener('click', (e) => {
      const btn = e.target.closest('.lk-del');
      if (btn) {
        btn.parentElement.remove();
        if (task && task.id) {
          // auto-save when not in create mode
          updateTask(task.id, getModalData());
        }
      }
    });

    root.querySelector('#task-links-list')?.addEventListener('change', (e) => {
      if (task && task.id) {
        // auto-save on blur/change in both view and edit modes
        updateTask(task.id, getModalData());
      }
    });

    // Flag toggle
    let isHighPriority = task?.priority === 'high';
    const flagToggle = root.querySelector('#flag-toggle');
    flagToggle?.addEventListener('click', () => {
      isHighPriority = !isHighPriority;
      flagToggle.classList.toggle('active', isHighPriority);
      const icon = flagToggle.closest('.form-group').querySelector('[data-lucide="flag"]');
      if (icon) icon.style.fill = isHighPriority ? 'var(--danger)' : 'none';
    });

    // AI toggle
    let isAIToggled = !!task?.usesAI;
    const aiToggle = root.querySelector('#ai-toggle');
    aiToggle?.addEventListener('click', () => {
      isAIToggled = !isAIToggled;
      aiToggle.classList.toggle('active', isAIToggled);
      const icon = aiToggle.closest('.form-group').querySelector('[data-lucide="bot"]');
      if (icon) icon.style.fill = isAIToggled ? 'var(--primary)' : 'none';
    });

    root.querySelector('#copy-task-link')?.addEventListener('click', () => {
      navigator.clipboard.writeText(getPublicUrl());
      const btn = root.querySelector('#copy-task-link');
      btn.innerHTML = '<i data-lucide="check" class="lucide-sm"></i>';
      initLucide();
      setTimeout(() => { btn.innerHTML = '<i data-lucide="link" class="lucide-sm"></i>'; initLucide(); }, 1500);
    });

    root.querySelector('#task-modal-close')?.addEventListener('click', () => finalize(false));
    root.querySelector('#task-cancel')?.addEventListener('click', () => finalize(false));
    root.querySelector('#task-modal-overlay')?.addEventListener('click', e => { if (e.target.id === 'task-modal-overlay') finalize(false); });
    root.querySelector('#task-delete')?.addEventListener('click', async () => { if (await customConfirm('Xóa task này?', 'Xác nhận xóa', true)) { deleteTask(task.id); finalize(true); } });

    root.querySelector('#task-save')?.addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      const data = getModalData();
      if (!isAssigneeOnly && (!data.title || !data.projectId || !data.assigneeId || !data.tags || data.tags.length === 0 || !data.tags[0])) { await customAlert('Vui lòng điền đầy đủ các trường bắt buộc bao gồm Tên task, Dự án, Người làm và Tag (*)', 'Thiếu thông tin'); return; }
      btn.innerHTML = '<i data-lucide="loader-2" style="animation: spin 1s linear infinite; width:14px; height:14px;"></i> ĐANG XỬ LÝ';
      btn.style.pointerEvents = 'none';
      btn.style.opacity = '0.7';
      initLucide();
      await new Promise(r => setTimeout(r, 600));

      if (editing) {
        updateTask(task.id, data);
      }
      else {
        // generateTaskId là async: query Supabase để lấy số lớn nhất hiện tại, tránh race condition.
        // Trả về code dạng 'AYG00022' và dùng luôn làm ID (giống Members: MEM001).
        const taskId = await generateTaskId(data.projectId);
        const newTask = { id: taskId, code: taskId, ...data, createdBy: currentUser?.id || '', createdAt: new Date().toISOString().split('T')[0], comments: [] };
        await addTask(newTask); // await để đảm bảo insert xong trước khi đóng modal
      }
      finalize(true);

    });

    root.querySelector('#task-approve')?.addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      if (await customConfirm('Phê duyệt task này?', 'Xác nhận')) {
        btn.innerHTML = '<i data-lucide="loader-2" style="animation: spin 1s linear infinite; width:14px; height:14px;"></i> ĐANG XỬ LÝ';
        btn.style.pointerEvents = 'none';
        btn.style.opacity = '0.7';
        initLucide();
        await new Promise(r => setTimeout(r, 600));

        updateTask(task.id, { status: 'complete', approvedBy: currentUser.id });
        finalize(true);
      }
    });

    root.querySelector('#task-report-done')?.addEventListener('click', async (e) => {
      const payload = getModalData();
      const hasLinks = payload.links && payload.links.length > 0;
      if (!hasLinks) {
        await customAlert('Vui lòng bổ sung ít nhất 1 Link Report/Sản phẩm trước khi báo cáo hoàn thành.', 'Thiếu thông tin');
        return;
      }

      const btn = e.currentTarget;
      if (await customConfirm('Báo cáo hoàn thành task này?', 'Xác nhận')) {
        btn.innerHTML = '<i data-lucide="loader-2" style="animation: spin 1s linear infinite; width:14px; height:14px;"></i> ĐANG XỬ LÝ';
        btn.style.pointerEvents = 'none';
        btn.style.opacity = '0.7';
        initLucide();
        await new Promise(r => setTimeout(r, 600));

        const newStatus = task.reviewerId ? 'pending_approval' : 'complete';
        updateTask(task.id, { ...payload, status: newStatus });
        finalize(true);
      }
    });

    root.querySelector('#task-reject')?.addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      const reason = await customPrompt('Nhập lý do từ chối (sẽ thêm vào bình luận):', '', 'Từ chối task');
      if (reason !== null) {
        btn.innerHTML = '<i data-lucide="loader-2" style="animation: spin 1s linear infinite; width:14px; height:14px;"></i> ĐANG XỬ LÝ';
        btn.style.pointerEvents = 'none';
        btn.style.opacity = '0.7';
        initLucide();
        await new Promise(r => setTimeout(r, 600));

        const comments = task.comments || [];
        if (reason.trim()) {
          comments.push({ id: generateId(), userId: currentUser.id, text: `Phản hồi từ người duyệt: ${reason}`, createdAt: new Date().toISOString() });
        }
        updateTask(task.id, { status: 'incomplete', comments });
        finalize(true);
      }
    });

    // Auto-scroll to bottom of comments
    const commentList = root.querySelector('#task-comments-list');
    if (commentList) commentList.scrollTop = commentList.scrollHeight;
  });
}
