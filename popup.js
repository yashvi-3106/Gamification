let timerInterval;
let isWorkTime = true;
let workTime = 25 * 60; 
let breakTime = 5 * 60; 


const startTimerBtn = document.getElementById('start-timer');
const startBreakBtn = document.getElementById('start-break');
const workTimeDisplay = document.getElementById('work-time');
const breakTimeDisplay = document.getElementById('break-time');
const pointsDisplay = document.getElementById('points');
const achievementsList = document.getElementById('achievements');
const blocklistInput = document.getElementById('blocklist-input');
const addBlockBtn = document.getElementById('add-blocklist-btn');
const blocklistDisplay = document.getElementById('blocklist-display');


let blocklist = [];

chrome.storage.local.get(['blocklist'], (result) => {
  blocklist = result.blocklist || []; 
  updateBlocklistDisplay(); 
});


startTimerBtn.addEventListener('click', () => {
  startTimer("work");
  chrome.runtime.sendMessage({ action: 'startWorkSession' });
});


startBreakBtn.addEventListener('click', () => {
  startTimer("break");
});


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


function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}


function displayAchievements() {
  chrome.storage.local.get(['achievements'], (result) => {
    const achievements = result.achievements || [];
    achievementsList.innerHTML = achievements.map(a => `<li>${a}</li>`).join('');
  });
}

function updateStats() {
  chrome.storage.local.get(['points'], (result) => {
    pointsDisplay.textContent = result.points || 0;
  });
  displayAchievements();
}

document.addEventListener('DOMContentLoaded', updateStats);


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


function updateBlocklistDisplay() {
  blocklistDisplay.innerHTML = blocklist.map(site => `<li>${site}</li>`).join('');
}
