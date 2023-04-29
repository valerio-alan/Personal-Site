import { useState, useEffect } from 'react'
import Header from './components/Header'
import Intro from './components/Intro'
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

        
        if (rect.top == 0) {
          el.setAttribute('at-top', `1`)
          el.style.setProperty('--at-top', '1')
        } else {
          el.setAttribute('at-top', `0`)
          el.style.setProperty('--at-top', '0')
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
      <div className="grain">
        <div className="grain-overflow"></div>
      </div>
      <div style={{height:'2000px'}}></div>
      <Portfolio />
      {/* <div className="test scroll-percent to-animate" style={{height: '100dvh', backgroundColor: 'white'}}></div> */}
    </div>
  )
}
