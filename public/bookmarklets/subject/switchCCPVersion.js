(async function () {
  if (!window.location.hostname.includes('subject.com')) {
    setTimeout(() => {
      const script = document.querySelector('script[src*="devReview.js"]:last-of-type')
      script.parentNode.removeChild(script)
    }, 1)
    return
  }
  
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

	async function switchCCPs() {
		const currentUrl = window.location.pathname
		if (!currentUrl.startsWith('/courses/') && !currentUrl.startsWith('/courses-v2/')) {
			showTemporaryAlert('You must be on a course page to toggle CCP versions')
      return
		}
		const urlSections = currentUrl.split('/')
		const courseId = urlSections?.[2]
		if (currentUrl.startsWith('/courses-v2/')) {
			showTemporaryAlert("Switching to v1...", true);
			window.location.href = `/courses/${courseId}`
			return
		}

		const bearerToken = getBearerToken()

		if (!bearerToken || !courseId) {
      showTemporaryAlert('Something went wrong<br>Please refresh the page and try again')
      return
    }

    const courseResponse = await fetch(`https://services.subject.com/course-management/courses-v2/${courseId}`, { method: 'GET', headers: { authorization: `Bearer ${bearerToken}` } })
    const courseData = await courseResponse.json()
		var revisionId = courseData?.data?.revisionId
    if (!courseData || !revisionId) {
      showTemporaryAlert('Something went wrong<br>Please refresh the page and try again')
      return
    }

		showTemporaryAlert("Switching to v2...", true);
		window.location.href = `/courses-v2/${courseId}/revisions/${revisionId}`
	}

	await switchCCPs()
	setTimeout(() => {
		const script = document.querySelector('script[src*="switchCCPVersion.js"]:last-of-type')
		script.parentNode.removeChild(script)
	}, 0)
})()