import { useEffect, useRef } from 'react'

export default function SkillsScene() {
  const mountRef = useRef(null)

  useEffect(() => {
    // Placeholder scene mount for future "Skills Universe".
  }, [])

  return <div ref={mountRef} className="hidden" aria-hidden="true" />
}
