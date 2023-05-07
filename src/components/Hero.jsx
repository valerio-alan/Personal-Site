import { useEffect } from "react"
import Section from "./Section"
import projectsData from "../data/projects"
import AVPortrait from "../assets/images/AlanValerio.jpg"

export default function Hero() {
    useEffect(() => {
        // Modified perspective tilt effect from https://css-tricks.com/animate-a-container-on-mouse-over-using-perspective-and-transform/
        var counter = 0
        var updateRate = 5
        var isTimeToUpdate = () => counter++ % updateRate === 0

        var container = document.getElementById('perspective-wrap')
        var inner = document.getElementById('perspective')

        function init() {
            container.setAttribute('_x', container.offsetLeft + Math.floor(container.offsetWidth/2))
            container.setAttribute('_y', container.offsetTop + Math.floor(container.offsetHeight/2))
            inner.setAttribute('_x', container.offsetLeft + Math.floor(container.offsetWidth/2))
            inner.setAttribute('_y', container.offsetTop + Math.floor(container.offsetHeight/2))
        }
          
        var updateTransformStyle = function(x, y) {
            var style = "rotateX(" + x + "deg) rotateY(" + y + "deg)"
            inner.style.transform = style
            inner.style.webkitTransform = style
            inner.style.mozTransform = style
            inner.style.msTransform = style
            inner.style.oTransform = style
        }

        var update = function(event) {
            var e = event || window.event
            updateTransformStyle(
                (((e.clientY - e.target.getAttribute('_y')) * -1) / inner.offsetHeight/2).toFixed(2),
                ((e.clientX - e.target.getAttribute('_x')) / inner.offsetWidth/2).toFixed(2)
            )
        }

        init()

        container.addEventListener('mouseenter', (event) => (update(event)))
        container.addEventListener('mouseleave', () => (inner.style = ""))
        container.addEventListener('mousemove', (event) => {
            if (isTimeToUpdate()) {
                update(event)
            }
        })
        window.addEventListener('resize', init)
        return () => {
            container.removeEventListener('mouseenter', (event) => (update(event)))
            container.removeEventListener('mouseleave', () => (inner.style = ""))
            container.removeEventListener('mousemove', (event) => {
                if (isTimeToUpdate()) {
                    update(event)
                }
            })
            window.removeEventListener('resize', init)
        }
    }, [])

    const content = (
        <>
            <div className='hero-img unselectable' id='perspective-wrap'>
                <img src={AVPortrait} alt='A portrait image of Alan Valerio looking to the side' id='perspective'/>
            </div>
            <div className='hero-text'>
                <h3>Hello! My name is <span className='bold purple'>Alan Valerio</span>.</h3>
                <p>I’m a <span className='bold purple'>self-taught web developer</span> with a focus on <span className='bold purple'>front-end</span> and an eye for <span className='bold purple'>design</span>.</p>
                <p>I’ve had the honor of working with <a className='hero-link' href="#portfolio">many clients</a>, and have gained further experience through my own personal projects.</p>
                {/* <p>I look forward to working with you!</p> */}
                <div className='hero-btns desktop'>
                    <a className='hero-btn show-tooltip' tooltip-text="Come see what I can do!" href='#portfolio'>Projects</a>
                    <a className='hero-btn show-tooltip' tooltip-text='Hire me? ;)' href='#contact'>Contact</a>
                </div>
            </div>
            <div className='hero-btns mobile'>
                <a className='hero-btn show-tooltip' tooltip-text="Come see what I can do!" href='#portfolio'>Projects</a>
                <a className='hero-btn show-tooltip' tooltip-text='Hire me? ;)' href='#contact'>Contact</a>
            </div>
        </>
    )

    return (
        <Section
            header={false}
            id='hero'
            content={content}
        />
    )
}