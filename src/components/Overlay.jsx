export default function Overlay() {
    return (
        <div className="overlay unselectable">
            <div className="tooltip">
                <h3 className="tooltip-text">Click for more</h3>
                <div className="tooltip-arrow"></div>
            </div>

            <div className="fades">
                <div className="fade fade-top"></div>
                <div className="fade fade-bottom"></div>
            </div>
            <div className="grain"></div>
        </div>
    )
}