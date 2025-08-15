(async function () {
  if (!window.location.hostname.includes('subject.com')) {
    setTimeout(() => {
      const script = document.querySelector('script[src*="devReview.js"]:last-of-type')
      script.parentNode.removeChild(script)
    }, 1)
    return
  }

  const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwopIMjZIhRcOsS2hoMVcJThS_Bd2ml2wF2np24rJECjgtYsLLbBimbiskrnRHoVCgc/exec'

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

	async function checkURLChange() {
		const currentPathname = window.location.pathname
		if (currentPathname !== window.av_lastPathname) {
      removeIssueForm()
			window.av_lastPathname = currentPathname
			await processLesson()
		} else if (window.av_lessonData?.[window.av_lessonId] && sortQuestionAnswers(window.av_lessonData?.[window.av_lessonId])) {
      showTemporaryAlert('Lesson data has been updated')
      removeIssueForm()
		}
	}

	async function processLesson() {
		const currentUrl = window.location.pathname
		const bearerToken = getBearerToken()
		const urlSections = currentUrl.split('/')
		const courseId = urlSections?.[4]
		const lessonId = urlSections?.[6]

    window.av_lessonId = lessonId

    if (lessonId in window.av_lessonData) {
      return
    }

		if (!bearerToken || !courseId || !lessonId) return
    const courseResponse = await fetch(`https://dev-services.subject.com/content/courses/${courseId}`, { method: 'GET', headers: { authorization: `Bearer ${bearerToken}` } })
    const courseData = await courseResponse.json()
    if (!courseData || !courseData?.data?.subject) {
      showTemporaryAlert('Something went wrong<br>Please refresh the page and try again')
      return
    }

    const lessonResponse = await fetch(`https://dev-services.subject.com/content/courses/${courseId}/lessons/${lessonId}?includeAssessmentQuestions=true`, { method: 'GET', headers: { authorization: `Bearer ${bearerToken}` } })
    const lessonData = await lessonResponse.json()
    if (!lessonData || !lessonData?.data) {
      showTemporaryAlert('Something went wrong<br>Please refresh the page and try again')
      return
    }
    structureLessonData(courseData.data, lessonData.data)
	}

	function structureLessonData(course, lesson) {
    if (lesson.id in window.av_lessonData) {
      return
    }

    var chapterTitle

    if (course.chapters) {
      course.chapters.forEach((chapter) => {
        if (chapter.id === lesson.chapterId) {
          chapterTitle = chapter.title
        }
      })
    }

    var groupCount = 0
    var questions = lesson.assessment?.questions || []
    questions = questions.map((question, i) => {
      var num = i + 1
      if (question.types.includes('split_screen') || question.types.includes('group')) {
        groupCount++
        num = groupCount
      } else {
        num -= groupCount
      }

      return {
        num,
        id: question.id,
        type: question.types.join(', '),
        answers: question?.answers.map((answer) => {
          return {
            ...answer,
            preview: getAreaPreview(answer)
          }
        }) || [],
        blocks: question?.metadata?.blocks || [],
        text: question?.text || ''
      }
    })

    var data = {
      id: lesson.id,
      title: lesson.title,
      type: lesson.type,
      courseId: course.id,
      courseTitle: course.title,
      courseSubject: course.subject,
      chapterId: lesson.chapterId,
      chapterTitle: chapterTitle,
      hasDirections: lesson.assessment?.blocks && lesson.assessment?.blocks?.length > 0,
      pdfs: lesson.assessment?.blocks?.filter((block) => block.type === 'pdf') || [],
      questions,
      rawData: lesson
    }

    sortQuestionAnswers(data)

    window.av_lessonData[lesson.id] = data
	}

  function sortQuestionAnswers(lesson) {
    var changed = false
    lesson?.questions?.forEach((question) => {
      setQuestionPreview(question)

      var sortedACs = question.answers?.length ? document.querySelectorAll(question.answers.map((answer) => `[name="${question.id}"][value="${answer.id}"]`).join(',')) : []
      var newAnswers = []

      if (question.answers.length !== 0 && sortedACs.length === question.answers.length) {
        newAnswers = Array.from(sortedACs).map((ac) => {
          var answer = question.answers.find((a) => a.id === ac.value)
          var htmlContent = ac.parentElement.querySelector('.chakra-radio__label')

          return {
            ...answer,
            preview: htmlContent?.innerHTML ? htmlContent.innerHTML : getAreaPreview(answer)
          }
        })

        if (newAnswers.length === question.answers.length && JSON.stringify(newAnswers) !== JSON.stringify(question.answers)) {
          changed = true
          question.answers = newAnswers
        }
      }

    })

    lesson.areas = getIssueAreas(lesson)

    return changed
  }

  function getAreaPreview(area) {
    const blocks = area?.blocks || area?.metadata?.blocks || []
    if (blocks.length === 0) {
      const text = (typeof area?.text === 'string' && area.text.trim())
        || 'No preview available'
      return text
    }
    const wrap = document.createElement('div')
    blocks.forEach((b) => {
      if (!b || !b.type) return
      if (b.type === 'text') {
        const p = document.createElement('div')
        p.textContent = b.value || ''
        wrap.appendChild(p)
      } else if (b.type === 'image') {
        const img = document.createElement('img')
        img.className = 'av-preview-img'
        const src = b.value || b.url || b.src || ''
        if (!src) return
        img.src = src
        img.alt = b.title || 'Answer image'
        wrap.appendChild(img)
      } else if (typeof b.value === 'string') {
        const p = document.createElement('div')
        p.textContent = b.value
        wrap.appendChild(p)
      }
    })
    return wrap.innerHTML
  }

  function setQuestionPreview(question) {
    question.preview = getAreaPreview(question)
  }

  function currLesson() {
    return window.av_lessonData?.[window.av_lessonId]
  }

  const issues = [
    {
      title: "Missing Topic",
      categories: ['course']
    },
    {
      title: "Missing Task",
      categories: ['course']
    },
    {
      title: "Formatting - Student-Blocking",
      exclude: ['video']
    },
    {
      title: "Formatting - Not Student-Blocking",
      exclude: ['video']
    },
    {
      title: "Incorrect Question",
      categories: ['task', 'q', 'qc', 'qsup']
    },
    {
      title: "Incorrect Answer",
      categories: ['q', 'ac']
    },
    {
      title: "Answer Marked Wrong",
      categories: ['q', 'ac']
    },
    {
      title: "Incorrect Points",
      categories: ['task', 'q', 'qc', 'ac']
    },
    {
      title: "Missing Question",
      categories: ['task', 'q', 'qc', 'qsup']
    },
    {
      title: "Missing Answer",
      categories: ['q', 'qc', 'ac']
    },
    {
      title: "Answer Feedback Incorrect",
      categories: ['q', 'ac']
    },
    {
      title: "Missing Image/PDF",
      categories: ['course', 'task', 'pdf', 'directions', 'q', 'qc', 'ac', 'qsup']
    },
    {
      title: "Wrong Image/PDF",
      categories: ['course', 'task', 'pdf', 'directions', 'q', 'qc', 'ac', 'qsup']
    },
    {
      title: "PDF/Image Issue",
      categories: ['task', 'pdf', 'directions', 'q', 'qc', 'ac', 'qsup']
    },
    {
      title: "Missing Information - Student-Blocking"
    },
    {
      title: "Missing Information - Not Blocking"
    },
    {
      title: "Text issue (Typo / Small change needed)",
      exclude: ['video', 'pdf']
    },
    {
      title: "Video - Missing",
      categories: ['course', 'task', 'video']
    },
    {
      title: "Video - Wrong Video",
      categories: ['video']
    },
    {
      title: "Video - Audio/Editing Issue - Student-Blocking",
      categories: ['video']
    },
    {
      title: "Video - Audio/Editing Issue - Not Student Blocking",
      categories: ['video']
    },
    {
      title: "Drag and Drop Issue",
      categories: ['course', 'q', 'qc', 'ac']
    },
    {
      title: "Needs to be on a new page",
      exclude: ['course', 'directions']
    },
    {
      title: "Grouping Issue"
    },
    {
      title: "LaTeX issue",
      exclude: ['video', 'pdf']
    },
    {
      title: "Wrong Task Title",
      categories: ['task']
    },
    {
      title: "Wrong Topic Title",
      categories: ['course', 'task']
    },
    {
      title: "Wrong Video Title",
      categories: ['video']
    },
    {
      title: "JSON/Rich Text Issue - Student Blocking",
      exclude: ['video', 'pdf']
    },
    {
      title: "JSON/Rich Text Issue - Not Student Blocking",
      exclude: ['video', 'pdf']
    },
    {
      title: "Linkout Present",
      categories: ['directions', 'q', 'qc']
    },
    {
      title: "Curriculum Rewrite Needed"
    },
    {
      title: "Other"
    }
  ]

  function getIssueAreas(lesson) {
    var areas = []

    areas.push({name: 'Overall Course', location: 'Course', id: "N/A", category: 'course', preview: lesson.courseTitle})
    areas.push({name: 'Overall Chapter', location: 'Topic/Chapter', id: lesson.chapterId, category: 'course', preview: lesson.chapterTitle})

    areas.push({name: 'Overall Task', location: 'Overall Task', id: lesson.id, category: 'task'})

    if (lesson.hasDirections) areas.push({name: 'Task Directions', location: 'Task Directions', id: lesson.id, category: 'directions'})

    if (lesson.pdfs.length === 1) {
      areas.push({name: 'Task Document', location: 'Task Document | ' + lesson.pdfs[0].title, id: lesson.pdfs[0].id, category: 'pdf'})
    } else if (lesson.pdfs.length > 1) {
      var output = {name: 'Task Documents', location: 'Task Documents', id: null, category: 'pdf'}
      output.subAreas = lesson.pdfs.map((pdf) => {
        return {name: pdf.title, location: 'Document ' + pdf.title, id: pdf.id, category: 'pdf'}
      })
      areas.push(output)
    }

    if (lesson.type === 'video') areas.push({name: 'Video', location: 'Video', id: lesson.id, category: 'video'})

    areas.push(...lesson.questions.map((question) => {
      if (question.type.includes('split_screen') || question.type.includes('group')) {
        return {
          name: `Supplemental ${question.num}`,
          location: `Supplemental/Group ${question.num}`,
          id: question.id,
          category: 'qsup',
          preview: question.preview || null
        }
      }

      var onlyQ = lesson.questions.length === 1
      var qHasACs = question.answers.length > 0

      var output = {
        name: `Question${!onlyQ ? ' ' + question.num : ''}`,
        location: `Q${!onlyQ ? '' + question.num : 'uestion'}${!qHasACs ? ' | Content' : ''}`,
        id: !qHasACs ? question.id : null,
        category: qHasACs ? 'q' : 'qc',
        preview: question.preview || null
      }

      if (qHasACs) {
        output.subAreas = [
          {name: 'Question Content', location: `Q${!onlyQ ? '' + question.num : 'uestion'} | Content`, id: question.id, category: 'qc', preview: question.preview || null}
        ]

        question.answers.forEach((answer, i) => {
          output.subAreas.push({name: `Answer Choice ${i + 1}`, location: `Q${!onlyQ ? '' + question.num : 'uestion'} | AC`, id: answer.id, category: 'ac', preview: answer.preview || null})
        })
      }

      return output
    }))

    return areas
  }

  function createIssueForm() {
    const lesson = currLesson()

    if (!lesson) {
      showTemporaryAlert('Lesson not loaded yet. Try again in a moment.')
      return
    }

    let style
    // Ensure styles and modal shell
    if (!document.getElementById('av-issue-form-styles')) {
      style = document.createElement('style')
      style.id = 'av-issue-form-styles'
      document.head.appendChild(style)
    } else {
      style = document.getElementById('av-issue-form-styles')
    }
    
    style.textContent = `
      .av-issue-overlay { position: fixed; inset: 0; background: var(--chakra-colors-\\$modal-overlay); opacity: 0.6; z-index: 9000; pointer-events: auto; }
      .av-issue-container { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 9001; box-shadow: var(--chakra-shadows-dark-lg); border: 1px solid var(--chakra-colors-\\$subtle-border); background: var(--chakra-colors-\\$bg-01); color: var(--chakra-colors-\\$text-01); font-family: var(--chakra-fonts-body); width: 720px; max-width: calc(100vw - var(--chakra-space-5) * 2); max-height: calc(100vh - var(--chakra-space-5) * 2); overflow: auto; font-size: var(--chakra-fontSizes-md); padding: var(--chakra-space-4); border-radius: var(--chakra-radii-xl); pointer-events: auto; overscroll-behavior: contain; touch-action: pan-y; -webkit-overflow-scrolling: touch; }
      .av-section-title { font-weight: 600; margin: 0 0 var(--chakra-space-2); }
      .av-lesson-title { font-weight: 400; color: var(--chakra-colors-\\$text-03); }
      .av-row { display: flex; flex-direction: column; gap: var(--chakra-space-1-5); margin-top: var(--chakra-space-2-5); }
      .av-row-label, .av-note, .av-note-row { font-size: 13px; color: var(--chakra-colors-\\$text-02); }
      .av-row-label { display: flex; }
      .av-row-label:has(+ [required])::after { content: '*'; color: var(--chakra-colors-\\$error); font-size: 1.5em; font-weight: 600; margin-left: 0.25em; margin-bottom: -0.5em; }
      .av-note-row { display: flex; flex-direction: column; }
      .av-note { display: flex; gap: 0.5em; line-height: 1; margin-top: 0.5em; }
      .av-note::before { content: '*'; color: var(--chakra-colors-\\$error); font-size: 1.5em; font-weight: 600; }
      .av-select { padding: var(--chakra-space-2) var(--chakra-space-2-5); border-radius: var(--chakra-radii-md); border: 1px solid var(--chakra-colors-\\$subtle-border); background: var(--chakra-colors-\\$bg-02); color: var(--chakra-colors-\\$text-01); outline: none; }
      .av-input { padding: var(--chakra-space-2) var(--chakra-space-2-5); border-radius: var(--chakra-radii-md); border: 1px solid var(--chakra-colors-\\$subtle-border); background: var(--chakra-colors-\\$bg-02); color: var(--chakra-colors-\\$text-01); outline: none; }
      .av-area-panel { padding: var(--chakra-space-2); border: 1px solid var(--chakra-colors-\\$subtle-border); border-radius: var(--chakra-radii-lg); background: var(--chakra-colors-\\$bg-02); }
      .av-toggle { display: none; font-size: var(--chakra-fontSizes-sm); padding: var(--chakra-space-1) var(--chakra-space-2); border-radius: var(--chakra-radii-md); border: 1px solid var(--chakra-colors-\\$component-border); background: var(--chakra-colors-\\$bg-02); color: var(--chakra-colors-\\$text-02); cursor: pointer; }
      .av-issue-container:has(.av-caret-btn) .av-toggle { display: initial; }
      .av-section-header { margin: var(--chakra-space-3) 0 var(--chakra-space-1); font-size: 12px; color: var(--chakra-colors-\\$text-02); text-transform: uppercase; letter-spacing: 0.04em; }
      .av-row-head { display: flex; align-items: flex-end; justify-content: space-between; gap: var(--chakra-space-2); }
      .av-section-header:first-of-type { margin-top: 0; }
      .av-list-grid { display: grid; align-items: start; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: var(--chakra-space-2); }
      .av-group { display: flex; flex-direction: column; gap: var(--chakra-space-1-5); border-radius: var(--chakra-radii-lg); background: var(--chakra-colors-\\$bg-03); overflow: hidden; }
      .av-group-header { display: flex; align-items: center; justify-content: space-between; padding: var(--chakra-space-2) var(--chakra-space-2-5); overflow: hidden; }
      .av-group-header--has-subs { cursor: pointer; }
      .av-group-header--has-subs:hover { background: var(--chakra-colors-\\$hover-ui); }
      .av-group-left { display: flex; align-items: center; gap: var(--chakra-space-2); flex: 1 1 auto; min-width: 0; }
      .av-name { flex: 1 1 auto; min-width: 0; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; }
      .av-subwrap { display: none; padding: var(--chakra-space-2) var(--chakra-space-2-5) var(--chakra-space-2-5); gap: var(--chakra-space-1-5); grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); align-items: start; overflow: hidden; border-top: 1px solid var(--chakra-colors-\\$subtle-border); }
      .av-check { display: flex; align-items: center; gap: var(--chakra-space-2); }
      .av-parent-check span { display: none; }
      .av-check input[type="checkbox"] { accent-color: var(--chakra-colors-\\$primary-button); }
      .av-notes { min-height: 80px; resize: vertical; padding: var(--chakra-space-2) var(--chakra-space-2-5); border-radius: var(--chakra-radii-md); border: 1px solid var(--chakra-colors-\\$subtle-border); background: var(--chakra-colors-\\$bg-02); color: var(--chakra-colors-\\$text-01); }
      .av-actions { display: flex; justify-content: space-between; margin-top: var(--chakra-space-3-5); }
      .av-actions button, .av-actions a { transition-property: var(--chakra-transition-property-common); transition-duration: var(--chakra-transition-duration-normal); }
      .av-submit { padding: var(--chakra-space-2) var(--chakra-space-3); border-radius: var(--chakra-radii-md); background: var(--chakra-colors-\\$primary-button); color: var(--chakra-colors-\\$primary-button-text); cursor: pointer; }
      .av-open { margin-left: auto; text-decoration: none; padding: var(--chakra-space-2) var(--chakra-space-3); border-radius: var(--chakra-radii-md); background: var(--chakra-colors-\\$text-01); color: var(--chakra-colors-\\$bg-01); cursor: pointer; }
      .av-open[disabled] { opacity: 0.5; cursor: wait; }
      .av-open[disabled]:hover { background: var(--chakra-colors-\\$text-01); color: var(--chakra-colors-\\$bg-01); }
      .av-open:not([disabled]):hover { background: var(--chakra-colors-\\$hover-primary); color: var(--chakra-colors-\\$primary-button-text); }
      .av-submit:hover { background: var(--chakra-colors-\\$hover-primary); }
      .av-submit[disabled] { opacity: 0.5; cursor: not-allowed; }
      .av-hover-preview { position: fixed; top: 0; left: 0; display: none; pointer-events: none; background: var(--chakra-colors-\\$bg-02); color: var(--chakra-colors-\\$text-01); border: 1px solid var(--chakra-colors-\\$subtle-border); border-radius: var(--chakra-radii-lg); box-shadow: var(--chakra-shadows-dark-lg); padding: var(--chakra-space-2-5); max-width: 480px; max-height: 60vh; overflow: auto; z-index: 9002; font-size: var(--chakra-fontSizes-md); transition: opacity 120ms ease-out; opacity: 0; will-change: left, top, opacity; }
      .av-preview-img { display: block; max-width: 175px; height: auto; border-radius: var(--chakra-radii-md); }
      .av-correct { color: var(--chakra-colors-\\$text-green); }  
      .av-group-header { display: flex; align-items: center; gap: var(--chakra-space-2); }
      .av-caret-btn { margin-left: auto; margin-right: 1px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }
      .av-parent-check { flex-shrink: 0; }
      .av-caret-tri { width: 0; height: 0; border-top: 6.5px solid transparent; border-bottom: 6.5px solid transparent; border-left: 11px solid var(--chakra-colors-\\$text-03); transition: transform 120ms ease; transform-origin: 50% 50%; }
    `

    const overlay = document.createElement('div')
    overlay.className = 'av-issue-overlay'
    // Close only when the overlay itself is clicked (not children)
    overlay.addEventListener('click', (e) => { if (e.target === overlay) hideIssueForm() })
    document.body.appendChild(overlay)
    const container = document.createElement('div')
    container.className = 'av-issue-container'
    // Ensure mouse wheel scroll targets the container even if global listeners try to prevent it
    container.addEventListener('wheel', (e) => {
      // Only handle if content is scrollable
      const canScroll = container.scrollHeight > container.clientHeight
      if (!canScroll) return
      // Apply scroll and prevent the event from being intercepted higher up
      container.scrollTop += e.deltaY
      e.preventDefault()
      e.stopPropagation()
    }, { passive: false })
    // Add a capturing wheel handler as well, in case upstream listeners prevent default in capture phase
    container.addEventListener('wheel', (e) => {
      const canScroll = container.scrollHeight > container.clientHeight
      if (!canScroll) return
      container.scrollTop += e.deltaY
      e.preventDefault()
      e.stopPropagation()
    }, { passive: false, capture: true })
    // If the cursor is over the overlay (outside the container), forward wheel to the container to keep UX consistent
    overlay.addEventListener('wheel', (e) => {
      const canScroll = container.scrollHeight > container.clientHeight
      if (!canScroll) return
      container.scrollTop += e.deltaY
      e.preventDefault()
      e.stopPropagation()
    }, { passive: false })

    const sectionTitle = document.createElement('h4')
    const sectionTitleText = document.createElement('span')
    sectionTitleText.className = 'av-lesson-title'
    sectionTitleText.textContent = lesson.title
    sectionTitle.appendChild(sectionTitleText)
    const sectionTitleBreak = document.createElement('br')
    sectionTitle.appendChild(sectionTitleBreak)
    const sectionTitleText2 = document.createElement('span')
    sectionTitleText2.textContent = 'Report an issue'
    sectionTitle.appendChild(sectionTitleText2)
    sectionTitle.className = 'av-section-title'
    container.appendChild(sectionTitle)

    const areas = lesson.areas || []

    var hasPreviews = areas.some((a) => !!a.preview) || areas.some((a) => a.subAreas?.some((sa) => !!sa.preview))

    function makeRow(labelText) {
      const row = document.createElement('div')
      row.className = 'av-row'
      const label = document.createElement('label')
      label.textContent = labelText
      label.className = 'av-row-label'
      row.appendChild(label)
      return { row, label }
    }

    function filterIssuesByCategories(categories) {
      const cats = Array.from(new Set(categories || []))
      const specific = []
      const global = []
      issues.forEach((issue) => {
        // - It must NOT be excluded by any selected category
        // - If it lists categories, it must include AT LEAST ONE selected category
        const excluded = cats.some((c) => issue.exclude && issue.exclude.includes(c))
        if (excluded) return
        const hasCats = Array.isArray(issue.categories) && issue.categories.length > 0
        if (hasCats) {
          const includesAll = cats.length === 0 ? true : cats.every((c) => issue.categories.includes(c))
          if (!includesAll) return
        }
        const isGlobal = !hasCats
        if (isGlobal) global.push(issue)
        else specific.push(issue)
      })
      return specific.concat(global)
    }

    const { row: areaRow, label: areaLabel } = makeRow('Select one or more areas where the issue is present:')
    const toggleAll = document.createElement('button')
    toggleAll.textContent = 'Expand all'
    toggleAll.className = 'av-toggle'
    const areaHead = document.createElement('div')
    areaHead.className = 'av-row-head'
    areaRow.insertBefore(areaHead, areaRow.firstChild)
    areaHead.appendChild(areaLabel)
    areaHead.appendChild(toggleAll)

    const areaScroll = document.createElement('div')
    areaScroll.className = 'av-area-panel'

    const courseHeader = document.createElement('div')
    courseHeader.textContent = 'General'
    courseHeader.className = 'av-section-header'
    const courseList = document.createElement('div')
    courseList.className = 'av-list-grid'

    const taskHeader = document.createElement('div')
    taskHeader.textContent = 'Task / Directions'
    taskHeader.className = 'av-section-header'
    const taskList = document.createElement('div')
    taskList.className = 'av-list-grid'

    const qHeader = document.createElement('div')
    qHeader.textContent = 'Questions'
    qHeader.className = 'av-section-header'
    const qList = document.createElement('div')
    qList.className = 'av-list-grid'

    const selectedKeys = new Set()
    const selectionMap = new Map()

    function makeCheckbox(label, key, item, indentPx = 0, disabled = false) {
      const wrap = document.createElement('label')
      wrap.className = 'av-check'
      wrap.style.marginLeft = indentPx + 'px'
      const cb = document.createElement('input')
      cb.type = 'checkbox'
      cb.disabled = !!disabled
      cb.addEventListener('change', () => {
        if (cb.checked) {
          selectedKeys.add(key)
          selectionMap.set(key, item)
        } else {
          selectedKeys.delete(key)
          selectionMap.delete(key)
        }
        updateIssueOptions()
      })
      const txt = document.createElement('span')
      txt.textContent = label
      wrap.appendChild(cb)
      wrap.appendChild(txt)
      return wrap
    }

    function isQuestionish(obj) {
      if (!obj) return false
      
      return obj.category.startsWith('q')
    }

    const previewId = 'av-ans-preview'
    let hoverPreview = document.getElementById(previewId)
    let hoverHideTimer = null
    if (!hoverPreview) {
      hoverPreview = document.createElement('div')
      hoverPreview.id = previewId
      hoverPreview.className = 'av-hover-preview'
      hoverPreview.style.display = 'none'
      hoverPreview.style.opacity = '0'
      document.body.appendChild(hoverPreview)
    }

    function findAnswerById(ansId) {
      if (!ansId) return null
      const targetId = String(ansId)
      const qs = Array.isArray(lesson.questions) ? lesson.questions : []
      for (const q of qs) {
        const arr = Array.isArray(q.answers) ? q.answers : []
        for (const a of arr) {
          if (a && String(a.id) === targetId) return a
        }
      }
      return null
    }

    // Global positioner for hover preview
    function positionHoverPreview(e) {
      const offset = 12
      let left = e.clientX + offset
      let top = e.clientY + offset
      hoverPreview.style.left = left + 'px'
      hoverPreview.style.top = top + 'px'
      const pw = hoverPreview.offsetWidth || 0
      const ph = hoverPreview.offsetHeight || 0
      const maxLeft = Math.max(0, window.innerWidth - pw - 8)
      const maxTop = Math.max(0, window.innerHeight - ph - 8)
      if (left > maxLeft) left = Math.max(8, e.clientX - pw - offset)
      if (top > maxTop) top = Math.max(8, e.clientY - ph - offset)
      hoverPreview.style.left = Math.min(maxLeft, Math.max(8, left)) + 'px'
      hoverPreview.style.top = Math.min(maxTop, Math.max(8, top)) + 'px'
    }

    // Attach a generic hover preview to any element with provided HTML content
    function attachHoverPreview(targetEl, html) {
      if (!targetEl || !html) return
      targetEl.addEventListener('mouseenter', () => {
        if (hoverHideTimer) { clearTimeout(hoverHideTimer); hoverHideTimer = null }
        hoverPreview.innerHTML = html
        hoverPreview.style.display = 'block'
        hoverPreview.style.opacity = '0'
        requestAnimationFrame(() => { hoverPreview.style.opacity = '1' })
      })
      // ensure mousemove listener exists once
      if (!document.body.hasAttribute('av-hover-listener')) {
        document.body.setAttribute('av-hover-listener', 'true')
        document.body.addEventListener('mousemove', positionHoverPreview)
      }
      targetEl.addEventListener('mouseleave', () => {
        hoverPreview.style.opacity = '0'
        if (hoverHideTimer) clearTimeout(hoverHideTimer)
        hoverHideTimer = setTimeout(() => {
          hoverPreview.style.display = 'none'
          hoverPreview.innerHTML = ''
        }, 140)
      })
    }

    const groupToggles = []
    const groupMeta = []
    const classified = areas.map((a) => {
      var list
      if (a.category == 'course') {
        if (!courseHeader.parentNode) {
          areaScroll.appendChild(courseHeader)
          areaScroll.appendChild(courseList)
        }
        list = courseList
      } else if (a.category.startsWith('q')) {
        if (!qHeader.parentNode) {
          areaScroll.appendChild(qHeader)
          areaScroll.appendChild(qList)
        }
        list = qList
      } else {
        if (!taskHeader.parentNode) {
          areaScroll.appendChild(taskHeader)
          areaScroll.appendChild(taskList)
        }
        list = taskList
      }
      return { area: a, taskList: list }
    })

    function buildGroup(a, targetList) {
      const group = document.createElement('div')
      group.className = 'av-group'

      // Determine if this area has subareas
      const hasSubs = Array.isArray(a.subAreas) && a.subAreas.length > 0

      // Header with optional caret (left) and checkbox on the right
      const header = document.createElement('div')
      header.className = 'av-group-header' + (hasSubs ? ' av-group-header--has-subs' : '')

      const leftWrap = document.createElement('div')
      leftWrap.className = 'av-group-left'

      const nameEl = document.createElement('div')
      nameEl.className = 'av-name'
      nameEl.textContent = a.name
      leftWrap.appendChild(nameEl)

      let caret = null
      let caretBtn = null
      if (hasSubs) {
        caretBtn = document.createElement('div')
        caretBtn.className = 'av-caret-btn'
        caret = document.createElement('span')
        caret.className = 'av-caret-tri'
        caretBtn.appendChild(caret)
      }

      // Right-side checkbox for selectable parent
      const parentKey = a.name != null ? `area:${a.name}` : null
      const parentItem = { name: a.name, id: a.id, location: a.location, category: a.category }
      let rightCheckbox = null
      if (parentKey) {
        rightCheckbox = makeCheckbox(a.name, parentKey, parentItem, 0, false)
        rightCheckbox.classList.add('av-parent-check')
      }

      header.appendChild(leftWrap)
      if (caretBtn) header.appendChild(caretBtn)
      if (rightCheckbox) header.appendChild(rightCheckbox)
      group.appendChild(header)

      // If there are no subareas, clicking the header/name should toggle the parent checkbox
      if (!hasSubs && rightCheckbox) {
        header.style.cursor = 'pointer'
        header.addEventListener('click', (e) => {
          // Avoid double toggling when clicking directly on the checkbox/label
          if (rightCheckbox.contains(e.target)) return
          const input = rightCheckbox.querySelector('input[type="checkbox"]')
          if (input) input.click()
        })
      }

      // Sub-areas container (grid)
      const subWrap = document.createElement('div')
      subWrap.className = 'av-subwrap'
      subWrap.style.display = hasSubs ? 'grid' : 'none'

      const subRows = []
      if (hasSubs) {
        subWrap.style.display = 'grid'
        a.subAreas.forEach((sa) => {
          const key = `sub:${sa.name}:${sa.id}`
          const item = { name: sa.name, id: sa.id, location: sa.location, category: sa.category }
          const row = makeCheckbox(sa.name, key, item, 0, false)
          subWrap.appendChild(row)
          if (sa.preview) {
            attachHoverPreview(row, sa.preview)
          }
          const ans = findAnswerById(sa.id)
          if (ans && ans.correct === true) {
            row.classList.add('av-correct')
          }
          subRows.push({ el: row, text: sa.name.toLowerCase() })
        })
      }
      group.appendChild(subWrap)

      // Attach preview on parent header if area has preview
      if (a && a.preview) {
        attachHoverPreview(header, a.preview)
      }

      // Toggle behavior
      let expanded = false
      function setExpanded(val) {
        expanded = !!val
        subWrap.style.display = expanded && hasSubs ? 'grid' : 'none'
        if (caret) caret.style.transform = expanded ? 'rotate(90deg)' : 'rotate(0deg)'
      }
      if (hasSubs) {
        header.addEventListener('click', () => setExpanded(!expanded))
        if (caretBtn) {
          caretBtn.addEventListener('click', (e) => { e.stopPropagation(); setExpanded(!expanded) })
        }
      }
      // Start collapsed to reduce height
      setExpanded(false)

      groupToggles.push({ setExpanded, hasSubs })
      groupMeta.push({
        el: group,
        title: (a.name || '').toLowerCase(),
        hasSubs,
        setExpanded,
        subWrap,
        subRows
      })
      targetList.appendChild(group)
    }

    classified.forEach((c) => buildGroup(c.area, c.taskList))

    // Expand/Collapse all control
    let allOpen = false
    toggleAll.addEventListener('click', () => {
      allOpen = !allOpen
      groupToggles.forEach((g) => g.setExpanded(allOpen && g.hasSubs))
      toggleAll.textContent = allOpen ? 'Collapse all' : 'Expand all'
    })

    areaRow.appendChild(areaScroll)
    container.appendChild(areaRow)

    if (hasPreviews) {
      const noteRow = document.createElement('div')
      noteRow.className = 'av-note-row'
      areaRow.appendChild(noteRow)

      const noteEl = document.createElement('div')
      noteEl.className = 'av-note'
      noteEl.textContent = 'Hover any area in "Questions" to see a rough preview of the content.'
      noteRow.appendChild(noteEl)

      const noteEl2 = document.createElement('div')
      noteEl2.className = 'av-note'
      noteEl2.textContent = 'Answers will be in a random order unless they are visible on the screen before opening this menu.'
      noteRow.appendChild(noteEl2)

      const noteEl3 = document.createElement('div')
      noteEl3.className = 'av-note'
      noteEl3.textContent = 'Correct answers will be highlighted in green.'
      noteRow.appendChild(noteEl3)
    }

    // Issue select (hidden until at least one area/sub-area selected)
    const { row: issueRow } = makeRow('Issue')
    const issueSelect = document.createElement('select')
    issueSelect.className = 'av-select'
    const issuePh = document.createElement('option')
    issuePh.value = ''
    issuePh.textContent = 'Select an issue...'
    issuePh.disabled = true
    issuePh.selected = true
    issueSelect.appendChild(issuePh)
    issueRow.appendChild(issueSelect)
    issueRow.style.display = 'none'
    container.appendChild(issueRow)

    // Helpful link (hidden until issue chosen)
    const { row: linkRow } = makeRow('Helpful link (optional)')
    const helpfulLinkInput = document.createElement('input')
    helpfulLinkInput.type = 'url'
    helpfulLinkInput.className = 'av-input'
    helpfulLinkInput.placeholder = 'Corrected media, external resource, etc.'
    linkRow.appendChild(helpfulLinkInput)
    linkRow.style.display = 'none'
    container.appendChild(linkRow)

    // Notes (hidden until issue chosen)
    const { row: notesRow } = makeRow('Actionable feedback (required)')
    const notes = document.createElement('textarea')
    notes.required = true
    notes.className = 'av-notes'
    notes.placeholder = 'Additional information, examples, or reproduction steps.'
    notesRow.appendChild(notes)
    notesRow.style.display = 'none'
    const alertRow = document.createElement('div')
    alertRow.className = 'av-note-row'
    notesRow.appendChild(alertRow)

    const alertEl = document.createElement('div')
    alertEl.className = 'av-note'
    alertEl.textContent = 'Make sure to only include ONE issue per submission. It\'s okay if the one issue has multiple areas it affects, but if there are multiple issues with those areas, separate the issues into different submissions.'
    alertRow.appendChild(alertEl)
    container.appendChild(notesRow)

    // Submit (hidden until issue chosen)
    const actions = document.createElement('div')
    actions.className = 'av-actions'
    const submitBtn = document.createElement('button')
    submitBtn.textContent = 'Submit Issue'
    submitBtn.className = 'av-submit'
    submitBtn.disabled = true
    submitBtn.style.display = 'none'
    const openBtn = document.createElement('a')
    openBtn.textContent = 'Loading Issue Sheet...'
    openBtn.className = 'av-open'
    openBtn.href = '#'
    openBtn.setAttribute('disabled', true)
    actions.appendChild(submitBtn)
    actions.appendChild(openBtn)
    container.appendChild(actions)

    let lastIssuesList = []
    function getSelectedItems() {
      return Array.from(selectedKeys).map((k) => selectionMap.get(k)).filter(Boolean)
    }

    function updateIssueOptions() {

      const selected = getSelectedItems()
      const categories = Array.from(new Set(selected.map((s) => s.category)))
      if (selected.length === 0) {
        lastIssuesList = []
        // Hide downstream sections when nothing is selected
        issueRow.style.display = 'none'
        linkRow.style.display = 'none'
        notesRow.style.display = 'none'
        submitBtn.style.display = 'none'
        submitBtn.disabled = true
        return
      }
      const list = categories.length ? filterIssuesByCategories(categories) : []
      console.log(list)
      if (JSON.stringify(lastIssuesList) == JSON.stringify(list)) return

      lastIssuesList = list

      const currVal = issueSelect.value
      const selectedOption = issueSelect.querySelector(`option[value="${currVal}"]`).textContent || ''

      issueSelect.innerHTML = ''
      const ph = document.createElement('option')
      ph.value = ''
      ph.textContent = 'Select an issue...'
      ph.disabled = true
      ph.selected = true
      issueSelect.appendChild(ph)

      var alreadySelected = false

      list.forEach((it, idx) => {
        const opt = document.createElement('option')
        opt.value = String(idx)
        opt.textContent = it.title
        if (selectedOption && selectedOption === it.title) {
          opt.selected = true
          alreadySelected = true
        }
        issueSelect.appendChild(opt)
      })

      issueRow.style.display = 'flex'
      issueSelect.disabled = list.length === 0
      
      if (!alreadySelected) {
        linkRow.style.display = 'none'
        notesRow.style.display = 'none'
        submitBtn.style.display = 'none'
        submitBtn.disabled = true
      }
    }

    // Show issue choices when something is selected
    // This happens via checkbox change handlers -> updateIssueOptions()

    function updateSubmitDisabled() {
      submitBtn.disabled = (notes.value.trim().length === 0)
    }
    issueSelect.addEventListener('change', () => {
      if (!issueSelect.value) return
      linkRow.style.display = 'flex'
      notesRow.style.display = 'flex'
      submitBtn.style.display = 'flex'
    })

    // Keep submit disabled until notes provided when required
    notes.addEventListener('input', () => {
      updateSubmitDisabled()
    })

    submitBtn.addEventListener('click', (ev) => {
      ev.preventDefault()
      const issueIdx = issueSelect.value ? Number(issueSelect.value) : -1
      const issueItem = issueIdx >= 0 ? lastIssuesList[issueIdx] : null
      const selections = getSelectedItems()

      if (!selections.length || !issueItem) {
        showTemporaryAlert('Please complete all required selections')
        return
      }

      // Validate required notes (always required)
      if (notes.value.trim().length === 0) {
        showTemporaryAlert('Please add notes before submitting')
        return
      }

      const payload = {
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        courseId: lesson.courseId,
        courseTitle: lesson.courseTitle,
        courseSubject: lesson.courseSubject,
        chapterId: lesson.chapterId,
        chapterTitle: lesson.chapterTitle,
        areas: selections.map((s) => ({ name: s.name, id: s.id, location: s.location, category: s.category })),
        issue: issueItem.title,
        helpfulLink: helpfulLinkInput.value.trim(),
        notes: notes.value.trim()
      }

      handleIssueSubmit(payload)
    })

    document.body.appendChild(container)
  }

  function handleIssueSubmit(payload) {
    const params = new URLSearchParams()
    params.set('lessonId', payload.lessonId || '')
    params.set('lessonTitle', payload.lessonTitle || '')
    params.set('courseId', payload.courseId || '')
    params.set('courseTitle', payload.courseTitle || '')
    params.set('courseSubject', payload.courseSubject || '')
    params.set('chapterId', payload.chapterId || '')
    params.set('chapterTitle', payload.chapterTitle || '')
    try {
      params.set('areas', JSON.stringify(payload.areas || []))
    } catch (e) {
      params.set('areas', '[]')
    }
    params.set('issue', payload.issue || '')
    params.set('helpfulLink', payload.helpfulLink || '')
    params.set('notes', payload.notes || '')

    const url = `${WEB_APP_URL}?${params.toString()}`

    // Remove form immediately and show submitting indicator
    removeIssueForm()
    showTemporaryAlert('Submitting issue...')

    // Submit via GET; show success or retry prompt based on network outcome
    try {
      fetch(url)
        .then(() => {
          showTemporaryAlert('Issue submitted')
        })
        .catch((err) => {
          console.warn('Issue submission failed:', err)
          showTemporaryAlert('Submission failed. Please try again')
        })
    } catch (err) {
      console.warn('Issue submission exception:', err)
      showTemporaryAlert('Submission failed. Please try again')
    }
  }

  function enableOpenButton() {
    const lesson = currLesson()
    const openBtn = document.querySelector('.av-open')
    if (!lesson || !openBtn || !openBtn.hasAttribute('disabled')) return
    openBtn.textContent = 'Loading Issue Sheet...'

    // check sessionStorage before making request
    if (sessionStorage.getItem(`${lesson.courseId}-URL`)) {
      openBtn.href = sessionStorage.getItem(`${lesson.courseId}-URL`)
      openBtn.target = '_blank'
      openBtn.textContent = 'Open Issue Sheet'
      openBtn.removeAttribute('disabled')
      return
    }

    const params = new URLSearchParams()

    params.set('getSheet', true)
    params.set('courseId', lesson.courseId || '')
    params.set('courseTitle', lesson.courseTitle || '')
    params.set('courseSubject', lesson.courseSubject || '')

    const url = `${WEB_APP_URL}?${params.toString()}`

    try {
      fetch(url)
        .then((res) => { return res.json() })
        .then((data) => {
          console.log(data)
          openBtn.href = data.data
          openBtn.target = '_blank'
          openBtn.textContent = 'Open Issue Sheet'
          openBtn.removeAttribute('disabled')
          sessionStorage.setItem(`${lesson.courseId}-URL`, data.data)
        })
        .catch((err) => {
          console.warn('Issue Sheet Request Failed:', err)
          openBtn.textContent = 'Error :('
        })
    } catch (err) {
      console.warn('Issue Sheet Request Exception:', err)
      openBtn.textContent = 'Error :('
    }
  }

  function disableOpenButton() {
    const openBtn = document.querySelector('.av-open')
    if (!openBtn) return
    openBtn.href = '#'
    openBtn.target = ''
    openBtn.setAttribute('disabled', true)
  }

  function removeIssueForm() {
    disableOpenButton()
    resumeChakraModals()
    document.querySelector('.av-issue-container')?.remove()
    document.querySelector('.av-issue-overlay')?.remove()
  }

  function showIssueForm() {
    suspendChakraModals()
    if (document.querySelector('.av-issue-container')) {
      document.querySelector('.av-issue-container')?.style?.setProperty('display', 'initial')
      document.querySelector('.av-issue-overlay')?.style?.setProperty('display', 'initial')
    } else {
      createIssueForm()
      enableOpenButton()
    }
  }

  function hideIssueForm() {
    resumeChakraModals()
    document.querySelector('.av-issue-container')?.style?.setProperty('display', 'none')
    document.querySelector('.av-issue-overlay')?.style?.setProperty('display', 'none')
  }

  function suspendChakraModals() {
    // 1) Disable focus trap
    document.querySelectorAll('[data-focus-lock-disabled="false"]')
      .forEach(n => n.setAttribute('data-focus-lock-disabled', 'true'));
  
    // 2) Hide from a11y
    document.querySelectorAll('.chakra-modal__content')
      .forEach(n => n.setAttribute('aria-hidden', 'true'));
  
    // 3) Stop intercepting input without removing
    document.querySelectorAll('.chakra-portal')
      .forEach(p => {
        p.setAttribute('data-av-suspended', '1');
        p.style.visibility = 'hidden';
        p.style.pointerEvents = 'none';
      });
  
    // 4) In case body scroll was locked
    document.body.style.overflow = '';
  }
  
  function resumeChakraModals() {
    // Restore focus trap (optional – only if you know they were active)
    document.querySelectorAll('[data-focus-lock-disabled="true"]')
      .forEach(n => n.setAttribute('data-focus-lock-disabled', 'false'));
  
    // Restore a11y visibility
    document.querySelectorAll('.chakra-modal__content[aria-hidden="true"]')
      .forEach(n => n.setAttribute('aria-hidden', 'false'));
  
    // Restore styles on previously suspended portals
    document.querySelectorAll('.chakra-portal[data-av-suspended="1"]')
      .forEach(p => {
        p.style.removeProperty('visibility');
        p.style.removeProperty('pointer-events');
        p.removeAttribute('data-av-suspended');
      });
  }

  window.av_createIssueForm = window.av_createIssueForm || createIssueForm
  window.av_lessonData = window.av_lessonData || {}
	window.av_lastPathname = window.av_lastPathname || ''

  await checkURLChange()
  showIssueForm()

  if (!window.av_interval) {
    window.av_interval = setInterval(() => {
      checkURLChange()
    }, 100)
  } else {
    setTimeout(() => {
      const script = document.querySelector('script[src*="devReview.js"]:last-of-type')
      script.parentNode.removeChild(script)
    }, 100)
  }
})()