'use strict'

let sound = null,
	delay = 20,
	badge = false,
	defaultMsg='For at least 20secs, look at least 6 m/20 ft away from the screen.',
	interval=20

let	msg=defaultMsg
getMsg()

function updateBadge() {
	chrome.alarms.get('notify', function(alert) {
		const mins = Math.round((alert.scheduledTime - Date.now()) / 1000 / 60)
		const string = mins + 'min'
		chrome.browserAction.setTitle({ title: 'Next alarm in ' + string })
		chrome.browserAction.setBadgeText({ text: string })
		chrome.browserAction.setBadgeBackgroundColor({ color: '#E0E0E0' }) // #BDBDBD
	})
}

function getMsg(){
	chrome.storage.local.get({ interval :20 ,sound: true, delay: 20, badge: false,msg: defaultMsg }, function(
		data
	) {
		interval = data.interval
		sound = data.sound
		delay = data.delay
		badge = data.badge
		msg = data.msg
	})
}

chrome.alarms.onAlarm.addListener(function _notify(alarm) {
	if (alarm.name === 'notify') {
		if (Date.now() - alarm.scheduledTime > 60000) return // we don't want to fire, as alarm was hold back > 1min; Probably shut down Chrome etc.

		notify()
	} else if (alarm.name === 'badge') {
		updateBadge()
	}
})




function notify() {
	getMsg()
	play()

	// chrome.notifications.onButtonClicked.addListener(function buttonListener() {
	// 	chrome.tabs.create({ url: chrome.extension.getURL('greenscreen.html') })
	// 	chrome.notifications.clear('eyecare')
	// 	chrome.notifications.onButtonClicked.removeListener(buttonListener)
	// })

	chrome.notifications.onClicked.addListener(function listener() {
		chrome.notifications.clear('eyecare')
		chrome.notifications.onClicked.removeListener(listener)
	})

	let i = delay
	let ivl = window.setInterval(function() {
		--i
		chrome.browserAction.setBadgeText({ text: i + 's' })
		chrome.browserAction.setBadgeBackgroundColor({ color: '#81C784' })
	}, 1000)

	chrome.notifications.create(
		'eyecare',
		{
			type: 'basic',
			title: msg,
			message:"",
			priority: 2,
			iconUrl: 'eye.png'
			// ,buttons: [
			// 	{
			// 		title: 'Open green screen',
			// 	},
			// ],
		},
		function(id) {
			chrome.alarms.clear('notify',(a)=>{
				let l=1;
			})
			

			window.setTimeout(function() {
				play()
				chrome.notifications.clear('eyecare')
				window.clearInterval(ivl)

				chrome.alarms.create('notify', {
					delayInMinutes: interval,
					periodInMinutes: interval,
				})
				chrome.browserAction.setBadgeText({ text: '' })
				if (badge) updateBadge()
				else
					chrome.alarms.get('notify', function(details) {
						if (details === undefined) return

						const date = new Date(details.scheduledTime)
						chrome.browserAction.setTitle({
							title: 'Next alarm at' + date.toLocaleTimeString(),
						})
					})
			}, delay * 1000)
		}
	)
}

function play() {
	if (sound === null) {
		chrome.storage.local.get({ sound: true, delay: 20, badge: false }, function(
			data
		) {
			sound = data.sound
			delay = data.delay
			badge = data.badge
			play()
		})
	} else if (sound) {
		var audioElement = document.createElement('audio')
		audioElement.src = chrome.extension.getURL('ding.ogg')
		audioElement.volume = 0.4
		audioElement.play()
	}
}

chrome.runtime.onInstalled.addListener(function listener() {
	chrome.storage.local.get(
		{ interval: 20, sound: true, badge: false, delay: 20 },
		function(data) {
			chrome.alarms.get('notify', function(alert) {
				chrome.alarms.create('notify', {
					delayInMinutes: alert === undefined ? data.interval : undefined,
					periodInMinutes: Number(data.interval),
					when: alert === undefined ? undefined : alert.scheduledTime,
				})
			})

			if (data.badge) {
				chrome.alarms.create('badge', {
					delayInMinutes: 10,
					periodInMinutes: 10,
				})
				updateBadge()
			} else {
				chrome.alarms.clear('badge')
			}
		}
	)
})
