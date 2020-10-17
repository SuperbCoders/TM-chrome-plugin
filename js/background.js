// chrome.runtime.onInstalled.addListener(function() {
//     chrome.storage.sync.set({color: '#3aa757'}, function() {
//       console.log("The color is green.");
//     });
//   });
// Called when the user clicks on the browser action.

chrome.alarms.create('refresh', { periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener((alarm) => {
  let seconds_sendJSON = Date.now()
  setTimeSiteClose(activeTabURL, seconds_sendJSON)
  setTimeSiteOpen(activeTabURL, seconds_sendJSON)

  chrome.storage.local.get(null, function(items) {
    
    let dateFormat = getDateFormatDDMMYYY()
    
    domains_object = {
      date: dateFormat
    }

    for (var key in items) {
      var parts = key.split("_")
      if (parts[1] == "duration" && parts[2] == dateFormat) {
        domains_object[parts[0]] = msToTime(items[key])
      }
    }

    domains_object_JSON = JSON.stringify(domains_object)
    console.log(domains_object_JSON);
  });
});

var domain_last = ""
var domain_last_updated = ""

function getDateFormatDDMMYYY() {
  let date = new Date()
  let dateFormat = ''.concat(date.getUTCDate(), date.getUTCMonth() + 1, date.getUTCFullYear())

  return dateFormat
}

function msToTime(duration) {
  var seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;

  return hours + ":" + minutes + ":" + seconds;
}

function setTimeSiteOpen(url, time) {

  chrome.storage.local.set({[url + '_open']: time}, function() {
    // console.log('domain_open is set to ' + time);
  });
}

function setTimeSiteClose(domain_last, seconds) {
  
  let last_time_site_duration
  let time_domain_last_close = seconds

  chrome.storage.local.set({[domain_last + '_close']: seconds}, function() {
    // console.log('domain_last_close is set to ' + time_domain_last_close);
  });

  chrome.storage.local.get(domain_last + '_open', function(result) {
    time_domain_last_open = result[domain_last + '_open']
    last_time_site_duration = Number(time_domain_last_close) - Number(time_domain_last_open)
  
    setTimeSiteDuration(domain_last, last_time_site_duration)
  });
}

function setTimeSiteDuration(domain, last_time_site_duration) {
  
  let dateFormatDDMMYYY = getDateFormatDDMMYYY()
  let domain_duration_key = domain + '_duration' + '_' + dateFormatDDMMYYY

  chrome.storage.local.get(domain_duration_key, function(result) {
    domain_duration = result[domain_duration_key]
    
    if (typeof domain_duration == "undefined") {
      domain_duration = 0
    }

    domain_duration_new = Number(domain_duration) + Number(last_time_site_duration)

    chrome.storage.local.set({[domain_duration_key]: domain_duration_new}, function() {
      // console.log('domain_duration new is ' + domain_duration_new);
    });

  });
}

function getDomainFromURL(url) {
  u = new URL(url)

  host_words = u.host.split(".")
  host_words_reverse = host_words.reverse()
  let domain = "".concat(host_words_reverse[1], ".", host_words_reverse[0])

  return domain
}

chrome.tabs.onActivated.addListener(function(tab) {

  let seconds_activated = Date.now()

  setTimeSiteClose(domain_last, seconds_activated)

  activeTabID = tab.tabId

  chrome.tabs.get(activeTabID, function(tabInfo) {
      let domain_activated = getDomainFromURL(tabInfo.url)
      activeTabURL = domain_activated
      domain_last = domain_activated

      setTimeSiteOpen(domain_activated, seconds_activated)
  })
})

chrome.tabs.onUpdated.addListener(function (activeTabID1, changeInfo, tab) {
  
  if (typeof changeInfo.url != "undefined") {
    let seconds_updated = Date.now()
    
    setTimeSiteClose(domain_last_updated, seconds_updated)

    let domain_updated = getDomainFromURL(changeInfo.url)
    domain_last_updated = domain_updated
    activeTabURL = domain_updated

    setTimeSiteOpen(domain_updated, seconds_updated)
  }  
})

chrome.tabs.onRemoved.addListener(function (removedTabID, removeInfo) {
  // console.log("removeInfo: ", removeInfo)
  // console.log("activeTabID: ", activeTabID)
  // console.log("removedTabID: ", removedTabID)
  // console.log("activeTabURL: ", activeTabURL)

  let seconds_removed = Date.now()
  setTimeSiteClose(activeTabURL, seconds_removed)
})


chrome.windows.onFocusChanged.addListener(function (windowId) {
  // console.log("!!! FOCUS CHANGED !!!,  windowId: " , windowId)
})