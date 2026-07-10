(async function () {
  if (!window.location.hostname.includes('courses.subject.com')) {
    setTimeout(() => {
      const script = document.querySelector('script[src*="openRevInSheets.js"]:last-of-type')
      script.parentNode.removeChild(script)
    }, 1)
    return
  }

	const WEB_APP_URL = 'https://script.google.com/a/macros/subject.com/s/AKfycbysTYrHb_nSSGkepGDIRj56nqfEm3Cdm0cNVnXVQLERlgA937VlbG2eAVL7MMAPMvRrzw/exec'
  
  function showTemporaryAlert(message, instant = false) {
		const alertDiv = document.createElement('div')
		alertDiv.innerHTML = message
		alertDiv.style.position = 'fixed'
		alertDiv.style.top = '20px'
		alertDiv.style.left = '50%'
		if (instant) {
			alertDiv.style.transform = 'translateX(-50%) translateY(0%)'
		} else {
			alertDiv.style.transition = 'all 0.25s ease-out'
			alertDiv.style.transform = 'translateX(-50%) translateY(-150%)'
		}
    if (window.location.hostname.includes('subject.com')) {
		  alertDiv.style.backgroundColor = 'var(--chakra-colors-\\$bg-02)'
		  alertDiv.style.border = '1px solid var(--chakra-colors-\\$subtle-border)'
		  alertDiv.style.color = 'var(--chakra-colors-\\$text-01)'
    } else {
      alertDiv.style.backgroundColor = '#212226'
		  alertDiv.style.border = '1px solid #303236'
		  alertDiv.style.color = '#FCFDFF'
    }
		alertDiv.style.textAlign = 'center'
		alertDiv.style.padding = '10px 20px'
		alertDiv.style.borderRadius = '5px'
		alertDiv.style.fontSize = '16px'
		alertDiv.style.zIndex = '9999'
		document.body.appendChild(alertDiv)
		if (!instant) {
			setTimeout(() => {
				alertDiv.style.transform = 'translate(-50%) translateY(0%)'
			}, 1)
		}
		setTimeout(() => {
			alertDiv.remove()
		}, 2000)
	}

	function getBearerToken() {
		const match = document.cookie.match(new RegExp('(^| )access_token=([^;]+)'))
		return match ? match[2] : null
	}

	async function getCourseTitle() {
		const currentUrl = window.location.pathname
		if (!currentUrl.startsWith('/courses/') && !currentUrl.startsWith('/courses-v2/')) {
			showTemporaryAlert('You must be on a course page to open a revision')
      return
		}
		const urlSections = currentUrl.split('/')
		const courseId = urlSections?.[2]
		const bearerToken = getBearerToken()

		if (!bearerToken || !courseId) {
      showTemporaryAlert('Something went wrong<br>Please refresh the page and try again')
      return
    }

    const courseResponse = await fetch(`https://services.subject.com/course-management/courses/${courseId}`, { method: 'GET', headers: { authorization: `Bearer ${bearerToken}` } })
    let courseData = await courseResponse.json()

		return courseData?.data?.title || `Course ${courseId}`
	}

	async function getCurrentRevs() {
		const currentUrl = window.location.pathname
		if (!currentUrl.startsWith('/courses/') && !currentUrl.startsWith('/courses-v2/')) {
			showTemporaryAlert('You must be on a course page to open a revision')
      return
		}
		const urlSections = currentUrl.split('/')
		const courseId = urlSections?.[2]
		const bearerToken = getBearerToken()

		if (!bearerToken || !courseId) {
      showTemporaryAlert('Something went wrong<br>Please refresh the page and try again')
      return
    }

    const revisionResponse = await fetch(`https://services.subject.com/course-management/courses/${courseId}/revisions`, { method: 'GET', headers: { authorization: `Bearer ${bearerToken}` } })
    let revisionData = await revisionResponse.json()
		revisionData = revisionData?.data?.revisions || []

		if (!revisionData || revisionData.length === 0) {
			showTemporaryAlert('Revisions could not be found for this course<br>Please ensure this course has revisions and try again')
			return
		}

		return revisionData
	}

	async function showRevSelector() {
		let revisions = await getCurrentRevs()
		if (!revisions) return

		revisions = revisions.filter(rev => rev.status === 'approved')

		const courseTitle = await getCourseTitle()

		const existingRevSelectorWrapper = document.getElementById('revSelectorWrapper')
		if (existingRevSelectorWrapper) {
			existingRevSelectorWrapper.remove()
		}

		const revSelectorWrapper = document.createElement('div')
		revSelectorWrapper.id = 'revSelectorWrapper'
		revSelectorWrapper.style.display = 'flex'
		revSelectorWrapper.style.position = 'fixed'
		revSelectorWrapper.style.top = '0'
		revSelectorWrapper.style.left = '0'
		revSelectorWrapper.style.width = '100dvw'
		revSelectorWrapper.style.height = '100dvh'
		revSelectorWrapper.style.justifyContent = 'center'
		revSelectorWrapper.style.alignItems = 'center'
		revSelectorWrapper.style.backgroundColor = '#1a1b1fbb'
		revSelectorWrapper.style.backdropFilter = 'blur(5px)'
		revSelectorWrapper.style.zIndex = '9999'
		revSelectorWrapper.addEventListener('click', (e) => {
			if (e.target === revSelectorWrapper) {
				revSelectorWrapper.remove()

				setTimeout(() => {
					const script = document.querySelector('script[src*="openRevInSheets.js"]:last-of-type')
					script.parentNode.removeChild(script)
				}, 1)
			}
		})

		const revContent = document.createElement('div')
		revContent.style.display = 'flex'
		revContent.style.flexDirection = 'column'
		revContent.style.padding = '20px 0px 0px'
		revContent.style.maxHeight = '80vh'
		revContent.style.maxWidth = '80vw'
		revContent.style.width = '1000px'
		revContent.style.overflowY = 'auto'
		revContent.style.backgroundColor = '#212226'
		revContent.style.border = '1px solid #303236'
		revContent.style.color = '#FCFDFF'
		revContent.style.borderRadius = '5px'
		revContent.style.fontSize = '16px'

		const revListTitle = document.createElement('h4')
		revListTitle.textContent = 'Select a Revision to open in Google Sheets'
		revListTitle.style.textAlign = 'center'
		revListTitle.style.marginBottom = '20px'
		revContent.appendChild(revListTitle)

		const revList = document.createElement('table')
		const revHeader = document.createElement('tr')
		revHeader.innerHTML = `
		<td style="padding:10px 20px;">Revision</td>
		<td style="padding:10px 20px;">Deployment</td>
		<td style="padding:10px 20px;">Created At</td>
		<td style="padding:10px 20px;">Created By</td>
		<td style="padding:10px 20px;max-width: 40%;">Description</td>`
		revList.appendChild(revHeader)

		revisions.forEach(rev => {
			const revItem = document.createElement('tr')
			revItem.innerHTML = `
			<td style="padding:10px 20px">${rev.revision}</td>
			<td style="padding:10px 20px">${rev.currentDeployments.length === 0 ? 'None' : rev.currentDeployments.map((deployment) => deployment?.environment.toString()).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(', ')}</td>
			<td style="padding:10px 20px;white-space: nowrap">${new Date(rev.createdAt).toLocaleString()}</td>
			<td style="padding:10px 20px;white-space: nowrap">${rev.createdBy}</td>
			<td style="padding:10px 20px;max-width: 40%">${rev.descriptionHtml}</td>`
			revItem.style.cursor = 'pointer'
			revItem.style.padding = '10px 20px'
			revItem.style.borderTop = '1px solid #303236'

			const revUrl = `https://services.subject.com/course-management/courses/${rev.courseId}/revisions/${rev.id}/export`

			revItem.addEventListener('click', async () => {
				showTemporaryAlert('Creating Revision in Google Sheets...')
				revSelectorWrapper.style.display = 'none'
				const params = new URLSearchParams()

				params.set('courseTitle', courseTitle || '')
				params.set('revUrl', revUrl || '')
				params.set('bearerToken', getBearerToken() || '')
				params.set('revNumber', rev.revision.toString() || '')

				const url = `${WEB_APP_URL}?${params.toString()}`
				const sheetRes = await fetch(url)
				let sheetResData = await sheetRes.json()
				sheetResData = sheetResData?.data || ''

				if (!sheetResData) {
					showTemporaryAlert('Something went wrong<br>Please refresh the page and try again')
					return
				}
				
				window.open(sheetResData, '_blank')

				setTimeout(() => {
					const script = document.querySelector('script[src*="openRevInSheets.js"]:last-of-type')
					script.parentNode.removeChild(script)
				}, 1)
			})

			revItem.addEventListener('mouseenter', () => {
				revItem.style.backgroundColor = '#303236';
			});

			revItem.addEventListener('mouseleave', () => {
				revItem.style.backgroundColor = '';
			});

			revList.appendChild(revItem)
		})

		revContent.appendChild(revList)
		revSelectorWrapper.appendChild(revContent)
		document.body.appendChild(revSelectorWrapper)
	}

	await showRevSelector()
})()