// Style v2 (sample, 2026-11-26): original blocky characters with painted clothes, sculpted hair, big acting faces and posed joints.
// Everything is drawn in code (no third-party character assets).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const tex = (w, h, draw, rep) => {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); }
  return t;
};
export const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.7, ...o });
export const mesh = (geo, m, parent, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; parent.add(o); return o; };
export const rbox = (w, h, d, r = 0.08) => new RoundedBoxGeometry(w, h, d, 3, r);
const shade = (hex, k) => '#' + new THREE.Color(hex).multiplyScalar(k).getHexString();

// ------------------------------------------------ faces ------------------------------------------------
const INK = '#17131a';
export function drawFace(g, e, talk = 0, blink = false) {
  if (e === 'sob') e = 'cry';
  g.clearRect(0, 0, 512, 512); g.lineCap = 'round'; g.lineJoin = 'round';
  if (e.startsWith('m_')) return monsterFace(g, e, talk);
  const ell = (x, y, rx, ry, c, rot = 0) => { g.fillStyle = c; g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); g.fill(); };
  const ring = (x, y, rx, ry, w) => { g.strokeStyle = INK; g.lineWidth = w; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.stroke(); };
  const path = (d, fill, stroke, w = 14) => { const p = new Path2D(d); if (fill) { g.fillStyle = fill; g.fill(p); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = w; g.stroke(p); } return p; };
  const brow = (d, w = 22) => path(d, null, INK, w);
  const bigEye = (x, y, rx, ry, pr, py = 0) => { ell(x, y, rx, ry, '#fff'); ring(x, y, rx, ry, 10); ell(x, y + py, pr, pr * 1.12, INK); ell(x - pr * 0.35, y + py - pr * 0.45, pr * 0.34, pr * 0.34, '#fff'); };
  const dotEye = (x, y, rx = 30, ry = 46) => { ell(x, y, rx, ry, INK); ell(x - 10, y - 18, 11, 13, '#fff'); ell(x + 9, y + 17, 5, 5, '#fff'); };
  const L = 160, R = 352, Y = 222;
  const openMouth = (cx, cy, w, h, teeth = true, tongue = true) => {
    const p = new Path2D(); p.ellipse(cx, cy, w, h, 0, 0, Math.PI * 2);
    g.fillStyle = '#4a0f1c'; g.fill(p); g.save(); g.clip(p);
    if (tongue) ell(cx, cy + h * 0.8, w * 0.7, h * 0.52, '#ef6a7c');
    if (teeth) { g.fillStyle = '#fff'; g.fillRect(cx - w, cy - h, w * 2, h * 0.34); }
    g.restore(); g.strokeStyle = INK; g.lineWidth = 12; g.stroke(p);
  };
  if (e === 'happy') {
    if (blink) { brow(`M120 232 Q160 200 200 232`, 18); brow(`M312 232 Q352 200 392 232`, 18); } else { dotEye(L, Y); dotEye(R, Y); }
    brow('M116 140 Q158 112 204 132', 16); brow('M308 132 Q354 112 396 140', 16);
    const p = path('M156 318 Q256 340 356 318 Q336 438 256 438 Q176 438 156 318 Z', '#4a0f1c');
    g.save(); g.clip(p); g.fillStyle = '#fff'; g.fillRect(150, 300, 220, 52 - talk * 8); ell(256, 436, 64, 38, '#ef6a7c'); g.restore(); path('M156 318 Q256 340 356 318 Q336 438 256 438 Q176 438 156 318 Z', null, INK, 12);
    ell(106, 312, 40, 22, 'rgba(255,110,110,.35)'); ell(406, 312, 40, 22, 'rgba(255,110,110,.35)');
  } else if (e === 'fake') {               // strained forced grin: wide stiff teeth, sad eyes, sweat drop
    bigEye(L, Y, 46, 52, 22, 6); bigEye(R, Y, 46, 52, 22, 6);
    brow('M112 168 L206 130'); brow('M306 130 L400 168');
    path('M134 328 Q256 306 378 328 Q368 420 256 420 Q144 420 134 328 Z', '#fff', INK, 14);
    path('M142 372 Q256 360 370 372', null, INK, 8);
    for (const x of [190, 232, 280, 322]) path(`M${x} 326 L${x} 414`, null, INK, 6);
    path('M442 150 Q474 206 442 218 Q410 206 442 150 Z', '#7fd0ff', '#2a7fb8', 6);
  } else if (e === 'sad' || e === 'cry') {
    if (e === 'cry') { brow('M118 240 Q160 214 204 238', 20); brow('M308 238 Q352 214 394 240', 20); }
    else { dotEye(L, Y + 8, 32, 44); dotEye(R, Y + 8, 32, 44); path('M130 266 Q160 288 190 266', null, '#7fd0ff', 12); path('M322 266 Q352 288 382 266', null, '#7fd0ff', 12); }
    brow('M110 178 Q160 160 208 128'); brow('M304 128 Q352 160 402 178');
    if (talk > 0.2 || e === 'cry') openMouth(256, 382, 56, 30 + talk * 26, false, true); else path('M196 402 Q256 342 316 402', null, INK, 18);
    if (e === 'cry') for (const x of [L, R]) { g.fillStyle = '#63c4ff'; g.beginPath(); g.roundRect(x - 26, 252, 52, 250, 26); g.fill(); g.fillStyle = 'rgba(255,255,255,.65)'; g.fillRect(x - 12, 268, 12, 200); }
  } else if (e === 'angry') {
    path('M108 216 L214 244 Q196 292 150 282 Q112 270 108 216 Z', '#fff', INK, 10); path('M404 216 L298 244 Q316 292 362 282 Q400 270 404 216 Z', '#fff', INK, 10);
    ell(170, 254, 17, 19, INK); ell(342, 254, 17, 19, INK);
    brow('M86 150 L226 228', 34); brow('M426 150 L286 228', 34);
    if (talk > 0.05) { openMouth(256, 384, 98, 34 + talk * 50); g.fillStyle = '#fff'; g.fillRect(190, 396 + talk * 36, 132, 16); } else { path('M170 396 Q256 336 342 396 Q256 376 170 396 Z', '#fff', INK, 14); }
    for (const [dx, dy, a] of [[0, -22, 0], [22, 0, 1.57], [0, 22, 0], [-22, 0, 1.57]]) { g.save(); g.translate(432 + dx, 92 + dy); g.rotate(a); path('M-15 0 Q0 14 15 0', null, '#e5203a', 12); g.restore(); }
  } else if (e === 'shocked') {
    bigEye(L - 6, Y - 6, 62, 74, 13); bigEye(R + 6, Y - 6, 62, 74, 13);
    brow('M102 118 Q158 70 214 108', 18); brow('M298 108 Q354 70 410 118', 18);
    openMouth(256, 402, 56 + talk * 10, 70 + talk * 18);
  } else if (e === 'scared') {
    bigEye(L, Y, 54, 62, 17, 4); bigEye(R, Y, 54, 62, 17, 4);
    brow('M108 168 Q160 140 206 106', 18); brow('M306 106 Q352 140 404 168', 18);
    if (talk > 0.15) openMouth(256, 390, 66, 28 + talk * 34); else { path('M166 392 Q190 360 214 390 Q236 416 258 386 Q280 358 304 390 Q326 418 348 388', null, INK, 15); }
    g.fillStyle = 'rgba(80,120,220,.28)'; for (let i = 0; i < 5; i++) g.fillRect(150 + i * 48, 40, 12, 76);
    path('M446 190 Q478 246 446 258 Q414 246 446 190 Z', '#7fd0ff', '#2a7fb8', 6);
  } else if (e === 'surprised') {
    bigEye(L, Y, 48, 58, 22); bigEye(R, Y, 48, 58, 22); brow('M112 128 Q160 92 208 122', 18); brow('M304 122 Q352 92 400 128', 18);
    openMouth(256, 390, 38 + talk * 12, 40 + talk * 22, false, true);
  } else if (e === 'confused') {
    dotEye(L, Y + 4, 30, 40); bigEye(R, Y - 6, 40, 48, 18); brow('M114 170 Q160 158 206 176', 20); brow('M304 126 Q356 92 404 134', 20);
    if (talk > 0.15) openMouth(262, 382, 42, 18 + talk * 26); else path('M190 392 Q224 358 258 386 Q290 410 326 372', null, INK, 16);
    g.fillStyle = INK; g.font = '900 96px Arial'; g.fillText('?', 420, 130);
  } else if (e === 'nervous') {
    dotEye(L, Y, 28, 40); dotEye(R, Y, 28, 40); brow('M114 160 Q160 150 206 128', 18); brow('M306 128 Q352 150 398 160', 18);
    if (talk > 0.15) openMouth(256, 384, 54, 16 + talk * 28); else path('M170 384 Q192 366 214 386 Q236 406 258 382 Q280 364 304 386 Q324 402 344 376', null, INK, 15);
    path('M440 160 Q470 214 440 226 Q410 214 440 160 Z', '#7fd0ff', '#2a7fb8', 6);
  } else if (e === 'determined') {
    path('M114 208 L206 226 Q196 276 158 270 Q122 262 114 208 Z', '#fff', INK, 9); path('M398 208 L306 226 Q316 276 354 270 Q390 262 398 208 Z', '#fff', INK, 9);
    ell(166, 244, 18, 20, INK); ell(346, 244, 18, 20, INK); ell(160, 236, 6, 6, '#fff'); ell(340, 236, 6, 6, '#fff');
    brow('M100 160 L216 204', 28); brow('M412 160 L296 204', 28);
    if (talk > 0.15) openMouth(256, 386, 58, 14 + talk * 32); else path('M190 378 Q262 396 330 360', null, INK, 18);
  } else if (e === 'laugh') {
    brow('M118 234 Q160 188 202 234', 20); brow('M310 234 Q352 188 394 234', 20); brow('M116 148 Q158 116 204 138', 15); brow('M308 138 Q354 116 396 148', 15);
    openMouth(256, 390, 100, 56 + talk * 20); ell(104, 306, 42, 22, 'rgba(255,110,110,.4)'); ell(408, 306, 42, 22, 'rgba(255,110,110,.4)');
  } else if (e === 'starstruck') {
    const star = (x, y, R2) => { g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, d = i % 2 ? R2 * 0.45 : R2; g.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d); } g.closePath(); g.fillStyle = '#ffd21f'; g.fill(); g.strokeStyle = INK; g.lineWidth = 9; g.stroke(); };
    star(L, Y, 66 + talk * 6); star(R, Y, 66 + talk * 6); brow('M112 126 Q160 96 208 120', 16); brow('M304 120 Q352 96 400 126', 16);
    openMouth(256, 392, 78, 48 + talk * 18);
  } else if (e === 'worried') {
    bigEye(L, Y + 6, 40, 48, 21, 4); bigEye(R, Y + 6, 40, 48, 21, 4); brow('M110 176 Q156 156 206 124', 20); brow('M306 124 Q356 156 402 176', 20);
    if (talk > 0.15) openMouth(256, 386, 44, 14 + talk * 30); else path('M200 400 Q256 356 312 400', null, INK, 16);
  } else if (e === 'smirk') {
    path('M118 214 L204 214 Q198 256 160 256 Q122 256 118 214 Z', '#fff', INK, 9); path('M308 214 L394 214 Q390 256 352 256 Q314 256 308 214 Z', '#fff', INK, 9);
    ell(176, 232, 17, 18, INK); ell(366, 232, 17, 18, INK); brow('M112 188 L208 192', 20); brow('M304 150 Q356 118 402 150', 20);
    if (talk > 0.15) openMouth(276, 376, 60, 14 + talk * 28); else path('M180 376 Q270 420 342 336', null, INK, 18);
  } else if (e === 'thinking') {
    bigEye(L, Y, 38, 46, 19, -18); bigEye(R, Y, 38, 46, 19, -18); brow('M116 150 Q160 140 204 160', 18); brow('M308 128 Q354 104 398 136', 18);
    if (talk > 0.15) openMouth(276, 384, 34, 12 + talk * 22); else path('M232 386 Q276 368 318 380', null, INK, 17);
  } else {                                  // neutral
    if (blink) { brow('M126 224 L196 224', 16); brow('M316 224 L386 224', 16); } else { dotEye(L, Y); dotEye(R, Y); }
    brow('M118 148 Q160 132 204 146', 16); brow('M308 146 Q352 132 394 148', 16);
    if (talk > 0.05) openMouth(256, 378, 48, 14 + talk * 38); else path('M196 368 Q256 402 316 368', null, INK, 16);
  }
}

// Monster form (owner theme 2026-11-26): wild but kid-friendly cartoon faces, glowing eyes and rounded fangs.
function monsterFace(g, e, talk) {
  const ell = (x, y, rx, ry, c) => { g.fillStyle = c; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill(); };
  const path = (d, fill, stroke, w = 14) => { const p = new Path2D(d); if (fill) { g.fillStyle = fill; g.fill(p); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = w; g.stroke(p); } return p; };
  const fang = (x, y, h, down = true) => path(`M${x - 17} ${y} L${x} ${y + (down ? h : -h)} L${x + 17} ${y} Z`, '#fffdf2', INK, 5);
  if (e === 'm_rage') {
    path('M100 196 L222 238 Q206 292 152 282 Q104 268 100 196 Z', '#ffe92e', INK, 12); path('M412 196 L290 238 Q306 292 360 282 Q408 268 412 196 Z', '#ffe92e', INK, 12);
    ell(166, 250, 9, 28, INK); ell(346, 250, 9, 28, INK);
    path('M84 150 L230 222', null, INK, 38); path('M428 150 L282 222', null, INK, 38);
    const h = 44 + talk * 44; path(`M126 ${368 - talk * 12} Q256 ${334} 386 ${368 - talk * 12} Q346 ${376 + h * 1.5} 256 ${382 + h * 1.4} Q166 ${376 + h * 1.5} 126 ${368 - talk * 12} Z`, '#3a0712', INK, 14);
    for (const x of [172, 214, 298, 340]) fang(x, 358, x === 172 || x === 340 ? 58 : 34); for (const x of [200, 256, 312]) fang(x, 384 + h, 36, false);
  } else if (e === 'm_sad') {
    for (const x of [164, 348]) { ell(x, 236, 56, 62, '#ffe92e'); g.strokeStyle = INK; g.lineWidth = 11; g.beginPath(); g.ellipse(x, 236, 56, 62, 0, 0, Math.PI * 2); g.stroke(); ell(x, 250, 27, 33, INK); ell(x - 12, 234, 10, 11, '#fff'); }
    path('M104 182 Q156 164 208 120', null, INK, 24); path('M304 120 Q356 164 408 182', null, INK, 24);
    path('M180 404 Q256 344 332 404', null, INK, 17); fang(214, 380, 36); fang(298, 380, 36);
    for (const x of [124, 388]) { g.fillStyle = '#7fd8ff'; g.beginPath(); g.roundRect(x - 18, 290, 36, 150, 18); g.fill(); }
  } else {                                   // m_happy
    path('M108 236 Q164 170 220 236', null, '#ffe92e', 30); path('M292 236 Q348 170 404 236', null, '#ffe92e', 30);
    path('M116 150 Q164 122 214 146', null, INK, 20); path('M298 146 Q348 122 396 150', null, INK, 20);
    path('M140 322 Q256 352 372 322 Q344 460 256 460 Q168 460 140 322 Z', '#3a0712', INK, 14); fang(180, 334, 52); fang(332, 334, 52); ell(256, 436, 56, 24, '#ef6a7c');
  }
}
const MONSTER_SKIN = ['#7b3fd1', '#2f9e57', '#d13f3f', '#2f6fd1', '#e0741f'];
export const monsterFaceFor = (e) => ['sad', 'sob', 'cry', 'worried', 'scared', 'nervous', 'confused', 'thinking'].includes(e) ? 'm_sad' : ['happy', 'laugh', 'starstruck', 'surprised'].includes(e) ? 'm_happy' : 'm_rage';

// ------------------------------------------------ clothes ------------------------------------------------
function torsoTex(o, front) {
  return tex(256, 256, (g) => {
    g.fillStyle = o.shirt; g.fillRect(0, 0, 256, 256);
    const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, 'rgba(255,255,255,.10)'); gr.addColorStop(1, 'rgba(0,0,0,.22)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 1400; i++) { g.fillStyle = `rgba(${i % 2 ? 255 : 0},${i % 2 ? 255 : 0},${i % 2 ? 255 : 0},.045)`; g.fillRect((i * 97) % 256, (i * 57) % 256, 2, 2); }
    const P = (d, f, s, w = 4) => { const p = new Path2D(d); if (f) { g.fillStyle = f; g.fill(p); } if (s) { g.strokeStyle = s; g.lineWidth = w; g.stroke(p); } };
    const dk = 'rgba(0,0,0,.35)';
    if (front && o.kind === 'suit') {
      P('M80 0 L128 150 L176 0 Z', '#f4f4f6'); P('M116 14 L140 14 L134 34 L146 130 L128 158 L110 130 L122 34 Z', o.accent, dk, 3);
      P('M80 0 L52 66 L82 74 L62 96 L128 168 L100 70 Z', shade(o.shirt, 1.35), dk); P('M176 0 L204 66 L174 74 L194 96 L128 168 L156 70 Z', shade(o.shirt, 1.35), dk);
      for (const y of [188, 220]) { P(`M128 ${y - 8} a8 8 0 1 0 .1 0`, '#e7c25a', dk, 2); }
      P('M30 190 L90 190 M166 190 L226 190', null, dk, 5); P('M186 78 l30 0 l-6 -16 l-10 10 l-8 -14 Z', '#ffffff');
    } else if (front && o.kind === 'hoodie') {
      P('M66 0 Q128 76 190 0 Z', shade(o.shirt, 0.62)); P('M86 0 Q128 52 170 0 Z', o.skin);
      P('M104 40 L98 132 M152 40 L158 132', null, '#f2f2f2', 7); P('M96 132 h6 v18 h-6 Z M155 132 h6 v18 h-6 Z', '#f2f2f2');
      P('M60 166 L196 166 L218 232 L38 232 Z', shade(o.shirt, 0.86), dk); P('M0 236 L256 236', null, dk, 8);
      P('M150 84 l20 0 l-12 22 l16 0 l-34 34 l9 -26 l-13 0 Z', o.accent);
    } else if (front && o.kind === 'sweater') {
      P('M84 0 L128 70 L172 0 Z', '#f6f6f2'); P('M84 0 L128 52 L104 66 Z M172 0 L128 52 L152 66 Z', '#ffffff', dk, 3);
      P('M112 46 L128 58 L144 46 L142 76 L128 66 L114 76 Z', o.accent, dk, 3);
      for (const y of [120, 150, 180]) { g.fillStyle = o.accent; g.fillRect(0, y, 256, 10); g.fillStyle = 'rgba(255,255,255,.75)'; g.fillRect(0, y + 14, 256, 5); }
      P('M0 232 L256 232', null, dk, 10);
    } else if (front && o.kind === 'police') {
      P('M92 0 L128 56 L164 0 Z', '#dfe6f2'); P('M118 22 L138 22 L134 40 L142 150 L128 168 L114 150 L122 40 Z', '#14182a');
      P('M178 62 l30 8 l-4 34 l-26 20 l-24 -22 l-2 -32 Z', '#ffd23f', dk, 4); P('M30 78 L92 78', null, '#c9d2e6', 8);
      for (const y of [186, 214]) P(`M128 ${y - 7} a7 7 0 1 0 .1 0`, '#ffd23f', dk, 2);
      g.fillStyle = '#14182a'; g.fillRect(0, 232, 256, 24); P('M106 232 h44 v22 h-44 Z', '#ffd23f', dk, 3);
    } else if (front) { P('M88 0 Q128 44 168 0', o.skin, dk); P('M0 226 L256 226', null, dk, 8); }
    else if (o.kind === 'hoodie') P('M54 0 Q128 120 202 0 Z', shade(o.shirt, 0.8), dk);
  });
}
const limbTex = (base, tipColor, tipFrac, cuff) => tex(64, 256, (g) => {
  g.fillStyle = base; g.fillRect(0, 0, 64, 256);
  const gr = g.createLinearGradient(0, 0, 64, 0); gr.addColorStop(0, 'rgba(0,0,0,.18)'); gr.addColorStop(0.5, 'rgba(255,255,255,.07)'); gr.addColorStop(1, 'rgba(0,0,0,.18)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 256);
  const y = 256 * (1 - tipFrac); g.fillStyle = tipColor; g.fillRect(0, y, 64, 256 - y); if (cuff) { g.fillStyle = cuff; g.fillRect(0, y - 12, 64, 12); }
});

// ------------------------------------------------ hair ------------------------------------------------
function lock(parent, m, pts, r0, r1 = 0.02) {          // a tapered strand along a curve
  const curve = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p)));
  const S = 20, RS = 8, g = new THREE.TubeGeometry(curve, S, 1, RS, false), pos = g.attributes.position;
  for (let i = 0; i <= S; i++) {
    const c = curve.getPointAt(i / S), r = THREE.MathUtils.lerp(r0, r1, Math.pow(i / S, 1.6));
    for (let j = 0; j <= RS; j++) { const k = i * (RS + 1) + j; const v = new THREE.Vector3().fromBufferAttribute(pos, k).sub(c).multiplyScalar(r).add(c); pos.setXYZ(k, v.x, v.y, v.z); }
  }
  g.computeVertexNormals(); mesh(g, m, parent);
  mesh(new THREE.SphereGeometry(r0, 10, 8), m, parent, ...pts[0]);
}
const cap = (parent, m, sx = 1, sy = 1, sz = 1, y = 0.2, theta = 0.46) => { const c = mesh(new THREE.SphereGeometry(0.76, 32, 20, 0, Math.PI * 2, 0, Math.PI * theta), m, parent, 0, y, -0.03); c.scale.set(sx, sy, sz); return c; };
const HAIR = {
  swoop(head, m) {            // side-swept boy hair with volume
    cap(head, m, 1.02, 0.98, 1.04, 0.24, 0.44); cap(head, m, 1.0, 1.0, 0.8, 0.12, 0.34).position.z = -0.24;
    for (let i = 0; i < 9; i++) { const x = -0.56 + i * 0.135; lock(head, m, [[x * 0.6 - 0.1, 0.86, -0.2], [x + 0.05, 0.98 - Math.abs(x) * 0.18, 0.26], [x + 0.28, 0.66 - Math.abs(x) * 0.1, 0.68]], 0.19); }
    for (const s of [-1, 1]) for (let i = 0; i < 4; i++) lock(head, m, [[0.62 * s, 0.55, 0.2 - i * 0.26], [0.74 * s, 0.22, 0.12 - i * 0.26], [0.66 * s, -0.1, 0.08 - i * 0.24]], 0.17);
    for (let i = 0; i < 7; i++) { const x = -0.54 + i * 0.18; lock(head, m, [[x, 0.62, -0.5], [x * 1.1, 0.14, -0.74], [x, -0.34, -0.6]], 0.2); }
  },
  long(head, m) {             // long wavy girl hair with parted bangs
    cap(head, m, 1.05, 1.0, 1.08, 0.22, 0.46);
    for (const s of [-1, 1]) {
      for (let i = 0; i < 3; i++) lock(head, m, [[0.08 * s, 0.94, 0.1 - i * 0.16], [(0.4 + i * 0.1) * s, 0.78, 0.6 - i * 0.14], [(0.66 + i * 0.05) * s, 0.34, 0.5 - i * 0.2], [(0.72) * s, -0.12, 0.38 - i * 0.2]], 0.19, 0.07);
      for (let i = 0; i < 4; i++) lock(head, m, [[0.55 * s, 0.6, -0.1 - i * 0.18], [0.82 * s, 0.0, -0.12 - i * 0.17], [0.68 * s, -0.7, 0.05 - i * 0.2], [0.9 * s, -1.45, -0.02 - i * 0.17]], 0.23, 0.04);
    }
    for (let i = 0; i < 9; i++) { const x = -0.64 + i * 0.16; lock(head, m, [[x * 0.7, 0.86, -0.4], [x, 0.2, -0.82], [x * 1.12, -0.8, -0.72], [x * 0.95, -1.75 + Math.abs(x) * 0.2, -0.6]], 0.24, 0.05); }
  },
  slick(head, m) {            // mayor: slicked back with a tall front wave
    cap(head, m, 1.03, 0.92, 1.05, 0.26, 0.43);
    for (let i = 0; i < 8; i++) { const x = -0.54 + i * 0.155; lock(head, m, [[x, 0.66, 0.56], [x * 1.05, 1.08 - Math.abs(x) * 0.28, 0.4], [x, 0.96 - Math.abs(x) * 0.24, -0.2], [x * 0.9, 0.52, -0.66]], 0.17, 0.08); }
    for (const s of [-1, 1]) lock(head, m, [[0.64 * s, 0.56, 0.3], [0.74 * s, 0.2, 0.18], [0.7 * s, -0.12, 0.2]], 0.15, 0.05);
  },
  short(head, m) {            // neat short crop with a textured front
    cap(head, m, 1.02, 0.96, 1.05, 0.22, 0.44); cap(head, m, 1.0, 1.0, 0.82, 0.1, 0.36).position.z = -0.22;
    for (let i = 0; i < 8; i++) { const x = -0.5 + i * 0.143; lock(head, m, [[x * 0.8, 0.9, 0.0], [x, 0.82, 0.48], [x * 1.1, 0.64, 0.66]], 0.13); }
    for (const s of [-1, 1]) lock(head, m, [[0.62 * s, 0.5, 0.18], [0.72 * s, 0.12, 0.0], [0.66 * s, -0.18, -0.12]], 0.16);
    for (let i = 0; i < 5; i++) { const x = -0.44 + i * 0.22; lock(head, m, [[x, 0.6, -0.52], [x * 1.1, 0.12, -0.7], [x, -0.18, -0.62]], 0.2); }
  },
  bob(head, m) {              // chin-length bob with side-swept fringe
    cap(head, m, 1.06, 1.0, 1.08, 0.22, 0.46);
    for (let i = 0; i < 6; i++) { const x = -0.5 + i * 0.2; lock(head, m, [[-0.2, 0.92, 0.1], [x, 0.84, 0.54], [x + 0.2, 0.5, 0.68]], 0.17, 0.05); }
    for (const s of [-1, 1]) for (let i = 0; i < 4; i++) lock(head, m, [[0.55 * s, 0.66, 0.28 - i * 0.24], [0.82 * s, 0.1, 0.3 - i * 0.24], [0.74 * s, -0.56, 0.22 - i * 0.22], [0.54 * s, -0.7, 0.3 - i * 0.22]], 0.23, 0.12);
    for (let i = 0; i < 7; i++) { const x = -0.54 + i * 0.18; lock(head, m, [[x * 0.8, 0.8, -0.46], [x * 1.1, 0.1, -0.82], [x, -0.68, -0.6]], 0.25, 0.14); }
  },
  pony(head, m) {             // high ponytail
    HAIR.short(head, m);
    for (let i = 0; i < 6; i++) { const x = -0.3 + i * 0.12; lock(head, m, [[x * 0.4, 0.8, -0.62], [x, 1.02, -1.0], [x * 1.4, 0.2, -1.25], [x * 1.2, -0.7, -1.02]], 0.2, 0.04); }
    mesh(new THREE.TorusGeometry(0.2, 0.08, 10, 20), mat('#ff5f8a'), head, 0, 0.82, -0.68).rotation.x = 0.7;
  },
  bun(head, m) {              // grandma bun with soft sides
    cap(head, m, 1.04, 0.96, 1.06, 0.22, 0.46);
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) lock(head, m, [[0.06 * s, 0.94, 0.3 - i * 0.2], [(0.5) * s, 0.74, 0.52 - i * 0.2], [0.72 * s, 0.2, 0.2 - i * 0.24], [0.62 * s, -0.2, -0.1 - i * 0.2]], 0.17, 0.08);
    mesh(new THREE.SphereGeometry(0.42, 22, 16), m, head, 0, 0.82, -0.62);
  },
  bald(head, m) {             // grandpa: side tufts only
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) lock(head, m, [[0.6 * s, 0.3, 0.1 - i * 0.28], [0.74 * s, 0.06, -0.08 - i * 0.24], [0.62 * s, -0.22, -0.2 - i * 0.2]], 0.15, 0.06);
    for (let i = 0; i < 5; i++) { const x = -0.4 + i * 0.2; lock(head, m, [[x, 0.3, -0.64], [x * 1.1, 0.0, -0.72], [x, -0.26, -0.6]], 0.16, 0.08); }
  },
  puffs(head, m) {            // round curls
    for (let i = 0; i < 46; i++) { const a = i * 2.39996, v = (i + 0.5) / 46, ph = Math.acos(1 - v * 1.1); const x = Math.sin(ph) * Math.cos(a) * 0.74, z = Math.sin(ph) * Math.sin(a) * 0.74, y = 0.24 + Math.cos(ph) * 0.7; if (z > 0.45 && y < 0.6) continue; mesh(new THREE.SphereGeometry(0.22, 14, 10), m, head, x, y, z - 0.03); }
  },
};

// ------------------------------------------------ body + poses ------------------------------------------------
function headGeo() {
  const R = 0.68, H = 1.28, rr = 0.3, pts = [new THREE.Vector2(0, -H / 2)];
  for (let i = 0; i <= 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 20; pts.push(new THREE.Vector2(R - rr + Math.cos(a) * rr, -H / 2 + rr + Math.sin(a) * rr)); }
  for (let i = 0; i <= 10; i++) { const a = i * Math.PI / 20; pts.push(new THREE.Vector2(R - rr + Math.cos(a) * rr, H / 2 - rr + Math.sin(a) * rr)); }
  pts.push(new THREE.Vector2(0, H / 2)); return new THREE.LatheGeometry(pts, 48);
}
export function makeChar(look, monster = false, name = '') {
  // a monster keeps the character's clothes and hair (so the viewer knows who it is) with new skin, horns, claws and a tail
  const tint = MONSTER_SKIN[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % MONSTER_SKIN.length];
  const o = monster ? { ...look, skin: tint, scale: (look.scale || 1) * 1.24, glasses: false } : look;
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const side = mat('#ffffff', { map: torsoTex(o, false), roughness: 0.82 }), front = mat('#ffffff', { map: torsoTex(o, true), roughness: 0.82 });
  const torso = new THREE.Group(); torso.position.y = 3.0; body.add(torso);
  mesh(rbox(1.96, 1.98, 1.0, 0.1), mat(shade(o.shirt, 0.92), { roughness: 0.82 }), torso);
  mesh(new THREE.PlaneGeometry(1.86, 1.9), front, torso, 0, 0, 0.503);
  const bk = mesh(new THREE.PlaneGeometry(1.86, 1.9), side, torso, 0, 0, -0.503); bk.rotation.y = Math.PI;
  const neck = new THREE.Group(); neck.position.y = 0.98; torso.add(neck);
  const head = new THREE.Group(); head.position.y = 0.68; neck.add(head);
  const skin = mat(o.skin, { roughness: 0.62 });
  mesh(headGeo(), skin, head);
  const faceMat = new THREE.MeshStandardMaterial({ transparent: true, roughness: 0.62, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3 });
  const face = mesh(new THREE.CylinderGeometry(0.686, 0.686, 1.2, 48, 1, true, -1.08, 2.16), faceMat, head, 0, -0.02, 0); face.castShadow = false; face.renderOrder = 3;
  HAIR[o.hair](head, mat(o.hairColor, { roughness: 0.48 }));
  if (o.glasses) { const gm = mat('#222831', { roughness: 0.3, metalness: 0.4 }); for (const s of [-1, 1]) mesh(new THREE.TorusGeometry(0.19, 0.028, 10, 28), gm, head, 0.23 * s, 0.07, 0.73); mesh(new THREE.BoxGeometry(0.1, 0.035, 0.035), gm, head, 0, 0.09, 0.735); }
  if (o.beanie) { const bm = mat(o.beanie, { roughness: 0.95 }); cap(head, bm, 1.12, 1.12, 1.14, 0.3, 0.4); mesh(new THREE.TorusGeometry(0.72, 0.12, 10, 36), bm, head, 0, 0.6, -0.04).rotation.x = Math.PI / 2; mesh(new THREE.SphereGeometry(0.2, 14, 10), bm, head, 0, 1.2, -0.04); }
  if (o.cap) { const cm = mat(o.cap, { roughness: 0.6 }); mesh(new THREE.CylinderGeometry(0.74, 0.78, 0.42, 32), cm, head, 0, 0.86, -0.02); mesh(new THREE.CylinderGeometry(0.86, 0.74, 0.16, 32), cm, head, 0, 1.1, -0.02); const v = mesh(new THREE.CylinderGeometry(0.66, 0.66, 0.08, 32, 1, false, -1.2, 2.4), mat('#0f1118'), head, 0, 0.68, 0.24); v.rotation.x = 0.14; mesh(new THREE.SphereGeometry(0.11, 12, 10), mat('#ffd23f', { metalness: 0.6, roughness: 0.3 }), head, 0, 0.9, 0.74); }
  if (o.sash) { const sm = mat(o.sash, { roughness: 0.5 }); const band = mesh(new THREE.BoxGeometry(0.34, 2.5, 0.06), sm, torso, 0, 0, 0.54); band.rotation.z = -0.72; mesh(new THREE.SphereGeometry(0.2, 14, 10), mat('#ffd23f', { metalness: 0.7, roughness: 0.3 }), torso, -0.45, -0.4, 0.58); }
  if (o.scale) root.scale.setScalar(o.scale);
  const arm = (s) => { const p = new THREE.Group(); p.position.set(1.47 * s, 0.78, 0); torso.add(p); const m = mat('#ffffff', { map: limbTex(o.shirt, o.skin, 0.24, shade(o.shirt, 0.65)), roughness: 0.78 }); mesh(rbox(0.94, 1.98, 0.96, 0.11), m, p, 0, -0.78, 0); return p; };
  const leg = (s) => { const p = new THREE.Group(); p.position.set(0.49 * s, 2.0, 0); body.add(p); const m = mat('#ffffff', { map: limbTex(o.pants, o.shoes, 0.19, '#f1f1f1'), roughness: 0.8 }); mesh(rbox(0.95, 2.0, 0.98, 0.09), m, p, 0, -1.0, 0); return p; };
  const J = { root, body, torso, neck, head, aL: arm(1), aR: arm(-1), lL: leg(1), lR: leg(-1), monster };
  if (monster) {
    const bone = mat('#f4e7c6', { roughness: 0.45 }), skinM = mat(tint, { roughness: 0.6 });
    for (const s of [-1, 1]) {
      lock(head, bone, [[0.42 * s, 0.7, 0.18], [0.86 * s, 1.1, 0.16], [0.98 * s, 1.6, 0.06], [0.74 * s, 1.92, -0.02]], 0.23, 0.025);   // curled horns
      mesh(new THREE.ConeGeometry(0.2, 0.75, 14), skinM, head, 0.84 * s, 0.08, 0).rotation.z = -1.25 * s;                          // pointed ears
      for (const A of [s > 0 ? J.aL : J.aR]) for (let i = -1; i <= 1; i++) { const c = mesh(new THREE.ConeGeometry(0.12, 0.44, 10), bone, A, i * 0.28, -1.92, 0.2); c.rotation.x = Math.PI - 0.35; }
    }
    for (let i = 0; i < 4; i++) { const sp = mesh(new THREE.ConeGeometry(0.2, 0.62, 10), bone, torso, 0, 0.7 - i * 0.44, -0.74); sp.rotation.x = -Math.PI / 2 - 0.2; }
    lock(body, skinM, [[0, 2.1, -0.5], [0.5, 1.2, -1.6], [1.7, 0.7, -1.9], [2.6, 1.4, -1.5]], 0.34, 0.06);                              // tail
  }
  const cache = new Map();
  J.setFace = (e, talk = 0, blink = false) => {
    if (monster) e = monsterFaceFor(e);
    const k = `${e}|${Math.round(talk * 3)}|${blink ? 1 : 0}`;
    if (!cache.has(k)) cache.set(k, tex(512, 512, (g) => drawFace(g, e, Math.round(talk * 3) / 3, blink)));
    faceMat.map = cache.get(k); faceMat.needsUpdate = true;
  };
  J.setFace('neutral');
  return J;
}

// Poses. t = seconds. Arm rotation x < 0 raises the arm forward; z raises it to the side (+ for the +x arm).
export function pose(J, name, t, ph = 0) {
  const s = Math.sin, a = t + ph;
  const P = { by: s(a * 2.4) * 0.025, tx: 0, ty: s(a * 1.1) * 0.04, tz: 0, nx: s(a * 2.2) * 0.03, ny: 0, nz: s(a * 1.3) * 0.03, aL: [s(a * 1.9) * 0.05, 0, 0.07], aR: [-s(a * 1.9) * 0.05, 0, -0.07], lL: [0, 0, 0], lR: [0, 0, 0] };
  if (name === 'walk') { const w = s(a * 7); Object.assign(P, { by: Math.abs(Math.cos(a * 7)) * 0.14, tx: 0.05, ty: w * 0.08, aL: [-w * 0.75, 0, 0.08], aR: [w * 0.75, 0, -0.08], lL: [w * 0.65, 0, 0], lR: [-w * 0.65, 0, 0] }); }
  if (name === 'sadwalk') { const w = s(a * 4.2); Object.assign(P, { by: Math.abs(Math.cos(a * 4.2)) * 0.06, tx: 0.14, nx: 0.26, aL: [-w * 0.28, 0, 0.04], aR: [w * 0.28, 0, -0.04], lL: [w * 0.4, 0, 0], lR: [-w * 0.4, 0, 0] }); }
  if (name === 'talk') { const g1 = s(a * 7.5), g2 = Math.cos(a * 5.1); Object.assign(P, { ny: s(a * 2.7) * 0.14, nx: s(a * 6) * 0.07, aL: [-0.65 + g1 * 0.4, 0, 0.24 + Math.abs(g1) * 0.18], aR: [-0.55 + g2 * 0.4, 0, -0.24 - Math.abs(g2) * 0.18] }); }
  if (name === 'rant') { const p = Math.abs(s(a * 9)); Object.assign(P, { tx: 0.16, nx: -0.06 + p * 0.1, by: p * 0.1, aR: [-1.5 - p * 0.22, -0.1, -0.12], aL: [0.35, 0, 0.55 + p * 0.2], lL: [-0.1, 0, 0.05], lR: [0.1, 0, -0.05] }); }
  if (name === 'point') { Object.assign(P, { tx: -0.05, nx: -0.22, aR: [-2.2 + s(a * 14) * 0.05, 0, -0.18], aL: [-0.25, 0, 0.3] }); }
  if (name === 'shock') { const k = s(a * 34) * 0.03; Object.assign(P, { tx: -0.17, nx: -0.14, by: 0.08 + k, aL: [-0.5, 0, 2.25 + k], aR: [-0.5, 0, -2.25 - k], lL: [0, 0, 0.12], lR: [0, 0, -0.12] }); }
  if (name === 'cower') { const k = s(a * 30) * 0.05; Object.assign(P, { by: -0.12, tx: 0.1, tz: k, nx: -0.12, aL: [-2.5, 0, -0.18 + k], aR: [-2.5, 0, 0.18 - k] }); }
  if (name === 'cheer') { const p = Math.abs(s(a * 8)); Object.assign(P, { by: p * 0.45, aL: [-0.15, 0, 2.5 + s(a * 16) * 0.12], aR: [-0.15, 0, -2.5 - s(a * 16) * 0.12] }); }
  if (name === 'stiffwave') { Object.assign(P, { aR: [-0.1, 0, -2.5 + s(a * 11) * 0.25] }); }
  if (name === 'still') Object.assign(P, { by: 0, ty: 0, ny: 0, nz: 0 });
  if (name === 'run') { const w = s(a * 11); Object.assign(P, { by: Math.abs(Math.cos(a * 11)) * 0.26, tx: 0.24, nx: -0.2, aL: [-w * 1.15 - 0.15, 0, 0.1], aR: [w * 1.15 - 0.15, 0, -0.1], lL: [w * 1.05, 0, 0], lR: [-w * 1.05, 0, 0] }); }
  if (name === 'jump') { const p = Math.abs(s(a * 4.2)); Object.assign(P, { by: p * 1.5, nx: -0.1, aL: [-0.2, 0, 2.3 - p * 0.3], aR: [-0.2, 0, -2.3 + p * 0.3], lL: [-p * 0.5, 0, 0.12], lR: [p * 0.2, 0, -0.12] }); }
  if (name === 'sit') Object.assign(P, { by: -0.55, tx: 0.04, ny: s(a * 1.4) * 0.1, aL: [-0.55, 0, 0.1], aR: [-0.55 + s(a * 2) * 0.05, 0, -0.1], lL: [-1.52, 0, 0.1], lR: [-1.52, 0, -0.1] });
  if (name === 'think') Object.assign(P, { nx: -0.14, ny: 0.2, nz: 0.12, aR: [-2.0, 0, 0.32 + s(a * 2) * 0.03], aL: [-0.7, 0, -0.35] });
  if (name === 'wave') Object.assign(P, { nz: 0.1, aR: [-0.12, 0, -2.45 + s(a * 10) * 0.32] });
  if (name === 'cry') { const k = s(a * 19) * 0.03; Object.assign(P, { by: k, tx: 0.16, nx: 0.16 + k, aL: [-1.7 + k, 0, -0.38], aR: [-1.7 - k, 0, 0.38] }); }
  if (name === 'shiver') { const k = s(a * 38) * 0.05; Object.assign(P, { tx: 0.1, ty: k, nz: k, aL: [-1.25 + k, 0, -0.52], aR: [-1.25 - k, 0, 0.52] }); }
  if (name === 'hug') Object.assign(P, { tx: 0.1, nz: 0.1, aL: [-1.55 + s(a * 2) * 0.04, 0, -0.2], aR: [-1.55 - s(a * 2) * 0.04, 0, 0.2] });
  if (name === 'agree') Object.assign(P, { nx: Math.abs(s(a * 6)) * 0.28, aL: [-0.2, 0, 0.15], aR: [-1.1, 0, -0.1] });
  if (name === 'disagree') Object.assign(P, { ny: s(a * 8) * 0.45, aL: [-0.9, 0, 0.55], aR: [-0.9, 0, -0.55] });
  if (name === 'pickup') { const k = Math.max(0, Math.sin((a % 2.2) / 2.2 * Math.PI)); Object.assign(P, { by: -k * 0.45, tx: 0.2 + k * 0.7, nx: -k * 0.35, aL: [-0.5 - k * 0.7, 0, 0.1], aR: [-0.5 - k * 0.9, 0, -0.1] }); }
  if (name === 'dance') { const w = s(a * 8); Object.assign(P, { by: Math.abs(w) * 0.3, ty: w * 0.35, tz: w * 0.12, aL: [-0.2, 0, 1.5 + w * 1.0], aR: [-0.2, 0, -1.5 + w * 1.0], lL: [w * 0.3, 0, 0.1], lR: [-w * 0.3, 0, -0.1] }); }
  if (name === 'hurt') { const k = s(a * 12) * 0.03; Object.assign(P, { by: -0.2, tx: 0.42, tz: 0.12 + k, nx: 0.2, aL: [-0.9, 0, -0.45], aR: [-0.2, 0, -0.5] }); }
  J.body.position.y = P.by; J.torso.rotation.set(P.tx, P.ty, P.tz); J.neck.rotation.set(P.nx, P.ny, P.nz);
  J.aL.rotation.set(...P.aL); J.aR.rotation.set(...P.aR); J.lL.rotation.set(...P.lL); J.lR.rotation.set(...P.lR);
}
