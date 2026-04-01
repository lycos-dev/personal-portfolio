import { useEffect, useRef } from 'react'

export default function ContactScene() {
  const mountRef = useRef(null)

  useEffect(() => {
    // Placeholder scene mount for future "Contact Universe".
  }, [])

  return <div ref={mountRef} className="hidden" aria-hidden="true" />
}
