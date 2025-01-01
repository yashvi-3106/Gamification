let timerInterval;
let isWorkTime = true;
let workTime = 25 * 60; // 25 minutes
let breakTime = 5 * 60; // 5 minutes

// Elements
const startTimerBtn = document.getElementById('start-timer');
const startBreakBtn = document.getElementById('start-break');
const workTimeDisplay = document.getElementById('work-time');
const breakTimeDisplay = document.getElementById('break-time');
const pointsDisplay = document.getElementById('points');
const achievementsList = document.getElementById('achievements');
const blocklistInput = document.getElementById('blocklist-input');
const addBlockBtn = document.getElementById('add-blocklist-btn');
const blocklistDisplay = document.getElementById('blocklist-display');

// Load the blocklist from storage when the popup is opened
let blocklist = [];

chrome.storage.local.get(['blocklist'], (result) => {
  blocklist = result.blocklist || []; // Retrieve the blocklist from storage or initialize it as an empty array
  updateBlocklistDisplay(); // Update the display with the current blocklist
});

// Start Work Timer
startTimerBtn.addEventListener('click', () => {
  startTimer("work");
  chrome.runtime.sendMessage({ action: 'startWorkSession' }); // Inform background to block sites
});

// Start Break Timer
startBreakBtn.addEventListener('click', () => {
  startTimer("break");
});

// Start Timer
function startTimer(type) {
  clearInterval(timerInterval);
  let timeLeft = type === "work" ? workTime : breakTime;

  timerInterval = setInterval(() => {
    timeLeft--;
    if (type === "work") {
      workTimeDisplay.textContent = formatTime(timeLeft);
    } else {
      breakTimeDisplay.textContent = formatTime(timeLeft);
    }

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      if (type === "work") {
        chrome.runtime.sendMessage({ action: 'addPoints', type: 'work' }, (response) => {
          pointsDisplay.textContent = response.points;
        });
        startBreakBtn.style.display = "block";
      } else {
        chrome.runtime.sendMessage({ action: 'addPoints', type: 'break' }, (response) => {
          pointsDisplay.textContent = response.points;
        });
        startTimerBtn.style.display = "block";
      }
    }
  }, 1000);
}

// Format time as MM:SS
function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

// Display Achievements
function displayAchievements() {
  chrome.storage.local.get(['achievements'], (result) => {
    const achievements = result.achievements || [];
    achievementsList.innerHTML = achievements.map(a => `<li>${a}</li>`).join('');
  });
}

// Update Stats
function updateStats() {
  chrome.storage.local.get(['points'], (result) => {
    pointsDisplay.textContent = result.points || 0;
  });
  displayAchievements();
}

document.addEventListener('DOMContentLoaded', updateStats);

// Blocklist Feature: Add a new site to the blocklist
addBlockBtn.addEventListener('click', () => {
  const newBlocksite = blocklistInput.value.trim();
  if (newBlocksite && !blocklist.includes(newBlocksite)) {
    blocklist.push(newBlocksite);
    chrome.runtime.sendMessage({ action: 'updateBlocklist', blocklist }, (response) => {
      updateBlocklistDisplay();
      blocklistInput.value = '';
    });
  }
});

// Display the current blocklist
function updateBlocklistDisplay() {
  blocklistDisplay.innerHTML = blocklist.map(site => `<li>${site}</li>`).join('');
}
