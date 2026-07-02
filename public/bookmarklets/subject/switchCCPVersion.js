(async function () {
  if (!window.location.hostname.includes('subject.com')) {
    setTimeout(() => {
      const script = document.querySelector('script[src*="devReview.js"]:last-of-type')
      script.parentNode.removeChild(script)
    }, 1)
    return
  }
  
  function showTemporaryAlert(message) {
		const alertDiv = document.createElement('div')
		alertDiv.innerHTML = message
		alertDiv.style.position = 'fixed'
		alertDiv.style.top = '20px'
		alertDiv.style.left = '50%'
		alertDiv.style.transition = 'all 0.25s ease-out'
		alertDiv.style.transform = 'translateX(-50%) translateY(-150%)'
		alertDiv.style.backgroundColor = 'var(--chakra-colors-\\$bg-02)'
		alertDiv.style.textAlign = 'center'
		alertDiv.style.color = 'var(--chakra-colors-\\$text-01)'
		alertDiv.style.padding = '10px 20px'
		alertDiv.style.borderRadius = '5px'
		alertDiv.style.fontSize = '16px'
		alertDiv.style.zIndex = '9999'
		alertDiv.style.border = '1px solid var(--chakra-colors-\\$subtle-border)'
		document.body.appendChild(alertDiv)
		setTimeout(() => {
			alertDiv.style.transform = 'translate(-50%) translateY(0%)'
		}, 0)
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
			showTemporaryAlert(courseId.toString());
			return
		}

		const bearerToken = getBearerToken()

		if (!bearerToken || !courseId || !lessonId) return
    const courseResponse = await fetch(`https://dev-services.subject.com/content/courses/${courseId}`, { method: 'GET', headers: { authorization: `Bearer ${bearerToken}` } })
    const courseData = await courseResponse.json()
    if (!courseData || !courseData?.data?.subject) {
      showTemporaryAlert('Something went wrong<br>Please refresh the page and try again')
      return
    }
	}

	await switchCCPs()
	setTimeout(() => {
		const script = document.querySelector('script[src*="devReview.js"]:last-of-type')
		script.parentNode.removeChild(script)
	}, 1)
})()