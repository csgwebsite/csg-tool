import { initLucide } from '../utils/helpers.js';
import { supabase } from '../data/supabase.js';
import { getSettings } from '../data/store.js';
import { customAlert } from './CustomModal.js';

export function showLoginModal() {
  return new Promise((resolve) => {
    const root = document.getElementById('app');

    root.className = '';
    root.style.cssText = 'min-height:100vh;display:flex;align-items:center;justify-content:center;background:#1f1f20;';

    const settings = getSettings();
    const logoBlock = settings?.customLogo
      ? `<div style="width:48px;height:48px;border-radius:12px;margin:0 auto 12px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#8b64fd,#7c3aed);background-image:url(${settings.customLogo});background-size:cover;background-position:center;"></div>`
      : `<div style="width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,#8b64fd,#7c3aed);display:inline-flex;align-items:center;justify-content:center;font-size:18px;font-weight:800;color:white;margin-bottom:12px;">C</div>`;

    root.innerHTML = `
      <div style="background:#fff;border-radius:20px;width:100%;max-width:400px;box-shadow:0 20px 25px rgba(0,0,0,0.3);overflow:hidden;">
        <div style="text-align:center;padding:28px 24px 16px;">
          ${logoBlock}
          <h2 style="font-size:16px;font-weight:700;color:#1f1f20;">Cóc Task</h2>
          <p style="font-size:11px;color:#9ca3af;margin-top:4px;">CLB Truyền thông Cóc Sài Gòn</p>
        </div>
        <div style="padding:0 16px 20px;display:flex;flex-direction:column;gap:12px;">
            <button type="button" id="google-login-btn" style="display:flex;align-items:center;justify-content:center;gap:12px;padding:12px 14px;cursor:pointer;border-radius:12px;border:1px solid #e5e7eb;background:#ffffff;width:100%;font-family:inherit;font-size:14px;font-weight:600;color:#1f1f20;transition:all 0.2s ease;">
              <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Đăng nhập với Google
            </button>
        </div>
        <div style="text-align:center;padding:12px;font-size:10px;color:#6b7280;border-top:1px solid #f3f4f6;">CLB Truyền thông Cóc Sài Gòn © 2026</div>
      </div>
    `;

    initLucide();

    const btn = root.querySelector('#google-login-btn');
    btn.onmouseover = function () { this.style.background = '#f9fafb'; };
    btn.onmouseout = function () { this.style.background = '#ffffff'; };
    btn.onclick = async function () {
      btn.innerHTML = 'Đang kết nối...';
      const isNative = window.Capacitor?.isNativePlatform();

      if (isNative) {
        try {
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: window.location.origin + '/auth-callback.html',
              skipBrowserRedirect: true,
            }
          });
          if (error) {
            await customAlert('Lỗi đăng nhập: ' + error.message, 'Lỗi');
            btn.innerHTML = 'Đăng nhập với Google';
            return;
          }
          if (data?.url) {
            const { Browser } = await import('@capacitor/browser');
            await Browser.open({ url: data.url });
          }
        } catch (e) {
          await customAlert('Lỗi: ' + e.message, 'Lỗi');
          btn.innerHTML = 'Đăng nhập với Google';
        }
      } else {
        try {
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: window.location.origin
            }
          });
          if (error) {
            await customAlert('Lỗi đăng nhập: ' + error.message, 'Lỗi');
            btn.innerHTML = 'Đăng nhập với Google';
          }
        } catch (e) {
          await customAlert('Lỗi đăng nhập: ' + e.message, 'Lỗi');
          btn.innerHTML = 'Đăng nhập với Google';
        }
      }
    };
  });
}
