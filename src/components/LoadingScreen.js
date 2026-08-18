let currentPct = 0;
let targetPct = 0;
let animId = null;
let startTime = null;
const SIM_DURATION = 5000; // 5 seconds
const SIM_TARGET = 95;
let isFinished = false;

function animateProgress(timestamp) {
  if (!startTime) startTime = timestamp;
  const elapsed = timestamp - startTime;

  // Simulate progress to 95% over 5 seconds
  let simPct = Math.min(SIM_TARGET, (elapsed / SIM_DURATION) * SIM_TARGET);

  // If explicitly finished or real progress is higher, use that
  if (isFinished) targetPct = 100;

  let effectiveTarget = Math.max(simPct, targetPct);

  if (currentPct < effectiveTarget) {
    currentPct += (effectiveTarget - currentPct) * 0.1 + 0.2;
  } else if (currentPct < 100 && !isFinished) {
    // Very subtle jitter or crawl if we've reached effective target but not 100
    currentPct += 0.01;
  }

  if (currentPct > 100) currentPct = 100;

  const el = document.getElementById('loading-percent');
  if (el) el.textContent = `${Math.round(currentPct)}%`;

  const fillEl = document.getElementById('loading-fill');
  if (fillEl) fillEl.style.height = `${currentPct}%`;

  if (currentPct < 100) {
    animId = requestAnimationFrame(animateProgress);
  } else {
    animId = null;
  }
}

export function renderLoadingScreen() {
  currentPct = 0;
  targetPct = 0;
  startTime = null;
  isFinished = false;

  // Start animation loop
  if (!animId) animId = requestAnimationFrame(animateProgress);

  return `
    <div id="loading-screen" style="position:fixed; inset:0; background:#000000; z-index:9999; display:flex; flex-direction:column; align-items:center; justify-content:center; overflow:hidden;">
      <div id="loading-fill" style="position:absolute; bottom:0; left:0; right:0; background:var(--primary, #8b64fd); height:0%; transition:height 0.1s linear;"></div>
      <div class="loading-info-wrap">
        <div id="loading-percent">0%</div>
      </div>

      <style>
        .loading-info-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 10;
        }

        #loading-percent {
          color: #ffffff;
          font-family: var(--font);
          font-size: 64px;
          font-weight: 800;
          font-variant-numeric: tabular-nums;
          letter-spacing: -0.04em;
          animation: pulse-opacity 2s ease-in-out infinite alternate;
        }

        @keyframes pulse-opacity {
          0% { opacity: 0.7; }
          100% { opacity: 1; }
        }

        @media (max-width: 480px) {
          #loading-percent { font-size: 48px; }
        }
      </style>
    </div>
  `;
}

export function updateLoadingProgress(pct) {
  targetPct = Math.min(100, pct);
}

export function hideLoadingScreen() {
  const el = document.getElementById('loading-screen');
  if (el) {
    isFinished = true;
    targetPct = 100;

    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transition = 'opacity 0.2s ease-out';
      setTimeout(() => el.remove(), 200);
    }, 50);
  }
}
