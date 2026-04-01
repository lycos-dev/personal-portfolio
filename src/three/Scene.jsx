import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function Scene() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    // ── Renderer ──────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    // ── Scene & Camera ────────────────────────────────────────────────────
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, mount.clientWidth / mount.clientHeight, 0.1, 100)
    camera.position.set(0, 0, 5)

    // ── Mouse tracking ────────────────────────────────────────────────────
    const mouse = { x: 0, y: 0 }
    const target = { x: 0, y: 0 }

    const handleMouseMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', handleMouseMove)

    // ── Primary wireframe icosahedron ─────────────────────────────────────
    const icoGeo = new THREE.IcosahedronGeometry(1.6, 1)
    const icoMat = new THREE.MeshBasicMaterial({
      color: 0xf5a623,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    })
    const ico = new THREE.Mesh(icoGeo, icoMat)
    scene.add(ico)

    // ── Secondary smaller icosahedron (cyan accent) ───────────────────────
    const icoGeo2 = new THREE.IcosahedronGeometry(0.9, 1)
    const icoMat2 = new THREE.MeshBasicMaterial({
      color: 0x00d4ff,
      wireframe: true,
      transparent: true,
      opacity: 0.08,
    })
    const ico2 = new THREE.Mesh(icoGeo2, icoMat2)
    ico2.position.set(2.5, -1, -1)
    scene.add(ico2)

    // ── Third icosahedron ─────────────────────────────────────────────────
    const icoGeo3 = new THREE.IcosahedronGeometry(0.6, 0)
    const icoMat3 = new THREE.MeshBasicMaterial({
      color: 0xf5a623,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    })
    const ico3 = new THREE.Mesh(icoGeo3, icoMat3)
    ico3.position.set(-3, 1.5, -2)
    scene.add(ico3)

    // ── Particle field ────────────────────────────────────────────────────
    const particleCount = 800
    const positions = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2
      sizes[i] = Math.random() * 2 + 0.5
    }

    const particleGeo = new THREE.BufferGeometry()
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

    const particleMat = new THREE.PointsMaterial({
      color: 0xf5a623,
      size: 0.025,
      transparent: true,
      opacity: 0.5,
      sizeAttenuation: true,
    })

    const particles = new THREE.Points(particleGeo, particleMat)
    scene.add(particles)

    // ── Cyan accent particles ─────────────────────────────────────────────
    const cyanCount = 200
    const cyanPos = new Float32Array(cyanCount * 3)
    for (let i = 0; i < cyanCount; i++) {
      cyanPos[i * 3] = (Math.random() - 0.5) * 20
      cyanPos[i * 3 + 1] = (Math.random() - 0.5) * 20
      cyanPos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2
    }
    const cyanGeo = new THREE.BufferGeometry()
    cyanGeo.setAttribute('position', new THREE.BufferAttribute(cyanPos, 3))
    const cyanMat = new THREE.PointsMaterial({
      color: 0x00d4ff,
      size: 0.015,
      transparent: true,
      opacity: 0.35,
      sizeAttenuation: true,
    })
    const cyanParticles = new THREE.Points(cyanGeo, cyanMat)
    scene.add(cyanParticles)

    // ── Grid lines (horizontal plane) ─────────────────────────────────────
    const gridGeo = new THREE.BufferGeometry()
    const gridLines = []
    const gridSize = 14
    const gridStep = 1.4
    for (let i = -gridSize / 2; i <= gridSize / 2; i += gridStep) {
      gridLines.push(-gridSize / 2, -2.5, i, gridSize / 2, -2.5, i)
      gridLines.push(i, -2.5, -gridSize / 2, i, -2.5, gridSize / 2)
    }
    gridGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(gridLines), 3))
    const gridMat = new THREE.LineBasicMaterial({
      color: 0xf5a623,
      transparent: true,
      opacity: 0.06,
    })
    const grid = new THREE.LineSegments(gridGeo, gridMat)
    scene.add(grid)

    // ── Animation loop ────────────────────────────────────────────────────
    let frameId
    const clock = new THREE.Clock()

    const animate = () => {
      frameId = requestAnimationFrame(animate)
      const elapsed = clock.getElapsedTime()

      // Smooth mouse follow
      target.x += (mouse.x - target.x) * 0.04
      target.y += (mouse.y - target.y) * 0.04

      // Rotate icosahedrons
      ico.rotation.x = elapsed * 0.08 + target.y * 0.3
      ico.rotation.y = elapsed * 0.12 + target.x * 0.3

      ico2.rotation.x = elapsed * 0.12
      ico2.rotation.y = elapsed * 0.09 + target.x * 0.2
      ico2.rotation.z = elapsed * 0.05

      ico3.rotation.x = elapsed * 0.15
      ico3.rotation.y = elapsed * 0.1
      ico3.rotation.z = elapsed * 0.07 + target.y * 0.15

      // Float the icosahedrons
      ico.position.y = Math.sin(elapsed * 0.5) * 0.15
      ico2.position.y = -1 + Math.sin(elapsed * 0.7 + 1) * 0.2
      ico3.position.y = 1.5 + Math.sin(elapsed * 0.4 + 2) * 0.1

      // Drift particles slowly
      particles.rotation.y = elapsed * 0.015
      particles.rotation.x = elapsed * 0.008
      cyanParticles.rotation.y = -elapsed * 0.012
      cyanParticles.rotation.x = elapsed * 0.005

      // Subtle camera parallax from mouse
      camera.position.x += (target.x * 0.4 - camera.position.x) * 0.04
      camera.position.y += (target.y * 0.25 - camera.position.y) * 0.04
      camera.lookAt(scene.position)

      renderer.render(scene, camera)
    }
    animate()

    // ── Resize handler ────────────────────────────────────────────────────
    const handleResize = () => {
      if (!mount) return
      const w = mount.clientWidth
      const h = mount.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    // ── Cleanup ───────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      icoGeo.dispose()
      icoMat.dispose()
      icoGeo2.dispose()
      icoMat2.dispose()
      icoGeo3.dispose()
      icoMat3.dispose()
      particleGeo.dispose()
      particleMat.dispose()
      cyanGeo.dispose()
      cyanMat.dispose()
      gridGeo.dispose()
      gridMat.dispose()
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    />
  )
}