document.addEventListener('DOMContentLoaded', () => {
  // Timer Logic
  let startTime, timerInterval, accumulated = 0, running = false, paused = false;
  let currentStudy = null;

  const studyTitleElement = document.getElementById("study-title");
  const timerElement = document.getElementById("timer");
  const pauseBtn = document.getElementById("pause-btn");
  const resumeBtn = document.getElementById("resume-btn");
  const stopBtn = document.getElementById("stop-btn");
  const fullscreenBtn = document.getElementById("fullscreen-btn");
  let isFullscreen = false;

  function tick() {
    if (running && !paused) {
      timerElement.textContent = formatTime(accumulated + (Date.now() - startTime));
    }
  }

  function startTimer() {
    console.log("Starting Timer");
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
    console.log("Pausing Timer");
    if (!running || paused) return;
    accumulated += Date.now() - startTime;
    paused = true;
    pauseBtn.style.display = "none";
    resumeBtn.style.display = "";
    clearInterval(timerInterval);
    tick();
  }

  function resumeTimer() {
    console.log("Resuming Timer");
    if (!running || !paused) return;
    startTime = Date.now();
    paused = false;
    pauseBtn.style.display = "";
    resumeBtn.style.display = "none";
    timerInterval = setInterval(tick, 500);
    tick();
  }

  function stopTimer(final = true) {
    console.log("Stopping Timer");
    if (!running) return;
    clearInterval(timerInterval);
    running = false;
    let endAccum = accumulated + (paused ? 0 : Date.now() - startTime);
    timerElement.textContent = formatTime(endAccum);
    pauseBtn.disabled = true;
    stopBtn.disabled = true;
    pauseBtn.style.display = "";
    resumeBtn.style.display = "none";
    if (final && currentStudy && endAccum > 0) {
      sessions.unshift({ title: currentStudy, duration: endAccum, timestamp: Date.now() });
      sessions = sessions.slice(0, 25);
      localStorage.setItem('studysprint-sessions', JSON.stringify(sessions));
      console.log("Session saved:", { title: currentStudy, duration: endAccum });
    }
    accumulated = 0;
    paused = false;
    currentStudy = null;
    studyTitleElement.textContent = "";
  }

  function toggleFullscreen() {
    console.log("Toggling Fullscreen");
    isFullscreen = !isFullscreen;
    const timerContainer = document.getElementById("timer-container");
    const mainElement = document.querySelector("main");
    const navElement = document.getElementById("topnav");
    if (isFullscreen) {
      fullscreenBtn.textContent = "Exit Fullscreen";
      navElement.style.display = "none";
      mainElement.style.cssText = "display: flex; justify-content: center; align-items: center; height: 100vh; padding: 0;";
      timerContainer.style.cssText = "position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);";
      timerElement.style.fontSize = "6rem";
    } else {
      fullscreenBtn.textContent = "Fullscreen";
      navElement.style.display = "flex";
      mainElement.style.cssText = "";
      timerContainer.style.cssText = "";
      timerElement.style.fontSize = "3.5rem";
    }
  }

  // Attach Event Listeners
  if (pauseBtn) pauseBtn.onclick = pauseTimer;
  if (resumeBtn) resumeBtn.onclick = resumeTimer;
  if (stopBtn) stopBtn.onclick = function () { stopTimer(true); };
  if (fullscreenBtn) fullscreenBtn.onclick = toggleFullscreen;

  // Modal Submission for Starting Study Session
  const studyModal = document.getElementById("study-modal");
  if (studyModal) {
    studyModal.addEventListener("submit", function (e) {
      e.preventDefault();
      const studySubject = document.getElementById("study-input").value.trim();
      if (!studySubject) return;
      console.log("Study Subject:", studySubject);
      document.getElementById("modal-backdrop").style.display = "none";
      studyTitleElement.textContent = currentStudy = studySubject;
      timerElement.textContent = "00:00:00";
      pauseBtn.disabled = false;
      stopBtn.disabled = false;
      accumulated = 0;
      paused = false;
      startTimer();
    });
  }

  const studyInput = document.getElementById("study-input");
  if (studyInput) studyInput.focus();

  window.addEventListener("beforeunload", function (e) {
    if (running && !paused) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
});