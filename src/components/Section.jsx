import { useEffect } from 'react'

export default function Section(props) {
	const sectionId = props.id ? props.id : props.title.toLowerCase().replace(' ', '-')

	useEffect(() => {
		if (props.header !== false) {
			const sectionHeader = document.getElementById(`${sectionId}-header`)
			sectionHeader.parentElement.style.setProperty('--header-offset', '-' + sectionHeader.clientHeight + 'px')
			sectionHeader.parentElement.style.setProperty('--header-height', sectionHeader.clientHeight + 'px')
		}
	}, [])

	return (
		<div className='section-wrapper' id={`${sectionId}`}>
			<div className='section scroll-percent' id={`${sectionId}-section`}>
				{props.header !== false ? (
					<div className='section-header' id={`${sectionId}-header`}>
						{props.headerLink ? (
							<a className='section-link' href={props.headerLink}>
								<h2 className='section-title unselectable' id={`${sectionId}-title`}>
									{props.title}
								</h2>
							</a>
						) : (
							<h2 className='section-title unselectable' id={`${sectionId}-title`}>
								{props.title ? props.title : `${sectionId[0].toUpperCase()}${sectionId.slice(1)}`}
							</h2>
						)}

						{props.headerRight && (
							<div className='section-header-right' id={`${sectionId}-header-right`}>
								{props.headerRight}
							</div>
						)}
					</div>
				) : (
					<></>
				)}
				<div className='section-content' id={`${sectionId}-content`}>
					{props.children}
				</div>
			</div>
		</div>
	)
}
