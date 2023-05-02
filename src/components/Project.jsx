import projectsData from "../data/projects"
import githubLogo from "../assets/images/github-logo.svg"
import openLink from "../assets/images/open-link.svg"

export default function Project(props) {
    return (
        <div className="project" style={{['--project-bg-color']: props.data.colors.backgroundColor, ['--project-text-color']: props.data.colors.textColor}}>
            <a href={props.data.links.production} target="_blank">
                <img className="project-image" src={`../images/projects/${props.data.image}`} alt={props.data.imageAlt}/>
                <h3 className="project-title">{props.data.title}</h3>
            </a>
            <div className="project-tags">
                {props.data.tags.map((tag, i) => (projectsData.tags[tag].link ?
                        <a key={i} className="project-tag unselectable" href={projectsData.tags[tag].link} target="_blank" style={{['--tag-color']: projectsData.tags[tag].color}}>{projectsData.tags[tag].name}</a> :
                        <div key={i} className="project-tag unselectable" style={{['--tag-color']: projectsData.tags[tag].color}}>{projectsData.tags[tag].name}</div>
                    )
                )}
            </div>
            <a href={props.data.links.production} target="_blank">
                <p className="project-description">{props.data.description}</p>
            </a>
            <div className="project-links">
                {props.data.links.github && <a className="project-link" href={props.data.links.github} target="_blank"><img className="project-link-icon" src={githubLogo} alt="Github logo"/></a>}
                {props.data.links.production && <a className="project-link" href={props.data.links.production} target="_blank"><img className="project-link-icon" src={openLink} alt="Open link icon"/></a>}
            </div>
        </div>
    )
}