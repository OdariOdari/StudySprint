document.addEventListener('DOMContentLoaded', function() {
  // Retrieve sessions from localStorage or empty array
  let sessions = JSON.parse(localStorage.getItem('studysprint-sessions') || '[]');

  // Utility functions (keep in sync with shared.js or redefine for robustness)
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

  function updateSessionList() {
    const list = document.getElementById("sessions-content");
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

  updateSessionList();

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
});