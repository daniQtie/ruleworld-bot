// Shot specs for "In This World, Every Step You Take Is Counted" (one shot per script line; 136 = 2nd part of line 36).
// node render/specs/2026-11-22-story-03.mjs -> output/2026-11-22-story-03/shotspec.json
import fs from 'fs'; import path from 'path';
import * as THREE from 'three';
const ID = '2026-11-22-story-03', OUT = path.join('output', ID);
const narr = fs.readdirSync(OUT).filter(f => /^narration-.*\.json$/.test(f)).map(f => path.join(OUT, f)).sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
const T = JSON.parse(fs.readFileSync(narr, 'utf8')).times;
const script = JSON.parse(fs.readFileSync(fs.readdirSync('scripts').filter(f => f.startsWith(ID) && /\.v\d+\.json$/.test(f) && !f.endsWith('.qa.json')).map(f => path.join('scripts', f)).sort((a, b) => +a.match(/v(\d+)/)[1] - +b.match(/v(\d+)/)[1]).pop(), 'utf8'));
const total = T[T.length - 1].end + (script.tail_hold ?? 0.8);
const slot = i => (i + 1 < T.length ? T[i + 1].start : total) - (i === 0 ? 0 : T[i].start);
const NW = JSON.parse(fs.readFileSync(narr, 'utf8')).words;
// fraction of shot i at which the k-th occurrence of `word` in line i starts (counters change exactly when the number is spoken)
const wf = (i, word, k = 0, lead = 0.05) => { const s0 = i === 0 ? 0 : T[i].start, d = slot(i) + 0.3; const ws = NW.filter(w => w.line === i && w.word.toLowerCase().replace(/[^a-z]/g, '') === word); const w = ws[k] || ws[0]; return Math.max(0, (w.start - lead - s0) / d); };
const speak = i => { const s0 = i === 0 ? 0 : T[i].start, d = slot(i) + 0.3; return [Math.max(0, (T[i].start - s0) / d), Math.min(1, (T[i].end - s0) / d)]; };

// ---- hill geometry (same as render/world.js) ----
const PATH = new THREE.CatmullRomCurve3([[0, 0, 40], [2, 0, 16], [8, 0, 2], [-6, 0, -14], [-7, 0, -30], [3, 0, -44], [0, 0, -53]].map(p => new THREE.Vector3(...p)));
const HZ = -60, HR = 70; const gy = (x, z) => { const r2 = x * x + (z - HZ) ** 2; const d = r2 < HR * HR ? 0.35 * Math.sqrt(HR * HR - r2) - 10.5 : -99; return Math.max(0, d); };
const on = (u, off = 0) => { const q = PATH.getPointAt(u), t = PATH.getTangentAt(u); const x = q.x + t.z * off, z = q.z - t.x * off; return { x, z, y: gy(x, z), dir: [t.x, t.z] }; };
// camera placed relative to a path point: ahead (+ along the path), side (+ to the walker's left), up
const camAt = (u, ahead, side, up, lookUp = 4, lookAhead = 0) => { const p = on(u), q = on(Math.min(1, Math.max(0, u + lookAhead / 100))); const [dx, dz] = p.dir;
  const pos = [p.x + dx * ahead - dz * side, p.y + up, p.z + dz * ahead + dx * side]; return { pos: [pos[0], Math.max(pos[1], gy(pos[0], pos[2]) + 1.2), pos[2]], look: [q.x, q.y + lookUp, q.z] }; };
const cam = (A, B, fov = 40) => ({ from: A.pos, to: (B || A).pos, look: A.look, lookTo: (B || A).look, fov });

const face = (who, kind, t) => ({ who, do: 'face', kind, t });
const gaze = (who, gx, gy2, t) => ({ who, do: 'gaze', gx, gy: gy2, t });
const keys = (pairs) => pairs;   // [[fraction, value], ...]
const HILLN = { loc: 'hill', light: 'night', fog: [25, 150, '#56677f'], ambient: ['#a9bbff', '#2a3448', 1.25], exposure: 1.35, lamp: 'off' };
const CITY = { loc: 'city', light: 'sunset' };
const Kai = (o = {}) => ({ id: 'kai', who: 'kai', counter: 62, face: 'neutral', ...o });
const Pell = (o = {}) => ({ id: 'pell', who: 'pell', counter: 900, face: 'neutral', ...o });
const BENCH_U = 0.5, STOP_U = 0.556, P_b = on(BENCH_U, 3.4);
const benchProps = [{ id: 'bench', type: 'bench', at: [P_b.x, P_b.z], rot: 120 }];
const signP = on(STOP_U + 0.004, -2.4);
const sign = { id: 'sign', type: 'sign', color: '45 TO|THE TOP', at: [signP.x, signP.z], rot: 160 };
const ferry = (at, rot = 0) => ({ id: 'ferry', type: 'ferry', at: [at[0], -0.4, at[1]], rot });
const S = [];

// 0 TITLE: "In this world, every step you take is counted."  close on a walker's chest: 1000 -> 999 as a foot lands
S[0] = { ...CITY, cast: [{ id: 'w', who: 'walker', at: [14, -10], rot: 180, counter: 1000, counterKeys: keys([[0.55, 999]]), face: 'neutral' }],
  acts: [{ who: 'w', do: 'walk', to: [14, -12], t: [0.3, 0.8] }],
  cam: { from: [14, 3.6, -14.2], to: [14, 3.9, -15.4], look: [14, 3.2, -10.5], lookTo: [14, 3.6, -12], fov: 34 } };
// 1 hook question: Kai's 62, tilt up to the dark lighthouse
S[1] = { ...HILLN, cast: [Kai({ u: 0.035, face: 'scared', gaze: [0, -0.8] })], acts: [{ who: 'kai', do: 'lookup', t: [0.3, 1], hold: true }],
  cam: { keys: [{ t: 0, pos: [on(0.035).x + 0.9, 3.4, on(0.035).z - 3.0], look: [on(0.035).x, 3.0, on(0.035).z], fov: 30 }, { t: 0.55, cut: true, pos: [on(0.035).x + 1.0, 3.6, on(0.035).z + 2.6], look: [0, 20, -40], fov: 46 }, { t: 1, pos: [on(0.035).x + 1.2, 3.8, on(0.035).z + 4.2], look: [0, 30, -55], fov: 46 }] } };
// 2-5 THE RULE in town at dusk
const townCast = [{ id: 'w1', who: 'walker', at: [12, 4], rot: 180, counter: 214 }, { id: 'w2', who: 'listener', at: [17, -2], rot: 180, counter: 640 }, { id: 'w3', who: 'neighbor', at: [20, 8], rot: 180, counter: 85 }];
S[2] = { ...CITY, cast: townCast, acts: townCast.map((c, i) => ({ who: c.id, do: 'walk', to: [c.at[0], c.at[1] - 7], t: [0.05 * i, 1] })), cam: { from: [16, 6, 14], to: [16, 5.4, 11], look: [16, 3.5, -2], fov: 46 } };
S[3] = { ...CITY, cast: [{ ...townCast[0], counterKeys: keys([[0.3, 213], [0.6, 212], [0.9, 211]]) }], acts: [{ who: 'w1', do: 'walk', to: [12, -1], t: [0, 1] }],
  cam: { from: [12, 3.6, -0.6], to: [12, 3.5, -3.6], look: [12, 3.2, 4], lookTo: [12, 3.2, 0.5], fov: 32 } };
S[4] = { ...CITY, cast: [{ id: 'man', who: 'walker', at: [14, 2], rot: 180, counter: 3, counterKeys: keys([[0.15, 2], [0.3, 1], [0.45, 0]]), face: 'neutral', pose: [0.55, -0.55, -0.4, 0.4] }],
  acts: [{ who: 'man', do: 'walk', to: [14, -1.2], t: [0, 0.45] }, face('man', 'surprised', 0.46), { who: 'man', do: 'freezeon', t: [0.45, 0.6] }, gaze('man', 0.8, 0, 0.7), gaze('man', -0.8, 0, 0.85)],
  cam: { from: [16.5, 4.6, -7.5], to: [16, 4.4, -6.5], look: [14, 3.6, 0], fov: 36 } };
S[5] = { ...CITY, light: 'sunrise', cast: [{ id: 'man', who: 'walker', at: [14, -1.2], rot: 180, counter: 0, counterKeys: keys([[0.45, 1000]]), frozen: true, face: 'surprised', pose: [0.55, -0.55, -0.4, 0.4] }, { ...townCast[1], counter: 0, counterKeys: keys([[0.45, 1000]]) }],
  acts: [{ who: 'man', do: 'freezeoff', t: [0.45, 0.55] }, face('man', 'happy', 0.55), { who: 'man', do: 'walk', to: [14, -6], t: [0.6, 1] }],
  cam: { from: [17, 5.2, -9], to: [17.5, 5.2, -10], look: [15, 3.6, -1], fov: 40 } };
// 6 PLANT: two kids holding hands; only one number moves. Kai (62) glances.
S[6] = { ...CITY, cast: [{ id: 'ka', who: 'kida', at: [11.5, 6], rot: 180, counter: 700, counterKeys: keys([[0.25, 699], [0.4, 698], [0.55, 697], [0.7, 696], [0.85, 695]]), face: 'happy' },
    { id: 'kb', who: 'kidb', at: [13.4, 6], rot: 180, counter: 712, face: 'happy' }, Kai({ at: [17.5, -3], rot: -60, face: 'neutral', gaze: [-1, 0] })],
  acts: [{ who: 'ka', do: 'walk', to: [11.5, -2], t: [0.05, 1] }, { who: 'kb', do: 'walk', to: [13.4, -2], t: [0.05, 1] }, { who: 'ka', do: 'holdhand', arm: 'L', t: [0, 1], hold: true }, { who: 'kb', do: 'holdhand', arm: 'R', t: [0, 1], hold: true }, face('kai', 'confused', 0.6)],
  cam: { from: [12.4, 3.0, -6.5], to: [12.4, 3.0, -7.4], look: [12.4, 2.2, 2], fov: 40 } };
// 7 harbour: Kai on the pier watching the sea (62)
const PIER = { id: 'pier', type: 'pier', at: [0, 0, 101] };
S[7] = { ...HILLN, fog: [40, 260, '#7d8fb0'], light: 'sunset', lamp: 'off', props: [PIER], cast: [Kai({ at: [0, 108], rot: 0, face: 'sad', y: 0.75, gaze: [0, -0.2] })],
  cam: { from: [-4.5, 3.6, 100], to: [-4.0, 3.8, 102], look: [0.5, 3.4, 112], fov: 42 } };
// 8 fog horn: Kai turns toward the sea
S[8] = { ...S[7], light: 'night', cast: [Kai({ at: [0, 108], rot: 150, face: 'neutral', y: 0.75 })], acts: [{ who: 'kai', do: 'turn', to: 0, t: [0.25, 0.5] }, face('kai', 'scared', 0.45)],
  cam: { from: [2.4, 3.2, 113], to: [2.0, 3.2, 112], look: [0, 3.4, 108], fov: 40 } };
// 9 wide: ferry lights in the fog, dark lighthouse on the hill
S[9] = { ...HILLN, fog: [60, 400, '#56677f'], props: [ferry([-30, 210], 70)], cast: [Kai({ at: [0, 108], rot: 0, y: 0.75, face: 'scared' })],
  cam: { from: [8, 6, 118], to: [6, 7, 120], look: [-10, 3, 200], lookTo: [-2, 20, 60], fov: 48 } };
// 10 memory flash: Mum waving at the bright lamp from the deck
S[10] = { ...HILLN, lamp: 'on', flashback: true, fog: [80, 500, '#ffcf9a'], light: 'sunset', props: [ferry([0, 160], 180)],
  cast: [{ id: 'mum', who: 'mum', at: [0, 156], y: 1.75, rot: 180, face: 'happy' }], acts: [{ who: 'mum', do: 'wave', arm: 'L', t: [0.1, 1], hold: true }],
  cam: { from: [4, 5.2, 146], to: [3.5, 5.4, 147], look: [0, 4.6, 156], fov: 40 } };
// 11 Keeper Marlo frozen at the foot of the hill, 0, key held out
const M0 = on(0.03);
const Marlo = (o = {}) => ({ id: 'marlo', who: 'marlo', at: [M0.x, M0.z], rot: 10, counter: 0, frozen: true, face: 'neutral', pose: [-0.5, 0.5, -1.2, 0.2], acc: { handL: [['key']] }, ...o });
S[11] = { ...HILLN, cast: [Marlo({ gaze: [0.6, 0] })], acts: [gaze('marlo', 0.8, 0.2, 0.5)], cam: { from: [M0.x + 4.5, 5.4, M0.z - 5], to: [M0.x + 3.6, 5.2, M0.z - 4.4], look: [M0.x, 4.2, M0.z], fov: 42 } };
// 12 Marlo speaks (eyes and mouth only); Kai takes the key
const K12 = [M0.x + 2.4, M0.z - 1.8];
S[12] = { ...HILLN, cast: [Marlo({ talk: [speak(12)], face: 'scared', gaze: [0.8, 0.2] }), Kai({ at: K12, rot: -125, face: 'scared', gaze: [-0.6, 0] })],
  acts: [{ who: 'kai', do: 'reach', arm: 'R', t: [0.55, 0.8] }, { do: 'fly', acc: 'marlo.handL0', to: 'kai.handR0', t: [0.62, 0.78], arc: 0.2, spin: 0 }],
  cam: { from: [M0.x + 6, 5.0, M0.z - 6.5], to: [M0.x + 5, 4.8, M0.z - 6], look: [M0.x + 1.2, 4.0, M0.z - 0.8], fov: 44 } };
// 13 "I only have sixty-two steps. The path is one hundred!" Kai looks from his 62 up the path
S[13] = { ...HILLN, cast: [Kai({ at: K12, rot: -170, face: 'scared', talk: [speak(13)], gaze: [0, -0.6], acc: { handR: [['key']] } })], acts: [{ who: 'kai', do: 'lookup', t: [0.5, 1], hold: true }],
  cam: { from: [K12[0] + 1.5, 3.4, K12[1] - 4.4], to: [K12[0] + 1.4, 3.6, K12[1] - 4.0], look: [K12[0], 3.4, K12[1]], fov: 40 } };
// 14 Marlo: "Then don't waste a single one." proud smile
S[14] = { ...HILLN, cast: [Marlo({ talk: [speak(14)], face: 'comforting', gaze: [0.8, 0.2], acc: {} })], cam: { from: [M0.x + 2.2, 6.0, M0.z - 3.4], to: [M0.x + 2.0, 6.0, M0.z - 3.0], look: [M0.x, 5.4, M0.z], fov: 34 } };
// 15 "So I climbed. And I counted." Kai sets off up the path
S[15] = { ...HILLN, cast: [Kai({ face: 'determined', counter: 62, counterKeys: keys([[0.3, 61], [0.45, 60], [0.6, 59], [0.75, 58], [0.9, 57]]), acc: { handR: [['key']] } })],
  acts: [{ who: 'kai', do: 'pathwalk', u0: 0.04, u1: 0.075, t: [0.15, 1], cadence: 9 }], cam: cam(camAt(0.1, 6, 1.5, 4.2, 3.2, -3), camAt(0.1, 4.5, 1.2, 4.0, 3.2, -3), 42) };
// 16 "Fifty. Forty. Thirty. Twenty..." counter montage as the path winds; fog thickens
S[16] = { ...HILLN, fog: [18, 120, '#56677f'], cast: [Kai({ face: 'nervous', counter: 50, counterKeys: keys([[0.25, 40], [0.5, 30], [0.75, 20]]), acc: { handR: [['key']] } })],
  acts: [{ who: 'kai', do: 'pathwalk', u0: 0.2, u1: 0.42, t: [0, 1], cadence: 9 }], cam: cam(camAt(0.31, 7, 2.5, 6, 3, 0), camAt(0.43, 4, 2.0, 5, 3, 0), 46) };
// 17 fog swallows the path: three steps the wrong way 12 -> 9
S[17] = { ...HILLN, fog: [10, 70, '#5e6f88'], cast: [Kai({ face: 'scared', counter: 12, counterKeys: keys([[0.3, 11], [0.45, 10], [0.6, 9]]), acc: { handR: [['key']] } })],
  acts: [{ who: 'kai', do: 'pathwalk', u0: 0.465, u1: 0.47, off0: 0, off1: 3.2, t: [0.15, 0.62], cadence: 8 }, face('kai', 'angry', 0.75)], cam: cam(camAt(0.47, 5.5, -3.5, 3.6, 3, 0), camAt(0.47, 5.0, -3.0, 3.4, 3, 0), 44) };
// 18 "Wasted. Nine left. And I was only halfway up." 9 on the chest, the lighthouse far above
S[18] = { ...HILLN, cast: [Kai({ u: 0.48, counter: 9, face: 'holdtears', gaze: [0, -0.7], acc: { handR: [['key']] } })], acts: [{ who: 'kai', do: 'lookup', t: [0.3, 1], hold: true }],
  cam: { keys: [{ t: 0, ...camAt(0.48, 2.6, 0.6, 3.6, 3.2, 0), fov: 32 }, { t: 1, ...camAt(0.48, 3.4, 1.0, 3.2, 12, 30), fov: 44 }] } };
// 19-20 Mrs. Pell on her bench (900)
const pellBench = (o = {}) => Pell({ at: [P_b.x, P_b.z], rot: 120, ...o });
S[19] = { ...HILLN, props: benchProps, cast: [pellBench({ face: 'neutral', gaze: [0, 0.4] })], acts: [{ who: 'pell', do: 'sit', seat: 1.7, t: [0, 1], hold: true }],
  cam: { from: [P_b.x + 6.5, P_b.y + 5, P_b.z - 2.5], to: [P_b.x + 5.5, P_b.y + 4.6, P_b.z - 2], look: [P_b.x, P_b.y + 3.2, P_b.z], fov: 42 } };
S[20] = { ...S[19], cast: [pellBench({ face: 'neutral', gaze: [0.6, 0] })], cam: { from: [P_b.x + 2.6, P_b.y + 3.6, P_b.z - 1.0], to: [P_b.x + 2.3, P_b.y + 3.5, P_b.z - 0.9], look: [P_b.x, P_b.y + 3.2, P_b.z], fov: 30 } };
// 21 Kai pleads, holding the key out to her
const K21 = on(0.495, 1.0);
const kaiNearBench = (o = {}) => Kai({ at: [K21.x, K21.z], rot: 60, counter: 9, acc: { handR: [['key']] }, ...o });
const twoAtBench = (kf, pf, o = {}) => [kaiNearBench({ face: kf, ...o.kai }), pellBench({ face: pf, ...o.pell })];
const benchCam = { from: [P_b.x - 3.2, P_b.y + 4.6, P_b.z - 7.5], to: [P_b.x - 2.8, P_b.y + 4.5, P_b.z - 6.8], look: [P_b.x - 0.6, P_b.y + 3.0, P_b.z - 0.6], fov: 46 };
S[21] = { ...HILLN, props: benchProps, cast: twoAtBench('scared', 'surprised', { kai: { talk: [speak(21)] } }), acts: [{ who: 'pell', do: 'sit', seat: 1.7, t: [0, 1], hold: true }, { who: 'kai', do: 'give', t: [0.1, 1], hold: true }], cam: benchCam };
S[22] = { ...HILLN, props: benchProps, cast: twoAtBench('scared', 'scared', { pell: { talk: [speak(22)], gaze: [0.5, -0.8] } }), acts: [{ who: 'pell', do: 'sit', seat: 1.7, t: [0, 1], hold: true }, { who: 'pell', do: 'lookup', t: [0.2, 1], hold: true }],
  cam: { from: [P_b.x + 2.2, P_b.y + 3.6, P_b.z - 2.4], to: [P_b.x + 2.0, P_b.y + 3.6, P_b.z - 2.1], look: [P_b.x, P_b.y + 3.6, P_b.z], fov: 36 } };
// 23 memory flash (cold): young Pell frozen alone on the dark hill, 0
const Y = on(0.6, 2);
S[23] = { ...HILLN, mood: 'cool', fog: [12, 70, '#3a4a66'], exposure: 1.1, cast: [{ id: 'yp', who: 'ypell', at: [Y.x, Y.z], rot: 160, counter: 0, frozen: true, face: 'scared', pose: [0.4, -0.4, -0.3, 0.3], talk: [], gaze: [0.8, 0] }],
  acts: [gaze('yp', -0.8, 0, 0.5)], cam: { from: [Y.x + 3.6, Y.y + 3.6, Y.z + 4.4], to: [Y.x + 3.0, Y.y + 3.4, Y.z + 3.6], look: [Y.x, Y.y + 2.6, Y.z], fov: 40 } };
S[24] = { ...HILLN, props: benchProps, cast: twoAtBench('sad', 'angry', { pell: { talk: [speak(24)], gaze: [-0.8, 0.3] } }), acts: [{ who: 'pell', do: 'sit', seat: 1.7, t: [0, 1], hold: true }, { who: 'pell', do: 'lookside', deg: -40, t: [0.15, 1], hold: true }], cam: benchCam };
// 25 alone: 9 -> 8, 6, 4
S[25] = { ...HILLN, cast: [Kai({ face: 'sad', counter: 9, counterKeys: keys([[0.3, 8], [0.55, 6], [0.8, 4]]), acc: { handR: [['key']] } })],
  acts: [{ who: 'kai', do: 'pathwalk', u0: 0.5, u1: STOP_U, t: [0.05, 0.92], cadence: 8 }], cam: cam(camAt(STOP_U, 5, 2.5, 4, 3, 0), camAt(STOP_U, 4, 2.0, 3.8, 3, 0), 44) };
// 26 stop: 4 on the chest, "45 TO THE TOP" sign
S[26] = { ...HILLN, props: [sign], cast: [Kai({ u: STOP_U, counter: 4, face: 'holdtears', acc: { handR: [['key']] } })],
  cam: { keys: [{ t: 0, ...camAt(STOP_U, 3.2, -1.2, 3.4, 3, 0), fov: 40 }, { t: 1, ...camAt(STOP_U, 3.6, -1.6, 3.6, 3, 0), fov: 46 }] } };
// 27 the horn again: ferry drifting toward the rocks
S[27] = { ...HILLN, fog: [40, 300, '#56677f'], props: [ferry([-20, 185], 60)], cast: [],
  acts: [{ do: 'move', prop: 'ferry', from: [-20, -0.4, 185], to: [-8, -0.4, 172], t: [0, 1] }], cam: { from: [10, 30, 70], to: [10, 28, 74], look: [-12, 0, 178], fov: 34 } };
// 28 choice: look down, then up into the fog
S[28] = { ...HILLN, props: [sign], cast: [Kai({ u: STOP_U, counter: 4, face: 'scared', acc: { handR: [['key']] } })], acts: [{ who: 'kai', do: 'turn', to: 120, t: [0.05, 0.35] }, { who: 'kai', do: 'lookdown', t: [0.1, 0.5] }, { who: 'kai', do: 'turn', to: -60, t: [0.55, 0.85] }, { who: 'kai', do: 'lookup', t: [0.6, 1] }],
  cam: cam(camAt(STOP_U, 4.0, 2.5, 3.6, 3, 0), camAt(STOP_U, 3.6, 2.2, 3.6, 3, 0), 40) };
// 29-31 Kai calls down to Mrs. Pell
const K29 = on(STOP_U);
const KaiCall = (o = {}) => Kai({ u: STOP_U, back: true, counter: 4, acc: { handR: [['key']] }, ...o });
const callCam = { from: [K29.x - 3.2, K29.y + 4.4, K29.z - 3.8], to: [K29.x - 2.8, K29.y + 4.3, K29.z - 3.3], look: [K29.x, K29.y + 3.0, K29.z], fov: 40 };
S[29] = { ...HILLN, cast: [KaiCall({ face: 'angry', talk: [speak(29)] })], acts: [{ who: 'kai', do: 'handsface', t: [0.0, 0.9] }], cam: callCam };
S[30] = { ...HILLN, cast: [KaiCall({ face: 'holdtears', talk: [speak(30)] })], acts: [{ who: 'kai', do: 'reach', arm: 'L', t: [0.1, 1], hold: true }],
  cam: { from: [K29.x - 1.6, K29.y + 3.6, K29.z - 2.6], to: [K29.x - 1.4, K29.y + 3.6, K29.z - 2.3], look: [K29.x, K29.y + 3.1, K29.z], fov: 36 } };
S[31] = { ...HILLN, cast: [KaiCall({ face: 'crying', talk: [speak(31)] })], cam: { from: [K29.x - 1.2, K29.y + 3.4, K29.z - 2.0], to: [K29.x - 1.0, K29.y + 3.4, K29.z - 1.8], look: [K29.x, K29.y + 3.1, K29.z], fov: 32 } };
// 32 she doesn't move (fog drifting), looking at the sea
S[32] = { ...HILLN, props: benchProps, cast: [pellBench({ face: 'holdtears', gaze: [0.6, -0.2] })], acts: [{ who: 'pell', do: 'sit', seat: 1.7, t: [0, 1], hold: true }],
  cam: { from: [P_b.x + 3.2, P_b.y + 3.6, P_b.z - 3.2], to: [P_b.x + 2.6, P_b.y + 3.5, P_b.z - 2.6], look: [P_b.x, P_b.y + 3.2, P_b.z], fov: 36 } };
// 33 she stands, climbs to him (900 -> 895) and takes his hand
S[33] = { ...HILLN, props: benchProps, cast: [Pell({ at: [P_b.x, P_b.z], face: 'determined', counterKeys: keys([[0.4, 899], [0.5, 898], [0.6, 897], [0.7, 896], [0.8, 895]]) }), Kai({ u: STOP_U, back: true, counter: 4, face: 'surprised', acc: { handR: [['key']] } })],
  acts: [{ who: 'pell', do: 'sit', seat: 1.7, t: [0, 0.3] }, { who: 'pell', do: 'pathwalk', u0: BENCH_U, u1: STOP_U - 0.006, off0: 3.4, off1: 1.2, t: [0.32, 0.85], cadence: 6 }, { who: 'pell', do: 'holdhand', arm: 'L', t: [0.85, 1], hold: true }, { who: 'kai', do: 'holdhand', arm: 'L', t: [0.85, 1], hold: true }],
  cam: cam({ pos: [P_b.x - 7, P_b.y + 7, P_b.z - 10], look: [P_b.x - 2, P_b.y + 3, P_b.z - 3] }, { pos: [P_b.x - 6.5, P_b.y + 6.6, P_b.z - 9.5], look: [K29.x, K29.y + 3, K29.z] }, 46) };
// 34 "Then we go together. Hold on tight." joined hands
const pair = (kf, pf, o = {}) => [Kai({ u: STOP_U, rot: undefined, counter: 4, face: kf, acc: { handR: [['key']] }, ...o.kai }), Pell({ u: STOP_U - 0.004, off: 1.4, counter: 895, face: pf, ...o.pell })];
S[34] = { ...HILLN, cast: pair('relieved', 'comforting', { pell: { talk: [speak(34)] } }), acts: [{ who: 'pell', do: 'holdhand', arm: 'L', t: [0, 1], hold: true }, { who: 'kai', do: 'holdhand', arm: 'L', t: [0, 1], hold: true }],
  cam: cam(camAt(STOP_U, 3.4, 0.6, 3.6, 3.2, 0), camAt(STOP_U, 3.0, 0.5, 3.6, 3.2, 0), 40) };
// 35 climbing together: his 4 stays, hers ticks 895 -> 893
S[35] = { ...HILLN, cast: pair('surprised', 'surprised', { pell: { counterKeys: keys([[0.3, 894], [0.6, 893]]) } }),
  acts: [{ who: 'kai', do: 'pathwalk', u0: STOP_U, u1: 0.6, t: [0.05, 1], cadence: 7, keepArms: true }, { who: 'pell', do: 'pathwalk', u0: STOP_U - 0.004, u1: 0.596, off0: 1.4, off1: 1.4, t: [0.05, 1], cadence: 7, keepArms: true },
    { who: 'pell', do: 'holdhand', arm: 'L', t: [0, 1], hold: true }, { who: 'kai', do: 'holdhand', arm: 'L', t: [0, 1], hold: true }, gaze('kai', 0, 0.9, 0.2), gaze('pell', 0, 0.9, 0.3)],
  cam: cam(camAt(0.6, 4.5, 1, 3.4, 2.4, 0), camAt(0.6, 3.6, 0.8, 3.0, 2.4, 0), 42) };
// 36 "That's what the two kids knew..." part A: the kids again (town); part B (136): Kai + Pell climbing into the fog
S[36] = { ...S[6], cast: S[6].cast.slice(0, 2), acts: S[6].acts.slice(0, 4), cam: { from: [12.4, 2.6, -4.5], to: [12.4, 2.6, -5.2], look: [12.4, 2.2, 3], fov: 34 } };
const S136 = { ...HILLN, cast: pair('happy', 'happy', { pell: { counter: 860 } }), acts: [{ who: 'kai', do: 'pathwalk', u0: 0.8, u1: 0.86, t: [0, 1], cadence: 7, keepArms: true }, { who: 'pell', do: 'pathwalk', u0: 0.796, u1: 0.856, off0: 1.4, off1: 1.4, t: [0, 1], cadence: 7, keepArms: true },
  { who: 'pell', do: 'holdhand', arm: 'L', t: [0, 1], hold: true }, { who: 'kai', do: 'holdhand', arm: 'L', t: [0, 1], hold: true }],
  cam: cam(camAt(0.8, -5, -3, 4, 3, 4), camAt(0.82, -5, -3, 4.4, 3, 4), 46) };
// 37 top: Kai turns the key; the lamp blazes
const TOP = on(1);
S[37] = { ...HILLN, lamp: [0.45, 0.62], cast: [Kai({ at: [TOP.x + 0.6, TOP.z - 1.2], rot: 180, counter: 4, face: 'determined', acc: { handR: [['key']] } }), Pell({ at: [TOP.x + 2.6, TOP.z + 0.4], rot: 200, counter: 850, face: 'nervous' })],
  acts: [{ who: 'kai', do: 'reach', arm: 'R', t: [0.15, 1], hold: true }, face('kai', 'happy', 0.62), face('pell', 'happy', 0.66), gaze('kai', 0, -1, 0.6), gaze('pell', 0, -1, 0.65)],
  cam: { from: [TOP.x + 3.5, TOP.y + 5.5, TOP.z + 7.5], to: [TOP.x + 6, TOP.y + 8, TOP.z + 14], look: [TOP.x, TOP.y + 4, TOP.z - 3], lookTo: [0, 36, -60], fov: 46 } };
// 38 the ferry turns toward the harbour, beam sweeping
S[38] = { ...HILLN, lamp: 'on', fog: [40, 300, '#56677f'], props: [ferry([-8, 172], 60), PIER], cast: [],
  acts: [{ do: 'move', prop: 'ferry', from: [-8, -0.4, 172], to: [-2, -0.4, 140], t: [0.1, 1] }], cam: { from: [14, 28, 62], to: [12, 26, 70], look: [-6, 0, 160], lookTo: [-2, 0, 140], fov: 36 } };
// 39 Pell: "Eight hundred and fifty steps left. I've never felt so rich."
const topPair = (kf, pf, o = {}) => [Kai({ at: [TOP.x - 0.4, TOP.z + 3.6], rot: 10, counter: 4, face: kf, ...o.kai }), Pell({ at: [TOP.x + 1.6, TOP.z + 3.6], rot: -10, counter: 850, face: pf, ...o.pell })];
S[39] = { ...HILLN, lamp: 'on', cast: topPair('happy', 'happy', { pell: { talk: [speak(39)], gaze: [-0.8, 0] } }), acts: [{ who: 'kai', do: 'holdhand', arm: 'L', t: [0, 1], hold: true }, { who: 'pell', do: 'holdhand', arm: 'R', t: [0, 1], hold: true }],
  cam: { from: [TOP.x + 0.6, TOP.y + 4.4, TOP.z + 9.5], to: [TOP.x + 0.6, TOP.y + 4.4, TOP.z + 8.5], look: [TOP.x + 0.6, TOP.y + 3.4, TOP.z + 3.6], fov: 40 } };
// 40-41 endings: wide at the lamp, then the lit lighthouse over the fog and the ferry home
S[40] = { ...HILLN, lamp: 'on', cast: topPair('relieved', 'relieved'), acts: [{ who: 'kai', do: 'holdhand', arm: 'L', t: [0, 1], hold: true }, { who: 'pell', do: 'holdhand', arm: 'R', t: [0, 1], hold: true }],
  cam: { from: [TOP.x + 4, TOP.y + 7, TOP.z + 18], to: [TOP.x + 6, TOP.y + 10, TOP.z + 26], look: [TOP.x, TOP.y + 6, TOP.z - 2], fov: 46 } };
S[41] = { ...HILLN, lamp: 'on', fog: [60, 400, '#56677f'], props: [ferry([0, 118], 0), PIER], cast: [], cam: { from: [30, 18, 140], to: [36, 24, 150], look: [0, 18, 20], lookTo: [0, 24, -40], fov: 46 } };


// ---------------- framing fixes after the first still review ----------------
const trackK = (id, o1, o2, fov = 42, o3) => ({ keys: [{ t: 0, track: id, off: o1, fov }, { t: 1, track: id, off: o2 || o1, fov }] });
const K0 = on(0.035);
S[1].cam = { keys: [{ t: 0, pos: [K0.x + 1.0, 3.6, K0.z - 4.6], look: [K0.x, 3.1, K0.z], fov: 34 }, { t: 0.5, pos: [K0.x + 1.1, 3.6, K0.z - 4.2], look: [K0.x, 3.1, K0.z], fov: 34 },
  { t: 0.51, cut: true, pos: [K0.x + 1.0, 3.6, K0.z + 2.6], look: [0, 20, -40], fov: 46 }, { t: 1, pos: [K0.x + 1.2, 3.8, K0.z + 4.2], look: [0, 30, -55], fov: 46 }] };
S[2].cam = { from: [16, 5.4, -15], to: [16, 5.0, -13], look: [16, 3.4, 2], fov: 46 };
S[7].cam = { from: [5.2, 3.6, 113.5], to: [4.6, 3.6, 113], look: [0, 3.4, 108], fov: 42 };
S[10].cam = { from: [4.5, 5.6, 166], to: [4, 5.8, 165], look: [0, 9, 100], fov: 46 };
for (const i of [11, 12, 14]) S[i].cast.forEach(c => { if (c.id === 'marlo') c.rot = 190; });
S[11].cam = { from: [M0.x + 3.2, 5.2, M0.z - 5.2], to: [M0.x + 2.6, 5.0, M0.z - 4.6], look: [M0.x, 4.2, M0.z], fov: 42 };
S[12].cast[1].rot = -53; S[12].cam = { from: [M0.x - 3.5, 5.0, M0.z - 5.5], to: [M0.x - 3.0, 4.9, M0.z - 5.0], look: [M0.x + 1.2, 3.8, M0.z - 0.9], fov: 44 };
S[14].cam = { from: [M0.x - 0.8, 5.6, M0.z - 3.2], to: [M0.x - 0.7, 5.6, M0.z - 2.8], look: [M0.x, 5.3, M0.z], fov: 34 };
S[15].cam = trackK('kai', [1.5, 1.4, -5.5], [1.2, 1.2, -4.5], 42);
S[16].cam = trackK('kai', [3.5, 2.0, -6.5], [3, 1.6, -5.5], 46);
S[17].cam = trackK('kai', [-4.5, 1.2, -4.5], [-4.2, 1.0, -4.0], 46);
S[25].cam = trackK('kai', [2.5, 1.4, -5.5], [2.2, 1.2, -4.8], 44);
S[35].cam = trackK('kai', [3.5, 1.2, -5.5], [3, 1.0, -4.8], 44);
// bench scenes: Kai (on the path) and Pell (bench) face each other
const KB = on(0.495, 1.0), dKP = (() => { const dx = P_b.x - KB.x, dz = P_b.z - KB.z, L = Math.hypot(dx, dz); return [dx / L, dz / L]; })(), perp = [dKP[1], -dKP[0]];
const rotKai = Math.atan2(dKP[0], dKP[1]) * 180 / Math.PI, rotPell = Math.atan2(-dKP[0], -dKP[1]) * 180 / Math.PI;
const mid = [(KB.x + P_b.x) / 2, (KB.z + P_b.z) / 2], mY = (KB.y + P_b.y) / 2;
const seeKai = { from: [mid[0] + perp[0] * 6 + dKP[0] * 3, mY + 4.4, mid[1] + perp[1] * 6 + dKP[1] * 3], look: [KB.x, KB.y + 3.0, KB.z], fov: 44 };
const seePell = { from: [mid[0] + perp[0] * 6 - dKP[0] * 3, mY + 4.4, mid[1] + perp[1] * 6 - dKP[1] * 3], look: [P_b.x, P_b.y + 3.0, P_b.z], fov: 44 };
for (const i of [19, 20, 21, 22, 24, 32, 33]) { if (S[i].props) S[i].props = [{ ...benchProps[0], rot: rotPell }]; S[i].cast.forEach(c => { if (c.id === 'pell' && i !== 33) c.rot = rotPell; if (c.id === 'kai' && [21, 22, 24].includes(i)) { c.at = [KB.x, KB.z]; c.rot = rotKai; } }); }
S[19].cam = { from: [P_b.x - dKP[0] * 7 + perp[0] * 2.5, P_b.y + 5, P_b.z - dKP[1] * 7 + perp[1] * 2.5], to: [P_b.x - dKP[0] * 6 + perp[0] * 2, P_b.y + 4.6, P_b.z - dKP[1] * 6 + perp[1] * 2], look: [P_b.x, P_b.y + 3.0, P_b.z], fov: 42 };
S[20].cam = { from: [P_b.x - dKP[0] * 3.0, P_b.y + 3.2, P_b.z - dKP[1] * 3.0], to: [P_b.x - dKP[0] * 2.7, P_b.y + 3.2, P_b.z - dKP[1] * 2.7], look: [P_b.x, P_b.y + 2.9, P_b.z], fov: 32 };
S[21].cam = { ...seeKai, to: seeKai.from }; S[24].cam = { ...seePell, to: seePell.from };
S[22].cam = { from: [P_b.x - dKP[0] * 3.4 + perp[0] * 1.0, P_b.y + 3.6, P_b.z - dKP[1] * 3.4 + perp[1] * 1.0], to: [P_b.x - dKP[0] * 3.0 + perp[0] * 0.9, P_b.y + 3.6, P_b.z - dKP[1] * 3.0 + perp[1] * 0.9], look: [P_b.x, P_b.y + 3.4, P_b.z], fov: 36 };
S[32].cam = { from: [P_b.x - dKP[0] * 4.4 + perp[0] * 2, P_b.y + 3.8, P_b.z - dKP[1] * 4.4 + perp[1] * 2], to: [P_b.x - dKP[0] * 3.8 + perp[0] * 1.6, P_b.y + 3.7, P_b.z - dKP[1] * 3.8 + perp[1] * 1.6], look: [P_b.x, P_b.y + 3.2, P_b.z], fov: 38 };
// young Pell flash: camera in front of her
const yf = [Math.sin(160 * Math.PI / 180), Math.cos(160 * Math.PI / 180)];
S[23].cam = { from: [Y.x + yf[0] * 4.6 + 1, Y.y + 3.4, Y.z + yf[1] * 4.6], to: [Y.x + yf[0] * 4.0 + 0.8, Y.y + 3.3, Y.z + yf[1] * 4.0], look: [Y.x, Y.y + 2.6, Y.z], fov: 40 };
// stop + sign
S[26].cam = { keys: [{ t: 0, ...camAt(STOP_U, 4.2, 1.2, 3.6, 3, 0), fov: 46 }, { t: 1, ...camAt(STOP_U, 4.8, 1.4, 3.8, 3, 0), fov: 50 }] };
// Kai calling DOWN the hill: camera in front of him (downhill side)
const dn = on(STOP_U).dir.map(v => -v);
const callFront = (dist, side, up, fov) => ({ from: [K29.x + dn[0] * dist + dn[1] * side, K29.y + up, K29.z + dn[1] * dist - dn[0] * side], to: [K29.x + dn[0] * (dist - 0.4) + dn[1] * side, K29.y + up, K29.z + dn[1] * (dist - 0.4) - dn[0] * side], look: [K29.x, K29.y + 3.0, K29.z], fov });
S[29].cam = callFront(4.6, 1.2, 3.6, 42); S[30].cam = callFront(3.2, 0.8, 3.4, 38); S[31].cam = callFront(2.6, 0.5, 3.3, 34);
S[34].cam = trackK('kai', [2.4, 0.8, -4.6], [2.2, 0.8, -4.2], 44);
// top: in front of the lighthouse door
S[37].cast[0].at = [TOP.x + 0.4, -52.6]; S[37].cast[1].at = [TOP.x + 2.4, -51.2];
S[37].cam = { from: [TOP.x + 4.5, TOP.y + 5.0, -43], to: [TOP.x + 7, TOP.y + 8, -36], look: [TOP.x + 1, TOP.y + 3.5, -53], lookTo: [0, 40, -60], fov: 46 };
S[28].cam = cam(camAt(STOP_U, 4.6, 2.5, 3.8, 3, 0), camAt(STOP_U, 4.2, 2.2, 3.8, 3, 0), 44);

// ---------------- framing fixes, round 2 ----------------
S[10].cam = { from: [5, 5.4, 168], to: [4.5, 5.6, 167], look: [-0.5, 6, 140], fov: 50 };
S[14].cam = { from: [M0.x - 1.0, 5.6, M0.z - 4.8], to: [M0.x - 0.9, 5.6, M0.z - 4.3], look: [M0.x, 5.0, M0.z], fov: 38 };
S[20].cam = { from: [P_b.x - dKP[0] * 4.2 + perp[0] * 0.6, P_b.y + 3.3, P_b.z - dKP[1] * 4.2 + perp[1] * 0.6], to: [P_b.x - dKP[0] * 3.8 + perp[0] * 0.5, P_b.y + 3.3, P_b.z - dKP[1] * 3.8 + perp[1] * 0.5], look: [P_b.x, P_b.y + 3.0, P_b.z], fov: 34 };
S[22].cam = { from: [P_b.x - dKP[0] * 1.6 + perp[0] * 3.2, P_b.y + 3.6, P_b.z - dKP[1] * 1.6 + perp[1] * 3.2], to: [P_b.x - dKP[0] * 1.4 + perp[0] * 2.9, P_b.y + 3.6, P_b.z - dKP[1] * 1.4 + perp[1] * 2.9], look: [P_b.x, P_b.y + 3.4, P_b.z], fov: 38 };
S[32].cam = { from: [P_b.x - dKP[0] * 2.0 + perp[0] * 4.4, P_b.y + 3.8, P_b.z - dKP[1] * 2.0 + perp[1] * 4.4], to: [P_b.x - dKP[0] * 1.8 + perp[0] * 3.9, P_b.y + 3.7, P_b.z - dKP[1] * 1.8 + perp[1] * 3.9], look: [P_b.x, P_b.y + 3.2, P_b.z], fov: 40 };
S[25].cam = trackK('kai', [-4.2, 1.4, -4.6], [-3.8, 1.2, -4.2], 44);
S[29].acts = [{ who: 'kai', do: 'wave', arm: 'R', t: [0.05, 0.9] }];
S[30].cam = callFront(4.0, 1.0, 3.5, 42); S[31].cam = callFront(3.6, 0.8, 3.4, 38);
S[34].cam = trackK('kai', [-3.8, 1.2, -4.0], [-3.4, 1.1, -3.6], 44);
S[35].cam = trackK('kai', [-4.4, 1.3, -4.8], [-4.0, 1.2, -4.3], 44);
S136.cam = trackK('kai', [2.4, 1.4, -5.6], [2.2, 1.3, -5.0], 44);

// ---------------- framing fixes, round 3 ----------------
S[10].cast[0].at = [0, 154.2]; S[10].cam = { from: [1.6, 4.6, 157.2], to: [1.4, 4.7, 157.0], look: [-0.4, 6.5, 120], fov: 54 };
S[14].cam = { from: [M0.x - 1.2, 5.4, M0.z - 6.0], to: [M0.x - 1.1, 5.4, M0.z - 5.4], look: [M0.x, 4.8, M0.z], fov: 42 };
S[22].cam = { from: [P_b.x - dKP[0] * 1.9 + perp[0] * 1.1, P_b.y + 3.7, P_b.z - dKP[1] * 1.9 + perp[1] * 1.1], to: [P_b.x - dKP[0] * 1.7 + perp[0] * 1.0, P_b.y + 3.7, P_b.z - dKP[1] * 1.7 + perp[1] * 1.0], look: [P_b.x, P_b.y + 3.4, P_b.z], fov: 42 };
S[32].cam = { from: [P_b.x - dKP[0] * 4.0 + perp[0] * 1.2, P_b.y + 3.8, P_b.z - dKP[1] * 4.0 + perp[1] * 1.2], to: [P_b.x - dKP[0] * 3.5 + perp[0] * 1.0, P_b.y + 3.7, P_b.z - dKP[1] * 3.5 + perp[1] * 1.0], look: [P_b.x, P_b.y + 3.2, P_b.z], fov: 40 };
for (const sh of [S[33], S[34], S[35], S136]) sh.acts.forEach(a => { if (a.who === 'pell' && a.do === 'holdhand') a.arm = 'R'; });

// round 4: seated Pell's head is ~5 above the ground; flashback camera above the cabin
S[10].cam = { from: [3.2, 6.8, 160], to: [3.0, 6.9, 159.6], look: [-0.5, 6.5, 120], fov: 54 };
S[22].cam = { from: [P_b.x - dKP[0] * 2.0 + perp[0] * 1.1, P_b.y + 5.3, P_b.z - dKP[1] * 2.0 + perp[1] * 1.1], to: [P_b.x - dKP[0] * 1.8 + perp[0] * 1.0, P_b.y + 5.3, P_b.z - dKP[1] * 1.8 + perp[1] * 1.0], look: [P_b.x, P_b.y + 4.9, P_b.z], fov: 42 };
S[32].cam = { from: [P_b.x - dKP[0] * 4.0 + perp[0] * 1.2, P_b.y + 5.4, P_b.z - dKP[1] * 4.0 + perp[1] * 1.2], to: [P_b.x - dKP[0] * 3.5 + perp[0] * 1.0, P_b.y + 5.3, P_b.z - dKP[1] * 3.5 + perp[1] * 1.0], look: [P_b.x, P_b.y + 4.6, P_b.z], fov: 42 };

S[10].cam = { from: [6, 8.5, 168], to: [5.6, 8.6, 167.4], look: [0, 6, 140], fov: 50 };
S[22].cam = { from: [P_b.x - dKP[0] * 2.9 + perp[0] * 1.3, P_b.y + 5.4, P_b.z - dKP[1] * 2.9 + perp[1] * 1.3], to: [P_b.x - dKP[0] * 2.6 + perp[0] * 1.2, P_b.y + 5.4, P_b.z - dKP[1] * 2.6 + perp[1] * 1.2], look: [P_b.x, P_b.y + 4.6, P_b.z], fov: 44 };

// round 5: line 21 was a static hold (>2.5 s): slow push-in + Kai steps toward her
S[21].cam = { ...seeKai, to: [seeKai.from[0] * 0.85 + KB.x * 0.15, seeKai.from[1] - 0.4, seeKai.from[2] * 0.85 + KB.z * 0.15] };
S[21].acts.push({ who: 'kai', do: 'nod', t: [0.55, 0.75] }, { who: 'pell', do: 'lookside', deg: 12, t: [0.4, 0.8] });
S[24].cam = { ...seePell, to: [seePell.from[0] * 0.88 + P_b.x * 0.12, seePell.from[1] - 0.3, seePell.from[2] * 0.88 + P_b.z * 0.12] };

// ---------------- video QA round 1 fixes ----------------
const NIGHT_SEA = '#0f2340';
for (const i of [7, 8, 9, 27, 38, 41]) { S[i].seaColor = NIGHT_SEA; }
S[0].cam = { from: [14, 4.4, -16.5], to: [14, 4.2, -15.6], look: [14, 3.4, -10.5], lookTo: [14, 3.4, -11.6], fov: 38 };
// 4 + 16 + 25: counters change when the number is spoken
S[16].cast[0].counterKeys = [[wf(16, 'forty'), 40], [wf(16, 'thirty'), 30], [wf(16, 'twenty'), 20]];
S[16].cast[0].counter = 50;
S[25].cast[0].counterKeys = [[wf(25, 'eight'), 8], [wf(25, 'six'), 6], [wf(25, 'four'), 4]];
S[25].acts[0].t = [0.0, Math.min(0.95, wf(25, 'four') + 0.05)];
S[4].cast[0].counterKeys = [[0.1, 2], [0.22, 1], [0.34, 0]]; S[4].acts = S[4].acts.map(a => a.do === 'walk' ? { ...a, t: [0, 0.34] } : a.do === 'freezeon' ? { ...a, t: [0.34, 0.48] } : a.do === 'face' ? { ...a, t: 0.36 } : a);
// 10: two parts - Mum's face waving on the deck (10), then the bright lamp seen from the deck (110)
S[10].cast[0].rot = 0; S[10].cast[0].at = [0, 154.2];
S[10].cam = { from: [1.2, 6.6, 150.6], to: [1.0, 6.6, 151.0], look: [0, 6.2, 154.2], fov: 44 };
const S110 = { ...S[10], cast: [{ id: 'mum', who: 'mum', at: [0, 154.2], y: 1.75, rot: 180, face: 'happy' }], cam: { from: [3.4, 7.5, 162], to: [3.0, 7.6, 161.2], look: [-0.5, 7, 110], fov: 50 } };
// 17: fog swallows the path - side view, real step off the path, scared not angry
S[17].fog = [4, 34, '#5e6f88']; S[17].fogSky = true;
S[17].acts = [{ who: 'kai', do: 'pathwalk', u0: 0.465, u1: 0.47, off0: 0, off1: 4.5, t: [0.12, 0.6], cadence: 8 }, face('kai', 'scared', 0.3), face('kai', 'holdtears', 0.8)];
S[17].cam = { from: [on(0.468).x + 6.5, on(0.468).y + 3.8, on(0.468).z - 3.5], to: [on(0.468).x + 5.8, on(0.468).y + 3.6, on(0.468).z - 3.2], look: [on(0.468, 2.2).x, on(0.468).y + 2.4, on(0.468, 2.2).z], fov: 50 };
S[17].cast[0].counterKeys = [[0.25, 11], [0.4, 10], [0.55, 9]];
// 18: hold on Kai and his 9 through "Nine left", then tilt to the lighthouse
S[18].cast[0].face = 'holdtears';
S[18].cam = { keys: [{ t: 0, ...camAt(0.48, 3.6, 0.6, 3.6, 3.0, 0), fov: 40 }, { t: 0.6, ...camAt(0.48, 3.7, 0.7, 3.6, 3.2, 0), fov: 40 }, { t: 1, ...camAt(0.48, 4.0, 1.0, 3.2, 12, 30), fov: 46 }] };
// 26: the "45 TO THE TOP" sign beside Kai, both in frame
sign.at = [on(STOP_U + 0.003, -1.9).x, on(STOP_U + 0.003, -1.9).z]; sign.scale = 1.5;
S[26].cam = { keys: [{ t: 0, ...camAt(STOP_U, 6.5, -1.6, 4.4, 3.4, 0), fov: 50 }, { t: 1, ...camAt(STOP_U, 6.0, -1.4, 4.4, 3.4, 0), fov: 50 }] };
// 27: night sea, fog, ferry drifting toward rocks
S[27].props = [ferry([-20, 185], 60), { id: 'rocks', type: 'rocks', at: [2, -0.6, 164] }]; S[27].fog = [30, 220, '#41506a']; S[27].fogSky = true;
S[27].acts = [{ do: 'move', prop: 'ferry', from: [-22, -0.4, 188], to: [-6, -0.4, 172], t: [0, 1] }];
S[27].cam = { from: [16, 14, 130], to: [15, 13.5, 133], look: [-4, 0, 172], fov: 40 };
S[38].props = [ferry([-6, 172], 60), PIER, { id: 'rocks', type: 'rocks', at: [2, -0.6, 164] }]; S[38].fog = [30, 260, '#41506a']; S[38].fogSky = true;
S[38].acts = [{ do: 'move', prop: 'ferry', from: [-6, -0.4, 172], to: [-1, -0.4, 128], t: [0.05, 1] }];
S[38].cam = { from: [18, 16, 118], to: [17, 15, 120], look: [-4, 0, 160], lookTo: [-1, 0, 135], fov: 42 };
// 29: desperate, not angry
S[29].cast[0].face = 'scared';
// 33-35: both counters and the joined hands in frame
S[33].cam = cam({ pos: [P_b.x - 9, P_b.y + 6, P_b.z - 9], look: [P_b.x - 2.5, P_b.y + 2.6, P_b.z - 3] }, { pos: [P_b.x - 8.4, P_b.y + 5.6, P_b.z - 8.4], look: [K29.x - 0.5, K29.y + 2.6, K29.z] }, 50);
S[34].cam = trackK('kai', [-5.6, 0.2, -5.0], [-5.2, 0.2, -4.6], 50);
S[35].cam = trackK('kai', [-6.4, 0.6, -5.6], [-6.0, 0.6, -5.2], 50);
// 39: 850 fully in frame
S[39].cam = { from: [TOP.x + 0.6, TOP.y + 4.2, TOP.z + 11.5], to: [TOP.x + 0.6, TOP.y + 4.2, TOP.z + 10.5], look: [TOP.x + 0.6, TOP.y + 3.2, TOP.z + 3.6], fov: 46 };
// 41: lit lighthouse + ferry coming into the harbour by the pier
S[41].props = [ferry([0, 116], 180), PIER]; S[41].fog = [40, 400, '#41506a']; S[41].fogSky = true;
S[41].acts = [{ do: 'move', prop: 'ferry', from: [-1, -0.4, 126], to: [0, -0.4, 116], t: [0, 1] }];
S[41].cam = { from: [20, 10, 150], to: [24, 13, 156], look: [0, 6, 100], lookTo: [0, 14, 40], fov: 50 };

// ---------------- video QA round 1 fixes, part 2 ----------------
S[10].cast[0].rot = 180; S[10].cam = { from: [0.8, 6.8, 149.6], to: [0.7, 6.8, 150.1], look: [0, 6.4, 154.2], fov: 42 };
S[26].cam = { keys: [{ t: 0, ...camAt(STOP_U, 6.2, 2.8, 4.4, 3.4, 0), fov: 50 }, { t: 1, ...camAt(STOP_U, 5.8, 2.6, 4.4, 3.4, 0), fov: 50 }] };
const LO = [-0.55, -0.3, 0.5];
S[34].cam = { keys: [{ t: 0, track: 'kai', off: [-5.8, 0.4, -5.4], lookOff: LO, fov: 50 }, { t: 1, track: 'kai', off: [-5.4, 0.4, -5.0], lookOff: LO, fov: 50 }] };
S[35].cam = { keys: [{ t: 0, track: 'kai', off: [-6.6, 0.6, -6.0], lookOff: LO, fov: 50 }, { t: 1, track: 'kai', off: [-6.2, 0.6, -5.6], lookOff: LO, fov: 50 }] };
S[38].acts = [{ do: 'move', prop: 'ferry', from: [-6, -0.4, 172], to: [-2, -0.4, 145], t: [0.05, 1] }];

sign.at = [on(STOP_U + 0.003, -2.8).x, on(STOP_U + 0.003, -2.8).z]; sign.scale = 1.0;
S[26].cam = { keys: [{ t: 0, ...camAt(STOP_U, 7.0, 3.6, 4.2, 3.2, 0), fov: 56 }, { t: 1, ...camAt(STOP_U, 6.6, 3.4, 4.2, 3.2, 0), fov: 56 }] };
S[35].cam = { keys: [{ t: 0, track: 'pell', off: [-3.0, 0.6, -7.6], lookOff: [0.5, -0.3, -0.5], fov: 50 }, { t: 1, track: 'pell', off: [-2.8, 0.6, -7.0], lookOff: [0.5, -0.3, -0.5], fov: 50 }] };

S[26].cam = { keys: [{ t: 0, ...camAt(STOP_U, 7.0, -3.4, 4.2, 3.2, 0), fov: 56 }, { t: 1, ...camAt(STOP_U, 6.6, -3.2, 4.2, 3.2, 0), fov: 56 }] };
// Pell walks on Kai's other side so the camera sees both numbers and the joined hands
for (const sh of [S[34], S[35], S136]) {
  sh.cast.forEach(c => { if (c.id === 'pell') { c.off = -1.4; } });
  sh.acts.forEach(a => { if (a.do === 'pathwalk' && a.who === 'pell') { a.off0 = -1.4; a.off1 = -1.4; } if (a.do === 'holdhand') a.arm = a.who === 'kai' ? 'R' : 'L'; });
}
S[35].cam = { keys: [{ t: 0, track: 'kai', off: [-6.6, 0.6, -6.0], lookOff: [0.5, -0.3, -0.5], fov: 50 }, { t: 1, track: 'kai', off: [-6.2, 0.6, -5.6], lookOff: [0.5, -0.3, -0.5], fov: 50 }] };
S[34].cam = { keys: [{ t: 0, track: 'kai', off: [-5.8, 0.4, -5.4], lookOff: [0.5, -0.3, -0.5], fov: 50 }, { t: 1, track: 'kai', off: [-5.4, 0.4, -5.0], lookOff: [0.5, -0.3, -0.5], fov: 50 }] };

sign.at = [on(STOP_U + 0.004, 2.2).x, on(STOP_U + 0.004, 2.2).z]; sign.rot = -150; sign.scale = 1.1;

{ const k = on(STOP_U), sg = on(STOP_U + 0.004, 2.2), lk = [(k.x * 0.55 + sg.x * 0.45), k.y + 3.2, (k.z * 0.55 + sg.z * 0.45)];
  const A = camAt(STOP_U, 7.4, -3.0, 4.2, 3.2, 0), B = camAt(STOP_U, 7.0, -2.8, 4.2, 3.2, 0);
  S[26].cam = { keys: [{ t: 0, pos: A.pos, look: lk, fov: 54 }, { t: 1, pos: B.pos, look: lk, fov: 54 }] }; }

// ---------------- video QA round 2 fixes ----------------
S[17].fog = [3, 26, '#5e6f88']; S[17].cam = trackK('kai', [-4.4, 1.0, -4.4], [-4.0, 0.9, -4.0], 50);
{ const k = on(STOP_U), sg = on(STOP_U + 0.004, 2.2), lk = [(k.x * 0.42 + sg.x * 0.58), k.y + 3.2, (k.z * 0.42 + sg.z * 0.58)];
  const A = camAt(STOP_U, 8.0, -3.0, 4.2, 3.2, 0), B = camAt(STOP_U, 7.6, -2.8, 4.2, 3.2, 0);
  S[26].cam = { keys: [{ t: 0, pos: A.pos, look: lk, fov: 54 }, { t: 1, pos: B.pos, look: lk, fov: 54 }] }; }
const PLO = [0.5, -0.4, 0.5];
S[34].cam = { keys: [{ t: 0, track: 'pell', off: [-4.6, 0.6, -4.2], lookOff: PLO, fov: 50 }, { t: 1, track: 'pell', off: [-4.2, 0.6, -3.9], lookOff: PLO, fov: 50 }] };
S[35].cam = { keys: [{ t: 0, track: 'pell', off: [-5.2, 0.8, -4.6], lookOff: PLO, fov: 50 }, { t: 1, track: 'pell', off: [-4.8, 0.8, -4.3], lookOff: PLO, fov: 50 }] };
S[41].cam = { from: [16, 8, 140], to: [19, 11, 146], look: [0, 3, 116], lookTo: [0, 14, 40], fov: 50 };

for (const sh of [S[34], S[35], S136]) sh.acts.forEach(a => { if (a.do === 'holdhand') a.arm = a.who === 'kai' ? 'L' : 'R'; });
S[41].cam = { from: [16, 8, 140], to: [19, 11, 146], look: [-3, 2, 117], lookTo: [0, 14, 40], fov: 52 };

// side by side, inner hands touching at their sides (no arm across the numbers)
for (const sh of [S[34], S[35], S136]) {
  sh.acts = sh.acts.filter(a => a.do !== 'holdhand');
  sh.cast.forEach(c => { if (c.id === 'pell') c.off = -1.25; });
  sh.acts.forEach(a => { if (a.do === 'pathwalk' && a.who === 'pell') { a.off0 = -1.25; a.off1 = -1.25; } if (a.do === 'pathwalk') a.keepArms = true; });
  sh.acts.push({ who: 'kai', do: 'arm', arm: 'L', x: -0.15, z: -0.35, t: [0, 1], hold: true }, { who: 'pell', do: 'arm', arm: 'R', x: -0.15, z: -0.35, t: [0, 1], hold: true });
}

// pair seen from the front, side by side across the frame
for (const sh of [S[34], S[35], S136]) {
  sh.acts = sh.acts.filter(a => a.do !== 'arm');
  sh.cast.forEach(c => { if (c.id === 'pell') c.off = -2.5; });
  sh.acts.forEach(a => { if (a.do === 'pathwalk' && a.who === 'pell') { a.off0 = -2.5; a.off1 = -2.5; } });
  sh.acts.push({ who: 'kai', do: 'arm', arm: 'L', x: 0, z: 0.28, t: [0, 1], hold: true }, { who: 'pell', do: 'arm', arm: 'R', x: 0, z: 0.28, t: [0, 1], hold: true });
}
{ const d = on(STOP_U).dir, n = [d[1], -d[0]], mid = [n[0] * -1.25, 0, n[1] * -1.25];
  const off = (k) => [d[0] * k + mid[0], 1.1, d[1] * k + mid[2]];
  S[34].cam = { keys: [{ t: 0, track: 'kai', off: off(6.4), lookOff: [mid[0], -0.4, mid[2]], fov: 46 }, { t: 1, track: 'kai', off: off(6.0), lookOff: [mid[0], -0.4, mid[2]], fov: 46 }] };
  S[35].cam = { keys: [{ t: 0, track: 'kai', off: off(7.0), lookOff: [mid[0], -0.4, mid[2]], fov: 46 }, { t: 1, track: 'kai', off: off(6.6), lookOff: [mid[0], -0.4, mid[2]], fov: 46 }] }; }

{ const d = on(STOP_U).dir, n = [d[1], -d[0]], mid = [n[0] * -1.25, 0, n[1] * -1.25];
  const off = (k, up) => [d[0] * k + mid[0], up, d[1] * k + mid[2]];
  S[34].cam = { keys: [{ t: 0, track: 'kai', off: off(10.5, 1.8), lookOff: [mid[0], 0.2, mid[2]], fov: 46 }, { t: 1, track: 'kai', off: off(10.0, 1.7), lookOff: [mid[0], 0.2, mid[2]], fov: 46 }] };
  S[35].cam = { keys: [{ t: 0, track: 'kai', off: off(11.0, 1.9), lookOff: [mid[0], 0.2, mid[2]], fov: 46 }, { t: 1, track: 'kai', off: off(10.6, 1.8), lookOff: [mid[0], 0.2, mid[2]], fov: 46 }] }; }
const shots = S.map((s, i) => ({ line: i, dur: +(slot(i) + 0.3).toFixed(3), props: [], acts: [], monsters: [], ...s, line: i }));
const D10 = shots[10].dur, A10 = 1.6; shots[10].dur = A10;
shots.push({ line: 110, dur: +(D10 - A10).toFixed(3), props: [], acts: [], monsters: [], ...S110, line: 110, partOf: 10 });
const D36 = shots[36].dur, A36 = 1.4; shots[36].dur = A36;
shots.push({ line: 136, dur: +(D36 - A36).toFixed(3), props: [], acts: [], monsters: [], ...S136, line: 136, partOf: 36 });
fs.writeFileSync(path.join(OUT, 'shotspec.json'), JSON.stringify({ id: ID, shots }, null, 1));
console.log(`${shots.length} shots, ${shots.reduce((a, s) => a + s.dur, 0).toFixed(1)} s`);
