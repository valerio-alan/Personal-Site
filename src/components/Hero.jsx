import { useEffect } from "react"
import Section from "./Section"

export default function Hero() {
    useEffect(() => {
        const heroText = document.getElementsByClassName('hero-text')[0]
        const heroChars = [...document.getElementsByClassName('hero-char')]

        function hoverChar(event) {
            let char = event.target
            let charNum = heroChars.indexOf(char)
            
            char.style = 'transition: bottom 100ms ease-out; bottom: 5vw'
            char.setAttribute('chartype', 'primary')

            if (heroChars[charNum - 1]) {
                heroChars[charNum - 1].style = 'transition: bottom 100ms 25ms ease-out; bottom: 2.5vw'
                heroChars[charNum - 1].setAttribute('chartype', 'secondary')
            }

            if (heroChars[charNum + 1]) {
                heroChars[charNum + 1].style = 'transition: bottom 100ms 25ms ease-out; bottom: 2.5vw'
                heroChars[charNum + 1].setAttribute('chartype', 'secondary')
            }
            setTimeout(() => {
                if (char.getAttribute('chartype') == 'primary') {leaveChar(event)}
            }, 175)
        }

        function leaveChar(event) {
            let char = event.target
            let charNum = heroChars.indexOf(char)
            let charList = [char]

            if (heroChars[charNum - 1]) {
                charList.push(heroChars[charNum - 1])
            }

            if (heroChars[charNum + 1]) {
                charList.push(heroChars[charNum + 1])
            }

            charList.forEach(el => {
                el.setAttribute('chartype', '')
                el.style = 'transition: bottom 500ms ease-in; bottom: 0'
            })
        }

        function leaveWord() {
            heroChars.forEach(el => {
                el.setAttribute('chartype', '')
                el.style = 'transition: bottom 500ms ease-in'
            })
        }

        heroText.addEventListener('mouseleave', leaveWord)
        heroChars.forEach((el) => {
            el.addEventListener('mouseenter', (event) => {hoverChar(event)})
            el.addEventListener('mouseclick', (event) => {hoverChar(event)})
            el.addEventListener('mouseleave', (event) => {leaveChar(event)})
        })
        return (() => {
            heroText.removeEventListener('mouseleave', leaveWord)
            heroChars.forEach((el) => {
                el.removeEventListener('mouseenter', (event) => {hoverChar(event)})
                el.removeEventListener('mouseclick', (event) => {hoverChar(event)})
                el.removeEventListener('mouseleave', (event) => {leaveChar(event)})
            })
        })
    }, [])

    let heroText = [...'Alan Valerio']
    heroText = heroText.map((char, i) => (<span key={i} className="hero-char" charnum={i}>{char}</span>))

    const content = (
        <>
            <h1 className="hero-text unselectable">{heroText}</h1>
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