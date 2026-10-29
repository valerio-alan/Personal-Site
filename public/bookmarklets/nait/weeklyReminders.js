(async function () {
	const webhookUrl = 'https://discord.com/api/webhooks/1560309721939058688/5PGG0FRzKeetz8H9xH31w7NAEWbJwPOtXYOCNIVjtPtNjlylX8nzay70RQc9PytEuks-'

	if (!window.location.hostname.includes('lms.nait.ca')) {
		setTimeout(() => {
			const script = document.querySelector('script[src*="weeklyReminders.js"]:last-of-type');
			script.parentNode.removeChild(script);
		}, 1);
		return;
	}

	async function getWeekEvents(date) {
		const year = date.getFullYear();
		const month = date.getMonth() + 1;
		const day = date.getDate();
		const calDataUrl = `https://lms.nait.ca/d2l/le/calendar/6606/home/eventspanepartial?searchInfo=&year=${year}&month=${month}&day=${day}`;

		let res = await fetch(calDataUrl);
		let rawData = await res.text();
		let data = JSON.parse(rawData.replace('while(1);', ''));
		let html = data?.Payload?.Html;
		if (!html) {
			return null;
		}
		
		return parseCalHtmlEvents(html, date)
	}

	function parseCalHtmlEvents(calHTML, inputDate) {
		const year = inputDate.getFullYear();
		const dayOfWeek = inputDate.getDay();
		let dom = new DOMParser()
		let doc = dom.parseFromString(calHTML, 'text/html')
		let dateEls = doc.querySelector('.d2l-offscreen').querySelectorAll('th:not(:first-of-type)')
		let weekDayNums = Array.from(dateEls).map((el) => {
			let text = el.textContent
			let weekDayNum = text.match(/\d+(?=,)/g)[0]
			return weekDayNum
		})
		let events = doc.querySelectorAll('a[title]')
		let eventData = []

		events.forEach((eventEl) => {
			let elWrapper = eventEl.closest('td')
			let weekDayIndex = Array.from(elWrapper.parentElement.querySelectorAll('td')).indexOf(elWrapper)
			
			let data = {}

			let eventDate = new Date(inputDate)
			eventDate.setDate(eventDate.getDate() - dayOfWeek + weekDayIndex)
			let WeekName = eventDate.toLocaleString('default', {weekday: 'long'});
			data.weekday = WeekName
			let monthName = eventDate.toLocaleString('default', {month: 'long'});
			data.timestamp = eventDate.getTime()
			data.month = monthName
			data.date = weekDayNums[weekDayIndex]

			let relevantContextEl = Array.from(elWrapper.children)[Array.from(elWrapper.children).indexOf(eventEl) + 1]
			let eventClass = relevantContextEl.querySelector('[class*="calendar-dot-name"]')?.textContent.replace(/ \(\w{3}\.\d{4}\)$/g, '')
			data.className = eventClass
			let eventName = eventEl.querySelector('[class*="event-title"]')?.textContent
			data.eventName = eventName
			let isAllDay = eventEl.closest('.d2l-le-calendar-week-all-wrapper') != null
			let eventTime = ''
			if (isAllDay) {
				eventTime = "All Day"
			} else {
				eventTime = relevantContextEl.querySelector('div .d2l-inline')?.textContent.trim()
				if (eventTime.includes('MEnds')) {
					eventTime = eventTime.replace('MEnds', 'M - Ends').replace('Starts', '').replace(' Ends', '')
				}
				eventTime = eventTime.replaceAll(` ${year}`, '')
				eventTime = eventTime.replaceAll(monthName, monthName.substring(0,3))
			}
			data.eventTime = eventTime.trim()

			eventData.push(data)
		})
		
		let eventsWithAvailability = []

		let i = 0
		while (i < eventData.length) {
			let event = eventData[i]

			if (event.eventName.endsWith(' - Available') || event.eventName.endsWith(' - Availability Ends')) {
				let eventWithoutSuffix = event.eventName.replace(' - Available', '').replace(' - Availability Ends', '')
				let eventKey = eventWithoutSuffix + event.eventTime
				if (eventsWithAvailability.includes(eventKey)) {
					eventData.splice(i, 1)
					eventsWithAvailability.splice(eventsWithAvailability.indexOf(eventKey), 1)
					continue
				} else {
					event.eventName = eventWithoutSuffix
					eventsWithAvailability.push(eventKey)
				}
			}

			i++
		}

		eventData.sort((a, b) => a.timestamp - b.timestamp)
		console.log(eventData)
		return eventData
	}

	async function sendToDiscord() {
		let message = '# Upcoming Brightspace Events\n'
		let lastDate = ''

		const eventEls = document.querySelectorAll('.av-event')
		eventEls.forEach(event => {
			let date = event.querySelector('.av-event_date').innerText
			let course = event.querySelector('.av-event_course').innerText
			let title = event.querySelector('.av-event_title').innerText
			let time = event.querySelector('.av-event_time').innerText
			if (lastDate != date) {
				message += `## ${date}`
				lastDate = date
			}
			message += '\n'
			message += `-# ${course}\n`
			message += `${title}\n`
			message += `-# ${time}\n`
		})

		await fetch(webhookUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				content: message
			})
		});
	}

	const now = new Date();

	let weekEvents = await getWeekEvents(now)
	// now.setDate(now.getDate() + 7)
	// let nextWeek = await getWeekEvents(now)
	// let twoWeeks = [...weekEvents, ...nextWeek]
	// console.log(twoWeeks)

	let currentOverlay = document.querySelector('.av-reminder')
	if (currentOverlay) {
		currentOverlay.remove()
	}

	let styles = `
		body:has(.av-reminder) {
			overflow-y: hidden !important;
		}

		.av-reminder {
			--spacing: min(1rem, 3vw);
			box-sizing: border-box;
			backdrop-filter: blur(8px);
			position: fixed;
			inset: 0;
			width: 100vw;
			height: 100vh;
			z-index: 999999999999999;
			padding: calc(var(--spacing) * 2);
			display: flex;
			justify-content: center;

			.av-click_to_exit {
				position: absolute;
				inset: 0;
				z-index: -1;
			}

			.av-popup {
				background-color: white;
				box-shadow: 0 0 2rem #002D7488;
				padding: calc(var(--spacing) * 1.5);
				display: flex;
				flex-direction: column;
				gap: var(--spacing);
				width: 600px;
			}

			.av-line {
				background-color: #002D74;
				height: calc(var(--spacing) * 0.2);
				width: 100%;
			}

			.av-popup_title {
				display: flex;
				flex-direction: row;
				font-size: calc(var(--spacing) * 1.75);
				line-height: 1;
				align-items: center;
				justify-content: space-between;
			}

			.av-popup_title div {
				position: relative;
				width: calc(var(--spacing) * 1.75);
				height: calc(var(--spacing) * 1.75);
				cursor: pointer;
			}

			.av-event_close {
				cursor: pointer;
				position: relative;
				aspect-ratio: 1/1;
				height: 100%;
				transition: transform 0.25s ease;
			}

			.av-event_close:hover {
				transform: scale(1.1);
			}

			.av-popup_title div::before,
			.av-popup_title div::after {
				top: calc(var(--spacing) - var(--spacing) * 0.2);
				height: calc(var(--spacing) * 0.2);
			}

			.av-event_close::before,
			.av-event_close::after {
				top: calc(0.96rem / 2 - 1px);
				height: 0.075rem;
				opacity: 0.9;
			}

			.av-popup_title div::before,
			.av-popup_title div::after,
			.av-event_close::before,
			.av-event_close::after {
				content: "";
				position: absolute;
				display: block;
				width: 100%;
				background: black;
				transform: rotate(45deg);
			}
				
			.av-event_close::after {
				transform: rotate(-45deg);
			}
				
			.av-popup_title div::after {
				transform: rotate(-45deg);
			}

			.av-events {
				flex: 1;
				overflow-y: auto;
				display: flex;
				flex-direction: column;
				scrollbar-color: #000000 #00317f61;
  			scrollbar-width: thin;
			}

			.av-event {
				display: flex;
				flex-direction: column;
				gap: 4px;
				padding: calc(var(--spacing) * 0.9) var(--spacing);
				background-color: #0049be2a;
				border-bottom: 2px solid #00317f61;
			}

			.av-event_top {
				display: flex;
				gap: var(--spacing);
			}

			.av-event_details {
				display: flex;
				justify-content: space-between;
				flex-grow: 1;
			}

			.av-event_course,
			.av-event_date,
			.av-event_time {
				font-size: 0.8rem;
				line-height: 1.2;
				opacity: 0.9;
			}

			.av-event_title {
				font-size: 1.25rem;
				line-height: 1.1;
			}

			.av-disc_btn {
				padding: calc(var(--spacing) / 2);
				margin-top: var(--spacing);
				margin-inline: auto;
				background-color: black;
				color: white;
				line-height: 1;
				cursor: pointer;
				transition: transform 0.25s ease;
			}

			.av-disc_btn:hover {
				transform: scale(1.1);
			}
		}
	`

	let stylesEl = document.createElement('style')
	stylesEl.innerText = styles
	document.head.appendChild(stylesEl)

	let baseEl = document.createElement('div')
	baseEl.className = 'av-reminder'
	document.body.appendChild(baseEl)

	let exitBack = document.createElement('div')
	exitBack.className = 'av-click_to_exit'
	exitBack.onclick = () => {
		baseEl.remove()
		stylesEl.remove()
	}
	baseEl.appendChild(exitBack)

	let popup = document.createElement('div')
	popup.className = 'av-popup'
	baseEl.appendChild(popup)

	let popupTitle = document.createElement('div')
	popupTitle.className = 'av-popup_title'
	let popupTitleText = document.createElement('span')
	popupTitleText.innerText = 'Brightspace Discord Reminders'
	let popupTitleBtn = document.createElement('div')
	popupTitleBtn.onclick = () => {
		baseEl.remove()
		stylesEl.remove()
	}
	popupTitle.appendChild(popupTitleText)
	popupTitle.appendChild(popupTitleBtn)
	popup.appendChild(popupTitle)

	let line = document.createElement('div')
	line.className = 'av-line'
	popup.appendChild(line)

	let eventsWrapper = document.createElement('div')
	eventsWrapper.className = 'av-events'
	popup.appendChild(eventsWrapper)

	weekEvents.forEach(evnt => {
		if (evnt.timestamp <= now.getTime()) {
			return
		}

		let eventEl = document.createElement('div')
		eventEl.className = 'av-event'
		eventsWrapper.appendChild(eventEl)

		let eventTop = document.createElement('div')
		eventTop.className = 'av-event_top'
		eventEl.appendChild(eventTop)
		let eventDetails = document.createElement('div')
		eventDetails.className = 'av-event_details'
		eventTop.appendChild(eventDetails)
		let eventClose = document.createElement('div')
		eventClose.className = 'av-event_close'
		eventClose.onclick = () => {
			eventEl.remove()
		}
		eventTop.appendChild(eventClose)

		let eventCourse = document.createElement('span')
		eventCourse.className = 'av-event_course'
		eventCourse.innerText = evnt.className
		let eventDate = document.createElement('span')
		eventDate.className = 'av-event_date'
		eventDate.innerText = `${evnt.weekday.substring(0,3)}, ${evnt.month.substring(0,3)} ${evnt.date}`
		eventCourse.setAttribute('contenteditable', '')
		eventDate.setAttribute('contenteditable', '')
		eventDetails.appendChild(eventCourse)
		eventDetails.appendChild(eventDate)
		
		let eventTitle = document.createElement('span')
		eventTitle.className = 'av-event_title'
		eventTitle.innerText = evnt.eventName
		eventTitle.setAttribute('contenteditable', '')
		eventEl.appendChild(eventTitle)

		let eventDue = document.createElement('span')
		eventDue.className = 'av-event_time'
		eventDue.innerText = evnt.eventTime
		eventDue.setAttribute('contenteditable', '')
		eventEl.appendChild(eventDue)
	})

	let discordButton = document.createElement('btn')
	discordButton.className = 'av-disc_btn'
	discordButton.innerText = 'Send to Discord'
	discordButton.onclick = async () => {
		await sendToDiscord()
		baseEl.remove()
		stylesEl.remove()
	}
	eventsWrapper.appendChild(discordButton)
})();
