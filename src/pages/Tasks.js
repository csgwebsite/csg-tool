import { getTasks, getProjects, getMembers, getTags, getCurrentUser, isAdmin, updateTask } from '../data/store.js';
import { escapeHtml, sortTasks, timeUntil, renderAvatar, renderProjectAvatar, initLucide } from '../utils/helpers.js';
import { showTaskModal } from '../components/TaskModal.js';
import { customPrompt } from '../components/CustomModal.js';

let activeFilter = 'all';
let showCompleted = true;
let showAllTasks = false;
let showEndedProjects = false;
let completedLimit = 10;
let taskSearchText = '';

export function renderTaskCard(t, projects, members, tags, user) {
  const proj = projects.find(p => p.id === t.projectId);
  const assignee = members.find(m => m.id === t.assigneeId);
  const creator = members.find(m => m.id === (t.createdBy || t.assignerId));
  const reviewer = t.reviewerId ? members.find(m => m.id === t.reviewerId) : creator;
  const tu = timeUntil(t.deadline); const overdue = tu.startsWith('Quá');
  const frozen = t.status === 'complete';
  const isPending = t.status === 'pending_approval';
  const tag = (t.tags || []).map(tid => tags.find(tg => tg.id === tid)).filter(Boolean)[0]; // 1 tag only
  const canApprove = isPending && (isAdmin() || reviewer?.id === user?.id);
  const isHigh = t.priority === 'high';

  return `
    <div class="task-card ${frozen ? 'frozen' : ''} ${isPending ? 'pending' : ''}" data-task-id="${t.id}" style="cursor:pointer;">
      <div style="display:flex;align-items:flex-start;gap:10px;">
        <div style="flex:1;min-width:0;" class="task-content" data-task-id="${t.id}">
          <div style="display:flex;align-items:center;gap:6px;justify-content:space-between;">
            <div style="display:flex;align-items:center;gap:6px;min-width:0;flex:1;">
              <div style="font-size:var(--fs-base);font-weight:500;">${escapeHtml(t.title)}</div>
            </div>
            ${isHigh ? `<i data-lucide="flag" style="width:13px;height:13px;color:var(--danger);fill:var(--danger);flex-shrink:0;"></i>` : ''}
          </div>
          ${t.description ? `<div style="font-size:var(--fs-2xs);color:var(--text-tertiary);margin-top:3px;line-height:1.4;" class="truncate">${escapeHtml(t.description)}</div>` : ''}
          ${tag ? `<div style="margin-top:6px;"><span class="tag-chip" style="background:${tag.color}15;color:${tag.color};">${escapeHtml(tag.name)}</span></div>` : ''}
        </div>
      </div>
      <!-- Actions Row for Status Changes -->
      <div style="display:flex;gap:6px;margin-top:10px;">
        ${!frozen && !isPending && (user?.id === t.assigneeId || user?.id === creator?.id || user?.id === reviewer?.id || isAdmin()) ?
      `<button class="btn btn-sm status-toggle" data-task-id="${t.id}" style="font-size:var(--fs-2xs);padding:4px 8px;background:var(--primary-bg);color:var(--primary);"><i data-lucide="send" class="lucide-sm"></i> Báo cáo xong</button>` : ''}
        ${canApprove ?
      `<button class="btn btn-sm btn-primary approve-btn" data-task-id="${t.id}" style="font-size:var(--fs-2xs);padding:4px 8px;"><i data-lucide="check" class="lucide-sm"></i> Duyệt</button>
           <button class="btn btn-sm btn-ghost reject-btn" data-task-id="${t.id}" style="font-size:var(--fs-2xs);padding:4px 8px;color:var(--danger);"><i data-lucide="x" class="lucide-sm"></i> Từ chối</button>` : ''}
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:10px;padding-top:8px;border-top:1px solid var(--border-light);">
        <!-- Assigner → Assignee avatars -->
        <div style="display:flex;align-items:center;gap:4px;">
          ${(() => {
      let html = '';
      const rHtml = reviewer ? `<div style="position:relative;display:inline-flex;">${renderAvatar(reviewer, 'avatar-xs', false)}<i data-lucide="check-circle" style="position:absolute;bottom:-2px;right:-2px;width:10px;height:10px;color:var(--warning);background:var(--bg-app);border-radius:50%;"></i></div>` : '';
      const cHtml = creator ? renderAvatar(creator, 'avatar-xs', false) : '';

      if (reviewer && creator && reviewer.id !== creator.id) {
        html += rHtml + `<div style="color:var(--text-tertiary);margin:0 2px;">|</div>` + cHtml;
      } else if (reviewer) {
        html += rHtml;
      } else if (creator) {
        html += cHtml;
      }

      if (assignee) {
        if (html) html += `<i data-lucide="arrow-right" style="width:10px;height:10px;color:var(--text-disabled);margin:0 2px;"></i>`;
        html += renderAvatar(assignee, 'avatar-xs', false);
      }
      return html;
    })()}
          ${proj ? `<span style="display:flex;align-items:center;gap:3px;font-size:var(--fs-2xs);color:var(--text-tertiary);margin-left:4px;"><span class="color-dot" style="background:${proj.color};"></span>${escapeHtml(proj.name)}</span>` : ''}
        </div>
        ${(t.deadline && !frozen) ? `<span style="font-size:var(--fs-2xs);${overdue ? 'color:var(--danger);font-weight:600;' : 'color:var(--text-tertiary);'} display:flex;align-items:center;gap:3px;"><i data-lucide="clock" class="lucide-sm"></i>${tu}</span>` : ''}
      </div>
    </div>`;
}

export function renderTasks() {
  const members = getMembers(), projects = getProjects();
  let tasks = getTasks();
  const user = getCurrentUser(); // Renamed from currentUser to user for consistency with existing code
  const tags = getTags(); // Moved here from original position

  // Read global filter passing from Projects page
  if (window.filterProjectId) {
    activeFilter = window.filterProjectId;
    window.filterProjectId = null;
    showEndedProjects = true; // Just in case it's an ended project
  }

  // Filter projects by user roles and status
  const isAdm = isAdmin();
  const visibleProjects = projects.filter(p => {
    const isMember = isAdm || (user?.projectRoles && user.projectRoles[p.id]);
    const matchesStatus = showEndedProjects ? true : p.status !== 'ended'; // Show ALL if toggled
    return isMember && matchesStatus;
  });

  let filtered = tasks;

  if (taskSearchText) {
    const q = taskSearchText.toLowerCase();
    filtered = filtered.filter(t =>
      (t.title && t.title.toLowerCase().includes(q)) ||
      (t.description && t.description.toLowerCase().includes(q)) ||
      (t.code && t.code.toLowerCase().includes(q))
    );
    // When searching, bypass other active filters (assignee, completed, ended projects)
    // to perform a database-wide search. Still restrict by project if a specific tab is active.
    if (activeFilter !== 'all') {
      filtered = filtered.filter(t => t.projectId === activeFilter);
    }
  } else {
    if (!showAllTasks) {
      if (activeFilter !== 'all') {
        filtered = filtered.filter(t => t.projectId === activeFilter);
      } else {
        // If "All Projects" but user is only looking at their tasks, still limit to visible projects
        filtered = filtered.filter(t => visibleProjects.some(vp => vp.id === t.projectId));
      }
    } else {
      // If showAllTasks is true, they can only see tasks from projects they are in
      filtered = filtered.filter(t => visibleProjects.some(vp => vp.id === t.projectId));
      if (activeFilter !== 'all') filtered = filtered.filter(t => t.projectId === activeFilter);
    }

    // Then apply task-level filters
    if (!showCompleted) filtered = filtered.filter(t => t.status !== 'complete');
    if (!showAllTasks) filtered = filtered.filter(t => t.assigneeId === user?.id || t.createdBy === user?.id || t.reviewerId === user?.id || t.assignerId === user?.id);
  }

  const incomplete = sortTasks(filtered.filter(t => t.status === 'incomplete'));
  const pending = sortTasks(filtered.filter(t => t.status === 'pending_approval'));
  const complete = filtered.filter(t => t.status === 'complete').sort((a, b) => {
    if (a.deadline && b.deadline) {
      const da = new Date(a.deadline), db = new Date(b.deadline);
      if (da.getTime() !== db.getTime()) return db - da; // Descending (latest past date first)
    } else if (a.deadline) return -1;
    else if (b.deadline) return 1;

    // Secondary: Priority
    const po = { high: 3, medium: 2, low: 1 };
    return (po[b.priority] || 0) - (po[a.priority] || 0);
  });
  const visibleComplete = complete.slice(0, completedLimit);
  const hasMoreComplete = complete.length > completedLimit;

  const renderCard = (t) => renderTaskCard(t, projects, members, tags, user);

  return `
    <div class="page-content slide-up">
      <div class="page-header">
        <div class="page-header-left">
          <div style="position:relative; width:100%; max-width:240px;">
            <input class="form-control search-box-mobile" id="task-search-input" placeholder="Tìm kiếm task..." value="${escapeHtml(taskSearchText)}" style="width:100%; border-radius:var(--r-full); padding-right:32px;" />
            ${taskSearchText ? `<button id="clear-task-search" style="position:absolute; right:10px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:var(--text-tertiary); display:flex; align-items:center; justify-content:center; padding:0;"><i data-lucide="x" style="width:14px;height:14px;"></i></button>` : ''}
          </div>
          <div class="filter-pills">
            <button class="filter-pill ${activeFilter === 'all' ? 'active' : ''}" data-filter="all">Tất cả</button>
            ${visibleProjects.map(p => `<button class="filter-pill ${activeFilter === p.id ? 'active' : ''}" data-filter="${p.id}"><span class="color-dot" style="background:${p.color};"></span>${escapeHtml(p.name)}</button>`).join('')}
          </div>
        </div>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
          <label class="toggle-wrap"><div class="toggle ${showCompleted ? 'active' : ''}" id="toggle-completed"></div>Hoàn thành</label>
          <label class="toggle-wrap"><div class="toggle ${showAllTasks ? 'active' : ''}" id="toggle-all"></div>Mọi người</label>
          <label class="toggle-wrap"><div class="toggle ${showEndedProjects ? 'active' : ''}" id="toggle-ended-proj"></div>Dự án đã kết thúc</label>
          <button class="btn btn-primary btn-sm" id="create-task-btn"><i data-lucide="plus"></i> Tạo</button>
        </div>
      </div>

      <!-- Kanban View -->
      <div class="kanban-wrap">
        ${pending.length > 0 ? `
        <div class="kanban-col">
          <div class="kanban-header">
            <h3><span style="width:6px;height:6px;border-radius:50%;background:var(--warning);display:inline-block;"></span> Chờ duyệt <span class="count">${pending.length}</span></h3>
          </div>
          <div class="kanban-list">${pending.map(renderCard).join('')}</div>
        </div>
        ` : ''}
        <div class="kanban-col">
          <div class="kanban-header">
            <h3><span style="width:6px;height:6px;border-radius:50%;background:var(--info);display:inline-block;"></span> Đang làm <span class="count">${incomplete.length}</span></h3>
          </div>
          <div class="kanban-list">${incomplete.map(renderCard).join('')}</div>
        </div>
        ${pending.length === 0 ? `
        <div class="kanban-col">
          <div class="kanban-header">
            <h3><span style="width:6px;height:6px;border-radius:50%;background:var(--warning);display:inline-block;"></span> Chờ duyệt <span class="count">${pending.length}</span></h3>
          </div>
          <div class="kanban-list">${pending.map(renderCard).join('')}</div>
        </div>
        ` : ''}
        ${showCompleted ? `
          <div class="kanban-col">
            <div class="kanban-header">
              <h3><span style="width:6px;height:6px;border-radius:50%;background:var(--success);display:inline-block;"></span> Hoàn thành <span class="count">${complete.length}</span></h3>
            </div>
            <div class="kanban-list">
              ${visibleComplete.map(renderCard).join('')}
              ${hasMoreComplete ? `<div style="text-align:center;margin-top:10px;"><button class="btn btn-sm btn-outline load-more-completed" style="width:100%;font-size:var(--fs-2xs);">Xem thêm</button></div>` : ''}
            </div>
          </div>
        ` : ''}
      </div>

      ${!incomplete.length && !pending.length ? `<div class="empty-state"><i data-lucide="check-square"></i><h3>Không có task</h3><p>Thử thay đổi bộ lọc hoặc tạo task mới</p></div>` : ''}
    </div>
  `;
}

export function bindTasksEvents(rerender) {
  initLucide();
  let searchTimeout;
  const handleSearch = (e) => {
    taskSearchText = e.target.value;
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      rerender();
      const input = document.getElementById('task-search-input');
      if (input) {
        input.focus();
        const len = input.value.length;
        input.setSelectionRange(len, len);
      }
    }, 300);
  };
  document.getElementById('task-search-input')?.addEventListener('input', handleSearch);
  document.getElementById('clear-task-search')?.addEventListener('click', () => {
    taskSearchText = '';
    rerender();
  });
  document.querySelectorAll('.filter-pill[data-filter]').forEach(t => t.addEventListener('click', () => { activeFilter = t.dataset.filter; rerender(); }));
  document.getElementById('toggle-completed')?.addEventListener('click', () => { showCompleted = !showCompleted; completedLimit = 10; rerender(); });
  document.getElementById('toggle-all')?.addEventListener('click', () => { showAllTasks = !showAllTasks; rerender(); });
  document.getElementById('toggle-ended-proj')?.addEventListener('click', () => { showEndedProjects = !showEndedProjects; activeFilter = 'all'; rerender(); });
  document.querySelector('.load-more-completed')?.addEventListener('click', () => { completedLimit += 10; rerender(); });
  document.getElementById('create-task-btn')?.addEventListener('click', async () => { if (await showTaskModal(null, activeFilter !== 'all' ? activeFilter : null)) rerender(); });
  document.querySelectorAll('.task-card').forEach(el => { el.addEventListener('click', async (e) => { if (e.target.closest('.status-toggle, .approve-btn, .reject-btn')) return; const task = getTasks().find(t => t.id === el.dataset.taskId); if (task && await showTaskModal(task)) rerender(); }); });
  document.querySelectorAll('.status-toggle').forEach(btn => { btn.addEventListener('click', (e) => { e.stopPropagation(); updateTask(btn.dataset.taskId, { status: 'pending_approval' }); rerender(); }); });
  document.querySelectorAll('.approve-btn').forEach(btn => { btn.addEventListener('click', (e) => { e.stopPropagation(); updateTask(btn.dataset.taskId, { status: 'complete', approvedBy: getCurrentUser()?.id }); rerender(); }); });
  document.querySelectorAll('.reject-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const task = getTasks().find(t => t.id === btn.dataset.taskId);
      if (!task) return;
      const msg = await customPrompt('Lý do từ chối (sẽ để lại trong comment):', '', 'Từ chối task');
      if (msg !== null) {
        const c = task.comments || [];
        if (msg.trim()) c.push({ id: Date.now().toString(), userId: getCurrentUser()?.id, text: msg.trim(), createdAt: new Date().toISOString() });
        updateTask(task.id, { status: 'incomplete', comments: c });
        rerender();
      }
    });
  });
}

export function resetTaskFilter() { activeFilter = 'all'; showCompleted = true; showAllTasks = false; showEndedProjects = false; completedLimit = 10; taskSearchText = ''; }
