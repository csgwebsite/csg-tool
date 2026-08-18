import { getMembers, getProjects, isAdmin, getCurrentUser, getTags, isMaster, getTasks } from '../data/store.js';
import { escapeHtml, renderAvatar, daysWorking, initLucide, renderProjectAvatar, multiSelectHTML, bindMultiSelect, shortenName } from '../utils/helpers.js';
import { showMemberModal } from '../components/MemberModal.js';
import { MEMBER_POSITIONS } from '../data/sampleData.js';

let viewMode = 'cards';
let filterText = '';
let filterPositions = [];
let filterTags = [];
let filterProjects = [];
let showEndedProjects = false;

export function renderMembers() {
  const members = getMembers(), allProjects = getProjects(), tags = getTags(), allTasks = getTasks();
  const filtered = members.filter(m => {
    if (m.status === 'closed') return false;
    let match = true;
    if (filterText && !m.fullName.toLowerCase().includes(filterText.toLowerCase())) match = false;
    if (filterPositions.length > 0 && !filterPositions.includes(m.position)) match = false;
    if (filterTags.length > 0 && (!m.tags || !filterTags.some(t => m.tags.includes(t)))) match = false;
    if (filterProjects.length > 0 && (!m.projectRoles || !filterProjects.some(pid => m.projectRoles[pid]))) match = false;
    return match;
  });
  const projects = allProjects.filter(p => showEndedProjects ? true : p.status !== 'ended');
  const memberTagsList = tags.filter(t => t.type === 'member');

  const activeProjects = projects.filter(p => filterProjects.length === 0 || filterProjects.includes(p.id));

  const sorted = [...filtered].sort((a, b) => {
    const rankA = MEMBER_POSITIONS.indexOf(a.position);
    const rankB = MEMBER_POSITIONS.indexOf(b.position);
    const finalRankA = rankA === -1 ? 999 : rankA;
    const finalRankB = rankB === -1 ? 999 : rankB;

    if (finalRankA !== finalRankB) return finalRankA - finalRankB;

    const dateA = a.startDate ? new Date(a.startDate).getTime() : new Date('9999-12-31').getTime();
    const dateB = b.startDate ? new Date(b.startDate).getTime() : new Date('9999-12-31').getTime();
    return dateA - dateB;
  });

  return `
    <div class="page-content slide-up">
      <style>
        .member-toolbar {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }
        .toolbar-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .header-search {
          height: 24px;
          border: 1.5px solid var(--border);
          border-radius: var(--r-full);
          padding: 0 12px;
          font-size: var(--fs-xs);
          background: var(--bg-card);
          color: var(--text-primary);
          outline: none;
          width: 100%;
          max-width: 280px;
          box-sizing: border-box;
          transition: all 0.2s;
        }
        .header-search:focus { border-color: var(--primary); box-shadow: 0 0 0 2px var(--primary-bg); }
        
        .filter-group {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: flex-end;
          flex: 1;
        }
        .filter-item { width: 140px; }
        
        .status-badge-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: var(--fs-xs);
          cursor: pointer;
          color: var(--text-secondary);
          white-space: nowrap;
        }
        
        .view-toggle { height: 24px; }
        .view-toggle-btn { height: 24px; padding: 0 10px; }
        .view-toggle-btn .lucide { width: 14px; height: 14px; }

        @media (max-width: 768px) {
          .toolbar-row { justify-content: flex-start; gap: 8px; }
          .filter-group { justify-content: space-between; width: 100%; gap: 6px; flex: none; }
          .filter-item { flex: 1; min-width: 0; width: auto !important; }
          .header-search { max-width: 100%; margin-bottom: 4px; }
          .toolbar-row:nth-child(2) { justify-content: space-between; }
        }
      </style>

      <div class="member-toolbar slide-up">
        <!-- Row 1: Search & Filters -->
        <div class="toolbar-row">
          <div style="position:relative; width:100%; max-width:280px;" class="search-box-mobile-wrapper">
            <input class="header-search search-box-mobile" id="member-search" placeholder="Tìm kiếm thành viên..." value="${escapeHtml(filterText)}" style="max-width:100%; padding-right:32px;" />
            ${filterText ? `<button id="clear-member-search" style="position:absolute; right:10px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:var(--text-tertiary); display:flex; align-items:center; justify-content:center; padding:0;"><i data-lucide="x" style="width:14px;height:14px;"></i></button>` : ''}
          </div>
          <div class="filter-group">
            <div class="filter-item">
              ${multiSelectHTML('member-filter-pos', MEMBER_POSITIONS.map(p => ({ id: p, name: p })), filterPositions, 'Vị trí', { triggerStyle: 'height: 24px; font-size: 10px; padding: 0 12px; border-radius: var(--r-full); background: var(--bg-card); border: 1.5px solid var(--border);' })}
            </div>
            <div class="filter-item">
              ${multiSelectHTML('member-filter-tag', memberTagsList, filterTags, 'Tags nhân sự', { triggerStyle: 'height: 24px; font-size: 10px; padding: 0 12px; border-radius: var(--r-full); background: var(--bg-card); border: 1.5px solid var(--border);' })}
            </div>
            <div class="filter-item">
              ${multiSelectHTML('member-filter-proj', projects, filterProjects, 'Dự án', { triggerStyle: 'height: 24px; font-size: 10px; padding: 0 12px; border-radius: var(--r-full); background: var(--bg-card); border: 1.5px solid var(--border);' })}
            </div>
          </div>
        </div>

        <!-- Row 2: View Toggle & Status Toggle + Add -->
        <div class="toolbar-row">
          <div class="view-toggle">
            <button class="view-toggle-btn ${viewMode === 'cards' ? 'active' : ''}" data-view="cards"><i data-lucide="layout-grid"></i></button>
            <button class="view-toggle-btn ${viewMode === 'table' ? 'active' : ''}" data-view="table"><i data-lucide="table-2"></i></button>
          </div>
          
          <div style="display: flex; align-items: center; gap: 12px;">
            <label class="status-badge-toggle">
              <div class="toggle ${showEndedProjects ? 'active' : ''}" id="toggle-ended-proj"></div>
              Dự án đã kết thúc
            </label>
            ${isMaster() ? `<button class="btn btn-primary btn-sm" id="add-member-btn" style="height: 24px; font-size: 11px; padding: 0 12px; border-radius: var(--r-sm);"><i data-lucide="plus" style="width:14px; height:14px;"></i> Thêm</button>` : ''}
          </div>
        </div>
      </div>

      ${viewMode === 'cards' ? `
        <div class="member-grid">
          ${sorted.map(m => {
    const days = daysWorking(m.startDate);
    const roleEntries = Object.entries(m.projectRoles || {}).map(([pid, role]) => {
      const proj = projects.find(p => p.id === pid);
      return proj ? { proj, role } : null;
    }).filter(Boolean);
    const assignedCount = allTasks.filter(t => t.assigneeId === m.id && t.status !== 'complete').length;
    const reviewCount = allTasks.filter(t => t.reviewerId === m.id && t.status !== 'complete').length;
    const createdCount = allTasks.filter(t => t.createdBy === m.id && t.status !== 'complete').length;

    return `
              <div class="card card-interactive member-card" data-id="${m.id}" style="cursor:pointer;padding:20px;display:flex;flex-direction:column;align-items:center;text-align:center;">
                ${renderAvatar(m, 'avatar-xl')}
                <div style="font-weight:700;font-size:var(--fs-md);margin-top:12px;display:flex;align-items:center;gap:4px;">
                  ${escapeHtml(m.fullName)}
                </div>
                <div style="font-size:var(--fs-xs);color:var(--text-tertiary);margin-top:2px;">${escapeHtml(m.position || '')}</div>
                ${days > 0 ? `<div style="font-size:var(--fs-2xs);color:var(--primary);font-weight:600;margin-top:6px;">${days} ngày</div>` : ''}

                ${(m.tags || []).length > 0 ? `
                  <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:4px;margin-top:8px;">
                    ${(m.tags || []).map(tId => {
      const tag = memberTagsList.find(t => t.id === tId);
      return tag ? `<span style="font-size:9px;padding:2px 6px;border-radius:var(--r-full);background:${tag.color}15;color:${tag.color};">${escapeHtml(tag.name)}</span>` : '';
    }).join('')}
                  </div>
                ` : ''
      }
                ${roleEntries.length ? `
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-top:10px;width:100%;">
                    ${roleEntries.map(({ proj, role }) => `
                      <div style="display:flex;align-items:center;gap:4px;padding:3px 6px;background:var(--bg-badge);border-radius:var(--r-sm);border-left:2px solid ${proj.color};min-width:0;">
                        ${renderProjectAvatar(proj, 'avatar-2xs')}
                        <div style="flex:1;min-width:0;text-align:left;">
                          <div style="font-size:10px;font-weight:600;color:var(--text-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(proj.name)}</div>
                          <div style="font-size:9px;color:var(--text-tertiary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(role)}</div>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                ` : ''
      }
              </div>`;
  }).join('')}
        </div>
      ` : `
        <div class="table-container" id="members-table-container" style="overflow-x:auto;-webkit-overflow-scrolling:touch;width:100%;max-width:100%;background:var(--bg-card);border-radius:var(--r-lg);box-shadow:var(--shadow-sm);margin-top:8px;position:relative;">
          <table class="table" style="width:100%;white-space:nowrap;">
            <thead><tr style="background:var(--bg-card);">
              <th style="padding:12px 16px;position:sticky;left:0;z-index:15;background:var(--bg-card);box-shadow:2px 0 5px rgba(0,0,0,0.02);border-top-left-radius:var(--r-lg);text-transform:uppercase;font-size:10px;letter-spacing:0.05em;color:var(--text-tertiary);">Thành viên</th>
              <th style="padding:12px 16px;text-align:left;text-transform:uppercase;font-size:10px;letter-spacing:0.05em;color:var(--text-tertiary);">Vị trí</th>
              ${activeProjects.map(p => `<th style="padding:12px 16px;text-align:center;text-transform:uppercase;font-size:10px;letter-spacing:0.05em;color:var(--text-tertiary);"><div style="max-width:140px;margin:auto;" class="truncate" title="${escapeHtml(p.name)}">${escapeHtml(p.name)}</div></th>`).join('')}
            </tr></thead>
            <tbody>
              ${sorted.map(m => {
    const assignedC = allTasks.filter(t => t.assigneeId === m.id && t.status !== 'complete').length;
    const reviewC = allTasks.filter(t => t.reviewerId === m.id && t.status !== 'complete').length;
    return `
                <tr class="member-row" data-id="${m.id}" style="cursor:pointer; transition: background 0.2s;">
                  <td style="padding:12px 16px;position:sticky;left:0;z-index:14;background:var(--bg-card);box-shadow:2px 0 5px rgba(0,0,0,0.05);">
                    <div style="display:flex;align-items:center;gap:12px;">
                      ${renderAvatar(m, 'avatar-md')}
                      <div>
                        <div style="font-weight:700;font-size:var(--fs-sm);color:var(--text-primary); white-space:nowrap;">${escapeHtml(shortenName(m.fullName))}</div>
                        <div style="font-size:10px;color:var(--text-tertiary);margin-top:2px;">${escapeHtml(m.code || '')}</div>
                      </div>
                    </div>
                  </td>
                  <td style="padding:12px 16px;text-align:left;"><span style="font-size:var(--fs-xs);color:var(--text-secondary);">${escapeHtml(m.position || '—')}</span></td>
                  ${activeProjects.map(p => {
      const role = m.projectRoles?.[p.id];
      return `<td style="padding:12px 16px;text-align:center;">${role ? `<span class="badge" style="background:${p.color}12;color:${p.color};white-space:nowrap;">${escapeHtml(role)}</span>` : '<span style="color:var(--text-disabled);">—</span>'}</td>`;
    }).join('')}
                </tr>
              `;
  }).join('')}
            </tbody>
          </table>
        </div>
      `}
    </div>
  `;
}

export function bindMembersEvents(rerender) {
  initLucide();
  document.querySelectorAll('.view-toggle-btn').forEach(b => b.addEventListener('click', () => { viewMode = b.dataset.view; rerender(); }));

  let searchTimeout;
  const applyFilters = (text) => {
    filterText = text;
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const activeId = document.activeElement?.id;
      rerender();

      const keptInput = activeId ? document.getElementById(activeId) : null;
      if (keptInput) {
        keptInput.focus();
        const len = keptInput.value.length;
        keptInput.setSelectionRange(len, len);
      }
    }, 300);
  };

  document.getElementById('member-search')?.addEventListener('input', (e) => applyFilters(e.target.value));
  document.getElementById('clear-member-search')?.addEventListener('click', () => {
    filterText = '';
    rerender();
  });

  bindMultiSelect('member-filter-pos', (selected) => { filterPositions = selected; rerender(); });
  bindMultiSelect('member-filter-tag', (selected) => { filterTags = selected; rerender(); });
  bindMultiSelect('member-filter-proj', (selected) => { filterProjects = selected; rerender(); });

  document.getElementById('toggle-ended-proj')?.addEventListener('click', () => { showEndedProjects = !showEndedProjects; rerender(); });

  let isDraggingRow = false;
  let startX = 0;
  let scrollLeft = 0;
  const slider = document.getElementById('members-table-container');

  if (slider) {
    slider.addEventListener('mousedown', (e) => {
      isDraggingRow = false;
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    });
    slider.addEventListener('mousemove', (e) => {
      if (e.buttons !== 1) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX);
      if (Math.abs(walk) > 5) {
        isDraggingRow = true;
        slider.scrollLeft = scrollLeft - walk;
      }
    });
  }

  const members = getMembers(); // Get members once for click handlers
  const open = async (id) => { const m = members.find(m => m.id === id); if (m && await showMemberModal(m, true)) rerender(); };

  document.querySelectorAll('.member-row').forEach(r => r.addEventListener('click', (e) => {
    if (isDraggingRow) {
      isDraggingRow = false;
      return;
    }
    open(r.dataset.id);
  }));
  document.querySelectorAll('.member-card').forEach(c => c.addEventListener('click', (e) => {
    if (isDraggingRow) { // This check is mostly for consistency, cards don't scroll horizontally
      isDraggingRow = false;
      return;
    }
    open(c.dataset.id);
  }));
  document.getElementById('add-member-btn')?.addEventListener('click', async () => { if (await showMemberModal(null)) rerender(); });
}
