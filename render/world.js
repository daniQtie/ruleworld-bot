// Shared world builders for the code-rendered story pipeline (story.html):
// Kenney city / gate / bakery / lighthouse hill / cellar / bedroom, lighting presets, cast, accessories.
import { THREE, scene, camera, sun, renderer, avatar, plastic, studTex, canvasTex, texMat, cane } from './lib.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const S = 14;                                   // 1 Kenney tile = 14 avatar units
const hemi = scene.children.find(o => o.isHemisphereLight);
const fill = scene.children.find(o => o.isDirectionalLight && o !== sun);
scene.add(camera);

export const mesh = (geo, mat, x = 0, y = 0, z = 0, parent = scene) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; parent.add(m); return m; };
export const rbox = (w, h, d, mat, r = 0.06) => { const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2.01, h / 2.01, d / 2.01)), mat); m.castShadow = m.receiveShadow = true; return m; };
const glow = (c, i = 1) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: i, roughness: 0.4 });

// ---------------- Kenney loader ----------------
const loader = new GLTFLoader(), cache = {};
const KIT = { r: 'city-kit-roads', c: 'city-kit-commercial', s: 'city-kit-suburban' };
const TINT = ['#ff9f7a', '#6fc8ff', '#ffd23f', '#ff8fb8', '#7ee07e', '#b99aff', '#ffb347', '#5fe0cf']; let tint = 0;
async function model(kit, name) {
  const key = kit + name;
  if (!cache[key]) cache[key] = loader.loadAsync(`/assets/kenney/${KIT[kit]}/Models/GLB format/${name}.glb`).then(g => g.scene);
  const m = (await cache[key]).clone(true);
  m.traverse(o => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; if (o.material) { o.material = o.material.clone(); o.material.roughness = 0.55; o.material.metalness = 0; } } });
  return m;
}
const SIDEWALK = ['#ffc98f', '#ffb3c7', '#9fe3ff', '#c6f28a']; let side = 0;
export async function put(kit, name, tx, tz, ry = 0, { sc = 1, y = 0, color = null } = {}) {
  const m = await model(kit, name);
  if (kit === 'r' && name.startsWith('road')) m.traverse(o => { if (o.isMesh) o.material.color.setScalar(0.72); });
  if (name === 'tile-low') { const c = SIDEWALK[(side++) % SIDEWALK.length]; m.traverse(o => { if (o.isMesh) o.material.color.set(c); }); }
  const c = color || (kit === 'c' && !name.startsWith('detail') ? TINT[(tint++) % TINT.length] : null);
  if (c) m.traverse(o => { if (o.isMesh) o.material.color.set(c); });
  m.scale.setScalar(S * sc); m.position.set(tx * S, y, tz * S); m.rotation.y = ry; scene.add(m); return m;
}

// ---------------- lighting presets ----------------
const skyTex = (stops, stars = false) => canvasTex(stars ? 512 : 8, 512, (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h); stops.forEach((c, i) => gr.addColorStop(i / (stops.length - 1), c));
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  if (stars) { let s = 7; const r = () => (s = (s * 16807) % 2147483647) / 2147483647; g.fillStyle = '#fff'; for (let i = 0; i < 140; i++) { g.globalAlpha = 0.4 + r() * 0.6; g.fillRect(r() * w, r() * h * 0.6, 2, 2); } g.globalAlpha = 1; }
});
export const LIGHT = {
  day:     { sky: ['#2f86f2', '#79c0ff', '#d6eeff'], fog: '#cfeaff', hemi: ['#eaf6ff', '#7aa35a', 1.35], sun: ['#fff0d6', 2.6, [60, 110, 70]], fill: 0.55, exp: 1.12 },
  morning: { sky: ['#8fb3df', '#c9dcef', '#f8e4cc'], fog: '#e9e4dc', hemi: ['#dfe9ff', '#8a9c70', 1.05], sun: ['#ffdcb0', 2.1, [-90, 55, 70]], fill: 0.4, exp: 1.08 },
  sunset:  { sky: ['#4b3f8f', '#d9695a', '#ffb067'], fog: '#e8916a', hemi: ['#ffb889', '#5b3b55', 0.75], sun: ['#ff8a3d', 3.2, [-80, 28, -90]], fill: 0.3, exp: 1.1 },
  night:   { sky: ['#030716', '#0b1736', '#1b2d5c'], fog: '#0d1834', hemi: ['#5470b8', '#0c1222', 0.42], sun: ['#a8bcff', 0.75, [-50, 90, -60]], fill: 0.1, exp: 1.05, stars: true },
  sunrise: { sky: ['#6aa8ea', '#ffb36b', '#ffe09a'], fog: '#ffd29a', hemi: ['#ffe2b0', '#7a8a50', 1.0], sun: ['#ffb347', 3.1, [70, 30, -120]], fill: 0.45, exp: 1.15 },
  cellar:  { sky: ['#000000', '#050302', '#0a0604'], fog: '#050302', hemi: ['#a08060', '#2a1a10', 0.2], sun: ['#000000', 0, [0, 50, 0]], fill: 0.0, exp: 1.25 },
};
export function setLighting(name, fogNear = 260, fogFar = 700) {
  const L = LIGHT[name] || LIGHT.day;
  scene.background = skyTex(L.sky, L.stars);
  scene.fog = new THREE.Fog(L.fog, fogNear, fogFar);
  hemi.color.set(L.hemi[0]); hemi.groundColor.set(L.hemi[1]); hemi.intensity = L.hemi[2];
  sun.color.set(L.sun[0]); sun.intensity = L.sun[1]; sun.position.set(...L.sun[2]); sun.castShadow = L.sun[1] > 0;
  Object.assign(sun.shadow.camera, { left: -110, right: 110, top: 110, bottom: -110, far: 400 }); sun.shadow.camera.updateProjectionMatrix();
  fill.intensity = L.fill; renderer.toneMappingExposure = L.exp;
  if (name === 'night') { const moon = mesh(new THREE.SphereGeometry(9, 24, 16), new THREE.MeshBasicMaterial({ color: '#f4f1d8', fog: false }), -120, 150, -330); moon.castShadow = false; }
  if (name === 'sunrise' || name === 'sunset') { const sunDisc = mesh(new THREE.SphereGeometry(16, 24, 16), new THREE.MeshBasicMaterial({ color: name === 'sunrise' ? '#fff0b0' : '#ffd08a', fog: false }), name === 'sunrise' ? 90 : -160, 40, -380); sunDisc.castShadow = false; }
  return L;
}
// warm "memory" look: a vignette sheet glued in front of the camera
export const MOOD = { warm: ['rgba(255,170,90,0.10)', 'rgba(255,120,60,0.30)', 1.04], cool: ['rgba(80,130,255,0.08)', 'rgba(30,60,170,0.36)', 1.0], tense: ['rgba(255,80,60,0.05)', 'rgba(120,20,40,0.34)', 1.0], golden: ['rgba(255,215,90,0.16)', 'rgba(255,150,30,0.34)', 1.08] };
export function moodTint(name) {
  const M = MOOD[name]; if (!M) return null;
  const t = canvasTex(256, 456, (g, w, h) => { const r = g.createRadialGradient(w / 2, h * 0.42, w * 0.2, w / 2, h / 2, h * 0.65); r.addColorStop(0, M[0]); r.addColorStop(1, M[1]); g.fillStyle = r; g.fillRect(0, 0, w, h); });
  const q = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthTest: false, depthWrite: false, fog: false, toneMapped: false }));
  q.renderOrder = 998; q.position.z = -1.01; camera.add(q); renderer.toneMappingExposure *= M[2];
  return () => { const h = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 1.01; q.scale.set(h * camera.aspect * 1.02, h * 1.02, 1); };
}
export function flashbackTint() {
  const t = canvasTex(256, 456, (g, w, h) => {
    const r = g.createRadialGradient(w / 2, h * 0.45, w * 0.25, w / 2, h / 2, h * 0.62);
    r.addColorStop(0, 'rgba(255,185,100,0.24)'); r.addColorStop(1, 'rgba(120,60,10,0.72)');
    g.fillStyle = r; g.fillRect(0, 0, w, h);
  });
  const q = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthTest: false, depthWrite: false, fog: false, toneMapped: false }));
  q.renderOrder = 999; q.position.z = -1; camera.add(q);
  return () => { const h = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)); q.scale.set(h * camera.aspect * 1.02, h * 1.02, 1); };
}

// ---------------- ground helpers ----------------
export let groundY = () => 0;
function baseplate(color = '#58b947', size = 800) {
  const g = mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshStandardMaterial({ map: studTex(color, size / 2), roughness: 0.75 }), 0, -0.02, 0);
  g.rotation.x = -Math.PI / 2; g.castShadow = false; return g;
}
const stoneTex = (base = '#8d8a85', rep = [4, 2]) => canvasTex(256, 256, (g, w, h) => {
  g.fillStyle = '#5d5a55'; g.fillRect(0, 0, w, h);
  for (let r = 0; r < 4; r++) for (let c = -1; c < 4; c++) {
    const x = c * 64 + (r % 2) * 32, y = r * 64; const v = ((r * 7 + c * 13) % 5) * 6 - 12;
    g.fillStyle = shade(base, v); g.fillRect(x + 3, y + 3, 58, 58);
  }
}, ...rep);
const woodTex = (base = '#8a5a2b', rep = [1, 1]) => canvasTex(128, 128, (g, w, h) => {
  g.fillStyle = base; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(0,0,0,0.18)';
  for (let x = 0; x < w; x += 32) g.fillRect(x, 0, 3, h);
  g.fillStyle = 'rgba(255,255,255,0.06)'; for (let x = 8; x < w; x += 32) g.fillRect(x, 0, 6, h);
}, ...rep);
function shade(hex, v) { const c = new THREE.Color(hex); c.offsetHSL(0, 0, v / 255); return '#' + c.getHexString(); }

// ---------------- locations ----------------
// City (owner-approved "Pasok" look): street along z, shops at x=+-42, sidewalks x 7..35, crossroad at z=-42 (dry fountain there).
export async function buildCity({ fountain = true, cars = true } = {}) {
  scene.add(baseplate());
  const tasks = [];
  const Z0 = 3, Z1 = -9, CROSS = -3;
  for (let z = Z1; z <= Z0; z++) {
    tasks.push(put('r', z === CROSS ? 'road-crossroad-path' : 'road-straight', 0, z, 0));
    for (const x of [-1, 1, -2, 2]) tasks.push(put('r', 'tile-low', x, z, 0));
  }
  for (const x of [-3, -2, -1, 1, 2, 3, -4, 4]) tasks.push(put('r', 'road-straight', x, CROSS, Math.PI / 2));
  const shops = ['building-a', 'building-b', 'building-c', 'building-d', 'building-e', 'building-f', 'building-g', 'building-h', 'building-i', 'building-j', 'building-k', 'building-l'];
  let k = 0;
  for (let z = Z0 - 1; z >= Z1; z--) {
    if (z === CROSS) continue;
    tasks.push(put('c', shops[k++ % shops.length], -3, z, Math.PI / 2));
    tasks.push(put('c', shops[k++ % shops.length], 3, z, -Math.PI / 2));
  }
  for (const [x, z, n] of [[-5, -1, 'a'], [5, -2, 'b'], [-5, -6, 'c'], [5, -7, 'd'], [-1.5, -12, 'e'], [2, -13, 'a'], [-6, 2, 'b'], [6, 1, 'c'], [-3, 5, 'd'], [3, 5, 'e']]) tasks.push(put('c', 'building-skyscraper-' + n, x, z, 0));
  for (let z = Z0 - 1; z >= Z1; z -= 2) {
    if (Math.abs(z - CROSS) < 1) continue;
    tasks.push(put('r', 'light-square', -1.45, z, Math.PI / 2));
    tasks.push(put('r', 'light-square', 1.45, z - 1, -Math.PI / 2));
  }
  for (const [x, z] of [[-1.55, CROSS + 0.55], [1.55, CROSS - 0.55]]) tasks.push(put('r', 'traffic-light', x, z, x < 0 ? Math.PI / 2 : -Math.PI / 2));
  for (const [x, z] of [[-2.2, 1.2], [2.2, -0.6], [-2.2, -5.4], [2.2, -7.4], [2.2, 2.6], [-2.2, 3.4]]) { tasks.push(put('s', 'planter', x, z)); tasks.push(put('s', 'tree-large', x, z, x)); }
  await Promise.all(tasks);
  if (cars) { car(-4.2, -75, '#e74c3c'); car(4.2, -100, '#f1c40f', Math.PI); }
  // shop awnings + flower beds along both sidewalks (colour everywhere)
  const AW = ['#ff4d6d', '#2ec4b6', '#ffbe0b', '#8338ec', '#3a86ff', '#fb5607'];
  const aw = [];
  let ai = 0;
  for (let z = Z0 - 1; z >= Z1; z--) { if (z === CROSS) continue; for (const sx of [-1, 1]) aw.push(put('c', 'detail-awning-wide', sx * (3 - 0.37), z, sx > 0 ? -Math.PI / 2 : Math.PI / 2, { color: AW[(ai++) % AW.length], y: 2.2 })); }
  await Promise.all(aw);
  for (let z = 38; z > -130; z -= 9) for (const sx of [-1, 1]) { const fz = z + (sx > 0 ? 3 : 0); if (sx > 0 && fz < -1 && fz > -36) continue; flowerBed(sx * 33.2, fz); }
  if (fountain) dryFountain(0, CROSS * S);
}
export function flowerBed(x, z, n = 7) {
  const box = mesh(new THREE.BoxGeometry(2.2, 0.7, 5), plastic('#8a5a2b'), x, 0.35, z);
  mesh(new THREE.BoxGeometry(2.0, 0.2, 4.8), plastic('#5a3a1a'), x, 0.72, z);
  const C = ['#ff3b6b', '#ffd23f', '#ff7ae0', '#ffffff', '#ff8c1a', '#b14bff'];
  for (let i = 0; i < n; i++) {
    const fx = x + ((i * 37) % 3 - 1) * 0.55, fz = z - 2 + i * 4 / (n - 1);
    mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.8, 6), plastic('#2e9e5b'), fx, 1.1, fz);
    mesh(new THREE.SphereGeometry(0.34, 10, 8), plastic(C[(i + Math.abs(Math.round(z))) % C.length]), fx, 1.55, fz);
  }
}
function car(x, z, color, ry = 0) {
  const g = new THREE.Group();
  mesh(new THREE.BoxGeometry(4.6, 1.6, 9), plastic(color), 0, 1.5, 0, g);
  mesh(new THREE.BoxGeometry(4.2, 1.5, 4.6), plastic('#dfe9f2', { roughness: 0.2 }), 0, 3.0, -0.6, g);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const w = mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.7, 20), plastic('#222'), 2.3 * sx, 0.95, 3 * sz, g); w.rotation.z = Math.PI / 2; }
  g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g);
}
function dryFountain(x, z) {
  const st = new THREE.MeshStandardMaterial({ map: stoneTex('#a7a29a', [6, 1]), roughness: 0.8 });
  mesh(new THREE.CylinderGeometry(9, 9.5, 2.4, 32, 1, true), st, x, 1.2, z);
  mesh(new THREE.CylinderGeometry(9.6, 9.6, 0.5, 32), plastic('#b9b3a8'), x, 2.45, z).scale.set(1, 1, 1);
  mesh(new THREE.CylinderGeometry(8.6, 8.6, 0.3, 32), plastic('#8b8478'), x, 0.6, z);        // dry, cracked basin
  mesh(new THREE.CylinderGeometry(1.2, 1.6, 6, 16), st, x, 3.5, z);
  mesh(new THREE.CylinderGeometry(3.4, 1.4, 1, 24), plastic('#b9b3a8'), x, 6.8, z);
}
// a wooden door set into a shop facade on the right side of the street (facade plane x = 35.4, facing -x)
export function facadeDoor(z, { side = 1, color = '#7a4a25' } = {}) {
  const X = side * 35.3, g = new THREE.Group(); g.position.set(X, 0, z); g.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2; scene.add(g);
  const fr = plastic('#5a3519');
  for (const s of [-1, 1]) mesh(new THREE.BoxGeometry(0.7, 8.2, 0.9), fr, s * 2.65, 4.1, 0.1, g);
  mesh(new THREE.BoxGeometry(6.0, 0.8, 0.9), fr, 0, 8.4, 0.1, g);
  mesh(new THREE.BoxGeometry(4.6, 8, 0.4), plastic('#1b1410'), 0, 4, -0.3, g);               // dark inside
  const hinge = new THREE.Group(); hinge.position.set(-2.3, 0, 0.1); g.add(hinge);
  const door = rbox(4.5, 7.9, 0.35, new THREE.MeshStandardMaterial({ map: woodTex(color), roughness: 0.6 }), 0.05); door.position.set(2.25, 3.98, 0); hinge.add(door);
  mesh(new THREE.SphereGeometry(0.22, 12, 8), plastic('#d4a017'), 3.9, 3.8, 0.3, hinge);
  return { group: g, hinge };
}

export async function buildGate({ home = false } = {}) {
  await buildCity({ fountain: !home, cars: !home });
  // a simple wooden arch gate across the street at z = 0 (stone feet)
  const g = new THREE.Group(); scene.add(g);
  const wood = new THREE.MeshStandardMaterial({ map: woodTex('#8a5a2b', [1, 3]), roughness: 0.6 }), st = new THREE.MeshStandardMaterial({ map: stoneTex('#a49d92', [1, 1]), roughness: 0.8 });
  for (const s of [-1, 1]) { mesh(new THREE.BoxGeometry(3.2, 3, 3.2), st, s * 9, 1.5, 0, g); mesh(new THREE.BoxGeometry(2, 14, 2), wood, s * 9, 10, 0, g); }
  mesh(new THREE.BoxGeometry(23, 2, 2.4), wood, 0, 17.6, 0, g);
  mesh(new THREE.BoxGeometry(20, 1.2, 1.6), wood, 0, 15.2, 0, g);
  const roof = mesh(new THREE.CylinderGeometry(0.1, 14, 3.4, 4, 1), plastic(home ? '#d9534f' : '#7d7d7d'), 0, 20.2, 0, g); roof.rotation.y = Math.PI / 4; roof.scale.set(1, 1, 0.22);
  // dirt path through the gate
  const dirt = new THREE.MeshStandardMaterial({ map: studTex('#a8763e', [3, 12]), roughness: 0.9 });
  const p = mesh(new THREE.PlaneGeometry(12, 70), dirt, 0, 0.12, 5); p.rotation.x = -Math.PI / 2;
  return g;
}

export async function buildBakery() {
  await buildCity({ fountain: false, cars: false });
  // the bakery = the right-side shop at z = 0, warm tint, awning, counter with loaves
  const sh = await put('c', 'building-c', 3, 0, -Math.PI / 2, { color: '#ffe0b8', y: 0.05 });
  sh.scale.multiplyScalar(1.02);
  const aw = await put('c', 'detail-awning-wide', 3 - 0.37, 0, -Math.PI / 2, { color: '#e8a0a0', y: 2.2 });
  const counter = new THREE.Group(); counter.position.set(29.5, 0, 0); scene.add(counter);
  const w = new THREE.MeshStandardMaterial({ map: woodTex('#9b6633', [3, 1]), roughness: 0.6 });
  const top = rbox(3.2, 0.4, 14, plastic('#c98d4f'), 0.1); top.position.y = 3.3; counter.add(top);
  const body = rbox(2.8, 3.1, 13.4, w, 0.08); body.position.y = 1.55; counter.add(body);
  for (let i = 0; i < 5; i++) { const l = loaf(); l.position.set(0, 3.95, -5 + i * 2.5); l.rotation.y = 0.3 * i; counter.add(l); }
  return { counter };
}

// Lighthouse hill: displaced studded baseplate island, winding dirt path, striped lighthouse at the top, sea all around.
const HZ = -60, HR = 70, HTOP = 14;
function hillH(x, z) { const r2 = x * x + (z - HZ) * (z - HZ); const d = r2 < HR * HR ? 0.35 * Math.sqrt(HR * HR - r2) - 10.5 : -99; return Math.max(0, d); }
function islandY(x, z) { const r = Math.hypot(x, z - HZ); return r > 150 ? -4 : hillH(x, z); }
export const PATH = new THREE.CatmullRomCurve3([[0, 0, 40], [2, 0, 16], [8, 0, 2], [-6, 0, -14], [-7, 0, -30], [3, 0, -44], [0, 0, -53]].map(p => new THREE.Vector3(...p)));
export async function buildHill() {
  const N = 140, size = 360, geo = new THREE.PlaneGeometry(size, size, N, N); geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position; for (let i = 0; i < pos.count; i++) pos.setY(i, islandY(pos.getX(i), pos.getZ(i) + HZ));
  geo.translate(0, 0, HZ); geo.computeVertexNormals();
  const ground = mesh(geo, new THREE.MeshStandardMaterial({ map: studTex('#58b947', size / 2), roughness: 0.8 })); ground.castShadow = false;
  const sea = HILL.sea = mesh(new THREE.PlaneGeometry(1600, 1600), new THREE.MeshStandardMaterial({ color: '#2a8bd8', roughness: 0.25, metalness: 0.1 }), 0, -0.6, HZ); sea.rotation.x = -Math.PI / 2; sea.castShadow = false;
  groundY = (x, z) => Math.max(0, islandY(x, z));
  // dirt path
  // dirt path: a ribbon draped over the terrain
  const NS = 220, HW = 3, vs = [], uv = [], idx = [];
  for (let i = 0; i <= NS; i++) {
    const u = i / NS, p = PATH.getPointAt(u), tg = PATH.getTangentAt(u), nx = tg.z, nz = -tg.x, l = Math.hypot(nx, nz) || 1;
    for (const s of [-1, 1]) { const x = p.x + s * HW * nx / l, z = p.z + s * HW * nz / l; vs.push(x, groundY(x, z) + 0.12, z); uv.push(s < 0 ? 0 : 1, u * 40); }
    if (i < NS) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
  }
  const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.Float32BufferAttribute(vs, 3)); pg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); pg.setIndex(idx); pg.computeVertexNormals();
  const pm = mesh(pg, new THREE.MeshStandardMaterial({ map: studTex('#a8763e', 1), roughness: 0.9, side: THREE.DoubleSide })); pm.castShadow = false;
  pm.material.map.wrapS = pm.material.map.wrapT = THREE.RepeatWrapping; pm.material.map.repeat.set(2, 1);
  lighthouse(0, HTOP, HZ);
  const trees = [[-22, 10], [24, 4], [-30, -20], [28, -30], [-18, -46], [20, -58], [-40, 20], [40, 22], [-45, -60], [46, -64]];
  await Promise.all(trees.map(([x, z]) => put('s', 'tree-large', x / S, z / S, x, { y: groundY(x, z) - 0.2, sc: 1.2 })));
  const FC = ['#ff3b6b', '#ffd23f', '#ff7ae0', '#ffffff', '#ff8c1a', '#b14bff', '#3a86ff'];
  for (let i = 0; i < 140; i++) { const a = i * 2.39996, r = 9 + (i % 23) * 2.6, x = Math.sin(a) * r, z = HZ + 25 + Math.cos(a) * r * 1.3;
    const d = PATH.getPoints(40).reduce((m, p) => Math.min(m, Math.hypot(p.x - x, p.z - z)), 99); if (d < 5 || Math.hypot(x, z - HZ) < 9) continue;
    const y = groundY(x, z); mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.7, 5), plastic('#2e9e5b'), x, y + 0.35, z).castShadow = false; mesh(new THREE.SphereGeometry(0.38, 8, 6), plastic(FC[i % FC.length]), x, y + 0.8, z).castShadow = false; }
  for (const [x, z, r] of [[14, 30, 2], [-12, 24, 1.6], [16, -12, 1.4], [-16, -36, 1.8]]) mesh(new THREE.DodecahedronGeometry(r, 0), plastic('#9a9a9a'), x, groundY(x, z) + r * 0.5, z);
}
function lighthouse(x, y, z) {
  const g = new THREE.Group(); g.position.set(x, y, z); scene.add(g);
  const red = plastic('#d63a2f'), white = plastic('#f4f1ea');
  let h = 0, r = 6;
  for (let i = 0; i < 6; i++) { const r2 = r - 0.45; mesh(new THREE.CylinderGeometry(r2, r, 4.6, 32), i % 2 ? red : white, 0, h + 2.3, 0, g); h += 4.6; r = r2; }
  mesh(new THREE.CylinderGeometry(r + 1.4, r + 1.4, 0.7, 32), plastic('#3b3b3b'), 0, h + 0.35, 0, g);
  HILL.lamp = mesh(new THREE.CylinderGeometry(r - 0.4, r - 0.4, 3.6, 16), new THREE.MeshStandardMaterial({ color: '#fff3b0', emissive: '#ffd34d', emissiveIntensity: 0.8 }), 0, h + 2.5, 0, g);
  HILL.lampPos = new THREE.Vector3(x, y + h + 2.5, z);
  mesh(new THREE.ConeGeometry(r + 0.3, 3, 24), red, 0, h + 5.8, 0, g);
  const door = rbox(3.4, 6, 0.6, new THREE.MeshStandardMaterial({ map: woodTex('#6b4422'), roughness: 0.6 }), 0.1); door.position.set(0, 3, 5.75); g.add(door);
  mesh(new THREE.CylinderGeometry(6.8, 7.2, 0.6, 32), plastic('#b9b3a8'), 0, 0.1, 0, g);
}
export const HILL = {};   // lighthouse lamp mesh + world position (story 003 turns it on/off)
export const hillDoor = () => new THREE.Vector3(0, HTOP, HZ + 6.5);

// Cellar: dark stone room, crate, low door (back wall), lantern light.
export function buildCellar({ doorOpen = 0 } = {}) {
  const st = new THREE.MeshStandardMaterial({ map: stoneTex('#7d766c', [5, 2]), roughness: 0.9 });
  const fl = new THREE.MeshStandardMaterial({ map: stoneTex('#5f5850', [5, 5]), roughness: 0.95 });
  const floor = mesh(new THREE.PlaneGeometry(26, 26), fl); floor.rotation.x = -Math.PI / 2;
  const back = mesh(new THREE.BoxGeometry(26, 12, 1), st, 0, 6, -12.5);
  mesh(new THREE.BoxGeometry(1, 12, 26), st, -12.5, 6, 0); mesh(new THREE.BoxGeometry(1, 12, 26), st, 12.5, 6, 0);
  mesh(new THREE.BoxGeometry(26, 1, 26), st, 0, 12.5, 0);
  mesh(new THREE.BoxGeometry(26, 12, 1), st, 0, 6, 16);
  for (const x of [-6, 6]) mesh(new THREE.BoxGeometry(1.2, 1.2, 26), plastic('#4a3020'), x, 11.6, 0);
  // low wooden door in the back wall at x = 5 (opening shows warm evening light)
  back.visible = false;
  for (const [x, w] of [[-4.5, 17], [11.25, 3.5]]) mesh(new THREE.BoxGeometry(w, 12, 1), st, x, 6, -12.5);
  mesh(new THREE.BoxGeometry(5.5, 5, 1), st, 7, 9.5, -12.5);
  const outside = mesh(new THREE.PlaneGeometry(6, 8), new THREE.MeshBasicMaterial({ color: '#ffb36b' }), 7, 4, -13.3); outside.castShadow = false;
  const hinge = new THREE.Group(); hinge.position.set(4.75, 0, -12.1); scene.add(hinge);
  const door = rbox(4.5, 7, 0.4, new THREE.MeshStandardMaterial({ map: woodTex('#6b4422'), roughness: 0.6 }), 0.05); door.position.set(2.25, 3.5, 0); hinge.add(door);
  hinge.rotation.y = doorOpen;
  const warm = new THREE.PointLight('#ffb070', 45, 0, 1.1); warm.position.set(0, 10, 4); scene.add(warm);
  const rug = mesh(new THREE.CylinderGeometry(5, 5, 0.06, 32), new THREE.MeshStandardMaterial({ map: canvasTex(128, 128, (g) => { for (let r = 64; r > 0; r -= 10) { g.fillStyle = ['#c0392b', '#f1c40f', '#2e86de', '#27ae60'][(r / 10 | 0) % 4]; g.beginPath(); g.arc(64, 64, r, 0, 7); g.fill(); } }), roughness: 0.9 }), 1, 0.04, 0); rug.castShadow = false;
  const crate = rbox(4, 3, 3.4, new THREE.MeshStandardMaterial({ map: woodTex('#9b6633', [2, 1]), roughness: 0.7 }), 0.1); crate.position.set(-7.5, 1.5, -7.5); scene.add(crate);
  return { hinge, crate };
}

// Bedroom (line 6): small room, block bed, window with morning light.
export function buildBedroom() {
  const wall = new THREE.MeshStandardMaterial({ map: woodTex('#8fd3ff', [4, 1]), roughness: 0.8 });
  const floor = mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshStandardMaterial({ map: woodTex('#7b6a58', [6, 6]), roughness: 0.8 })); floor.rotation.x = -Math.PI / 2;
  for (const [x, w] of [[-9.5, 11], [9.5, 11]]) mesh(new THREE.BoxGeometry(w, 14, 1), wall, x, 7, -10);
  mesh(new THREE.BoxGeometry(8, 5, 1), wall, 0, 2.5, -10); mesh(new THREE.BoxGeometry(8, 4, 1), wall, 0, 12, -10);
  const win = mesh(new THREE.PlaneGeometry(8, 5), new THREE.MeshBasicMaterial({ color: '#ffe8c4' }), 0, 7.5, -10.6); win.castShadow = false;
  mesh(new THREE.BoxGeometry(0.4, 5, 0.6), plastic('#5a3519'), 0, 7.5, -10);
  mesh(new THREE.BoxGeometry(1, 14, 30), wall, -15, 7, 5); mesh(new THREE.BoxGeometry(1, 14, 30), wall, 15, 7, 5);
  const bed = new THREE.Group(); bed.position.set(0, 0, -3); scene.add(bed);
  const fr = plastic('#8a5a2b'); mesh(new THREE.BoxGeometry(7, 1.6, 11), fr, 0, 0.8, 0, bed); mesh(new THREE.BoxGeometry(7, 4, 0.8), fr, 0, 2, -5.5, bed);
  mesh(new THREE.BoxGeometry(6.6, 0.8, 10.4), plastic('#f0ede6'), 0, 2, 0, bed);
  mesh(new THREE.BoxGeometry(4, 0.7, 2), plastic('#ffffff'), 0, 2.7, -4, bed);
  const blanket = rbox(6.8, 0.6, 6.2, plastic('#ff6f91'), 0.2); blanket.position.set(0, 2.6, 2.2); bed.add(blanket);
  const morning = new THREE.SpotLight('#ffe2b8', 400, 60, 0.6, 0.5, 1.6); morning.position.set(0, 9, -14); morning.target.position.set(0, 2, 0); morning.castShadow = true; scene.add(morning, morning.target);
}

// ---------------- props / accessories ----------------
export function loaf() {
  const m = new THREE.Mesh(new THREE.SphereGeometry(0.9, 20, 14), plastic('#c98a3e', { roughness: 0.7 })); m.scale.set(1.25, 0.75, 1); m.castShadow = true;
  for (const z of [-0.4, 0, 0.4]) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.2, 1.4), plastic('#f3d6a0')); c.position.set(z, 0.62, 0); c.rotation.y = 0.6; m.add(c); }
  const g = new THREE.Group(); m.position.y = 0.65; g.add(m); return g;
}
const knitTex = (c) => canvasTex(64, 64, (g) => { g.fillStyle = c; g.fillRect(0, 0, 64, 64); g.fillStyle = 'rgba(255,255,255,0.35)'; for (let y = 0; y < 64; y += 16) g.fillRect(0, y, 64, 5); g.fillStyle = 'rgba(0,0,0,0.15)'; for (let x = 0; x < 64; x += 8) g.fillRect(x, 0, 2, 64); }, 4, 1);
export const HAT_H = { cap: 0.62, beanie: 0.95, bucket: 0.5, straw: 0.38, tophat: 1.05, bowler: 0.7, crown: 0.5 };
export function makeProp(type, color = '#e74c3c') {
  const g = new THREE.Group(), m = plastic(color), add = (geo, mat, x = 0, y = 0, z = 0) => mesh(geo, mat, x, y, z, g);
  switch (type) {
    case 'cap': { const cm = plastic(color), bm = plastic(shade(color, -35)); const d = add(new THREE.SphereGeometry(0.78, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), cm, 0, -0.04, -0.05); d.scale.set(1, 0.82, 1.02); const br = add(new THREE.CylinderGeometry(0.62, 0.62, 0.09, 24, 1, false, -Math.PI / 2, Math.PI), bm, 0, 0.0, 0.62); br.scale.set(1, 1, 1.25); add(new THREE.SphereGeometry(0.12, 10, 8), bm, 0, 0.62, -0.05); add(new THREE.TorusGeometry(0.79, 0.05, 6, 28), bm, 0, -0.02, -0.05).rotation.x = Math.PI / 2; g.scale.setScalar(1.12); break; }
    case 'oldcap': { const d = add(new THREE.SphereGeometry(0.74, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), m, 0, -0.02, -0.02); d.scale.y = 0.62; const b = add(new THREE.BoxGeometry(1.2, 0.08, 0.75), m, 0, 0.0, 0.85); b.rotation.x = -0.08; add(new THREE.SphereGeometry(0.09, 8, 6), m, 0, 0.45, 0); break; }
    case 'beanie': { const d = add(new THREE.SphereGeometry(0.78, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), m, 0, 0.12, 0); d.scale.y = 1.05; add(new THREE.CylinderGeometry(0.82, 0.82, 0.34, 24), plastic(shade(color, -30)), 0, 0.12, 0); for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; add(new THREE.BoxGeometry(0.06, 0.6, 0.06), plastic(shade(color, 25)), Math.sin(a) * 0.62, 0.55, Math.cos(a) * 0.62).rotation.set(Math.cos(a) * 0.5, 0, -Math.sin(a) * 0.5); } add(new THREE.SphereGeometry(0.3, 14, 10), plastic('#ffffff'), 0, 0.98, 0); break; }
    case 'oldbeanie': { const d = add(new THREE.SphereGeometry(0.76, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), m, 0, 0.05, 0); d.scale.y = 0.75; add(new THREE.CylinderGeometry(0.78, 0.78, 0.26, 24), plastic(shade(color, -25)), 0, 0.08, 0); add(new THREE.SphereGeometry(0.2, 12, 10), plastic('#ffffff'), 0, 0.68, 0); break; }
    case 'bucket': { add(new THREE.CylinderGeometry(0.6, 0.72, 0.48, 24), m, 0, 0.24, 0); const br = add(new THREE.CylinderGeometry(0.72, 1.05, 0.18, 24, 1, true), m, 0, 0.02, 0); br.material = plastic(color, { side: THREE.DoubleSide }); break; }
    case 'straw': { add(new THREE.CylinderGeometry(1.3, 1.3, 0.08, 28), m, 0, 0.02, 0); add(new THREE.CylinderGeometry(0.62, 0.68, 0.36, 24), m, 0, 0.2, 0); add(new THREE.CylinderGeometry(0.69, 0.69, 0.1, 24), plastic('#c0392b'), 0, 0.1, 0); break; }
    case 'tophat': { add(new THREE.CylinderGeometry(0.62, 0.62, 1.0, 24), m, 0, 0.52, 0); add(new THREE.CylinderGeometry(1.0, 1.0, 0.08, 28), m, 0, 0.04, 0); add(new THREE.CylinderGeometry(0.63, 0.63, 0.16, 24), plastic('#8e44ad'), 0, 0.18, 0); break; }
    case 'bowler': { const d = add(new THREE.SphereGeometry(0.68, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), m, 0, 0.1, 0); d.scale.y = 1.0; add(new THREE.CylinderGeometry(0.69, 0.69, 0.16, 24), plastic('#151515'), 0, 0.16, 0); add(new THREE.CylinderGeometry(1.0, 1.0, 0.08, 28), m, 0, 0.06, 0); break; }
    case 'oldbowler': { const d = add(new THREE.SphereGeometry(0.66, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), m, 0, 0.05, 0); d.scale.y = 0.8; add(new THREE.CylinderGeometry(0.95, 0.95, 0.07, 28), m, 0, 0.05, 0); break; }
    case 'bonnet': { const d = add(new THREE.SphereGeometry(0.78, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), m, 0, -0.05, -0.1); d.scale.set(1, 0.7, 1.1); add(new THREE.TorusGeometry(0.78, 0.06, 8, 24), plastic('#ffffff'), 0, 0.0, -0.1).rotation.x = Math.PI / 2; break; }
    case 'crown': { const gold = new THREE.MeshStandardMaterial({ color: '#ffcc33', emissive: '#ffaa00', emissiveIntensity: 0.6, metalness: 0.6, roughness: 0.25 });
      add(new THREE.CylinderGeometry(0.62, 0.62, 0.3, 24, 1, true), gold, 0, 0.15, 0).material.side = THREE.DoubleSide;
      for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; add(new THREE.ConeGeometry(0.14, 0.42, 4), gold, Math.sin(a) * 0.6, 0.48, Math.cos(a) * 0.6); add(new THREE.SphereGeometry(0.07, 8, 6), glow(['#ff3b3b', '#3b8bff', '#3bff7a'][i % 3], 0.6), Math.sin(a) * 0.62, 0.16, Math.cos(a) * 0.62); }
      break; }
    case 'scarf': case 'knit': { const mm = type === 'knit' ? new THREE.MeshStandardMaterial({ map: knitTex(color), roughness: 0.9 }) : m;
      g.add(Object.assign(rbox(2.15, 0.45, 1.15, mm, 0.15), {})); const t = rbox(0.45, 1.0, 0.18, mm, 0.08); t.position.set(0.5, -0.55, 0.6); g.add(t); break; }
    case 'glasses': { const gm = plastic(color === '#e74c3c' ? '#151515' : color); for (const s of [-1, 1]) add(new THREE.TorusGeometry(0.22, 0.07, 10, 28), gm, 0.27 * s, 0, 0.02); add(new THREE.BoxGeometry(0.16, 0.07, 0.07), gm, 0, 0.03, 0.02); for (const s of [-1, 1]) add(new THREE.BoxGeometry(0.06, 0.06, 0.62), gm, 0.47 * s, 0.03, -0.3); for (const s of [-1, 1]) { const l = add(new THREE.CircleGeometry(0.2, 20), new THREE.MeshStandardMaterial({ color: '#cfefff', transparent: true, opacity: 0.35 }), 0.27 * s, 0, 0.0); l.castShadow = false; } break; }
    case 'oldglasses': { const gm = plastic(color === '#e74c3c' ? '#151515' : color); for (const s of [-1, 1]) add(new THREE.TorusGeometry(0.19, 0.045, 8, 24), gm, 0.25 * s, 0, 0); add(new THREE.BoxGeometry(0.14, 0.05, 0.05), gm, 0, 0.02, 0); for (const s of [-1, 1]) add(new THREE.BoxGeometry(0.05, 0.05, 0.6), gm, 0.44 * s, 0.02, -0.3); break; }
    case 'bowtie': { const bm = plastic(color), km = plastic(shade(color, -40)); for (const s of [-1, 1]) { const w = add(new THREE.CylinderGeometry(0.42, 0.12, 0.62, 4), bm, 0.36 * s, 0, 0); w.rotation.set(0, Math.PI / 4, s * Math.PI / 2); w.scale.set(1, 1, 0.45); } add(new THREE.SphereGeometry(0.17, 12, 10), km); g.scale.setScalar(1.25); break; }
    case 'oldbowtie': { for (const s of [-1, 1]) { const c = add(new THREE.ConeGeometry(0.42, 0.7, 4), m, 0.36 * s, 0, 0); c.rotation.z = -s * Math.PI / 2; } add(new THREE.BoxGeometry(0.16, 0.2, 0.16), m); break; }
    case 'ribbon': { const bm = plastic(color), km = plastic(shade(color, -30)); for (const s of [-1, 1]) { const lp = add(new THREE.TorusGeometry(0.3, 0.11, 10, 24), bm, 0.36 * s, 0.04, 0); lp.scale.set(1.15, 0.8, 1); lp.rotation.z = s * 0.15; const tl = add(new THREE.BoxGeometry(0.16, 0.5, 0.06), bm, 0.16 * s, -0.32, 0); tl.rotation.z = s * 0.4; } add(new THREE.SphereGeometry(0.15, 12, 10), km); g.scale.setScalar(1.1); break; }
    case 'oldribbon': { for (const s of [-1, 1]) { const c = add(new THREE.ConeGeometry(0.2, 0.36, 4), m, 0.18 * s, 0, 0); c.rotation.z = -s * Math.PI / 2; } add(new THREE.SphereGeometry(0.09, 8, 6), m); break; }
    case 'clip': { const cm = plastic(color), dm = plastic(shade(color, -35)); const b = rbox(1.0, 0.26, 0.16, cm, 0.1); g.add(b); for (let k = -3; k <= 3; k++) add(new THREE.BoxGeometry(0.06, 0.12, 0.05), dm, k * 0.13, -0.17, 0.02); for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; add(new THREE.SphereGeometry(0.1, 8, 6), plastic('#ffffff'), 0.32 + Math.sin(a) * 0.12, Math.cos(a) * 0.12, 0.1); } add(new THREE.SphereGeometry(0.08, 8, 6), plastic('#ff6fa8'), 0.32, 0, 0.16); break; }
    case 'oldclip': { add(new THREE.BoxGeometry(0.5, 0.14, 0.14), m); add(new THREE.SphereGeometry(0.1, 8, 6), plastic('#ffffff'), 0.22, 0.04, 0.06); break; }
    case 'backpack': { g.add(rbox(1.5, 1.6, 0.6, m, 0.18)); const p = rbox(1.1, 0.6, 0.2, plastic(shade(color, -25)), 0.1); p.position.set(0, -0.35, -0.38); g.add(p); for (const s of [-1, 1]) add(new THREE.BoxGeometry(0.2, 1.7, 0.1), plastic(shade(color, -40)), 0.5 * s, 0.05, 0.33); break; }
    case 'lantern': { const lm = plastic('#3b3b3b'); add(new THREE.CylinderGeometry(0.35, 0.4, 0.14, 12), lm, 0, -0.9, 0); add(new THREE.CylinderGeometry(0.3, 0.3, 0.6, 12), glow('#ffcf6b', 2.2), 0, -0.5, 0); add(new THREE.ConeGeometry(0.38, 0.3, 12), lm, 0, -0.08, 0); add(new THREE.TorusGeometry(0.2, 0.04, 6, 16, Math.PI), lm, 0, 0.05, 0); g.userData.flame = g.children[1]; g.traverse(o => { o.castShadow = false; }); break; }
    case 'bowl': { add(new THREE.SphereGeometry(0.5, 16, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), plastic('#e8e2d6', { side: THREE.DoubleSide }), 0, 0.45, 0); const s = add(new THREE.CircleGeometry(0.46, 16), plastic('#e08a2e'), 0, 0.38, 0); s.rotation.x = -Math.PI / 2; break; }
    case 'tray': { add(new THREE.BoxGeometry(2.4, 0.12, 1.6), plastic('#b0b0b0', { metalness: 0.3 })); break; }
    case 'basket': { add(new THREE.CylinderGeometry(0.75, 0.55, 0.7, 16), new THREE.MeshStandardMaterial({ map: woodTex('#b98a4a'), roughness: 0.8 }), 0, -0.3, 0); const h = add(new THREE.TorusGeometry(0.6, 0.06, 6, 16, Math.PI), plastic('#8a5a2b'), 0, 0.05, 0); add(new THREE.SphereGeometry(0.25, 10, 8), plastic('#e74c3c'), 0.2, 0.05, 0.1); add(new THREE.SphereGeometry(0.25, 10, 8), plastic('#f1c40f'), -0.2, 0.05, -0.1); break; }
    case 'bag': { g.add(rbox(1.0, 1.1, 0.6, plastic('#c9a46b'), 0.08)); g.children[0].position.y = -0.5; add(new THREE.SphereGeometry(0.25, 10, 8), plastic('#2ecc71'), 0.15, 0.1, 0); add(new THREE.SphereGeometry(0.22, 10, 8), plastic('#e67e22'), -0.2, 0.05, 0.1); break; }
    case 'sandwich': { add(new THREE.BoxGeometry(0.9, 0.16, 0.7), plastic('#f0c987'), 0, 0, 0); add(new THREE.BoxGeometry(0.95, 0.08, 0.75), plastic('#6abf45'), 0, 0.1, 0); add(new THREE.BoxGeometry(0.9, 0.16, 0.7), plastic('#f0c987'), 0, 0.2, 0); break; }
    case 'loaf': { const l = loaf(); l.scale.setScalar(0.85); g.add(l); break; }
    case 'chest': { const w = new THREE.MeshStandardMaterial({ map: woodTex('#7b4a22'), roughness: 0.7 }); g.add(rbox(1.8, 1.0, 1.2, w, 0.06)); g.children[0].position.y = 0.5; const lid = add(new THREE.CylinderGeometry(0.6, 0.6, 1.8, 16, 1, false, 0, Math.PI), w, 0, 1.0, 0); lid.rotation.z = Math.PI / 2; lid.rotation.y = Math.PI / 2;
      for (const x of [-0.6, 0.6]) add(new THREE.BoxGeometry(0.14, 1.62, 1.24), plastic('#3a3a3a', { metalness: 0.5 }), x, 0.82, 0);
      add(new THREE.BoxGeometry(0.34, 0.42, 0.14), plastic('#8a8a8a', { metalness: 0.7, roughness: 0.3 }), 0, 0.8, 0.66); add(new THREE.TorusGeometry(0.12, 0.04, 6, 12, Math.PI), plastic('#8a8a8a', { metalness: 0.7 }), 0, 1.02, 0.66); break; }
    case 'note': { const pm = plastic('#fffaf0'), sm = plastic('#efe4c8'); const a = add(new THREE.BoxGeometry(1.5, 0.05, 0.75), pm, 0, 0.3, 0.3); a.rotation.x = 0.75; const b = add(new THREE.BoxGeometry(1.5, 0.05, 0.75), sm, 0, 0.3, -0.3); b.rotation.x = -0.75; add(new THREE.CylinderGeometry(0.13, 0.13, 0.05, 16), plastic('#c0392b'), 0, 0.56, 0.08).rotation.x = Math.PI / 2 - 0.75; add(new THREE.BoxGeometry(0.05, 0.05, 2.2), plastic('#8a6a4a'), 0.45, 0.04, 0); add(new THREE.BoxGeometry(0.05, 0.05, 2.2), plastic('#8a6a4a'), -0.45, 0.04, 0); break; }
    case 'oldnote': { const p = add(new THREE.BoxGeometry(0.7, 0.04, 0.5), plastic('#f4ecd8'), 0, 0, 0); const f = add(new THREE.BoxGeometry(0.7, 0.04, 0.5), plastic('#e9dfc6'), 0, 0.12, -0.1); f.rotation.x = 0.5; add(new THREE.BoxGeometry(0.04, 0.06, 1.4), plastic('#8a6a4a'), 0.15, 0.05, 0.3); break; }
    case 'footprint': { const fm = glow('#ffe27a', 1.6); for (const s of [-1, 1]) { const f = add(new THREE.BoxGeometry(0.42, 0.06, 0.75), fm, 0.35 * s, 0.05, s * 0.4); f.castShadow = false; } break; }
    case 'puff': { add(new THREE.BoxGeometry(0.25, 0.25, 0.25), new THREE.MeshStandardMaterial({ color: '#ffffff', transparent: true, roughness: 1 })); break; }
    case 'confetti': { const s = add(new THREE.BoxGeometry(0.35, 0.05, 0.2), new THREE.MeshBasicMaterial({ color, toneMapped: false })); s.castShadow = false; break; }
    case 'sparkle': { const s = add(new THREE.OctahedronGeometry(0.22, 0), new THREE.MeshBasicMaterial({ color: color, transparent: true, toneMapped: false })); s.castShadow = false; break; }
  }
  return g;
}

// ---------------- cast ----------------
const GREY = { shirt: '#9aa1a8', pants: '#7d838a' };
export const BRIGHT = ['#e74c3c', '#8e44ad', '#16a085', '#f39c12', '#2e86de', '#e84393', '#27ae60', '#d35400'];
const knee = (g, { legs }) => { const b = mesh(new THREE.BoxGeometry(1.02, 0.42, 0.2), plastic('#ffffff'), 0, -1.0, 0.52); legs[1].add(b); };
const apron = (g, { box, torso }) => { const a = box(1.9, 2.4, 0.2, plastic('#ffffff'), 0.06); a.position.set(0, -0.35, 1.05); torso.add(a); const s = box(1.7, 0.18, 0.2, plastic('#f0f0f0'), 0.05); s.position.set(0, 0.6, 0.72); };
const belly = (g, P) => { const b = P.box(2.3, 2.1, 0.75, P.torso.material[0], 0.3); b.position.set(0, -0.2, 0.55); P.torso.add(b); };
const TOWN_SHIRTS = ['#e74c3c', '#2e86de', '#27ae60', '#f39c12', '#8e44ad', '#e84393', '#16a085', '#d35400', '#00b8d4', '#c0392b', '#ffd23f', '#6ab04c'];
const LOOK = {
  milo:   () => ({ faceStyle: { iris: '#5a3a1a', eyeH: 1.05 }, shirt: '#2f80ed', shirtOpts: { collar: '#ffffff', print: 'star' }, pants: '#46505c', shoe: '#e74c3c', hair: '#6b3e1e' }),
  tilda:  () => ({ faceStyle: { cheeks: true }, shirt: '#9b59b6', shirtOpts: { collar: '#e6e6e6', print: 'buttons' }, pants: '#2c3e70', shoe: '#5b3a1e', hair: '#f4f4f4', hairStyle: 'bun', face: 'old', bunTie: '#d8d8d8', extras: [cane] }),
  youngtilda: () => ({ faceStyle: { lashes: true, iris: '#3a2a1a' }, shirt: '#ff6fa8', shirtOpts: { collar: '#ffffff', print: 'dots' }, pants: '#2c3e70', shoe: '#5b3a1e', hair: '#4a2a14', hairStyle: 'bun', face: 'smile', bunTie: '#3a2010' }),
  pip:    () => ({ faceStyle: { freckles: true, eyeW: 1.15, eyeH: 1.1 }, shirt: '#ff7a1a', shirtOpts: { collar: '#ffffff', print: 'stripes' }, pants: '#2e86de', shoe: '#444', hair: '#151515', hairStyle: 'spiky', extras: [knee], scale: 0.72 }),
  lena:   () => ({ faceStyle: { lashes: true, freckles: true, iris: '#5a3a1a' }, shirt: GREY.shirt, pants: GREY.pants, shoe: '#444', hair: '#6b3e1e', hairStyle: 'pigtails', scale: 0.68 }),
  baker:  () => ({ faceStyle: { brows: '#3a2a1a', moustache: '#5a3a1a', eyeW: 0.85 }, shirt: '#3a9bff', shirtOpts: { collar: '#ffffff', print: 'plaid' }, pants: '#2c3e50', shoe: '#333', hair: '#f5cd4f', hairStyle: 'none', face: 'grumpy', extras: [belly, apron], scale: 1.18 }),
  towns:  (i) => ({ faceStyle: [{}, { freckles: true }, { lashes: true, iris: '#2e6b3a' }, { moustache: '#3a2a1a', brows: '#3a2a1a' }, { cheeks: true, eyeW: 1.2 }, { lashes: true, cheeks: true }, { eyeH: 0.7, brows: '#151515' }][i % 7], shirt: TOWN_SHIRTS[i % TOWN_SHIRTS.length], shirtOpts: { collar: '#ffffff', print: ['stripes', null, 'overalls', 'dots', 'plaid', 'heart', 'buttons'][i % 7] }, pants: ['#2c3e50', '#5d4037', '#1e3799', '#34495e', '#6d214f'][i % 5], shoe: '#333', hair: ['#151515', '#6b3e1e', '#c9822f', '#4a2a14', '#e0b040', '#7a2e1e'][i % 6], hairStyle: ['short', 'messy', 'spiky', 'short', 'messy'][i % 5], towns: true }),
  home:   (i) => ({ faceStyle: [{ freckles: true }, { lashes: true }, { moustache: '#3a2a1a' }, { cheeks: true }][i % 4], shirtOpts: { collar: '#ffffff', print: ['stripes', 'dots', 'overalls', 'plaid'][i % 4] }, shirt: ['#e74c3c', '#8e44ad', '#16a085', '#f39c12'][i % 4], shirtOpts: { collar: '#ffffff' }, pants: '#46505c', shoe: '#333', hair: ['#6b3e1e', '#151515', '#c9822f', '#4a2a14'][i % 4], hairStyle: ['messy', 'short', 'spiky', 'short'][i % 4] }),
};
export function makeCharacter(who, idx = 0, faceTexFn) {
  const L = LOOK[who](idx);
  const a = avatar({ ...L, ...(who !== 'milo' ? { shirt: '#ffffff', pants: '#ffffff' } : {}), face: 'smile' });
  const P = a.userData;
  P.who = who; P.scale = L.scale || 1; a.scale.setScalar(P.scale);
  P.hairBase = { messy: 0.92, bun: 0.78, spiky: 0.95, pigtails: 0.8, short: 0.78, none: 0.6 }[L.hairStyle || 'messy'];
  P.hairStyle = L.hairStyle || 'messy';
  if (L.towns) P.towns = true;
  P.setClothes = (shirt, pants) => { if (shirt) P.shirtMats.forEach(m => m.color.set(shirt)); if (pants) P.pantsMat.color.set(pants); };
  if (who !== 'milo') P.setClothes(L.shirt, L.pants);
  const faces = {};
  P.setFace = (k) => { if (P.faceKind === k) return; P.faceKind = k; P.faceMesh.material[4] = faces[k] ||= texMat(faceTexFn(k, who === 'baker', L.faceStyle || {})); };
  P.defaultFace = L.face || 'smile'; P.setFace(P.defaultFace);
  return a;
}

// ---------------- faces (drawn like lib.faceTex, more expressions) ----------------
export function faceKind(kind, flour = false, st = {}) {
  return canvasTex(256, 256, (g) => {
    g.fillStyle = '#f5cd4f'; g.fillRect(0, 0, 256, 256);
    const K = '#151515'; g.fillStyle = K; g.strokeStyle = K; g.lineCap = 'round';
    const eye = (x, y, rx, ry) => { rx *= st.eyeW || 1; ry *= st.eyeH || 1; if (st.iris) { g.fillStyle = '#fff'; g.beginPath(); g.ellipse(x, y, rx * 1.35, ry * 1.2, 0, 0, 7); g.fill(); g.fillStyle = st.iris; g.beginPath(); g.ellipse(x, y + 1, rx * 0.95, ry * 0.9, 0, 0, 7); g.fill(); }
      g.fillStyle = K; g.beginPath(); g.ellipse(x, y + (st.iris ? 2 : 0), rx * (st.iris ? 0.55 : 1), ry * (st.iris ? 0.55 : 1), 0, 0, 7); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(x - 3, y - 6, 4, 0, 7); g.fill();
      if (st.lashes) { g.strokeStyle = K; g.lineWidth = 4; for (const d of [-1, 0, 1]) { g.beginPath(); g.moveTo(x + d * rx * 0.7, y - ry * 0.9); g.lineTo(x + d * rx * 1.1, y - ry * 1.4); g.stroke(); } }
      g.fillStyle = K; };
    const arc = (x, y, r, a0, a1, w = 10) => { g.lineWidth = w; g.beginPath(); g.arc(x, y, r, a0 * Math.PI, a1 * Math.PI); g.stroke(); };
    const line = (x0, y0, x1, y1, w = 8) => { g.lineWidth = w; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); };
    const blush = (a = 0.3) => { g.fillStyle = `rgba(240,120,110,${a})`; g.beginPath(); g.arc(66, 150, 16, 0, 7); g.arc(190, 150, 16, 0, 7); g.fill(); g.fillStyle = K; };
    const old = kind.startsWith('old');
    const ex = old ? 11 : 13, ey = old ? 15 : 19, Y = old ? 112 : 108;
    if (old) { g.strokeStyle = '#6b6b6b'; line(70, 80, 106, 76, 6); line(150, 76, 186, 80, 6); g.strokeStyle = K; }
    switch (kind) {
      case 'smile': case 'old': eye(90, Y, ex, ey); eye(166, Y, ex, ey); arc(128, old ? 150 : 146, old ? 30 : 46, 0.18, 0.82, old ? 8 : 10); blush(); break;
      case 'happy': case 'oldhappy': g.lineWidth = 9; arc(90, Y + 8, 14, 1.1, 1.9, 9); arc(166, Y + 8, 14, 1.1, 1.9, 9); g.beginPath(); g.moveTo(84, 146); g.quadraticCurveTo(128, 214, 172, 146); g.closePath(); g.fill(); g.fillStyle = '#e8706a'; g.beginPath(); g.ellipse(128, 176, 22, 10, 0, 0, 7); g.fill(); blush(0.4); break;
      case 'surprised': case 'oldsurprised': eye(88, 106, 14, 21); eye(168, 106, 14, 21); g.beginPath(); g.ellipse(128, 180, 15, 19, 0, 0, 7); g.fill(); break;
      case 'shy': eye(90, 112, 12, 16); eye(166, 112, 12, 16); arc(128, 150, 26, 0.2, 0.8, 8); blush(0.55); break;
      case 'serious': case 'oldserious': eye(90, 110, 12, 17); eye(166, 110, 12, 17); line(72, 82, 108, 88); line(148, 88, 184, 82); line(108, 170, 148, 170); break;
      case 'worried': eye(90, 112, 12, 17); eye(166, 112, 12, 17); line(72, 86, 106, 78); line(150, 78, 184, 86); arc(128, 190, 24, 1.15, 1.85, 8); break;
      case 'sad': case 'oldsad': eye(90, 114, 11, 15); eye(166, 114, 11, 15); line(72, 90, 106, 80); line(150, 80, 184, 90); arc(128, 192, 26, 1.15, 1.85, 8); break;
      case 'cry': eye(90, 112, 11, 14); eye(166, 112, 11, 14); line(72, 90, 106, 80); line(150, 80, 184, 90); g.beginPath(); g.ellipse(128, 182, 18, 12, 0, 0, 7); g.fill();
        g.fillStyle = '#5fb8ff'; for (const x of [84, 172]) { g.beginPath(); g.moveTo(x - 8, 130); g.lineTo(x + 8, 130); g.lineTo(x + 6, 200); g.lineTo(x - 6, 200); g.fill(); } break;
      case 'grumpy': case 'angry': case 'oldstern': eye(90, Y + 4, ex, ey - 3); eye(166, Y + 4, ex, ey - 3); g.strokeStyle = K; line(68, 78, 110, 96, 10); line(146, 96, 188, 78, 10); if (kind === 'angry') { g.beginPath(); g.ellipse(128, 180, 22, 14, 0, 0, 7); g.fill(); } else arc(128, 196, 28, 1.2, 1.8, 9); break;
      case 'sleep': arc(90, 104, 14, 0.1, 0.9, 7); arc(166, 104, 14, 0.1, 0.9, 7); arc(128, 160, 12, 0.1, 0.9, 6); blush(0.25); break;
      default: eye(90, Y, ex, ey); eye(166, Y, ex, ey); arc(128, 146, 46, 0.18, 0.82); blush();
    }
    if (st.freckles) { g.fillStyle = 'rgba(160,90,40,0.75)'; for (const [x, y] of [[58, 140], [70, 150], [80, 138], [176, 138], [186, 150], [198, 140]]) { g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill(); } }
    if (st.brows && !old) { g.fillStyle = st.brows; g.fillRect(70, 70, 38, 9); g.fillRect(148, 70, 38, 9); }
    if (st.moustache) { g.fillStyle = st.moustache; g.beginPath(); g.ellipse(108, 150, 22, 9, -0.2, 0, 7); g.ellipse(148, 150, 22, 9, 0.2, 0, 7); g.fill(); }
    if (st.cheeks) { g.fillStyle = 'rgba(255,110,120,0.45)'; g.beginPath(); g.arc(62, 152, 18, 0, 7); g.arc(194, 152, 18, 0, 7); g.fill(); }
    if (flour) { g.fillStyle = 'rgba(255,255,255,0.85)'; for (const [x, y, r] of [[60, 150, 13], [74, 166, 8], [192, 146, 12], [178, 168, 8], [200, 160, 6]]) { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); } }
  });
}

export { sun };

// ---------------- NEIGHBORHOOD (2026-11-25, owner: "pangit ang background") ----------------
// Kenney city-kit-suburban houses across a quiet street. Stage (cast) stands on the near sidewalk around z = 0..6,
// camera looks toward -z: sidewalk -> street -> lawns, fences, trees -> a row of colourful houses -> sky.
export async function buildSuburb({ cars = true } = {}) {
  scene.add(baseplate('#6cc24a'));
  const tasks = [];
  for (let x = -5; x <= 5; x++) {
    tasks.push(put('r', 'road-straight', x, -1, Math.PI / 2));                 // street (z ≈ -14)
    tasks.push(put('r', 'tile-low', x, 0, 0));                                 // near sidewalk under the cast
    tasks.push(put('r', 'tile-low', x, -2, 0));                                // far sidewalk
  }
  const HOUSES = ['building-type-a', 'building-type-c', 'building-type-e', 'building-type-g', 'building-type-i', 'building-type-k', 'building-type-m', 'building-type-o', 'building-type-q'];
  const COL = ['#ffd6e0', '#cfe8ff', '#fff1b8', '#d8f5c8', '#ffe0c2', '#e6d8ff'];
  for (let i = 0, x = -4; x <= 4; x++, i++) {
    tasks.push(put('s', HOUSES[i % HOUSES.length], x, -3.4, Math.PI, { color: null }).then(m => { if (i % 2) m.traverse(o => { if (o.isMesh && o.material.color.r > 0.8) o.material.color.set(COL[i % COL.length]); }); }));
    tasks.push(put('s', 'fence-1x2', x, -2.6, 0));
    tasks.push(put('s', i % 2 ? 'tree-large' : 'tree-small', x + 0.45, -2.75, i));
  }
  for (const x of [-4.5, -1.5, 1.5, 4.5]) tasks.push(put('s', 'planter', x, 0.42, 0));
  for (let x = -4.5; x <= 4.5; x += 3) tasks.push(put('r', 'light-square', x, -0.45, 0));
  await Promise.all(tasks);
  if (cars) { car(-30, -18, '#3a86ff', Math.PI / 2); car(26, -10, '#ff4d6d', -Math.PI / 2); }
  for (let x = -60; x <= 60; x += 9) flowerBed(x, 9.5, 5);
}
