import { useEffect } from 'react'
import Section from './Section'
import AVPortrait from '../assets/images/AlanValerio.jpg'
import BounceText from './BounceText'
import githubLogo from '../assets/images/github-logo.svg'
import linkedinLogo from '../assets/images/linkedin-logo.svg'
import emailLogo from '../assets/images/email-logo.svg'

export default function Intro() {
	useEffect(() => {
		// Intro animation
		const introEl = document.querySelector('#intro')
		const introElProps = introEl.getBoundingClientRect()
		const nameTitleEl = document.querySelector('.name-title')
		if (introElProps.top !== 0) {
			document.querySelector('.intro-animation').style.display = 'none'
			nameTitleEl.style.opacity = 1
		} else {
			setTimeout(() => {
				nameTitleEl.style.opacity = 1
				const introIntroTextEl = document.querySelector('.intro-animation-text')
				const introTextProps = introIntroTextEl.getBoundingClientRect()
				const titleElProps = nameTitleEl.getBoundingClientRect()

				const introScale = titleElProps.width / introTextProps.width
				let introTextTop = (introTextProps.height + introTextProps.top - titleElProps.top - titleElProps.height / 2) * -1
				let introTextLeft = (introTextProps.width + introTextProps.left - titleElProps.left - titleElProps.width / 2) * -1

				introIntroTextEl.style = `transform: translateX(${introTextLeft}px) translateY(${introTextTop}px) scale(${introScale})`
			}, 1500)
		}

		// Modified perspective tilt effect from https://css-tricks.com/animate-a-container-on-mouse-over-using-perspective-and-transform/
		var counter = 0
		var updateRate = 5
		var isTimeToUpdate = () => counter++ % updateRate === 0

		var container = document.getElementById('perspective-wrap')
		var inner = document.getElementById('perspective')

		function init() {
			let containerProps = container.getBoundingClientRect()
			container.setAttribute('_x', containerProps.left + Math.floor(containerProps.width / 2))
			container.setAttribute('_y', containerProps.top + Math.floor(containerProps.height / 2))
			inner.setAttribute('_x', containerProps.left + Math.floor(containerProps.width / 2))
			inner.setAttribute('_y', containerProps.top + Math.floor(containerProps.height / 2))
		}

		var updateTransformStyle = function (x, y) {
			var style = 'rotateX(' + x + 'deg) rotateY(' + y + 'deg)'
			inner.style.transform = style
			inner.style.webkitTransform = style
			inner.style.mozTransform = style
			inner.style.msTransform = style
			inner.style.oTransform = style
		}

		var update = function (event) {
			init()
			var e = event || window.event
			updateTransformStyle(
				(((e.clientY - e.target.getAttribute('_y')) * -1) / inner.offsetHeight / 2).toFixed(2),
				((e.clientX - e.target.getAttribute('_x')) / inner.offsetWidth / 2).toFixed(2)
			)
		}

		init()

		// Intro image scale effect
		const introImgEl = document.querySelector('.intro-img')
		function scaleOnClick() {
			introImgEl.style = 'transform: scale(1.1); transition: transform 100ms ease-out; cursor: grabbing'
			setTimeout(() => {
				introImgEl.style = 'transform: scale(1); transition: transform 300ms ease-in'
			}, 100)
		}

		introImgEl.addEventListener('click', scaleOnClick)
		container.addEventListener('mouseenter', (event) => update(event))
		container.addEventListener('mouseleave', () => (inner.style = ''))
		container.addEventListener('mousemove', (event) => {
			if (isTimeToUpdate()) {
				update(event)
			}
		})
		window.addEventListener('resize', init)
		return () => {
			introImgEl.removeEventListener('click', scaleOnClick)
			container.removeEventListener('mouseenter', (event) => update(event))
			container.removeEventListener('mouseleave', () => (inner.style = ''))
			container.removeEventListener('mousemove', (event) => {
				if (isTimeToUpdate()) {
					update(event)
				}
			})
			window.removeEventListener('resize', init)
		}
	}, [])

	const introAnimationEl = (
		<div className='intro-animation unselectable'>
			<div className='intro-animation-back'></div>
			<h3 className='intro-animation-text bold purple'>Alan Valerio</h3>
			<div className='intro-animation-logo'></div>
		</div>
	)

	const desktopBubblesEls = (
		<>
			<div className='intro-bubble desktop' style={{ width: '250px' }}></div>
			<div className='intro-bubble desktop' style={{ width: '210px', left: '100%', top: '200px' }}></div>
			<div className='intro-bubble desktop' style={{ width: '195px', left: '100px', top: '100%' }}></div>
		</>
	)

	return (
		<Section header={false} id='intro'>
			{introAnimationEl}
			<div className='intro-bubble mobile' style={{ width: '150px', left: '50px', top: '100%' }}></div>
			<div className='intro-bubble mobile' style={{ width: '200px', top: '120px', left: '10%' }}></div>
			<div className='intro-bubble mobile' style={{ width: '175px', left: '80%', top: '80%' }}></div>
			<div className='intro-img-wrapper unselectable'>
				<div className='intro-img' id='perspective-wrap'>
					<img src={AVPortrait} alt='A portrait image of Alan Valerio looking to the side' id='perspective' />
				</div>
				<a className='social-bubble github-bubble show-tooltip' tooltip-text='Visit my Github profile' href='https://github.com/valerio-alan' target='_blank'>
					<img src={githubLogo} alt='Github logo' />
				</a>
				<a
					className='social-bubble linkedin-bubble show-tooltip'
					tooltip-text='Visit my LinkedIn profile'
					href='https://www.linkedin.com/in/alan-valerio/'
					target='_blank'
				>
					<img src={linkedinLogo} alt='Linkedin logo' />
				</a>
				<a className='social-bubble email-bubble show-tooltip' tooltip-text='Get in touch :)' href='mailto:hello@alanvalerio.com?subject=%F0%9F%91%8B' target='_blank'>
					<img src={emailLogo} alt='Email icon' />
				</a>
			</div>
			<div className='intro-text'>
				{desktopBubblesEls}
				<h3>
					Hello! My name is <BounceText classes='bold purple name-title'>Alan Valerio</BounceText>.
				</h3>
				<p>
					I’m a <BounceText classes='bold purple'>self-taught web developer</BounceText> with a focus on <BounceText classes='bold purple'>front-end</BounceText> and an
					eye for <BounceText classes='bold purple'>design</BounceText>.
				</p>
				<p>
					I’ve had the honor of working with{' '}
					<a className='intro-link' href='#portfolio'>
						many clients
					</a>
					, and have gained further experience through my own personal projects.
				</p>
				<div className='unselectable intro-btns desktop'>
					<a className='intro-btn show-tooltip' tooltip-text='Come see what I can do!' href='#portfolio'>
						View my Projects
					</a>
				</div>
			</div>
			<div className='intro-btns mobile'>
				<a className='intro-btn unselectable' href='#portfolio'>
					View my Projects
				</a>
			</div>
		</Section>
	)
}
