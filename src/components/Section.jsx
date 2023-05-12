import { useEffect } from "react"

export default function Section(props) {
    useEffect(() => {
        if (props.header !== false) {
            const sectionHeader = document.getElementById(`${props.id ? props.id : props.title.toLowerCase().replace(' ', '-')}-header`)
            sectionHeader.parentElement.style.setProperty('--header-offset', '-' + sectionHeader.clientHeight + 'px')
        }
    }, [])

    return (
        <div className="section-wrapper" id={`${props.id ? props.id : props.title.toLowerCase().replace(' ', '-')}`}>
            <div className="section scroll-percent" id={`${props.id ? props.id : props.title.toLowerCase().replace(' ', '-')}-section`}>
                {props.header !== false ? (<div className="section-header" id={`${props.id ? props.id : props.title.toLowerCase().replace(' ', '-')}-header`}>
                    
                    {props.headerLink
                    ? <a className="section-link" href={props.headerLink}><h2 className="section-title unselectable" id={`${props.id ? props.id : props.title.toLowerCase().replace(' ', '-')}-title`}>{props.title}</h2></a>
                    : <h2 className="section-title unselectable" id={`${props.id ? props.id : props.title.toLowerCase().replace(' ', '-')}-title`}>{props.title ? props.title : `${props.id[0].toUpperCase()}${props.id.slice(1)}`}</h2>}

                    {props.headerRight && <div className="section-header-right" id={`${props.id ? props.id : props.title.toLowerCase().replace(' ', '-')}-header-right`}>{props.headerRight}</div>}
                
                </div>) : <></>}
                <div className="section-content" id={`${props.id ? props.id : props.title.toLowerCase().replace(' ', '-')}-content`}>
                    {props.children}
                </div>
            </div>
        </div>
    )
}