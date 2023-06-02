import Section from './Section'
import skillsData from '../data/skills'
import { useEffect } from 'react'

export default function Skills() {
	useEffect(() => {
		const skillImgEls = document.querySelectorAll('.skill-images')

		function rotateEls(event) {
			const x = event.clientX
			const y = event.clientY + window.scrollY
			skillImgEls.forEach((el, i) => {
				const rect = el.getBoundingClientRect()
				const elX = rect.left + rect.width / 2
				const elY = rect.top + window.scrollY + rect.height / 2
				const xDiff = x - elX
				const yDiff = y - elY
				const xPercent = xDiff / 400
				const yPercent = yDiff / 400
				const xDeg = xPercent * 20
				const yDeg = -yPercent * 15
				el.style.setProperty('--rotateX', `clamp(-35deg, ${yDeg}deg, 35deg)`)
				el.style.setProperty('--rotateY', `clamp(-35deg, ${xDeg}deg, 35deg)`)
			})
		}

		document.addEventListener('mousemove', (event) => {
			rotateEls(event)
		})

		return () => {
			document.removeEventListener('mousemove', (event) => {
				rotateEls(event)
			})
		}
	}, [])

	let skillsEls = []
	for (let i = skillsData.highestLevel; i > 0; i--) {
		if (skillsData.skills.filter((skill) => skill.level === i).length > 0) {
			skillsEls.push(
				<div className='skill-group-wrapper' key={skillsData.highestLevel + 1 - i}>
					<h2 className='skill-group-title'>{skillsData.levelTitles[i - 1]}</h2>
					<div className='skill-group'>
						{skillsData.skills
							.filter((skill) => skill.level === i)
							.map((skill, i) => {
								return (
									<a
										key={i}
										href={skill.link || null}
										target='_blank'
										className={`skill ${skill.link && 'show-tooltip'}`}
										tooltip-text={`Learn more about ${skill.name}`}
									>
										<div className='skill-images unselectable'>
											<img className='skill-perspective' src={`/images/skills/${skill.name.toLowerCase()}.svg`} alt={`${skill.name} logo`} />
											<img className='skill-perspective desktop' src={`/images/skills/${skill.name.toLowerCase()}.svg`} />
										</div>
										<div className='skill-name'>{skill.name}</div>
									</a>
								)
							})}
					</div>
				</div>
			)
		}
	}

	return <Section title='Skills'>{skillsEls}</Section>
}
