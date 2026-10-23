(async function () {
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

			let eventClass = elWrapper.querySelector('[class*="calendar-dot-name"]')?.textContent.replace(/ \(\w{3}\.\d{4}\)$/g, '')
			data.className = eventClass
			let eventName = eventEl.querySelector('[class*="event-title"]')?.textContent
			data.eventName = eventName
			let isAllDay = eventEl.closest('.d2l-le-calendar-week-all-wrapper') != null
			let eventTime = ''
			if (isAllDay) {
				eventTime = "All Day"
			} else {
				eventTime = eventEl.parentElement.querySelector('div .d2l-inline')?.textContent
				if (eventTime.includes('MEnds')) {
					eventTime = eventTime.replace('MEnds', 'M - Ends').replace('Starts', '').replace(' Ends', '')
				}
				eventTime = eventTime.replaceAll(` ${year}`, '').trim()
			}
			data.eventTime = eventTime

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
			overflow: hidden;
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

			.av-click_to_exit {
				position: absolute;
				inset: 0;
				z-index: -1;
			}

			.av-popup {
				flex-grow: 1;
				background-color: white;
				box-shadow: 0 0 2rem #002D7488;
				padding: calc(var(--spacing) * 1.5);
				display: flex;
				flex-direction: column;
				gap: var(--spacing);

				.av-line {
					background-color: #002D74;
					height: calc(var(--spacing) * 0.2);
					width: 100%;
				}
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

			.av-popup_title div::before,
			.av-popup_title div::after {
				content: "";
				position: absolute;
				top: calc(var(--spacing) - var(--spacing) * 0.2);
				display: block;
				width: 100%;
				height: calc(var(--spacing) * 0.2);
				background: black;
				transform: rotate(45deg);
			}
				
			.av-popup_title div::after {
				transform: rotate(-45deg);
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
})();
