import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// ─── Constants ──────────────────────────────────────────────────────────────
const R    = 1.40           // globe radius
const SURF = R + 0.013      // surface layer for trees / markers
const ROAD = R + 0.009      // road layer (just above surface)
const ATM  = R * 1.082      // atmosphere shell radius

// ─── Section markers (lat / lon in degrees) ─────────────────────────────────
const SECTION_POINTS = [
  { id: 'skills',   label: 'Skills',   lat:  25, lon:  45 },   // Arabian Peninsula
  { id: 'projects', label: 'Projects', lat:  42, lon: -95 },   // Central USA
  { id: 'contact',  label: 'Contact',  lat: -14, lon: -48 },   // Central Brazil
]

// ─── Road routes as [lat, lon] waypoint arrays ───────────────────────────────
const ROUTES = [
  [[25,45],[45,20],[48,-10],[44,-65],[42,-95]],            // Skills → Projects (over Atlantic)
  [[42,-95],[26,-88],[11,-76],[-5,-63],[-14,-48]],         // Projects → Contact (through C. America)
  [[-14,-48],[-10,14],[6,22],[17,35],[25,45]],             // Contact → Skills (through Africa)
  [[42,-95],[44,-112],[44,-124]],                           // Side branch: US West Coast
  [[25,45],[22,72],[16,100],[6,105]],                       // Side branch: India → SE Asia
]

// ─── Geo helpers ─────────────────────────────────────────────────────────────
/** lat/lon (°) → THREE.Vector3 on sphere of radius r */
function ll(lat, lon, r = R) {
  const φ = (90 - lat) * Math.PI / 180
  const θ = (lon + 180) * Math.PI / 180
  return new THREE.Vector3(
    -r * Math.sin(φ) * Math.cos(θ),
     r * Math.cos(φ),
     r * Math.sin(φ) * Math.sin(θ),
  )
}

/** Great-circle arc between two Vector3 points, projected to radius r */
function arcSeg(a, b, steps, r) {
  const pts = []
  for (let i = 0; i <= steps; i++)
    pts.push(a.clone().lerp(b, i / steps).normalize().multiplyScalar(r))
  return pts
}

/** Build a CatmullRom-ready point array for a route of [lat,lon] waypoints */
function routePts(waypoints, r = ROAD) {
  const nodes = waypoints.map(([la, lo]) => ll(la, lo))
  let out = []
  for (let i = 0; i < nodes.length - 1; i++)
    out = out.concat(arcSeg(nodes[i], nodes[i + 1], 30, r))
  return out
}

// ─── Deterministic pseudo-random (stable between renders) ───────────────────
function rng(n) {
  const s = Math.sin(n * 9301.0 + 49297.0) * 233280.0
  return s - Math.floor(s)
}

// ─── Biome classification ────────────────────────────────────────────────────
function isLand(lat, lon) {
  if (lat > 12  && lat < 72  && lon > -170 && lon < -52)  return true // N. America
  if (lat > 60  && lat < 85  && lon > -58  && lon < -17)  return true // Greenland
  if (lat > -57 && lat < 13  && lon > -82  && lon < -33)  return true // S. America
  if (lat > 35  && lat < 72  && lon > -12  && lon < 40)   return true // Europe
  if (lat > -36 && lat < 38  && lon > -18  && lon < 52)   return true // Africa
  if (lat > 1   && lat < 77  && lon > 26   && lon < 145)  return true // Asia
  if (lat > -8  && lat < 23  && lon > 95   && lon < 141)  return true // SE Asia
  if (lat > -44 && lat < -10 && lon > 113  && lon < 154)  return true // Australia
  if (lat < -68)                                           return true // Antarctica
  return false
}

function isMountain(lat, lon) {
  if (lat > 30 && lat < 62 && lon > -126 && lon < -110) return true // Rockies
  if (lat > -50 && lat < 5 && lon > -79  && lon < -63)  return true // Andes
  if (lat > 43 && lat < 49 && lon > 5   && lon < 17)   return true  // Alps
  if (lat > 26 && lat < 38 && lon > 73  && lon < 102)  return true  // Himalayas
  return false
}

function isDesert(lat, lon) {
  if (lat > 14 && lat < 34 && lon > -18 && lon < 40)    return true // Sahara
  if (lat > 11 && lat < 34 && lon > 35  && lon < 61)    return true // Arabian
  if (lat > -33 && lat < -17 && lon > 117 && lon < 143) return true // Australian Outback
  return false
}

function biome(lat, lon) {
  if (lat > 76 || lat < -69)  return 'snow'
  if (!isLand(lat, lon))      return 'ocean'
  if (isMountain(lat, lon))   return 'mountain'
  if (isDesert(lat, lon))     return 'desert'
  if (Math.abs(lat) < 13)    return 'tropical'
  if (lat > 57 || lat < -50) return 'tundra'
  return 'land'
}

// ─── Biome → base colour (RGB floats 0–1) ────────────────────────────────────
const BIOME_COL = {
  ocean:    [0.04, 0.11, 0.23],
  snow:     [0.83, 0.90, 0.94],
  land:     [0.17, 0.43, 0.15],
  tropical: [0.10, 0.52, 0.14],
  tundra:   [0.36, 0.44, 0.35],
  mountain: [0.55, 0.50, 0.43],
  desert:   [0.76, 0.62, 0.26],
}

// ─── Biome → terrain elevation offset ────────────────────────────────────────
const BIOME_ELEV = {
  ocean: -0.008, land: 0.011, tropical: 0.013,
  tundra: 0.009, desert: 0.007, mountain: 0.032, snow: 0.014,
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function GlobeScene() {
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

    // ── Scene / Camera ────────────────────────────────────────────────────
    const scene      = new THREE.Scene()
    const camera     = new THREE.PerspectiveCamera(42, mount.clientWidth / mount.clientHeight, 0.1, 100)
    camera.position.set(0, 0, 6)
    const globeGroup = new THREE.Group()
    scene.add(globeGroup)

    // ─────────────────────────────────────────────────────────────────────
    // 1 ▸ GLOBE — vertex-coloured + displaced sphere
    // ─────────────────────────────────────────────────────────────────────
    const SEG     = 92
    const geoGlobe = new THREE.SphereGeometry(R, SEG, SEG)
    const gPos    = geoGlobe.attributes.position
    const gCol    = new Float32Array(gPos.count * 3)

    for (let i = 0; i < gPos.count; i++) {
      const x = gPos.getX(i), y = gPos.getY(i), z = gPos.getZ(i)

      // Convert cartesian → lat/lon
      const lat = Math.asin(THREE.MathUtils.clamp(y / R, -1, 1)) * 180 / Math.PI
      let θv    = Math.atan2(z, -x)
      if (θv < 0) θv += 2 * Math.PI
      const lon = θv * 180 / Math.PI - 180

      const b   = biome(lat, lon)
      const col = BIOME_COL[b]

      // Per-vertex noise for natural variation
      const noise = rng(i) * 0.5 - 0.25  // -0.125 .. +0.125
      const elev  = (BIOME_ELEV[b] ?? 0) + noise * (b === 'mountain' ? 0.024 : 0.004)
      const sc    = (R + elev) / R

      gPos.setXYZ(i, x * sc, y * sc, z * sc)

      const j = noise * 0.07
      gCol[i*3]   = THREE.MathUtils.clamp(col[0] + j, 0, 1)
      gCol[i*3+1] = THREE.MathUtils.clamp(col[1] + j, 0, 1)
      gCol[i*3+2] = THREE.MathUtils.clamp(col[2] + j, 0, 1)
    }

    gPos.needsUpdate = true
    geoGlobe.computeVertexNormals()
    geoGlobe.setAttribute('color', new THREE.BufferAttribute(gCol, 3))

    globeGroup.add(new THREE.Mesh(
      geoGlobe,
      new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.72, metalness: 0.04 }),
    ))

    // ─────────────────────────────────────────────────────────────────────
    // 2 ▸ ATMOSPHERE — two shells for inner glow + outer haze
    // ─────────────────────────────────────────────────────────────────────
    globeGroup.add(new THREE.Mesh(
      new THREE.SphereGeometry(ATM, 32, 32),
      new THREE.MeshStandardMaterial({
        color: 0x3366ee, transparent: true, opacity: 0.048,
        side: THREE.FrontSide, depthWrite: false,
      }),
    ))
    globeGroup.add(new THREE.Mesh(
      new THREE.SphereGeometry(ATM * 1.065, 32, 32),
      new THREE.MeshStandardMaterial({
        color: 0x1144bb, transparent: true, opacity: 0.075,
        side: THREE.BackSide, depthWrite: false,
      }),
    ))

    // ─────────────────────────────────────────────────────────────────────
    // 3 ▸ SUBTLE WIREFRAME OVERLAY
    // ─────────────────────────────────────────────────────────────────────
    globeGroup.add(new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.002, 22, 22),
      new THREE.MeshBasicMaterial({
        color: 0x7799bb, wireframe: true, transparent: true, opacity: 0.055,
      }),
    ))

    // ─────────────────────────────────────────────────────────────────────
    // 4 ▸ ROADS — dark asphalt body + pale centre stripe per route
    // ─────────────────────────────────────────────────────────────────────
    const matRoadBody = new THREE.MeshStandardMaterial({ color: 0x1c1a16, roughness: 0.96 })
    const matRoadLine = new THREE.MeshStandardMaterial({
      color: 0xc8b870, transparent: true, opacity: 0.60, roughness: 0.9,
    })

    ROUTES.forEach((route) => {
      // Road body
      const pts  = routePts(route, ROAD + 0.002)
      const crv  = new THREE.CatmullRomCurve3(pts)
      globeGroup.add(new THREE.Mesh(
        new THREE.TubeGeometry(crv, pts.length * 2, 0.006, 4, false),
        matRoadBody,
      ))
      // Centre dashes (slightly higher so they're always visible)
      const pts2 = routePts(route, ROAD + 0.004)
      const crv2 = new THREE.CatmullRomCurve3(pts2)
      globeGroup.add(new THREE.Mesh(
        new THREE.TubeGeometry(crv2, pts.length * 2, 0.0014, 3, false),
        matRoadLine,
      ))
    })

    // ─────────────────────────────────────────────────────────────────────
    // 5 ▸ TREES — three InstancedMesh layers (trunk + 2 foliage cones)
    // ─────────────────────────────────────────────────────────────────────
    const MAX_TREES = 300
    const iTreeLo   = new THREE.InstancedMesh(
      new THREE.ConeGeometry(0.024, 0.060, 5),
      new THREE.MeshStandardMaterial({ color: 0x1d4a16, roughness: 0.90 }),
      MAX_TREES,
    )
    const iTreeHi   = new THREE.InstancedMesh(
      new THREE.ConeGeometry(0.017, 0.048, 5),
      new THREE.MeshStandardMaterial({ color: 0x285c1d, roughness: 0.90 }),
      MAX_TREES,
    )
    const iTrunk    = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.004, 0.006, 0.036, 5),
      new THREE.MeshStandardMaterial({ color: 0x4a3018, roughness: 1.00 }),
      MAX_TREES,
    )

    const dummy = new THREE.Object3D()
    const UP    = new THREE.Vector3(0, 1, 0)
    let tc = 0

    for (let i = 0; i < 2800 && tc < MAX_TREES; i++) {
      const lat = (rng(i * 3)     - 0.5) * 144
      const lon = (rng(i * 3 + 1) - 0.5) * 360
      const b   = biome(lat, lon)
      if (b !== 'land' && b !== 'tropical' && b !== 'tundra') continue

      const sc  = 0.7 + rng(i * 3 + 2) * 0.8
      const q   = new THREE.Quaternion().setFromUnitVectors(UP, ll(lat, lon).normalize())

      // Trunk
      dummy.position.copy(ll(lat, lon, SURF - 0.006))
      dummy.quaternion.copy(q)
      dummy.scale.setScalar(sc)
      dummy.updateMatrix()
      iTrunk.setMatrixAt(tc, dummy.matrix)

      // Lower foliage
      dummy.position.copy(ll(lat, lon, SURF + 0.018 * sc))
      dummy.scale.setScalar(sc)
      dummy.updateMatrix()
      iTreeLo.setMatrixAt(tc, dummy.matrix)

      // Upper foliage (smaller, offset higher)
      dummy.position.copy(ll(lat, lon, SURF + 0.038 * sc))
      dummy.scale.set(sc * 0.74, sc * 0.74, sc * 0.74)
      dummy.updateMatrix()
      iTreeHi.setMatrixAt(tc, dummy.matrix)

      tc++
    }

    iTreeLo.count = iTreeHi.count = iTrunk.count = tc
    iTreeLo.instanceMatrix.needsUpdate = true
    iTreeHi.instanceMatrix.needsUpdate = true
    iTrunk.instanceMatrix.needsUpdate  = true
    globeGroup.add(iTreeLo, iTreeHi, iTrunk)

    // ─────────────────────────────────────────────────────────────────────
    // 6 ▸ MOUNTAIN PEAKS — cone body + snow cap (InstancedMesh × 2)
    // ─────────────────────────────────────────────────────────────────────
    const MAX_PEAKS = 110
    const iPeak     = new THREE.InstancedMesh(
      new THREE.ConeGeometry(0.020, 0.065, 6),
      new THREE.MeshStandardMaterial({ color: 0x8c7b6a, roughness: 0.80 }),
      MAX_PEAKS,
    )
    const iSnow     = new THREE.InstancedMesh(
      new THREE.ConeGeometry(0.011, 0.027, 6),
      new THREE.MeshStandardMaterial({ color: 0xe0eaf2, roughness: 0.55 }),
      MAX_PEAKS,
    )
    let pc = 0

    for (let i = 0; i < 2000 && pc < MAX_PEAKS; i++) {
      const lat = (rng(i * 5 + 1000) - 0.5) * 140
      const lon = (rng(i * 5 + 1001) - 0.5) * 360
      if (!isMountain(lat, lon)) continue

      const sc  = 0.55 + rng(i * 5 + 1002) * 1.1
      const q   = new THREE.Quaternion().setFromUnitVectors(UP, ll(lat, lon).normalize())

      dummy.position.copy(ll(lat, lon, R + 0.033 * sc))
      dummy.quaternion.copy(q)
      dummy.scale.setScalar(sc)
      dummy.updateMatrix()
      iPeak.setMatrixAt(pc, dummy.matrix)

      dummy.position.copy(ll(lat, lon, R + 0.058 * sc))
      dummy.scale.setScalar(sc * 0.82)
      dummy.updateMatrix()
      iSnow.setMatrixAt(pc, dummy.matrix)

      pc++
    }

    iPeak.count = iSnow.count = pc
    iPeak.instanceMatrix.needsUpdate = true
    iSnow.instanceMatrix.needsUpdate = true
    globeGroup.add(iPeak, iSnow)

    // ─────────────────────────────────────────────────────────────────────
    // 7 ▸ CLOUDS — single InstancedMesh, grouped for independent rotation
    // ─────────────────────────────────────────────────────────────────────
    const MAX_CLOUDS  = 80
    const iClouds     = new THREE.InstancedMesh(
      new THREE.SphereGeometry(1, 6, 5),
      new THREE.MeshStandardMaterial({
        color: 0xf8fbff, transparent: true, opacity: 0.76,
        roughness: 1, depthWrite: false,
      }),
      MAX_CLOUDS,
    )
    const cloudGroup = new THREE.Group()
    globeGroup.add(cloudGroup)
    cloudGroup.add(iClouds)

    const CLOUD_SEEDS = [
      [ 28,-42],[ 54,-12],[  9, 62],[-22, 82],[ 42,112],
      [-34,-68],[ 66,-80],[ 18,-118],[  -2,178],[ 46, 32],
      [ -8, 22],[ 26,-64],[ 57, 78],[-28,132],[  14,-32],
    ]
    let cc = 0

    CLOUD_SEEDS.forEach(([clat, clon], ci) => {
      const cPos  = ll(clat, clon, ATM * 0.99)
      const nrm   = cPos.clone().normalize()
      const right = new THREE.Vector3(0, 1, 0).cross(nrm)
      if (right.length() < 0.01) right.set(1, 0, 0).cross(nrm)
      right.normalize()
      const fwd = nrm.clone().cross(right).normalize()

      const blobs = 3 + Math.floor(rng(ci * 7) * 3)
      for (let b = 0; b < blobs && cc < MAX_CLOUDS; b++) {
        const ox = (rng(ci*7+b+1) - 0.5) * 0.11
        const oy =  rng(ci*7+b+2) * 0.012
        const oz = (rng(ci*7+b+3) - 0.5) * 0.09
        const sc =  0.030 + rng(ci*7+b+4) * 0.044

        dummy.position.copy(cPos)
          .addScaledVector(right, ox)
          .addScaledVector(nrm, oy + 0.006)
          .addScaledVector(fwd, oz)
        dummy.rotation.set(0, 0, 0)
        dummy.scale.setScalar(sc)
        dummy.updateMatrix()
        iClouds.setMatrixAt(cc, dummy.matrix)
        cc++
      }
    })

    iClouds.count = cc
    iClouds.instanceMatrix.needsUpdate = true

    // ─────────────────────────────────────────────────────────────────────
    // 8 ▸ SECTION MARKERS — gold sphere + pulsing ring + pin stem
    // ─────────────────────────────────────────────────────────────────────
    const matRing = new THREE.MeshBasicMaterial({
      color: 0xffd740, transparent: true, opacity: 0.55, side: THREE.DoubleSide,
    })
    const matStem = new THREE.MeshStandardMaterial({ color: 0xffd740, roughness: 0.45 })

    const markerMeshes = SECTION_POINTS.map((pt) => {
      const ballPos  = ll(pt.lat, pt.lon, SURF + 0.046)
      const stemPos  = ll(pt.lat, pt.lon, SURF + 0.014)
      const nrm      = stemPos.clone().normalize()

      // Main sphere (cloned mat so emissiveIntensity is per-marker)
      const matBall  = new THREE.MeshStandardMaterial({
        color: 0xfef8e8, emissive: 0xffd740, emissiveIntensity: 0.85, roughness: 0.25,
      })
      const ball = new THREE.Mesh(new THREE.SphereGeometry(0.052, 14, 14), matBall)
      ball.position.copy(ballPos)
      ball.userData = { id: pt.id, label: pt.label }
      globeGroup.add(ball)

      // Pulsing ring (cloned mat so opacity is per-marker)
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.065, 0.090, 32), matRing.clone())
      ring.position.copy(ballPos)
      ring.lookAt(0, 0, 0)
      globeGroup.add(ring)

      // Pin stem
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.0040, 0.0028, 0.050, 5), matStem)
      stem.position.copy(stemPos)
      stem.quaternion.setFromUnitVectors(UP, nrm)
      globeGroup.add(stem)

      return { ball, ring }
    })

    // ─────────────────────────────────────────────────────────────────────
    // 9 ▸ LIGHTS
    // ─────────────────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.42))

    const sun = new THREE.DirectionalLight(0xfff3cc, 1.90)
    sun.position.set(3.5, 2.2, 4.0)
    scene.add(sun)

    const fill = new THREE.DirectionalLight(0xaac4ff, 0.36)
    fill.position.set(-3.0, -1.5, -2.0)
    scene.add(fill)

    const rim = new THREE.PointLight(0xc8dce8, 1.15, 14, 2)
    rim.position.set(-4, -2, 3)
    scene.add(rim)

    // ─────────────────────────────────────────────────────────────────────
    // 10 ▸ STAR PARTICLES
    // ─────────────────────────────────────────────────────────────────────
    const starBuf = new Float32Array(220 * 3)
    for (let i = 0; i < 220; i++) {
      starBuf[i*3]   = (Math.random() - 0.5) * 20
      starBuf[i*3+1] = (Math.random() - 0.5) * 14
      starBuf[i*3+2] = (Math.random() - 0.5) * 14
    }
    const starGeo = new THREE.BufferGeometry()
    starGeo.setAttribute('position', new THREE.BufferAttribute(starBuf, 3))
    const stars = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({
        color: 0xddeeff, size: 0.026, transparent: true, opacity: 0.50, depthWrite: false,
      }),
    )
    scene.add(stars)

    // ─────────────────────────────────────────────────────────────────────
    // 11 ▸ INTERACTION STATE
    // ─────────────────────────────────────────────────────────────────────
    const ptr    = new THREE.Vector2()
    const ptrT   = new THREE.Vector2()
    const ray    = new THREE.Raycaster()
    let hovered  = null
    let isDragging = false, dragMoved = false
    let dragSX = 0, dragSY = 0
    let yaw = 0, pitch = 0, yawT = 0, pitchT = 0, dragYaw = 0, dragPitch = 0

    // Camera rig (same Bezier system as original)
    const rig = {
      cur:  new THREE.Vector3(0, 0, 6),
      tgt:  new THREE.Vector3(0, 0, 6),
      ride: {
        on: false, t: 0, dur: 1.2,
        s: new THREE.Vector3(0, 0, 6),
        c: new THREE.Vector3(0, 0, 6),
        e: new THREE.Vector3(0, 0, 6),
        bank: 0,
      },
    }

    const DESTINATIONS = {
      skills:   new THREE.Vector3( 2.2,  0.8, 4.0),
      projects: new THREE.Vector3(-1.7,  0.9, 4.1),
      contact:  new THREE.Vector3( 0.5, -1.5, 4.2),
    }

    const updatePtr = (cx, cy) => {
      const rc = mount.getBoundingClientRect()
      ptrT.x =  ((cx - rc.left) / rc.width)  * 2 - 1
      ptrT.y = -((cy - rc.top)  / rc.height) * 2 + 1
    }

    const focusSection = (id) => {
      const end = DESTINATIONS[id]
      if (!end) return
      const r = rig.ride
      r.on = true; r.t = 0
      r.s.copy(rig.cur)
      r.e.copy(end)
      // Elevated midpoint → smooth motorcycle arc
      r.c.copy(r.s).lerp(r.e, 0.5).add(new THREE.Vector3(0, 1.0, -0.4))
      r.bank = THREE.MathUtils.clamp((r.e.x - r.s.x) * 0.12, -0.22, 0.22)
    }

    const onMM = (e) => {
      updatePtr(e.clientX, e.clientY)
      if (!isDragging) return
      if (Math.abs(e.clientX - dragSX) + Math.abs(e.clientY - dragSY) > 4) dragMoved = true
      yawT   = dragYaw   + (e.clientX - dragSX) * 0.004
      pitchT = THREE.MathUtils.clamp(dragPitch + (e.clientY - dragSY) * 0.004, -0.5, 0.5)
    }
    const onMD = (e) => {
      isDragging = true; dragMoved = false
      dragSX = e.clientX; dragSY = e.clientY
      dragYaw = yawT; dragPitch = pitchT
    }
    const onMU  = ()  => { isDragging = false }
    const onML  = ()  => { ptrT.set(0, 0); hovered = null; isDragging = false }
    const onCLK = ()  => { if (!dragMoved && hovered) focusSection(hovered.userData.id) }

    mount.addEventListener('mousemove',  onMM)
    mount.addEventListener('mousedown',  onMD)
    mount.addEventListener('mouseup',    onMU)
    mount.addEventListener('mouseleave', onML)
    mount.addEventListener('click',      onCLK)

    // ─────────────────────────────────────────────────────────────────────
    // 12 ▸ ANIMATION LOOP
    // ─────────────────────────────────────────────────────────────────────
    const clock = new THREE.Clock()
    const rP    = new THREE.Vector3()
    const rF    = new THREE.Vector3()
    let fid

    const animate = () => {
      fid = requestAnimationFrame(animate)
      const dt = Math.min(clock.getDelta(), 0.033)
      const t  = clock.elapsedTime

      // Pointer smooth-follow
      ptr.x += (ptrT.x - ptr.x) * 0.08
      ptr.y += (ptrT.y - ptr.y) * 0.08

      // Marker hover detection
      ray.setFromCamera(ptr, camera)
      const hits = ray.intersectObjects(markerMeshes.map(m => m.ball), false)
      hovered = hits.length > 0 ? hits[0].object : null
      mount.style.cursor = hovered ? 'pointer' : 'grab'

      // Globe auto-spin + drag rotation
      yawT += 0.0015
      yaw  += (yawT - yaw)   * 0.08
      pitch += (pitchT - pitch) * 0.08
      globeGroup.rotation.y = yaw
      globeGroup.rotation.x = pitch

      // Marker scale + ring pulse animations
      markerMeshes.forEach(({ ball, ring }, i) => {
        const isHov = ball === hovered
        const ts    = isHov ? 1.60 : 1
        ball.scale.lerp(new THREE.Vector3(ts, ts, ts), 0.14)
        ball.material.emissiveIntensity +=
          ((isHov ? 1.25 : 0.85) - ball.material.emissiveIntensity) * 0.14

        const p = 1 + Math.sin(t * 2.4 + i * 1.6) * 0.14
        ring.scale.setScalar(p)
        ring.material.opacity = 0.28 + Math.sin(t * 2.4 + i * 1.6) * 0.22
      })

      // Cloud layer drifts slightly faster than globe
      cloudGroup.rotation.y = t * 0.011

      // Stars drift
      stars.rotation.y = t * 0.006

      // ── Camera Bezier ride (same logic as original) ──
      const r = rig.ride
      if (r.on) {
        r.t = Math.min(1, r.t + dt / r.dur)
        const e  = 1 - Math.pow(1 - r.t, 3)
        const e2 = Math.min(1, e + 0.03)

        rP.copy(r.s).multiplyScalar((1-e)*(1-e))
          .addScaledVector(r.c, 2*(1-e)*e)
          .addScaledVector(r.e, e*e)

        rF.copy(r.s).multiplyScalar((1-e2)*(1-e2))
          .addScaledVector(r.c, 2*(1-e2)*e2)
          .addScaledVector(r.e, e2*e2)

        rig.cur.copy(rP)
        camera.position.copy(rig.cur)
        camera.lookAt(rF)
        camera.rotation.z = Math.sin(e * Math.PI) * r.bank

        if (r.t >= 1) { r.on = false; rig.tgt.copy(r.e) }
      } else {
        camera.rotation.z *= 0.9
        rig.cur.x += (rig.tgt.x + ptr.x * 0.20 - rig.cur.x) * 0.06
        rig.cur.y += (rig.tgt.y + ptr.y * 0.16 - rig.cur.y) * 0.06
        rig.cur.z += (rig.tgt.z - rig.cur.z) * 0.06
        camera.position.copy(rig.cur)
        camera.lookAt(0, 0, 0)
      }

      renderer.render(scene, camera)
    }
    animate()

    // ── Resize handler ──────────────────────────────────────────────────
    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mount.clientWidth, mount.clientHeight)
    }
    window.addEventListener('resize', onResize)

    // ── Cleanup ─────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(fid)
      mount.removeEventListener('mousemove',  onMM)
      mount.removeEventListener('mousedown',  onMD)
      mount.removeEventListener('mouseup',    onMU)
      mount.removeEventListener('mouseleave', onML)
      mount.removeEventListener('click',      onCLK)
      window.removeEventListener('resize',    onResize)
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
}