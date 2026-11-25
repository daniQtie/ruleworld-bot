// Story 001 sets + props (code-built, no downloads): home kitchen/dining (+ hallway, birthday decor), Lily's bedroom
// at night. Bright blocky "game" interiors, mood colour per scene (Rule M), readable props (Rule L).
import { THREE, scene, canvasTex, plastic, studTex } from './lib.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const mesh = (geo, mat, x = 0, y = 0, z = 0, parent = scene, shadow = true) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = shadow; m.receiveShadow = true; parent.add(m); return m; };
const box = (w, h, d, mat, x, y, z, parent = scene, shadow = true) => mesh(new THREE.BoxGeometry(w, h, d), mat, x, y, z, parent, shadow);
const rbox = (w, h, d, mat, r = 0.08) => { const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2.01, h / 2.01, d / 2.01)), mat); m.castShadow = m.receiveShadow = true; return m; };
const glow = (c, i = 1.5) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: i, roughness: 0.4 });
const tex = (w, h, draw, rx = 1, ry = rx) => canvasTex(w, h, draw, rx, ry);
const woodFloor = (base) => tex(256, 256, (g) => { g.fillStyle = base; g.fillRect(0, 0, 256, 256); for (let y = 0; y < 256; y += 32) { g.fillStyle = 'rgba(0,0,0,0.13)'; g.fillRect(0, y, 256, 3); g.fillStyle = 'rgba(255,255,255,0.05)'; g.fillRect(0, y + 6, 256, 8); for (let x = (y / 32 % 2) * 64; x < 256; x += 128) { g.fillStyle = 'rgba(0,0,0,0.13)'; g.fillRect(x, y, 3, 32); } } }, 8, 8);
const wallpaper = (base, dot) => tex(128, 128, (g) => { g.fillStyle = base; g.fillRect(0, 0, 128, 128); g.fillStyle = dot; for (let y = 16; y < 128; y += 32) for (let x = (y / 32 % 2) * 16 + 8; x < 128; x += 32) { g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill(); } }, 8, 4);
function skyWindow(kind) {
  return tex(256, 256, (g) => {
    const gr = g.createLinearGradient(0, 0, 0, 256);
    const C = { day: ['#5fb4ff', '#bfe6ff'], morning: ['#9cc9f0', '#ffe2b8'], evening: ['#5b4b9a', '#ff9c6b'], night: ['#060c24', '#1b2d5c'] }[kind] || ['#5fb4ff', '#bfe6ff'];
    gr.addColorStop(0, C[0]); gr.addColorStop(1, C[1]); g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
    if (kind === 'night') { g.fillStyle = '#fff'; let s = 5; const r = () => (s = (s * 16807) % 2147483647) / 2147483647; for (let i = 0; i < 60; i++) { g.globalAlpha = 0.4 + r() * 0.6; g.fillRect(r() * 256, r() * 200, 2, 2); } g.globalAlpha = 1; g.fillStyle = '#f7f1cf'; g.beginPath(); g.arc(180, 70, 30, 0, 7); g.fill(); }
    if (kind !== 'night') { g.fillStyle = 'rgba(255,255,255,0.85)'; for (const [x, y] of [[60, 70], [170, 120]]) { g.beginPath(); g.arc(x, y, 22, 0, 7); g.arc(x + 24, y - 8, 26, 0, 7); g.arc(x + 50, y, 20, 0, 7); g.fill(); } }
    g.fillStyle = '#5fbf5a'; g.fillRect(0, 220, 256, 36);
  });
}
function windowOn(parent, x, y, z, w, h, kind, ry = 0) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g);
  const sky = mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: skyWindow(kind), toneMapped: false }), 0, 0, -0.05, g, false);
  const fr = plastic('#ffffff');
  for (const [px, py, pw, ph] of [[0, h / 2, w + 0.6, 0.5], [0, -h / 2, w + 0.9, 0.6], [-w / 2, 0, 0.4, h], [w / 2, 0, 0.4, h], [0, 0, 0.25, h], [0, 0, w, 0.25]]) box(pw, ph, 0.5, fr, px, py, 0.1, g, false);
  return g;
}

// ------------------------------------------------------------------------------------------------
// HOME (kitchen + dining). Table centre (0, 1.5). Back wall z = -12 (counter), left wall x = -16 with the hallway
// doorway (z -6..0), right wall x = 16. Camera usually from +z. Seats (chair centres): see SEATS.
export const SEATS = { noah: [-2.4, -1.2], lily: [2.6, -1.2], dad: [6.4, 1.5], front: [0, 4.4] };
export const TABLE = { x: 0, z: 1.5, top: 2.75 };
export function buildHome({ time = 'evening', birthday = false, breakfast = false, seats = null } = {}) {
  const SE = { ...SEATS, ...(seats || {}) };
  const night = time === 'night';
  const floor = mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshStandardMaterial({ map: woodFloor('#c98d58'), roughness: 0.75 }), 0, 0, 0, scene, false); floor.rotation.x = -Math.PI / 2;
  const wallM = new THREE.MeshStandardMaterial({ map: wallpaper(birthday ? '#ffe3ec' : '#fff0c2', birthday ? '#ffc2d6' : '#ffd98a'), roughness: 0.9 });
  const sideM = new THREE.MeshStandardMaterial({ map: wallpaper('#cdeee0', '#a9dcc7'), roughness: 0.9 });
  box(34, 15, 0.6, wallM, 0, 7.5, -12.3, scene, false);
  box(0.6, 15, 9, sideM, -16.3, 7.5, -7.8, scene, false); box(0.6, 15, 22, sideM, -16.3, 7.5, 11, scene, false); box(0.6, 4, 6.6, sideM, -16.3, 13, -3, scene, false);
  box(0.6, 15, 40, sideM, 16.3, 7.5, 6, scene, false);
  box(34, 0.8, 0.4, plastic('#ffffff'), 0, 0.4, -11.9, scene, false);   // skirting
  // hallway behind the left doorway: dimmer, cooler (where the monster grows)
  const hall = new THREE.MeshStandardMaterial({ color: '#8d84b8', roughness: 0.9 });
  box(0.6, 15, 16, hall, -24, 7.5, -3, scene, false); const hf = mesh(new THREE.PlaneGeometry(10, 16), new THREE.MeshStandardMaterial({ color: '#7b5a44' }), -21, 0.01, -3, scene, false); hf.rotation.x = -Math.PI / 2;
  for (const s of [-1, 1]) box(1, 11, 0.8, plastic('#ffffff'), -16.3, 5.5, -3 + s * 3.3, scene, false);
  // counter + cabinets along the back wall
  const cab = plastic('#6fcfb4'), top = plastic('#fafafa');
  box(18, 3.0, 3, cab, -5, 1.5, -10.6); box(18.4, 0.35, 3.3, top, -5, 3.15, -10.6);
  for (let i = 0; i < 6; i++) { box(2.6, 2.3, 0.1, plastic('#86dcc4'), -12.6 + i * 3, 1.5, -9.05); mesh(new THREE.SphereGeometry(0.14, 10, 8), plastic('#ffd23f'), -11.6 + i * 3, 2.2, -8.95); }
  box(18, 3, 1.6, cab, -5, 10.2, -11.4); for (let i = 0; i < 6; i++) box(2.6, 2.4, 0.1, plastic('#86dcc4'), -12.6 + i * 3, 10.2, -10.55);
  box(3.2, 7.2, 3, plastic('#e9f1f7'), 6.8, 3.6, -10.6); box(0.18, 2.6, 0.2, plastic('#9aa7b3'), 5.4, 4.9, -9.0);                 // fridge
  mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.3, 20), plastic('#ff6b6b'), -8, 3.5, -10.4); mesh(new THREE.CylinderGeometry(0.5, 0.6, 1.1, 16), plastic('#ffd23f'), -3.5, 3.85, -10.6);
  windowOn(scene, 12, 8.2, -11.9, 5.6, 5, night ? 'night' : time);
  // wall clock + family photo on the right wall
  const clock = mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.2, 28), plastic('#ffffff'), 2, 11.6, -11.9, scene, false); clock.rotation.x = Math.PI / 2;
  box(0.08, 0.8, 0.05, plastic('#333'), 2, 11.9, -11.75, scene, false); box(0.6, 0.08, 0.05, plastic('#333'), 2.25, 11.6, -11.75, scene, false);
  const photo = mesh(new THREE.PlaneGeometry(3.2, 2.4), new THREE.MeshStandardMaterial({ map: tex(160, 120, (g) => { g.fillStyle = '#bfe6ff'; g.fillRect(0, 0, 160, 120); g.fillStyle = '#7ccf6b'; g.fillRect(0, 86, 160, 34);
    for (const [x, c, h] of [[44, '#3b7de0', 54], [84, '#3a8e5a', 66], [118, '#ff86b6', 40]]) { g.fillStyle = '#e4a676'; g.fillRect(x - 8, 86 - h - 14, 16, 14); g.fillStyle = c; g.fillRect(x - 11, 86 - h, 22, h); } g.strokeStyle = '#8a5a2b'; g.lineWidth = 10; g.strokeRect(0, 0, 160, 120); }) }), 15.95, 9, 4, scene, false);
  photo.rotation.y = -Math.PI / 2;
  // table + chairs
  const wood = plastic('#b5713f'), cloth = plastic(birthday ? '#ff9ec3' : '#ffffff');
  box(10, 0.4, 5, wood, TABLE.x, TABLE.top - 0.2, TABLE.z);
  if (birthday || breakfast) box(10.2, 0.06, 5.2, cloth, TABLE.x, TABLE.top + 0.03, TABLE.z);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(0.45, TABLE.top - 0.4, 0.45, wood, TABLE.x + sx * 4.5, (TABLE.top - 0.4) / 2, TABLE.z + sz * 2.0);
  const chair = (x, z, ry, color = '#8a5a2b') => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g); const m = plastic(color);
    box(2, 0.25, 2, m, 0, 1.75, 0, g); for (const a of [-0.8, 0.8]) for (const b of [-0.8, 0.8]) box(0.25, 1.75, 0.25, m, a, 0.87, b, g); box(2, 2.4, 0.25, m, 0, 3.0, -0.9, g); return g; };
  chair(SE.noah[0], SE.noah[1], 0); chair(SE.lily[0], SE.lily[1], 0);
  chair(SE.dad[0], SE.dad[1], -Math.PI / 2, birthday ? '#6b7a99' : '#8a5a2b');                                  // Dad's chair
  // light: warm lamp over the table (+ cool hallway)
  const lampC = night ? '#ffc98a' : '#ffe2b8';
  mesh(new THREE.ConeGeometry(1.4, 1, 20, 1, true), new THREE.MeshStandardMaterial({ color: '#ffd23f', side: THREE.DoubleSide }), TABLE.x, 13.2, TABLE.z, scene, false);
  mesh(new THREE.SphereGeometry(0.45, 14, 10), glow('#fff3c4', 2.5), TABLE.x, 12.6, TABLE.z, scene, false);
  const L = new THREE.PointLight(lampC, night ? 230 : time === 'evening' ? 150 : 110, 0, 1.25); L.position.set(TABLE.x, 12, TABLE.z + 1); scene.add(L);
  const H = new THREE.PointLight('#8f9cff', 60, 0, 1.4); H.position.set(-21, 9, -3); scene.add(H);
  if (birthday) {
    // banner (exact text) + string lights + balloons
    const ban = mesh(new THREE.PlaneGeometry(16, 2.2), new THREE.MeshBasicMaterial({ transparent: true, toneMapped: false, map: tex(1024, 140, (g) => {
      const W = 'HAPPY BIRTHDAY LILY'.split(''), C = ['#ff5c8a', '#ffd23f', '#3fa9ff', '#7ee07e', '#b98cff'];
      W.forEach((ch, i) => { const x = 20 + i * 52; if (ch === ' ') return; g.fillStyle = C[i % C.length]; g.beginPath(); g.moveTo(x, 10); g.lineTo(x + 48, 10); g.lineTo(x + 24, 130); g.closePath(); g.fill(); g.fillStyle = '#fff'; g.font = 'bold 38px Arial'; g.textAlign = 'center'; g.fillText(ch, x + 24, 62); });
      g.strokeStyle = '#ffffff'; g.lineWidth = 4; g.beginPath(); g.moveTo(0, 10); g.lineTo(1024, 10); g.stroke(); }) }), -4, 13.0, -11.85, scene, false);
    const bulbs = [];
    for (let i = 0; i < 26; i++) { const x = -15 + i * 1.2, y = 14.4 - Math.sin(i / 25 * Math.PI) * 0.9; bulbs.push(mesh(new THREE.SphereGeometry(0.2, 8, 6), glow(['#ffd23f', '#ff8fb8', '#8fd0ff'][i % 3], 2.4), x, y, -11.7, scene, false)); }
    for (const [x, z, c] of [[13.5, -6, '#ff5c8a'], [14.3, -4.5, '#3fa9ff'], [12.8, -4.2, '#ffd23f']]) { mesh(new THREE.SphereGeometry(1, 18, 14), plastic(c, { roughness: 0.25 }), x, 9.5 + (x - 13) * 0.6, z, scene, false).scale.set(1, 1.2, 1); box(0.04, 8, 0.04, plastic('#ffffff'), x, 5, z, scene, false); }
  }
  return { L };
}

// LILY'S BEDROOM at night: lavender walls, big window (moon), bed, star night-light. Window wall z = -10.
export function buildLilyRoom() {
  const floor = mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({ map: woodFloor('#b98a6a'), roughness: 0.8 }), 0, 0, 0, scene, false); floor.rotation.x = -Math.PI / 2;
  const rug = mesh(new THREE.CylinderGeometry(4.5, 4.5, 0.05, 32), plastic('#ff9ec3'), 2, 0.03, 0, scene, false);
  const wall = new THREE.MeshStandardMaterial({ map: wallpaper('#c9b5f0', '#e8dcff'), roughness: 0.9 });
  box(34, 15, 0.6, wall, 0, 7.5, -10.3, scene, false); box(0.6, 15, 30, wall, -13, 7.5, 4, scene, false); box(0.6, 15, 30, wall, 13, 7.5, 4, scene, false);
  windowOn(scene, 1.5, 7.5, -9.9, 8, 6.5, 'night');
  // front wall with the door (Noah stands in the doorway at x = 8)
  box(18, 15, 0.6, wall, -4, 7.5, 12.3, scene, false); box(5, 15, 0.6, wall, 11, 7.5, 12.3, scene, false); box(4, 4, 0.6, wall, 7.5, 13, 12.3, scene, false);
  for (const x of [5.4, 9.6]) box(0.5, 11, 0.9, plastic('#ffffff'), x, 5.5, 12.3, scene, false);
  const hall = mesh(new THREE.PlaneGeometry(4.2, 11), new THREE.MeshBasicMaterial({ color: '#2b2f52' }), 7.5, 5.5, 12.7, scene, false); hall.rotation.y = Math.PI;
  box(9.2, 0.5, 1.2, plastic('#ffffff'), 1.5, 4.0, -9.4, scene, false);                       // sill (Lily leans here)
  const bed = new THREE.Group(); bed.position.set(-8, 0, -4); scene.add(bed);
  box(5, 1.4, 9, plastic('#f2f2f2'), 0, 0.7, 0, bed); box(5, 3.6, 0.6, plastic('#ff86b6'), 0, 1.8, -4.4, bed);
  const bl = rbox(5.1, 0.6, 5.6, plastic('#ff86b6'), 0.25); bl.position.set(0, 1.6, 1.5); bed.add(bl);
  box(3, 0.6, 1.5, plastic('#ffffff'), 0, 1.7, -3.3, bed);
  box(2, 2.2, 2, plastic('#ffd9a8'), -8, 1.1, -9, scene); mesh(new THREE.SphereGeometry(0.6, 14, 10), glow('#fff0b8', 2.6), -8, 2.9, -9, scene, false);
  const lamp = new THREE.PointLight('#ffc98a', 140, 0, 1.3); lamp.position.set(-8, 4, -7); scene.add(lamp);
  const fillN = new THREE.PointLight('#c9d4ff', 160, 0, 1.2); fillN.position.set(5, 7, -2); scene.add(fillN);   // soft moonlit fill so faces read at night
  const moon = new THREE.SpotLight('#a8c4ff', 900, 60, 0.55, 0.6, 1.4); moon.position.set(1.5, 12, -16); moon.target.position.set(1.5, 0, 2); moon.castShadow = true; scene.add(moon, moon.target);
  for (let i = 0; i < 9; i++) { const s = mesh(new THREE.OctahedronGeometry(0.3, 0), glow('#fff3a8', 1.8), -12.6, 9 + Math.sin(i * 2.1) * 3, -6 + i * 1.6, scene, false); s.scale.set(0.3, 1, 1); }
}


// ---------------- SCHOOL (story 004): classroom, library, hallway ----------------
const checker = (a, b, rx = 10) => tex(128, 128, (g) => { g.fillStyle = a; g.fillRect(0, 0, 128, 128); g.fillStyle = b; g.fillRect(0, 0, 64, 64); g.fillRect(64, 64, 64, 64); }, rx, rx);
const rnd = (seed) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
export const COLS = [-10, -3.5, 3.5, 10], ROWS = [-6, 0, 6];
export const seatAt = (r, c) => [COLS[c], ROWS[r] + 2.4];   // chair centre; students face -z (toward the board)
export function buildSchool(kind = 'classroom', { boardText = 'CLASS VOTE', boardSub = 'who would you want beside you?' } = {}) {
  const R = rnd(11);
  const ptLight = (x, y, z, i = 55, c = '#fff4e0') => { const L = new THREE.PointLight(c, i, 0, 1.3); L.position.set(x, y, z); scene.add(L); };
  if (kind === 'classroom') {
    const fl = mesh(new THREE.PlaneGeometry(90, 90), new THREE.MeshStandardMaterial({ map: checker('#f6efd8', '#bfe3d0', 22), roughness: 0.7 }), 0, 0, 0, scene, false); fl.rotation.x = -Math.PI / 2;
    const wall = new THREE.MeshStandardMaterial({ map: wallpaper('#fff0c2', '#ffe08a'), roughness: 0.9 }), side = new THREE.MeshStandardMaterial({ map: wallpaper('#d7efff', '#bfe3ff'), roughness: 0.9 });
    box(44, 16, 0.6, wall, 0, 8, -16.3, scene, false); box(44, 16, 0.6, wall, 0, 8, 17, scene, false);
    box(0.6, 16, 34, side, -21, 8, 0, scene, false); box(0.6, 16, 34, side, 21, 8, 0, scene, false);
    box(44, 0.7, 0.4, plastic('#ffffff'), 0, 0.35, -15.9, scene, false);
    // board
    const bt = tex(1024, 400, (g) => { g.fillStyle = '#2e7d5b'; g.fillRect(0, 0, 1024, 400); g.fillStyle = 'rgba(255,255,255,0.9)'; g.textAlign = 'center'; { const bl = boardText.split('|'); if (bl.length > 1) { g.font = 'bold 120px Arial'; bl.forEach((s, k) => g.fillText(s, 512, 145 + k * 185)); } else { g.font = 'bold 150px Arial'; g.fillText(boardText, 512, 215); } }
      g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = 8; g.beginPath(); g.moveTo(230, 250); g.lineTo(794, 250); g.stroke(); g.font = '70px Arial'; if (boardSub) g.fillText(boardSub, 512, 340); });
    box(18, 8, 0.4, plastic('#8a5a2b'), 0, 9, -15.8, scene, false); mesh(new THREE.PlaneGeometry(17, 6.8), new THREE.MeshBasicMaterial({ map: bt, toneMapped: false }), 0, 9, -15.55, scene, false);
    // windows (left wall) + door (right wall)
    for (const z of [-7, 4]) windowOn(scene, -20.6, 9.5, z, 6, 5.5, 'day', Math.PI / 2);
    box(0.5, 10, 4.4, plastic('#8a5a2b'), 20.6, 5, -6, scene, false);
    // desks + chairs
    const chairC = ['#ff9f43', '#54a0ff', '#1dd1a1', '#ff6b6b'];
    ROWS.forEach((rz, r) => COLS.forEach((cx, c) => {
      const wood = plastic('#d9a35a'), leg = plastic('#555b66');
      box(3.8, 0.3, 2.4, wood, cx, 2.75, rz); for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(0.22, 2.6, 0.22, leg, cx + sx * 1.6, 1.3, rz + sz * 0.9);
      const cz = rz + 2.4, cm = plastic(chairC[(r + c) % 4]); box(2, 0.25, 2, cm, cx, 1.75, cz); box(2, 2.2, 0.25, cm, cx, 3.0, cz + 0.95); for (const a of [-0.8, 0.8]) for (const b of [-0.8, 0.8]) box(0.22, 1.75, 0.22, leg, cx + a, 0.87, cz + b);
    }));
    // teacher desk (front left)
    box(7, 0.4, 3, plastic('#8a5a2b'), -12, 3.2, -12.5); box(6.6, 3, 2.6, plastic('#a8723a'), -12, 1.5, -12.5);
    ptLight(-8, 13, -6); ptLight(8, 13, -6); ptLight(-8, 13, 8); ptLight(8, 13, 8);
  } else if (kind === 'library') {
    const fl = mesh(new THREE.PlaneGeometry(90, 90), new THREE.MeshStandardMaterial({ map: woodFloor('#b98a5e'), roughness: 0.8 }), 0, 0, 0, scene, false); fl.rotation.x = -Math.PI / 2;
    const wall = new THREE.MeshStandardMaterial({ map: wallpaper('#e9d7ff', '#d8bfff'), roughness: 0.9 });
    box(44, 16, 0.6, wall, 0, 8, -16.3, scene, false); box(44, 16, 0.6, wall, 0, 8, 17, scene, false); box(0.6, 16, 34, wall, -21, 8, 0, scene, false); box(0.6, 16, 34, wall, 21, 8, 0, scene, false);
    const PAL = ['#e74c3c', '#f39c12', '#3498db', '#2ecc71', '#9b59b6', '#f1c40f', '#1abc9c', '#e84393'];
    for (const sx of [-12, 0, 12]) {
      box(9, 12, 1.8, plastic('#7b4a22'), sx, 6, -15, scene, false);
      for (let row = 0; row < 4; row++) { box(8.4, 0.25, 1.7, plastic('#5a3519'), sx, 1.2 + row * 2.9, -15, scene, false);
        let x = sx - 4; while (x < sx + 3.8) { const w = 0.35 + R() * 0.35, h = 1.5 + R() * 0.9; box(w, h, 1.2, plastic(PAL[(R() * PAL.length) | 0]), x + w / 2, 1.35 + row * 2.9 + h / 2, -14.9, scene, false); x += w + 0.04; } }
    }
    windowOn(scene, -20.6, 9, 2, 7, 6, 'evening', Math.PI / 2);
    box(14, 0.4, 5, plastic('#a8723a'), 0, 2.8, 0); for (const sx of [-6, 6]) for (const sz of [-2, 2]) box(0.4, 2.6, 0.4, plastic('#7b4a22'), sx, 1.3, sz);
    for (const cx of [-5, 0, 5]) { const cm = plastic('#6c5ce7'); box(2, 0.25, 2, cm, cx, 1.75, 4.2); box(2, 2.2, 0.25, cm, cx, 3.0, 5.15); for (const a of [-0.8, 0.8]) for (const b of [-0.8, 0.8]) box(0.22, 1.75, 0.22, plastic('#444'), cx + a, 0.87, 4.2 + b); }
    mesh(new THREE.CylinderGeometry(0.15, 0.15, 2.4, 8), plastic('#333'), -2, 4.2, -1.2); mesh(new THREE.ConeGeometry(1.0, 1.0, 16, 1, true), new THREE.MeshStandardMaterial({ color: '#ffd23f', side: THREE.DoubleSide }), -2, 5.6, -1.2, scene, false);
    mesh(new THREE.SphereGeometry(0.35, 12, 8), glow('#fff3c4', 2.5), -2, 5.3, -1.2, scene, false);
    ptLight(-2, 9, 0, 120, '#ffe2b0'); ptLight(-14, 8, 6, 50, '#ffc58a'); ptLight(10, 10, 4, 60, '#fff0d8');
  } else if (kind === 'hallway') {
    const fl = mesh(new THREE.PlaneGeometry(26, 90), new THREE.MeshStandardMaterial({ map: checker('#f2e6c8', '#c9dff0', 6), roughness: 0.6 }), 0, 0, -10, scene, false); fl.rotation.x = -Math.PI / 2;
    const C = ['#e74c3c', '#2e86de', '#27ae60', '#f39c12', '#8e44ad', '#16a085'];
    for (const sx of [-1, 1]) {
      box(0.8, 14, 90, plastic('#fff4d6'), sx * 10.3, 7, -10, scene, false);
      let z = 14, i = 0; while (z > -42) { const cm = plastic(C[(i + (sx > 0 ? 3 : 0)) % C.length]); box(0.9, 9, 2.2, cm, sx * 9.4, 5.2, z); box(0.15, 8, 1.7, new THREE.MeshStandardMaterial({ color: new THREE.Color(C[(i + (sx > 0 ? 3 : 0)) % C.length]).multiplyScalar(0.72), roughness: 0.6 }), sx * 8.9, 5.2, z); for (let k = 0; k < 3; k++) box(0.1, 0.18, 0.9, plastic('#111'), sx * 8.9, 8.1 + k * 0.28, z); mesh(new THREE.SphereGeometry(0.13, 8, 6), plastic('#ddd'), sx * 8.85, 4.2, z + 0.6, scene, false); z -= 2.3; i++; }
    }
    box(26, 14, 0.6, plastic('#fff4d6'), 0, 7, -44, scene, false); mesh(new THREE.PlaneGeometry(10, 8), new THREE.MeshBasicMaterial({ color: '#dff2ff', toneMapped: false }), 0, 7, -43.6, scene, false);
    box(26, 14, 0.6, plastic('#fff4d6'), 0, 7, 17, scene, false);
    for (let z = 10; z > -40; z -= 10) ptLight(0, 12, z, 70, '#fff4e0');
  }
}


// ---------------- SCHOOL FIELD (story 005): jump area, bleachers, tall gym with a flat roof ----------------
export const FIELD = { barY: 6.5, roofY: 64, roofZ: -31, bleachX: [-17, -19.6, -22.2], tierY: [0, 2.2, 4.4] };
export function buildField({ soccer = false } = {}) {
  const gr = mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshStandardMaterial({ map: studTex('#5fc24a', 200), roughness: 0.8 }), 0, -0.02, 0, scene, false); gr.rotation.x = -Math.PI / 2;
  if (!soccer) box(70, 0.12, 14, plastic('#e2a15a'), 0, 0.05, 6, scene, false);                                     // running lane
  if (!soccer) { box(13, 1.7, 9, plastic('#2f7be0'), 0, 0.85, -5.5); box(13.2, 0.25, 9.2, plastic('#ffd23f'), 0, 1.75, -5.5); }   // landing mat
  if (!soccer) for (const sx of [-6.2, 6.2]) { box(0.5, FIELD.barY + 1.8, 0.5, plastic('#f2f2f2'), sx, (FIELD.barY + 1.8) / 2, 0); box(1.4, 0.3, 1.4, plastic('#444'), sx, 0.15, 0); }
  if (!soccer) { const bar = mesh(new THREE.CylinderGeometry(0.16, 0.16, 12.4, 10), plastic('#e63946'), 0, FIELD.barY, 0); bar.rotation.z = Math.PI / 2; }
  if (soccer) { for (const [w, d, x, z] of [[60, 0.35, 0, 14], [60, 0.35, 0, -14], [0.35, 28, 0, 0]]) box(w || 0.35, 0.06, d, plastic('#ffffff'), x, 0.04, z, scene, false);
    const ring = mesh(new THREE.TorusGeometry(5, 0.18, 6, 40), plastic('#ffffff'), 0, 0.05, 0, scene, false); ring.rotation.x = Math.PI / 2; }
  // bleachers (left), crowd sits on the tiers facing +x
  FIELD.bleachX.forEach((x, i) => { box(2.6, FIELD.tierY[i] + 1.75, 30, plastic(['#e9eef5', '#cfd8e6', '#b8c4d8'][i]), x, (FIELD.tierY[i] + 1.75) / 2, 0); box(2.0, 0.2, 30, plastic('#8a5a2b'), x + 0.2, FIELD.tierY[i] + 1.8, 0, scene, false); });
  // tall gym with a flat roof
  const brick = tex(256, 256, (g) => { g.fillStyle = '#d4573f'; g.fillRect(0, 0, 256, 256); g.fillStyle = 'rgba(0,0,0,0.18)'; for (let y = 0; y < 256; y += 32) { g.fillRect(0, y, 256, 3); for (let x = (y / 32 % 2) * 32; x < 256; x += 64) g.fillRect(x, y, 3, 32); } }, 8, 8);
  mesh(new THREE.BoxGeometry(64, FIELD.roofY, 26), new THREE.MeshStandardMaterial({ map: brick, roughness: 0.9 }), 0, FIELD.roofY / 2, -41);
  box(66, 1.4, 28, plastic('#f2f2f2'), 0, FIELD.roofY + 0.7, -41, scene, false);
  for (let r = 0; r < 5; r++) for (let c = -5; c <= 5; c++) { const w = mesh(new THREE.PlaneGeometry(3.2, 4.4), new THREE.MeshBasicMaterial({ color: '#8fd3ff', toneMapped: false }), c * 5.2, 12 + r * 9.5, -27.9, scene, false); w.rotation.y = 0; }
  const sign = mesh(new THREE.PlaneGeometry(26, 9), new THREE.MeshBasicMaterial({ toneMapped: false, map: tex(512, 180, (c) => { c.fillStyle = '#1b2f66'; c.fillRect(0, 0, 512, 180); c.fillStyle = '#ffd23f'; c.font = 'bold 130px Arial'; c.textAlign = 'center'; c.fillText('GYM', 256, 135); }) }), 0, 54, -27.85, scene, false);
  mesh(new THREE.CylinderGeometry(0.25, 0.25, 36, 8), plastic('#cfcfcf'), 24, 18, -12, scene, false); box(6, 3.6, 0.2, plastic('#e63946'), 27, 33, -12, scene, false);   // flagpole + flag
  const L = new THREE.PointLight('#fff4e0', 0, 0, 1); scene.add(L);
}
export const crowdSeats = (n = 12) => { const out = []; let k = 0; for (let t = 0; t < 3 && out.length < n; t++) for (let z = -10; z <= 10 && out.length < n; z += 5) out.push({ at: [FIELD.bleachX[t] + 0.2, z + (t % 2 ? 2.5 : 0)], y: FIELD.tierY[t] }); return out; };


// ---------------- NIGHT FOREST (style ref 2026-11-22): blocky trees around a clearing, teal moonlight ----------------
export function buildForest({ night = true } = {}) {
  const gr = mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshStandardMaterial({ map: studTex(night ? '#2f6b34' : '#5fb24a', 200), roughness: 0.9 }), 0, -0.02, 0, scene, false); gr.rotation.x = -Math.PI / 2;
  const trunk = plastic('#6b3f24'), leafA = plastic(night ? '#1f5a2c' : '#2f8a3a'), leafB = plastic(night ? '#28703a' : '#3fa34a');
  let sd = 5; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  for (let x = -60; x <= 60; x += 7) for (let z = -70; z <= 30; z += 7) {
    const px = x + (r() - 0.5) * 4, pz = z + (r() - 0.5) * 4;
    if (Math.abs(px) < 7 && pz > -8 && pz < 22) continue;   // clearing for the action
    const h = 6 + r() * 4, sc = 0.8 + r() * 0.5;
    box(1.0 * sc, h, 1.0 * sc, trunk, px, h / 2, pz);
    box(5 * sc, 3.2 * sc, 5 * sc, r() > 0.5 ? leafA : leafB, px, h + 1.2 * sc, pz);
    box(3.4 * sc, 2.4 * sc, 3.4 * sc, leafB, px, h + 3.6 * sc, pz);
  }
  if (night) { const moon = new THREE.DirectionalLight('#7fe0ff', 1.4); moon.position.set(-20, 40, 10); scene.add(moon); const glow = new THREE.PointLight('#5fe8d0', 60, 40, 1.6); glow.position.set(0, 8, 4); scene.add(glow); }
}

// ---------------- props ----------------
export function phoneScreen(lines = ["I'm sorry.", "I can't make it", 'this weekend.']) {
  return tex(360, 640, (g) => {
    g.fillStyle = '#f3f6fb'; g.fillRect(0, 0, 360, 640);
    g.fillStyle = '#2f6fe0'; g.fillRect(0, 0, 360, 96); g.fillStyle = '#fff'; g.font = 'bold 44px Arial'; g.textAlign = 'center'; g.fillText('Dad', 180, 64);
    g.fillStyle = '#e1e6ef'; const y0 = 200; g.beginPath(); g.roundRect(18, y0 - 60, 324, 64 + lines.length * 52, 26); g.fill();
    g.fillStyle = '#16181d'; g.font = 'bold 40px Arial'; g.textAlign = 'left'; lines.forEach((l, i) => g.fillText(l, 38, y0 + i * 52));
    g.fillStyle = '#8a93a3'; g.font = '26px Arial'; g.fillText('Yesterday 9:42 PM', 38, y0 + 30 + lines.length * 52);
  });
}
export function makeKitProp(type, color) {
  const g = new THREE.Group(), add = (geo, mat, x = 0, y = 0, z = 0) => mesh(geo, mat, x, y, z, g);
  switch (type) {
    // ---- 2026-11-25 props for the new-method scripts (walkie-talkie, soccer goal, wheelchair, broccoli plate, notebook) ----
    case 'walkie': { add(new THREE.BoxGeometry(0.55, 1.0, 0.3), plastic('#ffcc2a', { roughness: 0.4 }), 0, 0.5, 0);
      add(new THREE.BoxGeometry(0.45, 0.4, 0.05), plastic('#222'), 0, 0.62, 0.16);
      add(new THREE.CylinderGeometry(0.04, 0.05, 0.8, 8), plastic('#222'), 0.17, 1.4, 0);
      add(new THREE.SphereGeometry(0.07, 8, 6), new THREE.MeshStandardMaterial({ color: '#ff3b3b', emissive: '#ff3b3b', emissiveIntensity: 1.2 }), -0.15, 1.07, 0); return g; }
    case 'goal': { const wm = plastic('#ffffff', { roughness: 0.4 });
      for (const s of [-1, 1]) add(new THREE.CylinderGeometry(0.18, 0.18, 6, 12), wm, s * 7, 3, 0);
      const bar = add(new THREE.CylinderGeometry(0.18, 0.18, 14.4, 12), wm, 0, 6, 0); bar.rotation.z = Math.PI / 2;
      const net = add(new THREE.PlaneGeometry(14, 6), new THREE.MeshBasicMaterial({ transparent: true, side: THREE.DoubleSide, map: tex(256, 128, (c) => { c.strokeStyle = 'rgba(255,255,255,0.75)'; c.lineWidth = 2; for (let x = 0; x <= 256; x += 12) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 128); c.stroke(); } for (let y = 0; y <= 128; y += 12) { c.beginPath(); c.moveTo(0, y); c.lineTo(256, y); c.stroke(); } }) }), 0, 3, -2.5); net.castShadow = false; return g; }
    case 'wheelchair': { const fm = plastic('#2a62c9', { roughness: 0.35 }), tm = plastic('#1a1a1a');
      add(new THREE.BoxGeometry(2.2, 0.25, 2.0), fm, 0, 1.75, 0); add(new THREE.BoxGeometry(2.2, 2.2, 0.2), fm, 0, 2.9, -1.0);
      for (const s of [-1, 1]) { const w = add(new THREE.TorusGeometry(1.25, 0.12, 8, 28), tm, s * 1.3, 1.25, -0.2); w.rotation.y = Math.PI / 2;
        const f = add(new THREE.CylinderGeometry(0.3, 0.3, 0.15, 14), tm, s * 0.9, 0.3, 1.0); f.rotation.z = Math.PI / 2; } return g; }
    case 'plate': { add(new THREE.CylinderGeometry(1.1, 0.9, 0.12, 28), plastic('#ffffff', { roughness: 0.3 }), 0, 0.06, 0);
      for (let i = 0; i < 5; i++) { const a = i * 1.26, x = Math.cos(a) * 0.45, z = Math.sin(a) * 0.45;
        add(new THREE.CylinderGeometry(0.09, 0.12, 0.35, 8), plastic('#8fcf5a'), x, 0.3, z); add(new THREE.SphereGeometry(0.28, 10, 8), plastic('#2e8b2e'), x, 0.55, z); } return g; }
    case 'notebook': { const page = (txt) => new THREE.MeshBasicMaterial({ toneMapped: false, map: tex(256, 320, (c) => { c.fillStyle = '#fffdf2'; c.fillRect(0, 0, 256, 320); c.strokeStyle = '#9cc3f0'; c.lineWidth = 2; for (let y = 50; y < 320; y += 30) { c.beginPath(); c.moveTo(10, y); c.lineTo(246, y); c.stroke(); } c.fillStyle = '#1d2b6b'; c.font = 'bold 30px Arial'; c.textAlign = 'center'; c.fillText(txt, 128, 40); c.fillStyle = '#e63946'; c.font = 'bold 34px Arial'; for (let y = 76; y < 320; y += 30) c.fillText('✓', 128, y); }) });
      const l = add(new THREE.PlaneGeometry(1.6, 2.0), page(color === 'b' ? 'GRANDPA' : 'GRANDMA'), -0.82, 0, 0), r = add(new THREE.PlaneGeometry(1.6, 2.0), page('GRANDPA'), 0.82, 0, 0); l.rotation.y = 0.12; r.rotation.y = -0.12; return g; }
    case 'phone': { const b = rbox(0.62, 1.16, 0.09, plastic('#1d1f26', { roughness: 0.3 }), 0.06); g.add(b);
      const s = add(new THREE.PlaneGeometry(0.54, 0.98), new THREE.MeshBasicMaterial({ map: phoneScreen(), toneMapped: false }), 0, 0, 0.05); s.castShadow = false; return g; }
    case 'papercrown': { const pm = new THREE.MeshStandardMaterial({ color: '#ffd84a', roughness: 0.9, side: THREE.DoubleSide });
      const n = 8; for (let i = 0; i < n; i++) { const a0 = i / n * Math.PI * 2, a1 = (i + 1) / n * Math.PI * 2, r = 0.7;
        const geo = new THREE.BufferGeometry(); const p = (a, y) => [Math.sin(a) * r, y, Math.cos(a) * r];
        geo.setAttribute('position', new THREE.Float32BufferAttribute([...p(a0, 0), ...p(a1, 0), ...p((a0 + a1) / 2, 0.75), ...p(a0, 0), ...p(a1, 0.3), ...p(a1, 0), ...p(a0, 0), ...p(a0, 0.3), ...p(a1, 0.3)], 3)); geo.computeVertexNormals();
        add(geo, pm); add(new THREE.SphereGeometry(0.07, 8, 6), plastic(['#ff5c8a', '#3fa9ff', '#7ee07e', '#b98cff'][i % 4]), Math.sin((a0 + a1) / 2) * r * 1.01, 0.18, Math.cos((a0 + a1) / 2) * r * 1.01); }
      return g; }
    case 'drawing': { const s = add(new THREE.PlaneGeometry(1.7, 1.25), new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.9, map: tex(340, 250, (c) => {
        c.fillStyle = '#fffdf6'; c.fillRect(0, 0, 340, 250); c.fillStyle = '#ffd23f'; c.beginPath(); c.arc(290, 46, 26, 0, 7); c.fill(); c.fillStyle = '#6fd06b'; c.fillRect(0, 205, 340, 45);
        const kid = (x, h, col, bow) => { c.strokeStyle = '#333'; c.lineWidth = 5; c.fillStyle = '#e4a676'; c.beginPath(); c.arc(x, 205 - h - 18, 18, 0, 7); c.fill(); c.stroke(); c.fillStyle = col; c.fillRect(x - 16, 205 - h, 32, h * 0.55); c.beginPath(); c.moveTo(x - 8, 205 - h * 0.45); c.lineTo(x - 12, 205); c.moveTo(x + 8, 205 - h * 0.45); c.lineTo(x + 12, 205); c.stroke(); if (bow) { c.fillStyle = '#ff86b6'; c.fillRect(x + 6, 205 - h - 44, 20, 12); } };
        kid(80, 110, '#3a8e5a'); kid(160, 80, '#3b7de0'); kid(230, 60, '#ff86b6', true);
        c.fillStyle = '#e8578f'; c.beginPath(); c.moveTo(300, 150); c.bezierCurveTo(270, 125, 280, 100, 300, 116); c.bezierCurveTo(320, 100, 330, 125, 300, 150); c.fill();
        c.fillStyle = '#333'; c.font = 'bold 28px Comic Sans MS, Arial'; c.fillText('DAD', 54, 40); }) }), 0, 0, 0); s.castShadow = false; return g; }
    case 'cake': { add(new THREE.CylinderGeometry(1.15, 1.15, 0.8, 32), plastic('#fff5f8'), 0, 0.4, 0); add(new THREE.CylinderGeometry(1.18, 1.18, 0.14, 32), plastic('#ff86b6'), 0, 0.78, 0);
      add(new THREE.CylinderGeometry(0.8, 0.8, 0.6, 28), plastic('#ff9ec3'), 0, 1.15, 0); add(new THREE.CylinderGeometry(0.82, 0.82, 0.1, 28), plastic('#ffffff'), 0, 1.45, 0);
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; add(new THREE.SphereGeometry(0.1, 8, 6), plastic(['#ff5c8a', '#ffd23f', '#3fa9ff'][i % 3]), Math.sin(a) * 1.17, 0.6, Math.cos(a) * 1.17); }
      g.userData.flames = [];
      for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; add(new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8), plastic(['#3fa9ff', '#ffd23f', '#7ee07e', '#ff5c8a'][i % 4]), Math.sin(a) * 0.5, 1.75, Math.cos(a) * 0.5);
        const f = add(new THREE.ConeGeometry(0.07, 0.2, 8), glow('#ffb347', 3), Math.sin(a) * 0.5, 2.1, Math.cos(a) * 0.5); f.castShadow = false; g.userData.flames.push(f); }
      return g; }
    case 'lighter': { add(new THREE.CylinderGeometry(0.06, 0.06, 1.1, 8), plastic('#9aa7b3', { metalness: 0.4 }), 0, 0.35, 0.25).rotation.x = Math.PI / 2.4; add(new THREE.BoxGeometry(0.22, 0.5, 0.22), plastic('#ff5c8a'), 0, 0, 0); return g; }
    case 'plate': { add(new THREE.CylinderGeometry(0.6, 0.5, 0.08, 24), plastic('#ffffff'), 0, 0.04, 0); return g; }
    case 'plateslice': { add(new THREE.CylinderGeometry(0.6, 0.5, 0.08, 24), plastic('#ffffff'), 0, 0.04, 0); const sl = add(new THREE.CylinderGeometry(0.42, 0.42, 0.4, 16, 1, false, 0, Math.PI / 3.2), plastic('#fff5f8'), 0, 0.28, 0); add(new THREE.CylinderGeometry(0.43, 0.43, 0.08, 16, 1, false, 0, Math.PI / 3.2), plastic('#ff86b6'), 0, 0.5, 0);
      add(new THREE.BoxGeometry(0.05, 0.02, 0.6), plastic('#c0c6cf', { metalness: 0.5 }), -0.35, 0.1, 0.1); return g; }
    case 'cereal': { add(new THREE.SphereGeometry(0.5, 16, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), plastic('#7cc4ff', { side: THREE.DoubleSide }), 0, 0.5, 0); const m = add(new THREE.CircleGeometry(0.45, 16), plastic('#fff8e7'), 0, 0.42, 0); m.rotation.x = -Math.PI / 2;
      for (let i = 0; i < 9; i++) add(new THREE.TorusGeometry(0.07, 0.03, 6, 10), plastic(['#ffb347', '#ff5c8a', '#ffd23f'][i % 3]), Math.sin(i * 2.4) * 0.25, 0.45, Math.cos(i * 2.4) * 0.25).rotation.x = Math.PI / 2; return g; }
    case 'bench': { const w = plastic('#8a5a2b'); for (const z of [-0.3, 0.3]) add(new THREE.BoxGeometry(4, 0.18, 0.5), w, 0, 1.6, z); add(new THREE.BoxGeometry(4, 0.9, 0.16), w, 0, 2.4, -0.62); for (const x of [-1.7, 1.7]) { add(new THREE.BoxGeometry(0.2, 1.6, 1.2), plastic('#3b3b3b'), x, 0.8, 0); } return g; }
    case 'truck': {   // 2026-11-24 ep17: delivery truck seen from the front/side, headlights on (no impact is ever shown)
      add(new THREE.BoxGeometry(4.2, 3.4, 3.6), plastic('#d9dde3'), 0, 2.4, -3.2); add(new THREE.BoxGeometry(4.0, 2.6, 2.4), plastic(color || '#d23a2a'), 0, 2.0, 0.4);
      const ws = add(new THREE.BoxGeometry(3.4, 1.1, 0.1), plastic('#9fd3ff', { roughness: 0.1 }), 0, 2.7, 1.62); ws.castShadow = false;
      add(new THREE.BoxGeometry(4.1, 0.5, 0.3), plastic('#3a3a3a'), 0, 0.9, 1.65);
      for (const x of [-1.45, 1.45]) { const h = add(new THREE.CylinderGeometry(0.32, 0.32, 0.12, 20), glow('#fff6c8', 4), x, 1.45, 1.62); h.rotation.x = Math.PI / 2; h.castShadow = false; }
      for (const [x, z] of [[-1.9, 0.6], [1.9, 0.6], [-1.9, -3.8], [1.9, -3.8]]) { const w = add(new THREE.CylinderGeometry(0.65, 0.65, 0.5, 20), plastic('#1c1c1c'), x, 0.65, z); w.rotation.z = Math.PI / 2; }
      return g; }
    case 'gravestone': {   // rounded stone with a carved raindrop + flowers in front
      add(new THREE.BoxGeometry(1.8, 2.0, 0.45), plastic('#c9ced6', { roughness: 0.9 }), 0, 1.0, 0);
      const top = add(new THREE.CylinderGeometry(0.9, 0.9, 0.45, 28), plastic('#c9ced6', { roughness: 0.9 }), 0, 2.0, 0); top.rotation.x = Math.PI / 2;
      const t = add(new THREE.PlaneGeometry(1.2, 1.2), new THREE.MeshBasicMaterial({ transparent: true, toneMapped: false, map: tex(256, 256, (c) => { c.clearRect(0, 0, 256, 256); c.fillStyle = '#4a7fd0'; c.beginPath(); c.moveTo(128, 40); c.bezierCurveTo(200, 140, 190, 210, 128, 214); c.bezierCurveTo(66, 210, 56, 140, 128, 40); c.fill(); }) }), 0, 1.75, 0.24); t.castShadow = false;
      for (let i = 0; i < 9; i++) { const f = add(new THREE.SphereGeometry(0.17, 12, 10), plastic(['#ffffff', '#ffd6ec', '#fff2a8'][i % 3]), -0.7 + (i % 5) * 0.35, 0.22 + Math.floor(i / 5) * 0.18, 0.55 + (i % 2) * 0.15); f.castShadow = false; }
      return g; }
    case 'flowers': {   // bouquet leaning on a fence post
      for (let i = 0; i < 7; i++) { const st = add(new THREE.CylinderGeometry(0.03, 0.03, 1.2, 6), plastic('#3c8a3c'), (i - 3) * 0.08, 0.6, 0); st.rotation.z = (i - 3) * 0.08; const f = add(new THREE.SphereGeometry(0.16, 12, 10), plastic(['#ffffff', '#ffd6ec', '#ffffff', '#fff2a8'][i % 4]), (i - 3) * 0.13, 1.25 + (i % 2) * 0.1, 0); f.castShadow = false; }
      add(new THREE.ConeGeometry(0.4, 0.8, 16, 1, true), plastic('#f4f0e6', { side: THREE.DoubleSide }), 0, 0.55, 0);
      return g; }
    case 'busseat': {   // two bus seats + window strip (Thursday bus ride)
      add(new THREE.BoxGeometry(3.6, 0.5, 1.4), plastic('#2f5fb3'), 0, 1.7, 0); add(new THREE.BoxGeometry(3.6, 2.0, 0.35), plastic('#2f5fb3'), 0, 2.7, -0.6);
      add(new THREE.BoxGeometry(0.2, 1.5, 1.2), plastic('#8a8f99'), -1.7, 0.75, 0); add(new THREE.BoxGeometry(0.2, 1.5, 1.2), plastic('#8a8f99'), 1.7, 0.75, 0);
      add(new THREE.BoxGeometry(7, 3.4, 0.2), plastic('#e9ecf1'), 0, 4.4, -1.6); const win = add(new THREE.BoxGeometry(5.6, 1.8, 0.1), plastic('#bfe4ff', { roughness: 0.1 }), 0, 4.6, -1.48); win.castShadow = false;
      return g; }
    case 'alarm': {   // red fire-alarm bell on a wall post
      add(new THREE.BoxGeometry(0.25, 4.6, 0.25), plastic('#8a8f99'), 0, 2.3, 0);
      const b = add(new THREE.CylinderGeometry(0.6, 0.6, 0.3, 24), glow('#e02424', 1.2), 0, 4.6, 0.2); b.rotation.x = Math.PI / 2;
      add(new THREE.BoxGeometry(0.9, 0.5, 0.2), plastic('#e02424'), 0, 3.8, 0.15);
      return g; }
    case 'screen': {   // 2026-11-24 TV / monitor with glowing text (news, messages, clues). color = 'TITLE|line|line' ; prefix '!' = red alert style
      const alert = (color || '').startsWith('!'), lines = (alert ? color.slice(1) : (color || 'BREAKING NEWS')).split('|');
      add(new THREE.BoxGeometry(4.4, 2.7, 0.25), plastic('#1b1d22'), 0, 3.6, 0); add(new THREE.BoxGeometry(0.25, 2.2, 0.25), plastic('#2a2d33'), 0, 1.1, -0.1); add(new THREE.BoxGeometry(1.6, 0.12, 0.9), plastic('#2a2d33'), 0, 0.06, -0.1);
      const bg = alert ? '#2a0606' : '#0d2a4a', fg = alert ? '#ff3b3b' : '#ffffff', ac = alert ? '#ff3b3b' : '#ffd23f';
      const t = add(new THREE.PlaneGeometry(4.1, 2.4), new THREE.MeshBasicMaterial({ toneMapped: false, map: tex(820, 480, (c) => { c.fillStyle = bg; c.fillRect(0, 0, 820, 480);
        c.fillStyle = ac; c.fillRect(0, 380, 820, 100); c.fillStyle = alert ? '#ffffff' : '#111'; c.font = 'bold 52px Arial'; c.textAlign = 'center'; c.fillText(lines[0].toUpperCase(), 410, 448);
        c.fillStyle = fg; c.shadowColor = fg; c.shadowBlur = 16; const body = lines.slice(1); const fs = Math.min(96, Math.floor(780 / (Math.max(1, ...body.map(l => l.length)) * 0.6)));
        c.font = `bold ${fs}px Arial`; body.forEach((l, i) => c.fillText(l, 410, 190 - (body.length - 1) * fs * 0.55 + i * fs * 1.1)); }) }), 0, 3.6, 0.14); t.castShadow = false; return g; }
    case 'sign': { add(new THREE.BoxGeometry(0.25, 3.6, 0.25), plastic('#6b4422'), 0, 1.8, 0); add(new THREE.BoxGeometry(2.0, 1.6, 0.15), plastic('#f4e3c1'), 0, 3.4, 0.05);
      const lines = (color || '45 TO THE TOP').split('|');   // '|' = line break
      const fs = Math.min(92, Math.floor(380 / (Math.max(...lines.map(l => l.length)) * 0.62)));
      const t = add(new THREE.PlaneGeometry(1.85, 1.45), new THREE.MeshBasicMaterial({ toneMapped: false, map: tex(400, 320, (c) => { c.fillStyle = '#f4e3c1'; c.fillRect(0, 0, 400, 320); c.fillStyle = '#3a2410'; c.font = `bold ${fs}px Arial`; c.textAlign = 'center'; lines.forEach((l, i) => c.fillText(l, 200, 130 + i * 110 - (lines.length - 1) * 30)); }) }), 0, 3.4, 0.14); t.castShadow = false; return g; }
    case 'ferry': { const hull = add(new THREE.BoxGeometry(5, 2.2, 14), plastic('#f2f2f2'), 0, 0.6, 0); add(new THREE.BoxGeometry(5.05, 0.6, 14.05), plastic('#1f4fa8'), 0, -0.1, 0);
      add(new THREE.BoxGeometry(4, 2.2, 7), plastic('#e9eef5'), 0, 2.8, -1); for (let i = 0; i < 6; i++) for (const sx of [-1, 1]) { const wdw = add(new THREE.BoxGeometry(0.06, 0.6, 0.8), glow('#ffd36b', 2.2), sx * 2.03, 2.9, -4 + i * 1.2); wdw.castShadow = false; }
      add(new THREE.CylinderGeometry(0.12, 0.12, 4, 8), plastic('#555'), 0, 5.6, -2); const top = add(new THREE.SphereGeometry(0.3, 10, 8), glow('#ffffff', 3), 0, 7.7, -2); top.castShadow = false;
      add(new THREE.SphereGeometry(0.22, 8, 6), glow('#ff3b3b', 3), -2.6, 1.8, 6).castShadow = false; add(new THREE.SphereGeometry(0.22, 8, 6), glow('#3bff6b', 3), 2.6, 1.8, 6).castShadow = false;
      const L = new THREE.PointLight('#ffd36b', 45, 22, 1.8); L.position.set(0, 4, 0); g.add(L); return g; }
    case 'pier': { const w = plastic('#7b5232'); add(new THREE.BoxGeometry(5, 0.3, 26), w, 0, 0.6, 0); for (const z of [-12, -6, 0, 6, 12]) for (const x of [-2.3, 2.3]) add(new THREE.CylinderGeometry(0.25, 0.25, 4, 8), plastic('#5a3a22'), x, -1, z); return g; }
    case 'key': { const br = plastic('#d4a52a', { metalness: 0.6, roughness: 0.3 }); add(new THREE.TorusGeometry(0.28, 0.08, 8, 20), br, 0, 0.35, 0); add(new THREE.BoxGeometry(0.1, 0.9, 0.1), br, 0, -0.3, 0); add(new THREE.BoxGeometry(0.3, 0.1, 0.1), br, 0.12, -0.65, 0); add(new THREE.BoxGeometry(0.22, 0.1, 0.1), br, 0.08, -0.45, 0); g.scale.setScalar(1.3); return g; }
    case 'rocks': { const m = plastic('#4b5260', { roughness: 0.95 }); for (const [x, z, r] of [[0, 0, 3.2], [4, 2, 2.4], [-3.5, 1.5, 2.6], [1.5, -3, 2.2], [-1, 4, 1.8]]) { const o = add(new THREE.DodecahedronGeometry(r, 0), m, x, r * 0.35, z); o.rotation.set(x, z, r); } return g; }
    case 'ballotbox': { add(new THREE.BoxGeometry(2.6, 2.4, 2.2), plastic('#d63a3a'), 0, 1.2, 0); add(new THREE.BoxGeometry(1.4, 0.12, 0.2), plastic('#111'), 0, 2.46, 0);
      const t = add(new THREE.PlaneGeometry(2.2, 1.2), new THREE.MeshBasicMaterial({ toneMapped: false, map: tex(256, 140, (c) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, 256, 140); c.fillStyle = '#d63a3a'; c.font = 'bold 96px Arial'; c.textAlign = 'center'; c.fillText('VOTE', 128, 106); }) }), 0, 1.3, 1.12); t.castShadow = false; return g; }
    case 'slip': { add(new THREE.BoxGeometry(0.9, 0.04, 1.2), plastic('#ffffff'), 0, 0, 0); add(new THREE.BoxGeometry(0.6, 0.045, 0.06), plastic('#3b3b8a'), 0, 0.01, -0.1); add(new THREE.BoxGeometry(0.5, 0.045, 0.06), plastic('#3b3b8a'), 0, 0.01, 0.1); return g; }
    case 'stack': { for (let i = 0; i < 9; i++) { const o = add(new THREE.BoxGeometry(0.9, 0.05, 1.2), plastic(i % 3 ? '#ffffff' : '#fff4c9'), (i % 3 - 1) * 0.04, 0.03 + i * 0.055, (i % 2 - 0.5) * 0.05); o.rotation.y = (i % 5 - 2) * 0.05; } return g; }
    case 'book': { const l = add(new THREE.BoxGeometry(1.1, 0.08, 1.4), plastic('#fffaf0'), -0.56, 0.06, 0); l.rotation.z = 0.06; const r2 = add(new THREE.BoxGeometry(1.1, 0.08, 1.4), plastic('#fffaf0'), 0.56, 0.06, 0); r2.rotation.z = -0.06; add(new THREE.BoxGeometry(2.4, 0.06, 1.5), plastic('#c0392b'), 0, 0.0, 0); return g; }
    case 'lunchtray': { add(new THREE.BoxGeometry(2.8, 0.14, 1.9), plastic('#9aa7b3'), 0, 0.07, 0); add(new THREE.BoxGeometry(1.0, 0.25, 0.8), plastic('#f0c987'), -0.7, 0.26, 0.1); add(new THREE.BoxGeometry(1.05, 0.1, 0.85), plastic('#6abf45'), -0.7, 0.42, 0.1); add(new THREE.SphereGeometry(0.28, 12, 8), plastic('#e63946'), 0.5, 0.35, -0.3); add(new THREE.BoxGeometry(0.45, 0.7, 0.45), plastic('#4aa8ff'), 0.9, 0.5, 0.45); return g; }
    case 'pill': { const c = color || '#2f6fe0'; const a = add(new THREE.CapsuleGeometry(0.32, 0.7, 8, 16), plastic(c, { roughness: 0.25 }), 0, 0.5, 0); a.rotation.z = Math.PI / 2;
      const h = add(new THREE.CapsuleGeometry(0.325, 0.35, 8, 16), plastic('#ffffff', { roughness: 0.25 }), 0.3, 0.5, 0); h.rotation.z = Math.PI / 2; h.scale.set(1.01, 1, 1.01);
      const L = new THREE.PointLight(c, 6, 4, 2); L.position.set(0, 0.6, 0.6); g.add(L); return g; }
    case 'wave': { const wm = new THREE.MeshStandardMaterial({ color: '#1f6fd6', roughness: 0.25, metalness: 0.1, transparent: true, opacity: 0.95 });
      for (let k = 0; k < 9; k++) { const s = add(new THREE.CylinderGeometry(6, 6, 60, 24, 1, true, Math.PI * 0.95, Math.PI * 0.55), wm, 0, 6 + k * 0.01, 0); s.rotation.z = Math.PI / 2; s.position.y = 6; s.scale.set(1, 1, 1 + k * 0.001); }
      const crest = add(new THREE.BoxGeometry(60, 1.4, 2.2), plastic('#e9f6ff', { roughness: 0.6 }), 0, 11.6, 2.2); crest.rotation.x = -0.4;
      add(new THREE.BoxGeometry(60, 12, 1), wm, 0, 6, -3.5); return g; }
    case 'cabin': { add(new THREE.BoxGeometry(8, 5, 6), plastic('#f4e3c1'), 0, 2.5, 0); const r = add(new THREE.ConeGeometry(6.2, 3.2, 4), plastic('#c0392b'), 0, 6.6, 0); r.rotation.y = Math.PI / 4;
      for (const x of [-2.2, 2.2]) add(new THREE.BoxGeometry(1.6, 1.6, 0.1), new THREE.MeshBasicMaterial({ color: '#8fd3ff', toneMapped: false }), x, 3, 3.02);
      add(new THREE.BoxGeometry(1.4, 2.6, 0.1), plastic('#7b4a22'), 0, 1.3, 3.02); return g; }
    case 'tower': { add(new THREE.BoxGeometry(9, 34, 8), plastic('#9aa7b8'), 0, 17, 0);
      for (let r = 0; r < 10; r++) for (let c = -1; c <= 1; c++) add(new THREE.BoxGeometry(1.8, 1.8, 0.1), new THREE.MeshBasicMaterial({ color: '#cfeaff', toneMapped: false }), c * 2.6, 3 + r * 3.1, 4.02); return g; }
    case 'bunker': { const rock = add(new THREE.DodecahedronGeometry(9, 1), plastic('#6d6a62', { roughness: 1 }), 0, 3, -2); rock.scale.set(1.4, 1, 1);
      add(new THREE.BoxGeometry(5, 4.2, 0.5), plastic('#3a3f47', { metalness: 0.6, roughness: 0.4 }), 0, 2.1, 6.1); add(new THREE.CylinderGeometry(0.9, 0.9, 0.3, 24), plastic('#c9a227', { metalness: 0.8, roughness: 0.3 }), 0, 2.2, 6.4).rotation.x = Math.PI / 2;
      const L = new THREE.PointLight('#9fe0ff', 30, 12, 1.6); L.position.set(0, 4.5, 8); g.add(L); return g; }
    case 'fire': { for (let k = 0; k < 7; k++) { const h = 1.6 + (k % 3) * 0.7, c = add(new THREE.ConeGeometry(0.45 + (k % 2) * 0.2, h, 8), new THREE.MeshBasicMaterial({ color: ['#ff5a1a', '#ff8c1a', '#ffd23f'][k % 3], transparent: true, opacity: 0.9, toneMapped: false }), (k - 3) * 0.42, h / 2, ((k * 37) % 5 - 2) * 0.15); c.castShadow = false; } const L = new THREE.PointLight('#ff7a2a', 40, 14, 1.6); L.position.y = 1.5; g.add(L); return g; }
    case 'smoke': { for (let k = 0; k < 6; k++) { const s = add(new THREE.SphereGeometry(0.9 + (k % 3) * 0.4, 14, 10), new THREE.MeshStandardMaterial({ color: '#3a3a40', transparent: true, opacity: 0.55, roughness: 1, depthWrite: false }), (k - 2.5) * 0.7, 1 + k * 0.9, (k % 2) * 0.5); s.castShadow = false; } return g; }
    case 'crack': { const t = add(new THREE.PlaneGeometry(6, 6), new THREE.MeshBasicMaterial({ transparent: true, toneMapped: false, depthWrite: false, map: tex(256, 256, (c) => { c.strokeStyle = '#1a1208'; c.lineWidth = 7; c.lineCap = 'round'; let sd = 7; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647; for (let k = 0; k < 9; k++) { let x = 128, y = 128, a = k / 9 * Math.PI * 2 + r() * 0.4; c.beginPath(); c.moveTo(x, y); for (let i = 0; i < 5; i++) { a += (r() - 0.5) * 0.9; x += Math.cos(a) * 24; y += Math.sin(a) * 24; c.lineTo(x, y); } c.stroke(); } }) }), 0, 0.03, 0); t.rotation.x = -Math.PI / 2; t.castShadow = false; return g; }
    case 'toast': { add(new THREE.BoxGeometry(0.7, 0.12, 0.7), plastic('#d9a35a'), 0, 0.1, 0); add(new THREE.BoxGeometry(0.6, 0.02, 0.6), plastic('#ffe08a'), 0, 0.17, 0); return g; }
  }
  return null;
}
