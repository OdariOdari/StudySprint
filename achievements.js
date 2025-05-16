document.addEventListener('DOMContentLoaded', () => {
  function totalStudyTime() {
    return sessions.reduce((sum, session) => sum + session.duration, 0);
  }

  function calculateStreak() {
    if (sessions.length === 0) return 0;
    const uniqueDays = [...new Set(sessions.map(session => {
      const date = new Date(session.timestamp);
      return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    }))].sort((a, b) => b - a);
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let checkDate = today.getTime();
    for (let i = 0; i < uniqueDays.length; i++) {
      const day = uniqueDays[i];
      if (day === checkDate) {
        streak++;
        checkDate -= 86400000; // Back one day
      } else if (day < checkDate) {
        break;
      }
    }
    return streak;
  }

  function formatProgress(current, goal) {
    if (goal >= 3600000) { // If goal is in hours/ms
      return `${formatTime(current)} / ${formatTime(goal)}`;
    }
    return `${current} / ${goal}`;
  }

  function updateGamification() {
    const badgesContainer = document.getElementById('badges');
    const progressBarsContainer = document.getElementById('progress-bars');
    const badges = [
      { id: 'sessions5', name: '5 Sessions', icon: '🏅', condition: () => sessions.length >= 5, goal: 5, current: () => sessions.length },
      { id: 'sessions20', name: '20 Sessions', icon: '🥇', condition: () => sessions.length >= 20, goal: 20, current: () => sessions.length },
      { id: 'streak7', name: '7-Day Streak', icon: '🔥', condition: () => calculateStreak() >= 7, goal: 7, current: () => calculateStreak() },
      { id: 'hours10', name: '10 Hours Total', icon: '⏰', condition: () => totalStudyTime() >= 36000000, goal: 36000000, current: () => totalStudyTime() }
    ];
    badgesContainer.innerHTML = '';
    progressBarsContainer.innerHTML = '';
    badges.forEach(badge => {
      const badgeElement = document.createElement('div');
      badgeElement.className = 'p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-center';
      badgeElement.innerHTML = `
        <div class="text-3xl mb-2">${badge.icon}</div>
        <div class="text-sm font-semibold text-gray-700 dark:text-gray-300">${badge.name}</div>
        <div class="text-xs text-gray-500 dark:text-gray-400">${badge.condition() ? 'Unlocked!' : 'Locked'}</div>
      `;
      if (badge.condition()) badgeElement.classList.add('border-2', 'border-yellow-400');
      badgesContainer.appendChild(badgeElement);

      const progressElement = document.createElement('div');
      const currentValue = badge.current();
      const progressPercent = Math.min((currentValue / badge.goal) * 100, 100);
      progressElement.innerHTML = `
        <div class="text-sm text-gray-700 dark:text-gray-300 mb-1">${badge.name} (${formatProgress(currentValue, badge.goal)})</div>
        <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
          <div class="bg-blue-600 h-2.5 rounded-full" style="width: ${progressPercent}%"></div>
        </div>
      `;
      progressBarsContainer.appendChild(progressElement);
    });
    const badgeStatus = badges.map(badge => ({ id: badge.id, achieved: badge.condition() }));
    localStorage.setItem('studysprint-badges', JSON.stringify(badgeStatus));
  }

  updateGamification();
});