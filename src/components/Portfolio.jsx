import projectsData from "../data/projects"
import githubLogo from "../assets/github-logo.svg"
import openLink from "../assets/open-link.svg"

export default function Portfolio() {
    const projectEls = projectsData.data.map(project => (
        <div key={project.id} className="project" style={{['--project-bg-color']: project.colors.backgroundColor, ['--project-text-color']: project.colors.textColor}}>
            <a href={project.links.production} target="_blank">
                <img className="project-image" src={`../images/projects/${project.image}`} alt={project.imageAlt}/>
                <h3 className="project-title">{project.title}</h3>
            </a>
                <div className="project-tags">
                    {project.tags.map((tag, i) => (projectsData.tags[tag].link ?
                            <a key={i} className="project-tag unselectable" href={projectsData.tags[tag].link} target="_blank" style={{['--tag-color']: projectsData.tags[tag].color}}>{projectsData.tags[tag].name}</a> :
                            <div key={i} className="project-tag unselectable" style={{['--tag-color']: projectsData.tags[tag].color}}>{projectsData.tags[tag].name}</div>
                        )
                    )}
                </div>
                <p className="project-description">{project.description}</p>
                <div className="project-links">
                    {project.links.github && <a className="project-link" href={project.links.github} target="_blank"><img className="project-link-icon" src={githubLogo} alt="Github logo"/></a>}
                    {project.links.production && <a className="project-link" href={project.links.production} target="_blank"><img className="project-link-icon" src={openLink} alt="Open link icon"/></a>}
                </div>
        </div>
    ))

    return (
        <div className="section-wrapper" id="portfolio-wrapper">
            <div className="section" id="portfolio-section">
                <div className="projects">
                    {projectEls}
                </div>
            </div>
        </div>
    )
}