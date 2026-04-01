import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function Scene() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      50,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100
    )
    camera.position.set(0, 0, 6)

    const group = new THREE.Group()
    scene.add(group)

    const geometry = new THREE.IcosahedronGeometry(1.1, 2)
    const material = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.25,
      metalness: 0.55,
      emissive: 0x1f2937,
      emissiveIntensity: 0.2,
      flatShading: true,
    })
    const core = new THREE.Mesh(geometry, material)
    group.add(core)

    const wireframe = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.24, 1),
      new THREE.MeshBasicMaterial({
        color: 0x94a3b8,
        wireframe: true,
        transparent: true,
        opacity: 0.22,
      })
    )
    group.add(wireframe)

    const ambient = new THREE.AmbientLight(0xffffff, 0.55)
    scene.add(ambient)

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.1)
    keyLight.position.set(3, 2, 4)
    scene.add(keyLight)

    const rimLight = new THREE.PointLight(0xcbd5e1, 1.2, 12, 2)
    rimLight.position.set(-3, -1, 3)
    scene.add(rimLight)

    const particleCount = 180
    const particlesGeo = new THREE.BufferGeometry()
    const particlePositions = new Float32Array(particleCount * 3)
    const particleSeeds = new Float32Array(particleCount)

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      particlePositions[i3] = (Math.random() - 0.5) * 10
      particlePositions[i3 + 1] = (Math.random() - 0.5) * 6
      particlePositions[i3 + 2] = (Math.random() - 0.5) * 6
      particleSeeds[i] = Math.random() * Math.PI * 2
    }

    particlesGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(particlePositions, 3)
    )
    const particlesMat = new THREE.PointsMaterial({
      color: 0xcbd5e1,
      size: 0.03,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
    })
    const particles = new THREE.Points(particlesGeo, particlesMat)
    scene.add(particles)

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    const pointerTarget = new THREE.Vector2()
    const hoverStrength = { current: 0, target: 0 }
    const clickSpin = { velocity: 0 }

    const updatePointer = (clientX, clientY) => {
      const rect = mount.getBoundingClientRect()
      pointerTarget.x = ((clientX - rect.left) / rect.width) * 2 - 1
      pointerTarget.y = -((clientY - rect.top) / rect.height) * 2 + 1
    }

    const handleMouseMove = (e) => updatePointer(e.clientX, e.clientY)
    const handleTouchMove = (e) => {
      if (!e.touches[0]) return
      updatePointer(e.touches[0].clientX, e.touches[0].clientY)
    }
    const handleLeave = () => {
      pointerTarget.x = 0
      pointerTarget.y = 0
      hoverStrength.target = 0
    }
    const handleClick = () => {
      clickSpin.velocity += 0.28
    }

    mount.addEventListener('mousemove', handleMouseMove)
    mount.addEventListener('touchmove', handleTouchMove, { passive: true })
    mount.addEventListener('mouseleave', handleLeave)
    mount.addEventListener('click', handleClick)

    let frameId
    const clock = new THREE.Clock()
    const tempPos = particles.geometry.attributes.position.array

    const animate = () => {
      frameId = requestAnimationFrame(animate)
      const elapsed = clock.getElapsedTime()

      pointer.x += (pointerTarget.x - pointer.x) * 0.08
      pointer.y += (pointerTarget.y - pointer.y) * 0.08

      raycaster.setFromCamera(pointer, camera)
      const hit = raycaster.intersectObject(core, false)
      hoverStrength.target = hit.length > 0 ? 1 : 0
      hoverStrength.current += (hoverStrength.target - hoverStrength.current) * 0.12

      clickSpin.velocity *= 0.92
      const idleFloat = Math.sin(elapsed * 0.9) * 0.12
      const baseScale = 1 + hoverStrength.current * 0.12
      const pulseScale = Math.sin(elapsed * 10) * 0.01 * hoverStrength.current
      const finalScale = baseScale + pulseScale

      group.rotation.y += 0.004 + clickSpin.velocity
      group.rotation.x += 0.002
      group.rotation.y += (pointer.x * 0.18 - group.rotation.y * 0.25) * 0.05
      group.rotation.x += (-pointer.y * 0.16 - group.rotation.x * 0.2) * 0.05
      group.position.y += (idleFloat - group.position.y) * 0.08
      group.scale.setScalar(finalScale)

      material.emissiveIntensity += (0.2 + hoverStrength.current * 0.45 - material.emissiveIntensity) * 0.1
      wireframe.material.opacity += (0.22 + hoverStrength.current * 0.2 - wireframe.material.opacity) * 0.1

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3
        tempPos[i3 + 1] += Math.sin(elapsed * 0.6 + particleSeeds[i]) * 0.0007
      }
      particles.geometry.attributes.position.needsUpdate = true
      particles.rotation.y = elapsed * 0.015

      camera.position.x += (pointer.x * 0.35 - camera.position.x) * 0.05
      camera.position.y += (pointer.y * 0.22 - camera.position.y) * 0.05
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
      mount.removeEventListener('mousemove', handleMouseMove)
      mount.removeEventListener('touchmove', handleTouchMove)
      mount.removeEventListener('mouseleave', handleLeave)
      mount.removeEventListener('click', handleClick)
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      geometry.dispose()
      material.dispose()
      wireframe.geometry.dispose()
      wireframe.material.dispose()
      particlesGeo.dispose()
      particlesMat.dispose()
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