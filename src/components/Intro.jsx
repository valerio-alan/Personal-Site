import { useEffect } from "react"
import Section from "./Section"
import AVPortrait from "../assets/images/AlanValerio.jpg"
import BounceText from "./BounceText"

export default function Intro() {
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

    useEffect(() => {
        const introEl = document.querySelector('#intro')
        const introElProps = introEl.getBoundingClientRect()
        const nameTitleEl = document.querySelector('.name-title')
        if (introElProps.top !== 0) {
            document.querySelector('.intro-intro').style.display = 'none'
            nameTitleEl.style.opacity = 1
        } else {
            setTimeout(() => {
                nameTitleEl.classList.add('animate')
                const introIntroTextEl = document.querySelector('.intro-intro-text')
                const introTextProps = introIntroTextEl.getBoundingClientRect()
                const titleElProps = nameTitleEl.getBoundingClientRect()

                const introScale = titleElProps.width / introTextProps.width
                const introTextTop = titleElProps.y + (titleElProps.height / 2)
                const introTextLeft = titleElProps.x + (titleElProps.width / 2)

                introIntroTextEl.style.transform = `translateX(-50%) translateY(-50%) scale(${introScale})`
                introIntroTextEl.style.top = `${introTextTop}px`
                introIntroTextEl.style.left = `${introTextLeft}px`
            }, 500)
        }
    }, [])

    const introAnimation = (
        <div className='intro-intro to-animate unselectable'>
            <h3 className='intro-intro-text bold purple'>Alan Valerio</h3>
        </div>
    )

    const desktopBubbles = (
        <>
            <div className='intro-bubble desktop' style={{width: '250px'}}></div>
            <div className='intro-bubble desktop' style={{width: '210px', left: '100%', top: '200px'}}></div>
            <div className='intro-bubble desktop' style={{width: '195px', left: '100px', top: '100%'}}></div>
        </>
    )

    const content = (
        <>
            {introAnimation}
            <div className='intro-bubble mobile' style={{width: '150px', left: '50px', top: '100%'}}></div>
            <div className='intro-img unselectable' id='perspective-wrap'>
                <div className='intro-bubble mobile' style={{width: '200px', top: '75px', left: '75px'}}></div>
                <img src={AVPortrait} alt='A portrait image of Alan Valerio looking to the side' id='perspective'/>
            </div>
            <div className='intro-text'>
                <div className='intro-bubble mobile' style={{width: '175px', left: '70%', top: '100%'}}></div>
                {desktopBubbles}
                <h3>Hello! My name is <BounceText classes='bold purple name-title' text='Alan Valerio'/>.</h3>
                <p>I’m a <BounceText classes='bold purple' text='self-taught web developer'/> with a focus on <BounceText classes='bold purple' text='front-end'/> and an eye for <BounceText classes='bold purple' text='design'/>.</p>
                <p>I’ve had the honor of working with <a className='intro-link' href="#portfolio">many clients</a>, and have gained further experience through my own personal projects.</p>
                {/* <p>I look forward to working with you!</p> */}
                <div className='intro-btns desktop'>
                    <a className='intro-btn show-tooltip' tooltip-text="Come see what I can do!" href='#portfolio'>Projects</a>
                    <a className='intro-btn show-tooltip' tooltip-text='Hire me? ;)' href='#contact'>Contact</a>
                </div>
            </div>
            <div className='intro-btns mobile'>
                <a className='intro-btn' href='#portfolio'>Projects</a>
                <a className='intro-btn' href='#contact'>Contact</a>
            </div>
        </>
    )

    return (
        <Section
            header={false}
            id='intro'
            content={content}
        />
    )
}