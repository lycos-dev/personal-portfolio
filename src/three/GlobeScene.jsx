import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// ─── Constants ───────────────────────────────────────────────────────────────
const R    = 1.40
const SURF = R + 0.013
const ROAD = R + 0.009
const ATM  = R * 1.082

// ─── Section markers ─────────────────────────────────────────────────────────
const SECTION_POINTS = [
  { id: 'skills',   label: 'Skills',   lat:  25, lon:  45 },
  { id: 'projects', label: 'Projects', lat:  42, lon: -95 },
  { id: 'contact',  label: 'Contact',  lat: -14, lon: -48 },
]

// ─── Road routes ─────────────────────────────────────────────────────────────
const ROUTES = [
  [[25,45],[45,20],[48,-10],[44,-65],[42,-95]],
  [[42,-95],[26,-88],[11,-76],[-5,-63],[-14,-48]],
  [[-14,-48],[-10,14],[6,22],[17,35],[25,45]],
  [[42,-95],[44,-112],[44,-124]],
  [[25,45],[22,72],[16,100],[6,105]],
]

// ─── Geo helpers ──────────────────────────────────────────────────────────────
function ll(lat, lon, r = R) {
  const φ = (90 - lat) * Math.PI / 180
  const θ = (lon + 180) * Math.PI / 180
  return new THREE.Vector3(
    -r * Math.sin(φ) * Math.cos(θ),
     r * Math.cos(φ),
     r * Math.sin(φ) * Math.sin(θ),
  )
}

function arcSeg(a, b, steps, r) {
  const pts = []
  for (let i = 0; i <= steps; i++)
    pts.push(a.clone().lerp(b, i / steps).normalize().multiplyScalar(r))
  return pts
}

function routePts(waypoints, r = ROAD) {
  const nodes = waypoints.map(([la, lo]) => ll(la, lo))
  let out = []
  for (let i = 0; i < nodes.length - 1; i++)
    out = out.concat(arcSeg(nodes[i], nodes[i + 1], 30, r))
  return out
}

// ─── Deterministic RNG ───────────────────────────────────────────────────────
function rng(n) {
  const s = Math.sin(n * 9301.0 + 49297.0) * 233280.0
  return s - Math.floor(s)
}

// ─── Biome helpers ────────────────────────────────────────────────────────────
function isLand(lat, lon) {
  if (lat > 12  && lat < 72  && lon > -170 && lon < -52)  return true
  if (lat > 60  && lat < 85  && lon > -58  && lon < -17)  return true
  if (lat > -57 && lat < 13  && lon > -82  && lon < -33)  return true
  if (lat > 35  && lat < 72  && lon > -12  && lon < 40)   return true
  if (lat > -36 && lat < 38  && lon > -18  && lon < 52)   return true
  if (lat > 1   && lat < 77  && lon > 26   && lon < 145)  return true
  if (lat > -8  && lat < 23  && lon > 95   && lon < 141)  return true
  if (lat > -44 && lat < -10 && lon > 113  && lon < 154)  return true
  if (lat < -68)                                           return true
  return false
}

function isMountain(lat, lon) {
  if (lat > 30 && lat < 62 && lon > -126 && lon < -110) return true
  if (lat > -50 && lat < 5 && lon > -79  && lon < -63)  return true
  if (lat > 43 && lat < 49 && lon > 5   && lon < 17)   return true
  if (lat > 26 && lat < 38 && lon > 73  && lon < 102)  return true
  return false
}

function isDesert(lat, lon) {
  if (lat > 14 && lat < 34 && lon > -18 && lon < 40)    return true
  if (lat > 11 && lat < 34 && lon > 35  && lon < 61)    return true
  if (lat > -33 && lat < -17 && lon > 117 && lon < 143) return true
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

const BIOME_COL = {
  ocean:    [0.04, 0.11, 0.23],
  snow:     [0.83, 0.90, 0.94],
  land:     [0.17, 0.43, 0.15],
  tropical: [0.10, 0.52, 0.14],
  tundra:   [0.36, 0.44, 0.35],
  mountain: [0.55, 0.50, 0.43],
  desert:   [0.76, 0.62, 0.26],
}

const BIOME_ELEV = {
  ocean: -0.008, land: 0.011, tropical: 0.013,
  tundra: 0.009, desert: 0.007, mountain: 0.032, snow: 0.014,
}

// ─── Lat/lon ↔ degrees conversion helpers ────────────────────────────────────
const DEG = Math.PI / 180
const RAD = 180 / Math.PI

// Move a lat/lon by (dlat, dlon) in degrees, clamped
function moveLoc(lat, lon, dlat, dlon) {
  return {
    lat: THREE.MathUtils.clamp(lat + dlat, -85, 85),
    lon: ((lon + dlon + 540) % 360) - 180,
  }
}

// Great-circle bearing from (lat1,lon1) → (lat2,lon2) in radians
function bearing(lat1, lon1, lat2, lon2) {
  const φ1 = lat1 * DEG, φ2 = lat2 * DEG
  const Δλ = (lon2 - lon1) * DEG
  const y = Math.sin(Δλ) * Math.cos(φ2)
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)
  return Math.atan2(y, x)   // radians, 0 = North, clockwise
}

// Great-circle distance in degrees
function gcDist(lat1, lon1, lat2, lon2) {
  const φ1 = lat1 * DEG, φ2 = lat2 * DEG
  const Δφ = φ2 - φ1, Δλ = (lon2 - lon1) * DEG
  const a = Math.sin(Δφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2
  return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) * RAD
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function GlobeScene() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    // ── Renderer ───────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    // ── Scene / Camera ─────────────────────────────────────────────────────
    const scene      = new THREE.Scene()
    const camera     = new THREE.PerspectiveCamera(52, mount.clientWidth / mount.clientHeight, 0.1, 100)
    camera.position.set(0, 0, 6)
    const globeGroup = new THREE.Group()
    scene.add(globeGroup)

    // ── 1 ▸ GLOBE ──────────────────────────────────────────────────────────
    const SEG      = 92
    const geoGlobe = new THREE.SphereGeometry(R, SEG, SEG)
    const gPos     = geoGlobe.attributes.position
    const gCol     = new Float32Array(gPos.count * 3)

    for (let i = 0; i < gPos.count; i++) {
      const x = gPos.getX(i), y = gPos.getY(i), z = gPos.getZ(i)
      const lat = Math.asin(THREE.MathUtils.clamp(y / R, -1, 1)) * RAD
      let θv    = Math.atan2(z, -x)
      if (θv < 0) θv += 2 * Math.PI
      const lon = θv * RAD - 180
      const b   = biome(lat, lon)
      const col = BIOME_COL[b]
      const noise = rng(i) * 0.5 - 0.25
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

    // ── 2 ▸ ATMOSPHERE ─────────────────────────────────────────────────────
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

    // ── 3 ▸ WIREFRAME OVERLAY ──────────────────────────────────────────────
    globeGroup.add(new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.002, 22, 22),
      new THREE.MeshBasicMaterial({
        color: 0x7799bb, wireframe: true, transparent: true, opacity: 0.055,
      }),
    ))

    // ── 4 ▸ ROADS ──────────────────────────────────────────────────────────
    const matRoadBody = new THREE.MeshStandardMaterial({ color: 0x1c1a16, roughness: 0.96 })
    const matRoadLine = new THREE.MeshStandardMaterial({
      color: 0xc8b870, transparent: true, opacity: 0.60, roughness: 0.9,
    })
    ROUTES.forEach((route) => {
      const pts  = routePts(route, ROAD + 0.002)
      const crv  = new THREE.CatmullRomCurve3(pts)
      globeGroup.add(new THREE.Mesh(
        new THREE.TubeGeometry(crv, pts.length * 2, 0.006, 4, false), matRoadBody,
      ))
      const pts2 = routePts(route, ROAD + 0.004)
      const crv2 = new THREE.CatmullRomCurve3(pts2)
      globeGroup.add(new THREE.Mesh(
        new THREE.TubeGeometry(crv2, pts.length * 2, 0.0014, 3, false), matRoadLine,
      ))
    })

    // ── 5 ▸ TREES ──────────────────────────────────────────────────────────
    const MAX_TREES = 300
    const iTreeLo   = new THREE.InstancedMesh(
      new THREE.ConeGeometry(0.024, 0.060, 5),
      new THREE.MeshStandardMaterial({ color: 0x1d4a16, roughness: 0.90 }), MAX_TREES)
    const iTreeHi   = new THREE.InstancedMesh(
      new THREE.ConeGeometry(0.017, 0.048, 5),
      new THREE.MeshStandardMaterial({ color: 0x285c1d, roughness: 0.90 }), MAX_TREES)
    const iTrunk    = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.004, 0.006, 0.036, 5),
      new THREE.MeshStandardMaterial({ color: 0x4a3018, roughness: 1.00 }), MAX_TREES)

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
      dummy.position.copy(ll(lat, lon, SURF - 0.006))
      dummy.quaternion.copy(q); dummy.scale.setScalar(sc); dummy.updateMatrix()
      iTrunk.setMatrixAt(tc, dummy.matrix)
      dummy.position.copy(ll(lat, lon, SURF + 0.018 * sc))
      dummy.scale.setScalar(sc); dummy.updateMatrix()
      iTreeLo.setMatrixAt(tc, dummy.matrix)
      dummy.position.copy(ll(lat, lon, SURF + 0.038 * sc))
      dummy.scale.set(sc * 0.74, sc * 0.74, sc * 0.74); dummy.updateMatrix()
      iTreeHi.setMatrixAt(tc, dummy.matrix)
      tc++
    }
    iTreeLo.count = iTreeHi.count = iTrunk.count = tc
    iTreeLo.instanceMatrix.needsUpdate = true
    iTreeHi.instanceMatrix.needsUpdate = true
    iTrunk.instanceMatrix.needsUpdate  = true
    globeGroup.add(iTreeLo, iTreeHi, iTrunk)

    // ── 6 ▸ MOUNTAIN PEAKS ────────────────────────────────────────────────
    const MAX_PEAKS = 110
    const iPeak     = new THREE.InstancedMesh(
      new THREE.ConeGeometry(0.020, 0.065, 6),
      new THREE.MeshStandardMaterial({ color: 0x8c7b6a, roughness: 0.80 }), MAX_PEAKS)
    const iSnow     = new THREE.InstancedMesh(
      new THREE.ConeGeometry(0.011, 0.027, 6),
      new THREE.MeshStandardMaterial({ color: 0xe0eaf2, roughness: 0.55 }), MAX_PEAKS)
    let pc = 0

    for (let i = 0; i < 2000 && pc < MAX_PEAKS; i++) {
      const lat = (rng(i * 5 + 1000) - 0.5) * 140
      const lon = (rng(i * 5 + 1001) - 0.5) * 360
      if (!isMountain(lat, lon)) continue
      const sc  = 0.55 + rng(i * 5 + 1002) * 1.1
      const q   = new THREE.Quaternion().setFromUnitVectors(UP, ll(lat, lon).normalize())
      dummy.position.copy(ll(lat, lon, R + 0.033 * sc))
      dummy.quaternion.copy(q); dummy.scale.setScalar(sc); dummy.updateMatrix()
      iPeak.setMatrixAt(pc, dummy.matrix)
      dummy.position.copy(ll(lat, lon, R + 0.058 * sc))
      dummy.scale.setScalar(sc * 0.82); dummy.updateMatrix()
      iSnow.setMatrixAt(pc, dummy.matrix)
      pc++
    }
    iPeak.count = iSnow.count = pc
    iPeak.instanceMatrix.needsUpdate = true
    iSnow.instanceMatrix.needsUpdate = true
    globeGroup.add(iPeak, iSnow)

    // ── 7 ▸ CLOUDS ────────────────────────────────────────────────────────
    const MAX_CLOUDS  = 80
    const iClouds     = new THREE.InstancedMesh(
      new THREE.SphereGeometry(1, 6, 5),
      new THREE.MeshStandardMaterial({
        color: 0xf8fbff, transparent: true, opacity: 0.76,
        roughness: 1, depthWrite: false,
      }), MAX_CLOUDS)
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
        dummy.rotation.set(0, 0, 0); dummy.scale.setScalar(sc); dummy.updateMatrix()
        iClouds.setMatrixAt(cc, dummy.matrix); cc++
      }
    })
    iClouds.count = cc
    iClouds.instanceMatrix.needsUpdate = true

    // ── 8 ▸ SECTION MARKERS ───────────────────────────────────────────────
    const matRing = new THREE.MeshBasicMaterial({
      color: 0xffd740, transparent: true, opacity: 0.55, side: THREE.DoubleSide,
    })
    const matStem = new THREE.MeshStandardMaterial({ color: 0xffd740, roughness: 0.45 })

    const markerMeshes = SECTION_POINTS.map((pt) => {
      const ballPos = ll(pt.lat, pt.lon, SURF + 0.046)
      const stemPos = ll(pt.lat, pt.lon, SURF + 0.014)
      const nrm     = stemPos.clone().normalize()
      const matBall = new THREE.MeshStandardMaterial({
        color: 0xfef8e8, emissive: 0xffd740, emissiveIntensity: 0.85, roughness: 0.25,
      })
      const ball = new THREE.Mesh(new THREE.SphereGeometry(0.052, 14, 14), matBall)
      ball.position.copy(ballPos)
      ball.userData = { id: pt.id, label: pt.label, lat: pt.lat, lon: pt.lon }
      globeGroup.add(ball)

      const ring = new THREE.Mesh(new THREE.RingGeometry(0.065, 0.090, 32), matRing.clone())
      ring.position.copy(ballPos); ring.lookAt(0, 0, 0)
      globeGroup.add(ring)

      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.0040, 0.0028, 0.050, 5), matStem)
      stem.position.copy(stemPos)
      stem.quaternion.setFromUnitVectors(UP, nrm)
      globeGroup.add(stem)

      return { ball, ring, pt }
    })

    // ── 9 ▸ MOTORCYCLE MESH ───────────────────────────────────────────────
    //   Built from primitives: body + wheels + handlebars
    const motoGroup = new THREE.Group()
    globeGroup.add(motoGroup)

    const matChrome  = new THREE.MeshStandardMaterial({ color: 0xd4d8e0, metalness: 0.9, roughness: 0.15 })
    const matBlack   = new THREE.MeshStandardMaterial({ color: 0x111114, roughness: 0.6  })
    const matAccent  = new THREE.MeshStandardMaterial({ color: 0xff6030, metalness: 0.7, roughness: 0.2  })
    const matHeadlt  = new THREE.MeshStandardMaterial({ color: 0xfff8e0, emissive: 0xffdd88, emissiveIntensity: 1.2 })

    // Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.016, 0.068), matAccent)
    body.position.set(0, 0.018, 0)
    motoGroup.add(body)

    // Fairing / nose
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.014, 0.032, 6), matAccent)
    nose.rotation.x = -Math.PI / 2
    nose.position.set(0, 0.018, -0.046)
    motoGroup.add(nose)

    // Seat hump
    const hump = new THREE.Mesh(new THREE.SphereGeometry(0.013, 8, 6), matBlack)
    hump.scale.set(0.85, 0.7, 1.4)
    hump.position.set(0, 0.026, 0.018)
    motoGroup.add(hump)

    // Fuel tank
    const tank = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 6), matChrome)
    tank.scale.set(0.9, 0.7, 1.5)
    tank.position.set(0, 0.024, -0.010)
    motoGroup.add(tank)

    // Front wheel
    const wGeo = new THREE.TorusGeometry(0.020, 0.005, 8, 18)
    const frontWheel = new THREE.Mesh(wGeo, matBlack)
    frontWheel.rotation.y = Math.PI / 2
    frontWheel.position.set(0, 0, -0.048)
    motoGroup.add(frontWheel)

    // Rear wheel
    const rearWheel = new THREE.Mesh(wGeo.clone(), matBlack)
    rearWheel.rotation.y = Math.PI / 2
    rearWheel.position.set(0, 0, 0.046)
    motoGroup.add(rearWheel)

    // Handlebar
    const hbGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.034, 6)
    const hb    = new THREE.Mesh(hbGeo, matChrome)
    hb.rotation.z = Math.PI / 2
    hb.position.set(0, 0.026, -0.030)
    motoGroup.add(hb)

    // Headlight
    const headlight = new THREE.Mesh(new THREE.SphereGeometry(0.009, 8, 6), matHeadlt)
    headlight.position.set(0, 0.018, -0.058)
    motoGroup.add(headlight)

    // Exhaust pipe
    const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.004, 0.038, 6), matChrome)
    exhaust.rotation.z = Math.PI / 2
    exhaust.position.set(0.018, 0.004, 0.020)
    motoGroup.add(exhaust)

    // Point light on headlight
    const headlightPt = new THREE.PointLight(0xffe8a0, 1.8, 0.6, 2)
    headlightPt.position.set(0, 0.02, -0.07)
    motoGroup.add(headlightPt)

    // ── 10 ▸ LIGHTS ────────────────────────────────────────────────────────
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

    // ── 11 ▸ STAR PARTICLES ────────────────────────────────────────────────
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
      new THREE.PointsMaterial({ color: 0xddeeff, size: 0.026, transparent: true, opacity: 0.50, depthWrite: false }),
    )
    scene.add(stars)

    // ═══════════════════════════════════════════════════════════════════════
    // 12 ▸ MOTORCYCLE CONTROLLER
    // ═══════════════════════════════════════════════════════════════════════
    //
    // State lives in a plain object — no React state, only mutated in the
    // animation loop to avoid re-renders.
    //
    // Coordinate system:
    //   lat/lon — bike position on the globe
    //   heading — angle in radians (0 = North, clockwise)
    //   speed   — current linear speed in deg/s (globe-surface degrees)
    //
    // Each frame:
    //   1. Read keys → adjust heading & speed
    //   2. Integrate position:  lat += cos(heading)*speed*dt,  lon += sin(heading)*speed*dt / cos(lat)
    //   3. Place motoGroup: position = ll(lat, lon, SURF+offset), orientation via quaternion from
    //      surface-normal (up) × forward-tangent
    //   4. Camera offset = behind + above in local surface frame, lerped with spring
    //   5. camera.rotation.z = –turnRate * bankScale  (lean effect)
    //
    // Autopilot (marker click):
    //   Sets bike.autopilot = { targetLat, targetLon }
    //   Each frame steers heading toward great-circle bearing to target,
    //   speeds up then brakes as it approaches, clears when within 0.5°.

    const bike = {
      lat: 25, lon: 45,         // start at Skills marker
      heading: 0,               // radians, 0 = North
      speed: 0,                 // deg/s
      turnRate: 0,              // radians/s (for bank lean)
      wheelAngle: 0,            // accumulated wheel spin
      autopilot: null,          // { targetLat, targetLon }
    }

    const keys = { w: false, s: false, a: false, d: false,
                   ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false }

    const onKeyDown = (e) => { if (e.key in keys) { keys[e.key] = true; e.preventDefault() } }
    const onKeyUp   = (e) => { if (e.key in keys) { keys[e.key] = false } }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup',   onKeyUp)

    // ── Marker click → autopilot ─────────────────────────────────────────
    const ray = new THREE.Raycaster()
    const ptr = new THREE.Vector2()
    const onCLK = (e) => {
      const rc = mount.getBoundingClientRect()
      ptr.x =  ((e.clientX - rc.left) / rc.width)  * 2 - 1
      ptr.y = -((e.clientY - rc.top)  / rc.height) * 2 + 1
      ray.setFromCamera(ptr, camera)
      const hits = ray.intersectObjects(markerMeshes.map(m => m.ball), false)
      if (hits.length > 0) {
        const { lat, lon } = hits[0].object.userData
        bike.autopilot = { targetLat: lat, targetLon: lon }
        bike.speed = Math.max(bike.speed, 3) // ensure moving
      }
    }
    mount.addEventListener('click', onCLK)
    mount.style.cursor = 'pointer'

    // ── Camera spring state ───────────────────────────────────────────────
    const camPos    = new THREE.Vector3(0, 0, 6)  // smoothed camera world position
    const camLookAt = new THREE.Vector3()          // smoothed look-at target
    const bankAngle = { cur: 0 }                   // smoothed z-roll

    // ── Reusable vectors (avoid GC) ───────────────────────────────────────
    const surfNormal  = new THREE.Vector3()
    const northTan    = new THREE.Vector3()
    const eastTan     = new THREE.Vector3()
    const bikeForward = new THREE.Vector3()
    const bikeRight   = new THREE.Vector3()
    const bikePos     = new THREE.Vector3()
    const camTarget   = new THREE.Vector3()
    const lookTarget  = new THREE.Vector3()

    // ── Throttle / brake constants ────────────────────────────────────────
    const ACCEL       = 12    // deg/s²
    const BRAKE       = 18    // deg/s²
    const DRAG        = 5     // deg/s² passive friction
    const MAX_SPEED   = 22    // deg/s
    const TURN_SPEED  = 95    // deg/s at full speed (scales with speed)

    // Camera rig offsets (in local bike frame, globe-surface space)
    const CAM_BACK   = 0.30   // metres behind bike (globe units ≈ degrees*R*π/180)
    const CAM_UP     = 0.14   // metres above surface
    const CAM_SPRING = 0.07   // lerp factor per frame (~60fps feel)
    const BANK_SCALE = 0.40   // max roll radians

    // ── Animation loop ────────────────────────────────────────────────────
    const clock = new THREE.Clock()
    let fid

    const animate = () => {
      fid = requestAnimationFrame(animate)
      const dt = Math.min(clock.getDelta(), 0.033)
      const t  = clock.elapsedTime

      // ── A. Input / Autopilot ────────────────────────────────────────────
      const forward = keys.w || keys.ArrowUp
      const back    = keys.s || keys.ArrowDown
      const left    = keys.a || keys.ArrowLeft
      const right   = keys.d || keys.ArrowRight

      let desiredTurn = 0

      if (bike.autopilot) {
        const { targetLat, targetLon } = bike.autopilot
        const dist = gcDist(bike.lat, bike.lon, targetLat, targetLon)

        if (dist < 0.5) {
          // Arrived
          bike.autopilot = null
          bike.speed *= 0.3
        } else {
          // Steer toward target
          const tgtBearing = bearing(bike.lat, bike.lon, targetLat, targetLon)
          // Smallest angle diff
          let diff = tgtBearing - bike.heading
          while (diff >  Math.PI) diff -= 2 * Math.PI
          while (diff < -Math.PI) diff += 2 * Math.PI
          desiredTurn = THREE.MathUtils.clamp(diff * 3.5, -1, 1)

          // Speed: ramp up, then brake within 4°
          const targetSpeed = dist < 4 ? THREE.MathUtils.mapLinear(dist, 0.5, 4, 2, MAX_SPEED * 0.7) : MAX_SPEED * 0.85
          if (bike.speed < targetSpeed) bike.speed = Math.min(targetSpeed, bike.speed + ACCEL * dt)
          else                          bike.speed = Math.max(targetSpeed, bike.speed - BRAKE * dt)
        }
      } else {
        // Manual input
        if (forward) bike.speed = Math.min(MAX_SPEED, bike.speed + ACCEL * dt)
        if (back)    bike.speed = Math.max(0,         bike.speed - BRAKE * dt)
        if (!forward && !back) bike.speed = Math.max(0, bike.speed - DRAG * dt)
        if (left)  desiredTurn = -1
        if (right) desiredTurn =  1
      }

      // ── B. Heading & position integration ──────────────────────────────
      const speedFrac   = bike.speed / MAX_SPEED
      const turnDegPerS = TURN_SPEED * speedFrac * desiredTurn * DEG
      bike.heading     += turnDegPerS * dt
      bike.turnRate     = turnDegPerS  // stored for bank

      // Surface integration in degrees
      //   Δlat = cos(heading) * speed * dt
      //   Δlon = sin(heading) * speed * dt / cos(lat)   (account for meridian convergence)
      const cosLat = Math.cos(bike.lat * DEG) || 0.001
      bike.lat += Math.cos(bike.heading) * bike.speed * dt
      bike.lon += Math.sin(bike.heading) * bike.speed * dt / cosLat
      bike.lat  = THREE.MathUtils.clamp(bike.lat, -85, 85)
      bike.lon  = ((bike.lon + 540) % 360) - 180

      // Wheel spin
      bike.wheelAngle += bike.speed * dt * 6

      // ── C. Place motorcycle on globe ────────────────────────────────────
      //   surface normal at bike position
      bikePos.copy(ll(bike.lat, bike.lon, SURF + 0.020))
      surfNormal.copy(ll(bike.lat, bike.lon)).normalize()

      // Tangent vectors: north = ∂/∂lat, east = ∂/∂lon
      const latR = bike.lat * DEG
      const lonR = bike.lon * DEG
      northTan.set(
        Math.cos(latR) * Math.cos(lonR + Math.PI),  // ∂x/∂lat (note our x-flip)
        -Math.sin(latR),
        Math.cos(latR) * Math.sin(lonR + Math.PI),
      ).negate().normalize()   // pointing toward pole = north on sphere
      // East is orthogonal in the tangent plane
      eastTan.crossVectors(surfNormal, northTan).normalize()

      // Forward direction in world space from heading angle
      bikeForward.copy(northTan).multiplyScalar(Math.cos(bike.heading))
                 .addScaledVector(eastTan, Math.sin(bike.heading))
      bikeRight.crossVectors(bikeForward, surfNormal).negate()

      // Build orientation quaternion: bike faces forward, up = surface normal
      const motoMat = new THREE.Matrix4().makeBasis(bikeRight, surfNormal, bikeForward.clone().negate())
      motoGroup.position.copy(bikePos)
      motoGroup.quaternion.setFromRotationMatrix(motoMat)

      // Wheel spin animation
      frontWheel.rotation.x = bike.wheelAngle
      rearWheel.rotation.x  = bike.wheelAngle

      // Lean into turns (rotate around forward axis)
      const leanAngle = -bike.turnRate * speedFrac * 0.18
      motoGroup.rotateOnAxis(bikeForward.clone().normalize(), leanAngle)

      // ── D. Globe group orientation — keep bike visible ──────────────────
      //   We rotate the *globe* so the bike position is always facing the camera,
      //   not the camera chasing the bike in world space.
      //
      //   Target globe rotation: bike sits at (0,0,R) in globe-local = facing camera.
      //   We compute the quaternion that rotates bikePos (globe-local) onto +Z (camera axis).
      //
      //   This is the "globe-follows-bike" pattern used instead of moving camera around globe.

      const bikePosLocal = ll(bike.lat, bike.lon).normalize()
      const cameraAxis   = new THREE.Vector3(0, 0, 1)
      const globeQ       = new THREE.Quaternion().setFromUnitVectors(bikePosLocal, cameraAxis)

      // Also align heading upward (north = screen up)
      // We do a secondary rotation around Z to keep orientation readable
      globeGroup.quaternion.slerp(globeQ, 0.045)

      // ── E. Camera — follow behind & above bike ──────────────────────────
      //   In world space, the bike is near (0,0,R·scale) after globe rotation.
      //   Camera target = bikeWorldPos + backVec + upVec in world space.
      //   We compute this from globe's current transform.

      const bikeWorldPos = new THREE.Vector3()
      motoGroup.getWorldPosition(bikeWorldPos)

      // World-space surface normal (after globe rotation)
      const worldNormal = surfNormal.clone().applyQuaternion(globeGroup.quaternion)

      // World-space forward direction of bike
      const worldFwd = bikeForward.clone().applyQuaternion(globeGroup.quaternion)

      // Camera position: back along fwd, up along normal
      camTarget.copy(bikeWorldPos)
        .addScaledVector(worldFwd,    CAM_BACK)
        .addScaledVector(worldNormal, CAM_UP)
      // Zoom out a bit
      camTarget.add(new THREE.Vector3(0, 0, 3.2))

      lookTarget.copy(bikeWorldPos).addScaledVector(worldFwd, -0.12)

      // Spring lerp
      camPos.lerp(camTarget, CAM_SPRING)
      camLookAt.lerp(lookTarget, CAM_SPRING * 1.4)

      camera.position.copy(camPos)
      camera.lookAt(camLookAt)

      // Bank lean on camera
      const targetBank = -bike.turnRate * speedFrac * BANK_SCALE
      bankAngle.cur += (targetBank - bankAngle.cur) * 0.08
      camera.rotation.z = bankAngle.cur

      // ── F. Passive scene animations ─────────────────────────────────────
      cloudGroup.rotation.y = t * 0.011
      stars.rotation.y      = t * 0.006

      // Marker pulse
      markerMeshes.forEach(({ ball, ring }, i) => {
        const p = 1 + Math.sin(t * 2.4 + i * 1.6) * 0.14
        ring.scale.setScalar(p)
        ring.material.opacity = 0.28 + Math.sin(t * 2.4 + i * 1.6) * 0.22
        // Highlight if autopilot target
        const isTarget = bike.autopilot &&
          Math.abs(ball.userData.lat - bike.autopilot.targetLat) < 1
        ball.material.emissiveIntensity = isTarget ? 1.6 : 0.85
        ball.scale.setScalar(isTarget ? 1.3 : 1.0)
      })

      renderer.render(scene, camera)
    }
    animate()

    // ── Resize ─────────────────────────────────────────────────────────────
    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mount.clientWidth, mount.clientHeight)
    }
    window.addEventListener('resize', onResize)

    // ── Cleanup ────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(fid)
      window.removeEventListener('keydown',  onKeyDown)
      window.removeEventListener('keyup',    onKeyUp)
      window.removeEventListener('resize',   onResize)
      mount.removeEventListener('click',     onCLK)
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
}