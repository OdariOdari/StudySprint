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

  function deleteSession(index) {
    if (confirm('Delete this study session?')) {
      sessions.splice(index, 1);
      localStorage.setItem('studysprint-sessions', JSON.stringify(sessions));
      updateSessionList();
    }
  }

  function updateSessionList() {
    const list = document.getElementById("sessions-content");
    if (!sessions || sessions.length === 0) {
      list.innerHTML = "<div style='opacity:.7;font-size:.98em;'>No sessions yet.</div>";
      return;
    }
    
    list.innerHTML = sessions.map((sess, index) => `
      <div class="session-entry flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-700">
        <div class="flex-1">
          <div class="session-title font-medium text-gray-800 dark:text-gray-200">${escapeHTML(sess.title)}</div>
          <div class="flex items-center space-x-4 mt-1">
            <span class="session-duration text-sm text-gray-600 dark:text-gray-400">${formatTime(sess.duration)}</span>
            <span class="session-timestamp text-xs text-gray-500 dark:text-gray-500">${formatDate(sess.timestamp)}</span>
          </div>
        </div>
        <button 
          class="delete-btn text-red-500 hover:text-red-700 dark:hover:text-red-400 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Delete session"
          data-index="${index}"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    `).join('');

    // Add event listeners to all delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.getAttribute('data-index'));
        deleteSession(index);
      });
    });
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
