import { useEffect } from 'react'

export default function BounceText(props) {
	const bounceId = Math.floor(Math.random() * 999999)
	const bounceTextId = props.children.replace(' ', '-').toLowerCase() + '-bounce-text' + bounceId
	const bounceCharId = props.children.replace(' ', '-').toLowerCase() + '-bounce-char' + bounceId

	useEffect(() => {
		const bounceText = document.getElementsByClassName(bounceTextId)[0]
		const bounceCharEls = [...document.getElementsByClassName(bounceCharId)]
		const fontSize = window.getComputedStyle(bounceText).getPropertyValue('font-size').replace('px', '')
		const charRadius = 2

		const clickChar = (event) => (event.target.style.cursor = 'grabbing')

		function hoverChar(event) {
			let char = event.target
			let charNum = [...bounceText.children].indexOf(char)

			char.style = `transition: bottom 100ms ease-out; bottom: ${fontSize / 2}px`
			char.setAttribute('chartype', 'primary')

			for (let i = 1; i <= charRadius; i++) {
				if (bounceText.children[charNum - i]) {
					bounceText.children[charNum - i].style = `transition: bottom 100ms ease-out; bottom: ${fontSize / (3 * i)}px`
					bounceText.children[charNum - i].setAttribute('chartype', 'secondary')
				}
				if (bounceText.children[charNum + i]) {
					bounceText.children[charNum + i].style = `transition: bottom 100ms ease-out; bottom: ${fontSize / (3 * i)}px`
					bounceText.children[charNum + i].setAttribute('chartype', 'secondary')
				}
			}

			setTimeout(() => {
				if (char.getAttribute('chartype') == 'primary') {
					leaveChar(event)
				}
			}, 500)
		}

		function leaveChar(event) {
			let char = event.target
			let charNum = [...bounceText.children].indexOf(char)
			let charList = [char]

			for (let i = 1; i <= charRadius; i++) {
				if (bounceText.children[charNum - i]) {
					charList.push(bounceText.children[charNum - i])
				}
				if (bounceText.children[charNum + i]) {
					charList.push(bounceText.children[charNum + i])
				}
			}

			charList.forEach((el) => {
				el.setAttribute('chartype', '')
				el.style = 'transition: bottom 500ms ease-in; bottom: 0'
			})
		}

		function leaveWord(event) {
			;[...event.target.children].forEach((el) => {
				el.setAttribute('chartype', '')
				el.style = 'transition: bottom 500ms ease-in'
			})
		}

		bounceText.addEventListener('mouseleave', (event) => {
			leaveWord(event)
		})
		bounceCharEls.forEach((el) => {
			el.addEventListener('mouseenter', (event) => {
				hoverChar(event)
			})
			el.addEventListener('click', (event) => {
				hoverChar(event)
				clickChar(event)
			})
			el.addEventListener('mouseleave', (event) => {
				leaveChar(event)
			})
		})
		return () => {
			bounceText.removeEventListener('mouseleave', (event) => {
				leaveWord(event)
			})
			bounceCharEls.forEach((el) => {
				el.removeEventListener('mouseenter', (event) => {
					hoverChar(event)
				})
				el.removeEventListener('click', (event) => {
					hoverChar(event)
					clickChar(event)
				})
				el.removeEventListener('mouseleave', (event) => {
					leaveChar(event)
				})
			})
		}
	}, [])

	let chars = [...props.children].map((char, i) => (
		<span key={i} className={`bounce-char ${bounceCharId}`} charnum={i}>
			{char}
		</span>
	))
	return (
		<span className={props.classes ? props.classes + ` bounce-text ${bounceTextId}` : `bounce-text ${bounceTextId}`} id={props.id ? props.id : ''}>
			{chars}
		</span>
	)
}
