// chrome.runtime.onInstalled.addListener(function() {
//     chrome.storage.sync.set({color: '#3aa757'}, function() {
//       console.log("The color is green.");
//     });
//   });
// chrome.runtime.onInstalled.addListener(function() {
//     chrome.contextMenus.create({
//       "id": "sampleContextMenu",
//       "title": "Sample Context Menu",
//       "contexts": ["selection"]
//     });
//   });
// Called when the user clicks on the browser action.

function getDomainFromURL(url) {
  u = new URL(url)
  console.log('Host is:', u.host)
  host_words = u.host.split(".")
  host_words_reverse = host_words.reverse()
  console.log('host_words:', host_words)
  console.log('host_words_reverse:', host_words_reverse)

  let domain = "".concat(host_words_reverse[1], ".", host_words_reverse[0])
  console.log('domain from func body:', domain)

  return domain
}

chrome.browserAction.onClicked.addListener(function(tab) {
    // No tabs or host permissions needed!
    console.log('Turning ' + tab.url + ' red!');
    chrome.tabs.executeScript({
      code: 'document.body.style.backgroundColor="red"'
    });
  });

chrome.tabs.onActivated.addListener(function(tab) {
  activeTabID = tab.tabId
  console.log('tabID: ' + activeTabID);
    chrome.tabs.get(activeTabID, function(tabInfo) {
        console.log('tabURL: ' + tabInfo.url);
        domain = getDomainFromURL(tabInfo.url)
        console.log('domain:', domain)
        // seconds = new Date() / 1000
        seconds = Date.now()
        console.log('timestamp: ', seconds)
    })
})

chrome.tabs.onUpdated.addListener(function (activeTabID1, changeInfo, tab) {
  
  if (typeof changeInfo.url != "undefined") {
  // if (changeInfo.url) {
    console.log('new URL: ' + changeInfo.url);
    domain = getDomainFromURL(changeInfo.url)
    console.log('domain:', domain)
    // seconds = new Date() / 1000
    seconds = Date.now()
    console.log('timestamp: ', seconds)
  }  
  
})

// chrome.storage.local.set({key: value}, function() {
//   console.log('Value is set to ' + value);
// });

// chrome.storage.local.get(['key'], function(result) {
//   console.log('Value currently is ' + result.key);
// });