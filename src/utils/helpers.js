// iOS native detection and modal safe-area helper
export function isNativeIOS() {
  return window.Capacitor?.isNativePlatform?.() && /iPhone|iPad|iPod/.test(navigator.userAgent);
}
export function getModalOverlayStyle() {
  return isNativeIOS() ? 'padding-top: 64px;' : '';
}

// Return a shareable public URL (fixes Capacitor returning capacitor://localhost)
const PUBLIC_ORIGIN = 'https://task.fptsx.space';
export function getPublicUrl() {
  const origin = window.location.origin;
  // If running inside Capacitor (capacitor:// or localhost), swap origin
  if (origin.includes('capacitor://') || origin.includes('localhost')) {
    return PUBLIC_ORIGIN + window.location.pathname;
  }
  return window.location.href;
}

export function generateId() { return Date.now().toString(36) + Math.random().toString(36).substr(2, 9); }
export function formatDate(d) { if (!d) return ''; return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
export function formatDateShort(d) { if (!d) return ''; return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }); }
export function formatDateTime(d) { if (!d) return ''; const dt = new Date(d); return dt.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) + ' ' + dt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }); }

export function timeUntil(deadline) {
  if (!deadline) return '';
  const now = new Date(), dl = new Date(deadline), diff = dl - now;
  if (diff < 0) {
    const hrs = Math.floor(Math.abs(diff) / 3600000);
    if (hrs < 24) return `Quá hạn ${hrs}h`;
    return `Quá hạn ${Math.floor(hrs / 24)}d`;
  }
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 1) return `${Math.floor(diff / 60000)}m`;
  if (hrs < 24) return `${hrs}h`;
  if (hrs < 168) return `${Math.floor(hrs / 24)}d ${hrs % 24}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export function daysBetween(d1, d2) { return Math.floor(Math.abs(new Date(d2) - new Date(d1)) / 86400000); }
export function daysWorking(s) { return s ? daysBetween(new Date(s), new Date()) : 0; }
export function isOverdue(d) { return d ? new Date(d) < new Date() : false; }

export function timeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " năm trước";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " tháng trước";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " ngày trước";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " giờ trước";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " phút trước";
  return Math.floor(seconds) + " giây trước";
}

export function getUpcomingBirthdays(members, count = 3) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const yr = now.getFullYear();
  return members.filter(m => m.dob).map(m => {
    const b = new Date(m.dob);
    let nb = new Date(yr, b.getMonth(), b.getDate());
    if (nb < now) nb = new Date(yr + 1, b.getMonth(), b.getDate());
    return { ...m, nextBirthday: nb, daysUntil: daysBetween(now, nb) };
  }).sort((a, b) => a.daysUntil - b.daysUntil).slice(0, count);
}

export function getUpcomingWorkAnniversaries(members, count = 2) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const yr = now.getFullYear();
  return members.filter(m => m.startDate).map(m => {
    const s = new Date(m.startDate);
    s.setHours(0, 0, 0, 0);
    let nb = new Date(yr, s.getMonth(), s.getDate());
    let years = yr - s.getFullYear();
    if (nb < now) {
      nb = new Date(yr + 1, s.getMonth(), s.getDate());
      years++;
    }
    // If today is exactly the anniversary
    if (nb.getTime() === now.getTime() && years === 0) {
      nb = new Date(yr + 1, s.getMonth(), s.getDate());
      years = 1;
    }
    return { ...m, nextAnni: nb, years: Math.max(1, years), daysUntil: daysBetween(now, nb) };
  }).filter(m => m.years > 0).sort((a, b) => a.daysUntil - b.daysUntil).slice(0, count);
}
export function getUpcomingMilestones(milestones, count = 2) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const yr = now.getFullYear();
  return milestones.filter(m => m.description).map(m => {
    const s = new Date(m.description);
    s.setHours(0, 0, 0, 0);
    let nb = new Date(yr, s.getMonth(), s.getDate());
    let years = yr - s.getFullYear();
    if (nb < now) {
      nb = new Date(yr + 1, s.getMonth(), s.getDate());
      years++;
    }
    return { ...m, nextAnni: nb, years: Math.max(1, years), daysUntil: daysBetween(now, nb) };
  }).sort((a, b) => a.daysUntil - b.daysUntil).slice(0, count);
}

export function getTodayEvents(members, milestones) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const events = [];
  members.forEach(m => {
    if (m.dob) {
      const b = new Date(m.dob);
      if (b.getDate() === now.getDate() && b.getMonth() === now.getMonth()) {
        events.push({ type: 'birthday', member: m, years: now.getFullYear() - b.getFullYear() });
      }
    }
    if (m.startDate) {
      const s = new Date(m.startDate);
      if (s.getDate() === now.getDate() && s.getMonth() === now.getMonth()) {
        const y = now.getFullYear() - s.getFullYear();
        if (y > 0) events.push({ type: 'workAnni', member: m, years: y });
      }
    }
  });
  milestones.forEach(m => {
    if (m.description) {
      const s = new Date(m.description);
      if (s.getDate() === now.getDate() && s.getMonth() === now.getMonth()) {
        const y = now.getFullYear() - s.getFullYear();
        const d = Math.floor(Math.abs(now - s) / 86400000);
        events.push({ type: 'milestone', milestone: m, years: y, days: d });
      }
    }
  });
  return events;
}

export function sortTasks(tasks) {
  const po = { high: 3, medium: 2, low: 1 };
  return [...tasks].sort((a, b) => {
    // Primary: Deadline (closest first)
    if (a.deadline && b.deadline) {
      const da = new Date(a.deadline), db = new Date(b.deadline);
      if (da.getTime() !== db.getTime()) return da - db;
    } else if (a.deadline) return -1;
    else if (b.deadline) return 1;

    // Secondary: Priority
    return (po[b.priority] || 0) - (po[a.priority] || 0);
  });
}

export function getInitials(n) {
  if (!n) return '?';
  const p = n.trim().split(/\s+/);
  return p.length === 1 ? p[0][0].toUpperCase() : (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

// Abbreviate name (e.g. "Hữu Phát" → "H.Phát")
export function abbreviateName(fullName) {
  const parts = (fullName || '').trim().split(/\s+/);
  if (parts.length < 2) return fullName;
  const last2 = parts.slice(-2);
  return `${last2[0][0].toUpperCase()}.${last2[1]}`;
}

// Get last 2 words (e.g. "Nguyễn Hữu Phát" → "Hữu Phát")
export function shortenName(fullName) {
  if (!fullName) return '';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length < 2) return fullName;
  return parts.slice(-2).join(' ');
}

// Generate responsive HTML for name shortening
export function getResponsiveName(fullName) {
  if (!fullName) return '';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length < 2) return `<span class="res-name"><span class="res-full">${escapeHtml(fullName)}</span></span>`;

  const full = fullName;
  const last2 = parts.slice(-2).join(' ');
  const abbr = `${parts[parts.length - 2][0].toUpperCase()}.${parts[parts.length - 1]}`;
  const last = parts[parts.length - 1];

  return `
    <span class="res-name">
      <span class="res-full">${escapeHtml(full)}</span>
      <span class="res-last2">${escapeHtml(last2)}</span>
      <span class="res-abbr">${escapeHtml(abbr)}</span>
      <span class="res-last">${escapeHtml(last)}</span>
    </span>
  `;
}

export function getAvatarColor(n) {
  const c = ['#8b64fd', '#ec4899', '#f97316', '#10b981', '#3b82f6', '#ef4444', '#6366f1', '#14b8a6', '#f59e0b', '#e11d48'];
  let h = 0; for (let i = 0; i < (n || '').length; i++) h = n.charCodeAt(i) + ((h << 5) - h);
  return c[Math.abs(h) % c.length];
}

export function escapeHtml(s) { return s ? s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') : ''; }

export function renderAvatar(member, sizeClass = '', showBadge = true) {
  const adminBadge = (showBadge && member?.isAdmin) ? `<div class="admin-badge"><svg width="14" height="14" viewBox="0 0 24 24" fill="var(--primary)" xmlns="http://www.w3.org/2000/svg"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>` : '';
  if (member?.avatar) return `<div class="avatar ${sizeClass}" style="background-image:url(${member.avatar})">${adminBadge}</div>`;
  return `<div class="avatar ${sizeClass}" style="background:${getAvatarColor(member?.fullName)}">${getInitials(member?.fullName)}${adminBadge}</div>`;
}

export function renderProjectAvatar(project, sizeClass = '') {
  if (project?.logo) return `<div class="avatar ${sizeClass}" style="background-image:url(${project.logo});background-size:cover;border-radius:var(--r-md);"></div>`;
  return `<div class="avatar ${sizeClass}" style="background:${project?.color || '#8b64fd'};border-radius:var(--r-md);font-size:inherit;">${project?.name?.[0] || '?'}</div>`;
}

export function updateFavicon(url) {
  if (!url) return;
  let link = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link);
  }
  link.href = url;
}

export function initLucide() { if (window.lucide) window.lucide.createIcons(); }

export function searchSelectHTML(id, itemsList, selectedId, placeholder, disabled = false, options = {}) {
  let sel = itemsList.find(m => m.id === selectedId);
  const valField = options.valField || 'fullName';
  const avatarFunc = options.avatarFunc || ((item) => renderAvatar(item, 'avatar-sm', false));

  return `
    <div class="search-select ${disabled ? 'disabled' : ''}" id="${id}-wrap" style="${disabled ? 'cursor:not-allowed; opacity:0.8;' : ''}">
      <input class="search-select-input" id="${id}" placeholder="${placeholder}" value="${sel ? escapeHtml(sel[valField]) : ''}" data-value="${selectedId || ''}" autocomplete="off" ${disabled ? 'disabled style="pointer-events:none;background:var(--bg-frozen);"' : ''} />
      <div class="search-select-dropdown" id="${id}-dd">
        ${itemsList.map(m => `
          <div class="search-select-item ${m.id === selectedId ? 'selected' : ''}" data-value="${m.id}">
            ${avatarFunc(m)}
            <span>${escapeHtml(m[valField])}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

export function bindSearchSelect(id, onSelect = null) {
  const input = document.getElementById(id);
  if (!input) return;
  const wrap = input.parentElement;
  const dd = document.getElementById(id + '-dd');
  if (!input || !dd) return;

  const updatePreview = (item) => {
    const avatar = item.querySelector('.avatar');
    const dot = item.querySelector('.tag-dd-dot');
    const colorBlock = item.querySelector('.color-block');

    const existingPreview = input.parentElement.querySelector('.search-select-preview');
    if (existingPreview) existingPreview.remove();
    input.style.paddingLeft = '';

    if (avatar || dot || colorBlock) {
      const preview = (avatar || dot || colorBlock).cloneNode(true);
      preview.classList.add('search-select-preview');
      preview.style.position = 'absolute';
      preview.style.left = '12px';
      preview.style.top = '50%';
      preview.style.transform = 'translateY(-50%)';
      preview.style.pointerEvents = 'none';
      preview.style.zIndex = '2';

      if (avatar) {
        preview.className = 'avatar avatar-xs search-select-preview';
        if (!preview.style.backgroundImage) {
          preview.style.width = '16px'; preview.style.height = '16px'; preview.style.fontSize = '10px';
        } else {
          preview.style.width = '16px'; preview.style.height = '16px';
        }
      } else if (dot || colorBlock) {
        preview.style.width = '10px'; preview.style.height = '10px';
      }

      input.style.paddingLeft = '36px';
      input.parentElement.insertBefore(preview, input);
    }
  };

  const updateSelectedState = (item) => {
    const textSpan = item.querySelector('span:not(.tag-dd-dot)');
    input.value = textSpan ? textSpan.textContent.trim() : '';
    input.dataset.value = item.dataset.value;
    updatePreview(item);
    dd.classList.remove('open');
    dd.querySelectorAll('.search-select-item').forEach(i => i.classList.remove('selected'));
    item.classList.add('selected');
    if (onSelect) onSelect(item.dataset.value);
  };

  input.addEventListener('focus', () => { dd.classList.add('open'); input.select(); });
  input.addEventListener('input', () => {
    const q = input.value.toLowerCase();
    dd.querySelectorAll('.search-select-item').forEach(item => {
      item.style.display = item.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
    dd.classList.add('open');
  });

  dd.addEventListener('click', (e) => {
    const item = e.target.closest('.search-select-item');
    if (item) updateSelectedState(item);
  });

  const initialSelected = dd.querySelector('.search-select-item.selected');
  if (initialSelected) updatePreview(initialSelected);
  input._updatePreview = updatePreview;

  document.addEventListener('click', (e) => { if (!e.target.closest('#' + id + '-wrap')) dd.classList.remove('open'); });
}

export function tagSelectHTML(id, tags, selectedId, placeholder, disabled = false) {
  const sel = tags.find(t => t.id === selectedId);
  return `
    <div class="search-select" id="${id}-wrap" style="position:relative;">
      <input class="search-select-input" id="${id}" placeholder="${placeholder}" value="${sel ? escapeHtml(sel.name) : ''}" data-value="${selectedId || ''}" autocomplete="off" readonly ${disabled ? 'disabled style="opacity:0.6;pointer-events:none;"' : ''} />
      <div class="search-select-dropdown" id="${id}-dd">
        <div class="search-select-item ${!selectedId ? 'selected' : ''}" data-value="">
           <span class="tag-dd-dot" style="width:12px;height:12px;border-radius:50%;background:transparent;border:1px dashed var(--border);"></span>
           <span>Không có tag</span>
        </div>
        ${tags.map(t => `
          <div class="search-select-item ${t.id === selectedId ? 'selected' : ''}" data-value="${t.id}">
            <div class="tag-dd-dot" style="width:12px;height:12px;border-radius:50%;background:${t.color};flex-shrink:0;"></div>
            <span>${escapeHtml(t.name)}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

export function projectSelectHTML(id, projects, selectedId, placeholder, disabled = false) {
  const sel = projects.find(p => p.id === selectedId);
  return `
    <div class="search-select" id="${id}-wrap">
      <input class="search-select-input" id="${id}" placeholder="${placeholder}" value="${sel ? escapeHtml(sel.name) : ''}" data-value="${selectedId || ''}" autocomplete="off" ${disabled ? 'disabled style="opacity:0.6;pointer-events:none;"' : ''} />
      <div class="search-select-dropdown" id="${id}-dd">
        ${projects.map(p => `
          <div class="search-select-item ${p.id === selectedId ? 'selected' : ''}" data-value="${p.id}">
            ${renderProjectAvatar(p, 'avatar-sm')}
            <span>${escapeHtml(p.name)}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

export function statusSelectHTML(id, selectedStatus, canComplete) {
  const statuses = [
    { id: 'incomplete', name: '⏳ Đang làm' },
    { id: 'pending_approval', name: '📝 Chờ duyệt' }
  ];
  if (canComplete) statuses.push({ id: 'complete', name: '✅ Hoàn thành' });

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

export function multiSelectHTML(id, itemsList, selectedIds = [], placeholder, options = {}) {
  const valField = options.valField || 'name';
  const label = selectedIds.length > 0 ? `${selectedIds.length} đã chọn` : placeholder;

  return `
    <div class="search-select" id="${id}-wrap">
      <div class="search-select-input multi-select-trigger" id="${id}-trigger" style="display:flex;align-items:center;justify-content:space-between;cursor:pointer;${options.triggerStyle || ''}">
        <span class="truncate">${escapeHtml(label)}</span>
        <i data-lucide="chevron-down" style="width:14px;height:14px;opacity:0.5;"></i>
      </div>
      <div class="search-select-dropdown multi-select-dropdown" id="${id}-dd" style="padding:4px;">
        <div style="padding:8px;border-bottom:1px solid var(--border-light);display:flex;justify-content:center;align-items:center;">
          <span style="font-size:10px;font-weight:700;color:var(--text-tertiary);text-transform:uppercase;">${escapeHtml(placeholder)}</span>
        </div>
        <div class="multi-select-list" style="max-height:200px;overflow-y:auto;">
          ${itemsList.map(item => {
    const isSelected = (selectedIds || []).includes(item.id);
    return `
              <label class="search-select-item" style="display:flex;align-items:center;gap:10px;cursor:pointer;margin:0;">
                <input type="checkbox" class="multi-select-checkbox" data-value="${item.id}" ${isSelected ? 'checked' : ''} style="margin:0;width:16px;height:16px;accent-color:var(--primary);" />
                <span style="font-size:var(--fs-xs);flex:1;">${escapeHtml(item[valField])}</span>
              </label>
            `;
  }).join('')}
        </div>
      </div>
    </div>
  `;
}

export function bindMultiSelect(id, onChange) {
  const trigger = document.getElementById(id + '-trigger');
  if (!trigger) return;
  const dd = document.getElementById(id + '-dd');

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = dd.classList.contains('open');
    document.querySelectorAll('.search-select-dropdown.open').forEach(d => d.classList.remove('open'));
    if (!isOpen) dd.classList.add('open');
  });

  dd.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => {
      const selected = Array.from(dd.querySelectorAll('input[type="checkbox"]:checked')).map(c => c.dataset.value);
      onChange(selected);
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#' + id + '-wrap')) dd.classList.remove('open');
  });
}

export function calculateStreak(accessHistory) {
  if (!accessHistory || !Array.isArray(accessHistory)) return { streak: 0, accessedToday: false, accessedYesterday: false };

  const today = new Date();
  const todayStr = getLocalISOString(today);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalISOString(yesterday);

  const accessedToday = accessHistory.includes(todayStr);
  const accessedYesterday = accessHistory.includes(yesterdayStr);

  let streak = 0;
  let checkDate = new Date(today);
  if (!accessedToday) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    let dStr = getLocalISOString(checkDate);
    if (accessHistory.includes(dStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return { streak, accessedToday, accessedYesterday };
}

function getLocalISOString(d) {
  const p = n => n.toString().padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

export function cleanupAccessHistory(accessHistory) {
  if (!accessHistory || !Array.isArray(accessHistory)) return [];
  return [...new Set(accessHistory)].sort();
}

export function checkinToday(user, updateMemberFunc) {
  if (!user || !user.id) return false;

  try {
    const today = new Date();
    const tStr = getLocalISOString(today);
    let accessHistory = cleanupAccessHistory(user.accessHistory || []);

    if (accessHistory.includes(tStr)) return false; // already checked in

    accessHistory.push(tStr);
    accessHistory = cleanupAccessHistory(accessHistory);

    const key = 'coctask_access_' + user.id;
    localStorage.setItem(key, JSON.stringify(accessHistory));
    if (updateMemberFunc) {
      updateMemberFunc(user.id, { accessHistory });
    }
    return true;
  } catch (e) {
    console.error('Checkin error:', e);
    return false;
  }
}

export function recoverYesterday(user, updateMemberFunc) {
  if (!user || !user.id) return false;

  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = getLocalISOString(yesterday);
    let accessHistory = cleanupAccessHistory(user.accessHistory || []);

    if (accessHistory.includes(yStr)) return false; // already has yesterday

    accessHistory.push(yStr);
    accessHistory = cleanupAccessHistory(accessHistory);

    const key = 'coctask_access_' + user.id;
    localStorage.setItem(key, JSON.stringify(accessHistory));
    if (updateMemberFunc) {
      updateMemberFunc(user.id, { accessHistory });
    }
    return true;
  } catch (e) {
    console.error('Recovery error:', e);
    return false;
  }
}

