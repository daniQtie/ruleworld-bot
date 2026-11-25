// Shared helpers for shot-spec generators (2026-11-23): timing from the newest narration, camera moves (rules S/T/U),
// indoor-set shifting, effects presets, and the writer. Import with: import * as K from './_common.mjs';
import fs from 'fs'; import path from 'path';

export function timing(ID) {
  const OUT = path.join('output', ID);
  const narr = fs.readdirSync(OUT).filter(f => /^narration-.*\.json$/.test(f)).map(f => path.join(OUT, f)).sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
  const T = JSON.parse(fs.readFileSync(narr, 'utf8')).times;
  const vers = fs.readdirSync('scripts').filter(f => f.startsWith(ID + '.v') && /\.v\d+\.json$/.test(f)).sort((a, b) => +a.match(/\.v(\d+)/)[1] - +b.match(/\.v(\d+)/)[1]);
  const script = JSON.parse(fs.readFileSync('scripts/' + vers.pop(), 'utf8'));   // newest script version
  const total = T[T.length - 1].end + (script.tail_hold ?? 0.8);
  const slot = i => (i + 1 < T.length ? T[i + 1].start : total) - (i === 0 ? 0 : T[i].start);
  return { OUT, T, script, slot };
}
export const FX = {
  day: { bloom: 0.3, vignette: 0.28, grain: 0.03, sat: 1.12, contrast: 1.05, sparkles: { color: '#fff6c8', count: 90, size: 0.45, speed: 0.4 } },
  sad: { bloom: 0.15, bloomThreshold: 0.97, vignette: 0.42, grain: 0.045, sat: 0.9, contrast: 1.07, tint: [0.94, 0.98, 1.06] },
  indoor: { bloom: 0.15, bloomThreshold: 0.97, vignette: 0.3, grain: 0.035, sat: 1.08, contrast: 1.05 },
  win: { bloom: 0.5, bloomThreshold: 0.8, vignette: 0.25, grain: 0.03, sat: 1.15, contrast: 1.05, sparkles: { color: '#ffe9a0', count: 200, size: 0.6, speed: 0.7 } },
  danger: { bloom: 0.3, bloomThreshold: 0.9, vignette: 0.45, grain: 0.05, sat: 1.05, contrast: 1.12, tint: [0.92, 0.98, 1.1] },
};
export const C = (id, who, x, z, rot = 0, face = 'neutral', o = {}) => ({ id, who, at: [x, z], rot, face, ...o });
export const arm = (who, x, z, t, a = 'R') => ({ who, do: 'arm', arm: a, x, z, t, hold: true });
export const both = (who, t, x = -2.9) => [arm(who, x, 0.3, t, 'R'), arm(who, x, -0.3, t, 'L')];
export const cam = (A, B, look, fov = 38, lookTo) => ({ from: A, to: B, look, lookTo: lookTo || look, fov });
export const push = (x, z, h = 3.4, d0 = 17, d1 = 13, fov = 38, dx = 1.2) => cam([x + dx, h + 2.2, z + d0], [x + dx * 0.4, h + 1.7, z + d1], [x, h, z], fov);
export const pull = (x, z, h = 3.4, d0 = 12, d1 = 18, fov = 38, dx = 0.6) => cam([x + dx, h + 1.8, z + d0], [x + dx * 2, h + 2.4, z + d1], [x, h, z], fov);
export const drift = (x, z, h = 3.4, d = 15, side = 4, fov = 38) => cam([x - side, h + 2.0, z + d], [x + side, h + 2.0, z + d], [x, h, z], fov);
export const low = (x, z, h = 3.6, d = 14, fov = 42) => cam([x + 1.5, 1.2, z + d], [x + 0.5, 2.0, z + d - 1.8], [x, h + 0.5, z], fov);
export const high = (x, z, h = 2.6, d = 13, fov = 42) => cam([x + 1.5, 12, z + d], [x - 0.5, 11, z + d - 1.5], [x, h, z], fov);
export const follow = (x0, x1, z, h = 3.2, d = 16, fov = 40) => cam([x0, h + 2, z + d], [x1, h + 2, z + d], [x0 + 2, h, z], fov, [x1 + 2, h, z]);
export const ins = (x, y, z, d = 7, fov = 34) => cam([x + 0.8, y + 1.6, z + d], [x + 0.2, y + 1.0, z + d - 1.5], [x, y, z], fov);

// 2026-11-24 (owner's FB reel reference): drone opener, Dutch tilt, feet shot, over-the-shoulder, extreme face close-up.
// Transitions are set per shot with  trans: 'zoom' | 'flash' | 'whip' | 'glitch' | 'cut'  (default: zoom on a location change),
// glitch windows with  glitch: [[0.4, 0.6]]  (fractions of the shot); both are applied by pipeline/assemble.py.
export const drone = (x, z, h = 3.6) => ({ keys: [
  { t: 0, pos: [x + 10, 34, z + 55], look: [x, 0, z - 10], fov: 50 },
  { t: 0.55, pos: [x + 2.5, 7, z + 16], look: [x, h, z], fov: 44 },
  { t: 1, pos: [x + 0.6, h + 1.6, z + 8.5], look: [x, h + 1.2, z], fov: 38 }], ease: 'lin' });
export const dutch = (c, deg = 12) => ({ ...c, roll: deg });
export const feet = (x, z, dx = 1.4) => cam([x + dx, 1.1, z + 10], [x + dx * 0.4, 1.0, z + 8.5], [x, 1.0, z], 46);
export const ots = (x, z, tx, tz, h = 3.6) => { const dx = x - tx, dz = z - tz, L = Math.hypot(dx, dz) || 1, ux = dx / L, uz = dz / L;
  return cam([x + ux * 4.4 - uz * 1.9, h + 1.8, z + uz * 4.4 + ux * 1.9], [x + ux * 3.6 - uz * 1.7, h + 1.6, z + uz * 3.6 + ux * 1.7], [tx, h + 0.4, tz], 40); };
export const eye = (x, z, h = 4.4, d0 = 3.4, d1 = 2.2) => cam([x + 0.35, h + 0.15, z + d0], [x + 0.1, h + 0.1, z + d1], [x, h, z], 30);

const INDOOR = { hallway: [-8, 16], classroom: [-8, 16], library: [-8, 16], lilyroom: [-7, 11.5], house: [8, 30] };
function shiftX(s) {
  const dx = s.dx || 0; delete s.dx; if (!dx) return s;
  const X = (a) => a && [a[0] + dx, ...a.slice(1)];
  s.cast = (s.cast || []).map(c => ({ ...c, at: [c.at[0] + dx, c.at[1]] }));
  s.props = (s.props || []).map(p => ({ ...p, at: [p.at[0] + dx, ...p.at.slice(1)] }));
  s.acts = (s.acts || []).map(a => (a.to ? { ...a, to: [a.to[0] + dx, a.to[1]] } : a));
  if (s.cam.keys) { s.cam = { ...s.cam, keys: s.cam.keys.map(k => ({ ...k, pos: X(k.pos), look: X(k.look) })) }; return s; }
  s.cam = { ...s.cam, from: X(s.cam.from), to: X(s.cam.to), look: X(s.cam.look), ...(s.cam.lookTo ? { lookTo: X(s.cam.lookTo) } : {}) };
  return s;
}
function shiftZ(s) {
  const r = INDOOR[s.loc]; if (!r) return s; const [dz, zmax] = r;
  const P = (a) => a && [a[0], a[1], Math.min(a[2] + dz, zmax)];
  s.cast = (s.cast || []).map(c => ({ ...c, at: [c.at[0], c.at[1] + dz] }));
  s.props = (s.props || []).map(p => ({ ...p, at: p.at.length > 2 ? [p.at[0], p.at[1], p.at[2] + dz] : [p.at[0], p.at[1] + dz] }));
  s.acts = (s.acts || []).map(a => ({ ...a, ...(a.to ? { to: [a.to[0], a.to[1] + dz] } : {}) }));
  if (s.cam.keys) { s.cam = { ...s.cam, keys: s.cam.keys.map(k => ({ ...k, pos: P(k.pos), look: [k.look[0], k.look[1], k.look[2] + dz] })) }; return s; }
  const c = s.cam; s.cam = { ...c, from: P(c.from), to: P(c.to), look: [c.look[0], c.look[1], c.look[2] + dz], ...(c.lookTo ? { lookTo: [c.lookTo[0], c.lookTo[1], c.lookTo[2] + dz] } : {}) };
  return s;
}
export function write(ID, S, slot, OUT) {
  // owner 2026-11-24 (Rule AA): videos must be bright and sharp. Minimum exposure per set, like episodes 1-8 (night scenes excepted).
  const FLOOR = { hallway: 0.8, classroom: 0.8, library: 0.8, house: 0.9, field: 0.95, forest: 0.95, lilyroom: 0.45 };
  S = S.map(s => (s.light === 'night' || !FLOOR[s.loc]) ? s : { ...s, exposure: Math.max(s.exposure ?? FLOOR[s.loc], FLOOR[s.loc]) });
  const shots = S.map((s, i) => ({ line: i, dur: +(slot(i) + 0.3).toFixed(3), props: [], acts: [], monsters: [], lively: true, ...shiftZ(shiftX({ ...s })), line: i }));
  fs.writeFileSync(path.join(OUT, 'shotspec.json'), JSON.stringify({ id: ID, shots }, null, 1));
  console.log(ID + ': ' + shots.length + ' shots, ' + shots.reduce((a, s) => a + s.dur, 0).toFixed(1) + ' s');
}
