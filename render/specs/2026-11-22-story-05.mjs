// Shot specs for "The Smallest Kid In School Just Jumped Onto The Gym Roof" (one shot per script line; 100 = 2nd part of line 0).
// node render/specs/2026-11-22-story-05.mjs -> output/2026-11-22-story-05/shotspec.json
import fs from 'fs'; import path from 'path';
const ID = '2026-11-22-story-05', OUT = path.join('output', ID);
const narr = fs.readdirSync(OUT).filter(f => /^narration-.*\.json$/.test(f)).map(f => path.join(OUT, f)).sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
const T = JSON.parse(fs.readFileSync(narr, 'utf8')).times;
const script = JSON.parse(fs.readFileSync(fs.readdirSync('scripts').filter(f => f.startsWith(ID) && /\.v\d+\.json$/.test(f) && !f.endsWith('.qa.json')).map(f => path.join('scripts', f)).sort((a, b) => +a.match(/v(\d+)/)[1] - +b.match(/v(\d+)/)[1]).pop(), 'utf8'));
const total = T[T.length - 1].end + (script.tail_hold ?? 0.8);
const slot = i => (i + 1 < T.length ? T[i + 1].start : total) - (i === 0 ? 0 : T[i].start);

const cam = (A, B, look, fov = 42, lookTo) => ({ from: A, to: B || A, look, lookTo, fov });
const face = (who, kind, t) => ({ who, do: 'face', kind, t });
const sitA = (ids) => ids.map(k => ({ who: k, do: 'sit', seat: 1.75, t: [0, 1], hold: true }));
const FIELD = { loc: 'field', light: 'day', exposure: 0.95 };
const HALL = { loc: 'hallway', light: 'day', exposure: 0.8 };
const HOUSE = { loc: 'house', light: 'sunset', time: 'evening', exposure: 0.9 };
const BX = [-17, -19.6, -22.2], TY = [0, 2.2, 4.4];
const crowdLooks = ['c1', 'c2', 'c3', 'c4', 'stu1', 'stu3', 'stu4', 'stu5', 'walker', 'neighbor', 'listener', 'stu2'];
const seats = []; for (let t = 0; t < 3; t++) for (let z = -10; z <= 10; z += 5) seats.push({ at: [BX[t] + 0.2, z + (t % 2 ? 2.5 : 0)], y: TY[t] });
const crowd = (n = 12, faces = 'happy', extra = {}) => seats.slice(0, n).map((s, i) => ({ id: 'cw' + i, who: crowdLooks[i % crowdLooks.length], at: s.at, y: s.y, rot: 90, face: faces, ...(extra[i] || {}) }));
const crowdSit = (n = 12) => sitA(seats.slice(0, n).map((_, i) => 'cw' + i));
const NICO = (o = {}) => ({ id: 'nico', who: 'nico', at: [0, 8], rot: 0, face: 'neutral', ...o });
const CHASE = (o = {}) => ({ id: 'chase', who: 'chase', at: [3, 5], rot: 0, face: 'happy', ...o });
const COACH = (o = {}) => ({ id: 'coach', who: 'reyes', at: [-2.5, 6], rot: 0, face: 'neutral', ...o });
const S = [];

// 0 title: Nico's smirk (extreme close-up); 100 = a flash cut to the tiny figure on the gym roof
S[0] = { ...FIELD, cast: [NICO({ face: 'happy' })], acts: [], cam: cam([0.3, 3.7, 10.8], [0.2, 3.6, 10.2], [0, 2.7, 8], 28) };
const S100 = { ...FIELD, cast: [{ id: 'nico', who: 'nico', at: [-4, -31], y: 65.4, rot: 0, face: 'happy' }], acts: [], cam: cam([-4, 50, 5], [-4, 51, 4], [-4, 66.5, -31], 24) };
// 1 flashback: little Nico bounds up onto the kitchen table
S[1] = { ...HOUSE, flashback: true, cast: [{ id: 'nico', who: 'nico', at: [-6.5, 7], rot: 25, face: 'happy', scale: 0.5 }],
  acts: [{ who: 'nico', do: 'jump', to: [0.6, 1.6], toY: 2.75, h: 3.2, t: [0.35, 0.8] }], cam: cam([0.5, 6.4, 13.5], [0.5, 6.0, 12.5], [-1, 2.8, 2], 46) };
// 2 the promise: mum holds his shoulders
S[2] = { ...HOUSE, cast: [{ id: 'mum', who: 'momn', at: [-1.7, 0], rot: 90, face: 'determined' }, { id: 'nico', who: 'nico', at: [1.1, 0], rot: -90, face: 'nervous' }],
  acts: [{ who: 'mum', do: 'reach', both: true, t: [0.1, 1], hold: true }, { who: 'nico', do: 'nod', t: [0.5, 0.85] }, face('nico', 'determined', 0.55)], cam: cam([3.6, 5.2, 9], [3.4, 5.0, 8.4], [-0.3, 3.3, 0], 40) };
// 3 hallway: Nico walks alone; kids pass without looking
S[3] = { ...HALL, cast: [{ id: 'nico', who: 'nico', at: [0, -10], rot: 0, face: 'sad' }, { id: 'k1', who: 'c1', at: [-3.4, 4], rot: 180 }, { id: 'k2', who: 'c2', at: [3.6, 8], rot: 180 }, { id: 'k3', who: 'c3', at: [-3, 12], rot: 180 }],
  acts: [{ who: 'nico', do: 'walk', to: [0, 3], t: [0, 1] }, { who: 'nico', do: 'lookdown', t: [0, 1], hold: true }, { who: 'k1', do: 'walk', to: [-3.4, -22], t: [0, 1] }, { who: 'k2', do: 'walk', to: [3.6, -20], t: [0, 1] }, { who: 'k3', do: 'walk', to: [-3, -18], t: [0, 1] }],
  cam: cam([0, 4.6, 12], [0, 4.4, 11.4], [0, 2.6, 0], 44) };
// 4 the contest: the crowd snickers, Nico is tiny beside the bar
S[4] = { ...FIELD, cast: [...crowd(12, 'happy'), NICO({ at: [0, 9], face: 'nervous' })], acts: [...crowdSit(12), ...seats.slice(0, 12).map((_, i) => ({ who: 'cw' + i, do: 'shiver', t: [0, 1], hold: true })), { who: 'nico', do: 'lookdown', t: [0.2, 1], hold: true }],
  cam: cam([11, 7, 15], [10, 6.6, 14], [-9, 2.6, 2], 56) };
// 5 Chase flexes (low angle)
S[5] = { ...FIELD, cast: [CHASE({ at: [2, 4], face: 'happy' }), ...crowd(6, 'happy')], acts: [{ who: 'chase', do: 'arm', arm: 'R', x: -0.9, z: -1.5, t: [0.2, 0.5], hold: true }, { who: 'chase', do: 'arm', arm: 'L', x: -0.9, z: -1.5, t: [0.2, 0.5], hold: true }, ...crowdSit(6)],
  cam: cam([2.2, 2.0, 11.5], [2.2, 2.4, 10.5], [2, 4.6, 4], 46) };
// 6 one jump only: Coach Reyes holds up one finger; a sign
S[6] = { ...FIELD, props: [{ id: 'sg', type: 'sign', color: 'ONE JUMP', at: [-1.5, 0, 4], rot: 0, scale: 1.6 }], cast: [COACH({ at: [3, 6] })],
  acts: [{ who: 'coach', do: 'point', arm: 'R', up: -1.5, t: [0.25, 0.5], hold: true }], cam: cam([2.6, 5.4, 12.5], [2.6, 5.2, 11.8], [1.2, 3.6, 5], 46) };
// 7 Chase soars over the bar (a record sign); the crowd erupts
S[7] = { ...FIELD, props: [{ id: 'rec', type: 'sign', color: '2 m|RECORD', at: [-8.4, 0, -4], rot: 90, scale: 1.5 }], cast: [{ id: 'chase', who: 'chase', at: [0, 20], rot: 180, face: 'determined' }, ...crowd(9, 'surprised')],
  acts: [{ who: 'chase', do: 'run', to: [0, 4], t: [0, 0.5] }, { who: 'chase', do: 'jump', to: [0, -6], toY: 0, h: 9, t: [0.5, 0.9], crouch: 0.1 }, face('chase', 'happy', 0.92), ...crowdSit(9), ...seats.slice(0, 9).map((_, i) => ({ who: 'cw' + i, do: 'arm', arm: i % 2 ? 'L' : 'R', x: -3.0, z: 0.1, t: [0.55 + 0.02 * i, 0.7 + 0.02 * i], hold: true }))],
  cam: cam([11, 5.5, 14], [10.5, 5.8, 12.5], [0, 5.2, -1.5], 54) };
// 8 a whisper from the crowd (a kid on the bleachers)
S[8] = { ...FIELD, cast: [...crowd(8, 'neutral', { 2: { face: 'confused' } })], acts: [...crowdSit(8)], cam: cam([-12, 7.6, 3], [-12.4, 7.4, 2.8], [-19.4, 5.2, 0], 40) };
// 9 the decision: Nico's face hardens
S[9] = { ...FIELD, cast: [NICO({ face: 'sad' })], acts: [face('nico', 'determined', 0.45), { who: 'nico', do: 'lookup', t: [0.5, 1], hold: true }], cam: cam([0.4, 3.9, 11.6], [0.3, 3.8, 11.0], [0, 2.6, 8], 30) };
// 10 sneakers on the mat; 11 the ground cracks
S[10] = { ...FIELD, cast: [NICO({ at: [0, 8], face: 'determined' })], acts: [], cam: cam([1.1, 1.1, 11.4], [0.9, 0.9, 11.0], [0, 0.4, 8], 32) };
S[11] = { ...FIELD, props: [{ id: 'ck', type: 'crack', at: [0, 0.2, 8], scale: 1.6 }], cast: [NICO({ at: [0, 8], face: 'determined' })], acts: [{ do: 'appear', acc: 'ck', t: [0.25, 0.55] }],
  cam: { ...cam([1.8, 1.5, 12.6], [1.4, 1.3, 12.0], [0, 1.6, 8], 40), shake: 0.04 } };
// 12 the launch: Nico crouches and rockets up to the roof; the camera chases him
S[12] = { ...FIELD, cast: [NICO({ at: [0, 8], face: 'determined' })], acts: [{ who: 'nico', do: 'jump', to: [-4, -31], toY: 65.4, h: 24, t: [0.25, 0.95], crouch: 0.15 }, face('nico', 'happy', 0.5)],
  cam: { keys: [{ t: 0, pos: [2.5, 1.5, 12.8], look: [0, 2.2, 8], fov: 38 }, { t: 0.3, track: 'nico', off: [6, 2, 11], lookOff: [0, 0, 0], fov: 50 }, { t: 1, track: 'nico', off: [6, -4, 14], lookOff: [0, 0, 0], fov: 50 }] } };
// 13 he waves from the roof
S[13] = { ...FIELD, cast: [{ id: 'nico', who: 'nico', at: [-4, -31], y: 64, rot: 0, face: 'happy' }], acts: [{ who: 'nico', do: 'wave', arm: 'R', t: [0.15, 1], hold: true }], cam: cam([-4, 36, -6], [-4, 38, -8], [-4, 62.5, -31], 34) };
// 14 nobody breathed: the frozen crowd
S[14] = { ...FIELD, cast: [...crowd(12, 'surprised'), CHASE({ at: [2, 4], face: 'scared' })], acts: [...crowdSit(12), ...seats.slice(0, 12).map((_, i) => ({ who: 'cw' + i, do: 'freeze', t: [0, 1], hold: true }))], cam: cam([10, 7, 13], [9.4, 6.8, 12.4], [-15, 3.2, 1], 60) };
// 15 Coach Reyes unrolls the tape (hands shaking)
S[15] = { ...FIELD, cast: [COACH({ at: [2.5, 6], face: 'surprised' })], acts: [{ who: 'coach', do: 'reach', both: true, t: [0, 1], hold: true }, { who: 'coach', do: 'tremble', t: [0.1, 1] }], cam: cam([2.5, 4.4, 10.6], [2.5, 4.3, 10.0], [2.5, 2.9, 6], 34) };
// 16 the board: old record vs new
S[16] = { ...FIELD, props: [{ id: 'bd', type: 'sign', color: 'OLD 2 m|NEW 20 m', at: [0, 0, 6], rot: 0, scale: 2.6 }, { id: 'sg', type: 'sign', color: '', at: [100, 0, 100] }], cast: [COACH({ at: [5.6, 6], face: 'surprised' })], acts: [], cam: cam([0, 7.6, 17.5], [0, 7.4, 16.5], [0, 6.6, 6], 40) };
// 17 kids gather around Nico, chanting
const ring = [[-3.3, 8.6, 90], [3.3, 8.6, -90], [-2.4, 11.2, 60], [2.4, 11.2, -60], [-4.6, 6.4, 100], [4.6, 6.4, -100]];
S[17] = { ...FIELD, cast: [NICO({ at: [0, 8.8], face: 'happy' }), ...ring.map((r, i) => ({ id: 'r' + i, who: crowdLooks[i], at: [r[0], r[1]], rot: r[2], face: 'happy', talk: [[0.1, 0.9, 0.8]] }))],
  acts: ring.map((r, i) => ({ who: 'r' + i, do: 'arm', arm: i % 2 ? 'L' : 'R', x: -3.0, z: 0.1, t: [0.1 + 0.05 * i, 0.3 + 0.05 * i], hold: true })), cam: cam([0, 6.2, 17], [0.4, 5.8, 15.6], [0, 3.6, 9], 48) };
// 18 even Chase claps
S[18] = { ...FIELD, cast: [CHASE({ at: [2, 4], face: 'sad' })], acts: [face('chase', 'comforting', 0.5), { who: 'chase', do: 'hug', t: [0.45, 1], hold: true }], cam: cam([2, 5.8, 11.4], [2, 5.6, 10.8], [2, 4.0, 4], 40) };
// 19 his mum smiles in the stands
S[19] = { ...FIELD, cast: [{ id: 'mum', who: 'momn', at: [BX[1] + 0.2, 0.5], y: TY[1], rot: 90, face: 'holdtears' }, ...crowd(7, 'happy').filter((c, i) => i !== 4)],
  acts: [{ who: 'mum', do: 'sit', seat: 1.75, t: [0, 1], hold: true }, ...crowdSit(7).filter(a => a.who !== 'cw4'), face('mum', 'happy', 0.5), { who: 'mum', do: 'wipe', arm: 'R', t: [0.1, 0.4] }], cam: cam([-12.6, 7.6, 0.8], [-13, 7.4, 0.6], [-19.4, 6.0, 0.5], 36) };
// 20 final hero shot: Nico against the sky
S[20] = { ...FIELD, cast: [NICO({ at: [0, 8], face: 'happy' })], acts: [{ who: 'nico', do: 'arm', arm: 'R', x: -3.0, z: 0.2, t: [0.2, 0.6], hold: true }], cam: cam([0.6, 1.2, 11.6], [0.3, 1.5, 11.0], [0, 4.6, 8], 42) };

// ---- framing overrides (head heights: nico 3.9, chase 6.3, coach 5.3, mum 5.0) ----
const fc = (cx, cz, H, d, fov, dx = 0.3) => cam([cx + dx, H + 0.1, cz + d], [cx + dx - 0.1, H + 0.1, cz + d - 0.5], [cx, H - 0.5, cz], fov);
S[0].cam = fc(0, 8, 3.9, 2.9, 28);
S[9].cam = fc(0, 8, 3.9, 3.5, 30);
S[5].cast = [CHASE({ at: [2, 4], face: 'happy' }), ...crowd(6, 'happy')]; S[5].cam = fc(2, 4, 6.3, 5.5, 36, 0.2);
S[6].cast = [COACH({ at: [1.2, 6] })]; S[6].cam = fc(1.2, 6, 5.3, 6, 40, 0.3);
S[15].cam = fc(2.5, 6, 5.3, 4.5, 34, 0.2);
S[18].cam = fc(2, 4, 6.3, 5.5, 36, 0.2);
S[16].props = [{ id: 'bd', type: 'sign', color: 'OLD 2 m|NEW 20 m', at: [0, 0, 6], rot: 0, scale: 2.0 }];
S[16].cast = []; S[16].cam = cam([1.0, 5.5, 24], [1.0, 5.3, 23], [0, 4.3, 6], 38);
S[8].cam = cam([-10.5, 4.2, 2.5], [-10.7, 4.1, 2.3], [-16.8, 3.7, 0], 30);
S[19].cast = [S[19].cast[0], ...S[19].cast.slice(1).filter((c, i) => i >= 3 && i !== 4)];
S[19].acts = [S[19].acts[0], ...S[19].acts.slice(1).filter(a => !['cw0','cw1','cw2','cw4'].includes(a.who) && !a.t?.includes?.(9))];
S[19].cam = cam([-11, 7.4, 0.5], [-11.2, 7.3, 0.4], [-19.4, 4.9, 0.5], 32);
S[13].cast = [{ id: 'nico', who: 'nico', at: [-4, -31], y: 65.4, rot: 0, face: 'happy' }]; S[13].cam = cam([-4, 64, -14], [-4, 64.3, -14.5], [-4, 68, -31], 28);
S[14].cast = crowd(12, 'surprised'); S[14].cam = cam([-6, 6.5, 9], [-6.4, 6.4, 8.6], [-19, 3.5, -1], 52);
S[2].cast[0].at = [-1.3, 0]; S[2].cast[1].at = [0.9, 0]; S[2].cam = cam([3.6, 4.8, 14], [3.4, 4.7, 13.5], [-0.2, 3.0, 0], 40);
S[1].cast[0].at = [-3, 6]; S[1].cam = cam([0.5, 5, 12], [0.5, 4.9, 11.5], [0.5, 3.4, 1.6], 40);
S[10].cam = cam([1.1, 1.0, 11.4], [0.9, 0.9, 11.0], [0, 0.3, 8], 32);
S[11].cam = { ...cam([2.2, 5.5, 12.5], [2.0, 5.4, 12.1], [0, 0.6, 8.3], 40), shake: 0.04 };
S[7].cast[0].at = [0, 12]; S[7].acts[0] = { who: 'chase', do: 'run', to: [0, 4], t: [0, 0.5] }; S[7].cam = cam([13, 6, 22], [12.6, 6, 21], [0, 5, 0], 48);
// ---- video-QA fixes ----
S[6].acts = [face('coach', 'determined', 0.05), { who: 'coach', do: 'point', arm: 'R', up: -1.2, t: [0.2, 0.45], hold: true }]; S[6].cam = cam([2.4, 5.0, 14], [2.2, 4.9, 13.5], [1.0, 4.0, 6], 46);
S[6].props = [{ id: 'sg', type: 'sign', color: 'ONE JUMP', at: [3.8, 0, 6], rot: 0, scale: 1.2 }];
S[15].props = [{ id: 'tp', type: 'sign', color: '0|20 m', at: [0.3, 0, 7], rot: 0, scale: 1.0 }];
S[15].acts = [face('coach', 'surprised', 0.05), { who: 'coach', do: 'reach', both: true, t: [0, 0.3], hold: true }, { who: 'coach', do: 'tremble', t: [0.1, 1] }]; S[15].cam = cam([2.9, 4.6, 14], [2.7, 4.5, 13.5], [1.6, 3.6, 6], 44);
S[7].cam = cam([16, 7.5, 26], [15.6, 7.5, 25], [-5, 6.5, -2], 58);
S[7].props = [{ id: 'rec', type: 'sign', color: '2 m|RECORD', at: [-8.4, 0, -4], rot: 90, scale: 2.2 }];
S[8].cast = crowd(8, 'neutral', { 2: { face: 'confused', talk: [[0.1, 0.9, 0.5]] } });
S[1].flashback = false; S[1].cast[0].at = [-1.5, 6]; S[1].cam = cam([0.5, 6, 15], [0.5, 5.9, 14.5], [0.5, 3.6, 1.6], 44);
S[12].cam = { keys: [{ t: 0, pos: [3, 1.0, 12], look: [0, 3, 8], fov: 50 }, { t: 0.3, pos: [3, 1.0, 12], look: [0, 3, 8], fov: 50 }, { t: 0.55, pos: [3, 1.0, 12], look: [-1, 26, 0], fov: 55 }, { t: 0.75, track: 'nico', off: [6, -4, 14], lookOff: [0, 0, 0], fov: 50 }, { t: 1, track: 'nico', off: [6, -4, 14], lookOff: [0, 0, 0], fov: 50 }] };
S[18].acts = [face('chase', 'happy', 0.05), { who: 'chase', do: 'arm', arm: 'R', x: -1.4, z: -0.7, t: [0.2, 0.4], hold: true }, { who: 'chase', do: 'arm', arm: 'L', x: -1.4, z: -0.7, t: [0.2, 0.4], hold: true }];
S[18].cam = fc(2, 4, 5.8, 6.5, 40, 0.2);
const shots = S.map((s, i) => ({ line: i, dur: +(slot(i) + 0.3).toFixed(3), props: [], acts: [], monsters: [], ...s, line: i }));
const D0 = shots[0].dur, A0 = Math.min(1.0, D0 * 0.45); shots[0].dur = +(D0 - A0).toFixed(3);
shots.push({ line: 100, dur: +A0.toFixed(3), props: [], acts: [], monsters: [], ...S100, line: 100, partOf: 0 });
fs.writeFileSync(path.join(OUT, 'shotspec.json'), JSON.stringify({ id: ID, shots }, null, 1));
console.log(`${shots.length} shots, ${shots.reduce((a, s) => a + s.dur, 0).toFixed(1)} s`);
