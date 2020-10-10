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

var domain_last = ""

function setTimeSiteOpen(url, time) {

  chrome.storage.local.set({[url + '_open']: time}, function() {
    console.log('domain_open is set to ' + time);
  });

  // chrome.storage.local.get(url, function(result) {
  //   console.log('domain_open is ', result[url]);
  // });
}

function setTimeSiteClose(domain_last, seconds) {
  
  var time_domain_last_open,
      last_time_site_duration

  let time_domain_last_close = seconds

  chrome.storage.local.set({[domain_last + '_close']: seconds}, function() {
    // time_domain_last_close = seconds
    console.log('domain_last_close is set to ' + time_domain_last_close);
  });

  chrome.storage.local.get(domain_last + '_open', function(result) {
    time_domain_last_open = result[domain_last + '_open']
    console.log('domain_last_open is ', time_domain_last_open);
  });

  last_time_site_duration = Number(time_domain_last_close) - Number(time_domain_last_open)
  console.log('last_time_site_duration is ', String(last_time_site_duration));

  setTimeSiteDuration(domain_last, last_time_site_duration)

}

function setTimeSiteDuration(domain, last_time_site_duration) {
  
  var domain_duration,
      domain_duration_new
  
  chrome.storage.local.get(domain + '_duration', function(result) {
    domain_duration = result[domain + '_duration']
    console.log('domain_duration is ', domain_duration);
  });

  if (typeof domain_duration == "undefined") {
    domain_duration = 0
  }

  domain_duration_new = Number(domain_duration) + Number(last_time_site_duration)

  chrome.storage.local.set({[domain + '_duration']: domain_duration_new}, function() {
    console.log('domain_duration new is ' + domain_duration_new);
  });


}

function getDomainFromURL(url) {
  u = new URL(url)
  console.log('Host is:', u.host)

  host_words = u.host.split(".")
  console.log('host_words:', host_words)

  host_words_reverse = host_words.reverse()
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

  let seconds_activated = Date.now()

  setTimeSiteClose(domain_last, seconds_activated)

  activeTabID = tab.tabId
  console.log('tabID: ' + activeTabID);
  chrome.tabs.get(activeTabID, function(tabInfo) {
      console.log('tabURL: ' + tabInfo.url);
      let domain_activated = getDomainFromURL(tabInfo.url)
      domain_last = domain_activated
      console.log('domain:', domain_activated)
      // seconds = new Date() / 1000
      
      console.log('timestamp: ', seconds_activated)

      setTimeSiteOpen(domain_activated, seconds_activated)
  })
})

chrome.tabs.onUpdated.addListener(function (activeTabID1, changeInfo, tab) {
  
  if (typeof changeInfo.url != "undefined") {
  // if (changeInfo.url) {
    console.log('new URL: ' + changeInfo.url);
    let domain_updated = getDomainFromURL(changeInfo.url)
    console.log('domain:', domain_updated)
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