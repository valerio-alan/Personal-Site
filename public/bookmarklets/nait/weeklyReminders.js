(async function () {
	if (!window.location.hostname.includes('lms.nait.ca')) {
		setTimeout(() => {
			const script = document.querySelector('script[src*="weeklyReminders.js"]:last-of-type');
			script.parentNode.removeChild(script);
		}, 1);
		return;
	}

	const now = new Date();
	const year = now.getFullYear();
	const month = now.getMonth() + 1;
	const monthName = now.toLocaleString('default', {month: 'short'});
	const day = now.getDate() + 7;
	const calDataUrl = `https://lms.nait.ca/d2l/le/calendar/6606/home/eventspanepartial?searchInfo=&year=${year}&month=${month}&day=${day}`;

	async function getCalData() {
		let res = await fetch(calDataUrl);
		let rawData = await res.text();
		let data = JSON.parse(rawData.replace('while(1);', ''));
		let html = data?.Payload?.Html;
		if (!html) {
			return null;
		}
		console.log(html)
		return html
	}

	function parseCalHtmlEvents(calHTML) {
		let dom = new DOMParser()
		let doc = dom.parseFromString(calHTML, 'text/html')
		let dateEls = doc.querySelector('.d2l-offscreen').querySelectorAll('th:not(:first-of-type)')
		let weekDayNums = Array.from(dateEls).map((el) => {
			let text = el.textContent
			let weekDayNum = text.match(/\d+(?=,)/g)[0]
			return weekDayNum
		})
		let events = doc.querySelectorAll('a[title]')
		let weekDayEvents = []
		for (num in weekDayNums) {
			weekDayEvents.push([])
		}
		events.forEach((eventEl) => {
			let elWrapper = eventEl.closest('td')
			let weekDayIndex = Array.from(elWrapper.parentElement.querySelectorAll('td')).indexOf(elWrapper)
			let weekDayNum = weekDayNums[weekDayIndex]
			console.log(weekDayNum)

			let eventClass = elWrapper.querySelector('[class*="calendar-dot-name"]')?.textContent.replace(/ \(\w{3}\.\d{4}\)$/g, '')
			console.log(eventClass)
			let eventName = eventEl.querySelector('[class*="event-title"]')?.textContent
			console.log(eventName)
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

			console.log(eventTime)

		})
		
	}

	parseCalHtmlEvents(await getCalData());
})();
