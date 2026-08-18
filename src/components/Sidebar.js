import { getCurrentUser, isAdmin, logout, getSettings, updateSettings } from '../data/store.js';
import { renderAvatar, initLucide, escapeHtml } from '../utils/helpers.js';

export function renderSidebar(activePage) {
  const user = getCurrentUser();
  const settings = getSettings();
  const adminUser = isAdmin();
  const isDark = settings.theme === 'dark';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
    { id: 'tasks', label: 'Task', icon: 'check-square' },
    { id: 'members', label: 'Member', icon: 'users' },
    { id: 'projects', label: 'Project', icon: 'folder-kanban' },
    { id: 'data', label: 'Data', icon: 'file-text' },
  ];
  if (adminUser) navItems.push({ id: 'analytics', label: 'Analytics', icon: 'bar-chart-3' });

  const logoStyle = settings.customLogo ? `background-image:url(${settings.customLogo});background-size:cover;font-size:0;` : '';

  return `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-logo">
        <div class="sidebar-logo-icon" style="${logoStyle}">${settings.customLogo ? '' : 'F'}</div>
        <div class="sidebar-logo-text">FES Task<span>FPT Student Experience Space</span></div>
      </div>
      <nav class="sidebar-nav">
        <div class="sidebar-section-title">Menu</div>
        ${navItems.map(i => `
          <button class="nav-item ${activePage === i.id ? 'active' : ''}" data-page="${i.id}">
            <i data-lucide="${i.icon}"></i><span>${i.label}</span>
          </button>
        `).join('')}
      </nav>
    </aside>
    <div class="sidebar-overlay" id="sidebar-overlay"></div>
  `;
}

export function bindSidebarEvents(onNavigate) {
  document.querySelectorAll('.nav-item[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      onNavigate(btn.dataset.page);
      document.getElementById('sidebar')?.classList.remove('open');
      document.getElementById('sidebar-overlay')?.classList.remove('show');
    });
  });
  document.getElementById('sidebar-overlay')?.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.remove('open');
    document.getElementById('sidebar-overlay')?.classList.remove('show');
  });
}
