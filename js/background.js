var NOTIFICATION_ID = 'wayw';
var ALARM_ID = 'check_status';

chrome.browserAction.setBadgeBackgroundColor({'color': '#0000FF'});
chrome.browserAction.setBadgeText({text: "?"});

var next_check_time = new Date();
var delay_seconds = function(seconds) {
    next_check_time = new Date();
    next_check_time.setSeconds(next_check_time.getSeconds() + seconds);
}

chrome.runtime.onInstalled.addListener(function() {
});

function check_status() {
    console.log('check status called');
    var now = new Date();

    year = now.getFullYear();
    month = now.getMonth() + 1;
    if (month < 10) {
        month = '0' + month;
    }
    day = now.getDate();
    if (day < 10) {
        day = '0' + day;
    }

    var date_str = year + '-' + month + '-' + day;
    var key = 'date-' + date_str;

    if (key in localStorage) {
        chrome.browserAction.setBadgeBackgroundColor({'color': '#00FF00'});
        chrome.browserAction.setBadgeText({text: "ok"});
    } else {
        chrome.browserAction.setBadgeBackgroundColor({'color': '#FF0000'});
        chrome.browserAction.setBadgeText({text: "X"});

        if (now.getHours() >= 9 && now > next_check_time) {
            var opt = {
                type: "basic",
                title: "Where Are You Working?",
                message: "Please provide your location details.",
                iconUrl: "images/icon.png",
                buttons: [{title:'Report Now', iconUrl:'images/pencil.png'},
                          {title:'Ask Me Again Later', iconUrl:'images/clock.png'}]
            }

            chrome.notifications.clear(NOTIFICATION_ID, function(wasCleared) {
                console.log('cleared ' + wasCleared);
            });
            chrome.notifications.create(NOTIFICATION_ID, opt, function(notificationId) {
                console.log('create ' + notificationId);
            });
        }
    }
}

chrome.notifications.onButtonClicked.addListener(function(notificationId, buttonIndex) {
    if (notificationId == NOTIFICATION_ID) {
        delay_seconds(30*60); // 30 minutes

        if (buttonIndex == 0) {
            var url = chrome.extension.getURL('popup.html');
            var options = 'width=325,height=325,top=200,left=450';
            window.popUpWindow = window.open(url, "Where Are You Working?", options);
        }

        chrome.notifications.clear(notificationId, function(wasCleared) {
        });
    }
});

chrome.notifications.onClosed.addListener(function(notificationId, byUser) {
    if (notificationId == NOTIFICATION_ID && byUser) {
        delay_seconds(5*60); // 5 minutes
        chrome.notifications.clear(notificationId, function(wasCleared) {
        });
    }
});

chrome.alarms.onAlarm.addListener(function(alarm) {
    if (alarm.name == ALARM_ID) {
        check_status();
    }
});

// Create the alarm:
chrome.alarms.create(ALARM_ID, {periodInMinutes: 1});
check_status();

