import { getTasks, getMembers, getProjects, getTags, addTag, deleteTag, getSettings, updateSettings, isMaster, getMilestones, addMilestone, deleteMilestone, uploadImage } from '../data/store.js';
import { escapeHtml, generateId, renderAvatar, renderProjectAvatar, abbreviateName, initLucide, formatDate, calculateStreak } from '../utils/helpers.js';
import { showMemberModal } from '../components/MemberModal.js';
import { customAlert, customConfirm } from '../components/CustomModal.js';

let viewMonthFilter = '';
let viewPosFilter = '';
let reportTimeType = 'month';
let reportStartDate = '';
let reportEndDate = '';

export function renderAnalytics() {
  const tasks = getTasks(), members = getMembers().filter(m => m.status !== 'closed'), projects = getProjects(), tags = getTags(), settings = getSettings(), milestones = getMilestones();
  const total = tasks.length, complete = tasks.filter(t => t.status === 'complete').length;
  const pending = tasks.filter(t => t.status === 'pending_approval').length;
  const aiCount = tasks.filter(t => t.usesAI).length;
  const aiPercent = total ? Math.round((aiCount / total) * 100) : 0;
  const incomplete = total - complete - pending;

  let filteredMembers = members;
  if (viewPosFilter) {
    filteredMembers = members.filter(m => m.position === viewPosFilter);
  }

  const memberTasks = filteredMembers.map(m => {
    let assigned = tasks.filter(t => t.assigneeId === m.id || t.createdBy === m.id || t.reviewerId === m.id || t.assignerId === m.id);
    if (viewMonthFilter) {
      const [y, mo] = viewMonthFilter.split('-');
      assigned = assigned.filter(t => {
        const d = t.createdAt ? new Date(t.createdAt) : new Date();
        return d.getFullYear() == y && (d.getMonth() + 1) == mo;
      });
    }
    const completeCount = assigned.filter(t => t.status === 'complete').length;
    const pendingCount = assigned.filter(t => t.status === 'pending_approval').length;
    const doingCount = assigned.length - completeCount - pendingCount;
    return { member: m, total: assigned.length, complete: completeCount, pending: pendingCount, doing: doingCount };
  }).sort((a, b) => b.total - a.total);
  const maxTasks = Math.max(...memberTasks.map(m => m.total), 1);

  const projTasks = projects.map(p => {
    const pt = tasks.filter(t => t.projectId === p.id);
    return { project: p, total: pt.length, complete: pt.filter(t => t.status === 'complete').length };
  }).filter(p => p.total > 0).sort((a, b) => b.total - a.total);

  const COLORS = ['#F97316', '#EF4444', '#8B5CF6', '#3B82F6', '#10B981', '#EC4899', '#F59E0B', '#6366F1', '#14B8A6'];

  return `
    <div class="page-content slide-up">
      <!-- Stats -->
      <div class="analytics-stats-grid">
        <div class="stat-card"><div class="stat-card-value">${total}</div><div class="stat-card-label">Tổng Task</div></div>
        <div class="stat-card"><div class="stat-card-value" style="color:var(--success);">${complete}</div><div class="stat-card-label">Hoàn thành</div></div>
        <div class="stat-card"><div class="stat-card-value" style="color:var(--warning);">${pending}</div><div class="stat-card-label">Chờ duyệt</div></div>
        <div class="stat-card"><div class="stat-card-value" style="color:var(--primary);">${incomplete}</div><div class="stat-card-label">Đang làm</div></div>
        <div class="stat-card"><div class="stat-card-value" style="color:#8b5cf6;">${aiPercent}%</div><div class="stat-card-label">AI (${aiCount})</div></div>
      </div>

      <div class="analytics-split-grid">
        <!-- Task by member - abbreviated names -->
        <div class="card" style="padding:20px;">
          <div class="section-title" style="margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
            Task theo thành viên
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
               <select id="member-month-filter" class="form-control" style="width:130px;font-size:var(--fs-xs);padding:0 8px;border-radius:var(--r-sm);height:28px;">
                 <option value="">Tất cả thời gian</option>
                 ${(() => {
      const list = [];
      const now = new Date();
      const start = new Date(2026, 2, 1);
      const curr = new Date(start);
      while (curr <= now) {
        const m = (curr.getMonth() + 1).toString().padStart(2, '0');
        const y = curr.getFullYear();
        const val = `${y}-${m}`;
        list.push(`<option value="${val}" ${viewMonthFilter === val ? 'selected' : ''}>Tháng ${m}/${y}</option>`);
        curr.setMonth(curr.getMonth() + 1);
      }
      return list.reverse().join('');
    })()}
               </select>
               <select id="member-pos-filter" class="form-control" style="width:130px;font-size:var(--fs-xs);padding:0 8px;border-radius:var(--r-sm);height:28px;">
                 <option value="">Tất cả vị trí</option>
                 ${[...new Set(members.map(m => m.position).filter(Boolean))].sort().map(pos => `
                   <option value="${escapeHtml(pos)}" ${viewPosFilter === pos ? 'selected' : ''}>${escapeHtml(pos)}</option>
                 `).join('')}
               </select>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:10px;">
            ${memberTasks.map(mt => `
              <div class="analytics-member-row" data-id="${mt.member.id}" style="display:flex;align-items:center;gap:8px;cursor:pointer;">
                ${renderAvatar(mt.member, 'avatar-sm')}
                <div style="display:flex;flex-direction:column;width:80px;flex-shrink:0;" title="${escapeHtml(mt.member.fullName)}">
                  <span style="font-size:var(--fs-2xs);font-weight:600;line-height:1.2;">${escapeHtml(abbreviateName(mt.member.fullName))}</span>
                  ${(() => {
    const { streak, accessedToday } = calculateStreak(mt.member.accessHistory);
    if (streak === 0) return '';
    const color = accessedToday ? '#fb923c' : '#94a3b8'; // Orange vs Slate-400 (gray)
    return `
                      <div style="display:flex;align-items:center;gap:2px;font-size:9px;font-weight:700;color:${color};margin-top:1px;">
                        <i data-lucide="flame" style="width:10px;height:10px;${accessedToday ? 'fill:' + color : ''}"></i>
                        <span>${streak}</span>
                      </div>
                    `;
  })()}
                </div>
                <div class="hint-tooltip" data-tooltip="Hoàn thành: ${mt.complete} • Chờ duyệt: ${mt.pending} • Đang làm: ${mt.doing}" style="flex:1;">
                  <div style="height:8px;background:var(--border-light);border-radius:4px;overflow:hidden;display:flex;">
                    <div style="width:${mt.total ? (mt.complete / mt.total) * 100 : 0}%;height:100%;background:var(--success);${mt.complete && (mt.pending || mt.doing) ? 'border-right:1.5px solid var(--bg-card);' : ''}transition:width 0.6s;"></div>
                    <div style="width:${mt.total ? (mt.pending / mt.total) * 100 : 0}%;height:100%;background:var(--warning);${mt.pending && mt.doing ? 'border-right:1.5px solid var(--bg-card);' : ''}transition:width 0.6s;"></div>
                    <div style="width:${mt.total ? (mt.doing / mt.total) * 100 : 0}%;height:100%;background:var(--border-light);transition:width 0.6s;"></div>
                  </div>
                </div>
                <span style="font-size:var(--fs-2xs);color:var(--text-tertiary);min-width:28px;text-align:right;">${mt.total}</span>
              </div>
            `).join('')}
          </div>
        </div>
        <!-- Task by project -->
        <div class="card" style="padding:20px;">
          <div class="section-title" style="margin-bottom:14px;">Task theo dự án</div>
          <div style="display:flex;flex-direction:column;gap:10px;">
            ${projTasks.map(pt => `
              <div style="display:flex;align-items:center;gap:8px;">
                <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
                    ${renderProjectAvatar(pt.project, 'avatar-xs')}
                    <span style="font-size:var(--fs-2xs);font-weight:500;" class="desktop-only" title="${escapeHtml(pt.project.name)}">${escapeHtml(pt.project.name)}</span>
                </div>
                <div style="flex:1;height:8px;background:var(--border-light);border-radius:4px;overflow:hidden;display:flex;">
                  <div style="width:${pt.total ? (pt.complete / pt.total) * 100 : 0}%;height:100%;background:${pt.project.color};border-radius:4px 0 0 4px;transition:width 0.6s;"></div>
                </div>
                <span style="font-size:var(--fs-2xs);color:var(--text-tertiary);min-width:28px;text-align:right;">${pt.complete}/${pt.total}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <div class="analytics-bottom-grid">
      ${isMaster() ? `
        <!-- Tag management -->
        <div class="card" style="padding:20px;">
          <div class="section-title" style="margin-bottom:14px;">Quản lý Tag (Task)</div>
          <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px;">
            ${tags.filter(t => !t.type || t.type === 'data').map(t => `
              <div class="tag-chip" style="background:${t.color}15;color:${t.color};gap:4px;padding:3px 10px;">
                ${escapeHtml(t.name)}
                <button class="tag-del" data-tag-id="${t.id}" style="border:none;background:none;cursor:pointer;color:inherit;font-size:12px;line-height:1;opacity:0.7;">×</button>
              </div>
            `).join('')}
          </div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            <div style="display:flex;gap:6px;">
              <input class="form-control" id="new-data-tag-name" placeholder="Tên tag Task" style="flex:1;font-size:var(--fs-xs);padding:6px 10px;" />
              <button class="btn btn-primary btn-sm" id="add-data-tag-btn"><i data-lucide="plus"></i></button>
            </div>
            <div class="color-picker new-tag-colors" id="data-tag-colors" style="justify-content:flex-start;flex-wrap:wrap;">
              ${COLORS.map((c, i) => `<div class="color-option ${i === 0 ? 'selected' : ''}" data-color="${c}" style="background:${c};width:20px;height:20px;"></div>`).join('')}
            </div>
          </div>
          <div class="section-title" style="margin-top:20px;margin-bottom:14px;">Quản lý Tag (Nhân sự)</div>
          <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px;">
            ${tags.filter(t => t.type === 'member').map(t => `
              <div class="tag-chip" style="background:${t.color}15;color:${t.color};gap:4px;padding:3px 10px;">
                ${escapeHtml(t.name)}
                <button class="tag-del" data-tag-id="${t.id}" style="border:none;background:none;cursor:pointer;color:inherit;font-size:12px;line-height:1;opacity:0.7;">×</button>
              </div>
            `).join('')}
          </div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            <div style="display:flex;gap:6px;">
              <input class="form-control" id="new-member-tag-name" placeholder="Tên tag nhân sự" style="flex:1;font-size:var(--fs-xs);padding:6px 10px;" />
              <button class="btn btn-primary btn-sm" id="add-member-tag-btn"><i data-lucide="plus"></i></button>
            </div>
            <div class="color-picker new-tag-colors" id="member-tag-colors" style="justify-content:flex-start;flex-wrap:wrap;">
              ${COLORS.map((c, i) => `<div class="color-option ${i === 0 ? 'selected' : ''}" data-color="${c}" style="background:${c};width:20px;height:20px;"></div>`).join('')}
            </div>
          </div>
        </div>

        <!-- Milestone management -->
        <div class="card" style="padding:20px;">
          <div class="section-title" style="margin-bottom:14px;">Quản lý Ngày kỉ niệm</div>
          <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:20px;max-height:240px;overflow-y:auto;padding-right:4px;">
            ${milestones.length ? milestones.map(m => `
              <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:var(--bg-app);border-radius:var(--r-md);border:1px solid var(--border-light);">
                <div>
                  <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text-primary);">${escapeHtml(m.title)}</div>
                  <div style="font-size:var(--fs-2xs);color:var(--text-tertiary);">${formatDate(m.description)}</div>
                </div>
                <button class="btn-icon sm btn-ghost milestone-del" data-id="${m.id}" style="color:var(--danger);"><i data-lucide="trash-2" style="width:14px;height:14px;"></i></button>
              </div>
            `).join('') : '<div style="text-align:center;color:var(--text-disabled);font-size:var(--fs-xs);padding:20px;">Chưa có ngày kỉ niệm nào</div>'}
          </div>
          <div style="display:flex;flex-direction:column;gap:10px;padding:12px;background:var(--bg-card-hover);border-radius:var(--r-md);">
            <div style="font-size:var(--fs-xs);font-weight:600;margin-bottom:4px;color:var(--text-secondary);">Thêm ngày kỉ niệm mới</div>
            <input class="form-control" id="new-milestone-title" placeholder="Tên sự kiện (vD: Ngày thành lập Ban)" style="font-size:var(--fs-xs);" />
            <div style="display:flex;gap:8px;">
               <input class="form-control" type="date" id="new-milestone-date" style="font-size:var(--fs-xs);flex:1;" />
               <button class="btn btn-primary btn-sm" id="add-milestone-btn" style="padding:0 16px;"><i data-lucide="plus" style="margin-right:4px;"></i> THÊM</button>
            </div>
          </div>
        </div>

        <!-- Work Results Report -->
        <div class="card" style="padding:20px;">
          <div class="section-title" style="margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
            <span>Tải Kết quả công việc</span>
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                <select class="form-control" id="report-time-type" style="width:120px;height:32px;font-size:var(--fs-xs);padding:0 8px;border-radius:var(--r-sm);">
                  <option value="month" ${reportTimeType === 'month' ? 'selected' : ''}>Theo tháng</option>
                  <option value="range" ${reportTimeType === 'range' ? 'selected' : ''}>Khoảng ngày</option>
                </select>

                <div id="report-month-container" style="display:${reportTimeType === 'month' ? 'flex' : 'none'};align-items:center;">
                  <select class="form-control" id="report-month" style="width:140px;height:32px;font-size:var(--fs-xs);padding:0 8px;border-radius:var(--r-sm);">
                    ${(() => {
                      const list = [];
                      const now = new Date();
                      const start = new Date(2026, 2, 1);
                      const curr = new Date(start);
                      while (curr <= now) {
                        const m = (curr.getMonth() + 1).toString().padStart(2, '0');
                        const y = curr.getFullYear();
                        list.push(`<option value="${y}-${m}">Tháng ${m}/${y}</option>`);
                        curr.setMonth(curr.getMonth() + 1);
                      }
                      return list.reverse().join('');
                    })()}
                  </select>
                </div>

                <div id="report-range-container" style="display:${reportTimeType === 'range' ? 'flex' : 'none'};align-items:center;gap:6px;">
                  <input type="date" class="form-control" id="report-start-date" value="${reportStartDate}" style="width:130px;height:32px;font-size:var(--fs-xs);padding:0 8px;border-radius:var(--r-sm);" />
                  <span style="font-size:var(--fs-xs);color:var(--text-secondary);">đến</span>
                  <input type="date" class="form-control" id="report-end-date" value="${reportEndDate}" style="width:130px;height:32px;font-size:var(--fs-xs);padding:0 8px;border-radius:var(--r-sm);" />
                </div>

                <button class="btn btn-primary btn-sm" id="download-report-btn" style="height:32px;"><i data-lucide="download"></i> Xuất file</button>
            </div>
          </div>
          
          <!-- Filters for the report -->
          <div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:12px;background:var(--bg-app);padding:12px;border-radius:var(--r-md);">
              <div style="flex:1;min-width:200px;">
                <div style="font-size:var(--fs-xs);font-weight:600;margin-bottom:6px;color:var(--text-secondary);">Tình trạng công việc</div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                    <label style="font-size:var(--fs-xs);display:flex;align-items:center;gap:4px;cursor:pointer;">
                        <input type="checkbox" class="report-status-cb" value="incomplete"> Đang làm
                    </label>
                    <label style="font-size:var(--fs-xs);display:flex;align-items:center;gap:4px;cursor:pointer;">
                        <input type="checkbox" class="report-status-cb" value="pending_approval"> Chờ duyệt
                    </label>
                    <label style="font-size:var(--fs-xs);display:flex;align-items:center;gap:4px;cursor:pointer;">
                        <input type="checkbox" class="report-status-cb" value="complete" checked> Hoàn thành
                    </label>
                </div>
              </div>
              <div style="flex:2;min-width:260px;">
                <div style="font-size:var(--fs-xs);font-weight:600;margin-bottom:6px;color:var(--text-secondary);">Thành phần nhân sự</div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                    ${['Trưởng Ban', 'Giám đốc', 'Trưởng phòng', 'Cán bộ', 'Thực tập sinh', 'Cộng tác viên'].map(pos => `
                        <label style="font-size:var(--fs-xs);display:flex;align-items:center;gap:4px;cursor:pointer;">
                            <input type="checkbox" class="report-pos-cb" value="${pos}" ${['Thực tập sinh', 'Cộng tác viên'].includes(pos) ? 'checked' : ''}> ${pos}
                        </label>
                    `).join('')}
                </div>
              </div>
          </div>

          <div style="font-size:var(--fs-2xs);color:var(--text-tertiary);">Xuất báo cáo công việc theo bộ lọc bên trên. Bao gồm thông tin dự án, task và minh chứng công việc.</div>
        </div>

        <!-- App logo upload -->
        <div class="card" style="padding:20px;">
          <div class="section-title" style="margin-bottom:14px;">Logo trang web</div>
          <div style="display:flex;align-items:center;gap:16px;">
            <div id="logo-preview" style="width:56px;height:56px;border-radius:var(--r-lg);background:linear-gradient(135deg,var(--primary),var(--primary-dark));display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:800;color:white;background-size:cover;background-position:center;${settings.customLogo ? `background-image:url(${settings.customLogo});font-size:0;` : ''}">${settings.customLogo ? '' : 'F'}</div>
            <div>
              <label class="btn btn-outline btn-sm" style="cursor:pointer;"><i data-lucide="upload"></i> Upload<input type="file" id="logo-upload" accept="image/*" style="display:none;" /></label>
              ${settings.customLogo ? `<button class="btn btn-sm btn-ghost" id="reset-logo"><i data-lucide="rotate-ccw"></i></button>` : ''}
              <div style="font-size:var(--fs-2xs);color:var(--text-disabled);margin-top:4px;">64×64px khuyến nghị</div>
            </div>
          </div>
        </div>
      ` : ''}
  </div>
    </div >
  `;
}

export function bindAnalyticsEvents(rerender) {
  initLucide();

  document.getElementById('member-month-filter')?.addEventListener('change', (e) => {
    viewMonthFilter = e.target.value;
    rerender();
  });
  document.getElementById('member-pos-filter')?.addEventListener('change', (e) => {
    viewPosFilter = e.target.value;
    rerender();
  });

  document.querySelectorAll('.new-tag-colors').forEach(container => {
    container.querySelectorAll('.color-option').forEach(el => {
      el.addEventListener('click', () => {
        container.querySelectorAll('.color-option').forEach(e => e.classList.remove('selected'));
        el.classList.add('selected');
        container.dataset.selectedColor = el.dataset.color;
      });
    });
    container.dataset.selectedColor = '#F97316';
  });

  document.querySelectorAll('.tag-del').forEach(b => b.addEventListener('click', () => { deleteTag(b.dataset.tagId); rerender(); }));
  document.getElementById('add-data-tag-btn')?.addEventListener('click', () => {
    const n = document.getElementById('new-data-tag-name')?.value.trim();
    const c = document.getElementById('data-tag-colors')?.dataset.selectedColor || '#F97316';
    if (n) { addTag({ id: generateId(), name: n, color: c, type: 'data' }); rerender(); }
  });
  document.getElementById('add-member-tag-btn')?.addEventListener('click', () => {
    const n = document.getElementById('new-member-tag-name')?.value.trim();
    const c = document.getElementById('member-tag-colors')?.dataset.selectedColor || '#F97316';
    if (n) { addTag({ id: generateId(), name: n, color: c, type: 'member' }); rerender(); }
  });
  document.getElementById('logo-upload')?.addEventListener('change', async (e) => {
    const f = e.target.files[0];
    if (!f) return;

    // Show a loading indicator on the label or button if needed
    const oldLogo = document.querySelector('label[for="logo-upload"]').innerHTML;
    document.querySelector('label[for="logo-upload"]').innerHTML = '<i data-lucide="loader-2" class="lucide-sm animate-spin"></i> Đang tải...';

    const url = await uploadImage(f, 'logos');

    document.querySelector('label[for="logo-upload"]').innerHTML = oldLogo;
    initLucide();

    if (url) {
      updateSettings({ customLogo: url });
      rerender();
    } else {
      await customAlert('Lỗi tải ảnh. Vui lòng thử lại!', 'Lỗi');
    }
  });
  document.getElementById('reset-logo')?.addEventListener('click', () => { updateSettings({ customLogo: '' }); rerender(); });

  document.querySelectorAll('.milestone-del').forEach(b => b.addEventListener('click', async () => { if (await customConfirm('Xóa ngày kỉ niệm này?', 'Xác nhận xóa', true)) { deleteMilestone(b.dataset.id); rerender(); } }));
  document.getElementById('add-milestone-btn')?.addEventListener('click', () => {
    const t = document.getElementById('new-milestone-title')?.value.trim();
    const d = document.getElementById('new-milestone-date')?.value;
    if (t && d) { addMilestone({ id: generateId(), title: t, description: d }); rerender(); }
  });

  document.getElementById('report-time-type')?.addEventListener('change', (e) => {
    reportTimeType = e.target.value;
    const monthContainer = document.getElementById('report-month-container');
    const rangeContainer = document.getElementById('report-range-container');
    if (monthContainer && rangeContainer) {
      if (reportTimeType === 'range') {
        monthContainer.style.display = 'none';
        rangeContainer.style.display = 'flex';
      } else {
        monthContainer.style.display = 'flex';
        rangeContainer.style.display = 'none';
      }
    }
  });

  document.getElementById('report-start-date')?.addEventListener('change', (e) => {
    reportStartDate = e.target.value;
  });

  document.getElementById('report-end-date')?.addEventListener('change', (e) => {
    reportEndDate = e.target.value;
  });

  document.getElementById('download-report-btn')?.addEventListener('click', async () => {
    let year, month;
    let startDate = null;
    let endDate = null;
    const startStr = document.getElementById('report-start-date')?.value || reportStartDate;
    const endStr = document.getElementById('report-end-date')?.value || reportEndDate;

    if (reportTimeType === 'month') {
      const monthVal = document.getElementById('report-month')?.value;
      if (!monthVal) {
        await customAlert('Vui lòng chọn tháng xuất báo cáo.', 'Thiếu thông tin');
        return;
      }
      [year, month] = monthVal.split('-').map(Number);
    } else {
      if (!startStr || !endStr) {
        await customAlert('Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc.', 'Thiếu thông tin');
        return;
      }
      startDate = new Date(startStr);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(endStr);
      endDate.setHours(23, 59, 59, 999);
      if (startDate > endDate) {
        await customAlert('Ngày bắt đầu không được lớn hơn ngày kết thúc.', 'Lỗi chọn ngày');
        return;
      }
    }

    // Get selected filters
    const selectedStatuses = Array.from(document.querySelectorAll('.report-status-cb:checked')).map(cb => cb.value);
    const selectedPositions = Array.from(document.querySelectorAll('.report-pos-cb:checked')).map(cb => cb.value);

    if (selectedStatuses.length === 0) {
      await customAlert('Vui lòng chọn ít nhất 1 tình trạng công việc.', 'Thiếu thông tin'); return;
    }
    if (selectedPositions.length === 0) {
      await customAlert('Vui lòng chọn ít nhất 1 thành phần nhân sự.', 'Thiếu thông tin'); return;
    }

    const members = getMembers().filter(m => selectedPositions.includes(m.position));
    const memberIds = members.map(m => m.id);
    const allTasks = getTasks();
    const projects = getProjects();
    const tags = getTags();

    // Filter tasks
    const filteredTasks = allTasks.filter(t => {
      // Check status
      if (!selectedStatuses.includes(t.status)) return false;

      // Check assignee in the selected positions
      if (!memberIds.includes(t.assigneeId)) return false;

      // Check time range
      const d = t.createdAt ? new Date(t.createdAt) : new Date();
      if (reportTimeType === 'month') {
        return d.getFullYear() === year && (d.getMonth() + 1) === month;
      } else {
        return d >= startDate && d <= endDate;
      }
    });

    // Sort by createdAt ascending
    filteredTasks.sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const db = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return da - db;
    });

    const csvData = filteredTasks.map((t, idx) => {
      // 1. STT
      const stt = idx + 1;

      // 2. Tên leader / media leader giao việc
      const assignerId = t.assignerId || t.createdBy;
      const assigner = getMembers().find(m => m.id === assignerId);
      const assignerName = assigner ? assigner.fullName : '';

      // 3. Thời gian giao việc
      const createdTime = t.createdAt ? new Date(t.createdAt).toLocaleDateString('vi-VN') : '';

      // 4. Tên CTV thực hiện công việc
      const assignee = getMembers().find(m => m.id === t.assigneeId);
      const assigneeName = assignee ? assignee.fullName : '';

      // 5. Vị trí
      const position = assignee ? assignee.position : '';

      // 6. Tên đầu việc (Tag)
      const tag = (t.tags || []).map(tid => tags.find(tg => tg.id === tid)).filter(Boolean)[0];
      const tagName = tag ? tag.name : '';

      // 7. Công việc thực hiện cụ thể
      const specificJob = `[${t.title}]${t.description ? ' ' + t.description : ''}`;

      // 8. Số lượng
      const taskLinks = t.links && t.links.length > 0 ? t.links.map(l => l.url) : (t.fileLink ? [t.fileLink] : []);
      const linkCount = taskLinks.length > 0 ? taskLinks.length : 1;

      // 9. Link báo cáo tương ứng từng công việc cụ thể
      const linksStr = taskLinks.join(', ');

      // 10. Thời gian hoàn thành công việc (Deadline)
      const deadlineStr = t.deadline ? new Date(t.deadline).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Không có';

      // 11. Trạng thái
      const statusMap = {
        'incomplete': 'Đang làm',
        'pending_approval': 'Chờ duyệt',
        'complete': 'Hoàn thành'
      };
      const statusName = statusMap[t.status] || t.status;

      return [
        stt,
        assignerName,
        createdTime,
        assigneeName,
        position,
        tagName,
        specificJob,
        linkCount,
        linksStr,
        deadlineStr,
        statusName
      ];
    });

    if (csvData.length === 0) {
      const msg = reportTimeType === 'month'
        ? 'Không có dữ liệu trong tháng này dựa theo bộ lọc đã chọn.'
        : 'Không có dữ liệu trong khoảng thời gian này dựa theo bộ lọc đã chọn.';
      await customAlert(msg, 'Thông báo');
      return;
    }

    const headers = [
      'STT', 
      'Tên leader / media leader giao việc', 
      'Thời gian giao việc', 
      'Tên CTV thực hiện công việc', 
      'Vị trí', 
      'Tên đầu việc', 
      'Công việc thực hiện cụ thể', 
      'Số lượng', 
      'Link báo cáo tương ứng từng công việc cụ thể', 
      'Thời gian hoàn thành công việc', 
      'Trạng thái'
    ];
    const csvContent = "\uFEFF" + [headers, ...csvData].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const filename = reportTimeType === 'month'
      ? `BC_KetQuaCongViec_${month.toString().padStart(2, '0')}-${year}.csv`
      : `BC_KetQuaCongViec_${startStr}_to_${endStr}.csv`;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  document.querySelectorAll('.analytics-member-row').forEach(row => {
    row.addEventListener('click', async () => {
      const mId = row.dataset.id;
      const m = getMembers().find(mem => mem.id === mId);
      if (m && await showMemberModal(m, true)) rerender();
    });
  });
}
