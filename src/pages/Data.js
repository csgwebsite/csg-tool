import { getDataItems, getCurrentUser, isAdmin } from '../data/store.js';
import { escapeHtml, formatDate, initLucide } from '../utils/helpers.js';
import { showDataModal } from '../components/DataModal.js';

const catIcons = { meeting: 'file-text', drive: 'hard-drive', tool: 'wrench', document: 'book-open' };
const catLabels = { meeting: 'Biên bản họp', drive: 'Link Drive', tool: 'Công cụ', document: 'Tài liệu' };
const catColors = { meeting: '#3b82f6', drive: '#10b981', tool: '#f59e0b', document: '#8b64fd' };
let activeCategory = 'all';

export function renderData() {
  const allItems = getDataItems();
  const user = getCurrentUser();

  const items = allItems.filter(i => {
    if (i.category === 'system' || i.category === 'milestone') return false;
    if (!i.allowedViewers || i.allowedViewers.length === 0) return true;
    if (isAdmin() || i.createdBy === user?.id) return true;

    let userPos = user?.position || '';
    if (userPos === 'Trưởng Ban' || userPos === 'Trưởng phòng') {
      userPos = 'Cán bộ';
    }

    return i.allowedViewers.includes(userPos);
  });

  const filtered = activeCategory === 'all' ? items : items.filter(i => i.category === activeCategory);
  const grouped = {};
  filtered.forEach(i => { (grouped[i.category] = grouped[i.category] || []).push(i); });

  return `
    <div class="page-content slide-up">
      <div class="page-header">
        <div class="page-header-left">
          <div class="filter-pills">
            <button class="filter-pill ${activeCategory === 'all' ? 'active' : ''}" data-cat="all">Tất cả</button>
            ${Object.entries(catLabels).map(([k, v]) => `<button class="filter-pill ${activeCategory === k ? 'active' : ''}" data-cat="${k}"><span class="color-dot" style="background:${catColors[k]};"></span>${v}</button>`).join('')}
          </div>
        </div>
        <button class="btn btn-primary btn-sm" id="add-data-btn"><i data-lucide="plus"></i> Thêm</button>
      </div>
      ${filtered.length ? Object.entries(grouped).map(([cat, items]) => `
        <div style="margin-bottom:20px;">
          <div class="section-title" style="gap:6px;">
            <i data-lucide="${catIcons[cat] || 'file'}" style="width:16px;height:16px;color:${catColors[cat]};"></i>
            ${catLabels[cat] || cat}
            <span class="badge badge-neutral">${items.length}</span>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(300px, 1fr));gap:12px;">
            ${items.map(item => `
              <div class="card card-flat data-item" data-item-id="${item.id}" style="cursor:pointer;padding:16px;display:flex;flex-direction:column;gap:12px;height:100%;">
                <div style="display:flex;align-items:flex-start;gap:12px;">
                  <div style="width:36px;height:36px;border-radius:var(--r-md);background:${catColors[item.category]}10;color:${catColors[item.category]};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                    <i data-lucide="${catIcons[item.category] || 'file'}" style="width:18px;height:18px;"></i>
                  </div>
                  <div style="flex:1;min-width:0;">
                    <div style="font-size:var(--fs-md);font-weight:600;word-wrap:break-word;">${escapeHtml(item.title)}</div>
                    <div style="font-size:var(--fs-2xs);color:var(--text-disabled);margin-top:4px;">${formatDate(item.createdAt)}</div>
                  </div>
                </div>
                ${item.description ? `<div style="font-size:var(--fs-sm);color:var(--text-secondary);word-wrap:break-word;line-height:1.5;margin-bottom:8px;">${escapeHtml(item.description)}</div>` : ''}
                <div style="margin-top:auto;display:flex;justify-content:flex-end;border-top:1px solid var(--border-light);padding-top:12px;">
                  <a href="${escapeHtml(item.link)}" target="_blank" class="btn btn-outline btn-sm data-link" onclick="event.stopPropagation();" style="display:flex;align-items:center;gap:6px;font-size:var(--fs-2xs);height:28px;"><i data-lucide="external-link" class="lucide-sm"></i> Mở Link</a>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('') : '<div class="empty-state"><i data-lucide="file-text"></i><h3>Chưa có tài liệu</h3></div>'}
    </div>
  `;
}

export function bindDataEvents(rerender) {
  initLucide();
  document.querySelectorAll('.filter-pill[data-cat]').forEach(t => t.addEventListener('click', () => { activeCategory = t.dataset.cat; rerender(); }));
  document.getElementById('add-data-btn')?.addEventListener('click', async () => { if (await showDataModal()) rerender(); });
  document.querySelectorAll('.data-item').forEach(c => c.addEventListener('click', (e) => { if (e.target.closest('.data-link')) return; const i = getDataItems().find(i => i.id === c.dataset.itemId); if (i) showDataModal(i).then(r => { if (r) rerender(); }); }));
}
