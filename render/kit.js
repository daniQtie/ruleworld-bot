// Storytelling-kit characters (owner standard 2026-11-20): sheet-style faces with blending, blinks, gaze and a
// talking mouth; Noah + Lily (story 001); the Lie-Monster. Faces follow docs/storytelling-kit/assets/character-sheets.
import { THREE, avatar, plastic, canvasTex, scarf } from './lib.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const K = '#1b1b22', MOUTH = '#6b1f2a', TEAR = '#6cc4ff', BLUSH = 'rgba(240,120,110,0.38)';

// ---------------- faces ----------------
// expr: neutral happy sad angry scared surprised confused crying relieved guilty nervous determined holdtears comforting
// o: { talk 0..1 (mouth open), blink 0..1, gx, gy (gaze -1..1) }
export const EXPRS = ['neutral', 'happy', 'sad', 'angry', 'scared', 'surprised', 'confused', 'crying', 'relieved', 'guilty', 'nervous', 'determined', 'holdtears', 'comforting', 'sob', 'laugh', 'starstruck', 'shocked', 'worried', 'smirk', 'thinking'];
function drawFace(g, expr, { talk = 0, blink = 0, gx = 0, gy = 0, lashes = false, old = false } = {}) {
  g.clearRect(0, 0, 256, 256);
  g.setTransform(1.42, 0, 0, 1.42, 128 - 128 * 1.42, 100 - 100 * 1.42);   // features fill the face like the kit sheets
  g.lineCap = 'round'; g.lineJoin = 'round';
  const line = (pts, w = 9, c = K) => { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); };
  const curve = (x0, y0, cx, cy, x1, y1, w = 9, c = K) => { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(cx, cy, x1, y1); g.stroke(); };
  const ell = (x, y, rx, ry, c) => { g.fillStyle = c; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 7); g.fill(); };
  const EX = [88, 168], EY = 112, ox = gx * 6, oy = gy * 5;
  // --- eyes ---
  const closedArcs = (up) => EX.forEach(x => curve(x - 15, EY + (up ? 4 : -2), x, EY + (up ? -10 : 12), x + 15, EY + (up ? 4 : -2), 8));
  const blinkLine = () => EX.forEach(x => line([[x - 13, EY + 2], [x + 13, EY + 2]], 7));
  const star4 = (x, y, R) => { g.fillStyle = '#ffd23f'; g.strokeStyle = '#b8860b'; g.lineWidth = 3; g.beginPath(); for (let i = 0; i < 8; i++) { const a = -Math.PI / 2 + i * Math.PI / 4, d = i % 2 ? R * 0.32 : R; g.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d); } g.closePath(); g.fill(); g.stroke(); };
  if (expr === 'crying' || expr === 'sob') closedArcs(false);
  else if (expr === 'laugh') closedArcs(true);
  else if (expr === 'starstruck') EX.forEach(x => { ell(x, EY, 15, 20, K); star4(x, EY, 17); });
  else if (expr === 'shocked') EX.forEach(x => { ell(x, EY, 19, 24, '#ffffff'); g.strokeStyle = K; g.lineWidth = 5; g.beginPath(); g.ellipse(x, EY, 19, 24, 0, 0, 7); g.stroke(); ell(x + ox * 0.6, EY + oy * 0.6, 6, 7, K); });
  else if (expr === 'relieved') closedArcs(true);
  else if (blink > 0.5) blinkLine();
  else if (expr === 'scared' || expr === 'surprised') {
    EX.forEach(x => { ell(x, EY, 17, 23, '#ffffff'); g.strokeStyle = K; g.lineWidth = 5; g.beginPath(); g.ellipse(x, EY, 17, 23, 0, 0, 7); g.stroke();
      ell(x + ox * 0.8, EY + 4 + oy * 0.8, 9, 10, K); ell(x - 3 + ox * 0.8, EY - 1 + oy * 0.8, 3.5, 3.5, '#fff'); });
  } else {
    const sq = expr === 'angry' ? 0.75 : expr === 'determined' ? 0.85 : 1, dy = expr === 'guilty' ? 6 : 0;
    EX.forEach(x => { ell(x + ox, EY + dy + oy, 12, 19 * sq, K); ell(x - 4 + ox, EY - 7 * sq + dy + oy, 4.5, 4.5, '#fff');
      if (expr === 'holdtears' || expr === 'sad') { g.strokeStyle = TEAR; g.lineWidth = 4; g.beginPath(); g.arc(x + ox, EY + 4 + oy, 15, 0.2 * Math.PI, 0.8 * Math.PI); g.stroke(); }
      if (lashes) line([[x + 9 + ox, EY - 13 + oy], [x + 17 + ox, EY - 19 + oy]], 4); });
  }
  // --- brows ---
  const B = {
    sad: [[66, 92, 106, 84], [150, 84, 190, 92]], guilty: [[66, 90, 106, 82], [150, 82, 190, 90]], holdtears: [[66, 92, 106, 82], [150, 82, 190, 92]],
    angry: [[66, 82, 106, 98], [150, 98, 190, 82]], determined: [[68, 86, 106, 92], [150, 92, 188, 86]],
    scared: [[68, 76, 106, 72], [150, 72, 188, 76]], surprised: [[68, 70, 106, 66], [150, 66, 188, 70]],
    confused: [[68, 76, 106, 70], [150, 90, 188, 92]], crying: [[66, 92, 106, 82], [150, 82, 190, 92]],
    nervous: [[68, 88, 106, 82], [150, 82, 188, 88]], comforting: [[68, 86, 106, 84], [150, 84, 188, 86]],
    sob: [[64, 92, 106, 78], [150, 78, 192, 92]], worried: [[66, 90, 106, 78], [150, 78, 190, 90]], shocked: [[66, 70, 106, 62], [150, 62, 190, 70]],
    smirk: [[68, 88, 106, 90], [150, 80, 188, 72]], thinking: [[68, 86, 106, 86], [150, 78, 188, 70]], starstruck: [[70, 74, 106, 70], [150, 70, 186, 74]],
  }[expr];
  if (B) for (const [x0, y0, x1, y1] of B) curve(x0, y0, (x0 + x1) / 2, Math.min(y0, y1) - 4, x1, y1, 9);
  // --- mouth ---
  if (talk > 0.05) {
    const w = { happy: 22, laugh: 24, starstruck: 24, relieved: 16, angry: 16, scared: 11, surprised: 12, shocked: 16 }[expr] || 15, h = 5 + talk * 15;
    ell(128, 174 + h * 0.2, w, h, MOUTH);
    if (h > 12 && (expr === 'happy' || expr === 'neutral' || expr === 'comforting')) { g.fillStyle = '#fff'; g.fillRect(128 - w * 0.6, 174 + h * 0.2 - h + 1, w * 1.2, 4); }
  } else switch (expr) {
    case 'happy': g.fillStyle = MOUTH; g.beginPath(); g.moveTo(92, 160); g.quadraticCurveTo(128, 214, 164, 160); g.closePath(); g.fill(); line([[96, 162], [160, 162]], 7, '#ffffff'); break;
    case 'sad': curve(104, 186, 128, 166, 152, 186, 8); break;
    case 'laugh': case 'starstruck': g.fillStyle = MOUTH; g.beginPath(); g.moveTo(84, 156); g.quadraticCurveTo(128, 228, 172, 156); g.closePath(); g.fill(); line([[90, 159], [166, 159]], 8, '#ffffff'); ell(128, 194, 17, 9, '#ff7d8f'); break;
    case 'sob': g.fillStyle = MOUTH; g.beginPath(); g.moveTo(98, 194); g.quadraticCurveTo(128, 156, 158, 194); g.quadraticCurveTo(128, 186, 98, 194); g.fill(); break;
    case 'shocked': ell(128, 186, 22, 25, MOUTH); g.fillStyle = '#ffffff'; g.fillRect(112, 163, 32, 7); ell(128, 200, 12, 6, '#ff7d8f'); break;
    case 'worried': g.strokeStyle = K; g.lineWidth = 7; g.beginPath(); g.moveTo(104, 182); g.quadraticCurveTo(110, 172, 116, 180); g.quadraticCurveTo(122, 188, 128, 180); g.quadraticCurveTo(134, 172, 140, 180); g.quadraticCurveTo(146, 188, 152, 180); g.stroke(); break;
    case 'smirk': curve(106, 180, 136, 188, 158, 164, 8); break;
    case 'thinking': line([[116, 184], [146, 178]], 7); break;
    case 'angry': line([[106, 178], [150, 178]], 9); break;
    case 'scared': ell(128, 180, 10, 14, MOUTH); break;
    case 'surprised': ell(128, 182, 14, 19, MOUTH); break;
    case 'confused': g.strokeStyle = K; g.lineWidth = 8; g.beginPath(); g.moveTo(104, 180); g.bezierCurveTo(116, 168, 124, 192, 136, 178); g.quadraticCurveTo(144, 170, 152, 180); g.stroke(); break;
    case 'crying': g.fillStyle = MOUTH; g.beginPath(); g.moveTo(108, 182); g.quadraticCurveTo(128, 166, 148, 182); g.quadraticCurveTo(128, 194, 108, 182); g.fill(); break;
    case 'relieved': case 'comforting': curve(104, 168, 128, 186, 152, 168, 8); break;
    case 'guilty': line([[112, 178], [144, 176]], 7); break;
    case 'nervous': g.strokeStyle = K; g.lineWidth = 7; g.beginPath(); g.moveTo(104, 172); g.quadraticCurveTo(122, 186, 138, 174); g.quadraticCurveTo(146, 170, 152, 176); g.stroke(); break;
    case 'determined': line([[110, 176], [146, 176]], 8); break;
    case 'holdtears': g.strokeStyle = K; g.lineWidth = 7; g.beginPath(); g.moveTo(108, 180); g.bezierCurveTo(118, 174, 124, 184, 128, 178); g.bezierCurveTo(132, 174, 138, 184, 148, 178); g.stroke(); break;
    default: curve(106, 168, 128, 182, 150, 168, 8);
  }
  // --- extras ---
  if (['happy', 'relieved', 'comforting', 'laugh', 'starstruck', 'worried', 'sob'].includes(expr)) { g.fillStyle = BLUSH; g.beginPath(); g.ellipse(62, 150, 16, 9, 0, 0, 7); g.ellipse(194, 150, 16, 9, 0, 0, 7); g.fill(); }
  if (expr === 'sob') for (const x of [80, 176]) { g.fillStyle = TEAR; g.beginPath(); g.roundRect(x - 8, 118, 16, 96, 8); g.fill(); g.fillStyle = 'rgba(255,255,255,0.6)'; g.fillRect(x - 3, 124, 4, 70); }
  if (expr === 'worried') for (const x of [44, 212]) { g.fillStyle = TEAR; g.beginPath(); g.moveTo(x, 84); g.quadraticCurveTo(x + 12, 110, x, 118); g.quadraticCurveTo(x - 12, 110, x, 84); g.fill(); }
  if (expr === 'starstruck') { g.fillStyle = '#ffd23f'; for (const [x, y, r] of [[40, 70, 9], [214, 64, 7], [206, 150, 5]]) { g.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, d = i % 2 ? r * 0.3 : r; g.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d); } g.fill(); } }
  if (expr === 'crying') for (const x of [72, 184]) { g.fillStyle = TEAR; g.beginPath(); g.moveTo(x, 118); g.quadraticCurveTo(x + 9, 146, x, 156); g.quadraticCurveTo(x - 9, 146, x, 118); g.fill(); }
  if (old) { g.strokeStyle = 'rgba(120,70,40,0.45)'; g.lineWidth = 3; for (const x of [62, 194]) { g.beginPath(); g.moveTo(x - 8, 128); g.quadraticCurveTo(x, 134, x + 8, 128); g.stroke(); } g.beginPath(); g.moveTo(112, 62); g.lineTo(144, 62); g.stroke(); }
  if (expr === 'scared' || expr === 'nervous') { g.fillStyle = TEAR; g.beginPath(); g.moveTo(196, 70); g.quadraticCurveTo(206, 92, 196, 100); g.quadraticCurveTo(186, 92, 196, 70); g.fill(); }
}
const faceCache = new Map();
export function faceTexture(expr, o = {}) {
  const key = [expr, Math.round((o.talk || 0) * 4), o.blink > 0.5 ? 1 : 0, Math.round((o.gx || 0) * 2), Math.round((o.gy || 0) * 2), o.lashes ? 1 : 0, o.old ? 1 : 0].join('|');
  if (!faceCache.has(key)) faceCache.set(key, canvasTex(256, 256, (g) => drawFace(g, expr, { ...o, talk: Math.round((o.talk || 0) * 4) / 4 })));
  return faceCache.get(key);
}

// Two decal planes on the head front: A (current) and B (previous, fading out) -> smooth expression changes.
function faceRig(P, style) {
  P.faceMesh.material[4] = P.skinMat;
  // style.round (cast v2, owner refs 2026-11-22): Roblox-classic rounded-cylinder head + a face decal wrapped on it, features ~20% bigger
  const RR = 0.67;
  if (style.round) {
    P.faceMesh.visible = false; const H = 1.24, rr = 0.24, pts = [new THREE.Vector2(0, -H / 2)];
    for (let i = 0; i <= 8; i++) { const a = -Math.PI / 2 + i * Math.PI / 16; pts.push(new THREE.Vector2(RR - rr + Math.cos(a) * rr, -H / 2 + rr + Math.sin(a) * rr)); }
    for (let i = 0; i <= 8; i++) { const a = i * Math.PI / 16; pts.push(new THREE.Vector2(RR - rr + Math.cos(a) * rr, H / 2 - rr + Math.sin(a) * rr)); }
    pts.push(new THREE.Vector2(0, H / 2));
    const hm = new THREE.Mesh(new THREE.LatheGeometry(pts, 48), P.skinMat); hm.castShadow = true; P.head.add(hm); P.roundHead = hm;
  }
  const geo = (order) => style.round ? new THREE.CylinderGeometry(RR + 0.004 + order * 0.002, RR + 0.004 + order * 0.002, 1.18, 40, 1, true, -1.05, 2.1) : new THREE.PlaneGeometry(1.06, 1.06);
  const mk = (z, order) => { const m = new THREE.Mesh(geo(order), new THREE.MeshStandardMaterial({ transparent: true, roughness: 0.6, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 - order })); m.position.set(0, style.round ? 0.04 : -0.02, style.round ? 0 : z); m.renderOrder = 2 + order; m.castShadow = false; P.head.add(m); return m; };
  const A = mk(0.613, 1), B = mk(0.612, 0);
  P.kit = true;
  // set(prev, cur, k = blend 0..1 from prev to cur, opts {talk, blink, gx, gy})
  P.kitFace = (prev, cur, k, o = {}) => {
    const oo = { ...o, lashes: style.lashes, old: style.old };
    A.material.map = faceTexture(cur, oo); A.material.opacity = k >= 1 || prev === cur ? 1 : k; A.material.needsUpdate = true;
    B.visible = k < 1 && prev !== cur; if (B.visible) { B.material.map = faceTexture(prev, { ...oo, talk: 0 }); B.material.opacity = 1; B.material.needsUpdate = true; }
  };
  P.kitFace('neutral', 'neutral', 1);
}

// ---------------- cast ----------------
const SKIN = '#e4a676';
function hood(g, { box, torso, shirtMats }) { const h = box(1.75, 0.62, 0.62, shirtMats[0], 0.24); h.position.set(0, 0.98, -0.5); h.rotation.x = 0.25; torso.add(h); }
function longHair(color, bow = '#ff8fb8') {
  return (g, { box, head }) => {
    const hm = plastic(color, { roughness: 0.45 });
    const cap = box(1.42, 0.5, 1.38, hm, 0.22); cap.position.set(0, 0.6, -0.04); head.add(cap);
    for (const [x, w, rz] of [[-0.3, 0.75, 0.32], [0.3, 0.6, -0.22]]) { const f = box(w, 0.28, 0.3, hm, 0.12); f.position.set(x, 0.47, 0.52); f.rotation.set(0.3, 0, rz); head.add(f); }
    for (const s of [-1, 1]) { const side = box(0.24, 1.55, 0.95, hm, 0.1); side.position.set(0.7 * s, -0.12, -0.08); head.add(side); }
    const back = box(1.46, 2.0, 0.34, hm, 0.14); back.position.set(0, -0.35, -0.6); head.add(back);
    if (!bow) return;
    // pink bow on the upper right (as on Lily's sheet)
    const bm = plastic(bow, { roughness: 0.4 }), km = plastic('#e8578f');
    const B = new THREE.Group(); B.position.set(0.48, 0.86, 0.1); B.rotation.set(0.2, -0.3, -0.35); B.scale.setScalar(0.68); head.add(B);
    for (const s of [-1, 1]) { const lp = new THREE.Mesh(new THREE.SphereGeometry(0.34, 18, 12), bm); lp.scale.set(1.3, 0.8, 0.45); lp.position.set(0.36 * s, 0.05, 0); B.add(lp); }
    const knot = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 10), km); B.add(knot);
  };
}
// 2026-11-24 owner reference: pretty long layered hair (girl) and stylish side-swept spiky hair (boy)
function prettyHair(color, light) {
  return (g, { box, head }) => {
    const hm = plastic(color, { roughness: 0.42 }), hl = plastic(light, { roughness: 0.42 });
    const top = box(1.46, 0.52, 1.42, hm, 0.24); top.position.set(0, 0.6, -0.04); head.add(top);
    // soft side-swept bangs with a highlight strand
    for (const [x, w, rz, m] of [[-0.36, 0.78, 0.42, hm], [0.3, 0.62, -0.34, hl]]) { const f = box(w, 0.2, 0.22, m, 0.09); f.position.set(x, 0.6, 0.56); f.rotation.set(0.45, 0, rz); head.add(f); }
    // long wavy side locks: 3 stacked pieces per side, each a little further out (reads as waves)
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { const lk = box(0.3, 0.78, 0.62, i === 1 ? hl : hm, 0.14); lk.position.set((0.72 + i * 0.05) * s, 0.15 - i * 0.66, 0.12 - i * 0.05); lk.rotation.z = (i % 2 ? 0.1 : -0.08) * s; head.add(lk); }
    // full back hair down to the waist
    const back = box(1.52, 2.6, 0.38, hm, 0.16); back.position.set(0, -0.62, -0.6); head.add(back);
    for (const s of [-1, 1]) { const w = box(0.5, 2.3, 0.32, hl, 0.14); w.position.set(0.48 * s, -0.75, -0.66); w.rotation.z = 0.06 * s; head.add(w); }
    // little hair tuft on top
  };
}
function sweptSpikes(color, light) {
  return (g, { box, head }) => {
    const hm = plastic(color, { roughness: 0.4 }), hl = plastic(light, { roughness: 0.4 });
    const cap = box(1.4, 0.44, 1.36, hm, 0.18); cap.position.set(0, 0.62, -0.06); head.add(cap);
    for (const s of [-1, 1]) { const side = box(0.18, 0.5, 0.86, hm, 0.08); side.position.set(0.67 * s, 0.32, -0.12); head.add(side); }
    const back = box(1.36, 0.62, 0.26, hm, 0.1); back.position.set(0, 0.32, -0.6); head.add(back);
    // front spikes swept to one side (like the owner's reference), longer at the front, with highlights
    const spikes = [[-0.5, 0.42, 0.62, 0.9, hm], [-0.18, 0.46, 0.7, 0.75, hl], [0.14, 0.44, 0.66, 0.6, hm], [0.42, 0.4, 0.55, 0.45, hl],
                    [-0.35, 0.05, 0.6, 0.5, hm], [0.1, 0.0, 0.62, 0.35, hm], [0.45, -0.1, 0.5, 0.25, hm], [-0.1, -0.4, 0.55, 0.2, hl], [0.35, -0.45, 0.5, 0.1, hm]];
    for (const [x, z, len, lean, m] of spikes) { const sp = new THREE.Mesh(new THREE.ConeGeometry(0.22, len * 0.72, 5), m); sp.position.set(x, 0.86, z); sp.rotation.set(0.9 + z * 0.5, 0.3, -1.1 * lean - 0.35); head.add(sp); }
    // two fringe strands over the forehead
    for (const [x, rz] of [[-0.3, 0.5], [0.05, 0.35]]) { const f = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.55, 5), hm); f.position.set(x, 0.45, 0.6); f.rotation.set(Math.PI - 0.25, 0, rz); head.add(f); }
  };
}
// story 003 extras
const raincoat = (g, { box, torso, shirtMats }) => { const h = box(1.8, 0.65, 0.66, shirtMats[0], 0.25); h.position.set(0, 0.98, -0.5); h.rotation.x = 0.25; torso.add(h); };
const beard = (color) => (g, { box, head }) => { const m = plastic(color, { roughness: 0.7 }); const b = box(1.32, 0.42, 0.34, m, 0.14); b.position.set(0, -0.5, 0.5); head.add(b); for (const s of [-1, 1]) { const k = box(0.2, 0.62, 0.9, m, 0.08); k.position.set(0.66 * s, -0.25, 0.1); head.add(k); } };
const captainCap = (g, { head }) => { const c = new THREE.Group(); c.position.set(0, 0.86, 0); head.add(c); const top = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.72, 0.42, 24), plastic('#ffffff')); top.position.y = 0.2; c.add(top); const band = new THREE.Mesh(new THREE.CylinderGeometry(0.74, 0.74, 0.16, 24), plastic('#1e2b55')); band.position.y = 0.05; c.add(band); const peak = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.07, 0.5), plastic('#111a33')); peak.position.set(0, -0.02, 0.7); c.add(peak); const badge = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), plastic('#ffd23f')); badge.position.set(0, 0.12, 0.74); c.add(badge); };
const roundGlasses = (g, { head }) => { const m = plastic('#4a3020'); for (const s of [-1, 1]) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.035, 8, 24), m); r.position.set(0.26 * s, 0.06, 0.64); head.add(r); } const br = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 0.04), m); br.position.set(0, 0.08, 0.64); head.add(br); };
const shawl = (color) => (g, { box, torso }) => { const m = plastic(color, { roughness: 0.9 }); const s = box(2.2, 0.55, 1.2, m, 0.2); s.position.y = 0.8; torso.add(s); const f = box(1.6, 0.9, 0.2, m, 0.1); f.position.set(0, 0.35, 0.56); f.rotation.z = 0.05; torso.add(f); };
const hairband = (color) => (g, { box, head }) => { const b = box(1.5, 0.16, 1.46, plastic(color), 0.07); b.position.set(0, 0.74, -0.02); b.rotation.x = -0.12; head.add(b); };
const headband = (color) => (g, { box, head }) => { const b = box(1.36, 0.2, 1.32, plastic(color), 0.06); b.position.set(0, 0.34, -0.02); head.add(b); };
// ---- style-reference extras (owner refs 2026-11-22, docs/style-reference) ----
const eyepatch = (g, { head }) => { const m = plastic('#111111', { roughness: 0.4 }); const p = new THREE.Mesh(new THREE.CircleGeometry(0.21, 24), m); p.scale.set(1.1, 1.0, 1); p.position.set(-0.27, 0.06, 0.66); p.rotation.y = -0.38; head.add(p); const st = new THREE.Mesh(new THREE.CylinderGeometry(0.69, 0.69, 0.07, 32, 1, true), m); st.position.set(0, 0.12, 0); st.rotation.z = 0.3; head.add(st); };
const glasses2 = (g, { head }) => { const m = plastic('#1b1b22'); for (const s of [-1, 1]) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.04, 8, 24), m); r.position.set(0.25 * s, 0.07, 0.7); r.rotation.y = 0.3 * s; head.add(r); } const br = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 0.04), m); br.position.set(0, 0.09, 0.74); head.add(br); };
const headphones = (color, pad = '#222') => (g, { head }) => { const m = plastic(color, { roughness: 0.35 }); const band = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.07, 10, 32, Math.PI), m); band.position.set(0, 0.12, -0.05); head.add(band); for (const s of [-1, 1]) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.2, 24), m); c.rotation.z = Math.PI / 2; c.position.set(0.74 * s, 0.05, 0); head.add(c); const pd = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.06, 24), plastic(pad)); pd.rotation.z = Math.PI / 2; pd.position.set(0.86 * s, 0.05, 0); head.add(pd); } };
const cap = (color, brim = color) => (g, { box, head }) => { const c = box(1.44, 0.42, 1.4, plastic(color), 0.2); c.position.set(0, 0.72, -0.04); head.add(c); const b = box(1.2, 0.08, 0.62, plastic(brim), 0.04); b.position.set(0, 0.55, 0.86); head.add(b); };
const visor = (color) => (g, { box, head }) => { const b = box(1.46, 0.16, 1.42, plastic(color), 0.06); b.position.set(0, 0.48, -0.02); head.add(b); const v = box(1.24, 0.07, 0.6, plastic(color), 0.03); v.position.set(0, 0.47, 0.9); v.rotation.x = -0.12; head.add(v); };
const skirt = (color, len = 0.95, sparkle = false) => (g, { torso }) => { const m = plastic(color, { roughness: sparkle ? 0.25 : 0.55, metalness: sparkle ? 0.25 : 0, side: THREE.DoubleSide }); const k = new THREE.Mesh(new THREE.CylinderGeometry(1.08, 1.5, len, 28, 1, true), m); k.scale.z = 0.62; k.position.y = -1.0 - len / 2 + 0.12; torso.add(k); };
const curls = (color) => (g, { head }) => { const m = plastic(color, { roughness: 0.5 }); for (let i = 0; i < 16; i++) { const a = i * 2.4, r = 0.25 + (i % 4) * 0.13; const b = new THREE.Mesh(new THREE.SphereGeometry(0.26, 14, 10), m); b.position.set(Math.cos(a) * r * 1.4, 0.82 + (i % 3) * 0.1, Math.sin(a) * r - 0.05); head.add(b); } for (const s of [-1, 1]) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 10), m); b.position.set(0.66 * s, 0.4, -0.1); head.add(b); } };
const smileMask = (g, { head }) => { const t = canvasTex(256, 256, (c) => { c.fillStyle = '#f4f4f4'; c.fillRect(0, 0, 256, 256); c.fillStyle = '#111'; c.beginPath(); c.ellipse(86, 100, 13, 20, 0, 0, 7); c.ellipse(170, 100, 13, 20, 0, 0, 7); c.fill(); c.strokeStyle = '#111'; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.arc(128, 140, 58, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke(); }); const m = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 1.2, 40, 1, true, -1.05, 2.1), new THREE.MeshStandardMaterial({ map: t, roughness: 0.5, side: THREE.DoubleSide })); m.position.y = 0.04; head.add(m); };
export const KIT_CAST = {
  // ---- story 010 cast, matched to the reference Short (TeamDeam 'I Was Made To Help People In Need') ----
  eli: { skin: '#f5d3b0', shirt: '#1f5a32', shirtOpts: { collar: '#ffffff', print: 'jersey', inner: '8' }, pants: '#151515', shoe: '#d9d9d9', hair: '#6b3a1c', hairStyle: 'messy', scale: 0.95, style: { round: true } },
  mason: { skin: '#f5d3b0', shirt: '#2050c8', shirtOpts: { collar: '#151515', print: 'flannel' }, pants: '#8aa6cc', shoe: '#e8e8e8', hair: '#141414', hairStyle: 'short', extras: [cap('#f2f2f2', '#d62828')], scale: 1.0, style: { round: true } },
  beanie: { skin: '#c98e62', shirt: '#1f5a32', shirtOpts: { print: 'jacket', inner: '#f2f2f2' }, pants: '#151515', shoe: '#e8e8e8', hair: '#3b2a1a', hairStyle: 'short', extras: [cap('#8a7a5c', '#8a7a5c')], scale: 0.95, style: { round: true } },
  noob: { skin: '#f5cd30', shirt: '#2f6fe0', shirtOpts: { collar: '#2f6fe0', print: null }, pants: '#a3d14a', shoe: '#a3d14a', hair: '#f5cd30', hairStyle: 'none', scale: 0.95, style: { round: true } },
  lucy: { skin: '#f5d3b0', shirt: '#151515', shirtOpts: { collar: '#151515', print: null }, pants: '#4a5f86', shoe: '#151515', hair: '#6b3a1c', hairStyle: 'none', extras: [longHair('#6b3a1c', null)], scale: 0.95, style: { round: true, lashes: true } },
  doc: { skin: '#f0cfa0', shirt: '#f4f4f4', shirtOpts: { collar: '#3d6fd0', print: 'buttons' }, pants: '#3d6fd0', shoe: '#2a2a2a', hair: '#c4621c', hairStyle: 'messy', scale: 1.1, style: { round: true } },
  babyb: { skin: '#f5d3b0', shirt: '#1f7a45', shirtOpts: { collar: '#1f7a45', print: null }, pants: '#1f7a45', shoe: '#1f7a45', hair: '#6b3a1c', hairStyle: 'short', scale: 0.38, style: { round: true } },
  // ---- story 009 cast, matched to the reference Short (@Gneef): orange messy hair + plain tee + green pants, suit man, old man, mum, sister ----
  noel: { skin: '#f0cfa0', shirt: '#dcdcdc', shirtOpts: { collar: '#dcdcdc', print: null }, pants: '#1f7a35', shoe: '#1f7a35', hair: '#ff8c1a', hairStyle: 'messy', scale: 1.0, counter: 1000, style: { round: true } },
  suitman: { skin: '#f0cfa0', shirt: '#17171d', shirtOpts: { print: 'suit', inner: '#ffffff', tie: '#101018' }, pants: '#17171d', shoe: '#0e0e0e', hair: '#7a4a28', hairStyle: 'messy', scale: 1.08, style: { round: true } },
  oldman: { skin: '#e6c9a4', shirt: '#9a5b3a', shirtOpts: { collar: '#9a5b3a', print: 'plaid' }, pants: '#d9d1bd', shoe: '#6b5a3c', hair: '#f0f0f0', hairStyle: 'messy', extras: [beard('#f4f4f4')], scale: 1.05, style: { round: true, old: true } },
  mumn: { skin: '#f0cfa0', shirt: '#6f8db8', shirtOpts: { collar: '#6f8db8', print: 'buttons' }, pants: '#46505f', shoe: '#2a2a2a', hair: '#6b3a1c', hairStyle: 'none', extras: [longHair('#6b3a1c', null)], scale: 1.0, style: { round: true, lashes: true } },
  mia: { skin: '#f0cfa0', shirt: '#ffd23f', shirtOpts: { collar: '#ffd23f', print: 'heart' }, pants: '#d62828', shoe: '#d62828', hair: '#7a3e1e', hairStyle: 'pigtails', scale: 0.7, style: { round: true, lashes: true } },
  // ---- cast v2 (owner style reference 2026-11-22) ----
  leo: { skin: '#f0c9a6', shirt: '#3d7fd9', shirtOpts: { collar: '#3d7fd9', print: 'hoodie' }, pants: '#1f2740', shoe: '#7a6a55', hair: '#7a4a28', hairStyle: 'messy', extras: [hood], scale: 0.85, style: { round: true } },
  vince: { skin: '#f0c9a6', shirt: '#1d1f26', shirtOpts: { print: 'suit', inner: '#2b2d36' }, pants: '#1d1f26', shoe: '#0e0e0e', hair: '#141820', hairStyle: 'short', extras: [eyepatch], scale: 1.1, style: { round: true } },
  jada: { skin: '#f0c9a6', shirt: '#ff8fc8', shirtOpts: { collar: '#ff8fc8', print: 'hoodie', sparkle: true }, pants: '#f3c9a6', shoe: '#ff7ab8', hair: '#141414', hairStyle: 'bun', bunTie: '#ff7ab8', extras: [headphones('#ff6fb0', '#5b7bd5'), skirt('#ff8fc8', 0.9, true)], scale: 0.9, style: { lashes: true, round: true } },
  marcus: { skin: '#7a4a2e', shirt: '#3d86e0', shirtOpts: { print: 'jacket', inner: '#33435e' }, pants: '#6b5a3c', shoe: '#4a3020', hair: '#6b3a1c', hairStyle: 'short', scale: 1.0, style: { round: true } },
  // ---- 2026-11-24 owner reference pictures: the pretty girl and the handsome boy (new romance story) ----
  hana: { skin: '#f6d6b8', shirt: '#f7a8c9', shirtOpts: { collar: '#f7a8c9', print: null, sparkle: true }, pants: '#f6d6b8', shoe: '#ffffff', hair: '#e9c08a', hairStyle: 'none', extras: [prettyHair('#e9c08a', '#f6dcaa'), hairband('#f28ab8'), skirt('#f7a8c9', 0.9, true)], scale: 0.92, style: { lashes: true, round: true } },
  kaito: { skin: '#f0c9a6', shirt: '#f4f4f4', shirtOpts: { collar: '#f4f4f4', print: 'word', word: 'ほし', ink: '#151515' }, pants: '#141414', shoe: '#d8d8d8', hair: '#7a3f1c', hairStyle: 'none', extras: [sweptSpikes('#7a3f1c', '#a0582a')], scale: 0.98, style: { round: true } },
  kaitoh: { skin: '#f0c9a6', shirt: '#f4f4f4', shirtOpts: { collar: '#f4f4f4', print: 'word', word: 'ほし', ink: '#151515' }, pants: '#141414', shoe: '#d8d8d8', hair: '#7a3f1c', hairStyle: 'none', extras: [sweptSpikes('#7a3f1c', '#a0582a'), headphones('#1d1d22')], scale: 0.98, style: { round: true } },
  pia: { skin: '#f3d0b0', shirt: '#c9b3f0', shirtOpts: { collar: '#c9b3f0', print: null }, pants: '#f3d0b0', shoe: '#e8dcff', hair: '#f4a6c8', hairStyle: 'none', extras: [longHair('#f4a6c8', null), skirt('#c9b3f0', 1.1)], scale: 0.92, style: { lashes: true, round: true } },
  gwen: { skin: '#f3d0b0', shirt: '#8fb4e0', shirtOpts: { print: 'jacket', inner: '#f5f5f5' }, pants: '#5a7db5', shoe: '#e8e8e8', hair: '#f0d27a', hairStyle: 'none', extras: [longHair('#f0d27a', null), visor('#3aa0e0'), glasses2], scale: 1.0, style: { lashes: true, round: true } },
  rex: { skin: '#f0c9a6', shirt: '#1f2128', shirtOpts: { print: 'jacket', inner: '#2f6fe0' }, pants: '#26272e', shoe: '#2b2b2b', hair: '#121418', hairStyle: 'short', scale: 1.05, style: { round: true } },
  zoe: { skin: '#f0c9a6', shirt: '#f08a24', shirtOpts: { print: 'jacket', inner: '#f5f5f5' }, pants: '#9cc3e6', shoe: '#ff9ad0', hair: '#6b3a1c', hairStyle: 'short', extras: [cap('#2a2a2a', '#ff6fb0'), headphones('#ff6fb0')], scale: 0.98, style: { lashes: true, round: true } },
  ollie: { skin: '#f0c9a6', shirt: '#2a2a2a', shirtOpts: { print: 'jacket', inner: '#2f4f8a' }, pants: '#2c3445', shoe: '#333', hair: '#8a4a24', hairStyle: 'none', extras: [curls('#8a4a24')], scale: 1.05, style: { round: true } },

  noah: { skin: SKIN, shirt: '#2f6fe0', shirtOpts: { collar: '#2f6fe0', print: 'hoodie' }, pants: '#2f3b55', shoe: '#f2f2f2', hair: '#5a3622', hairStyle: 'messy', extras: [hood], scale: 1.0, style: {} },
  lily: { skin: SKIN, shirt: '#ff86b6', shirtOpts: { collar: '#ff86b6', print: 'sweater' }, pants: '#f3e6d3', shoe: '#8a5a3a', hair: '#5a3622', hairStyle: 'none', extras: [longHair('#5a3622')], scale: 0.8, style: { lashes: true } },
  neighbor: { skin: '#c98e62', shirt: '#2fa36b', shirtOpts: { collar: '#ffffff', print: 'stripes' }, pants: '#3b3f4a', shoe: '#333', hair: '#1f1a17', hairStyle: 'short', scale: 1.05, style: {} },
  listener: { skin: '#f3c9a1', shirt: '#f2a33a', shirtOpts: { collar: '#ffffff', print: 'dots' }, pants: '#4a3b6b', shoe: '#333', hair: '#b5652b', hairStyle: 'bun', scale: 1.0, style: { lashes: true } },
  kai: { skin: '#c98e62', shirt: '#ffcf2e', shirtOpts: { collar: '#ffcf2e', print: 'buttons' }, pants: '#26335a', shoe: '#d6402f', hair: '#1c1714', hairStyle: 'spiky', extras: [raincoat], scale: 0.82, style: {} },
  pell: { skin: '#f0c9a6', shirt: '#7a4fb3', shirtOpts: { collar: '#e8dcff', print: 'buttons' }, pants: '#5b3d8a', shoe: '#4a3020', hair: '#f2f2f2', hairStyle: 'bun', bunTie: '#cfcfcf', extras: [shawl('#3f9a5f'), roundGlasses], scale: 0.95, style: { lashes: true, old: true } },
  marlo: { skin: '#d9a27a', shirt: '#22336b', shirtOpts: { collar: '#ffffff', print: 'stripes' }, pants: '#1b2340', shoe: '#2b2b2b', hair: '#a9a9a9', hairStyle: 'short', extras: [beard('#b9b9b9'), captainCap], scale: 1.05, style: { old: true } },
  mum: { skin: '#c98e62', shirt: '#e2493f', shirtOpts: { collar: '#e2493f', print: 'buttons' }, pants: '#2c3e70', shoe: '#333', hair: '#1c1714', hairStyle: 'none', extras: [longHair('#1c1714', null)], scale: 1.0, style: { lashes: true } },
  ellie: { skin: '#e4a676', shirt: '#d9a441', shirtOpts: { collar: '#d9a441', print: 'buttons' }, pants: '#2f7f86', shoe: '#5b3a1e', hair: '#6b3e1e', hairStyle: 'none', extras: [longHair('#6b3e1e', null)], scale: 0.9, style: { lashes: true } },
  maya: { skin: '#f0c9a6', shirt: '#c0392b', shirtOpts: { collar: '#ffffff', print: 'buttons' }, pants: '#1e2a55', shoe: '#222', hair: '#e8c25a', hairStyle: 'bun', bunTie: '#c0392b', scale: 1.0, style: { lashes: true } },
  theo: { skin: '#8d5a3a', shirt: '#f08a24', shirtOpts: { collar: '#f08a24', print: 'hoodie' }, pants: '#2f4f8a', shoe: '#ffffff', hair: '#141414', hairStyle: 'short', extras: [hood], scale: 0.95, style: {} },
  reed: { skin: '#d9a27a', shirt: '#2a8fa8', shirtOpts: { collar: '#ffffff', print: 'stripes' }, pants: '#4a3b6b', shoe: '#333', hair: '#b5b5b5', hairStyle: 'short', extras: [roundGlasses], scale: 1.08, style: {} },
  stu1: { skin: '#c98e62', shirt: '#8e44ad', shirtOpts: { collar: '#ffffff', print: 'dots' }, pants: '#2c3e50', shoe: '#333', hair: '#1c1714', hairStyle: 'spiky', scale: 0.95, style: {} },
  stu2: { skin: '#f3c9a1', shirt: '#27ae60', shirtOpts: { collar: '#ffffff', print: 'plaid' }, pants: '#34495e', shoe: '#333', hair: '#b5652b', hairStyle: 'messy', scale: 1.0, style: {} },
  stu3: { skin: '#e4a676', shirt: '#e84393', shirtOpts: { collar: '#ffffff', print: 'heart' }, pants: '#2c3e70', shoe: '#fff', hair: '#2b1b10', hairStyle: 'pigtails', scale: 0.9, style: { lashes: true } },
  stu4: { skin: '#8d5a3a', shirt: '#2f80ed', shirtOpts: { collar: '#ffffff', print: 'stripes' }, pants: '#1e3799', shoe: '#333', hair: '#141414', hairStyle: 'short', scale: 1.0, style: {} },
  stu5: { skin: '#f0c9a6', shirt: '#f1c40f', shirtOpts: { collar: '#ffffff', print: 'overalls' }, pants: '#6d4c2f', shoe: '#333', hair: '#e07a2e', hairStyle: 'spiky', scale: 0.92, style: {} },
  nico: { skin: '#d9a27a', shirt: '#19b7e8', shirtOpts: { collar: '#19b7e8', print: 'bolt' }, pants: '#2c3e70', shoe: '#e53935', hair: '#f2d04a', hairStyle: 'spiky', scale: 0.78, style: {} },
  chase: { skin: '#f0c9a6', shirt: '#14295e', shirtOpts: { collar: '#d4a52a', print: 'stripes' }, pants: '#1b1b2e', shoe: '#ffffff', hair: '#111111', hairStyle: 'short', extras: [headband('#d4a52a')], scale: 1.25, style: {} },
  reyes: { skin: '#c98e62', shirt: '#d63a2f', shirtOpts: { collar: '#ffffff', print: 'stripes' }, pants: '#7a1f1a', shoe: '#ffffff', hair: '#2b1b10', hairStyle: 'bun', bunTie: '#ffd23f', scale: 1.05, style: { lashes: true } },
  momn: { skin: '#d9a27a', shirt: '#f08a24', shirtOpts: { collar: '#f08a24', print: 'buttons' }, pants: '#2c3e70', shoe: '#333', hair: '#141414', hairStyle: 'none', extras: [longHair('#141414', null)], scale: 1.0, style: { lashes: true } },
  c1: { skin: '#c98e62', shirt: '#e53935', shirtOpts: { collar: '#ffffff', print: 'stripes' }, pants: '#2c3e50', shoe: '#333', hair: '#1c1714', hairStyle: 'spiky', scale: 0.95, style: {} },
  c2: { skin: '#f3c9a1', shirt: '#ff7ab8', shirtOpts: { collar: '#ffffff', print: 'heart' }, pants: '#4a3b6b', shoe: '#fff', hair: '#7a3e1e', hairStyle: 'pigtails', scale: 0.9, style: { lashes: true } },
  c3: { skin: '#8d5a3a', shirt: '#f1c40f', shirtOpts: { collar: '#ffffff', print: 'dots' }, pants: '#34495e', shoe: '#333', hair: '#141414', hairStyle: 'short', scale: 1.0, style: {} },
  c4: { skin: '#e4a676', shirt: '#2ecc71', shirtOpts: { collar: '#ffffff', print: 'plaid' }, pants: '#6d4c2f', shoe: '#333', hair: '#b5652b', hairStyle: 'messy', scale: 0.95, style: {} },
  walker: { skin: '#e4a676', shirt: '#2f9e5b', shirtOpts: { collar: '#2f9e5b', print: 'hoodie' }, pants: '#26335a', shoe: '#333', hair: '#6b3e1e', hairStyle: 'short', scale: 1.0, style: {} },
  kida: { skin: '#c98e62', shirt: '#e53935', shirtOpts: { collar: '#e53935', print: 'hoodie' }, pants: '#2c3e50', shoe: '#ffffff', hair: '#1c1714', hairStyle: 'short', scale: 0.68, style: {} },
  kidb: { skin: '#f0c9a6', shirt: '#3a7bd5', shirtOpts: { collar: '#ffffff', print: 'overalls' }, pants: '#3a7bd5', shoe: '#ffffff', hair: '#e07a2e', hairStyle: 'pigtails', scale: 0.66, style: { lashes: true } },
  ypell: { skin: '#f0c9a6', shirt: '#7a4fb3', shirtOpts: { collar: '#e8dcff', print: 'dots' }, pants: '#7a4fb3', shoe: '#4a3020', hair: '#6b3e1e', hairStyle: 'pigtails', extras: [shawl('#3f9a5f')], scale: 0.7, style: { lashes: true } },
};
for (const k of ['marcus', 'rex', 'pia', 'gwen', 'ollie', 'jada', 'leo', 'zoe', 'vince']) KIT_CAST[k + 'm'] = { ...KIT_CAST[k], extras: [...(KIT_CAST[k].extras || []), smileMask] };
export function makeKitCharacter(who) {
  const L = KIT_CAST[who];
  const a = avatar({ ...L, face: 'smile' });
  const P = a.userData;
  P.who = who; P.scale = L.scale; a.scale.setScalar(L.scale);
  P.hairStyle = L.hairStyle; P.hairBase = { messy: 0.92, short: 0.78, bun: 0.78, none: 0.85, spiky: 0.95, pigtails: 0.8 }[L.hairStyle] ?? 0.85;
  P.setClothes = (shirt, pants) => { if (shirt) P.shirtMats.forEach(m => m.color.set(shirt)); if (pants) P.pantsMat.color.set(pants); };
  faceRig(P, L.style);
  P.setFace = () => {}; P.defaultFace = 'neutral';
  return a;
}

// ---------------- the Lie-Monster ----------------
// Original design: navy-black smoky block body with spiky smoke crown, long readable arms, round amber eyes
// that brighten as it grows (deliberately NOT tall-black-with-purple-eyes, to avoid any known game creature).
// set({ h: height in world units, eyes 0..1, crack 0..1, dissolve 0..1, t })
export function lieMonster() {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const crackTex = canvasTex(256, 256, (c) => {
    c.fillStyle = '#000'; c.fillRect(0, 0, 256, 256); c.strokeStyle = '#fff'; c.lineWidth = 5; c.lineCap = 'round';
    let s = 3; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let k = 0; k < 7; k++) { c.beginPath(); let x = r() * 256, y = r() * 256; c.moveTo(x, y); for (let i = 0; i < 6; i++) { x += (r() - 0.5) * 90; y += (r() - 0.5) * 90; c.lineTo(x, y); } c.stroke(); }
  });
  const mat = new THREE.MeshStandardMaterial({ color: '#24346a', roughness: 0.95, emissive: '#ffd9a0', emissiveMap: crackTex, emissiveIntensity: 0, transparent: true });
  const rim = new THREE.MeshStandardMaterial({ color: '#1f2a44', roughness: 0.9, transparent: true });
  const part = (w, h, d, m, x, y, z, r = 0.12) => { const o = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, r), m); o.position.set(x, y, z); o.castShadow = true; body.add(o); return o; };
  // unit height = 6.8 (scaled by set)
  const legs = [-0.55, 0.55].map(x => part(0.75, 1.7, 0.8, mat, x, 0.85, 0));
  const torso = part(2.2, 2.5, 1.2, mat, 0, 2.95, -0.05, 0.25); torso.rotation.x = 0.12;
  const head = new THREE.Group(); head.position.set(0, 4.85, 0.3); body.add(head);
  const hm = new THREE.Mesh(new RoundedBoxGeometry(1.75, 1.5, 1.4, 4, 0.35), mat); hm.castShadow = true; head.add(hm);
  for (const [x, z, h, rz] of [[-0.55, 0.1, 0.5, 0.5], [-0.2, -0.1, 0.75, 0.15], [0.2, 0.05, 0.6, -0.2], [0.55, -0.15, 0.45, -0.55], [0, -0.45, 0.55, 0]]) { const sp = new THREE.Mesh(new THREE.ConeGeometry(0.2, h, 4), rim); sp.position.set(x, 0.75 + h / 2, z); sp.rotation.z = rz; head.add(sp); }
  const eyeMat = new THREE.MeshStandardMaterial({ color: '#fff1b8', emissive: '#ffcf5a', emissiveIntensity: 0.6, roughness: 0.3, transparent: true });
  const eyes = [-1, 1].map(s => { const e = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 12), eyeMat); e.scale.set(1, 1.15, 0.35); e.position.set(0.4 * s, 0.05, 0.7); head.add(e); return e; });
  const arms = [-1, 1].map(s => { const a = new THREE.Group(); a.position.set(1.25 * s, 3.95, 0); body.add(a);
    const up = new THREE.Mesh(new RoundedBoxGeometry(0.55, 2.0, 0.6, 2, 0.15), mat); up.position.y = -1.0; a.add(up);
    const lo = new THREE.Group(); lo.position.y = -2.0; a.add(lo);
    const fo = new THREE.Mesh(new RoundedBoxGeometry(0.5, 1.8, 0.55, 2, 0.15), mat); fo.position.y = -0.9; lo.add(fo);
    for (let f = -1; f <= 1; f++) { const fi = new THREE.Mesh(new RoundedBoxGeometry(0.14, 0.5, 0.14, 1, 0.05), mat); fi.position.set(f * 0.16, -1.95, 0.05); lo.add(fi); }
    a.userData.lo = lo; return a; });
  body.traverse(o => { if (o.isMesh) o.castShadow = true; });
  const light = new THREE.PointLight('#ffcf5a', 0, 9, 1.8); light.position.set(0, 4.6, 3.4); body.add(light);
  // wisps (dark cubes drifting up off the body) + dissolve particles
  const wispMat = new THREE.MeshBasicMaterial({ color: '#1c2540', transparent: true });
  const wisps = Array.from({ length: 22 }, (_, i) => { const w = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.22), wispMat.clone()); g.add(w); return { w, a: i * 2.39996, r: 0.9 + (i % 5) * 0.25, sp: 0.5 + (i % 4) * 0.15, ph: i * 0.37 }; });
  const dust = Array.from({ length: 140 }, (_, i) => { const d = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), new THREE.MeshBasicMaterial({ color: i % 4 ? '#1c2540' : '#ffd9a0', transparent: true })); d.visible = false; g.add(d);
    return { d, x: Math.sin(i * 2.4) * (0.4 + (i % 7) * 0.15), y: 0.3 + (i * 0.618 % 1) * 6.2, z: Math.cos(i * 2.4) * (0.3 + (i % 5) * 0.12), vx: Math.sin(i * 1.7) * 1.4, vy: 1.2 + (i % 6) * 0.35, vz: Math.cos(i * 1.3) * 1.2 }; });
  g.userData.set = ({ h = 6.8, eyes: ev = 0.5, crack = 0, dissolve = 0, t = 0, sway = 1 }) => {
    const sc = h / 6.1; body.scale.setScalar(sc);   // 6.1 = body height incl. head spikes at scale 1
    body.rotation.z = Math.sin(t * 0.9) * 0.03 * sway; head.rotation.set(0.1 + Math.sin(t * 0.7) * 0.05 * sway, Math.sin(t * 0.5) * 0.12 * sway, 0);
    arms.forEach((a, k) => { a.rotation.set(-0.15 + Math.sin(t * 0.8 + k) * 0.08 * sway, 0, (k ? -1 : 1) * 0.08); a.userData.lo.rotation.x = -0.35 + Math.sin(t * 1.1 + k) * 0.06 * sway; });
    const vis = 1 - dissolve;
    mat.opacity = rim.opacity = Math.max(0, 1 - dissolve * 1.6); eyeMat.opacity = mat.opacity;
    mat.emissiveIntensity = crack * 2.2 * (1 - dissolve);
    eyeMat.emissiveIntensity = (0.35 + ev * 2.4) * (1 - crack * 0.85); light.intensity = (ev * 14 + crack * 30) * sc * vis;
    light.color.set(crack > 0.2 ? '#ffd9a0' : '#ffcf5a'); body.visible = mat.opacity > 0.01;
    wisps.forEach(o => { const life = (t * o.sp + o.ph) % 1; o.w.position.set(Math.sin(o.a + t * 0.4) * o.r * sc * 1.2, (1 + life * 5.5) * sc, Math.cos(o.a + t * 0.4) * o.r * sc * 0.8); o.w.scale.setScalar(sc * (1 - life) * (dissolve > 0 ? 0 : 1)); o.w.material.opacity = 0.75 * (1 - life); });
    dust.forEach(p => { p.d.visible = dissolve > 0.01 && dissolve < 0.999; if (!p.d.visible) return; const k = dissolve * 2.2;
      p.d.position.set((p.x + p.vx * k) * sc, (p.y + p.vy * k) * sc, (p.z + p.vz * k) * sc); p.d.scale.setScalar(sc * Math.max(0, 1 - dissolve)); p.d.material.opacity = Math.max(0, 1 - dissolve * 1.1); p.d.rotation.set(k * 3, k * 2, 0); });
  };
  g.userData.set({});
  return g;
}


// ---------------- the Deer (style-reference monster, 2026-11-22) ----------------
// Original build: tall thin brown body, deer head with branching pale antlers, big round staring eyes,
// a wide open mouth, long arms with dark claws, hooved legs. set({ h, t, reach 0..1 (arms up), lean, sway, eyes })
export function deerMonster() {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const fur = plastic('#6e4128', { roughness: 0.85 }), furL = plastic('#8c5a38', { roughness: 0.85 }), dark = plastic('#1a1210', { roughness: 0.4 }), bone = plastic('#e9e2d2', { roughness: 0.6 }), pink = plastic('#e8899a');
  const rb = (w, h, d, m, r = 0.15) => { const o = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, r), m); o.castShadow = true; return o; };
  const legs = [-1, 1].map(s => { const hip = new THREE.Group(); hip.position.set(0.42 * s, 3.0, 0); body.add(hip);
    const th = rb(0.5, 1.5, 0.6, fur); th.position.y = -0.7; th.rotation.x = -0.25; hip.add(th);
    const kn = new THREE.Group(); kn.position.set(0, -1.4, 0.3); hip.add(kn);
    const sh = rb(0.38, 1.5, 0.42, fur); sh.position.y = -0.72; sh.rotation.x = 0.35; kn.add(sh);
    const hf = rb(0.42, 0.32, 0.55, dark, 0.08); hf.position.set(0, -1.48, -0.18); kn.add(hf); return hip; });
  const torso = rb(1.5, 2.3, 0.9, fur, 0.3); torso.position.y = 4.1; body.add(torso);
  const chest = rb(1.0, 1.2, 0.2, furL, 0.1); chest.position.set(0, 4.5, 0.42); body.add(chest);
  const neck = rb(0.55, 0.8, 0.55, fur); neck.position.set(0, 5.5, 0.1); body.add(neck);
  const head = new THREE.Group(); head.position.set(0, 6.25, 0.18); body.add(head);
  head.add(rb(1.05, 1.0, 1.0, fur, 0.35));
  const snout = rb(0.66, 0.55, 0.75, furL, 0.22); snout.position.set(0, -0.28, 0.6); head.add(snout);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 10), dark); nose.scale.set(1.3, 0.8, 0.8); nose.position.set(0, -0.12, 0.98); head.add(nose);
  const mouth = new THREE.Mesh(new THREE.SphereGeometry(0.24, 18, 12), plastic('#2a0c10', { roughness: 0.9 })); mouth.scale.set(1.0, 1.3, 0.35); mouth.position.set(0, -0.5, 0.92); head.add(mouth);
  const pupils = [-1, 1].map(s => { const e = new THREE.Mesh(new THREE.SphereGeometry(0.27, 20, 14), plastic('#ffffff', { roughness: 0.2 })); e.scale.set(1, 1, 0.55); e.position.set(0.3 * s, 0.14, 0.5); head.add(e);
    const pu = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 10), plastic('#0a0a0a', { roughness: 0.2 })); pu.position.set(0.3 * s, 0.14, 0.66); head.add(pu); return pu; });
  for (const s of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.6, 12), fur); ear.scale.z = 0.45; ear.position.set(0.62 * s, 0.38, -0.05); ear.rotation.z = -1.0 * s; head.add(ear);
    const inr = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.42, 12), pink); inr.scale.z = 0.3; inr.position.set(0.63 * s, 0.37, 0.04); inr.rotation.z = -1.0 * s; head.add(inr);
    const A = new THREE.Group(); A.position.set(0.3 * s, 0.48, -0.05); A.rotation.z = -0.35 * s; head.add(A);
    const seg = (len, rot, at, rad = 0.06) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(rad * 0.7, rad, len, 8), bone); const G = new THREE.Group(); G.position.set(at[0], at[1], at[2]); G.rotation.set(rot[0], 0, rot[1]); c.position.y = len / 2; G.add(c); A.add(G); return G; };
    seg(1.5, [0, 0.1 * s], [0, 0, 0], 0.08); seg(0.7, [0.3, -0.7 * s], [0.08 * s, 0.6, 0]); seg(0.6, [0.2, 0.7 * s], [0.12 * s, 1.0, 0]); seg(0.55, [-0.2, -0.5 * s], [0.16 * s, 1.35, 0]);
  }
  const arms = [-1, 1].map(s => { const sh = new THREE.Group(); sh.position.set(0.95 * s, 5.0, 0); body.add(sh);
    const up = rb(0.38, 1.9, 0.42, fur); up.position.y = -0.95; sh.add(up);
    const el = new THREE.Group(); el.position.y = -1.9; sh.add(el);
    const fo = rb(0.34, 1.8, 0.38, fur); fo.position.y = -0.9; el.add(fo);
    const hand = rb(0.44, 0.45, 0.24, fur, 0.1); hand.position.y = -1.95; el.add(hand);
    for (let f = 0; f < 4; f++) { const cl = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.55, 6), dark); cl.position.set((f - 1.5) * 0.11, -2.4, 0.02); cl.rotation.x = Math.PI; el.add(cl); }
    sh.userData.el = el; return sh; });
  body.traverse(o => { if (o.isMesh) o.castShadow = true; });
  g.userData.set = ({ h = 7.4, t = 0, reach = 0.6, lean = 0.15, sway = 1, eyes: ev = 0.5 }) => {
    body.scale.setScalar(h / 7.4);
    body.rotation.x = lean; head.rotation.set(-0.1 + Math.sin(t * 0.8) * 0.06 * sway, Math.sin(t * 0.5) * 0.15 * sway, Math.sin(t * 1.3) * 0.12 * sway);
    arms.forEach((a, k) => { const sgn = k ? 1 : -1; a.rotation.set(-0.3 - reach * 2.3 + Math.sin(t * 1.6 + k) * 0.1 * sway, 0, sgn * (0.12 + reach * 0.12)); a.userData.el.rotation.x = -0.3 - reach * 0.5; });
    legs.forEach((l, k) => { l.rotation.x = Math.sin(t * 2 + k * Math.PI) * 0.08 * sway; });
    pupils.forEach(p => p.scale.setScalar(1.25 - ev * 0.6));
  };
  g.userData.set({});
  return g;
}

// heights (world units) for the growth stages; Noah is ~5.4 tall
export const MONSTER_H = { shoe: 0.9, knee: 2.2, waist: 3.4, tall: 6.9 };
export { scarf };

// ---------------- chest step counter (story 003) ----------------
const ctrCache = new Map();
export function counterTexture(v) {
  if (!ctrCache.has(v)) ctrCache.set(v, canvasTex(256, 128, (g) => {
    g.clearRect(0, 0, 256, 128);
    if (typeof v === 'string' && v[0] === 'H') {   // 'H1204' / 'Hinf' = big red number floating above the head (story 010, like the reference Short)
      const txt = v.slice(1) === 'inf' ? '\u221E' : v.slice(1), fs = v === 'Hinf' ? 150 : txt.length >= 5 ? 70 : txt.length === 4 ? 84 : 104;
      g.font = 'bold ' + fs + 'px Arial Black, Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
      g.lineWidth = 10; g.strokeStyle = '#3a0000'; g.strokeText(txt, 128, 66); g.fillStyle = '#ff2020'; g.fillText(txt, 128, 66); return;
    }
    if (typeof v === 'string' && v[0] === 'L') {   // 'L1000' = luck style (story 009): big outlined number printed on the shirt, green if positive, red if negative
      const n = +v.slice(1), c = n < 0 ? '#ff2a2a' : '#22d84a', txt = (n <= -1e6 ? '-1,000,000' : String(n)) + '%', fs = txt.length >= 10 ? 32 : txt.length >= 7 ? 46 : txt.length === 6 ? 52 : txt.length === 5 ? 62 : txt.length === 4 ? 78 : 96;
      g.font = 'bold ' + fs + 'px Arial Black, Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
      g.lineWidth = 12; g.strokeStyle = '#0c3d1a'; if (n < 0) g.strokeStyle = '#4a0a0a'; g.strokeText(txt, 128, 66); g.fillStyle = c; g.fillText(txt, 128, 66); return;
    }
    const zero = v <= 0, c = zero ? '#ff6b6b' : '#7ff3ff';
    g.fillStyle = 'rgba(10,20,40,0.55)'; g.beginPath(); g.roundRect(8, 14, 240, 100, 44); g.fill();
    g.strokeStyle = c; g.lineWidth = 6; g.beginPath(); g.roundRect(8, 14, 240, 100, 44); g.stroke();
    g.shadowColor = c; g.shadowBlur = 18; g.fillStyle = c; g.font = 'bold 76px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(v), 128, 66);
  }));
  return ctrCache.get(v);
}
export function addCounter(P) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.75), new THREE.MeshBasicMaterial({ transparent: true, toneMapped: false, depthWrite: false }));
  m.position.set(0, 0.2, 0.74); m.renderOrder = 5; P.torso.add(m); P.counterMesh = m;
  P.setCounter = (v) => { if (P.counterVal === v) return; P.counterVal = v; m.material.map = counterTexture(v); m.material.needsUpdate = true; const lk = typeof v === 'string' && v[0] === 'L', hd = typeof v === 'string' && v[0] === 'H'; m.scale.set(v === 'Hinf' ? 2.8 : hd ? 1.9 : lk ? 1.3 : 1, v === 'Hinf' ? 2.8 : hd ? 1.9 : lk ? 1.3 : 1, 1); m.position.y = hd ? 3.35 : lk ? 0.05 : 0.2; m.position.z = hd ? 0.2 : 0.74; };
}
