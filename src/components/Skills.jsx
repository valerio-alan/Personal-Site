import Section from './Section'
import skillsData from '../data/skills'

export default function Skills() {
	let skillsEls = []
	for (let i = skillsData.highestLevel; i > 0; i--) {
		if (skillsData.skills.filter((skill) => skill.level === i).length > 0) {
			skillsEls.push(
				<div className='skill-group-wrapper unselectable' key={skillsData.highestLevel + 1 - i}>
					<h2 className='skill-group-title'>{skillsData.levelTitles[i - 1]}</h2>
					<div className='skill-group'>
						{skillsData.skills
							.filter((skill) => skill.level === i)
							.map((skill, i) => {
								return (
									<a
										key={i}
										className={`skill ${skill.link && 'show-tooltip'} unselectable`}
										tooltip-text={`Learn more about ${skill.name}`}
										href={skill.link || null}
										target='_blank'
										skillname={skill.name}
									>
										<img className='unselectable' src={`/images/skills/${skill.name.toLowerCase()}.svg`} alt={`${skill.name} logo`} />
										<img className='unselectable' src={`/images/skills/${skill.name.toLowerCase()}.svg`} />
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
