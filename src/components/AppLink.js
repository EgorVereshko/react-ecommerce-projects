import React from 'react'

import { useNavigate } from '../context/NavigationContext'

export default function AppLink({ to, onClick, children, ...props }) {
  const navigate = useNavigate()

  function handleClick(event) {
    if (onClick) {
      onClick(event)
    }

    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return
    }

    event.preventDefault()
    navigate(to)
  }

  return (
    <a href={to} onClick={handleClick} {...props}>
      {children}
    </a>
  )
}
