// --- Shared Data & Utilities --- //
let sessions = JSON.parse(localStorage.getItem('studysprint-sessions') || '[]');

// Format ms as HH:MM:SS
function formatTime(ms) {
  let totalSeconds = Math.floor(ms / 1000);
  let h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
  let m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
  let s = (totalSeconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function escapeHTML(str) {
  return String(str).replace(/[&<>'"]/g, tag => ({
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

// --- THEME TOGGLING --- //
function setTheme(theme) {
  if (theme) document.documentElement.setAttribute('data-theme', theme);
  else document.documentElement.removeAttribute('data-theme');
  let isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const sun = document.getElementById('theme-sun');
  const moon = document.getElementById('theme-moon');
  if (sun && moon) {
    sun.classList.toggle('show', !isDark);
    moon.classList.toggle('show', isDark);
  }
  if (isDark) localStorage.setItem('studysprint-theme', 'dark');
  else localStorage.setItem('studysprint-theme', 'light');
}

window.addEventListener('DOMContentLoaded', () => {
  let saved = localStorage.getItem('studysprint-theme');
  if (saved && saved === 'dark') setTheme('dark');
  else setTheme(undefined);

  // Theme toggle
  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) {
    themeBtn.onclick = () => {
      let isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      setTheme(isDark ? undefined : 'dark');
    };
  }

  // --- Side Menu --- //
  const menuBackdrop = document.getElementById('side-menu-backdrop');
  const sideMenu = document.getElementById('side-menu');
  const menuToggle = document.getElementById('menu-toggle');
  if (sideMenu && menuBackdrop && menuToggle) {
    menuToggle.onclick = () => {
      sideMenu.classList.add('open');
      menuBackdrop.style.display = 'block';
      setTimeout(() => { menuBackdrop.style.background = "rgba(10,10,18,0.22)"; }, 1);
    };
    menuBackdrop.onclick = () => {
      sideMenu.classList.remove('open');
      menuBackdrop.style.background = "rgba(10,10,18,0.00)";
      setTimeout(() => { menuBackdrop.style.display = 'none'; }, 350);
    };
  }
});