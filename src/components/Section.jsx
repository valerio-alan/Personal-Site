export default function Section(props) {
    return (
        <div className="section-wrapper" id={`${props.name.replace(' ', '-')}`}>
            <div className="section scroll-percent" id={`${props.name.toLowerCase().replace(' ', '-')}-section`}>
                <h2 className="section-title">{props.name}</h2>
                <div className="section-content">{props.content}</div>
            </div>
        </div>
    )
}