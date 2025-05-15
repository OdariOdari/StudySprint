// --- TIMER LOGIC ---
let startTime, timerInterval, accumulated = 0, running = false, paused = false;
let currentStudy = null;
let sessions = JSON.parse(localStorage.getItem('studysprint-sessions') || '[]');

const studyTitleElement = document.getElementById("study-title");
const timerElement = document.getElementById("timer");
const pauseBtn = document.getElementById("pause-btn");
const resumeBtn = document.getElementById("resume-btn");
const stopBtn = document.getElementById("stop-btn");

// Format ms as HH:MM:SS
function formatTime(ms) {
  let totalSeconds = Math.floor(ms / 1000);
  let h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
  let m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
  let s = (totalSeconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function tick() {
  timerElement.textContent = formatTime(accumulated + (running && !paused ? Date.now() - startTime : 0));
}

function startTimer() {
  startTime = Date.now();
  running = true;
  paused = false;
  pauseBtn.disabled = false;
  stopBtn.disabled = false;
  pauseBtn.style.display = "";
  resumeBtn.style.display = "none";
  timerInterval = setInterval(tick, 500);
  tick();
}

function pauseTimer() {
  if (!running || paused) return;
  accumulated += Date.now() - startTime;
  paused = true;
  pauseBtn.style.display = "none";
  resumeBtn.style.display = "";
  tick();
}

function resumeTimer() {
  if (!running || !paused) return;
  startTime = Date.now();
  paused = false;
  pauseBtn.style.display = "";
  resumeBtn.style.display = "none";
  tick();
}

function stopTimer(final = true) {
  if (!running) return;
  clearInterval(timerInterval);
  running = false;
  let endAccum = accumulated + (paused ? 0 : Date.now() - startTime);
  timerElement.textContent = formatTime(endAccum);
  pauseBtn.disabled = true;
  stopBtn.disabled = true;
  pauseBtn.style.display = "";
  resumeBtn.style.display = "none";
  // Only save session if requested and there is a study
  if (final && currentStudy && endAccum > 0) {
    sessions.unshift({ title: currentStudy, duration: endAccum, timestamp: Date.now() });
    sessions = sessions.slice(0, 25);
    localStorage.setItem('studysprint-sessions', JSON.stringify(sessions));
    updateSessionList();
  }
  accumulated = 0;
  paused = false;
  currentStudy = null;
  studyTitleElement.textContent = "";
}

// Button events
pauseBtn.onclick = pauseTimer;
resumeBtn.onclick = resumeTimer;
stopBtn.onclick = function () {
  stopTimer(true);
};

// Modal handling
document.getElementById("study-modal").addEventListener("submit", function (e) {
  e.preventDefault();
  const studySubject = document.getElementById("study-input").value.trim();
  if (!studySubject) return;
  document.getElementById("modal-backdrop").style.display = "none";
  studyTitleElement.textContent = currentStudy = studySubject;
  timerElement.textContent = "00:00:00";
  pauseBtn.disabled = false;
  stopBtn.disabled = false;
  accumulated = 0;
  paused = false;
  startTimer();
});

// Autofocus input and theme/session setup
window.onload = () => {
  document.getElementById("study-input").focus();
  updateSessionList();
  let saved = localStorage.getItem('studysprint-theme');
  if (saved && saved === 'dark') setTheme('dark');
  // Protect against accidental leave on running session
  window.addEventListener("beforeunload", function (e) {
    if (running && !paused) {
      e.preventDefault();
      e.returnValue = '';
    }
  });

  // Attach clear-history handler ONCE here
  const clearBtn = document.getElementById('clear-sessions-btn');
  if (clearBtn) {
    clearBtn.onclick = function() {
      if (confirm('Clear all study session history?')) {
        sessions = [];
        localStorage.removeItem('studysprint-sessions');
        updateSessionList();
      }
    };
  }

};

// --- THEME TOGGLING ---
function setTheme(theme) {
  if (theme) document.documentElement.setAttribute('data-theme', theme);
  else document.documentElement.removeAttribute('data-theme');
  let isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.getElementById('theme-sun').classList.toggle('show', !isDark);
  document.getElementById('theme-moon').classList.toggle('show', isDark);
  if (isDark)
    localStorage.setItem('studysprint-theme', 'dark');
  else
    localStorage.setItem('studysprint-theme', 'light');
}
document.getElementById('theme-toggle').addEventListener('click', function () {
  let isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  setTheme(isDark ? undefined : 'dark');
});

// --- MENU (SIDE PANEL) ---
const menuBackdrop = document.getElementById('side-menu-backdrop');
const sideMenu = document.getElementById('side-menu');
const menuToggle = document.getElementById('menu-toggle');

function openMenu() {
  sideMenu.classList.add('open');
  menuBackdrop.style.display = 'block';
  setTimeout(() => { menuBackdrop.style.background = "rgba(10,10,18,0.22)"; }, 1);
}
function closeMenu() {
  sideMenu.classList.remove('open');
  menuBackdrop.style.background = "rgba(10,10,18,0.00)";
  setTimeout(() => { menuBackdrop.style.display = 'none'; }, 350);
}
menuToggle.addEventListener('click', openMenu);
menuBackdrop.addEventListener('click', closeMenu);

// --- SESSIONS LIST ---
function updateSessionList() {
  const list = document.getElementById("sessions-list");
  if (!sessions || sessions.length === 0) {
    list.innerHTML = "<div style='opacity:.7;font-size:.98em;'>No sessions yet.</div>";
    return;
  }
  list.innerHTML = sessions.map(sess => `
    <div class="session-entry">
      <span class="session-title">${escapeHTML(sess.title)}</span>
      <span class="session-duration">${formatTime(sess.duration)}</span>
      <span class="session-timestamp" style="font-size:0.86em;color:var(--color-secondary);">${formatDate(sess.timestamp)}</span>
    </div>
  `).join('');
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[tag]));
}
function formatDate(ts) {
  if (!ts) return "";
  let date = new Date(ts);
  return date.toLocaleString(undefined, {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}

// Safety: stop and auto-save the session if the tab is closed or refreshed
window.addEventListener("beforeunload", () => {
  if (running && currentStudy) {
    stopTimer(true);
  }
});
window.addEventListener("pagehide", () => {
  if (running && currentStudy) {
    stopTimer(true);
  }
});