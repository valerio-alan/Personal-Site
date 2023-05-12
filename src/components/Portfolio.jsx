import projectsData from '../data/projects'
import Section from './Section'
import Project from './Project'

export default function Portfolio() {
	const projectEls = projectsData.data.map((project, i) => <Project key={i} data={project} />).reverse()

	return (
		<Section id='portfolio' title='Projects'>
			<div className='projects'>{projectEls}</div>
		</Section>
	)
}
