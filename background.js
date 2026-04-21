const MR_PATTERN = /^https?:\/\/[^/]+\/.+\/-\/merge_requests\/\d+(\/.*)?$/;

function updateBadge(tabId, url) {
  if (MR_PATTERN.test(url)) {
    chrome.action.setBadgeText({ text: "MR", tabId });
    chrome.action.setBadgeBackgroundColor({ color: "#6c63ff", tabId });
  } else {
    chrome.action.setBadgeText({ text: "", tabId });
  }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    updateBadge(tabId, changeInfo.url);
  }
});

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  try {
    const tab = await chrome.tabs.get(tabId);
    if (tab.url) updateBadge(tabId, tab.url);
  } catch {
    // tab may have closed
  }
});
