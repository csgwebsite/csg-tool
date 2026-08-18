import { escapeHtml, initLucide, getModalOverlayStyle } from '../utils/helpers.js';

function createModalContainer() {
  document.body.classList.add('modal-open');
  const container = document.createElement('div');
  document.body.appendChild(container);
  return container;
}

function destroyModalContainer(container) {
  document.body.classList.remove('modal-open');
  if (container && container.parentNode) {
    container.parentNode.removeChild(container);
  }
}

export function customAlert(message, title = 'Thông báo') {
  return new Promise((resolve) => {
    const container = createModalContainer();
    container.innerHTML = `
      <div class="modal-overlay" style="z-index: 999999; display: flex; align-items: center; justify-content: center; ${getModalOverlayStyle()}">
        <div class="modal-content" style="max-width: 400px; text-align: center; padding: 32px 24px; border-radius: var(--r-xl); box-shadow: var(--shadow-xl); animation: scaleIn 0.2s ease-out; background: var(--bg-card); margin: 0 16px; padding-bottom: calc(32px + env(safe-area-inset-bottom));">
          <div style="margin-bottom: 20px;">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: var(--info-bg); color: var(--info); display: flex; align-items: center; justify-content: center; margin: 0 auto; box-shadow: 0 4px 12px var(--info-bg);">
              <i data-lucide="info" style="width: 28px; height: 28px;"></i>
            </div>
          </div>
          <h3 style="margin: 0 0 12px 0; font-size: 1.25rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.01em;">${title}</h3>
          <p style="margin: 0 0 28px 0; color: var(--text-secondary); font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
          <button class="btn btn-primary" id="custom-alert-ok" style="width: 100%; height: 44px; border-radius: var(--r-md); font-weight: 600; font-size: 14px; letter-spacing: 0.02em;">Đã hiểu</button>
        </div>
      </div>
    `;
    initLucide();
    
    const finalize = () => {
      destroyModalContainer(container);
      resolve();
    };
    
    container.querySelector('#custom-alert-ok').addEventListener('click', finalize);
  });
}

export function customConfirm(message, title = 'Xác nhận', isDanger = false) {
  return new Promise((resolve) => {
    const container = createModalContainer();
    const iconColor = isDanger ? 'var(--danger)' : 'var(--warning)';
    const iconBg = isDanger ? 'var(--danger-bg)' : 'var(--warning-bg)';
    const iconName = isDanger ? 'alert-triangle' : 'help-circle';
    const btnClass = isDanger ? 'btn btn-danger' : 'btn btn-primary';

    container.innerHTML = `
      <div class="modal-overlay" style="z-index: 999999; display: flex; align-items: center; justify-content: center; ${getModalOverlayStyle()}">
        <div class="modal-content" style="max-width: 420px; padding: 24px; border-radius: var(--r-xl); box-shadow: var(--shadow-xl); animation: scaleIn 0.2s ease-out; background: var(--bg-card); margin: 0 16px;">
          <div style="display: flex; gap: 16px; margin-bottom: 28px; align-items: flex-start;">
            <div style="width: 48px; height: 48px; flex-shrink: 0; border-radius: 50%; background: ${iconBg}; color: ${iconColor}; display: flex; align-items: center; justify-content: center;">
              <i data-lucide="${iconName}" style="width: 24px; height: 24px;"></i>
            </div>
            <div style="padding-top: 4px;">
              <h3 style="margin: 0 0 8px 0; font-size: 1.15rem; font-weight: 700; color: var(--text-primary);">${title}</h3>
              <p style="margin: 0; color: var(--text-secondary); font-size: 14px; line-height: 1.5; white-space: pre-wrap;">${message}</p>
            </div>
          </div>
          <div style="display: flex; gap: 12px; justify-content: flex-end;">
            <button class="btn btn-outline" id="custom-confirm-cancel" style="height: 40px; padding: 0 20px; border-radius: var(--r-md); font-weight: 600; font-size: 13px;">Hủy</button>
            <button class="${btnClass}" id="custom-confirm-ok" style="height: 40px; padding: 0 20px; border-radius: var(--r-md); font-weight: 600; font-size: 13px; border: none; ${isDanger ? 'background: var(--danger); box-shadow: 0 4px 12px var(--danger)40;' : 'background: var(--primary); box-shadow: 0 4px 12px var(--primary)40;'}">Xác nhận</button>
          </div>
        </div>
      </div>
    `;
    initLucide();
    
    const finalize = (result) => {
      destroyModalContainer(container);
      resolve(result);
    };
    
    container.querySelector('#custom-confirm-cancel').addEventListener('click', () => finalize(false));
    container.querySelector('#custom-confirm-ok').addEventListener('click', () => finalize(true));
  });
}

export function customPrompt(message, defaultValue = '', title = 'Nhập thông tin') {
  return new Promise((resolve) => {
    const container = createModalContainer();
    container.innerHTML = `
      <div class="modal-overlay" style="z-index: 999999; display: flex; align-items: center; justify-content: center; ${getModalOverlayStyle()}">
        <div class="modal-content" style="max-width: 420px; padding: 24px; border-radius: var(--r-xl); box-shadow: var(--shadow-xl); animation: scaleIn 0.2s ease-out; background: var(--bg-card); margin: 0 16px;">
          <div style="display: flex; gap: 16px; margin-bottom: 20px; align-items: flex-start;">
             <div style="width: 48px; height: 48px; flex-shrink: 0; border-radius: 50%; background: var(--primary-bg); color: var(--primary); display: flex; align-items: center; justify-content: center;">
              <i data-lucide="edit-3" style="width: 24px; height: 24px;"></i>
            </div>
            <div style="flex: 1; min-width: 0; padding-top: 4px;">
              <h3 style="margin: 0 0 8px 0; font-size: 1.15rem; font-weight: 700; color: var(--text-primary);">${title}</h3>
              <p style="margin: 0; color: var(--text-secondary); font-size: 14px; line-height: 1.5; white-space: pre-wrap;">${message}</p>
            </div>
          </div>
          <div class="form-group" style="margin-bottom: 24px;">
            <input type="text" class="form-control" id="custom-prompt-input" value="${escapeHtml(defaultValue)}" style="width: 100%; font-size: 14px; padding: 10px 14px; border-radius: var(--r-md); border: 1.5px solid var(--border);" />
          </div>
          <div style="display: flex; gap: 12px; justify-content: flex-end;">
            <button class="btn btn-outline" id="custom-prompt-cancel" style="height: 40px; padding: 0 20px; border-radius: var(--r-md); font-weight: 600; font-size: 13px;">Hủy</button>
            <button class="btn btn-primary" id="custom-prompt-ok" style="height: 40px; padding: 0 20px; border-radius: var(--r-md); font-weight: 600; font-size: 13px; border: none; background: var(--primary); box-shadow: 0 4px 12px var(--primary)40;">Xác nhận</button>
          </div>
        </div>
      </div>
    `;
    initLucide();
    
    const input = container.querySelector('#custom-prompt-input');
    setTimeout(() => {
        if (input) {
            input.focus();
            input.setSelectionRange(0, input.value.length);
        }
    }, 100);

    const finalize = (result) => {
      destroyModalContainer(container);
      resolve(result);
    };
    
    container.querySelector('#custom-prompt-cancel').addEventListener('click', () => finalize(null));
    container.querySelector('#custom-prompt-ok').addEventListener('click', () => finalize(input.value));
    
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        finalize(input.value);
      } else if (e.key === 'Escape') {
        finalize(null);
      }
    });
  });
}
