// Shot specs for "In This World, A Heart On Your Chest Counts Who Would Miss You" (one shot per script line, 17 lines).
// node render/specs/2026-11-23-story-06.mjs -> output/2026-11-23-story-06/shotspec.json
import fs from 'fs'; import path from 'path';
const ID = '2026-11-23-story-06', OUT = path.join('output', ID);
const narr = fs.readdirSync(OUT).filter(f => /^narration-.*\.json$/.test(f)).map(f => path.join(OUT, f)).sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
const T = JSON.parse(fs.readFileSync(narr, 'utf8')).times;
const script = JSON.parse(fs.readFileSync('scripts/' + ID + '.v1.json', 'utf8'));
const total = T[T.length - 1].end + (script.tail_hold ?? 0.8);
const slot = i => (i + 1 < T.length ? T[i + 1].start : total) - (i === 0 ? 0 : T[i].start);
const cam = (A, B, look, fov = 40, lookTo) => ({ from: A, to: B || A, look, lookTo, fov });
const face = (who, kind, t) => ({ who, do: 'face', kind, t });
const sitA = (ids) => ids.map(k => ({ who: k, do: 'sit', seat: 1.75, t: [0, 1], hold: true }));
const HALL = { loc: 'hallway', light: 'day', exposure: 0.8 };
const LIB = { loc: 'library', light: 'day', exposure: 0.8 };
const HOUSE = { loc: 'house', light: 'sunset', time: 'evening', exposure: 0.9 };
const FOREST = { loc: 'forest', light: 'day', exposure: 0.95 };
const OLLIE = (o = {}) => ({ id: 'ollie', who: 'ollie', at: [0, 4], rot: 0, face: 'neutral', ...o });
const REX = (o = {}) => ({ id: 'rex', who: 'rex', at: [0, 4], rot: 0, face: 'smirk', ...o });
const JADA = (o = {}) => ({ id: 'jada', who: 'jada', at: [0, 4], rot: 0, face: 'happy', ...o });
// head heights: ollie 5.6 (scale 1.05), rex 5.5, jada 4.9
const fc = (cx, cz, H, d, fov, dx = 0.3) => cam([cx + dx, H + 0.1, cz + d], [cx + dx - 0.1, H + 0.1, cz + d - 0.5], [cx, H - 0.5, cz], fov);
const crowdWho = ['stu1', 'stu2', 'stu3', 'stu4', 'stu5', 'c1', 'c2', 'c3'];
const S = [];
S[0] = { ...HALL, cast: [OLLIE({ at: [0, 3], face: 'sad' }), ...[[-3.2, 9], [3.4, 11], [-2.6, 14], [2.8, 17]].map((p, i) => ({ id: 'k' + i, who: crowdWho[i], at: p, rot: 180, face: 'happy' }))],
  acts: [{ who: 'ollie', do: 'lookdown', t: [0, 1], hold: true }], cam: cam([0.4, 6.4, 13], [0.3, 6.1, 11.5], [0, 4.6, 3], 40) };
S[1] = { ...HALL, cast: [OLLIE({ at: [0, 3], face: 'sad' })], acts: [{ who: 'ollie', do: 'lookdown', t: [0, 1], hold: true }], cam: fc(0, 3, 5.6, 7.5, 30) };
S[2] = { ...LIB, cast: [OLLIE({ at: [0, 2], face: 'sad' })], acts: [{ who: 'ollie', do: 'sit', seat: 1.75, t: [0, 1], hold: true }, { who: 'ollie', do: 'lookdown', t: [0, 1], hold: true }], cam: cam([3.6, 5.8, 11], [3.4, 5.6, 10.4], [0, 3.8, 2], 42) };
S[3] = { ...HALL, cast: [REX({ at: [0, 4] })], acts: [], cam: fc(0, 4, 5.3, 7.5, 30) };
S[4] = { ...HALL, cast: [REX({ at: [0, 3] }), ...[[-3.2, 7, 60], [3.2, 7, -60], [-2.4, 11, 20], [2.6, 12, -20]].map((p, i) => ({ id: 'k' + i, who: crowdWho[i], at: [p[0], p[1]], rot: 180 + p[2] * 0, face: 'happy' }))],
  acts: [{ who: 'k0', do: 'walk', to: [-3.2, -18], t: [0.5, 1] }, { who: 'k1', do: 'walk', to: [3.2, -18], t: [0.55, 1] }, { who: 'k2', do: 'walk', to: [-2.4, -18], t: [0.6, 1] }, { who: 'k3', do: 'walk', to: [2.6, -18], t: [0.65, 1] }, face('rex', 'sad', 0.7)],
  cam: cam([0.5, 6.6, 15], [0.4, 6.3, 13.5], [0, 4.6, 3], 40) };
S[5] = { ...HALL, cast: [JADA({ at: [0, 4], face: 'happy' })], acts: [{ who: 'jada', do: 'wave', arm: 'R', t: [0.3, 0.9], hold: true }], cam: fc(0, 4, 4.7, 7, 30) };
S[6] = { ...HALL, cast: [REX({ at: [-1.0, 4], face: 'smirk' }), JADA({ at: [1.2, 4.5], face: 'neutral', rot: -20 })],
  acts: [{ who: 'rex', do: 'arm', arm: 'R', x: -2.6, z: 0.9, t: [0.2, 0.5], hold: true }, { who: 'rex', do: 'arm', arm: 'L', x: -2.6, z: -0.9, t: [0.2, 0.5], hold: true }], cam: cam([0.6, 6.0, 14], [0.5, 5.9, 13.4], [0.3, 4.6, 4], 44) };
S[7] = { ...LIB, cast: [OLLIE({ at: [0, 2], face: 'neutral' })], acts: [{ who: 'ollie', do: 'sit', seat: 1.75, t: [0, 1], hold: true }, { who: 'ollie', do: 'lookdown', t: [0, 1], hold: true }], cam: cam([2.4, 5.6, 10], [2.2, 5.5, 9.6], [0, 3.8, 2], 36) };
S[8] = { ...HOUSE, cast: [OLLIE({ at: [0, 3], face: 'shocked' })], acts: [], cam: fc(0, 3, 5.6, 7, 30) };
S[9] = { ...HOUSE, cast: [OLLIE({ at: [0, 3], face: 'thinking' })], acts: [{ who: 'ollie', do: 'lookup', t: [0.2, 1], hold: true }], cam: fc(0, 3, 5.6, 7.5, 30) };
S[10] = { ...HALL, cast: [OLLIE({ at: [-1.0, 2], face: 'happy' }), JADA({ at: [1.0, 2], face: 'happy', rot: 0 })], acts: [], cam: cam([0.4, 6.0, 12], [0.3, 5.9, 11.4], [0, 4.0, 2], 40) };
S[11] = { ...FOREST, light: 'day', cast: [OLLIE({ at: [-1.6, 4], face: 'laugh' }), JADA({ at: [1.6, 4], face: 'happy' })],
  acts: [{ who: 'ollie', do: 'walk', to: [-1.6, -6], t: [0, 1] }, { who: 'jada', do: 'walk', to: [1.6, -6], t: [0, 1] }], cam: cam([0.4, 5.2, 16], [0.3, 5.0, 12], [0, 4.4, 2], 44) };
S[12] = { ...FOREST, cast: [OLLIE({ at: [0, 4], face: 'laugh' })], acts: [], cam: fc(0, 4, 5.6, 7.5, 30) };
S[13] = { ...HALL, cast: [OLLIE({ at: [-1.0, 3], face: 'happy' }), JADA({ at: [1.0, 3], face: 'happy', rot: -30 })],
  acts: [{ who: 'jada', do: 'arm', arm: 'L', x: -1.4, z: 0.5, t: [0.3, 0.6], hold: true }], cam: cam([0.4, 6.2, 11], [0.3, 6.0, 10.4], [0, 4.6, 3], 38) };
S[14] = { ...LIB, cast: [JADA({ at: [0, 4], face: 'starstruck' })], acts: [], cam: fc(0, 4, 4.7, 7, 28) };
S[15] = { ...HALL, cast: [OLLIE({ at: [-1.0, 3], face: 'shocked' }), JADA({ at: [1.0, 3], face: 'worried' })],
  acts: [{ who: 'ollie', do: 'gaze', gx: 0.8, gy: 0, t: 0.4 }], cam: cam([0.4, 6.0, 12], [0.3, 5.9, 11.4], [0, 4.4, 3], 40) };
S[16] = { ...FOREST, cast: [OLLIE({ at: [-1.0, 3], face: 'happy' }), JADA({ at: [1.0, 3], face: 'laugh' })], acts: [...sitA(['ollie', 'jada'])], cam: cam([0.6, 6.4, 15], [0.4, 6.1, 13.4], [0, 3.8, 3], 42) };
const shots = S.map((s, i) => ({ line: i, dur: +(slot(i) + 0.3).toFixed(3), props: [], acts: [], monsters: [], ...s, line: i }));
fs.writeFileSync(path.join(OUT, 'shotspec.json'), JSON.stringify({ id: ID, shots }, null, 1));
console.log(`${shots.length} shots, ${shots.reduce((a, s) => a + s.dur, 0).toFixed(1)} s`);
