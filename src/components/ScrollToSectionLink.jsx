// src/components/ScrollToSectionLink.jsx
import { scroller } from 'react-scroll'
import { useNavigate, useLocation } from 'react-router-dom'

export default function ScrollToSectionLink({
  to,
  children,
  className = '',
  offset = -80,
  duration = 500,
  smooth = true,
  onClick,
}) {
  const navigate = useNavigate()
  const location = useLocation()

  const handleClick = (e) => {
    e.preventDefault()
    if (onClick) onClick()

    if (location.pathname === '/') {
      // Already on homepage → scroll directly
      scroller.scrollTo(to, { smooth, duration, offset })
    } else {
      // Navigate to home with a hash
      navigate(`/#${to}`)
    }
  }

  return (
    <a
      href={`/#${to}`}
      onClick={handleClick}
      className={`cursor-pointer ${className}`}
    >
      {children}
    </a>
  )
}
