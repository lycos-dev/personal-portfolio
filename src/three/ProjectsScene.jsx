import { useEffect, useRef } from 'react'

export default function ProjectsScene() {
  const mountRef = useRef(null)

  useEffect(() => {
    // Placeholder scene mount for future "Projects Universe".
  }, [])

  return <div ref={mountRef} className="hidden" aria-hidden="true" />
}
