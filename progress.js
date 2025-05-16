document.addEventListener('DOMContentLoaded', () => {
  function updateProgressTracking() {
    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    const weekStartObj = new Date(now);
    weekStartObj.setDate(weekStartObj.getDate() - weekStartObj.getDay());
    weekStartObj.setHours(0, 0, 0, 0);
    const weekStart = weekStartObj.getTime();

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    let dailyTotal = 0, weeklyTotal = 0, monthlyTotal = 0;
    sessions.forEach(session => {
      if (session.timestamp >= dayStart) dailyTotal += session.duration;
      if (session.timestamp >= weekStart) weeklyTotal += session.duration;
      if (session.timestamp >= monthStart) monthlyTotal += session.duration;
    });

    document.getElementById('daily-total').textContent = formatTime(dailyTotal);
    document.getElementById('weekly-total').textContent = formatTime(weeklyTotal);
    document.getElementById('monthly-total').textContent = formatTime(monthlyTotal);

    // Chart for last 7 days
    const chartLabels = [];
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const dayStart = d.getTime();
      const nextDayStart = dayStart + 86400000;
      chartLabels.push(d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
      chartData.push(
        sessions.reduce(
          (sum, session) =>
            session.timestamp >= dayStart && session.timestamp < nextDayStart
              ? sum + session.duration
              : sum,
          0
        ) / 3600000 // ms to hours
      );
    }
    const ctx = document.getElementById('study-chart').getContext('2d');
    if (window.studyChartInstance) window.studyChartInstance.destroy();
    window.studyChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: chartLabels,
        datasets: [{
          label: 'Study Time (Hours)',
          data: chartData,
          backgroundColor: 'rgba(63,114,175,0.6)',
          borderColor: 'rgba(63,114,175,1)',
          borderWidth: 1,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Hours Studied' }
          },
          x: {
            title: { display: true, text: 'Date' }
          }
        }
      }
    });
  }
  updateProgressTracking();
});