import { useState, useEffect } from 'react'
import Overlay from './components/Overlay'
import Section from './components/Section'
import Hero from './components/Hero'
import Portfolio from './components/Portfolio'

export default function App() {
  useEffect(() => {
    function updateScrollPercent() {
      const elsToUpdate = [...document.getElementsByClassName('scroll-percent')]
      elsToUpdate.forEach(el => {
        var rect = el.getBoundingClientRect()

        var elemLowerLimit = -(rect.top - window.innerHeight)
        var elemHigherLimit = rect.height + window.innerHeight
        
        if (elemLowerLimit < 0) {
          el.setAttribute('scroll-percent', `0`)
          el.style.setProperty('--scroll-percent', '0')
        } else if (elemLowerLimit >= elemHigherLimit) {
          el.setAttribute('scroll-percent', `1`)
          el.style.setProperty('--scroll-percent', '1')
        } else {
          el.setAttribute('scroll-percent', `${elemLowerLimit / elemHigherLimit}`)
          el.style.setProperty('--scroll-percent', `${elemLowerLimit / elemHigherLimit}`)
        }
        
        if (rect.y > 0) {
          el.setAttribute('exit-percent', `0`)
          el.style.setProperty('--exit-percent', '0')
        } else if (Math.abs(rect.y) >= rect.height) {
          el.setAttribute('exit-percent', `1`)
          el.style.setProperty('--exit-percent', '1')
        } else {
          el.setAttribute('exit-percent', `${Math.abs(rect.y) / rect.height}`)
          el.style.setProperty('--exit-percent', `${Math.abs(rect.y) / rect.height}`)
        }

        if (rect.top > window.innerHeight) {
          el.setAttribute('top-percent', `0`)
          el.style.setProperty('--top-percent', '0')
        } else if (rect.top <= 0) {
          el.setAttribute('top-percent', `1`)
          el.style.setProperty('--top-percent', '1')
        } else {
          el.setAttribute('top-percent', `${1 - (Math.abs(rect.top) / window.innerHeight)}`)
          el.style.setProperty('--top-percent', `${1 - (Math.abs(rect.top) / window.innerHeight)}`)
        }
      })
    }

    function animateWhenVisible() {
      const elsToAnimate = [...document.getElementsByClassName('to-animate')]
      elsToAnimate.forEach(el => {
        var rect = el.getBoundingClientRect()

        var elemTop = rect.top
        var elemBottom = rect.bottom
    
        if (elemTop < window.innerHeight && elemBottom >= 0) {
          el.classList.remove('to-animate')
          el.classList.add('animate')
        }
      })
    }

    function handleScroll() {
      animateWhenVisible()
      updateScrollPercent()
    }

    handleScroll()

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  return (
    <div className='App'>
      <Overlay />
      <div style={{height:'2000px'}}></div>
      <Portfolio />
      <Section name='Test Section' content='test'/>
      <div style={{height:'2000px'}}></div>
      {/* <div className="test scroll-percent to-animate" style={{height: '100dvh', backgroundColor: 'white'}}></div> */}
    </div>
  )
}
