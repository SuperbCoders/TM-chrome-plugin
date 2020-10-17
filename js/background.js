// chrome.runtime.onInstalled.addListener(function() {
//     chrome.storage.sync.set({color: '#3aa757'}, function() {
//       console.log("The color is green.");
//     });
//   });
// Called when the user clicks on the browser action.

chrome.alarms.create('refresh', { periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener((alarm) => {
  // console.log("Alarm is here, alarm.name: ", alarm.name);

  chrome.storage.local.get(null, function(items) {
    domains_object = {
      date: getDateFormatDDMMYYY()
    }

    for (var key in items) {
      var parts = key.split("_")
      if (parts[1] == "duration") {
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
  let dateFormat = ''
  dateFormat = dateFormat.concat(date.getUTCDate(), date.getUTCMonth() + 1, date.getUTCFullYear())

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
    // console.log('domain_last_open is ', time_domain_last_open);

    last_time_site_duration = Number(time_domain_last_close) - Number(time_domain_last_open)
    // console.log('last_time_site_duration is ', String(last_time_site_duration));
  
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
  // console.log('Host is:', u.host)

  host_words = u.host.split(".")
  // console.log('host_words:', host_words)

  host_words_reverse = host_words.reverse()
  // console.log('host_words_reverse:', host_words_reverse)

  let domain = "".concat(host_words_reverse[1], ".", host_words_reverse[0])
  // console.log('domain from func body:', domain)

  return domain
}

chrome.tabs.onActivated.addListener(function(tab) {

  let seconds_activated = Date.now()

  setTimeSiteClose(domain_last, seconds_activated)

  activeTabID = tab.tabId
  // console.log('tabID: ' + activeTabID);
  chrome.tabs.get(activeTabID, function(tabInfo) {
      // console.log('tabURL: ' + tabInfo.url);
      let domain_activated = getDomainFromURL(tabInfo.url)
      domain_last = domain_activated

      // console.log('domain:', domain_activated)
      // console.log('timestamp: ', seconds_activated)

      setTimeSiteOpen(domain_activated, seconds_activated)
  })
})

chrome.tabs.onUpdated.addListener(function (activeTabID1, changeInfo, tab) {
  
  if (typeof changeInfo.url != "undefined") {
    let seconds_updated = Date.now()
    
    setTimeSiteClose(domain_last_updated, seconds_updated)

    // console.log('new URL: ' + changeInfo.url);
    let domain_updated = getDomainFromURL(changeInfo.url)
    domain_last_updated = domain_updated

    // console.log('domain:', domain_updated)
    // console.log('timestamp: ', seconds_updated)

    setTimeSiteOpen(domain_updated, seconds_updated)
  }  
})


chrome.windows.onFocusChanged.addListener(function (windowId) {
  // console.log("!!! FOCUS CHANGED !!!,  windowId: " , windowId)
})