import projects from "../data/projects"

export default function Portfolio() {
    const projectEls = projects.data.map(project => (
        <div className="project">
            <img className="project-image" src={`../assets/images/projects/${projects.image}`} alt={project.imageAlt}/>
        </div>
    ))

    return (
        <div className="section-wrapper" id="portfolio-wrapper">
            <div className="section" id="portfolio-section">
                <div className="projects">
                    <div className="project" style={{['--project-bg-color']: '#313239', ['--project-text-color']: '#E6E1DA'}}>
                        <a href="https://franjaliquors.com" target="_blank">
                            <img className="project-image" src='../images/projects/franja-liquors.png'/>
                            <h3>Franja Liquors</h3>
                            <p>In addition to designing and developing this website for a liquor store in Ridgewood, NY. This project included creating an iOS shortcut that allows the business owner to update the store\'s hours and site banner from his iPhone.</p>
                        </a>
                        <div className="project-links"></div>
                        <div className="project-tags"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}