// ==UserScript==
// @name         Subject Lesson Data Viewer for Dev
// @namespace    https://alanvalerio.com/
// @version      1.1.5
// @description  Log current lesson's data onto the page in Dev
// @author       Alan Valerio
// @match        https://dev.app.subject.com/*
// @grant        none
// @updateURL    https://www.alanvalerio.com/userscripts/subject/devDebug.user.js
// @downloadURL  https://www.alanvalerio.com/userscripts/subject/devDebug.user.js
// ==/UserScript==

;(function () {
	'use strict'

	// Queue to store responses until DOM is ready
	let lastPathname = ''

	function showTemporaryAlert(message) {
		const alertDiv = document.createElement('div')
		alertDiv.innerHTML = message
		alertDiv.style.position = 'fixed'
		alertDiv.style.top = '20px'
		alertDiv.style.left = '50%'
		alertDiv.style.transition = 'all 0.25s ease-out'
		alertDiv.style.transform = 'translateX(-50%) translateY(-150%)'
		alertDiv.style.backgroundColor = '#212226'
		alertDiv.style.textAlign = 'center'
		alertDiv.style.color = 'white'
		alertDiv.style.padding = '10px 20px'
		alertDiv.style.borderRadius = '5px'
		alertDiv.style.fontSize = '16px'
		alertDiv.style.zIndex = '9999'
		alertDiv.style.border = '1px solid #303236'
		document.body.appendChild(alertDiv)
		setTimeout(() => {
			alertDiv.style.transform = 'translate(-50%) translateY(0%)'
		}, 0)
		setTimeout(() => {
			alertDiv.remove()
		}, 2000)
	}

	// Refresh token
	function getBearerToken() {
		const match = document.cookie.match(new RegExp('(^| )access_token=([^;]+)'))
		return match ? match[2] : null
	}

	// URL change detection
	function checkURLChange() {
		const currentPathname = window.location.pathname
		if (currentPathname !== lastPathname) {
			lastPathname = currentPathname
			processPage()
		}
	}

	function processPage() {
		const currentUrl = window.location.pathname
		const bearerToken = getBearerToken()
		const urlSections = currentUrl.split('/')
		const courseId = urlSections?.[4]
		const lessonId = urlSections?.[6]

		if (!bearerToken || !courseId || !lessonId) return

		fetch(`https://dev-services.subject.com/content/courses/${courseId}/lessons/${lessonId}?includeAssessmentQuestions=true`, {
			method: 'GET',
			headers: {
				authorization: `Bearer ${bearerToken}`,
			},
		})
			.then((response) => {
				return response.json()
			})
			.then((data) => {
				appendResponseData(data.data)
			})
			.catch((error) => {
				console.error('Error:', error)
			})
	}

	function escapeHtml(unsafe) {
		return unsafe.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;')
	}

	function getBlockValueHTML(block) {
		if (block.type === 'html') {
			return `
        <pre>Value: <span toggleValue="${block.id}">See Value</span></pre>
        <pre class="hidden-value" copyVal="${escapeHtml(block.value)}" valueId="${block.id}"><span class="pad">${escapeHtml(block.value)}</span></pre>
        <pre class="accent-text">Preview:</pre>
        <div class="pad">${block.value}</div>
      `
		} else if (block.type === 'pdf') {
			return `
        <pre copyVal="${block.title}">Title: <span>${block.title}</span></pre>
        <pre>Value: <span toggleValue="${block.id}">See Value</span></pre>
        <pre class="hidden-value" copyVal="${block.value}" valueId="${block.id}"><span class="pad">${block.value}</span></pre>
        <pre class="accent-text">Preview:</pre>
        <embed class="pad" src="${block.value}" type="application/pdf" width="100%" height="500px" />
      `
		} else if (block.type === 'embed') {
			return `
        <pre>Value: <span toggleValue="${block.id}">See Value</span></pre>
        <pre class="hidden-value" copyVal="${block.value}" valueId="${block.id}"><span class="pad">${block.value}</span></pre>
        <pre class="accent-text">Preview:</pre>
        <embed class="pad" src="${block.value}" type="text/html" width="100%" height="500px" />
      `
		} else if (block.type === 'image') {
			return `
        <pre>Value: <span toggleValue="${block.id}">See Value</span></pre>
        <pre class="hidden-value" copyVal="${block.value}" valueId="${block.id}"><span class="pad">${block.value}</span></pre>
        <pre class="accent-text">Preview:</pre>
        <img class="pad" src="${block.value}" width="auto" height="500px" />
      `
		} else if (block.type === 'audio') {
			return `
        <pre copyVal="${block.title}">Title: <span>${block.title}</span></pre>
        <pre>Value: <span toggleValue="${block.id}">See Value</span></pre>
        <pre class="hidden-value" copyVal="${block.value}" valueId="${block.id}"><span class="pad">${block.value}</span></pre>
        <pre class="accent-text">Preview:</pre>
        <audio controls src="${block.value}"></audio>
      `
		} else {
			return `
        <pre class="accent-text" copyVal="${block.value}">Value:</pre>
        <pre class="pad main-text-color" copyVal="${block.value}">${block.value}</pre>
      `
		}
	}

	function appendResponseData(data) {
		waitForElm('.css-1ccznzk').then(() => {
			console.log(data)

			const content = document.querySelector('.css-1ccznzk')
			let skip = false

			document.querySelectorAll('[id="lessonData"]').forEach((element) => {
				if (element.textContent == JSON.stringify(data, null, 2)) {
					skip = true
				}
			})

			if (!content || skip) return
			let element = document.querySelector('[id="lessonData"]')

			if (!element) {
				element = document.createElement('div')
				element.id = 'lessonData'
				element.style.borderTop = '1px solid var(--chakra-colors-\\$subtle-border)'
				element.style.padding = '10px'
				element.style.marginTop = 'var(--chakra-space-6)'
				element.style.paddingTop = 'var(--chakra-space-6)'
				element.style.overflow = 'auto'
				element.style.display = 'flex'
				element.style.flexDirection = 'column'
				content.appendChild(element)
			}

			let elementHTML = ''

			const styles = document.createElement('style')
			styles.textContent = `
        #lessonData > * {
          max-width: 100%;
        }

        .outline {
          border-width: 1px;
          border-style: solid;
          background-color: var(--chakra-colors-\\$bg-01);
          border-radius: var(--chakra-radii-md);
          padding: var(--chakra-space-3);
          margin-block: var(--chakra-space-1) var(--chakra-space-3);
          margin-inline-start: var(--chakra-space-3);
          overflow: auto;
          z-index: 1;
        }

        #lessonData > .outline {
          z-index: 0;
        }

        .truncate {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        pre {
          color: var(--chakra-colors-\\$text-02);
          word-wrap: wrap;
          white-space: pre-wrap;
        }

        pre > span {
          color: var(--chakra-colors-\\$text-01);
          opacity: 0.9;
        }

        .icon {
          margin-inline-end: var(--chakra-space-2);
          color: var(--chakra-colors-\\$text-01);
          font-weight: var(--chakra-fontWeights-light);
        }

        .main-text-color {
          color: var(--chakra-colors-\\$text-01);
        }

        .accent-text {
          color: var(--chakra-colors-\\$hover-primary-text);
        }

        .accent-text > span {
          opacity: 1;
        }

        h2 {
          font-size: var(--chakra-fontSizes-5xl);
          font-family: var(--chakra-fonts-heading);
          font-weight: var(--chakra-fontWeights-book);
          line-height: 1;
        }

        h3 {
          font-size: var(--chakra-fontSizes-2xl);
          font-family: var(--chakra-fonts-heading);
          font-weight: var(--chakra-fontWeights-book);
          line-height: 1;
          padding-bottom: var(--chakra-space-1);
        }

        .subtle {
          color: var(--chakra-colors-\\$text-02);
          font-weight: var(--chakra-fontWeights-light);
        }

        .pad-big {
          padding-block: var(--chakra-space-3);
        }

        .pad-btm-big {
          padding-bottom: var(--chakra-space-3);
        }

        .pad-top-big {
          padding-top: var(--chakra-space-3);
        }

        .pad-small {
          padding-block: var(--chakra-space-2);
        }

        .pad-btm-small {
          padding-bottom: var(--chakra-space-2);
        }

        .pad-top-small {
          padding-top: var(--chakra-space-2);
        }

        .pad-tiny {
          padding-block: var(--chakra-space-1);
        }

        .pad-btm-tiny {
          padding-bottom: var(--chakra-space-1);
        }

        .pad-top-tiny {
          padding-top: var(--chakra-space-1);
        }

        .pad-left {
          padding-inline-start: var(--chakra-space-3);
        }

        .pad {
          padding-inline: var(--chakra-space-3);
        }

        .correct-ac {
          border-color:#25ad7080;
        }

        .incorrect-ac {
          border-color: #E45D3A80;
        }

        .correct-ac, .incorrect-ac {
          position: relative;
          overflow: hidden;
        }

        .correct-ac *, .incorrect-ac * {
          opacity: initial;
        }

        .correct-ac::after, .incorrect-ac::after {
          content: "";
          position: absolute;
          inset: 0;  
          opacity: .1; 
          z-index: -1;
          pointer-events: none;
        }

        .correct-ac::after {
          background-color: #25ad70;
        }

        .incorrect-ac::after {
          background-color: #E45D3A;
        }

        [toggleValue] {
          cursor: pointer;
          background-color: var(--chakra-colors-\\$primary-button);
          color: var(--chakra-colors-\\$primary-button-text);
          display: inline-block;
          padding-inline: var(--chakra-space-2);
          border-radius: var(--chakra-radii-md);
          transition-property: var(--chakra-transition-property-common);
          transition-duration: var(--chakra-transition-duration-normal);
        }

        [toggleValue]:hover {
          background-color: var(--chakra-colors-\\$hover-primary);
          color: var(--chakra-colors-\\$primary-button-text);
        }

        .hidden-value {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 500ms;
        }

        .hidden-value > span {
          display: block;
          overflow: hidden;
        }

        .hidden-value.active {
          grid-template-rows: 1fr;
        }
      `
			element.appendChild(styles)

			elementHTML += `
        <h2 class="pad-btm-small">Debug Info</h2>
        <pre>Click any value to copy it</pre>

        <h3 class="pad-top-big">General Task Info</h3>
        <div class="outline">
          <pre copyVal="${data.title}">Title: <span>${data.title}</span></pre>
          <pre class="accent-text" copyVal="${data.id}">Task ID: <span>${data.id}</span></pre>
          <pre copyVal="${data.courseId}">Course ID: <span>${data.courseId}</span></pre>
          <pre copyVal="${data.chapterId}">Topic ID: <span>${data.chapterId}</span></pre>
          <pre copyVal="${data.type}">Type: <span>${data.type}</span></pre>
        </div>
      `

			if (data.type === 'video') {
				elementHTML += `
          <h3>Video Data</h3>
          <div class="outline">
            <pre copyVal="${data.assessment.thumbnailUrl}">Video Thumbnail:</pre>
            <img class="pad" copyVal="${data.assessment.thumbnailUrl}" src="${data.assessment.thumbnailUrl}" width="100%" height="500px" />
          </div>
        `
			}

			if (data.assessment.blocks.length > 0) {
				elementHTML += `
          <h3>Task Blocks</h3>
          <div>
        `

				data.assessment.blocks.forEach((block, i) => {
					elementHTML += `
            <div class="pad-btm-big outline">
              <pre class="pad-btm-big"><span>Task Block ${i + 1}</span></pre>
              <pre class="accent-text" copyVal="${block.id}">TaskBlock ID: <span>${block.id}</span></pre>
              <pre copyVal="${block.type}">Type: <span>${block.type}</span></pre>
              ${getBlockValueHTML(block)}
            </div>
          `
				})

				elementHTML += `
          </div>
        `
			}

			if (data.assessment.questions.length > 0) {
				elementHTML += `
          <h3>Questions</h3>
          <div>
        `

				data.assessment.questions.filter((q) => {
          return !(q.types.length == 1 && q.types[0] == 'group' && q.types.length == 1)
        }).forEach((q, i) => {
					elementHTML += `
            <div class="pad-btm-big outline">
              <pre class="pad-btm-big"><span>Question ${i + 1}</span></pre>
              <pre class="accent-text" copyVal="${q.id}">Question ID: <span>${q.id}</span></pre>
              ${q?.parentId ? `<pre copyVal="${q.parentId}">Question Group Id: <span>${q.parentId}</span></pre>` : ''}
              <pre copyVal="${q.types.join(', ')}">Type${q.types.length > 1 ? 's' : ''}: <span>${q.types.join(', ')}</span></pre>
              ${q.text ? `<pre copyVal="${q.text}">Text: <span>${q.text}</span></pre>` : ''}
          `


          if (q.metadata.blocks.length === 1 && q.metadata.blocks[0].id == 'text') {
            elementHTML += `<pre class="accent-text" copyVal="${q.metadata.blocks[0].value}">Question Text: <span>${q.metadata.blocks[0].value}</span></pre>`
          } else if (q.metadata.blocks.length > 0) {
            elementHTML += `<pre>Question Blocks:</pre>`
            q.metadata.blocks.forEach((block, j) => {
              elementHTML += `
                <div class="pad-btm-big outline">
                  <pre class="pad-btm-big"><span>Question Block ${j + 1}</span></pre>
                  <pre class="accent-text" copyVal="${block.id}">QuestionBlock ID: <span>${block.id}</span></pre>
                  <pre copyVal="${block.type}">Type: <span>${block.type}</span></pre>
                  ${getBlockValueHTML(block)}
                </div>
              `
            })
          }

					if (q.metadata.document) {
						let pdfUrl
						elementHTML += `
              <pre>Document:</pre>
              <embed class="pad" data-from="${q.metadata.document}" type="application/pdf" width="100%" height="500px" />
            `

						fetch(q.metadata.document)
							.then((response) => response.blob())
							.then((blob) => {
								const newBlob = new Blob([blob], { type: 'application/pdf' })
								pdfUrl = URL.createObjectURL(newBlob)
								console.log(pdfUrl)
								waitForElm(`embed[data-from="${q.metadata.document}"]`).then(() => {
									document.querySelector(`embed[data-from="${q.metadata.document}"]`).src = pdfUrl
								})
							})
							.catch((error) => {
								// Handle any errors
								console.error('Error fetching the PDF:', error)
							})
					}

					elementHTML += `
              ${q.answers.length > 0 ? `<pre>Answers:</pre>` : ''}
          `

					q.answers?.forEach((answer, j) => {
						elementHTML += `
              <div class="pad-btm-big outline ${answer.correct ? 'correct-ac' : 'incorrect-ac'}">
                <pre class="pad-btm-big"><span>Answer Choice ${j + 1}</span></pre>
                <pre class="accent-text" copyVal="${answer.id}">Answer Choice ID: <span>${answer.id}</span></pre>
                <pre copyVal="${answer.correct}">Correct: <span>${answer.correct}</span></pre>
            `

						if (answer.metadata.blocks.length === 1 && answer.metadata.blocks[0].id == 'text') {
							elementHTML += `<pre class="accent-text" copyVal="${answer.metadata.blocks[0].value}">Value: <span>${answer.metadata.blocks[0].value}</span></pre>`
						} else if (answer.metadata.blocks.length > 0) {
							elementHTML += `<pre>Answer Blocks:</pre>`
							answer.metadata.blocks.forEach((block, k) => {
								elementHTML += `
                  <div class="pad-btm-big outline">
                    <pre class="pad-btm-big"><span>Answer Block ${k + 1}</span></pre>
                    <pre class="accent-text" copyVal="${block.id}">AnswerBlock ID: <span>${block.id}</span></pre>
                    <pre copyVal="${block.type}">Type: <span>${block.type}</span></pre>
                    ${getBlockValueHTML(block)}
                  </div>
                `
							})
						}

						elementHTML += `
                <pre class="accent-text" copyVal="${escapeHtml(answer.feedback)}">Feedback:</pre>
                <div class="pad" copyVal="${escapeHtml(answer.feedback)}">${answer.feedback}</div>
              </div>
            `
					})

					elementHTML += `
            </div>
          `
				})

				elementHTML += `
          </div>
        `
			}

			element.innerHTML += elementHTML

			document.querySelectorAll('[copyVal]').forEach((element) => {
				element.addEventListener('click', () => {
					const text = element.getAttribute('copyVal')
					navigator.clipboard.writeText(text)
					showTemporaryAlert(`"${escapeHtml(text)}"<br/>Copied to clipboard!`)
				})
				element.style.cursor = 'pointer'
			})

			document.querySelectorAll('[toggleValue]').forEach((element) => {
				element.addEventListener('click', () => {
					const valueId = element.getAttribute('toggleValue')
					const valueElement = document.querySelector(`.hidden-value[valueId="${valueId}"]`)
					if (valueElement.classList.contains('active')) {
						valueElement.classList.remove('active')
						element.textContent = 'See Value'
					} else {
						valueElement.classList.add('active')
						element.textContent = 'Hide Value'
					}
				})
			})
		})
	}

	function waitForElm(selector) {
		return new Promise((resolve) => {
			if (document.querySelector(selector)) {
				return resolve(document.querySelector(selector))
			}

			const observer = new MutationObserver((mutations) => {
				if (document.querySelector(selector)) {
					observer.disconnect()
					resolve(document.querySelector(selector))
				}
			})

			observer.observe(document.body, {
				childList: true,
				subtree: true,
			})
		})
	}

	setInterval(() => {
		checkURLChange()
	}, 250)

	// Keyboard listener for manual refresh with unused F10 key
	document.addEventListener('keydown', function (e) {
		if (e.key === 'F10') {
			processPage()
		}
	})
})()
