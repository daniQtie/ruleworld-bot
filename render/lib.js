import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const W = +(new URLSearchParams(location.search).get('w') || 1080), H = +(new URLSearchParams(location.search).get('h') || 1920);
export const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(W, H); renderer.setPixelRatio(1);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.12;
document.body.appendChild(renderer.domElement);

export const scene = new THREE.Scene();
export const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 600);

// ---------- light: bright, warm, Roblox-like daylight ----------
scene.add(new THREE.HemisphereLight(0xeaf6ff, 0x7aa35a, 1.35));
export const sun = new THREE.DirectionalLight(0xfff0d6, 2.6);
sun.position.set(30, 48, 26); sun.castShadow = true;
sun.shadow.mapSize.set(4096, 4096); sun.shadow.radius = 4;
Object.assign(sun.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, near: 1, far: 160 });
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02; scene.add(sun);
const fill = new THREE.DirectionalLight(0xcfe6ff, 0.55); fill.position.set(-30, 20, 30); scene.add(fill);

// ---------- textures drawn in code ----------
export function canvasTex(w, h, draw, rx = 1, ry = rx) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (rx !== 1 || ry !== 1) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); }
  return t;
}
scene.background = canvasTex(8, 512, (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, '#2f86f2'); gr.addColorStop(0.6, '#79c0ff'); gr.addColorStop(1, '#d6eeff');
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
});
scene.fog = new THREE.Fog(0xcfeaff, 70, 190);
export function studTex(base, rep) {
  const [rx, ry] = Array.isArray(rep) ? rep : [rep, rep];
  return canvasTex(128, 128, (g) => {
    g.fillStyle = base; g.fillRect(0, 0, 128, 128);
    g.fillStyle = 'rgba(0,0,0,0.14)'; g.beginPath(); g.arc(69, 70, 34, 0, 7); g.fill();
    g.fillStyle = base; g.beginPath(); g.arc(64, 64, 34, 0, 7); g.fill();
    const rg = g.createRadialGradient(54, 52, 4, 64, 64, 34);
    rg.addColorStop(0, 'rgba(255,255,255,0.38)'); rg.addColorStop(1, 'rgba(255,255,255,0.03)');
    g.fillStyle = rg; g.beginPath(); g.arc(64, 64, 34, 0, 7); g.fill();
  }, rx, ry);
}
export function faceTex(kind) {
  return canvasTex(256, 256, (g) => {
    g.fillStyle = '#f5cd4f'; g.fillRect(0, 0, 256, 256);
    g.fillStyle = '#151515';
    const eye = (x, y, rx, ry) => { g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 7); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(x - 3, y - 6, 4, 0, 7); g.fill(); g.fillStyle = '#151515'; };
    if (kind === 'surprised') { eye(88, 106, 14, 21); eye(168, 106, 14, 21); g.beginPath(); g.ellipse(128, 180, 17, 21, 0, 0, 7); g.fill(); return; }
    if (kind === 'old') {
      eye(90, 112, 11, 15); eye(166, 112, 11, 15);
      g.strokeStyle = '#6b6b6b'; g.lineWidth = 6; g.lineCap = 'round';
      g.beginPath(); g.moveTo(70, 82); g.lineTo(106, 78); g.moveTo(150, 78); g.lineTo(186, 82); g.stroke();
      g.strokeStyle = '#151515'; g.lineWidth = 8; g.beginPath(); g.arc(128, 150, 30, 0.25 * Math.PI, 0.75 * Math.PI); g.stroke();
      g.fillStyle = 'rgba(240,120,110,0.35)'; g.beginPath(); g.arc(70, 150, 16, 0, 7); g.arc(186, 150, 16, 0, 7); g.fill();
      return;
    }
    eye(90, 108, 13, 19); eye(166, 108, 13, 19);
    g.strokeStyle = '#151515'; g.lineWidth = 10; g.lineCap = 'round';
    g.beginPath(); g.arc(128, 146, 46, 0.18 * Math.PI, 0.82 * Math.PI); g.stroke();
    g.fillStyle = 'rgba(240,120,110,0.30)'; g.beginPath(); g.arc(66, 150, 16, 0, 7); g.arc(190, 150, 16, 0, 7); g.fill();
  });
}
export function star(g, cx, cy, R, r) { g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, d = i % 2 ? r : R; g.lineTo(cx + Math.cos(a) * d, cy + Math.sin(a) * d); } g.closePath(); g.fill(); }
export function shirtTex(c, { collar = '#ffffff', print = null, inner = '#ffffff', tie = null, sparkle = false, word = '', ink = '#151515' } = {}) {
  if (print === 'jacket' || print === 'suit') return canvasTex(256, 256, (g) => {   // open jacket / suit over an inner shirt (style ref 2026-11-22)
    g.fillStyle = inner; g.fillRect(0, 0, 256, 256);
    if (print === 'suit') { g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(96, 0); g.lineTo(128, 70); g.lineTo(160, 0); g.fill(); if (tie) { g.fillStyle = tie; g.beginPath(); g.moveTo(120, 18); g.lineTo(136, 18); g.lineTo(142, 150); g.lineTo(128, 170); g.lineTo(114, 150); g.closePath(); g.fill(); } }
    g.fillStyle = c; g.beginPath(); g.moveTo(0, 0); g.lineTo(96, 0); g.lineTo(print === 'suit' ? 118 : 100, print === 'suit' ? 150 : 256); g.lineTo(print === 'suit' ? 118 : 100, 256); g.lineTo(0, 256); g.fill();
    g.beginPath(); g.moveTo(256, 0); g.lineTo(160, 0); g.lineTo(print === 'suit' ? 138 : 156, print === 'suit' ? 150 : 256); g.lineTo(print === 'suit' ? 138 : 156, 256); g.lineTo(256, 256); g.fill();
    g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 4; g.beginPath(); g.moveTo(96, 0); g.lineTo(112, 110); g.moveTo(160, 0); g.lineTo(144, 110); g.stroke();   // lapels
    g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(24, 170, 56, 8); g.fillRect(176, 170, 56, 8); g.fillRect(0, 236, 256, 20);
  });
  return canvasTex(256, 256, (g) => {
    g.fillStyle = c; g.fillRect(0, 0, 256, 256);
    g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(0, 236, 256, 20);
    g.fillStyle = collar; g.beginPath(); g.moveTo(88, 0); g.lineTo(128, 46); g.lineTo(168, 0); g.closePath(); g.fill();
    g.fillStyle = c; g.beginPath(); g.moveTo(100, 0); g.lineTo(128, 32); g.lineTo(156, 0); g.closePath(); g.fill();
    if (print === 'word') { g.fillStyle = ink; g.font = 'bold 96px "Yu Gothic", "Noto Sans CJK JP", "Meiryo", "MS Gothic", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(word, 128, 140); }   // 2026-11-24 boy's white tee with a word
    if (print === 'star') { g.fillStyle = '#ffd23f'; star(g, 128, 120, 34, 15); g.strokeStyle = '#c99700'; g.lineWidth = 4; g.stroke(); }
    if (print === 'stripes') { g.fillStyle = 'rgba(255,255,255,0.0)'; g.fillStyle = 'rgba(0,0,0,0.22)'; for (let y = 52; y < 236; y += 44) g.fillRect(0, y, 256, 20); }
    if (print === 'dots') { g.fillStyle = 'rgba(0,0,0,0.2)'; for (let y = 60; y < 236; y += 40) for (let x = (y / 40 % 2) * 20 + 14; x < 256; x += 40) { g.beginPath(); g.arc(x, y, 9, 0, 7); g.fill(); } }
    if (print === 'plaid') { g.fillStyle = 'rgba(0,0,0,0.16)'; for (let x = 0; x < 256; x += 48) g.fillRect(x, 0, 18, 256); for (let y = 30; y < 256; y += 48) g.fillRect(0, y, 256, 18); }
    if (print === 'overalls') { g.fillStyle = 'rgba(0,0,0,0.38)'; g.fillRect(56, 120, 144, 136); g.fillRect(62, 0, 26, 130); g.fillRect(168, 0, 26, 130); g.fillStyle = '#ffd23f'; g.beginPath(); g.arc(75, 128, 9, 0, 7); g.arc(181, 128, 9, 0, 7); g.fill(); }
    if (print === 'heart') { g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(128, 170); g.bezierCurveTo(60, 120, 90, 70, 128, 100); g.bezierCurveTo(166, 70, 196, 120, 128, 170); g.fill(); }
    if (print === 'hoodie') { g.fillStyle = 'rgba(0,0,0,0.16)'; g.fillRect(56, 150, 144, 80); g.fillStyle = 'rgba(255,255,255,0.10)'; g.fillRect(60, 150, 136, 6); g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(126, 40, 4, 110); g.strokeStyle = '#f2f2f2'; g.lineWidth = 6; g.lineCap = 'round'; for (const x of [104, 152]) { g.beginPath(); g.moveTo(x, 10); g.lineTo(x + (x < 128 ? -4 : 4), 92); g.stroke(); g.fillStyle = '#f2f2f2'; g.fillRect(x - 5 + (x < 128 ? -4 : 4), 90, 10, 12); } g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(0, 226, 256, 30); }
    if (print === 'sweater') { g.fillStyle = 'rgba(0,0,0,0.07)'; for (let x = 6; x < 256; x += 22) g.fillRect(x, 40, 6, 180); g.fillStyle = 'rgba(0,0,0,0.16)'; g.fillRect(0, 218, 256, 38); g.fillStyle = 'rgba(255,255,255,0.18)'; for (let x = 0; x < 256; x += 12) g.fillRect(x, 222, 5, 30); g.fillStyle = '#fff3e6'; g.beginPath(); g.moveTo(128, 150); g.bezierCurveTo(98, 126, 108, 100, 128, 116); g.bezierCurveTo(148, 100, 158, 126, 128, 150); g.fill(); }
    if (print === 'bolt') { g.fillStyle = '#ffe14a'; g.strokeStyle = '#c99700'; g.lineWidth = 5; g.beginPath(); g.moveTo(150, 60); g.lineTo(96, 140); g.lineTo(128, 140); g.lineTo(108, 206); g.lineTo(168, 120); g.lineTo(134, 120); g.closePath(); g.fill(); g.stroke(); }
    if (print === 'buttons') { g.fillStyle = 'rgba(0,0,0,0.15)'; g.fillRect(126, 40, 4, 216); g.fillStyle = '#e8e8e8'; for (let y = 70; y < 230; y += 40) { g.beginPath(); g.arc(128, y, 7, 0, 7); g.fill(); } }
    if (print === 'jersey') { g.fillStyle = '#ffffff'; g.fillRect(0, 0, 256, 14); g.fillRect(0, 222, 256, 10); g.fillStyle = '#ffffff';
      for (const x of [104, 152]) { g.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? 6 : 14; g.lineTo(x + Math.cos(a) * r, 62 + Math.sin(a) * r); } g.closePath(); g.fill(); }
      g.strokeStyle = '#ffffff'; g.lineWidth = 8; g.beginPath(); g.moveTo(98, 86); g.lineTo(158, 86); g.lineTo(158, 150); g.quadraticCurveTo(128, 196, 98, 150); g.closePath(); g.stroke();
      g.fillStyle = '#ffffff'; g.font = 'bold 76px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(inner && inner.length < 4 ? inner : '8'), 128, 134); }
    if (print === 'flannel') { g.fillStyle = 'rgba(0,0,0,0.38)'; for (let x = 0; x < 256; x += 40) g.fillRect(x, 0, 16, 256); for (let y = 0; y < 256; y += 40) g.fillRect(0, y, 256, 16); g.fillStyle = '#151515'; g.fillRect(96, 0, 64, 256); }
    if (sparkle) { let s = 11; const r = () => (s = (s * 16807) % 2147483647) / 2147483647; g.fillStyle = 'rgba(255,255,255,0.55)'; for (let i = 0; i < 160; i++) { g.beginPath(); g.arc(r() * 256, r() * 256, 1 + r() * 2.2, 0, 7); g.fill(); } }
  });
}
export function pantsTex(c, shoe = '#2b2b2b', belt = '#3b2a1a') {
  return canvasTex(128, 256, (g) => {
    g.fillStyle = c; g.fillRect(0, 0, 128, 256);
    g.fillStyle = belt; g.fillRect(0, 0, 128, 22);
    g.fillStyle = 'rgba(0,0,0,0.10)'; g.fillRect(60, 22, 6, 180);
    g.fillStyle = shoe; g.fillRect(0, 208, 128, 48);
    g.fillStyle = '#f2f2f2'; g.fillRect(0, 244, 128, 12);
  });
}

export const plastic = (c, extra = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.5, metalness: 0.0, ...extra });
export const texMat = (map) => new THREE.MeshStandardMaterial({ map, roughness: 0.55 });
export const SKIN = '#f5cd4f';

// ---------- R6-style avatar ----------
export function avatar({ shirt, shirtOpts, pants, shoe, hair, hairStyle = 'messy', face = 'smile', extras = [], bunTie = '#c0392b', skin: skinC = SKIN }) {
  const g = new THREE.Group();
  const box = (w, h, d, mat, r = 0.06, seg = 3) => { const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, seg, r), mat); m.castShadow = m.receiveShadow = true; return m; };
  const sm = plastic(shirt), front = texMat(shirtTex(shirt, shirtOpts));
  const torso = box(2, 2, 1, [sm, sm, sm, sm, front, sm]); torso.position.y = 3; g.add(torso);
  const pm = texMat(pantsTex(pants, shoe)), legs = [], arms = [];
  for (const s of [-1, 1]) {
    const leg = new THREE.Group(); leg.position.set(0.5 * s, 2, 0);
    const l = box(0.98, 2, 1, pm); l.position.y = -1; leg.add(l); g.add(leg); legs.push(leg);
    const arm = new THREE.Group(); arm.position.set(1.5 * s, 3.8, 0);
    const a = box(0.98, 1.55, 1, sm); a.position.y = -0.55; arm.add(a);
    const hand = box(0.98, 0.5, 1, plastic(skinC), 0.1); hand.position.y = -1.55; arm.add(hand);
    g.add(arm); arms.push(arm);
  }
  const head = new THREE.Group(); head.position.y = 4.62;
  const skin = plastic(skinC), fm = texMat(faceTex(face));
  const h = new THREE.Mesh(new RoundedBoxGeometry(1.25, 1.22, 1.22, 5, 0.26), [skin, skin, skin, skin, fm, skin]);
  h.castShadow = true; head.add(h);
  const neck = box(0.6, 0.2, 0.6, skin); neck.position.y = -0.62; head.add(neck);
  const hm = plastic(hair, { roughness: 0.45 });
  if (hairStyle === 'messy') {
    const cap = box(1.42, 0.55, 1.36, hm, 0.2); cap.position.set(0, 0.6, -0.04); head.add(cap);
    for (const [x, r] of [[-0.42, -0.35], [-0.05, 0.15], [0.38, 0.4]]) { const f = box(0.48, 0.42, 0.42, hm, 0.15); f.position.set(x, 0.42, 0.5); f.rotation.set(0.5, 0, r); head.add(f); }
    for (const [x, z, rz] of [[-0.5, 0.1, 0.5], [0.0, 0.0, -0.3], [0.5, -0.1, 0.4], [-0.25, -0.45, -0.4], [0.3, -0.5, 0.3]]) {
      const t = box(0.5, 0.4, 0.55, hm, 0.15); t.position.set(x, 0.92, z); t.rotation.set(-0.2, rz, rz); head.add(t);
    }
    for (const s of [-1, 1]) { const side = box(0.22, 0.75, 0.9, hm, 0.1); side.position.set(0.68 * s, 0.18, -0.1); head.add(side); }
    const back = box(1.42, 0.95, 0.32, hm, 0.12); back.position.set(0, 0.18, -0.6); head.add(back);
  } else if (hairStyle === 'bun') {
    const cap = box(1.4, 0.5, 1.38, hm, 0.22); cap.position.set(0, 0.6, -0.04); head.add(cap);
    for (const s of [-1, 1]) { const side = box(0.2, 0.6, 0.95, hm, 0.1); side.position.set(0.67 * s, 0.25, -0.1); head.add(side); }
    const bun = new THREE.Mesh(new THREE.SphereGeometry(0.46, 28, 20), hm); bun.position.set(0, 1.0, -0.35); head.add(bun);
    if (bunTie) { const tie = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.07, 10, 24), plastic(bunTie)); tie.position.set(0, 0.86, -0.3); tie.rotation.x = 1.2; head.add(tie); }
  } else if (hairStyle === 'spiky') {
    const cap = box(1.38, 0.42, 1.34, hm, 0.16); cap.position.set(0, 0.62, -0.04); head.add(cap);
    for (const [x, z] of [[-0.42, 0.3], [0, 0.35], [0.42, 0.3], [-0.45, -0.25], [0.05, -0.2], [0.45, -0.3], [-0.2, 0.0], [0.25, 0.05]]) {
      const sp = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.55, 4), hm); sp.position.set(x, 0.98, z); sp.rotation.set(z * 0.9, 0.78, -x * 0.9); head.add(sp);
    }
    for (const s of [-1, 1]) { const side = box(0.2, 0.5, 0.9, hm, 0.08); side.position.set(0.67 * s, 0.32, -0.12); head.add(side); }
  } else if (hairStyle === 'pigtails') {
    const cap = box(1.42, 0.5, 1.38, hm, 0.22); cap.position.set(0, 0.6, -0.04); head.add(cap);
    const fr = box(1.3, 0.32, 0.3, hm, 0.12); fr.position.set(0, 0.5, 0.52); fr.rotation.x = 0.35; head.add(fr);
    for (const s of [-1, 1]) {
      const side = box(0.2, 0.7, 0.95, hm, 0.1); side.position.set(0.67 * s, 0.2, -0.1); head.add(side);
      const tail = new THREE.Group(); tail.position.set(0.72 * s, 0.45, -0.15);
      const t1 = new THREE.Mesh(new THREE.SphereGeometry(0.3, 20, 14), hm); t1.position.set(0.18 * s, -0.25, 0); t1.scale.set(1, 1.5, 1); tail.add(t1);
      const t2 = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), hm); t2.position.set(0.28 * s, -0.75, 0); t2.scale.set(1, 1.4, 1); tail.add(t2);
      head.add(tail); (head.userData.tails ||= []).push(tail);
    }
  } else if (hairStyle === 'short') {
    const cap = box(1.4, 0.4, 1.36, hm, 0.18); cap.position.set(0, 0.6, -0.05); head.add(cap);
    const fr = box(1.36, 0.22, 0.3, hm, 0.1); fr.position.set(0, 0.55, 0.5); head.add(fr);
    for (const s of [-1, 1]) { const side = box(0.18, 0.5, 0.85, hm, 0.08); side.position.set(0.66 * s, 0.3, -0.12); head.add(side); }
    const back = box(1.36, 0.7, 0.26, hm, 0.1); back.position.set(0, 0.3, -0.6); head.add(back);
  }
  g.add(head);
  const parts = { box, arms, legs, head, torso, hairMat: hm, faceMesh: h, shirtMats: [sm, front], pantsMat: pm, skinMat: skin };
  for (const e of extras) e(g, parts);
  g.userData = parts;
  g.traverse(o => { if (o.isMesh) o.castShadow = o.receiveShadow = true; });
  return g;
}
export const cane = (g, { arms }) => {
  const c = new THREE.Group();
  const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 3.2, 12), plastic('#7a4a25')); stick.position.y = -1.2; c.add(stick);
  const hook = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.09, 10, 20, Math.PI), plastic('#7a4a25')); hook.position.set(0.25, 0.4, 0); c.add(hook);
  c.position.set(0, -1.6, 0.45); arms[1].add(c);
};
export const glasses = (g, { head }) => {
  const m = plastic('#3a2a1a');
  for (const s of [-1, 1]) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.035, 8, 24), m); r.position.set(0.24 * s, 0.05, 0.63); head.add(r); }
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 0.04), m); bridge.position.set(0, 0.07, 0.63); head.add(bridge);
};
export const scarf = (color) => (g, { box, torso }) => { const s = box(2.15, 0.45, 1.15, plastic(color), 0.15); s.position.y = 0.85; torso.add(s); const tail = box(0.45, 1.0, 0.18, plastic(color), 0.08); tail.position.set(0.5, 0.3, 0.6); torso.add(tail); };
export const backpack = (g, { box, torso }) => { const b = box(1.5, 1.6, 0.6, plastic('#2e9e5b'), 0.18); b.position.set(0, 0, -0.78); torso.add(b); const p = box(1.1, 0.6, 0.2, plastic('#27864d'), 0.1); p.position.set(0, -0.35, -1.1); torso.add(p); };


export const ease = x => x < 0 ? 0 : x > 1 ? 1 : x * x * (3 - 2 * x);
export function frame() { if (window.__composer) window.__composer.render(); else renderer.render(scene, camera); return renderer.domElement.toDataURL('image/jpeg', 0.92); }
export { THREE };
