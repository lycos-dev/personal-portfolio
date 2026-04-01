import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const SECTION_POINTS = [
  { id: 'skills', label: 'Skills', position: [0.85, 0.35, 0.7] },
  { id: 'projects', label: 'Projects', position: [-0.95, 0.2, 0.55] },
  { id: 'contact', label: 'Contact', position: [0.15, -0.95, 0.75] },
]

export default function GlobeScene() {
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
    const camera = new THREE.PerspectiveCamera(42, mount.clientWidth / mount.clientHeight, 0.1, 100)
    camera.position.set(0, 0, 6)

    const globeGroup = new THREE.Group()
    scene.add(globeGroup)

    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(1.4, 32, 32),
      new THREE.MeshStandardMaterial({
        color: 0xdbe4f0,
        roughness: 0.35,
        metalness: 0.2,
        emissive: 0x0f172a,
        emissiveIntensity: 0.2,
      })
    )
    globeGroup.add(globe)

    const globeWire = new THREE.Mesh(
      new THREE.SphereGeometry(1.48, 20, 20),
      new THREE.MeshBasicMaterial({
        color: 0x94a3b8,
        wireframe: true,
        transparent: true,
        opacity: 0.22,
      })
    )
    globeGroup.add(globeWire)

    const points = SECTION_POINTS.map((point) => {
      const marker = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 14, 14),
        new THREE.MeshStandardMaterial({
          color: 0xf8fafc,
          emissive: 0x64748b,
          emissiveIntensity: 0.4,
        })
      )
      marker.position.set(point.position[0], point.position[1], point.position[2])
      marker.userData = { id: point.id, label: point.label, baseScale: 1 }
      globeGroup.add(marker)
      return marker
    })

    const ambient = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambient)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.05)
    keyLight.position.set(2.5, 2, 4)
    scene.add(keyLight)
    const rim = new THREE.PointLight(0xcbd5e1, 1.4, 12, 2)
    rim.position.set(-3, -2, 2.5)
    scene.add(rim)

    const particlesCount = 120
    const particlesGeo = new THREE.BufferGeometry()
    const particlesPos = new Float32Array(particlesCount * 3)
    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3
      particlesPos[i3] = (Math.random() - 0.5) * 12
      particlesPos[i3 + 1] = (Math.random() - 0.5) * 8
      particlesPos[i3 + 2] = (Math.random() - 0.5) * 8
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(particlesPos, 3))
    const particles = new THREE.Points(
      particlesGeo,
      new THREE.PointsMaterial({
        color: 0xcbd5e1,
        size: 0.03,
        transparent: true,
        opacity: 0.45,
        depthWrite: false,
      })
    )
    scene.add(particles)

    const pointer = new THREE.Vector2()
    const pointerTarget = new THREE.Vector2()
    const raycaster = new THREE.Raycaster()
    let hoveredPoint = null

    let isDragging = false
    let dragStartX = 0
    let dragStartY = 0
    let dragYaw = 0
    let dragPitch = 0
    let yaw = 0
    let pitch = 0
    let yawTarget = 0
    let pitchTarget = 0

    const cameraRig = {
      current: new THREE.Vector3(0, 0, 6),
      target: new THREE.Vector3(0, 0, 6),
      ride: {
        active: false,
        progress: 0,
        duration: 1.2,
        start: new THREE.Vector3(0, 0, 6),
        control: new THREE.Vector3(0, 0, 6),
        end: new THREE.Vector3(0, 0, 6),
        bank: 0,
      },
    }

    const updatePointer = (clientX, clientY) => {
      const rect = mount.getBoundingClientRect()
      pointerTarget.x = ((clientX - rect.left) / rect.width) * 2 - 1
      pointerTarget.y = -((clientY - rect.top) / rect.height) * 2 + 1
    }

    const focusSection = (id) => {
      const destinations = {
        skills: new THREE.Vector3(1.6, 0.9, 4.2),
        projects: new THREE.Vector3(-1.35, 0.55, 4.45),
        contact: new THREE.Vector3(0.6, -1.25, 4.35),
      }

      const end = destinations[id]
      if (!end) return

      const ride = cameraRig.ride
      ride.active = true
      ride.progress = 0
      ride.start.copy(cameraRig.current)
      ride.end.copy(end)
      // Elevated midpoint creates a smooth "motorcycle" arc path.
      ride.control
        .copy(ride.start)
        .lerp(ride.end, 0.5)
        .add(new THREE.Vector3(0, 0.9, -0.35))

      const lateral = ride.end.x - ride.start.x
      ride.bank = THREE.MathUtils.clamp(lateral * 0.12, -0.2, 0.2)
    }

    let dragMoved = false
    const onMouseMove = (e) => {
      updatePointer(e.clientX, e.clientY)
      if (!isDragging) return
      if (Math.abs(e.clientX - dragStartX) + Math.abs(e.clientY - dragStartY) > 4) {
        dragMoved = true
      }
      const dx = (e.clientX - dragStartX) * 0.004
      const dy = (e.clientY - dragStartY) * 0.004
      yawTarget = dragYaw + dx
      pitchTarget = THREE.MathUtils.clamp(dragPitch + dy, -0.5, 0.5)
    }

    const onMouseDown = (e) => {
      isDragging = true
      dragMoved = false
      dragStartX = e.clientX
      dragStartY = e.clientY
      dragYaw = yawTarget
      dragPitch = pitchTarget
    }

    const onMouseUp = () => {
      isDragging = false
    }

    const onClick = () => {
      if (dragMoved) return
      if (hoveredPoint) focusSection(hoveredPoint.userData.id)
    }

    const onLeave = () => {
      pointerTarget.x = 0
      pointerTarget.y = 0
      hoveredPoint = null
      isDragging = false
    }

    mount.addEventListener('mousemove', onMouseMove)
    mount.addEventListener('mousedown', onMouseDown)
    mount.addEventListener('mouseup', onMouseUp)
    mount.addEventListener('mouseleave', onLeave)
    mount.addEventListener('click', onClick)

    let frameId
    const clock = new THREE.Clock()
    const ridePos = new THREE.Vector3()
    const rideForwardPos = new THREE.Vector3()

    const animate = () => {
      frameId = requestAnimationFrame(animate)
      const elapsed = clock.getElapsedTime()
      const delta = Math.min(clock.getDelta(), 0.033)

      pointer.x += (pointerTarget.x - pointer.x) * 0.08
      pointer.y += (pointerTarget.y - pointer.y) * 0.08

      raycaster.setFromCamera(pointer, camera)
      const intersects = raycaster.intersectObjects(points, false)
      hoveredPoint = intersects.length > 0 ? intersects[0].object : null

      yawTarget += 0.0015
      yaw += (yawTarget - yaw) * 0.08
      pitch += (pitchTarget - pitch) * 0.08

      globeGroup.rotation.y = yaw
      globeGroup.rotation.x = pitch

      points.forEach((point, i) => {
        const isActive = point === hoveredPoint
        const targetScale = isActive ? 1.65 : 1
        point.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.15)
        point.material.emissiveIntensity += ((isActive ? 0.95 : 0.4) - point.material.emissiveIntensity) * 0.15
        point.position.z += Math.sin(elapsed * 1.2 + i) * 0.0008
      })

      particles.rotation.y = elapsed * 0.015
      particles.rotation.x = elapsed * 0.007

      const ride = cameraRig.ride
      if (ride.active) {
        ride.progress = Math.min(1, ride.progress + delta / ride.duration)
        const t = ride.progress
        const eased = 1 - Math.pow(1 - t, 3)

        // Quadratic Bezier interpolation for curved camera travel.
        ridePos
          .copy(ride.start)
          .multiplyScalar((1 - eased) * (1 - eased))
          .addScaledVector(ride.control, 2 * (1 - eased) * eased)
          .addScaledVector(ride.end, eased * eased)

        const lookAheadT = Math.min(1, eased + 0.03)
        rideForwardPos
          .copy(ride.start)
          .multiplyScalar((1 - lookAheadT) * (1 - lookAheadT))
          .addScaledVector(ride.control, 2 * (1 - lookAheadT) * lookAheadT)
          .addScaledVector(ride.end, lookAheadT * lookAheadT)

        cameraRig.current.copy(ridePos)
        camera.position.copy(cameraRig.current)
        camera.lookAt(rideForwardPos)
        camera.rotation.z = Math.sin(eased * Math.PI) * ride.bank

        if (t >= 1) {
          ride.active = false
          cameraRig.target.copy(ride.end)
        }
      } else {
        camera.rotation.z *= 0.9
        const targetCamX = cameraRig.target.x + pointer.x * 0.2
        const targetCamY = cameraRig.target.y + pointer.y * 0.16
        cameraRig.current.x += (targetCamX - cameraRig.current.x) * 0.06
        cameraRig.current.y += (targetCamY - cameraRig.current.y) * 0.06
        cameraRig.current.z += (cameraRig.target.z - cameraRig.current.z) * 0.06
        camera.position.copy(cameraRig.current)
        camera.lookAt(0, 0, 0)
      }

      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      if (!mount) return
      const w = mount.clientWidth
      const h = mount.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(frameId)
      mount.removeEventListener('mousemove', onMouseMove)
      mount.removeEventListener('mousedown', onMouseDown)
      mount.removeEventListener('mouseup', onMouseUp)
      mount.removeEventListener('mouseleave', onLeave)
      mount.removeEventListener('click', onClick)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      globe.geometry.dispose()
      globe.material.dispose()
      globeWire.geometry.dispose()
      globeWire.material.dispose()
      points.forEach((point) => {
        point.geometry.dispose()
        point.material.dispose()
      })
      particlesGeo.dispose()
      particles.material.dispose()
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [])

  return <div ref={mountRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
}
