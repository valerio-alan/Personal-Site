import projectsData from '../data/projects'
import githubLogo from '../assets/images/github-logo.svg'
import openLink from '../assets/images/open-link.svg'

export default function Project(props) {
	var projectLink = props.data.links.production || props.data.links.demo || props.data.links.github || ''

	return (
		<div
			className='project'
			style={{
				['--project-bg-color']: props.data.color ? props.data.color : 'var(--accent-back)',
				['--project-text-color']: 'var(--off-white)',
			}}
		>
			<a className='project-top' href={projectLink != '' ? projectLink : 'javascript:void(0);'} target={projectLink == '/' || projectLink == '' ? '' : '_blank'} rel='noopener'>
				<img className='project-image unselectable' src={`../images/projects/${props.data.image}`} alt={props.data.imageAlt} />
				<h3 className='project-title'>{props.data.title}</h3>
        {props.data.label ? <div className='project-tag project-label unselectable' style={{ ['--tag-color']: props.data.color }}>{props.data.label}</div> : <></>}
			</a>
			<div className='project-tags'>
				{props.data.tags.map((tag, i) =>
					projectsData.tags[tag].link ? (
						<a
							key={i}
							className='project-tag unselectable show-tooltip'
							tooltip-text={`Learn more about ${projectsData.tags[tag].name}`}
							href={projectsData.tags[tag].link}
							target='_blank'
							rel='noopener'
							style={{ ['--tag-color']: projectsData.tags[tag].color }}
						>
							{projectsData.tags[tag].name}
						</a>
					) : (
						<div key={i} className='project-tag unselectable' style={{ ['--tag-color']: projectsData.tags[tag].color }}>
							{projectsData.tags[tag].name}
						</div>
					)
				)}
			</div>
			<a href={projectLink != '' ? projectLink : 'javascript:void(0);'} target={projectLink == '/' || projectLink == '' ? '' : '_blank'} rel='noopener'>
				<p className='project-description'>{props.data.description}</p>
			</a>
			<div className='project-links unselectable'>
				{props.data.links.github && (
					<a className='project-link show-tooltip' tooltip-text='View the source code' href={props.data.links.github} target='_blank' rel='noopener'>
						<img className='project-link-icon' src={githubLogo} alt='Github logo' />
					</a>
				)}
				{props.data.links.demo && (
					<a className='project-link show-tooltip' tooltip-text='Try the demo' href={props.data.links.demo} target='_blank' rel='noopener'>
						<img className='project-link-icon' src={openLink} alt='Open link icon' />
					</a>
				)}
				{props.data.links.production && (
					<a
						className='project-link show-tooltip'
						tooltip-text='View the project'
						href={props.data.links.production}
						target={props.data.links.production == '/' ? '' : '_blank'}
						rel='noopener'
					>
						<img className='project-link-icon' src={openLink} alt='Open link icon' />
					</a>
				)}
			</div>
		</div>
	)
}
