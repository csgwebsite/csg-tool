import { getTasks, getMembers, getProjects, getCurrentUser, isAdmin, updateMember, getMilestones } from '../data/store.js';
import { escapeHtml, getUpcomingBirthdays, getUpcomingWorkAnniversaries, getUpcomingMilestones, getTodayEvents, sortTasks, renderAvatar, renderProjectAvatar, daysWorking, timeUntil, formatDateShort, initLucide, calculateStreak, checkinToday, recoverYesterday } from '../utils/helpers.js';
import { showTaskModal } from '../components/TaskModal.js';
import { customAlert } from '../components/CustomModal.js';


export function renderDashboard() {
  const allTasks = getTasks(), members = getMembers().filter(m => m.status !== 'closed'), projects = getProjects(), user = getCurrentUser();
  const tasks = allTasks.filter(t => t.assigneeId === user?.id || t.createdBy === user?.id || t.reviewerId === user?.id || t.assignerId === user?.id);
  const total = tasks.length, complete = tasks.filter(t => t.status === 'complete').length;
  const pending = tasks.filter(t => t.status === 'pending_approval').length;
  const incomplete = total - complete - pending;
  const pct = total ? Math.round(complete / total * 100) : 0;
  const days = daysWorking(user?.startDate);
  const milestones = getMilestones();
  const todayEvents = getTodayEvents(members, milestones);
  const todayIds = new Set(todayEvents.map(e => e.member?.id || e.milestone?.id));

  const birthdays = getUpcomingBirthdays(members, 5).filter(b => !todayIds.has(b.id)).slice(0, 2);
  const workAnnis = getUpcomingWorkAnniversaries(members, 10).filter(a => !todayIds.has(a.id));
  const customMilestones = getUpcomingMilestones(milestones, 10).filter(m => !todayIds.has(m.id));

  const combinedAnnis = [...workAnnis.map(a => ({ ...a, type: 'workAnni' })), ...customMilestones.map(m => ({ ...m, type: 'milestone' }))]
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 3);

  const myTasks = sortTasks(tasks.filter(t => t.status !== 'complete'));


  return `
    <div class="page-content slide-up">
      <!-- Banner with current user avatar -->
      <div class="banner" style="position:relative;display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;padding:24px 32px;min-height:110px;border-radius:var(--r-xl);overflow:hidden;box-shadow:var(--shadow-sm);background:var(--bg-card);">
        <!-- Background -->
        <div class="dashboard-banner-bg"></div>
        <div style="position:relative;z-index:1;">
          <div style="font-size:var(--fs-2xl);font-weight:900;color:var(--text-primary);letter-spacing:-0.02em;">Cóc Task</div>
          <div style="font-size:var(--fs-sm);color:var(--text-secondary);margin-top:2px;font-weight:500;">
            Xin chào <strong>${escapeHtml(user?.fullName || '')}</strong>
          </div>
          <div style="font-size:var(--fs-sm);color:var(--text-secondary);margin-top:2px;font-weight:500;">
            Bạn đã đồng hành cùng Cóc Sài Gòn <strong>${days}</strong> ngày!
          </div>
        </div>
        <!-- Current user large avatar -->
        <div style="position:relative;z-index:1;cursor:pointer;" class="profile-trigger" id="dashboard-avatar-trigger">
          ${renderAvatar(user || {}, 'avatar-2xl')}
        </div>
      </div>

      ${todayEvents.length ? `
        <!-- Today's Celebration -->
        <div style="margin-bottom:20px; padding:24px 32px; border-radius:var(--r-xl); background: linear-gradient(135deg, #6a11cb 0%, #1e1b4b 100%); position:relative; overflow:hidden; box-shadow: 0 10px 30px -5px rgba(30, 27, 75, 0.5); min-height:110px; display:flex; align-items:center;">
          <!-- Decorative Background Patterns -->
          <div style="position:absolute; top:-10px; right:-20px; opacity:0.1; transform: rotate(15deg);">
             <i data-lucide="sparkles" style="width:140px; height:140px; color:white;"></i>
          </div>
          <div style="position:absolute; bottom:10px; right:120px; opacity:0.1;">
             <i data-lucide="party-popper" style="width:60px; height:60px; color:white;"></i>
          </div>
          <div style="position:absolute; top:15px; left:30%; opacity:0.08;">
             <i data-lucide="star" style="width:32px; height:32px; color:white; fill:white;"></i>
          </div>
          
          <!-- Fireworks Effect -->
          <div class="firework-container" style="position:absolute; inset:0; pointer-events:none;">
            <div class="fw fw-1"></div><div class="fw fw-2"></div><div class="fw fw-3"></div>
            <div class="fw fw-4"></div><div class="fw fw-5"></div>
          </div>

          <div style="position:relative; z-index:1; width:100%;">
            <div style="font-size:var(--fs-2xs); font-weight:900; text-transform:uppercase; letter-spacing:0.15em; color:rgba(255,255,255,0.8); margin-bottom:10px; display:flex; align-items:center; gap:6px;">
              <i data-lucide="sparkles" style="width:14px; height:14px;"></i> NGÀY ĐẸP HÔM NAY
            </div>
            <div style="display:flex; flex-direction:column; gap:16px;">
              ${todayEvents.map(e => celebrationItemHtml(e)).join('')}
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Stats Row: progress ring + project dist + birthday -->
      <div class="dash-stats-grid">
        <!-- Streak & Progress Card -->
        ${(() => {
      const getLocalISOStr = (d) => {
        const p = n => n.toString().padStart(2, '0');
        return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
      };

      const accessHistory = user?.accessHistory || [];

      const today = new Date();
      const todayStr = getLocalISOStr(today);
      const { streak, accessedToday, accessedYesterday } = calculateStreak(accessHistory);

      const currentDayOfWeek = today.getDay();
      const diffToMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
      const monday = new Date(today);
      monday.setDate(today.getDate() - diffToMonday);

      const daysOfWeek = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const dStr = getLocalISOStr(d);
        const isToday = dStr === todayStr;
        const isAccessed = accessHistory.includes(dStr);
        const label = d.getDay() === 0 ? 'CN' : ('T' + (d.getDay() + 1));

        daysOfWeek.push({ label, isToday, active: isAccessed });
      }

      let cardTheme = 'purple';
      if (pct === 100) cardTheme = 'red';
      else if (pct > 80) cardTheme = 'orange';
      else if (pct > 60) cardTheme = 'yellow';
      else if (pct > 40) cardTheme = 'green';
      else if (pct > 20) cardTheme = 'blue';

      const themeColors = {
        red: { bg: 'linear-gradient(180deg, #f87171 0%, #ef4444 100%)', shadow: 'rgba(239, 68, 68, 0.4)', icon: '#ef4444' },
        orange: { bg: 'linear-gradient(180deg, #fb923c 0%, #ea580c 100%)', shadow: 'rgba(234, 88, 12, 0.4)', icon: '#ea580c' },
        yellow: { bg: 'linear-gradient(180deg, #facc15 0%, #eab308 100%)', shadow: 'rgba(234, 179, 8, 0.4)', icon: '#eab308' },
        green: { bg: 'linear-gradient(180deg, #4ade80 0%, #22c55e 100%)', shadow: 'rgba(34, 197, 94, 0.4)', icon: '#22c55e' },
        blue: { bg: 'linear-gradient(180deg, #60a5fa 0%, #2563eb 100%)', shadow: 'rgba(37, 99, 235, 0.4)', icon: '#2563eb' },
        purple: { bg: 'linear-gradient(180deg, #a78bfa 0%, #7c3aed 100%)', shadow: 'rgba(124, 58, 237, 0.4)', icon: '#7c3aed' }
      };
      const th = themeColors[cardTheme];

      // Check-in / Recover button logic
      const showCheckin = !accessedToday;
      const showRecover = !accessedYesterday;

      let actionButtonsHtml = '';
      if (showCheckin || showRecover) {
        const btnStyle = `font-size:var(--fs-xs);font-weight:700;padding:10px 20px;border-radius:24px;border:none;cursor:pointer;display:inline-flex;align-items:center;gap:6px;transition:all 0.2s;box-shadow:0 2px 8px rgba(0,0,0,0.15);`;
        let btns = '';
        if (showCheckin) {
          btns += `<button id="checkin-btn" style="${btnStyle}background:#fff;color:${th.icon};">
            <i data-lucide="check-circle" style="width:16px;height:16px;"></i> Điểm danh
          </button>`;
        }
        if (showRecover) {
          btns += `<button id="recover-btn" style="${btnStyle}background:rgba(255,255,255,0.2);color:#fff;backdrop-filter:blur(4px);border:1px solid rgba(255,255,255,0.3);">
            <i data-lucide="rotate-ccw" style="width:14px;height:14px;"></i> Khôi phục hôm qua
          </button>`;
        }
        actionButtonsHtml = `<div style="display:flex;justify-content:center;gap:10px;margin-bottom:16px;flex-wrap:wrap;">${btns}</div>`;
      }

      return `
          <div class="stat-card" style="position:relative;display:flex;flex-direction:column;justify-content:center;text-align:center;padding:24px;overflow:hidden;min-height:220px;background:${th.bg};color:#fff; border:none; box-shadow: 0 10px 20px -5px ${th.shadow};">
            <div style="position:absolute;top:0;left:0;right:0;height:140px;background:radial-gradient(ellipse at top center, rgba(255,255,255,0.7) 0%, transparent 60%);pointer-events:none;"></div>
            <div style="position:absolute;bottom:0;left:0;right:0;height:30%;background:linear-gradient(to top, rgba(0,0,0,0.15) 0%, transparent 100%);pointer-events:none;"></div>
            
            <div style="position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;">
              <div style="display:flex;align-items:center;justify-content:center;width:40px;height:40px;background:rgba(255,255,255,0.25);border-radius:12px;margin-bottom:12px;backdrop-filter:blur(4px);box-shadow:inset 0 1px 2px rgba(255,255,255,0.5);">
                 <i data-lucide="flame" style="width:24px;height:24px;color:#fff;fill:#fff;"></i>
              </div>
              <div style="font-size:var(--fs-xl);font-weight:800;letter-spacing:0.5px;text-shadow:0 1px 2px rgba(0,0,0,0.1);margin-bottom:20px;">${streak} ngày điểm danh liên tục</div>
              
              <div style="display:flex;justify-content:center;gap:12px;background:rgba(0,0,0,0.1);padding:14px 20px;border-radius:24px;margin-bottom:24px;align-self:stretch;box-shadow:inset 0 2px 4px rgba(0,0,0,0.1);">
                ${daysOfWeek.map(d => `
                  <div style="display:flex;flex-direction:column;align-items:center;gap:6px;flex:1;">
                     <div style="width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;${d.isToday && accessedToday ? 'background:#fff;border:none;box-shadow:0 2px 8px rgba(0,0,0,0.2);' : d.active ? 'background:rgba(255,255,255,0.2);' : d.isToday ? 'border:2px dashed rgba(255,255,255,0.6);' : 'border:1px solid rgba(255,255,255,0.3);'}">
                        ${d.isToday && accessedToday ? `<i data-lucide="check" style="width:16px;height:16px;color:${th.icon};"></i>` : d.active ? '<i data-lucide="check" style="width:16px;height:16px;color:#fff;"></i>' : ''}
                     </div>
                     <span style="font-size:11px;opacity:0.9;font-weight:600;">${d.label}</span>
                  </div>
                `).join('')}
              </div>

              ${actionButtonsHtml}

              <div style="margin-top:8px;">
                <div style="font-size:4rem;font-weight:900;line-height:0.9;text-shadow:0 2px 4px rgba(0,0,0,0.1);">${complete}</div>
                <div style="font-size:var(--fs-sm);font-weight:600;opacity:0.9;margin-top:8px;margin-bottom:16px;">task bạn đã hoàn thành</div>
                
                <div style="display:flex;justify-content:center;gap:12px;">
                  <span style="font-size:var(--fs-xs);background:rgba(0,0,0,0.15);padding:8px 16px;border-radius:20px;font-weight:600;box-shadow:inset 0 1px rgba(255,255,255,0.1);">${incomplete} đang làm</span>
                  <span style="font-size:var(--fs-xs);background:rgba(0,0,0,0.15);padding:8px 16px;border-radius:20px;font-weight:600;box-shadow:inset 0 1px rgba(255,255,255,0.1);">${pending} chờ duyệt</span>
                </div>
              </div>
            </div>
          </div >
        `;
    })()}

        <!-- Project Distribution: avatar only (no name) -->
        <div class="stat-card" style="text-align:left;padding:16px 20px;">
          <div style="font-size:var(--fs-xs);font-weight:700;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:0.04em;margin-bottom:12px;">Phân bổ dự án</div>
          <div style="display:flex;flex-direction:column;gap:10px;">
            ${projects
      .filter(p => p.status !== 'ended' && (isAdmin() || user?.projectRoles?.[p.id]))
      .map(p => {
        const pt = tasks.filter(t => t.projectId === p.id);
        const pc = pt.filter(t => t.status === 'complete').length;
        const pp = pt.length ? Math.round(pc / pt.length * 100) : 0;
        return { p, pt, pc, pp };
      })
      .filter(item => item.pt.length > 0)
      .sort((a, b) => b.pt.length - a.pt.length)
      .map(({ p, pt, pc, pp }) => `
              <div style="display:flex;align-items:center;gap:10px;">
                ${renderProjectAvatar(p, 'avatar-xs')}
                <div style="flex:1;height:8px;background:var(--border-light);border-radius:4px;overflow:hidden;display:flex;">
                  <div style="width:${pp}%;height:100%;background:${p.color};border-radius:4px 0 0 4px;transition:width 0.6s;"></div>
                </div>
                <span style="font-size:var(--fs-2xs);color:var(--text-tertiary);min-width:28px;text-align:right;">${pc}/${pt.length}</span>
              </div>
              `).join('')}
          </div>
        </div>

        <!-- Birthday -->
        <div class="stat-card" style="text-align:left;padding:16px 20px;">
          <div style="font-size:var(--fs-xs);font-weight:700;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:0.04em;margin-bottom:10px;">🎂 Sinh nhật</div>
          <div id="birthday-container" style="display:flex;flex-direction:column;gap:12px;margin-bottom:20px;">
            ${birthdays.length ? birthdays.slice(0, 2).map(b => birthdayItemHtml(b)).join('') : '<span style="font-size:var(--fs-xs);color:var(--text-disabled);">Không có</span>'}
          </div>

          <div style="font-size:var(--fs-xs);font-weight:700;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:0.04em;margin-bottom:10px;padding-top:10px;border-top:1px solid var(--border-light);">✨ Kỉ niệm</div>
          <div id="anniversary-container" style="display:flex;flex-direction:column;gap:12px;">
            ${combinedAnnis.length ? combinedAnnis.map(a => anniversaryItemHtml(a)).join('') : '<span style="font-size:var(--fs-xs);color:var(--text-disabled);">Không có</span>'}
          </div>
        </div>
      </div>

      <!-- My Tasks — responsive grid -->
      <div>
        <div class="section-title">
          <i data-lucide="flag"></i> Task của bạn
          <span style="font-size:var(--fs-2xs);color:var(--text-tertiary);font-weight:400;">${myTasks.length} task</span>
        </div>
        <div class="dash-task-grid">
          ${myTasks.length ? myTasks.map(t => renderDashTaskCard(t, projects, members)).join('') : '<div class="empty-state" style="padding:32px;"><i data-lucide="check-circle-2"></i><h3>Không có task nào</h3></div>'}
        </div>
      </div>
    </div>
  `;
}

export function renderDashTaskCard(t, projects, members) {
  const proj = projects.find(p => p.id === t.projectId);
  const assignee = members.find(m => m.id === t.assigneeId);
  const creator = members.find(m => m.id === (t.createdBy || t.assignerId));
  const reviewer = t.reviewerId ? members.find(m => m.id === t.reviewerId) : creator;
  const tu = timeUntil(t.deadline); const overdue = tu.startsWith('Quá');
  const isHigh = t.priority === 'high';
  return `
    <div class="task-card dash-task" data-task-id="${t.id}" style="padding:12px 14px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:8px;">
        <div style="font-size:var(--fs-sm);font-weight:600;flex:1;min-width:0;line-height:1.4;">${escapeHtml(t.title)}</div>
        ${isHigh ? `<i data-lucide="flag" style="width:14px;height:14px;color:var(--danger);flex-shrink:0;fill:var(--danger);"></i>` : ''}
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <div style="display:flex;align-items:center;gap:6px;">
          ${proj ? `<span style="display:inline-flex;align-items:center;gap:4px;font-size:var(--fs-2xs);color:var(--text-tertiary);"><span style="width:6px;height:6px;border-radius:50%;background:${proj.color};display:inline-block;"></span>${escapeHtml(proj.name)}</span>` : ''}
        </div>
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
        </div>
      </div>
      ${tu ? `<div style="font-size:var(--fs-2xs);${overdue ? 'color:var(--danger);font-weight:600;' : 'color:var(--text-tertiary);'}margin-top:6px;">${tu}</div>` : ''}
    </div>`;
}

function birthdayItemHtml(b) {
  if (!b) return '';
  return `<div class="birthday-item">
    ${renderAvatar(b, 'avatar-sm')}
    <div>
      <div style="font-size:var(--fs-sm);font-weight:600;">${escapeHtml(b.fullName)}</div>
      <div style="font-size:var(--fs-2xs);color:var(--primary);font-weight:600;">Còn ${b.daysUntil} ngày · ${formatDateShort(b.dob)}</div>
    </div>
  </div>`;
}

function anniversaryItemHtml(a) {
  if (!a) return '';
  const isMilestone = a.type === 'milestone';
  const label = isMilestone ? `Kỉ niệm ${a.years} năm ${a.title}` : `Kỉ niệm ${a.years} năm làm việc của ${escapeHtml(a.fullName)}`;
  const avatar = isMilestone ? `<div class="avatar avatar-sm" style="background:var(--primary);"><i data-lucide="calendar" style="width:14px;height:14px;color:white;"></i></div>` : renderAvatar(a, 'avatar-sm');

  return `<div class="birthday-item">
    ${avatar}
    <div>
      <div style="font-size:var(--fs-sm);font-weight:600;">${label}</div>
      <div style="font-size:var(--fs-2xs);color:var(--primary);font-weight:600;">Còn ${a.daysUntil} ngày · ${formatDateShort(a.nextAnni)}</div>
    </div>
  </div>`;
}

function celebrationItemHtml(e) {
  if (!e) return '';
  let title = '', avatar = '';
  const yearsText = e.years > 0 ? `<strong style="color:#fff;">${e.years} năm</strong> ` : '';

  if (e.type === 'birthday') {
    title = `Chúc mừng Sinh nhật <strong style="color:#fff;">${e.years} tuổi</strong> của <strong style="color:#fff;">${escapeHtml(e.member.fullName)}</strong>!`;
    avatar = renderAvatar(e.member, 'avatar-lg');
  } else if (e.type === 'workAnni') {
    title = `Chúc mừng ${yearsText}đồng hành của <strong style="color:#fff;">${escapeHtml(e.member.fullName)}</strong>!`;
    avatar = renderAvatar(e.member, 'avatar-lg');
  } else if (e.type === 'milestone') {
    title = `Chúc mừng ${yearsText}kỉ niệm <strong style="color:#fff;">${escapeHtml(e.milestone.title)}</strong>!`;
    avatar = `<div class="avatar avatar-lg" style="background:rgba(255,255,255,0.2); backdrop-filter:blur(4px); border:1px solid rgba(255,255,255,0.3); color:white;"><i data-lucide="star" style="width:24px; height:24px; fill:white;"></i></div>`;
  }

  return `
    <div style="display:flex; align-items:center; gap:20px;">
      <div style="box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius:50%;">${avatar}</div>
      <div style="flex:1;">
        <div style="font-size:var(--fs-lg); color:#ffffff; line-height:1.3; font-weight:600; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">${title}</div>
      </div>
    </div>
  `;
}

export function bindDashboardEvents() {
  initLucide();
  const tasks = getTasks();
  const user = getCurrentUser();

  // Dashboard avatar profile trigger
  document.getElementById('dashboard-avatar-trigger')?.addEventListener('click', () => {
    import('../components/MemberModal.js').then(mod => {
      if (user) mod.showMemberModal(user, false).then(changed => { if (changed) { const p = document.getElementById('page-container'); if (p) { p.innerHTML = renderDashboard(); bindDashboardEvents(); } } });
    });
  });

  // Check-in button
  document.getElementById('checkin-btn')?.addEventListener('click', () => {
    if (user) {
      checkinToday(user, updateMember);
      const p = document.getElementById('page-container');
      if (p) { p.innerHTML = renderDashboard(); bindDashboardEvents(); }
    }
  });

  // Recover yesterday button
  document.getElementById('recover-btn')?.addEventListener('click', () => {
    if (user) {
      recoverYesterday(user, updateMember);
      const p = document.getElementById('page-container');
      if (p) { p.innerHTML = renderDashboard(); bindDashboardEvents(); }
    }
  });

  document.querySelectorAll('.dash-task').forEach(el => {
    el.addEventListener('click', async () => {
      const task = tasks.find(t => t.id === el.dataset.taskId);
      if (task) { const changed = await showTaskModal(task); if (changed) { const p = document.getElementById('page-container'); if (p) { p.innerHTML = renderDashboard(); bindDashboardEvents(); } } }
    });
  });

  // Check missing info
  if (user && !window._hasCheckedProfileInfo) {
    window._hasCheckedProfileInfo = true; // prevent infinite loop if they cancel and it re-renders
    const hasEmail = user.emailFE || user.emailFPT || user.gmail || user.email;
    const hasBankInfo = user.bankAccount && user.bankName && user.bankAccountName;
    const isMissingInfo = !hasEmail || !user.phone || !user.startDate || !user.dob || !hasBankInfo;

    if (isMissingInfo) {
      setTimeout(async () => {
        await customAlert("Vui lòng cập nhật đầy đủ thông tin cá nhân (Email, SĐT, Ngày bắt đầu làm việc, Ngày sinh, Thông tin ngân hàng) để tiếp tục sử dụng hệ thống một cách trơn tru nhất!", "Cập nhật Hồ sơ");
        import('../components/MemberModal.js').then(mod => {
          mod.showMemberModal(user, false, true).then(changed => {
            if (changed) {
              const p = document.getElementById('page-container');
              if (p) { p.innerHTML = renderDashboard(); bindDashboardEvents(); }
            }
          });
        });
      }, 500); // Slight delay to ensure dashboard is fully rendered
    }
  }
}
