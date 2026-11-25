// Shot specs for "The First Word You Say Becomes Your Superpower" (one shot per script line, 41 lines).
// Camera rules (owner, 2026-11-23): mediums and wides by default, varied angles, almost every shot moves. Lead-in 0.7 s is inside shot 0.
import fs from 'fs'; import path from 'path';
const ID = '2026-11-25-story-08', OUT = path.join('output', ID);
const narr = fs.readdirSync(OUT).filter(f => /^narration-.*\.json$/.test(f)).map(f => path.join(OUT, f)).sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
const T = JSON.parse(fs.readFileSync(narr, 'utf8')).times;
const script = JSON.parse(fs.readFileSync('scripts/' + ID + '.v1.json', 'utf8'));
const total = T[T.length - 1].end + (script.tail_hold ?? 0.8);
const slot = i => (i + 1 < T.length ? T[i + 1].start : total) - (i === 0 ? 0 : T[i].start);

const FIELD = { loc: 'field', light: 'day', exposure: 0.95 };
const HALL = { loc: 'hallway', light: 'day', exposure: 0.8 };
const CLASS = { loc: 'classroom', light: 'day', exposure: 0.8, boardText: 'DAY 7' };
const HOUSE = { loc: 'house', light: 'sunset', time: 'evening', exposure: 0.9 };
const HOUSEN = { loc: 'house', light: 'day', time: 'day', exposure: 1.0, dx: 9 };   // dx: stage to the right of the table so nothing hides behind it
const LROOM = { loc: 'lilyroom', light: 'sunset', exposure: 0.42 };
const H = { rex: 5.4, marcus: 5.1, jada: 4.7, leo: 4.4, lily: 4.0, gwen: 5.3, zoe: 5.0, vince: 5.6, kida: 3.6, kidb: 3.5, momn: 5.0, ollie: 5.4 };
const C = (id, who, x, z, rot = 0, face = 'neutral', o = {}) => ({ id, who, at: [x, z], rot, face, ...o });
const arm = (who, x, z, t, a = 'R') => ({ who, do: 'arm', arm: a, x, z, t, hold: true });
const face = (who, kind, t) => ({ who, do: 'face', kind, t });

// ---- camera helpers: every camera moves ----
const cam = (A, B, look, fov = 38, lookTo) => ({ from: A, to: B, look, lookTo: lookTo || look, fov });
const push = (x, z, h = 3.0, d0 = 17, d1 = 13, fov = 36, dx = 1.2) => cam([x + dx, h + 2.2, z + d0], [x + dx * 0.4, h + 1.7, z + d1], [x, h, z], fov);          // slow push in (medium)
const pull = (x, z, h = 3.0, d0 = 12, d1 = 17, fov = 36, dx = 0.6) => cam([x + dx, h + 1.8, z + d0], [x + dx * 2, h + 2.4, z + d1], [x, h, z], fov);              // slow pull out
const drift = (x, z, h = 3.0, d = 15, side = 4, fov = 36) => cam([x - side, h + 2.0, z + d], [x + side, h + 2.0, z + d], [x, h, z], fov);                           // lateral dolly
const low = (x, z, h = 3.4, d = 14, fov = 40) => cam([x + 1.5, 1.2, z + d], [x + 0.5, 2.0, z + d - 1.8], [x, h + 0.4, z], fov);                                     // low angle, hero
const high = (x, z, h = 2.6, d = 13, fov = 40) => cam([x + 1.5, 12, z + d], [x - 0.5, 11, z + d - 1.5], [x, h, z], fov);                                            // high angle, weak
const wide = (x, z, h = 3.2, d = 27, fov = 44) => cam([x + 6, 10, z + d], [x + 2, 9, z + d - 3], [x, h, z], fov);                                                     // establishing
const follow = (x0, x1, z, h = 3.0, d = 16, fov = 38) => cam([x0, h + 2, z + d], [x1, h + 2, z + d], [x0 + 2, h, z], fov, [x1 + 2, h, z]);                         // tracking pan
const ins = (x, y, z, d = 7, fov = 34) => cam([x + 0.8, y + 1.6, z + d], [x + 0.2, y + 1.0, z + d - 1.5], [x, y, z], fov);                                              // insert on an object

const kids = (ids, xs, z, rot = 180, faceK = 'neutral') => ids.map((w, i) => C('k' + i, w, xs[i], z + (i % 2) * 2.5, rot, faceK));
const S = [];
// 0  title: school field wide, powers on show (Jada floats), push in
S[0] = { ...FIELD, cast: [C('j', 'jada', -5, 5, 20, 'happy', { y: 4.2 }), C('l', 'leo', 5, 5, -20, 'happy'), C('r', 'rex', 0, 9, 0, 'smirk'), C('m', 'marcus', -9, 12, 20, 'sad'), ...kids(['zoe', 'vince'], [9, -9], 8, 0, 'happy')],
  acts: [], cam: cam([2, 9, 32], [0, 7, 22], [0, 3.6, 5], 44) };
// 1  Jada floats: low angle rising with her
S[1] = { ...FIELD, cast: [C('j', 'jada', 0, 5, 0, 'happy', { y: 5.5 })], acts: [arm('j', -1.0, 1.2, [0, 0.4], 'L'), arm('j', -1.0, -1.2, [0, 0.4], 'R')], cam: cam([2, 1.2, 19], [-1.5, 4.5, 17], [0, 7.5, 5], 40, [0, 8.4, 5]) };
// 2  Leo untouchable: kids try to poke, bounce off
S[2] = { ...FIELD, cast: [C('l', 'leo', 0, 5, 0, 'smirk'), C('a', 'zoe', -4, 9, -150, 'confused'), C('b', 'vince', 4, 9, 150, 'confused')], acts: [arm('a', -2.6, 0.2, [0.2, 0.5]), arm('b', -2.6, 0.2, [0.3, 0.6], 'L')], cam: drift(0, 6, 2.8, 16, 3) };
// 3  parents whisper to a baby: kitchen, two-shot
S[3] = { ...HOUSE, cast: [C('p', 'momn', -1.8, 1, 90, 'happy'), C('b', 'kida', 1.8, 1, -90, 'happy', { scale: 0.5 })], acts: [], cam: pull(0, 1, 3.0, 12, 16, 38) };
// 4  Rex runs across the field: tracking pan
S[4] = { ...FIELD, cast: [C('r', 'rex', -9, 6, 90, 'smirk')], acts: [{ who: 'r', do: 'run', to: [9, 6], t: [0.1, 0.9] }], cam: follow(-9, 9, 6, 3.0, 16) };
// 5  the race: whole class vs Rex far ahead (wide, lateral)
S[5] = { ...FIELD, cast: [C('r', 'rex', -8, 4, 90, 'happy'), ...['zoe', 'vince', 'leo', 'jada'].map((w, i) => C('k' + i, w, -8, 7 + i * 2.4, 90, 'determined'))],
  acts: [{ who: 'r', do: 'run', to: [14, 4], t: [0.05, 0.85] }, ...['k0', 'k1', 'k2', 'k3'].map((k, i) => ({ who: k, do: 'run', to: [3 + i, 7 + i * 2.4], t: [0.05, 0.85] }))], cam: cam([-6, 9, 26], [8, 9, 26], [0, 3, 8], 44, [10, 3, 8]) };
// 6  "Then there was Marcus.": Marcus alone, far away, wide push
S[6] = { ...HALL, cast: [C('m', 'marcus', 0, 4, 0, 'sad')], acts: [{ who: 'm', do: 'lookdown', t: [0.2, 1], hold: true }], cam: cam([0, 6.5, 30], [0, 5.6, 21], [0, 3, 4], 40) };
// 7  toddler's first word: mum and a tiny boy, med
S[7] = { ...HOUSE, cast: [C('p', 'momn', -1.8, 1, 90, 'surprised'), C('b', 'kidb', 1.6, 1.5, -90, 'happy', { scale: 0.5 })], acts: [], cam: push(0, 1, 3.0, 15, 12, 38) };
// 8  mine: Marcus points and a book flies to him
S[8] = { ...HALL, props: [{ id: 'bk', type: 'book', at: [4.5, 3.6, 0] }], cast: [C('m', 'marcus', -1.5, 3, 0, 'neutral')], acts: [arm('m', -2.8, 0, [0.1, 0.35], 'R'), { do: 'move', prop: 'bk', from: [4.5, 3.6, 0], to: [-0.2, 3.8, 3.8], t: [0.4, 0.9], ease: 'in' }], cam: push(0, 3, 3.0, 17, 13, 36) };
// 9  everyone scared: kids back away, wide
S[9] = { ...HALL, cast: [C('m', 'marcus', 0, 3, 0, 'sad'), ...kids(['zoe', 'vince', 'leo'], [-3, 3, 0], 9, 0, 'scared')], acts: [{ who: 'k0', do: 'walk', to: [-3, 20], t: [0.2, 1] }, { who: 'k1', do: 'walk', to: [3, 20], t: [0.2, 1] }, { who: 'k2', do: 'walk', to: [0, 22], t: [0.2, 1] }], cam: pull(0, 8, 3.0, 12, 19, 40) };
// 10 greediest kid alive: high angle on a lonely Marcus, kids point from the sides
S[10] = { ...HALL, cast: [C('m', 'marcus', 0, 3, 0, 'sad'), C('a', 'zoe', -4, 5, 40, 'happy'), C('b', 'vince', 4, 6, -40, 'happy')], acts: [{ who: 'm', do: 'lookdown', t: [0.1, 1], hold: true }, arm('a', -2.6, 0.5, [0.2, 0.5]), arm('b', -2.6, 0.5, [0.3, 0.6], 'L')], cam: high(0, 3, 2.4, 14) };
// 11 kids joke: two-shot, drift
S[11] = { ...HALL, cast: [C('a', 'zoe', -2, 3, 20, 'laugh'), C('b', 'vince', 2, 3, -20, 'smirk'), C('m', 'marcus', 6, 12, 180, 'sad')], acts: [], cam: drift(0, 3, 3.0, 14, 3) };
// 12 Marcus never takes anything: walks past a lunch tray
S[12] = { ...HALL, props: [{ id: 'tr', type: 'lunchtray', at: [3.2, 3.0, 4], rot: 0 }], cast: [C('m', 'marcus', -8, 4, 90, 'neutral')], acts: [{ who: 'm', do: 'walk', to: [8, 4], t: [0.05, 0.9] }], cam: follow(-8, 8, 4, 3.0, 15) };
// 13 worn shoes, tired, cough: low tilt-up
S[13] = { ...HALL, cast: [C('m', 'marcus', 0, 3, 0, 'sad')], acts: [{ who: 'm', do: 'shiver', t: [0.3, 1], hold: true }, { who: 'm', do: 'lookdown', t: [0.1, 1], hold: true }], cam: cam([1.2, 0.9, 17], [0.6, 3.8, 19], [0, 0.6, 3], 38, [0, 3.2, 3]) };
// 14 Rex walks up: over-the-shoulder track
S[14] = { ...HALL, cast: [C('m', 'marcus', 0, -1, 0, 'sad'), C('r', 'rex', 0, 12, 180, 'neutral')], acts: [{ who: 'r', do: 'walk', to: [0, 4.5], t: [0.1, 0.9] }, { who: 'm', do: 'lookdown', t: [0, 1], hold: true }], cam: cam([2.5, 7.5, 22], [1.2, 7.0, 15], [0, 3.6, 3], 38) };
// 15 Rex asks: two-shot, medium
S[15] = { ...HALL, cast: [C('r', 'rex', -1.5, 3, -75, 'confused'), C('m', 'marcus', 1.5, 3, 75, 'sad')], acts: [arm('r', -2.6, 0.9, [0.2, 0.5])], cam: push(0, 3, 3.0, 17, 13.5, 36) };
// 16 Marcus answers: medium, a get-well card pokes out of his bag (the clue)
S[16] = { ...HALL, props: [{ id: 'cd', type: 'slip', at: [1.8, 2.3, 0.6], rot: 20, scale: 0.9 }], cast: [C('m', 'marcus', 0, 3, 0, 'sad')], acts: [{ who: 'm', do: 'lookdown', t: [0.1, 0.6] }, { who: 'm', do: 'lookup', t: [0.6, 1], hold: true }], cam: push(0, 3, 3.0, 15, 12, 38) };
// 17 walks away coughing, dolly out
S[17] = { ...HALL, cast: [C('m', 'marcus', 0, 4, 180, 'sad'), C('r', 'rex', 0, 12, 0, 'confused')], acts: [{ who: 'm', do: 'walk', to: [0, -12], t: [0.1, 1] }], cam: cam([0, 6, 18], [0, 8.5, 28], [0, 3.2, 4], 40) };
// 18 shoes missing: Rex stares at an empty bench, gym
S[18] = { ...FIELD, cast: [C('r', 'rex', 0, 5, 0, 'shocked')], acts: [{ who: 'r', do: 'lookdown', t: [0.1, 0.6], hold: true }], cam: push(0, 5, 3.0, 18, 13, 38) };
// 19 everyone turns to Marcus: wide pan
S[19] = { ...FIELD, cast: [C('m', 'marcus', 9, 6, -90, 'sad'), ...kids(['zoe', 'vince', 'leo', 'jada'], [-6, -3, 0, 3], 6, 90, 'angry'), C('r', 'rex', -2, 11, 90, 'angry')], acts: [], cam: cam([-12, 7, 24], [0, 7, 24], [0, 3.2, 6], 44, [8, 3.2, 6]) };
// 20 Rex shouts: low angle, pointing
S[20] = { ...FIELD, cast: [C('r', 'rex', 0, 5, 0, 'angry')], acts: [arm('r', -2.9, 0.2, [0.1, 0.35]), { who: 'r', do: 'tremble', t: [0.3, 1] }], cam: low(0, 5, 3.6, 14) };
// 21 principal takes Marcus away: tracking
S[21] = { ...HALL, cast: [C('g', 'gwen', -8, 4, 90, 'angry'), C('m', 'marcus', -10.4, 4, 90, 'sad')], acts: [{ who: 'g', do: 'walk', to: [10, 4], t: [0.05, 0.95] }, { who: 'm', do: 'walk', to: [7.6, 4], t: [0.05, 0.95] }, { who: 'm', do: 'lookdown', t: [0, 1], hold: true }], cam: follow(-8, 8, 4, 3.0, 17) };
// 22 shoes found in another locker; Marcus alone, nobody says sorry
S[22] = { ...HALL, props: [{ id: 'sg', type: 'sign', color: 'LOCKER 14', at: [-4, 3.4, 0], rot: 0, scale: 1.1 }], cast: [C('k', 'leo', -4, 4, 0, 'surprised'), C('m', 'marcus', 4, 8, 180, 'sad')], acts: [{ who: 'm', do: 'walk', to: [4, -10], t: [0.3, 1] }], cam: drift(0, 5, 3.0, 17, 4) };
// 23 Rex can't stop thinking: high angle, slow push
S[23] = { ...HALL, cast: [C('r', 'rex', 0, 3, 0, 'guilty')], acts: [{ who: 'r', do: 'lookdown', t: [0.1, 1], hold: true }], cam: high(0, 3, 2.6, 14) };
// 24 cough, stairs: Marcus leaning, follow
S[24] = { ...HALL, cast: [C('m', 'marcus', -5, 4, 90, 'sad')], acts: [{ who: 'm', do: 'walk', to: [3, 4], t: [0.05, 1] }, { who: 'm', do: 'tremble', t: [0.1, 1] }], cam: cam([-5, 5.2, 21], [3, 5.2, 21], [-5, 3, 4], 40, [3, 3, 4]) };
// 25 empty desk: DAY 7 on the board
S[25] = { ...CLASS, cast: [], acts: [], cam: cam([5, 7.5, 19], [1, 6.0, 15], [0, 2.4, 0], 42) };
// 26 hook question: Rex looks at the empty seat
S[26] = { ...CLASS, cast: [C('r', 'rex', 0, 4, 0, 'worried')], acts: [{ who: 'r', do: 'lookside', deg: 35, t: [0.2, 1], hold: true }], cam: pull(0, 4, 3.0, 13, 18, 38) };
// 27 night: Rex walks to Marcus's house, wide
S[27] = { ...HOUSEN, cast: [C('r', 'rex', -6, 10, 90, 'nervous')], acts: [{ who: 'r', do: 'walk', to: [4, 10], t: [0.05, 1] }], cam: wide(0, 8, 3.0, 24) };
// 28 sister laughing in bed (seen from the doorway, wide-medium)
S[28] = { ...LROOM, cast: [C('s', 'lily', 0, 2, 0, 'laugh')], acts: [{ who: 's', do: 'sit', seat: 1.4, t: [0, 1], hold: true }], cam: push(0, 2, 2.6, 17, 13, 40) };
// 29 old get-well card on the wall: insert
S[29] = { ...LROOM, props: [{ id: 'gw', type: 'sign', color: 'GET WELL|SOON', at: [0, 0, -2.5], rot: 0, scale: 1.5 }], cast: [C('s', 'lily', 4, 3, -30, 'happy')], acts: [{ who: 's', do: 'sit', seat: 1.4, t: [0, 1], hold: true }], cam: ins(0, 5.2, -2.5, 14, 36) };
// 30 doctors' deadline: sign insert, cough counter feel
S[30] = { ...LROOM, props: [{ id: 'dc', type: 'sign', color: 'UNTIL|WINTER', at: [0, 0, -2.5], rot: 0, scale: 1.6 }], cast: [], acts: [], cam: ins(0, 5.2, -2.5, 12, 38) };
// 31 Marcus coughs, pale, at the doorway: low
S[31] = { ...HOUSEN, cast: [C('m', 'marcus', 0, 3, 0, 'sad')], acts: [{ who: 'm', do: 'shiver', t: [0.1, 1], hold: true }, { who: 'm', do: 'lookdown', t: [0.2, 1], hold: true }], cam: low(0, 3, 3.0, 14, 40) };
// 32 Rex knocks, Marcus: go away, two-shot
S[32] = { ...HOUSEN, cast: [C('r', 'rex', -1.5, 3, -75, 'worried'), C('m', 'marcus', 1.5, 3, 75, 'sad')], acts: [arm('r', -1.2, 0.6, [0.1, 0.4]), { who: 'm', do: 'shiver', t: [0, 1], hold: true }], cam: drift(0, 3, 3.0, 15, 3) };
// 33 Rex: give it to me: low, determined
S[33] = { ...HOUSEN, cast: [C('r', 'rex', 0, 3, 0, 'determined')], acts: [], cam: low(0, 3, 3.4, 14) };
// 34 Marcus: you cannot outrun it: high angle, weak
S[34] = { ...HOUSEN, cast: [C('m', 'marcus', 0, 3, 0, 'sad')], acts: [{ who: 'm', do: 'shiver', t: [0, 1], hold: true }], cam: high(0, 3, 2.4, 14) };
// 35 Rex smiles: watch me, push then pull
S[35] = { ...HOUSEN, cast: [C('r', 'rex', 0, 3, 0, 'smirk')], acts: [], cam: push(0, 3, 3.2, 17, 12.5, 36) };
// 36 Marcus gives it back, the cough hits Rex and he runs: tracking, wide
S[36] = { ...FIELD, cast: [C('r', 'rex', -9, 6, 90, 'determined')], acts: [{ who: 'r', do: 'run', to: [12, 6], t: [0.25, 0.95] }], cam: follow(-9, 9, 6, 3.0, 17) };
// 37 faster than ever: the smoky sickness falls behind and fades
S[37] = { ...FIELD, cast: [C('r', 'rex', -10, 6, 90, 'happy')], monsters: [{ id: 'sk', at: [-8, 6], rot: 90, h: 'waist', eyes: 0.6, dissolve: [0.45, 0.95], creep: { from: [-16, 6], t: [0, 0.4] } }], acts: [{ who: 'r', do: 'run', to: [14, 6], t: [0.0, 0.95] }], cam: cam([-8, 7, 27], [8, 7, 27], [0, 3, 6], 44, [10, 3, 6]) };
// 38 only took his sister's pain: Marcus and the healthy little sister, warm
S[38] = { ...LROOM, cast: [C('m', 'marcus', -1.6, 3, 70, 'happy'), C('s', 'lily', 1.8, 3, -70, 'laugh')], acts: [], cam: push(0, 3, 2.8, 17, 13, 38) };
// 39 Rex has something worth running for: three together, wide pull-out at sunset
S[39] = { ...FIELD, light: 'day', exposure: 1.05, cast: [C('r', 'rex', -2.6, 4, 20, 'happy'), C('m', 'marcus', 0, 4, 0, 'happy'), C('s', 'lily', 2.4, 4, -20, 'laugh')], acts: [], cam: cam([2, 5.5, 14], [5, 7.5, 26], [0, 3.0, 4], 42) };
// 40 Marcus points at Rex: mine (final), slow orbit
S[40] = { ...FIELD, light: 'day', exposure: 1.05, cast: [C('r', 'rex', 2.2, 3, -75, 'surprised'), C('m', 'marcus', -2.2, 3, 75, 'happy')], acts: [arm('m', -2.7, 0.2, [0.3, 0.6])], cam: cam([-6, 5.5, 15], [6, 5.5, 15], [0, 3.2, 3], 38) };

// ---- indoor sets are small: shift the whole shot back (dz) and keep the camera inside the room ----
const INDOOR = { hallway: [-8, 16], classroom: [-8, 16], library: [-8, 16], lilyroom: [-7, 11.5], house: [8, 30] };
const shiftX = (s) => {
  const dx = s.dx || 0; if (!dx) return s;
  const X = (a) => a && [a[0] + dx, ...a.slice(1)];
  s.cast = s.cast.map(c => ({ ...c, at: [c.at[0] + dx, c.at[1]] }));
  s.acts = s.acts.map(a => (a.to ? { ...a, to: [a.to[0] + dx, a.to[1]] } : a));
  s.cam = { ...s.cam, from: X(s.cam.from), to: X(s.cam.to), look: X(s.cam.look), ...(s.cam.lookTo ? { lookTo: X(s.cam.lookTo) } : {}) };
  delete s.dx; return s;
};
S.forEach((s, i) => { S[i] = shiftX(s); });
const shiftShot = (s) => {
  const r = INDOOR[s.loc]; if (!r) return s; const [dz, zmax] = r;
  const P = (a) => a && [a[0], a[1], Math.min(a[2] + dz, zmax)];
  s.cast = (s.cast || []).map(c => ({ ...c, at: [c.at[0], c.at[1] + dz] }));
  s.props = (s.props || []).map(p => ({ ...p, at: [p.at[0], p.at[1], p.at[2] + dz], ...(p.from ? {} : {}) }));
  s.acts = (s.acts || []).map(a => ({ ...a, ...(a.to ? { to: [a.to[0], a.to[1] + dz] } : {}), ...(a.do === 'move' ? { from: [a.from[0], a.from[1], a.from[2] + dz], to: [a.to[0], a.to[1], a.to[2] + dz] } : {}) }));
  s.monsters = (s.monsters || []).map(m => ({ ...m, at: [m.at[0], m.at[1] + dz] }));
  const c = s.cam; s.cam = { ...c, from: P(c.from), to: P(c.to), look: [c.look[0], c.look[1], c.look[2] + dz], ...(c.lookTo ? { lookTo: [c.lookTo[0], c.lookTo[1], c.lookTo[2] + dz] } : {}) };
  return s;
};
S.forEach((s, i) => { S[i] = shiftShot(s); });
const shots = S.map((s, i) => ({ line: i, dur: +(slot(i) + 0.3).toFixed(3), props: [], acts: [], monsters: [], ...s, line: i }));
fs.writeFileSync(path.join(OUT, 'shotspec.json'), JSON.stringify({ id: ID, shots }, null, 1));
console.log(shots.length + ' shots, ' + shots.reduce((a, s) => a + s.dur, 0).toFixed(1) + ' s');
