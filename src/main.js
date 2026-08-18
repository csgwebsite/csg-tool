import './styles/global.css';
import './styles/components.css';
import './styles/layout.css';

import { initStore, getCurrentUser, getSettings, isAdmin, getMembers, setCurrentUser, getTasks, subscribe, getMyNotifications, markAsRead, markAllAsRead, getTask, getProject, logout } from './data/store.js';
import { renderSidebar, bindSidebarEvents } from './components/Sidebar.js';
import { showLoginModal } from './components/LoginModal.js';
import { renderDashboard, bindDashboardEvents } from './pages/Dashboard.js';
import { renderTasks, bindTasksEvents } from './pages/Tasks.js';
import { renderMembers, bindMembersEvents } from './pages/Members.js';
import { renderProjects, bindProjectsEvents } from './pages/Projects.js';
import { renderData, bindDataEvents } from './pages/Data.js';
import { renderAnalytics, bindAnalyticsEvents } from './pages/Analytics.js';
import { initLucide, generateId, escapeHtml, timeAgo } from './utils/helpers.js';
import { inject } from '@vercel/analytics';
import { supabase } from './data/supabase.js';
import { renderLoadingScreen, hideLoadingScreen, updateLoadingProgress } from './components/LoadingScreen.js';
import { customAlert } from './components/CustomModal.js';

inject();

// Detect native iOS and add class to body
const isNativeIOS = window.Capacitor?.isNativePlatform();
if (isNativeIOS) {
  document.body.classList.add('native-ios');
}

// Handle Deep Links (OAuth Redirects) - CHỈ chạy trên iOS native
if (isNativeIOS) {
  import('@capacitor/app').then(({ App }) => {
    App.addListener('appUrlOpen', async (event) => {
      const url = event.url;

      // Handle Universal Links (https://task.fptsx.space/...)
      if (url.startsWith('https://task.fptsx.space/')) {
        try {
          const urlObj = new URL(url);
          const path = urlObj.pathname;
          if (path && path !== '/') {
            window.history.replaceState(null, '', path);
            // Đợi store sẵn sàng rồi mới handle deep link
            setTimeout(() => handleDeepLinks(), 300);
          }
        } catch (e) {
          console.error('Universal Link error:', e);
        }
        return;
      }
      
      // Đóng trình duyệt in-app nếu đang mở
      try {
        const { Browser } = await import('@capacitor/browser');
        await Browser.close();
      } catch (e) { /* ignore */ }

      try {
        if (url.includes('access_token=')) {
          const hashPart = url.split('#')[1] || url.split('?')[1] || '';
          const params = new URLSearchParams(hashPart);
          const access_token = params.get('access_token');
          const refresh_token = params.get('refresh_token');
          if (access_token && refresh_token) {
            await supabase.auth.setSession({ access_token, refresh_token });
            window.location.reload();
            return;
          }
        }
        if (url.includes('code=')) {
          const queryPart = url.split('?')[1] || '';
          const params = new URLSearchParams(queryPart);
          const code = params.get('code');
          if (code) {
            await supabase.auth.exchangeCodeForSession(code);
            window.location.reload();
            return;
          }
        }
      } catch (e) {
        console.error('Deep link auth error:', e);
        window.location.reload();
      }
    });
  });
}

const pageTitles = {
  dashboard: 'Dashboard', tasks: 'Task của bạn', members: 'Member',
  projects: 'Project', data: 'Data', analytics: 'Analytics'
};

function getPage() {
  const p = window.location.pathname === '/' ? 'dashboard' : window.location.pathname.slice(1).split('/')[0];
  return pageTitles[p] ? p : 'dashboard';
}

let currentPage = getPage();

function renderBottomTabBar(activePage) {
  const adminUser = isAdmin();
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
    { id: 'tasks', label: 'Task', icon: 'check-square' },
    { id: 'members', label: 'Member', icon: 'users' },
    { id: 'projects', label: 'Project', icon: 'folder-kanban' },
    { id: 'data', label: 'Data', icon: 'file-text' },
  ];
  if (adminUser) tabs.push({ id: 'analytics', label: 'Analytics', icon: 'bar-chart-3' });
  const showLabels = tabs.length <= 5;

  return `
    <nav class="bottom-tab-bar" id="bottom-tab-bar">
      ${tabs.map(t => `
        <button class="bottom-tab ${activePage === t.id ? 'active' : ''}" data-page="${t.id}">
          <i data-lucide="${t.icon}"></i>
          ${showLabels ? `<span>${t.label}</span>` : ''}
        </button>
      `).join('')}
    </nav>
  `;
}

function renderApp(targetPage) {
  const user = getCurrentUser();
  if (!user) { document.getElementById('app').innerHTML = ''; showLoginModal().then(() => renderApp()); return; }

  const freshUser = getMembers().find(m => m.id === user.id);
  if (freshUser && freshUser.status === 'closed') {
    customAlert("Tài khoản của bạn đã bị đóng. Vui lòng liên hệ Admin.").then(() => {
      logout();
    });
    return;
  }

  const page = targetPage || currentPage;
  currentPage = page;
  const settings = getSettings();

  // Apply theme
  document.documentElement.setAttribute('data-theme', settings.theme || 'light');

  const app = document.getElementById('app');
  app.className = 'app';

  if (isNativeIOS) {
    // iOS native: bottom tab bar, no sidebar
    app.innerHTML = `
      <div class="main ios-main">
        <header class="header">
          <div class="header-left">
            <h2 class="header-title">${pageTitles[page] || 'Dashboard'}</h2>
          </div>
          <div class="header-right">
            <div class="notification-container" style="position:relative;">
              <button class="btn-icon btn-ghost" id="notif-bell" style="position:relative;">
                <i data-lucide="bell" style="width:20px;height:20px;color:var(--text-secondary);"></i>
                ${(() => {
                  const unread = getMyNotifications().filter(n => !n.isRead).length;
                  return unread > 0 ? `<span class="notif-badge" style="position:absolute;top:4px;right:4px;background:var(--danger);color:white;font-size:9px;font-weight:700;border-radius:10px;padding:0 4px;min-width:14px;height:14px;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 2px var(--bg-card);">${unread > 9 ? '9+' : unread}</span>` : '';
                })()}
              </button>
              <div class="notif-dropdown" id="notif-dropdown" style="display:none;position:absolute;top:100%;right:0;margin-top:8px;width:320px;background:var(--bg-card);border:1px solid var(--border-light);border-radius:var(--r-lg);box-shadow:var(--shadow-lg);z-index:100;overflow:hidden;backdrop-filter:blur(10px);">
                <div style="padding:12px 16px;border-bottom:1px solid var(--border-light);display:flex;justify-content:space-between;align-items:center;background:var(--bg-app);">
                    <div style="font-weight:700;font-size:var(--fs-sm);color:var(--text-primary);">Thông báo</div>
                    <button id="notif-read-all" style="font-size:var(--fs-2xs);color:var(--primary);background:none;border:none;cursor:pointer;font-weight:600;padding:4px 8px;border-radius:var(--r-sm);transition:all 0.2s;" class="hover-bg">Đánh dấu đã đọc</button>
                </div>
                <div class="notif-list" style="max-height:360px;overflow-y:auto;">
                    ${(() => {
                      const notifs = getMyNotifications().slice(0, 20);
                      if (!notifs.length) return '<div style="padding:24px;text-align:center;color:var(--text-disabled);font-size:var(--fs-xs);">Không có thông báo nào</div>';
                      return notifs.map(n => `
                        <div class="notif-item ${!n.isRead ? 'unread' : ''}" data-id="${n.id}" data-link="${n.linkId}" data-type="${n.type}" style="padding:12px 16px;border-bottom:1px solid var(--border-light);cursor:pointer;display:flex;gap:12px;transition:all 0.2s;${!n.isRead ? 'background:var(--primary-bg);' : 'background:transparent;'}">
                            <div style="width:32px;height:32px;border-radius:50%;background:${n.type === 'project' ? 'var(--warning-light)' : 'var(--success-light)'};display:flex;align-items:center;justify-content:center;flex-shrink:0;color:${n.type === 'project' ? 'var(--warning)' : 'var(--success)'};">
                                <i data-lucide="${n.type === 'project' ? 'folder' : 'check-circle'}" style="width:16px;height:16px;"></i>
                            </div>
                            <div style="flex:1;min-width:0;">
                                <div style="font-size:var(--fs-sm);font-weight:600;margin-bottom:2px;color:var(--text-primary);">${escapeHtml(n.title)}</div>
                                <div style="font-size:var(--fs-xs);color:var(--text-secondary);line-height:1.4;margin-bottom:4px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${escapeHtml(n.content)}</div>
                                <div style="font-size:9px;color:var(--text-tertiary);font-weight:500;">${timeAgo(new Date(n.createdAt))}</div>
                            </div>
                            ${!n.isRead ? `<div style="width:8px;height:8px;border-radius:50%;background:var(--primary);flex-shrink:0;margin-top:4px;"></div>` : ''}
                        </div>
                      `).join('');
                    })()}
                </div>
              </div>
            </div>
          </div>
        </header>
        <div id="page-container">
          ${renderPage(page)}
        </div>
      </div>
      ${renderBottomTabBar(page)}
    `;
  } else {
    // Web: keep sidebar layout
    app.innerHTML = `
      ${renderSidebar(page)}
      <div class="main">
        <header class="header">
          <div class="header-left">
            <button class="mobile-menu-btn" id="mobile-menu-toggle"><i data-lucide="menu"></i></button>
            <h2 class="header-title">${pageTitles[page] || 'Dashboard'}</h2>
          </div>
          <div class="header-right">
            <div class="notification-container" style="position:relative;">
              <button class="btn-icon btn-ghost" id="notif-bell" style="position:relative;">
                <i data-lucide="bell" style="width:20px;height:20px;color:var(--text-secondary);"></i>
                ${(() => {
                  const unread = getMyNotifications().filter(n => !n.isRead).length;
                  return unread > 0 ? `<span class="notif-badge" style="position:absolute;top:4px;right:4px;background:var(--danger);color:white;font-size:9px;font-weight:700;border-radius:10px;padding:0 4px;min-width:14px;height:14px;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 2px var(--bg-card);">${unread > 9 ? '9+' : unread}</span>` : '';
                })()}
              </button>
              <div class="notif-dropdown" id="notif-dropdown" style="display:none;position:absolute;top:100%;right:0;margin-top:8px;width:320px;background:var(--bg-card);border:1px solid var(--border-light);border-radius:var(--r-lg);box-shadow:var(--shadow-lg);z-index:100;overflow:hidden;backdrop-filter:blur(10px);">
                <div style="padding:12px 16px;border-bottom:1px solid var(--border-light);display:flex;justify-content:space-between;align-items:center;background:var(--bg-app);">
                    <div style="font-weight:700;font-size:var(--fs-sm);color:var(--text-primary);">Thông báo</div>
                    <button id="notif-read-all" style="font-size:var(--fs-2xs);color:var(--primary);background:none;border:none;cursor:pointer;font-weight:600;padding:4px 8px;border-radius:var(--r-sm);transition:all 0.2s;" class="hover-bg">Đánh dấu đã đọc</button>
                </div>
                <div class="notif-list" style="max-height:360px;overflow-y:auto;">
                    ${(() => {
                      const notifs = getMyNotifications().slice(0, 20);
                      if (!notifs.length) return '<div style="padding:24px;text-align:center;color:var(--text-disabled);font-size:var(--fs-xs);">Không có thông báo nào</div>';
                      return notifs.map(n => `
                        <div class="notif-item ${!n.isRead ? 'unread' : ''}" data-id="${n.id}" data-link="${n.linkId}" data-type="${n.type}" style="padding:12px 16px;border-bottom:1px solid var(--border-light);cursor:pointer;display:flex;gap:12px;transition:all 0.2s;${!n.isRead ? 'background:var(--primary-bg);' : 'background:transparent;'}">
                            <div style="width:32px;height:32px;border-radius:50%;background:${n.type === 'project' ? 'var(--warning-light)' : 'var(--success-light)'};display:flex;align-items:center;justify-content:center;flex-shrink:0;color:${n.type === 'project' ? 'var(--warning)' : 'var(--success)'};">
                                <i data-lucide="${n.type === 'project' ? 'folder' : 'check-circle'}" style="width:16px;height:16px;"></i>
                            </div>
                            <div style="flex:1;min-width:0;">
                                <div style="font-size:var(--fs-sm);font-weight:600;margin-bottom:2px;color:var(--text-primary);">${escapeHtml(n.title)}</div>
                                <div style="font-size:var(--fs-xs);color:var(--text-secondary);line-height:1.4;margin-bottom:4px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${escapeHtml(n.content)}</div>
                                <div style="font-size:9px;color:var(--text-tertiary);font-weight:500;">${timeAgo(new Date(n.createdAt))}</div>
                            </div>
                            ${!n.isRead ? `<div style="width:8px;height:8px;border-radius:50%;background:var(--primary);flex-shrink:0;margin-top:4px;"></div>` : ''}
                        </div>
                      `).join('');
                    })()}
                </div>
              </div>
            </div>
          </div>
        </header>
        <div id="page-container">
          ${renderPage(page)}
        </div>
      </div>
    `;
  }

  initLucide();
  if (!isNativeIOS) {
    bindSidebarEvents(navigateTo);
    bindMobileMenu();
  }
  bindPageEvents(page);

  // Bind bottom tab bar events (iOS)
  document.querySelectorAll('.bottom-tab[data-page]').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.page));
  });

  // Pull-to-refresh for iOS native (init once)
  if (isNativeIOS && !window._ptrInit) {
    window._ptrInit = true;
    let startY = 0, pulling = false, pullIndicator = null;

    const createIndicator = () => {
      const existing = document.getElementById('pull-refresh-indicator');
      if (existing) existing.remove();
      const el = document.createElement('div');
      el.id = 'pull-refresh-indicator';
      el.style.cssText = 'position:fixed;top:env(safe-area-inset-top, 0px);left:50%;transform:translateX(-50%) translateY(-60px);z-index:9999;width:36px;height:36px;border-radius:50%;background:var(--bg-card);box-shadow:0 2px 12px rgba(0,0,0,0.15);display:flex;align-items:center;justify-content:center;transition:transform 0.2s ease;';
      el.innerHTML = '<div style="width:20px;height:20px;border:2.5px solid var(--border);border-top-color:var(--primary);border-radius:50%;animation:ptr-spin 0.6s linear infinite;"></div>';
      document.body.appendChild(el);
      if (!document.getElementById('ptr-style')) {
        const style = document.createElement('style');
        style.id = 'ptr-style';
        style.textContent = '@keyframes ptr-spin { to { transform: rotate(360deg); } }';
        document.head.appendChild(style);
      }
      return el;
    };

    document.addEventListener('touchstart', (e) => {
      if (window.scrollY <= 0) {
        startY = e.touches[0].clientY;
        pulling = true;
      }
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      if (!pulling) return;
      const dy = e.touches[0].clientY - startY;
      if (dy > 10 && window.scrollY <= 0) {
        if (!pullIndicator) pullIndicator = createIndicator();
        const clamped = Math.min(dy * 0.4, 70);
        pullIndicator.style.transform = `translateX(-50%) translateY(${clamped}px)`;
        pullIndicator.style.opacity = Math.min(dy / 100, 1);
      } else if (dy < 0) {
        pulling = false;
        if (pullIndicator) { pullIndicator.remove(); pullIndicator = null; }
      }
    }, { passive: true });

    document.addEventListener('touchend', () => {
      if (!pulling) return;
      pulling = false;
      if (pullIndicator) {
        const match = pullIndicator.style.transform.match(/translateY\(([^p]+)px\)/);
        const dy = parseFloat(match?.[1] || '0');
        if (dy >= 50) {
          pullIndicator.style.transform = 'translateX(-50%) translateY(50px)';
          setTimeout(() => {
            renderApp(currentPage);
            pullIndicator?.remove();
            pullIndicator = null;
          }, 300);
        } else {
          pullIndicator.style.transform = 'translateX(-50%) translateY(-60px)';
          pullIndicator.style.opacity = '0';
          setTimeout(() => { pullIndicator?.remove(); pullIndicator = null; }, 250);
        }
      }
    }, { passive: true });
  }

  // Notification Listeners
  const bell = document.getElementById('notif-bell');
  const dropdown = document.getElementById('notif-dropdown');

  if (bell && dropdown) {
    bell.addEventListener('click', (e) => {
      e.stopPropagation();
      const isShowing = dropdown.style.display === 'block';
      document.querySelectorAll('.notif-dropdown').forEach(d => d.style.display = 'none');
      if (!isShowing) dropdown.style.display = 'block';
    });

    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target) && e.target !== bell) {
        dropdown.style.display = 'none';
      }
    });

    document.getElementById('notif-read-all')?.addEventListener('click', (e) => {
      e.stopPropagation();
      markAllAsRead();
    });

    document.querySelectorAll('.notif-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const notifId = item.dataset.id;
        markAsRead(notifId);
        dropdown.style.display = 'none';

        const linkId = item.dataset.link;
        const type = item.dataset.type;

        if (linkId) {
          if (type === 'project') {
            import('./components/ProjectModal.js').then(mod => {
              const p = getProject(linkId);
              if (p) {
                Object.assign(window, { _modalOpen: true });
                mod.showProjectModal(p, true).then(() => { window._modalOpen = false; renderApp(currentPage); });
              }
            });
          } else {
            import('./components/TaskModal.js').then(mod => {
              const t = getTask(linkId);
              if (t) {
                Object.assign(window, { _modalOpen: true });
                mod.showTaskModal(t).then(() => { window._modalOpen = false; renderApp(currentPage); });
              }
            });
          }
        }
      });
    });
  }
}

function handleDeepLinks() {
  const path = window.location.pathname.slice(1);
  if (!path || pageTitles[path]) return false;

  if (path.startsWith('tasks/')) {
    import('./components/TaskModal.js').then(mod => {
      import('./data/store.js').then(({ getTask }) => {
        const t = getTask(path.split('/')[1]);
        const user = getCurrentUser();
        if (t) {
          const canSee = isAdmin() || (user?.projectRoles && user.projectRoles[t.projectId]) || t.assigneeId === user?.id || t.createdBy === user?.id || t.reviewerId === user?.id || t.assignerId === user?.id;
          if (canSee) {
            Object.assign(window, { _modalOpen: true });
            mod.showTaskModal(t).then(() => { window._modalOpen = false; renderApp(currentPage); });
          } else {
            customAlert('Bạn không có quyền xem task này.');
            window.history.replaceState(null, '', '/' + currentPage);
          }
        }
      });
    });
    return true;
  }
  if (path.startsWith('members/')) {
    import('./components/MemberModal.js').then(mod => {
      import('./data/store.js').then(({ getMember }) => {
        const m = getMember(path.split('/')[1]);
        if (m) Object.assign(window, { _modalOpen: true }), mod.showMemberModal(m, true).then(() => { window._modalOpen = false; renderApp(currentPage); });
      });
    });
    return true;
  }
  if (path.startsWith('data/')) {
    import('./components/DataModal.js').then(mod => {
      import('./data/store.js').then(({ getDataItems }) => {
        const d = getDataItems().find(i => i.id === path.split('/')[1]);
        if (d) Object.assign(window, { _modalOpen: true }), mod.showDataModal(d).then(() => { window._modalOpen = false; renderApp(currentPage); });
      });
    });
    return true;
  }
  if (path.startsWith('projects/')) {
    import('./components/ProjectModal.js').then(mod => {
      import('./data/store.js').then(({ getProjects }) => {
        const p = getProjects().find(proj => proj.code === path.split('/')[1] || proj.id === path.split('/')[1]);
        const user = getCurrentUser();
        if (p) {
          const canSee = isAdmin() || (user?.projectRoles && user.projectRoles[p.id]);
          if (canSee) {
            Object.assign(window, { _modalOpen: true });
            mod.showProjectModal(p, true).then(() => { window._modalOpen = false; renderApp(currentPage); });
          } else {
            customAlert('Bạn không có quyền xem dự án này.');
            window.history.replaceState(null, '', '/' + currentPage);
          }
        }
      });
    });
    return true;
  }
  return false;
}

function renderPage(page) {
  if (page === 'analytics' && !isAdmin()) return renderDashboard();
  switch (page) {
    case 'dashboard': return renderDashboard();
    case 'tasks': return renderTasks();
    case 'members': return renderMembers();
    case 'projects': return renderProjects();
    case 'data': return renderData();
    case 'analytics': return renderAnalytics();
    default: return renderDashboard();
  }
}

function bindPageEvents(page) {
  const rerender = () => renderApp(page);
  switch (page) {
    case 'dashboard': bindDashboardEvents(); break;
    case 'tasks': bindTasksEvents(rerender); break;
    case 'members': bindMembersEvents(rerender); break;
    case 'projects': bindProjectsEvents(rerender); break;
    case 'data': bindDataEvents(rerender); break;
    case 'analytics': bindAnalyticsEvents(rerender); break;
  }
}

function navigateTo(page) {
  if (page === null) { renderApp(currentPage); return; } 
  currentPage = page;
  const path = page === 'dashboard' ? '/' : '/' + page;
  window.history.pushState(null, '', path);
  renderApp(page);
}

function bindMobileMenu() {
  document.getElementById('mobile-menu-toggle')?.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.toggle('open');
    document.getElementById('sidebar-overlay')?.classList.toggle('show');
  });
}

async function checkAuthAndRender() {
  document.querySelectorAll('.loading-screen').forEach(el => el.remove());
  document.body.insertAdjacentHTML('beforeend', renderLoadingScreen());
  updateLoadingProgress(10);

  const { data: { session } } = await supabase.auth.getSession();
  updateLoadingProgress(30);

  const authUser = session?.user;

  if (!authUser) {
    hideLoadingScreen();
    document.getElementById('app').innerHTML = '';
    showLoginModal().then(() => checkAuthAndRender());
    return;
  }

  updateLoadingProgress(50);
  await initStore();
  updateLoadingProgress(80);

  const email = authUser.email;
  const normalizedEmail = String(email).toLowerCase().trim();
  const members = getMembers();
  const matchedMember = members.find(m => {
    const ms = [m.emailFE, m.emailFPT, m.gmail].filter(Boolean)
      .map(e => String(e).toLowerCase().trim())
      .filter(e => e.length > 0);
    return ms.includes(normalizedEmail);
  });

  if (matchedMember) {
    if (matchedMember.status === 'closed') {
      await customAlert("Tài khoản của bạn đã bị đóng. Vui lòng liên hệ Admin.");
      supabase.auth.signOut();
      setCurrentUser(null);
      hideLoadingScreen();
      return;
    }
    const memberEmails = [matchedMember.emailFE, matchedMember.emailFPT, matchedMember.gmail]
      .filter(Boolean).map(e => String(e).toLowerCase().trim());
    const isMasterUser = matchedMember.isMaster || normalizedEmail === 'dhphat12@gmail.com' || memberEmails.includes('dhphat12@gmail.com');
    const isAdminUser = matchedMember.isAdmin || isMasterUser;
    setCurrentUser({ ...matchedMember, sessionEmail: email, isAdmin: isAdminUser, isMaster: isMasterUser });
  } else if (normalizedEmail === 'dhphat12@gmail.com') {
    setCurrentUser({
      id: authUser.id,
      fullName: authUser.user_metadata?.full_name || email,
      email: email,
      position: 'Master Hệ Thống',
      avatar: authUser.user_metadata?.avatar_url,
      isAdmin: true,
      isMaster: true,
      sessionEmail: email
    });
  } else {
    await customAlert("Tài khoản của bạn (" + email + ") không có quyền truy cập hệ thống. Vui lòng liên hệ Admin.");
    supabase.auth.signOut();
    setCurrentUser(null);
    hideLoadingScreen();
    return;
  }

  // Lắng nghe sự kiện đăng xuất
  supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT') {
      setCurrentUser(null);
      document.getElementById('app').innerHTML = '';
      showLoginModal().then(() => checkAuthAndRender());
    }
  });

  updateLoadingProgress(100);
  renderApp();
  handleDeepLinks();
  hideLoadingScreen();
}

window.addEventListener('popstate', () => {
  if (window._modalOpen) return;
  if (handleDeepLinks()) return;
  const p = getPage();
  if (p !== currentPage) renderApp(p);
});

checkAuthAndRender();

subscribe(() => {
  const user = getCurrentUser();
  if (user) {
    const freshUser = getMembers().find(m => m.id === user.id);
    if (freshUser && freshUser.status === 'closed') {
      customAlert("Tài khoản của bạn đã bị đóng. Vui lòng liên hệ Admin.").then(() => {
        logout();
      });
      return;
    }
  }

  if (window._modalOpen) return;
  const p = document.getElementById('page-container');
  if (p) {
    p.innerHTML = renderPage(currentPage);
    bindPageEvents(currentPage);
  }

  const bell = document.getElementById('notif-bell');
  if (bell) {
    const unread = getMyNotifications().filter(n => !n.isRead).length;
    bell.innerHTML = `
      <i data-lucide="bell" style="width:20px;height:20px;color:var(--text-secondary);"></i>
      ${unread > 0 ? `<span class="notif-badge" style="position:absolute;top:4px;right:4px;background:var(--danger);color:white;font-size:9px;font-weight:700;border-radius:10px;padding:0 4px;min-width:14px;height:14px;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 2px var(--bg-card);">${unread > 9 ? '9+' : unread}</span>` : ''}
    `;
    initLucide();
  }
});

