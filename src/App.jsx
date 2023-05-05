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

    function hideTooltip() {
      const tooltip = document.getElementsByClassName('tooltip')[0]
      tooltip.style.opacity = 0
    }

    function handleScroll() {
      animateWhenVisible()
      updateScrollPercent()
      hideTooltip()
    }

    handleScroll()
    
    var tooltipEls = []
    const tooltipParents = [...document.getElementsByClassName('show-tooltip')]
    tooltipParents.forEach(el => {
      tooltipEls.push(el),
      [...el.children].forEach(child => {
        child.classList.add('show-tooltip')
        child.setAttribute('tooltip-text', el.getAttribute('tooltip-text'))
        tooltipEls.push(child)
      })
    })

    function setTooltipPosition(e) {
      const overlay = document.getElementsByClassName('overlay')[0]
      const tooltip = document.getElementsByClassName('tooltip')[0]
      const tooltipText = document.getElementsByClassName('tooltip-text')[0]
      const tooltipArrow = document.getElementsByClassName('tooltip-arrow')[0]

      tooltipText.style.left =
        (e.clientX + (tooltipText.clientWidth/2) + 6 < overlay.clientWidth)
            ? `max(${(tooltipText.clientWidth/2) + 6}px, ${e.clientX}px)`
            : (overlay.clientWidth - (tooltipText.clientWidth/2 + 6) + "px")
            
      tooltipText.style.top =
        (e.clientY <= tooltipText.clientHeight + 12)
            ? (6 + "px")
            : (e.clientY - tooltipText.clientHeight - 6 + "px")

      tooltipArrow.style.left = (e.clientX + "px")

      tooltipArrow.style.top =
        (e.clientY <= tooltipText.clientHeight + 12)
            ? (tooltipText.clientHeight + 6 + "px")
            : (e.clientY - tooltipArrow.clientHeight - 6 + "px")

      if (e.target.classList.contains('show-tooltip')) {
        tooltipText.textContent = e.target.getAttribute('tooltip-text')
        tooltip.style.opacity = 0.8
      } else {
        tooltip.style.opacity = 0
      }
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleScroll)
    window.addEventListener('mousemove', setTooltipPosition)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
      window.removeEventListener('mousemove', setTooltipPosition)
    }
  }, [])

  return (
    <div className='App'>
      <Overlay />
      <Hero />
      <Portfolio />
      <Section title='Test Section'/>
      <div style={{height:'2000px'}}></div>
      {/* <div className="test scroll-percent to-animate" style={{height: '100dvh', backgroundColor: 'white'}}></div> */}
    </div>
  )
}
