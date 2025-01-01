let points = 0;
let achievements = [];
let blocklist = []; 


chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['points', 'achievements', 'blocklist'], function(result) {
    if (result.points) points = result.points;
    if (result.achievements) achievements = result.achievements;
    if (result.blocklist) blocklist = result.blocklist; 
  });
});


function saveData() {
  chrome.storage.local.set({ points, achievements, blocklist });
}


function addPoints(type) {
  points += 10; 
  if (type === "work") {
    achievements.push("Completed a work session!");
  } else if (type === "break") {
    achievements.push("Completed a break!");
  }
  saveData();
}


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


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startWorkSession') {
    blockDistractingSites(); 
  }
});
