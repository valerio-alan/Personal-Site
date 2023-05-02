export default function Section(props) {
    return (
        <div className="section-wrapper" id={`${props.id ? props.id : props.title.toLowerCase().replace(' ', '-')}`}>
            <div className="section scroll-percent" id={`${props.id ? props.id : props.title.toLowerCase().replace(' ', '-')}-section`}>
                <div className="section-header" id={`${props.id ? props.id : props.title.toLowerCase().replace(' ', '-')}-header`}>
                    <h2 className="section-title unselectable" id={`${props.id ? props.id : props.title.toLowerCase().replace(' ', '-')}-title`}>{props.title}</h2>
                    {props.headerRight && <div className="section-header-right" id={`${props.id ? props.id : props.title.toLowerCase().replace(' ', '-')}-header-right`}>{props.headerRight}</div>}
                </div>
                {props.content && <div className="section-content" id={`${props.id ? props.id : props.title.toLowerCase().replace(' ', '-')}-content`}>{props.content}</div>}
            </div>
        </div>
    )
}