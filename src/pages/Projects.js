import { getProjects, isAdmin, deleteProject, getTasks, isMaster, getCurrentUser } from '../data/store.js';
import { formatDate, escapeHtml, renderProjectAvatar, initLucide } from '../utils/helpers.js';
import { showProjectModal } from '../components/ProjectModal.js';

let viewMode = 'cards';
let showEndedProjects = false;

export function renderProjects() {
  const allProjects = getProjects(), tasks = getTasks();
  const user = getCurrentUser();
  const isAdm = isAdmin();
  const projects = allProjects.filter(p => {
    const isMember = isAdm || (user?.projectRoles && user.projectRoles[p.id]);
    const matchesStatus = showEndedProjects ? true : p.status !== 'ended';
    return isMember && matchesStatus;
  }).sort((a, b) => {
    const getEarliest = (p) => {
      const ms = (p.milestones || []).filter(m => m.date).map(m => new Date(m.date).getTime());
      return ms.length ? Math.min(...ms) : Infinity;
    };
    return getEarliest(a) - getEarliest(b);
  });

  return `
    <div class="page-content slide-up">
      <div class="page-header">
        <div class="page-header-left">
          <div class="view-toggle">
            <button class="view-toggle-btn ${viewMode === 'cards' ? 'active' : ''}" data-view="cards"><i data-lucide="layout-grid"></i></button>
            <button class="view-toggle-btn ${viewMode === 'timeline' ? 'active' : ''}" data-view="timeline"><i data-lucide="gantt-chart"></i></button>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:12px;">
          <label style="display:flex;align-items:center;gap:8px;font-size:var(--fs-xs);cursor:pointer;"><div class="toggle ${showEndedProjects ? 'active' : ''}" id="toggle-ended-proj"></div>Dự án đã kết thúc</label>
          ${isMaster() ? `<button class="btn btn-primary btn-sm" id="add-proj"><i data-lucide="plus"></i> Tạo dự án</button>` : ''}
        </div>
      </div>

      ${viewMode === 'cards' ? `
        <div class="cards-grid">
          ${projects.map(p => {
    const pt = tasks.filter(t => t.projectId === p.id);
    const pc = pt.filter(t => t.status === 'complete').length;
    const pct = pt.length ? Math.round(pc / pt.length * 100) : 0;
    return `
              <div class="card card-interactive proj-card" data-pid="${p.id}" style="cursor:pointer;padding:20px;position:relative;overflow:hidden; display:flex; flex-direction:column;">
                <!-- Color accent bar -->
                <div style="position:absolute;top:0;left:0;right:0;height:3px;background:${p.color};"></div>
                ${isMaster() ? `<button class="btn-icon btn-ghost proj-edit-btn" data-pid="${p.id}" style="position:absolute;top:12px;right:12px;width:32px;height:32px;"><i data-lucide="edit-2" class="lucide-sm"></i></button>` : ''}
                
                <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:14px; flex:1;">
                  ${renderProjectAvatar(p, 'avatar-lg')}
                  <div style="flex:1;min-width:0;padding-right:24px;">
                    <div style="font-size:var(--fs-md);font-weight:700;line-height:1.3;">${escapeHtml(p.name)}</div>
                    ${p.description ? `<div style="font-size:var(--fs-sm);color:var(--text-secondary);margin-top:6px;line-height:1.5;">${escapeHtml(p.description)}</div>` : ''}
                  </div>
                </div>

                <!-- Task count -->
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
                  <div style="font-size:var(--fs-2xs);color:var(--text-tertiary);">
                    <span style="font-weight:600;color:var(--success);">${pc}</span>/${pt.length} task hoàn thành
                  </div>
                  <div style="font-size:var(--fs-2xs);font-weight:600;color:${p.color};">${pct}%</div>
                </div>

                <!-- Progress bar -->
                <div style="height:4px;background:var(--border-light);border-radius:2px;overflow:hidden;margin-bottom:14px;">
                  <div style="height:100%;width:${pct}%;background:${p.color};border-radius:2px;transition:width 0.6s;"></div>
                </div>

                ${p.milestones?.length ? `
                  <div style="margin-bottom:12px;">
                    ${p.milestones.slice(0, 3).map(m => `
                      <div style="display:flex;align-items:center;gap:6px;font-size:var(--fs-2xs);padding:3px 0;">
                        <span style="width:5px;height:5px;border-radius:50%;background:${p.color};flex-shrink:0;"></span>
                        <span style="flex:1;font-weight:500;color:var(--text-secondary);">${escapeHtml(m.title)}</span>
                        <span style="color:var(--text-disabled);">${formatDate(m.date)}</span>
                      </div>
                    `).join('')}
                  </div>
                ` : ''}

                ${p.links?.length ? `
                  <div style="display:flex;flex-wrap:wrap;gap:4px;">
                    ${p.links.map(l => `<a href="${escapeHtml(l.url)}" target="_blank" class="tag-chip" style="text-decoration:none;color:var(--text-link);background:var(--bg-badge);" onclick="event.stopPropagation()"><i data-lucide="external-link" class="lucide-sm"></i>${escapeHtml(l.label)}</a>`).join('')}
                  </div>
                ` : ''}
              </div>`;
  }).join('')}
        </div>
      ` : renderTimeline(projects)}
    </div>
  `;
}

function renderTimeline(projects) {
  const currentYear = new Date().getFullYear();
  const monthStart = new Date(currentYear, 0, 1);
  const monthEnd = new Date(currentYear, 11, 31);
  const rangeDays = Math.ceil((monthEnd - monthStart) / 86400000) + 1;

  const months = [];
  for (let i = 0; i < 12; i++) {
    months.push(new Date(currentYear, i, 1));
  }

  const getPos = (dStr) => {
    const d = new Date(dStr);
    if (isNaN(d)) return null;
    return Math.max(0, Math.min(100, ((d - monthStart) / (rangeDays * 86400000)) * 100));
  };

  return `
    <style>
      .timeline-container {
        overflow-x: auto;
        padding: 16px;
        background: var(--bg-card);
        border-radius: var(--r-lg);
        border: 1px solid var(--border-light);
      }
      .timeline-header-row {
        display: flex;
        margin-bottom: 8px;
        border-bottom: 1px solid var(--border-light);
        padding-bottom: 8px;
        position: sticky;
        top: 0;
        background: var(--bg-card);
        z-index: 20;
      }
      .month-label {
        flex: 1;
        font-size: 10px;
        font-weight: 700;
        color: var(--text-tertiary);
        text-align: center;
        border-right: 1px solid var(--border-light);
      }
      .month-label:last-child { border-right: none; }
      
      .project-row {
        display: flex;
        align-items: center;
        padding: 4px 0;
        border-bottom: 1px solid var(--bg-body);
      }
      .project-row:last-child { border-bottom: none; }
      
      .timeline-milestone {
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 10px;
        height: 10px;
        border-radius: 50%;
        border: 2px solid var(--bg-card);
        z-index: 10;
        transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        cursor: pointer;
      }
      
      /* Larger hit area */
      .timeline-milestone::before {
        content: '';
        position: absolute;
        top: -12px; left: -12px; right: -12px; bottom: -12px;
        border-radius: 50%;
      }
      
      .timeline-milestone:hover {
        width: 14px;
        height: 14px;
        z-index: 100;
        box-shadow: 0 0 0 4px rgba(0,0,0,0.05);
      }
      
      .timeline-tooltip {
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%) translateY(-8px);
        background: rgba(30,30,35,0.95);
        color: #fff;
        padding: 6px 10px;
        border-radius: 6px;
        font-size: 10px;
        white-space: nowrap;
        pointer-events: none;
        opacity: 0;
        visibility: hidden;
        transition: all 0.1s ease-out;
        box-shadow: 0 4px 16px rgba(0,0,0,0.3);
        z-index: 110;
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255,255,255,0.1);
      }
      
      .timeline-tooltip::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 5px solid transparent;
        border-top-color: rgba(30,30,35,0.95);
      }
      
      .timeline-milestone:hover .timeline-tooltip {
        opacity: 1;
        visibility: visible;
        transform: translateX(-50%) translateY(-12px);
      }
      
      .timeline-bar-wrap:hover .timeline-bar {
        filter: brightness(0.95);
      }
      .timeline-proj-avatar { display: none; }
      .timeline-col-left { width: 140px; }
      @media (max-width: 768px) {
        .timeline-col-left { width: 44px !important; padding-right: 0 !important; justify-content: center !important; }
        .timeline-proj-name { display: none !important; }
        .timeline-proj-dot { display: none !important; }
        .timeline-proj-avatar { display: flex !important; margin: 0 auto; }
        .month-prefix { display: none; }
        .timeline-col-left-header { font-size: 0 !important; text-align: center; }
        .timeline-col-left-header::after { content: 'D/Án'; font-size: 9px; }
        .timeline-inner-wrap { min-width: 0 !important; }
      }
    </style>
    
    <div class="timeline-container">
      <div class="timeline-header-row">
        <div class="timeline-col-left timeline-col-left-header" style="flex-shrink: 0; font-size: 10px; font-weight: 700; color: var(--text-disabled); text-transform: uppercase;">Dự án / ${currentYear}</div>
        <div style="flex: 1; display: flex;">
          ${months.map(m => `<div class="month-label"><span class="month-prefix">T</span>${m.getMonth() + 1}</div>`).join('')}
        </div>
      </div>
      
      <div class="timeline-inner-wrap" style="width: 100%; min-width: 600px;">
        ${projects.map(p => {
    const ms = (p.milestones || []).filter(m => m.date);
    const f = ms.length ? new Date(Math.min(...ms.map(m => new Date(m.date)))) : null;
    const l = ms.length ? new Date(Math.max(...ms.map(m => new Date(m.date)))) : null;

    // Ensure project bar stays within current year boundaries for display
    const startPos = f ? getPos(f) : 0;
    const endPos = l ? getPos(l) : 0;
    const barWidth = Math.max(endPos - startPos, 0.5);

    return `
          <div class="project-row">
            <div class="timeline-col-left" style="flex-shrink: 0; display: flex; align-items: center; gap: 8px; padding-right: 12px;">
              <span class="color-dot timeline-proj-dot" style="background:${p.color}; width: 6px; height: 6px;"></span>
              <div class="timeline-proj-avatar">${renderProjectAvatar(p, 'avatar-xs')}</div>
              <span class="timeline-proj-name truncate" style="font-size: 11px; font-weight: 600; color: var(--text-secondary);">${escapeHtml(p.name)}</span>
            </div>
            <div class="timeline-bar-wrap" data-pid="${p.id}" style="flex:1; position:relative; height:20px; background:var(--bg-body); border-radius:4px; overflow: visible; cursor: pointer;">
              ${f && l && endPos > 0 && startPos < 100 ? `
                <div class="timeline-bar" style="position:absolute; top:4px; bottom:4px; left:${startPos}%; width:${barWidth}%; background:${p.color}20; border-radius:3px; border:1px solid ${p.color}30;"></div>
              ` : ''}
              ${ms.map(m => {
      const pos = getPos(m.date);
      if (pos === null || pos < 0 || pos > 100) return '';
      return `
                  <div class="timeline-milestone" style="left:${pos}%; background:${p.color};">
                    <div class="timeline-tooltip">
                      <div style="font-weight:700; margin-bottom:2px;">${escapeHtml(m.title)}</div>
                      <div style="opacity:0.8;">${formatDate(m.date)}</div>
                    </div>
                  </div>`;
    }).join('')}
            </div>
          </div>`;
  }).join('')}
      </div>
    </div>`;
}

export function bindProjectsEvents(rerender) {
  initLucide();
  document.querySelectorAll('.view-toggle-btn').forEach(b => b.addEventListener('click', () => { viewMode = b.dataset.view; rerender(); }));

  document.getElementById('toggle-ended-proj')?.addEventListener('click', (e) => {
    e.stopPropagation();
    showEndedProjects = !showEndedProjects;
    rerender();
  });

  // Edit project button
  document.querySelectorAll('.proj-edit-btn').forEach(b => {
    b.addEventListener('click', async (e) => {
      e.stopPropagation(); // prevent card click
      const p = getProjects().find(p => p.id === b.dataset.pid);
      if (p && await showProjectModal(p, false)) rerender();
    });
  });

  // Navigate to Tasks filtered by project (Changed to Open View Mode)
  document.querySelectorAll('.proj-card, .timeline-bar-wrap').forEach(el => {
    el.addEventListener('click', async () => {
      const pid = el.dataset.pid || el.querySelector('.timeline-bar')?.dataset.pid;
      if (pid) {
        const p = getProjects().find(p => p.id === pid);
        if (p && await showProjectModal(p, true)) rerender();
      }
    });
  });

  document.getElementById('add-proj')?.addEventListener('click', async () => { if (await showProjectModal(null)) rerender(); });
}
