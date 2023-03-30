'use strict'

var defaultMsg='For at least 20secs, look at least 6 m/20 ft away from the screen.'

var form = document.forms[0]



form.addEventListener('change', function() {

	
	var interval = Number(form.interval.value),
		badge = true,
		delay = +form.delay.value,
		msg = form.msg.value

	console.log(interval);

	chrome.storage.local.set({
		interval,
		sound: true,
		badge,
		delay,
		msg
	})
	chrome.alarms.create('notify', {
		delayInMinutes: interval,
		periodInMinutes: interval,
	})
	chrome.alarms.get('notify', function(details) {
		update(details.scheduledTime, badge)
	})
	if (badge)
		chrome.alarms.create('badge', {
			delayInMinutes: 10,
			periodInMinutes: 10,
		})
	else {
		chrome.alarms.clear('badge')
		chrome.browserAction.setBadgeText({ text: '' })
	}
})

function load() {
	chrome.storage.local.get(
		{ interval: 20, sound: true, badge: false, delay: 20 ,msg : defaultMsg },
		function(data) {
			form.interval.value = data.interval
			form.delay.value = data.delay
			// form.sound.checked = data.sound
			//form.badge.checked = data.badge
			form.msg.value=data.msg;
		}
	)

	chrome.alarms.get('notify', function(details) {
		if(details!=undefined)
			update(details.scheduledTime)
	});

	window.setTimeout(function(){
		chrome.alarms.get('notify', function(details) {
			if(details!=undefined)
				update(details.scheduledTime,true)
		});
	},1000);
	
}

function update(time, badge) {
	const date = new Date(time)
	document.getElementById('notification').innerText = date.toLocaleTimeString()

	if (badge) {
		const mins = Math.round((time - Date.now()) / 1000 / 60)
		const string = mins + 'min'
		chrome.browserAction.setTitle({ title: 'Next alarm in ' + string })
		chrome.browserAction.setBadgeText({ text: string })
		chrome.browserAction.setBadgeBackgroundColor({ color: '#E0E0E0' }) // #BDBDBD
	} else
		chrome.browserAction.setTitle({
			title: 'Next alarm at' + date.toLocaleTimeString(),
		})
}

window.addEventListener('load', load)
