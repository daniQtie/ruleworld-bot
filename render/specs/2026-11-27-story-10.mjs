// Shot specs for "In This World, Your Number Shows How Important You Will Become" (17 lines, one shot each).
// Copied from the reference Short (TeamDeam 'I Was Made To Help People In Need'): big red numbers floating above heads, green varsity '8' hero,
// trucker-cap flannel best friend, park, red-locker school, hospital birth, school on fire. Characters move (lively idle + acts). Effects on.
import fs from 'fs'; import path from 'path';
const ID = '2026-11-27-story-10', OUT = path.join('output', ID);
const narr = fs.readdirSync(OUT).filter(f => /^narration-.*\.json$/.test(f)).map(f => path.join(OUT, f)).sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
const T = JSON.parse(fs.readFileSync(narr, 'utf8')).times;
const script = JSON.parse(fs.readFileSync('scripts/' + ID + '.v1.json', 'utf8'));
const total = T[T.length - 1].end + (script.tail_hold ?? 0.8);
const slot = i => (i + 1 < T.length ? T[i + 1].start : total) - (i === 0 ? 0 : T[i].start);

const FX_DAY = { bloom: 0.3, vignette: 0.28, grain: 0.03, sat: 1.12, contrast: 1.05, sparkles: { color: '#fff6c8', count: 90, size: 0.45, speed: 0.4 } };
const FX_SAD = { bloom: 0.2, vignette: 0.42, grain: 0.045, sat: 0.9, contrast: 1.07, tint: [0.94, 0.98, 1.06] };
const FX_FIRE = { bloom: 0.55, bloomThreshold: 0.75, vignette: 0.4, grain: 0.05, sat: 1.15, contrast: 1.1, tint: [1.08, 0.98, 0.9], sparkles: { color: '#ffb060', count: 160, size: 0.5, speed: 1.2 } };
const FX_WIN = { bloom: 0.5, bloomThreshold: 0.8, vignette: 0.25, grain: 0.03, sat: 1.15, contrast: 1.05, sparkles: { color: '#ffe9a0', count: 200, size: 0.6, speed: 0.7 } };
const PARK = { loc: 'forest', light: 'day', exposure: 0.95, lively: true };
const HALL = { loc: 'hallway', light: 'day', exposure: 0.68, lively: true };
const HOSP = { loc: 'lilyroom', light: 'day', exposure: 0.5, lively: 0.6 };
const FIELD = { loc: 'field', light: 'day', exposure: 1.0, lively: true };
const C = (id, who, x, z, rot = 0, face = 'neutral', o = {}) => ({ id, who, at: [x, z], rot, face, ...o });
const arm = (who, x, z, t, a = 'R') => ({ who, do: 'arm', arm: a, x, z, t, hold: true });
const both = (who, t) => [arm(who, -2.9, 0.3, t, 'R'), arm(who, -2.9, -0.3, t, 'L')];
const cam = (A, B, look, fov = 38, lookTo) => ({ from: A, to: B, look, lookTo: lookTo || look, fov });
const push = (x, z, h = 3.6, d0 = 18, d1 = 14, fov = 38, dx = 1.2) => cam([x + dx, h + 2.2, z + d0], [x + dx * 0.4, h + 1.7, z + d1], [x, h, z], fov);
const pull = (x, z, h = 3.6, d0 = 13, d1 = 19, fov = 38, dx = 0.6) => cam([x + dx, h + 1.8, z + d0], [x + dx * 2, h + 2.4, z + d1], [x, h, z], fov);
const drift = (x, z, h = 3.6, d = 16, side = 4, fov = 38) => cam([x - side, h + 2.0, z + d], [x + side, h + 2.0, z + d], [x, h, z], fov);
const low = (x, z, h = 3.8, d = 15, fov = 42) => cam([x + 1.5, 1.2, z + d], [x + 0.5, 2.0, z + d - 1.8], [x, h + 0.6, z], fov);
const high = (x, z, h = 2.8, d = 14, fov = 42) => cam([x + 1.5, 12, z + d], [x - 0.5, 11, z + d - 1.5], [x, h, z], fov);
const follow = (x0, x1, z, h = 3.4, d = 17, fov = 40) => cam([x0, h + 2, z + d], [x1, h + 2, z + d], [x0 + 2, h, z], fov, [x1 + 2, h, z]);
const ELI = (o = {}) => C('e', 'eli', 0, 4, 0, 'sad', { counter: 'H0', ...o });
const MASON = (o = {}) => C('m', 'mason', 0, 4, 0, 'laugh', { counter: 'H1204', ...o });

const S = [];
// 0  title: four kids in the park, numbers above their heads (wide push)
S[0] = { ...PARK, fx: FX_DAY, cast: [C('a', 'lucy', -4.5, 5, 10, 'happy', { counter: 'H67' }), C('b', 'mason', -1.5, 5, 0, 'smirk', { counter: 'H13' }), C('c', 'noob', 1.5, 5, 0, 'happy', { counter: 'H37' }), C('d', 'beanie', 4.5, 5, -10, 'neutral', { counter: 'H128' })], acts: [], cam: cam([2, 8, 30], [0, 6.5, 21], [0, 4.2, 5], 40) };
// 1  every child is born with one: two kids, low angle drift
S[1] = { ...PARK, fx: FX_DAY, cast: [C('a', 'noob', -2, 5, 20, 'happy', { counter: 'H45' }), C('b', 'lucy', 2, 5, -20, 'laugh', { counter: 'H67' })], acts: [], cam: low(0, 5, 3.8, 16) };
// 2  twelve, forty-five, nine hundred: three kids, lateral dolly
S[2] = { ...PARK, fx: FX_DAY, cast: [C('a', 'beanie', -4, 5, 15, 'neutral', { counter: 'H12' }), C('b', 'noob', 0, 5, 0, 'happy', { counter: 'H45' }), C('c', 'lucy', 4, 5, -15, 'laugh', { counter: 'H900' })], acts: [], cam: drift(0, 5, 3.8, 19, 4, 40) };
// 3  Mason, 1204: arms up, low angle push
S[3] = { ...PARK, fx: FX_WIN, cast: [MASON({ at: [0, 5] })], acts: [...both('m', [0.1, 0.35])], cam: low(0, 5, 4.0, 15) };
// 4  someone big: grown-up Mason, bigger, proud (push)
S[4] = { ...PARK, fx: FX_WIN, cast: [MASON({ at: [0, 5], scale: 1.28, face: 'smirk' })], acts: [], cam: push(0, 5, 4.6, 20, 15, 40) };
// 5  birth: the doctor looks at the baby's number and freezes (hospital room)
S[5] = { ...HOSP, fx: FX_SAD, cast: [C('d', 'doc', -1.2, 3, 30, 'shocked'), C('b', 'babyb', 1.3, 3.5, -20, 'neutral', { counter: 'H0', y: 2.6 })], acts: [arm('d', -1.4, 0.5, [0.05, 0.3])], cam: push(0, 3, 3.6, 16, 12.5, 40) };
// 6  "It was zero.": close on the baby's 0
S[6] = { ...HOSP, fx: FX_SAD, cast: [C('b', 'babyb', 0, 3, 0, 'neutral', { counter: 'H0', y: 2.6, still: true })], acts: [], cam: cam([0.6, 4.8, 9], [0.3, 4.6, 7.4], [0, 3.8, 3], 34) };
// 7  everyone treated him like he would never matter: Eli alone, kids pass and ignore him (high angle)
S[7] = { ...HALL, fx: FX_SAD, cast: [ELI({ at: [0, 3] }), C('a', 'lucy', -3, 10, 180, 'neutral', { counter: 'H67' }), C('b', 'beanie', 3, 12, 180, 'neutral', { counter: 'H12' })], acts: [{ who: 'a', do: 'walk', to: [-3, -14], t: [0.05, 1] }, { who: 'b', do: 'walk', to: [3, -12], t: [0.1, 1] }, { who: 'e', do: 'lookdown', t: [0.2, 1], hold: true }], cam: high(0, 4, 3.0, 15) };
// 8  big numbers are celebrities: Mason with admirers, Eli at the side
S[8] = { ...HALL, fx: FX_DAY, cast: [MASON({ at: [0, 3], counter: 'H1670', face: 'laugh' }), C('a', 'lucy', -2.6, 5, 60, 'starstruck'), C('b', 'noob', 2.6, 5, -60, 'starstruck', { counter: 'H45' }), ELI({ at: [6, 9], rot: -40 })], acts: [...both('a', [0.2, 0.4]).slice(0, 1)], cam: drift(0, 4, 3.8, 18, 3.5, 40) };
// 9  he tried everything: studies, helps, wins (determined, books)
S[9] = { ...HALL, fx: FX_DAY, props: [{ id: 'bk', type: 'stack', at: [2.2, 0, 4.5], scale: 1.2 }], cast: [ELI({ at: [0, 4], face: 'determined' })], acts: [arm('e', -2.9, 0.2, [0.55, 0.75])], cam: pull(0, 4, 3.6, 13, 18, 38) };
// 10 his number never moved: sad push
S[10] = { ...HALL, fx: FX_SAD, cast: [ELI({ at: [0, 4], face: 'sad' })], acts: [{ who: 'e', do: 'lookdown', t: [0.1, 1], hold: true }], cam: push(0, 4, 3.8, 17, 13, 36) };
// 11 a fire breaks out: the school on fire (wide)
S[11] = { ...FIELD, fx: FX_FIRE, props: [{ id: 'f1', type: 'fire', at: [-10, 12, -27.4], scale: 2.4 }, { id: 'f2', type: 'fire', at: [6, 21, -27.4], scale: 2.6 }, { id: 'f3', type: 'fire', at: [-2, 30, -27.4], scale: 2.2 }, { id: 'f4', type: 'fire', at: [14, 0, -26.5], scale: 3 }, { id: 's1', type: 'smoke', at: [-4, 40, -30], scale: 4 }, { id: 's2', type: 'smoke', at: [8, 34, -30], scale: 3.5 }], cast: [C('a', 'beanie', -3, 6, 180, 'scared'), C('b', 'lucy', 3, 7, 180, 'scared')], acts: [], cam: cam([8, 6, 34], [2, 9, 26], [0, 16, -27], 52) };
// 12 panic, trapped inside: hallway with fire, kids scared, arms up
S[12] = { ...HALL, fx: FX_FIRE, props: [{ id: 'f1', type: 'fire', at: [-7, 0, -2], scale: 1.6 }, { id: 'f2', type: 'fire', at: [7, 0, 0], scale: 1.6 }, { id: 'f3', type: 'fire', at: [0, 0, -10], scale: 2.2 }], cast: [C('a', 'beanie', -1.8, 4, 0, 'shocked'), C('b', 'lucy', 1.8, 5, 0, 'scared'), C('c', 'noob', 0, 0, 0, 'shocked')], acts: [...both('a', [0.1, 0.3])], cam: push(0, 4, 3.6, 17, 13, 40) };
// 13 he runs in and pulls them out one by one: kids run past the camera, Eli runs in
S[13] = { ...HALL, fx: FX_FIRE, props: [{ id: 'f1', type: 'fire', at: [-7, 0, -6], scale: 1.6 }, { id: 'f2', type: 'fire', at: [7, 0, -4], scale: 1.6 }], cast: [ELI({ at: [0, 12], rot: 180, face: 'determined' }), C('a', 'noob', -2, -6, 0, 'shocked'), C('b', 'lucy', 2, -8, 0, 'scared')], acts: [{ who: 'e', do: 'run', to: [0, -8], t: [0.05, 0.7] }, { who: 'a', do: 'run', to: [-2, 14], t: [0.25, 1] }, { who: 'b', do: 'run', to: [2, 14], t: [0.35, 1] }], cam: cam([3, 6, 18], [3, 6.5, 16], [0, 3.4, 0], 44) };
// 14 the very last one was Mason: Eli helps Mason walk out (two-shot, follow)
S[14] = { ...HALL, fx: FX_FIRE, props: [{ id: 'f1', type: 'fire', at: [-7, 0, -6], scale: 1.6 }], cast: [ELI({ at: [-1.2, -4], face: 'determined' }), MASON({ at: [1.2, -4], face: 'sad' })], acts: [{ who: 'e', do: 'walk', to: [-1.2, 6], t: [0.05, 1] }, { who: 'm', do: 'walk', to: [1.2, 6], t: [0.05, 1] }, arm('e', -1.2, -0.9, [0.05, 0.2])], cam: cam([0.5, 6, 19], [0.5, 5.6, 16], [0, 3.6, 0], 40, [0, 3.6, 6]) };
// 15 he looks up: his number changes (0 -> infinity) outside, low angle
S[15] = { ...FIELD, fx: FX_WIN, props: [{ id: 'f4', type: 'smoke', at: [10, 20, -30], scale: 4 }], cast: [ELI({ at: [0, 6], face: 'surprised', counterKeys: [[0.65, 'Hinf']] })], acts: [{ who: 'e', do: 'lookup', t: [0.2, 1], hold: true }], cam: low(0, 6, 4.2, 15, 44) };
// 16 infinity: Eli in front, Mason and the kids cheer behind him (pull-out)
S[16] = { ...FIELD, fx: FX_WIN, cast: [ELI({ at: [0, 6], counter: 'Hinf', face: 'happy' }), MASON({ at: [-3.2, 3], face: 'laugh' }), C('a', 'lucy', 3.2, 3, 0, 'laugh', { counter: 'H67' }), C('b', 'noob', -6, 1, 10, 'laugh', { counter: 'H45' }), C('c', 'beanie', 6, 1, -10, 'laugh', { counter: 'H12' })], acts: [...both('m', [0.3, 0.5]), ...both('a', [0.35, 0.55]), ...both('b', [0.4, 0.6]), ...both('c', [0.45, 0.65])], cam: pull(0, 6, 4.2, 13, 22, 40) };

// indoor rooms are white: keep the glow off the walls (high bloom threshold), warm embers for the fire scenes
const IN = (fx) => ({ ...fx, bloom: Math.min(fx.bloom, 0.18), bloomThreshold: 0.97 });
const FX_FIRE_IN = { bloom: 0.3, bloomThreshold: 0.93, vignette: 0.45, grain: 0.05, sat: 1.12, contrast: 1.1, tint: [1.1, 0.96, 0.86], sparkles: { color: '#ff9a40', count: 140, size: 0.45, speed: 1.4 } };
S.forEach((s, i) => { if (s.loc === 'hallway' || s.loc === 'lilyroom') s.fx = (i >= 12 && i <= 14) ? FX_FIRE_IN : IN(s.fx); });
S[5].cast[1] = { ...S[5].cast[1], scale: 0.5 }; S[6].cast[0] = { ...S[6].cast[0], scale: 0.5 };
// ---- indoor sets are small: shift the whole shot back (dz) and keep the camera inside the room ----
const INDOOR = { hallway: [-8, 16], classroom: [-8, 16], library: [-8, 16], lilyroom: [-7, 11.5] };
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
const shots = S.map((s, i) => ({ line: i, dur: +(slot(i) + 0.3).toFixed(3), props: [], acts: [], monsters: [], ...s, line: i }));
fs.writeFileSync(path.join(OUT, 'shotspec.json'), JSON.stringify({ id: ID, shots }, null, 1));
console.log(shots.length + ' shots, ' + shots.reduce((a, s) => a + s.dur, 0).toFixed(1) + ' s');
