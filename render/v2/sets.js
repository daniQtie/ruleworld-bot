// Style v2 locations. Stage is around the origin; the camera stands on +z and looks toward -z.
import * as THREE from 'three';
import { tex, mat, mesh, rbox } from './cast.js';

export const noise = (base, rep, kind) => tex(256, 256, (g) => {
  g.fillStyle = base; g.fillRect(0, 0, 256, 256);
  let seed = 3; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 4200; i++) { g.fillStyle = rnd() > 0.5 ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.08)'; const s = 1 + rnd() * 4; g.fillRect(rnd() * 256, rnd() * 256, s, kind === 'grass' ? s * 2.4 : s); }
  g.strokeStyle = 'rgba(0,0,0,.2)'; g.lineWidth = 3;
  const hl = (y) => { g.beginPath(); g.moveTo(0, y); g.lineTo(256, y); g.stroke(); };
  if (kind === 'brick') for (let y = 0; y < 256; y += 32) { hl(y); for (let x = (y / 32) % 2 ? 0 : 32; x < 256; x += 64) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 32); g.stroke(); } }
  if (kind === 'tile') for (let i = 0; i <= 256; i += 128) { hl(i); g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 256); g.stroke(); }
  if (kind === 'wood') for (let y = 0; y < 256; y += 42) { hl(y); g.beginPath(); g.moveTo((y * 5) % 256, y); g.lineTo((y * 5) % 256, y + 42); g.stroke(); }
  if (kind === 'checker') { g.fillStyle = 'rgba(0,0,0,.13)'; g.fillRect(0, 0, 128, 128); g.fillRect(128, 128, 128, 128); }
}, rep);

export const label = (text, w, h, bg, fg, parent, x, y, z, ry = 0) => {
  const t = tex(512, Math.max(64, Math.round(512 * h / w)), (g, cw, ch) => {
    g.fillStyle = bg; g.fillRect(0, 0, cw, ch); g.strokeStyle = fg; g.lineWidth = 12; g.strokeRect(10, 10, cw - 20, ch - 20);
    g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
    const ls = String(text).toUpperCase().split('|').slice(0, 3); g.font = `900 ${Math.min(ch / (ls.length + 0.7), 96)}px Arial`;
    ls.forEach((l, i) => g.fillText(l, cw / 2, ch * (i + 1) / (ls.length + 1), cw - 56));
  });
  const side = mat('#e8e2d2'), face = new THREE.MeshStandardMaterial({ map: t, roughness: 0.7 });
  const o = mesh(rbox(w, h, 0.22, 0.01), [side, side, side, side, face, side], parent, x, y, z); o.rotation.y = ry; return o;
};

export function buildSet(name, board) {
  const G = new THREE.Group();
  const box = (w, h, d, m, x, y, z, r = 0.1, p = G) => mesh(rbox(w, h, d, Math.min(r, w / 2.2, h / 2.2, d / 2.2)), m, p, x, y, z);
  const nm = (c, rep, kind) => mat('#ffffff', { map: noise(c, rep, kind) });
  const ground = (c, kind, rep = [40, 40]) => box(240, 1, 240, nm(c, rep, kind), 0, -0.62, 0, 0.01);
  const glass = mat('#9fd8ff', { roughness: 0.15, metalness: 0.3, emissive: '#123a55' }), trim = mat('#f6f1e6');
  const house = (x, z, w, h, color, roof, kind = 'brick') => {
    box(w, h, 6, nm(color, [w / 4, h / 4], kind), x, h / 2, z); box(w + 0.8, 0.6, 6.8, mat(roof), x, h + 0.25, z);
    for (let wy = 4.6; wy < h - 1; wy += 3.4) for (let wx = -w / 2 + 1.8; wx <= w / 2 - 1.6; wx += 2.8) { box(1.75, 2.0, 0.2, trim, x + wx, wy, z + 3.02); box(1.45, 1.7, 0.24, glass, x + wx, wy, z + 3.05); box(1.5, 0.12, 0.28, trim, x + wx, wy, z + 3.08); }
    box(2.2, 3.2, 0.3, mat('#6b3f23'), x, 1.6, z + 3.05); box(w * 0.7, 0.35, 1.5, mat(roof), x, 3.6, z + 3.5);
  };
  const tree = (x, z, s = 1, leaf = '#3f9a3a') => { mesh(new THREE.CylinderGeometry(0.35 * s, 0.5 * s, 3.4 * s, 10), nm('#7a5230', [1, 2], 'bark'), G, x, 1.7 * s, z); const lm = nm(leaf, [2, 2], 'grass'); for (const [dx, dy, dz, r] of [[0, 4.4, 0, 1.9], [1.1, 3.7, 0.3, 1.25], [-1.15, 3.8, -0.2, 1.3], [0.1, 5.5, 0.1, 1.2]]) mesh(new THREE.IcosahedronGeometry(r * s, 2), lm, G, x + dx * s, dy * s, z + dz * s); };
  const pine = (x, z, s = 1) => { mesh(new THREE.CylinderGeometry(0.3 * s, 0.45 * s, 2.4 * s, 8), nm('#5d3d24', [1, 2], 'bark'), G, x, 1.2 * s, z); const lm = nm('#245c3a', [3, 2], 'grass'); for (let i = 0; i < 3; i++) mesh(new THREE.ConeGeometry((2.4 - i * 0.55) * s, 3.2 * s, 12), lm, G, x, (3.2 + i * 1.7) * s, z); };
  const lamp = (x, z) => { mesh(new THREE.CylinderGeometry(0.12, 0.18, 7, 10), mat('#2c3038', { metalness: 0.6, roughness: 0.4 }), G, x, 3.5, z); mesh(new THREE.SphereGeometry(0.45, 16, 12), mat('#fff2bd', { emissive: '#ffd76a', emissiveIntensity: 0.8 }), G, x, 7.2, z); };
  const fence = (z, from, to, color = '#f4f0e6') => { for (let x = from; x <= to; x += 1.3) box(0.28, 1.9, 0.2, mat(color), x, 0.95, z, 0.06); box(to - from, 0.22, 0.12, mat(color), (from + to) / 2, 1.35, z - 0.12, 0.04); };
  const road = (z) => { box(80, 0.2, 9, nm('#3d3f46', [18, 2], 'asphalt'), 0, -0.1, z); for (let x = -36; x <= 36; x += 4.5) box(2.4, 0.05, 0.32, mat('#f7d84a'), x, 0.03, z, 0.02); };
  const flowers = (x, z) => { for (let i = 0; i < 9; i++) mesh(new THREE.SphereGeometry(0.2, 10, 8), mat(['#ff5f8a', '#ffd23f', '#ffffff', '#9b7bff'][i % 4]), G, x + (i % 3) * 0.55, 0.22, z + Math.floor(i / 3) * 0.5); };
  const room = (wall, floor, kind, w = 24) => {
    box(w + 20, 0.6, 40, nm(floor, [10, 10], kind), 0, -0.32, 6, 0.01);
    box(w, 30, 0.6, nm(wall, [5, 5], 'stucco'), 0, 15, -8.2, 0.02);
    for (const s of [-1, 1]) box(0.6, 30, 30, nm(wall, [6, 5], 'stucco'), s * w / 2, 15, 6.5, 0.02);
    box(w, 0.5, 0.25, trim, 0, 0.25, -7.8, 0.02); box(w, 0.2, 0.2, trim, 0, 12.6, -7.8, 0.02);
  };
  const windowW = (x, y, w = 5, h = 4.6, z = -7.8) => { box(w + 0.5, h + 0.5, 0.2, trim, x, y, z); box(w, h, 0.24, mat('#bfe6ff', { emissive: '#6fb8f0', emissiveIntensity: 0.55 }), x, y, z + 0.04); box(0.16, h, 0.28, trim, x, y, z + 0.08); box(w, 0.16, 0.28, trim, x, y, z + 0.08); };
  const desk = (x, z, top = '#c98f52') => { box(2.6, 0.22, 1.7, nm(top, [1, 1], 'wood'), x, 2.05, z); for (const dx of [-1.1, 1.1]) for (const dz of [-0.65, 0.65]) box(0.18, 2.0, 0.18, mat('#4b4f58'), x + dx, 1.0, z + dz, 0.03); };
  const shelf = (x, z, ry = 0) => { const S = new THREE.Group(); S.position.set(x, 0, z); S.rotation.y = ry; G.add(S); box(5, 9.5, 1.1, nm('#7a4f2c', [2, 3], 'wood'), 0, 4.75, 0, 0.08, S); for (let r = 0; r < 4; r++) { let bx = -2.1; let i = r * 7; while (bx < 2.0) { const bw = 0.24 + ((i * 7) % 5) * 0.06, bh = 1.25 + ((i * 3) % 4) * 0.14; box(bw, bh, 0.5, mat(['#c0392b', '#2f6fd1', '#e5a823', '#2e8b57', '#7d3c98', '#eceff1'][(i * 5) % 6]), bx + bw / 2, 0.75 + r * 2.15 + bh / 2, 0.45, 0.04, S); bx += bw + 0.06; i++; } box(4.7, 0.16, 0.8, mat('#5a3a1f'), 0, 0.66 + r * 2.15, 0.35, 0.03, S); } };
  const sofa = (x, z, color) => { const m = mat(color, { roughness: 0.95 }); box(8, 1.5, 2.6, m, x, 1.1, z, 0.4); box(8, 2.6, 0.8, m, x, 2.5, z - 1.1, 0.35); for (const s of [-1, 1]) box(0.9, 2.3, 2.7, m, x + s * 4.2, 1.5, z, 0.35); };
  const bed = (x, z) => { box(5.4, 1.1, 7, nm('#8a5a32', [1, 2], 'wood'), x, 0.9, z); box(5.1, 0.7, 6.6, mat('#f3f1ee'), x, 1.7, z, 0.3); box(5.2, 0.5, 4.2, mat('#5b7fd6', { roughness: 0.95 }), x, 2.15, z + 1.2, 0.2); box(3.6, 0.6, 1.4, mat('#ffffff'), x, 2.25, z - 2.4, 0.28); box(5.4, 3.6, 0.5, nm('#8a5a32', [1, 1], 'wood'), x, 2.2, z - 3.6); };

  switch (name) {
    case 'town': case 'city': {
      ground('#62b34c', 'grass'); box(70, 0.3, 17, nm('#c9c5bd', [16, 4], 'tile'), 0, -0.15, -0.5, 0.02); road(13);
      if (name === 'town') {
        const stone = nm('#e9e1cc', [4, 3], 'stucco');
        box(17, 12, 6, stone, 0, 6, -15); box(19, 1.1, 8.4, mat('#4f77b8'), 0, 12.4, -14.4);
        const gable = mesh(new THREE.CylinderGeometry(4.4, 4.4, 8, 3), mat('#4f77b8'), G, 0, 15, -13.4); gable.rotation.set(Math.PI / 2, Math.PI, 0); gable.scale.set(1.7, 1, 0.62);
        for (const x of [-6.6, -3.3, 3.3, 6.6]) { mesh(new THREE.CylinderGeometry(0.62, 0.72, 11, 20), trim, G, x, 5.9, -11.2); box(1.7, 0.5, 1.7, trim, x, 11.5, -11.2); }
        box(3.8, 6.2, 0.3, mat('#5d3a22'), 0, 4.2, -11.95); for (const x of [-5, 5]) for (const y of [4.4, 8.6]) box(1.8, 2.4, 0.3, glass, x, y, -11.95);
        for (let i = 0; i < 3; i++) box(15 - i * 1.2, 0.34, 2.4 - i * 0.55, stone, 0, 0.17 + i * 0.34, -9.8 - i * 0.35);
        house(-17, -13, 10, 11, '#b5503c', '#5a2c24'); house(17, -13, 10, 12, '#d9a441', '#6a4a1c', 'stucco');
      } else {
        const cols = [['#b5503c', '#5a2c24', 'BAKERY'], ['#4f8f8a', '#24524e', 'TOY SHOP'], ['#d9a441', '#6a4a1c', 'MARKET'], ['#7d6bb5', '#3b2f66', 'CAFE'], ['#c9684a', '#6d2f1d', 'BOOKS']];
        cols.forEach(([c, r, t], i) => { const x = (i - 2) * 11; house(x, -12.5 - (i % 2), 9.8, 10 + ((i * 3) % 4), c, r, i % 2 ? 'stucco' : 'brick'); label(t, 5.6, 1.4, '#fff3c4', '#5a1a10', G, x, 4.7, -8.6 - (i % 2)); });
        flowers(-8.5, -6.8); flowers(7.4, -6.8);
      }
      house(-29, -11, 9, 8.5, '#6c8fc4', '#2f4468', 'stucco'); house(29, -11, 9, 9, '#b5503c', '#5a2c24');
      tree(-11.5, -8.2, 1.1); tree(11.5, -8.2, 1.2); tree(-23, -4); tree(23, -4, 0.9); lamp(-9, 7); lamp(9, 7);
      break;
    }
    case 'street': {
      ground('#6cbb52', 'grass'); box(70, 0.3, 11, nm('#cfcac0', [16, 3], 'tile'), 0, -0.15, 0.5, 0.02); road(11);
      [['#e8d3a8', '#8c3b2e'], ['#a9cbe0', '#2f4468'], ['#e0a9a0', '#5a2c24'], ['#bfd8a8', '#40602c'], ['#ecd27a', '#6a4a1c']].forEach(([c, r], i) => { const x = (i - 2) * 13; house(x, -15, 8.5, 7.6, c, r, 'stucco'); const roof = mesh(new THREE.ConeGeometry(6.6, 3.4, 4), mat(r), G, x, 9.6, -15); roof.rotation.y = Math.PI / 4; });
      fence(-8.6, -34, -3); fence(-8.6, 3, 34); tree(-7, -10.5); tree(7.5, -10.5, 1.1); tree(-19, -9.5, 0.9); tree(20, -9.5); flowers(-5.4, -7.4); flowers(4.2, -7.4); lamp(-10, 6); lamp(10, 6);
      break;
    }
    case 'field': case 'soccer': {
      ground(name === 'soccer' ? '#3f9d3f' : '#6fbd4e', 'grass');
      const brick = nm('#b5503c', [10, 3], 'brick'); box(34, 11, 3, brick, 0, 5.5, -24); box(36, 0.8, 4, mat('#5a2c24'), 0, 11.3, -24);
      for (let x = -14; x <= 14; x += 4.6) for (const y of [4, 8]) { box(2.5, 2.3, 0.2, trim, x, y, -22.45); box(2.2, 2.0, 0.24, glass, x, y, -22.42); }
      for (let x = -40; x <= 40; x += 6.5) if (Math.abs(x) > 18) tree(x, -17 - ((x * 7) % 5), 1.05);
      fence(-12.5, -32, 32, '#d9dde4');
      if (name === 'soccer') { const w = mat('#ffffff'); for (const x of [-5.5, 5.5]) mesh(new THREE.CylinderGeometry(0.22, 0.22, 6, 12), w, G, x, 3, -8.5); const bar = mesh(new THREE.CylinderGeometry(0.22, 0.22, 11.2, 12), w, G, 0, 6, -8.5); bar.rotation.z = Math.PI / 2; for (let x = -5; x <= 5; x += 1) box(0.06, 6, 0.06, w, x, 3, -10, 0.01); for (let y = 0.6; y < 6; y += 1) box(11, 0.06, 0.06, w, 0, y, -10, 0.01); box(60, 0.04, 0.3, w, 0, -0.1, -8.5, 0.01); mesh(new THREE.IcosahedronGeometry(0.62, 2), w, G, 3.2, 0.62, 3.4); }
      else { flowers(-9, -5); flowers(8, -6); box(7, 0.4, 1.4, nm('#b98552', [3, 1], 'wood'), -10, 1.2, -7); box(7, 0.4, 1.4, nm('#b98552', [3, 1], 'wood'), -10, 2.6, -8.4); }
      break;
    }
    case 'forest': {
      ground('#4f8a3a', 'grass'); box(7, 0.2, 60, nm('#a98a5c', [2, 14], 'asphalt'), 0, -0.1, -6, 0.02);
      for (let i = 0; i < 46; i++) { const side = i % 2 ? 1 : -1, x = side * (6.5 + (i * 7.3) % 24), z = -34 + (i * 11.7) % 42; if (z > 4 && Math.abs(x) < 11) continue; pine(x, z, 0.9 + (i % 5) * 0.14); }
      for (let x = -24; x <= 24; x += 5.2) pine(x, -36, 1.4);
      for (const [x, z] of [[-5.2, -4], [5.6, -7], [-6, -12]]) mesh(new THREE.DodecahedronGeometry(1.1, 0), nm('#8a8d92', [1, 1], 'asphalt'), G, x, 0.7, z);
      break;
    }
    case 'classroom': {
      room('#f4e3b8', '#c9a06a', 'wood');
      box(12.6, 5.6, 0.3, mat('#8a5a32'), 0, 7.4, -7.75); label(board || 'CLASS', 12, 5, '#1f5c45', '#f4fff8', G, 0, 7.4, -7.55);
      windowW(-9.2, 7.4, 3.6, 5); windowW(9.2, 7.4, 3.6, 5);
      for (const x of [-7.4, 7.4]) for (const z of [-3.2, 1.0]) desk(x, z);
      desk(-4.6, -5.8, '#8a5a32'); break;
    }
    case 'hallway': {
      room('#eef0ea', '#d9d3c2', 'checker');
      const cols = ['#2f86d9', '#e8503a', '#f2b524', '#2ba36a', '#8a4fc4'];
      for (const s of [-1, 1]) for (let i = 0; i < 11; i++) { const z = -7 + i * 2.1; box(0.7, 7.4, 1.9, mat(cols[(i + (s > 0 ? 2 : 0)) % 5], { roughness: 0.45, metalness: 0.2 }), s * 11.4, 3.9, z, 0.08); box(0.1, 0.8, 0.2, mat('#2b2f36'), s * 11.0, 4.2, z + 0.5, 0.02); }
      box(4.4, 8.4, 0.3, nm('#8a5a32', [1, 2], 'wood'), 0, 4.2, -7.8); box(2.4, 2.2, 0.34, glass, 0, 6.2, -7.75);
      label('SCHOOL HALL', 6, 1.2, '#ffffff', '#1d3f73', G, 0, 10.4, -7.7); windowW(-6.8, 8, 4, 3.6); windowW(6.8, 8, 4, 3.6); break;
    }
    case 'library': {
      room('#d9c6a0', '#8f6134', 'wood');
      shelf(-8.6, -7); shelf(-3.2, -7); shelf(3.2, -7); shelf(8.6, -7); shelf(-11.2, -1.5, Math.PI / 2); shelf(11.2, -1.5, -Math.PI / 2);
      desk(-7, 0.5); desk(7, 0.5); label('QUIET PLEASE', 5, 1.2, '#fff3c4', '#5a2c10', G, 0, 11.2, -7.6); break;
    }
    case 'house': {
      room('#f0c9a8', '#a9713f', 'wood');
      sofa(-4.5, -5.6, '#3f7f8c'); windowW(4.6, 7.2, 6, 5);
      box(7.4, 0.1, 7, mat('#c24d4d', { roughness: 1 }), 0, 0.06, 0.4, 0.03);
      box(3, 2.2, 1.4, nm('#7a4f2c', [1, 1], 'wood'), 8.4, 1.1, -6.6); mesh(new THREE.SphereGeometry(0.9, 18, 12), mat('#ffe9b0', { emissive: '#ffcf6b', emissiveIntensity: 0.9 }), G, 8.4, 3.9, -6.6);
      label('HOME', 3, 2, '#fffaf0', '#7a4f2c', G, -4.5, 7.6, -7.7); break;
    }
    case 'bedroom': {
      room('#b9c4f0', '#9a6b44', 'wood');
      bed(-7.2, -3.6); windowW(3.8, 7.6, 5.4, 4.8); shelf(9.6, -6.8);
      box(6.6, 0.1, 6, mat('#8e6fd0', { roughness: 1 }), 0.6, 0.06, 0.8, 0.03);
      label('★ DREAM ★', 4, 1.4, '#20264f', '#ffe27a', G, -6.6, 8.6, -7.7); break;
    }
    case 'hospital': {
      room('#e6f4f3', '#cfd9dc', 'checker');
      label('HOSPITAL', 6, 1.4, '#ffffff', '#c4202c', G, 0, 10.6, -7.7); windowW(-6.6, 7.4, 4.2, 4.4);
      for (const [w2, h2] of [[0.7, 2.4], [2.4, 0.7]]) box(w2, h2, 0.25, mat('#e5343f', { emissive: '#7a0f18', emissiveIntensity: 0.4 }), 5.8, 8.2, -7.75);
      bed(-8, -3.4); bed(8, -3.4);
      for (const x of [-4.6, 4.6]) { box(0.2, 4.6, 0.2, mat('#9aa4ad', { metalness: 0.7 }), x, 2.3, -6.4, 0.03); box(2.4, 1.8, 0.5, mat('#232a33'), x, 5.2, -6.4); label('♥ 72', 2.0, 1.4, '#06231a', '#5dff9a', G, x, 5.2, -6.1); }
      break;
    }
    case 'police': {
      room('#8fa6c9', '#6d7684', 'checker');
      label('POLICE', 6.4, 1.6, '#0f2150', '#ffd23f', G, 0, 10.6, -7.7);
      const bar = mat('#3b424e', { metalness: 0.8, roughness: 0.35 }); box(6.4, 8, 0.3, mat('#1c222c'), -6.8, 4, -7.9);
      for (let x = -9.8; x <= -3.8; x += 0.75) mesh(new THREE.CylinderGeometry(0.11, 0.11, 8, 10), bar, G, x, 4, -7.35); for (const y of [0.3, 5.6, 8]) box(6.5, 0.25, 0.3, bar, -6.8, y, -7.35, 0.04);
      label('TOWN RULES|OBEY OR PAY', 4.6, 2.8, '#f6ecd0', '#4a2a10', G, 6.6, 7.2, -7.7); desk(7.4, -3.8, '#6b4a2c'); box(1.1, 0.9, 0.2, mat('#222831'), 7.4, 2.8, -4.1); shelf(10.2, -6.4);
      break;
    }
    case 'vault': {
      room('#4a505c', '#3a3f49', 'tile');
      const steel = mat('#aeb6c2', { metalness: 0.85, roughness: 0.32 }), gold = mat('#ffc83d', { metalness: 0.9, roughness: 0.28, emissive: '#6b4a00', emissiveIntensity: 0.45 });
      const door = mesh(new THREE.CylinderGeometry(4.3, 4.3, 0.7, 48), steel, G, 0, 6, -7.6); door.rotation.x = Math.PI / 2;
      mesh(new THREE.TorusGeometry(3.4, 0.22, 12, 48), mat('#6c7380', { metalness: 0.9 }), G, 0, 6, -7.15); for (let i = 0; i < 6; i++) { const sp = box(3.6, 0.26, 0.2, steel, 0, 6, -7.1, 0.08); sp.rotation.z = i * Math.PI / 6; } mesh(new THREE.SphereGeometry(0.55, 20, 14), gold, G, 0, 6, -6.9);
      for (const [cx2, cz] of [[-7.6, -4.6], [7.6, -4.6], [-8.6, -0.8], [8.6, -0.8]]) { let n = 0; for (let r = 0; r < 4; r++) for (let i = 0; i < 4 - r; i++) { box(1.1, 0.5, 0.65, gold, cx2 + (i - (3 - r) / 2) * 1.15, 0.28 + r * 0.52, cz + (n++ % 2) * 0.06, 0.08); } }
      const l = new THREE.PointLight('#ffcf6b', 60, 30); l.position.set(0, 6, -3); G.add(l); break;
    }
    case 'lab': {
      room('#1f3a48', '#26333d', 'tile');
      const tube = (x, c) => { mesh(new THREE.CylinderGeometry(1.25, 1.35, 0.6, 28), mat('#2b333d', { metalness: 0.7 }), G, x, 0.3, -6); mesh(new THREE.CylinderGeometry(1.05, 1.05, 6.2, 28), mat(c, { emissive: c, emissiveIntensity: 0.85, transparent: true, opacity: 0.72 }), G, x, 3.7, -6); mesh(new THREE.CylinderGeometry(1.35, 1.25, 0.7, 28), mat('#2b333d', { metalness: 0.7 }), G, x, 7.1, -6); for (let i = 0; i < 5; i++) mesh(new THREE.SphereGeometry(0.16, 10, 8), mat('#ffffff', { emissive: '#ffffff', emissiveIntensity: 0.6 }), G, x + Math.sin(i * 2.4) * 0.5, 1.6 + i * 1.1, -5.1); };
      tube(-7.4, '#3df0c4'); tube(-3.4, '#7a6bff'); tube(3.4, '#7a6bff'); tube(7.4, '#3df0c4');
      label('SECRET LAB|DO NOT ENTER', 6.2, 2.2, '#07151c', '#5dfce0', G, 0, 10.2, -7.7);
      desk(-8.6, -1, '#5a6a78'); desk(8.6, -1, '#5a6a78');
      for (const [x, c] of [[-4, '#3df0c4'], [4, '#9a7bff']]) { const l = new THREE.PointLight(c, 45, 24); l.position.set(x, 5, -3.4); G.add(l); }
      break;
    }
    case 'bunker': {
      room('#8b8d86', '#6c6a63', 'tile');
      const steel = mat('#59626e', { metalness: 0.75, roughness: 0.4 });
      box(5, 8.6, 0.4, steel, 0, 4.3, -7.8); const wheel = mesh(new THREE.TorusGeometry(1.0, 0.18, 12, 32), mat('#d0462f', { metalness: 0.5 }), G, 0, 4.6, -7.4); wheel.rotation.z = 0.4; box(2, 0.18, 0.18, mat('#d0462f'), 0, 4.6, -7.4, 0.05); box(0.18, 2, 0.18, mat('#d0462f'), 0, 4.6, -7.4, 0.05);
      label('SAFE ROOM', 4.4, 1.2, '#ffd23f', '#20180a', G, 0, 10.1, -7.7);
      for (const [x, y, z] of [[-8.6, 0.9, -5.6], [-8.6, 2.7, -5.8], [-6.4, 0.9, -6.2], [8.4, 0.9, -5.4], [8.9, 2.7, -5.9]]) box(1.9, 1.7, 1.7, nm('#b98552', [1, 1], 'wood'), x, y, z);
      shelf(6.2, -7.2);
      for (const x of [-5, 5]) mesh(new THREE.SphereGeometry(0.5, 16, 12), mat('#ffe9a8', { emissive: '#ffbe45', emissiveIntensity: 1.3 }), G, x, 9.4, -6.8);
      break;
    }
    case 'shop': {
      room('#ffe4b8', '#b98552', 'wood');
      label('TOWN MARKET', 7, 1.5, '#1d6b4a', '#fff7d8', G, 0, 10.6, -7.7);
      for (const x of [-7.6, -2.6, 2.6, 7.6]) { box(4.2, 8, 1.0, nm('#8a5a32', [2, 3], 'wood'), x, 4, -7.3); for (let r = 0; r < 3; r++) { box(4.0, 0.18, 1.4, mat('#6b4422'), x, 1.8 + r * 2.4, -6.9, 0.03); for (let i = 0; i < 5; i++) { const c = ['#e8503a', '#f2b524', '#2ba36a', '#2f86d9', '#ff8fb8'][(i + r * 2 + Math.round(x)) % 5 & 7] || '#e8503a'; if ((i + r) % 2) mesh(new THREE.SphereGeometry(0.38, 16, 12), mat(c, { roughness: 0.4 }), G, x - 1.5 + i * 0.75, 2.28 + r * 2.4, -6.6); else box(0.62, 0.95, 0.5, mat(c), x - 1.5 + i * 0.75, 2.36 + r * 2.4, -6.6, 0.08); } } }
      box(5, 2.4, 1.8, nm('#c98f52', [2, 1], 'wood'), -7.6, 1.2, -2.6); box(1.3, 0.9, 0.9, mat('#3b424e', { metalness: 0.6 }), -7.2, 2.85, -2.6); break;
    }
    case 'rooftop': {
      box(26, 0.8, 22, nm('#9a9a94', [8, 7], 'tile'), 0, -0.42, 1, 0.02);
      box(26, 1.5, 0.8, nm('#b5503c', [10, 1], 'brick'), 0, 0.75, -10, 0.05); box(26.4, 0.3, 1.1, mat('#d8d2c4'), 0, 1.65, -10, 0.05);
      const cols = ['#6c8fc4', '#c9684a', '#d9a441', '#7d6bb5', '#4f8f8a'];
      for (let i = 0; i < 17; i++) { const x = -48 + i * 6.2, h = 14 + ((i * 7) % 6) * 4.4; box(5.2, h, 5, mat(cols[i % 5]), x, h / 2 - 24, -34 - (i % 3) * 7); for (let y = -8; y < h - 26; y += 3) for (const dx of [-1.3, 1.3]) box(1.1, 1.4, 0.2, mat('#ffefb0', { emissive: '#ffd76a', emissiveIntensity: 0.35 }), x + dx, y, -31.4 - (i % 3) * 7, 0.03); }
      box(3.2, 2.4, 2.6, mat('#7d848f', { metalness: 0.5 }), -9, 1.2, -6.4); box(3.6, 4.6, 3, nm('#a8644a', [1, 2], 'brick'), 9.4, 2.3, -6.8); mesh(new THREE.CylinderGeometry(0.09, 0.09, 7, 8), mat('#2c3038'), G, 6.4, 3.5, -8.8);
      break;
    }
    case 'cave': {
      box(60, 0.6, 50, nm('#5a4a3c', [12, 12], 'asphalt'), 0, -0.32, 4, 0.01);
      const rock = nm('#4a4150', [2, 2], 'asphalt');
      box(60, 40, 0.6, nm('#241f2b', [10, 8], 'asphalt'), 0, 18, -13, 0.02);
      let seed = 21; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
      for (let i = 0; i < 90; i++) { const side = i % 3; const x = side === 0 ? (rnd() - 0.5) * 30 : (side === 1 ? -1 : 1) * (11 + rnd() * 4); const y = side === 0 ? rnd() * 16 : rnd() * 15, z = side === 0 ? -9 - rnd() * 3 : -8 + rnd() * 24; mesh(new THREE.DodecahedronGeometry(2 + rnd() * 2.2, 0), rock, G, x, y, z); }
      for (let i = 0; i < 16; i++) { const x = (i % 2 ? 1 : -1) * (4.6 + rnd() * 5), c = ['#4fe8ff', '#c06bff', '#5dffa0'][i % 3]; const cr = mesh(new THREE.ConeGeometry(0.4 + rnd() * 0.3, 1.6 + rnd() * 2, 6), mat(c, { emissive: c, emissiveIntensity: 0.9 }), G, x, 0.8, -7 + rnd() * 5); cr.rotation.z = (rnd() - 0.5) * 0.7; }
      for (const [x, c] of [[-6, '#4fe8ff'], [6, '#c06bff'], [0, '#ffb86b']]) { const l = new THREE.PointLight(c, 55, 26); l.position.set(x, 4.5, -3); G.add(l); }
      break;
    }
    default: ground('#6fbd4e', 'grass');
  }
  return G;
}

export const INDOOR = new Set(['classroom', 'hallway', 'library', 'house', 'bedroom', 'hospital', 'police', 'vault', 'lab', 'bunker', 'shop', 'cave']);

// ---------- story props (physical objects with the text painted on them) ----------
export function buildProp(type, text) {
  const G = new THREE.Group();
  const add = (geo, m, x = 0, y = 0, z = 0) => mesh(geo, m, G, x, y, z);
  const post = (x, h) => add(new THREE.CylinderGeometry(0.14, 0.18, h, 10), mat('#6b4a2c'), x, h / 2, -0.15);
  const glow = (c, k = 1) => mat(c, { emissive: c, emissiveIntensity: k });
  G.tick = null;
  if (type === 'sign') { post(0, 4); label(text || '!', 4.4, 2.2, '#fff3c4', '#6a1420', G, 0, 4.6, 0); }
  else if (type === 'screen') { post(0, 3); add(rbox(5.4, 3.6, 0.5, 0.12), mat('#1b1f2a'), 0, 4.8, -0.2); label(text || '...', 4.9, 3.0, '#0c2a44', '#7ff3ff', G, 0, 4.8, 0.12); }
  else if (type === 'cake') { add(rbox(3.4, 0.3, 3.4, 0.1), mat('#8a5a32'), 0, 2.0, 0); add(new THREE.CylinderGeometry(0.2, 0.3, 2, 10), mat('#6b4a2c'), 0, 1, 0); add(new THREE.CylinderGeometry(1.25, 1.25, 0.9, 32), mat('#ff9fc0'), 0, 2.6, 0); add(new THREE.CylinderGeometry(0.85, 0.85, 0.75, 32), mat('#fff4e0'), 0, 3.4, 0); for (let i = -1; i <= 1; i++) { add(new THREE.CylinderGeometry(0.06, 0.06, 0.55, 8), mat('#5bb8ff'), i * 0.38, 4.0, 0); add(new THREE.SphereGeometry(0.12, 10, 8), glow('#ffb020', 1.6), i * 0.38, 4.38, 0); } }
  else if (type === 'stack') { for (const [x, y] of [[-0.9, 0.75], [0.9, 0.75], [0, 2.25]]) { add(rbox(1.7, 1.45, 1.5, 0.12), mat('#ffffff', { map: noise('#b98552', [1, 1], 'wood') }), x, y, 0); } if (text) label(text, 3.6, 0.9, '#ffffff', '#3a2410', G, 0, 3.55, 0.2); }
  else if (type === 'pill') { post(0, 2.2); add(rbox(4.6, 0.25, 1.4, 0.08), mat('#e9e4da'), 0, 2.35, 0); ['#e8453c', '#2f86d9', '#35b565'].forEach((c, i) => { const p = add(new THREE.CapsuleGeometry(0.34, 0.6, 6, 16), glow(c, 0.45), (i - 1) * 1.4, 2.85, 0); p.rotation.z = Math.PI / 2.6; }); if (text) label(text, 4, 0.9, '#ffffff', '#222222', G, 0, 4.2, 0); }
  else if (type === 'number') { const t = tex(512, 256, (g) => { g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `900 ${String(text).length > 4 ? 130 : 200}px "Arial Black", Arial`; g.lineJoin = 'round'; g.lineWidth = 26; g.strokeStyle = '#101018'; g.strokeText(String(text || '1'), 256, 132, 480); g.fillStyle = '#ffe11f'; g.fillText(String(text || '1'), 256, 132, 480); }); const n = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 2.1), new THREE.MeshBasicMaterial({ map: t, transparent: true, toneMapped: false })); n.position.y = 8.3; G.add(n); G.tick = (s) => { n.position.y = 8.3 + Math.sin(s * 3) * 0.18; }; G.overHead = true; }
  else if (type === 'fire') { const flames = []; for (let i = 0; i < 16; i++) flames.push(add(new THREE.ConeGeometry(0.5, 1.7, 8), glow(['#ff7b1c', '#ffb81f', '#ff4b1f'][i % 3], 1.3), ((i % 6) - 2.5) * 0.55, 0.85, (i % 3) * 0.4 - 0.4)); G.tick = (s) => flames.forEach((f, i) => { const k = 0.75 + 0.45 * Math.abs(Math.sin(s * 9 + i)); f.scale.set(1, k, 1); f.position.y = 0.85 * k; }); const l = new THREE.PointLight('#ff8a30', 40, 22); l.position.y = 2.4; G.add(l); }
  else if (type === 'smoke') { const puffs = []; for (let i = 0; i < 14; i++) puffs.push(add(new THREE.SphereGeometry(0.6, 14, 10), mat('#8b8f99', { transparent: true, opacity: 0.85 }), 0, 0, 0)); G.tick = (s) => puffs.forEach((p, i) => { const k = (s * 0.35 + i / 14) % 1; p.position.set(Math.sin(i * 2.1) * (0.4 + k * 1.6), 0.4 + k * 6.5, Math.cos(i * 3.3) * 0.5); p.scale.setScalar(0.5 + k * 1.3); }); }
  else if (type === 'crack') { const pts = [[0, 0], [0.8, 0.5], [0.4, 1.4], [1.3, 2.2], [0.9, 3.1], [1.9, 4.2]]; for (const dir of [1, -1]) for (let i = 1; i < pts.length; i++) { const a = new THREE.Vector3(pts[i - 1][0] * dir, 0.06, -pts[i - 1][1] * dir * 0.7 + 1), b = new THREE.Vector3(pts[i][0] * dir, 0.06, -pts[i][1] * dir * 0.7 + 1); const seg = add(new THREE.BoxGeometry(0.34 - i * 0.04, 0.08, a.distanceTo(b) + 0.12), mat('#0d0a0a'), 0, 0, 0); seg.position.copy(a).lerp(b, 0.5); seg.lookAt(b); } }
  else if (type === 'wave') { const w = new THREE.Group(); G.add(w); for (let i = 0; i < 9; i++) { mesh(new THREE.SphereGeometry(2.4, 22, 16), mat('#2f8fe0', { roughness: 0.25, metalness: 0.2 }), w, (i - 4) * 2.6, 2.4 + (i % 2) * 0.7, -5); mesh(new THREE.SphereGeometry(1.0, 16, 12), mat('#eaf8ff'), w, (i - 4) * 2.6 + 0.7, 4.6 + (i % 2) * 0.7, -3.6); } G.tick = (s) => { w.position.z = Math.sin(s * 2) * 0.6; w.position.y = Math.sin(s * 3.1) * 0.25; }; G.backdrop = true; }
  else if (type === 'cabin' || type === 'bunker') { const bunk = type === 'bunker'; if (bunk) { add(new THREE.SphereGeometry(3, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), mat('#7d8590', { metalness: 0.5, roughness: 0.45 }), 0, 0, -1); add(new THREE.CylinderGeometry(1.1, 1.1, 0.4, 24), mat('#3a404a', { metalness: 0.7 }), 0, 1.4, 1.85).rotation.x = Math.PI / 2; } else { add(rbox(5, 3.6, 3.6, 0.12), mat('#ffffff', { map: noise('#8a5a32', [2, 2], 'wood') }), 0, 1.8, -1); const r = add(new THREE.ConeGeometry(4.2, 2.4, 4), mat('#5a2c24'), 0, 4.75, -1); r.rotation.y = Math.PI / 4; add(rbox(1.3, 2.2, 0.2, 0.05), mat('#4a2a14'), 0, 1.1, 0.85); } if (text) label(text, 3.6, 0.9, '#fff3c4', '#3a2410', G, 0, bunk ? 3.7 : 3.1, bunk ? 1.4 : 0.95); G.backdrop = true; }
  else if (type === 'tower') { for (let i = 0; i < 7; i++) { add(rbox(3.8 - i * 0.22, 2.0, 3.8 - i * 0.22, 0.14), mat(i % 2 ? '#c9684a' : '#e6c27a'), 0, 1 + i * 2.0, -2); for (const x of [-0.8, 0.8]) add(rbox(0.6, 0.9, 0.2, 0.04), glow('#ffeaa0', 0.7), x, 1 + i * 2.0, -2 + (3.8 - i * 0.22) / 2); } if (text) label(text, 3.4, 0.9, '#ffffff', '#222222', G, 0, 3.1, 0.3); G.backdrop = true; }
  else return null;
  return G;
}
