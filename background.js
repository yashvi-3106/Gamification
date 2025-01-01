let points = 0;
let achievements = [];
let blocklist = []; // Will hold websites to block during work sessions

// Load saved data from storage
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['points', 'achievements', 'blocklist'], function(result) {
    if (result.points) points = result.points;
    if (result.achievements) achievements = result.achievements;
    if (result.blocklist) blocklist = result.blocklist; // Load the blocklist
  });
});

// Save data periodically
function saveData() {
  chrome.storage.local.set({ points, achievements, blocklist });
}

// Add points and achievements
function addPoints(type) {
  points += 10; // Reward 10 points for each completed cycle
  if (type === "work") {
    achievements.push("Completed a work session!");
  } else if (type === "break") {
    achievements.push("Completed a break!");
  }
  saveData();
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'addPoints') {
    addPoints(message.type);
    sendResponse({ points });
  } else if (message.action === 'updateBlocklist') {
    blocklist = message.blocklist;
    saveData();
    sendResponse({ blocklist });
  }
});

// Block distracting websites during work sessions
function blockDistractingSites() {
  blocklist.forEach(site => {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        if (tab.url.includes(site)) {
          chrome.tabs.update(tab.id, { url: 'about:blank' });
        }
      });
    });
  });
}

// Listen for work session start and block sites
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startWorkSession') {
    blockDistractingSites(); // Block websites when a work session starts
  }
});
