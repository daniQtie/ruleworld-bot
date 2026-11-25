// Shot specs for "In This World, You Can See How Much Luck You Have Left" (one shot per script line, 15 lines).
// Look copied from the reference Short (@Gneef): orange messy hair, plain tee with the green % number printed on the chest, suit man, old man,
// mum and sister; bright Roblox-city days, kitchen at night. Camera rules S/T/U: mediums and wides, varied angles, every shot moves.
import fs from 'fs'; import path from 'path';
const ID = '2026-11-26-story-09', OUT = path.join('output', ID);
const narr = fs.readdirSync(OUT).filter(f => /^narration-.*\.json$/.test(f)).map(f => path.join(OUT, f)).sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
const T = JSON.parse(fs.readFileSync(narr, 'utf8')).times;
const script = JSON.parse(fs.readFileSync('scripts/' + ID + '.v1.json', 'utf8'));
const total = T[T.length - 1].end + (script.tail_hold ?? 0.8);
const slot = i => (i + 1 < T.length ? T[i + 1].start : total) - (i === 0 ? 0 : T[i].start);
// fraction of shot i at which the k-th occurrence of a word is spoken (the luck number changes when the number is said)
const frac = (i, p) => Math.min(0.95, p);

const FIELD = { loc: 'field', light: 'day', exposure: 1.0 };
const DUSK = { loc: 'field', light: 'sunset', exposure: 0.95 };
const BEDROOM = { loc: 'lilyroom', light: 'day', exposure: 0.9 };
const KITCHEN = { loc: 'house', light: 'day', time: 'day', exposure: 0.9, dx: 9 };
const C = (id, who, x, z, rot = 0, face = 'neutral', o = {}) => ({ id, who, at: [x, z], rot, face, ...o });
const arm = (who, x, z, t, a = 'R') => ({ who, do: 'arm', arm: a, x, z, t, hold: true });
const cam = (A, B, look, fov = 38, lookTo) => ({ from: A, to: B, look, lookTo: lookTo || look, fov });
const push = (x, z, h = 3.0, d0 = 17, d1 = 13, fov = 36, dx = 1.2) => cam([x + dx, h + 2.2, z + d0], [x + dx * 0.4, h + 1.7, z + d1], [x, h, z], fov);
const pull = (x, z, h = 3.0, d0 = 12, d1 = 17, fov = 36, dx = 0.6) => cam([x + dx, h + 1.8, z + d0], [x + dx * 2, h + 2.4, z + d1], [x, h, z], fov);
const drift = (x, z, h = 3.0, d = 15, side = 4, fov = 36) => cam([x - side, h + 2.0, z + d], [x + side, h + 2.0, z + d], [x, h, z], fov);
const low = (x, z, h = 3.4, d = 14, fov = 40) => cam([x + 1.5, 1.2, z + d], [x + 0.5, 2.0, z + d - 1.8], [x, h + 0.4, z], fov);
const high = (x, z, h = 2.6, d = 13, fov = 40) => cam([x + 1.5, 12, z + d], [x - 0.5, 11, z + d - 1.5], [x, h, z], fov);
const follow = (x0, x1, z, h = 3.0, d = 16, fov = 38) => cam([x0, h + 2, z + d], [x1, h + 2, z + d], [x0 + 2, h, z], fov, [x1 + 2, h, z]);
const ins = (x, y, z, d = 7, fov = 34) => cam([x + 0.8, y + 1.6, z + d], [x + 0.2, y + 1.0, z + d - 1.5], [x, y, z], fov);
const NOEL = (o = {}) => C('n', 'noel', 0, 5, 0, 'laugh', { counter: 'L1000', ...o });

const S = [];
// 0  title: everyone has a glowing number (crowd on the street field, wide push)
S[0] = { ...FIELD, cast: [C('a', 'suitman', -4, 6, 20, 'laugh', { counter: 'L98' }), C('b', 'oldman', 4, 8, -20, 'neutral', { counter: 'L95' }), C('c', 'mumn', -1, 12, 0, 'happy', { counter: 'L88' }), C('d', 'noel', 8, 14, -30, 'neutral', { counter: 'L40' })], acts: [], cam: cam([3, 9, 32], [0, 7, 23], [0, 3.6, 8], 44) };
// 1  green and red: two strangers, one big green, one red, drift between them
S[1] = { ...FIELD, cast: [C('a', 'suitman', -2.4, 5, 30, 'laugh', { counter: 'L98' }), C('b', 'oldman', 2.4, 5, -30, 'sad', { counter: 'L-60' })], acts: [], cam: drift(0, 5, 3.0, 15, 3.5) };
// 2  Noel wakes up to a green 1000: bedroom, low push, arms up
S[2] = { ...BEDROOM, cast: [NOEL({ at: [0, 3], face: 'shocked' })], acts: [arm('n', -2.9, 0.3, [0.35, 0.6], 'R'), arm('n', -2.9, -0.3, [0.35, 0.6], 'L')], cam: cam([2, 3.0, 17], [0.6, 4.2, 13.5], [0, 3.4, 3], 40, [0, 3.2, 3]) };
// 3  he runs outside: tracking, joy
S[3] = { ...FIELD, cast: [NOEL({ at: [-9, 6], rot: 90, face: 'laugh' })], acts: [{ who: 'n', do: 'run', to: [9, 6], t: [0.05, 0.95] }], cam: follow(-9, 9, 6, 3.0, 16) };
// 4  one hundred dollars on the sidewalk: he looks down at the bill
S[4] = { ...FIELD, props: [{ id: 'bill', type: 'sign', color: '$100', at: [0.8, 0, 8.5], rot: 0, scale: 0.8 }], cast: [NOEL({ at: [0, 5], face: 'laugh' })], acts: [{ who: 'n', do: 'lookdown', t: [0.2, 1], hold: true }], cam: push(0, 6, 3.0, 16, 12, 38) };
// 5  strangers compliment him: two-shot, thumbs-up (arm raised)
S[5] = { ...FIELD, cast: [NOEL({ at: [0, 5], face: 'laugh' }), C('a', 'suitman', -4.5, 5.5, 60, 'laugh', { counter: 'L98' }), C('b', 'oldman', 4.5, 5.5, -60, 'happy', { counter: 'L95' })], acts: [arm('a', -2.9, 0.2, [0.3, 0.6]), arm('b', -2.9, 0.2, [0.4, 0.7], 'L')], cam: pull(0, 5, 3.0, 12, 17, 40) };
// 6  a brand new car, FREE: big white FREE sign, keys handed over
S[6] = { ...FIELD, props: [{ id: 'fr', type: 'sign', color: 'FREE', at: [0, 0, -2], rot: 0, scale: 2.6 }], cast: [NOEL({ at: [-1.8, 5], rot: 20, face: 'shocked' }), C('a', 'suitman', 2.2, 5, -70, 'laugh', { counter: 'L98' })], acts: [arm('a', -2.6, 0.4, [0.2, 0.5])], cam: low(0, 5, 3.4, 15, 42) };
// 7  every good thing turns a number red somewhere else: Noel in front, the stranger's number drops to red behind him
S[7] = { ...FIELD, cast: [NOEL({ at: [-1.5, 3], face: 'laugh' }), C('a', 'oldman', 4, 11, 180, 'sad', { counter: 'L95', counterKeys: [[0.45, 'L-30']] }), C('b', 'suitman', -5, 14, 180, 'sad', { counter: 'L98', counterKeys: [[0.7, 'L-20']] })], acts: [], cam: drift(0, 7, 3.0, 20, 4, 40) };
// 8  late at night he walks home (dusk, away from camera)
S[8] = { ...DUSK, cast: [NOEL({ at: [-4, 3], rot: 90, face: 'happy' })], acts: [{ who: 'n', do: 'walk', to: [8, 3], t: [0.05, 0.95] }], cam: follow(-4, 8, 3, 3.0, 16) };
// 9  he steps inside: the number flashes red, minus one million, hands on head
S[9] = { ...KITCHEN, cast: [NOEL({ at: [0, 4], face: 'shocked', counterKeys: [[0.3, 'L-1000000']] })], acts: [arm('n', -3.0, 0.2, [0.4, 0.7], 'R'), arm('n', -3.0, -0.2, [0.4, 0.7], 'L'), { who: 'n', do: 'tremble', t: [0.4, 1] }], cam: push(0, 4, 3.0, 17, 12, 38) };
// 10 sister crying on the kitchen floor: high angle
S[10] = { ...KITCHEN, cast: [C('m', 'mia', 0, 4, 0, 'sob'), NOEL({ at: [3.5, 7], rot: -150, face: 'scared', counter: 'L-1000000' })], acts: [{ who: 'm', do: 'sit', seat: 0.6, t: [0, 1], hold: true }], cam: high(0, 5, 2.4, 14, 42) };
// 11 mother beside her, clutching her chest
S[11] = { ...KITCHEN, cast: [C('mo', 'mumn', 0, 4, 0, 'sob', { counter: 'L-1000000' }), C('m', 'mia', 3, 4.5, -60, 'sob')], acts: [{ who: 'mo', do: 'sit', seat: 0.8, t: [0, 1], hold: true }, arm('mo', -1.6, 0.4, [0.2, 0.5]), { who: 'm', do: 'sit', seat: 0.6, t: [0, 1], hold: true }], cam: high(0, 4, 2.4, 14, 42) };
// 12 he understands: close-medium, push, red number
S[12] = { ...KITCHEN, cast: [NOEL({ at: [0, 4], face: 'sob', counter: 'L-1000000' })], acts: [{ who: 'n', do: 'lookdown', t: [0.1, 1], hold: true }], cam: push(0, 4, 3.0, 16, 12, 36) };
// 13 it only moves luck from someone else: mother's number glows red, Noel's green again for a beat (wide two-shot)
S[13] = { ...KITCHEN, cast: [NOEL({ at: [-2.4, 4], rot: 60, face: 'sad', counter: 'L1000', counterKeys: [[0.55, 'L-1000000']] }), C('mo', 'mumn', 2.6, 4, -60, 'sob', { counter: 'L-1000000' })], acts: [], cam: drift(0, 4, 3.0, 17, 3.5, 38) };
// 14 Noel kneels over his mother: slow pull-out
S[14] = { ...KITCHEN, cast: [NOEL({ at: [-1.6, 4], rot: 70, face: 'sob', counter: 'L-1000000' }), C('mo', 'mumn', 1.8, 4, -70, 'sob', { counter: 'L-1000000' }), C('m', 'mia', 5, 6, -120, 'sob')], acts: [{ who: 'mo', do: 'sit', seat: 0.8, t: [0, 1], hold: true }, { who: 'n', do: 'sit', seat: 0.8, t: [0, 1], hold: true }, { who: 'm', do: 'sit', seat: 0.6, t: [0, 1], hold: true }], cam: pull(0, 5, 2.8, 12, 20, 40) };

// ---- indoor sets are small: shift the whole shot back (dz) and keep the camera inside the room ----
const INDOOR = { hallway: [-8, 16], classroom: [-8, 16], library: [-8, 16], lilyroom: [-7, 11.5], house: [8, 30] };
const shiftX = (s) => {
  const dx = s.dx || 0; if (!dx) return s;
  const X = (a) => a && [a[0] + dx, ...a.slice(1)];
  s.cast = s.cast.map(c => ({ ...c, at: [c.at[0] + dx, c.at[1]] }));
  s.acts = (s.acts || []).map(a => (a.to ? { ...a, to: [a.to[0] + dx, a.to[1]] } : a));
  s.cam = { ...s.cam, from: X(s.cam.from), to: X(s.cam.to), look: X(s.cam.look), ...(s.cam.lookTo ? { lookTo: X(s.cam.lookTo) } : {}) };
  delete s.dx; return s;
};
S.forEach((s, i) => { S[i] = shiftX(s); });
const shiftShot = (s) => {
  const r = INDOOR[s.loc]; if (!r) return s; const [dz, zmax] = r;
  const P = (a) => a && [a[0], a[1], Math.min(a[2] + dz, zmax)];
  s.cast = (s.cast || []).map(c => ({ ...c, at: [c.at[0], c.at[1] + dz] }));
  s.props = (s.props || []).map(p => ({ ...p, at: [p.at[0], p.at[1], p.at[2] + dz] }));
  s.acts = (s.acts || []).map(a => ({ ...a, ...(a.to ? { to: [a.to[0], a.to[1] + dz] } : {}) }));
  const c = s.cam; s.cam = { ...c, from: P(c.from), to: P(c.to), look: [c.look[0], c.look[1], c.look[2] + dz], ...(c.lookTo ? { lookTo: [c.lookTo[0], c.lookTo[1], c.lookTo[2] + dz] } : {}) };
  return s;
};
S.forEach((s, i) => { S[i] = shiftShot(s); });
// ---- effects (fx.js): glow, vignette, grain, colour grade, floating sparkles. Warm + gold sparkles for the lucky day, cool + dust for the sad kitchen ----
const FX_DAY = { bloom: 0.38, vignette: 0.3, grain: 0.035, sat: 1.12, contrast: 1.06, sparkles: { color: '#ffe9a0', count: 160, size: 0.6, speed: 0.6 } };
const FX_SAD = { bloom: 0.25, vignette: 0.42, grain: 0.05, sat: 0.92, contrast: 1.08, tint: [0.94, 0.98, 1.06], sparkles: { color: '#bcd4ff', count: 70, size: 0.4, speed: 0.2 } };
S.forEach((s, i) => { s.fx = i <= 7 ? FX_DAY : FX_SAD; });
S[2].fx = { ...FX_DAY, bloom: 0.1, bloomThreshold: 0.99 }; S[2].exposure = 0.62;   // the bedroom is very bright: keep the glow off it
const shots = S.map((s, i) => ({ line: i, dur: +(slot(i) + 0.3).toFixed(3), props: [], acts: [], monsters: [], ...s, line: i }));
fs.writeFileSync(path.join(OUT, 'shotspec.json'), JSON.stringify({ id: ID, shots }, null, 1));
console.log(shots.length + ' shots, ' + shots.reduce((a, s) => a + s.dur, 0).toFixed(1) + ' s');
