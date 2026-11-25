// Shot specs for "Nobody Noticed Her, Until The Votes Came In" (one shot per script line; 105 = 2nd part of line 5).
// node render/specs/2026-11-22-story-04.mjs -> output/2026-11-22-story-04/shotspec.json
import fs from 'fs'; import path from 'path';
const ID = '2026-11-22-story-04', OUT = path.join('output', ID);
const narr = fs.readdirSync(OUT).filter(f => /^narration-.*\.json$/.test(f)).map(f => path.join(OUT, f)).sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
const T = JSON.parse(fs.readFileSync(narr, 'utf8')).times;
const script = JSON.parse(fs.readFileSync(fs.readdirSync('scripts').filter(f => f.startsWith(ID) && /\.v\d+\.json$/.test(f) && !f.endsWith('.qa.json')).map(f => path.join('scripts', f)).sort((a, b) => +a.match(/v(\d+)/)[1] - +b.match(/v(\d+)/)[1]).pop(), 'utf8'));
const total = T[T.length - 1].end + (script.tail_hold ?? 0.8);
const slot = i => (i + 1 < T.length ? T[i + 1].start : total) - (i === 0 ? 0 : T[i].start);
const speak = i => { const s0 = i === 0 ? 0 : T[i].start, d = slot(i) + 0.3; return [Math.max(0, (T[i].start - s0) / d), Math.min(1, (T[i].end - s0) / d)]; };

// ---- classroom grid (kit-world.js): chair centres, students face -z (the board) ----
const COLS = [-10, -3.5, 3.5, 10], ROWS = [-6, 0, 6];
const seat = (r, c) => [COLS[c], ROWS[r] + 2.4];
const SEATS = { maya: [0, 0], s1: [0, 1], mia: [0, 2], s5: [0, 3], sam: [1, 0], kid: [1, 1], w1: [1, 2], w2: [1, 3], theo: [2, 0], l1: [2, 1], l2: [2, 2], ellie: [2, 3] };
const WHO = { maya: 'maya', s1: 'stu1', mia: 'stu3', s5: 'stu5', sam: 'stu4', kid: 'stu2', w1: 'walker', w2: 'neighbor', theo: 'theo', l1: 'listener', l2: 'kida', ellie: 'ellie' };
const FACE0 = { maya: 'happy', ellie: 'neutral' };
const ids = Object.keys(SEATS).filter(k => k !== 'l2');
const klass = (faces = {}, extra = {}) => ids.map(k => ({ id: k, who: WHO[k], at: seat(...SEATS[k]), rot: 180, face: faces[k] || FACE0[k] || 'neutral', ...(extra[k] || {}) }));
const sitAll = (list = ids) => list.map(k => ({ who: k, do: 'sit', seat: 1.75, t: [0, 1], hold: true }));
const face = (who, kind, t) => ({ who, do: 'face', kind, t });
const gaze = (who, gx, gy, t) => ({ who, do: 'gaze', gx, gy, t });
const cam = (A, B, look, fov = 42, lookTo) => ({ from: A, to: B || A, look, lookTo, fov });
const CLASS = { loc: 'classroom', light: 'day', exposure: 0.8 };
const [EX, EZ] = seat(...SEATS.ellie), [MX, MZ] = seat(...SEATS.maya), [TX, TZ] = seat(...SEATS.theo);
const S = [];

// 0 title: the ballot box; a slip drops into the slot
S[0] = { ...CLASS, props: [{ id: 'bb', type: 'ballotbox', at: [-12, 3.4, -12.5], rot: 180 }, { id: 'sl', type: 'slip', at: [-12, 8.4, -12.2] }], cast: [],
  acts: [{ do: 'move', prop: 'sl', from: [-12, 8.4, -12.2], to: [-12, 5.95, -12.4], t: [0.25, 0.7], ease: 'in' }, { do: 'hide', acc: 'sl', t: 0.78 }],
  cam: cam([-7.2, 7.4, -5.6], [-7.6, 7.0, -6.2], [-12, 4.8, -12.5], 42) };
// 1 the class writes its votes (wide from the back)
S[1] = { ...CLASS, cast: klass(), acts: [...sitAll(), ...ids.filter(k => !['ellie'].includes(k)).map((k, i) => ({ who: k, do: 'lookdown', t: [0.05 + 0.03 * i, 1], hold: true }))],
  cam: cam([0, 12, 15], [0, 11.4, 13.6], [0, 5, -8], 52) };
// 2 everyone expected Maya (she waves, smug)
S[2] = { ...CLASS, cast: klass({ maya: 'happy' }), acts: [...sitAll(), { who: 'maya', do: 'wave', arm: 'R', t: [0.1, 1], hold: true }],
  cam: cam([-6.5, 6.4, -9.4], [-7, 6.2, -8.8], [MX, 5.2, MZ], 40) };
// 3 nobody looked at Ellie (back row, head down)
S[3] = { ...CLASS, cast: klass({ ellie: 'sad' }), acts: [...sitAll(), { who: 'ellie', do: 'lookdown', t: [0, 1], hold: true }],
  cam: cam([7, 6.4, 2.0], [7.4, 6.2, 2.6], [EX, 5.0, EZ], 40) };
// 4 library: Ellie eats alone (tray + book)
const LIB = { loc: 'library', light: 'day', exposure: 0.8 };
S[4] = { ...LIB, props: [{ id: 'lt', type: 'lunchtray', at: [0.5, 2.95, 1.2] }, { id: 'bk', type: 'book', at: [-1.7, 2.98, 1.4] }], cast: [{ id: 'ellie', who: 'ellie', at: [0, 4.2], rot: 180, face: 'sad' }],
  acts: [{ who: 'ellie', do: 'sit', seat: 1.75, t: [0, 1], hold: true }, { who: 'ellie', do: 'lookdown', t: [0, 1], hold: true }],
  cam: cam([4.6, 6.8, -4.4], [4.2, 6.5, -3.8], [0.2, 4.4, 4.2], 46) };
// 5 "But she always noticed who else was alone." Ellie looks up toward the doorway; 105 = the hallway: Theo (orange hoodie) alone
S[5] = { ...LIB, props: [{ id: 'bk', type: 'book', at: [-1.7, 2.98, 1.4] }], cast: [{ id: 'ellie', who: 'ellie', at: [0, 4.2], rot: 180, face: 'neutral' }],
  acts: [{ who: 'ellie', do: 'sit', seat: 1.75, t: [0, 1], hold: true }, face('ellie', 'comforting', 0.3), { who: 'ellie', do: 'lookside', deg: 38, t: [0.25, 0.7], hold: true }, gaze('ellie', 0.9, 0.2, 0.4)],
  cam: cam([4.6, 6.6, -3.0], [4.2, 6.4, -2.4], [0.2, 4.6, 4.2], 42) };
const S105 = { loc: 'hallway', light: 'day', exposure: 0.8, cast: [{ id: 'theo', who: 'theo', at: [-7.0, -6], rot: 90, face: 'sad' }], acts: [{ who: 'theo', do: 'sit', seat: 0.2, t: [0, 1], hold: true }, { who: 'theo', do: 'lookdown', t: [0, 1], hold: true }],
  cam: cam([5, 5.2, 12], [4.4, 5.0, 11], [-7, 2.8, -6], 42) };
// 6 the teacher reads the result; the room is silent (from the back of the class)
S[6] = { ...CLASS, props: [{ id: 'sl', type: 'slip', at: [-2.6, 4.9, -7.5], rot: 90 }], cast: [...klass({}, {}).map(c => ({ ...c, face: 'nervous' })), { id: 'reed', who: 'reed', at: [-3, -9.6], rot: 0, face: 'nervous', acc: { handR: [['slip']] } }],
  acts: [...sitAll(), { who: 'reed', do: 'give', t: [0.1, 1], hold: true }, ...ids.map((k, i) => gaze(k, 0, 0.1, 0.1))],
  cam: cam([0, 8.4, 14], [-0.4, 8.0, 12.6], [-3, 5.4, -9], 48) };
S[6].props = [];
// 7 "Ellie had won. By a lot." she looks up, then behind her
S[7] = { ...CLASS, cast: klass({ ellie: 'sad' }), acts: [...sitAll(), { who: 'ellie', do: 'lookdown', t: [0, 0.2] }, face('ellie', 'surprised', 0.22), { who: 'ellie', do: 'lookside', deg: 55, t: [0.55, 0.95], hold: true }],
  cam: cam([7.4, 6.6, 3.2], [7.8, 6.4, 3.8], [EX, 5.2, EZ], 38) };
// 8 "Someone laughed." two students laugh
const [S1X, S1Z] = seat(...SEATS.s1), [MiX, MiZ] = seat(...SEATS.mia);
S[8] = { ...CLASS, cast: klass({ s1: 'happy', mia: 'happy' }, { s1: { talk: [[0.05, 0.9, 0.7]] }, mia: { talk: [[0.1, 0.95, 0.7]] } }), acts: [...sitAll(), { who: 's1', do: 'shiver', t: [0, 1], hold: true }, { who: 'mia', do: 'shiver', t: [0, 1], hold: true }],
  cam: cam([0, 6.6, -9.4], [0.2, 6.4, -8.8], [0, 5.2, -3.6], 44) };
// 9 Kid: "This has to be a prank." scoffing
const [KX, KZ] = seat(...SEATS.kid);
S[9] = { ...CLASS, cast: klass({ kid: 'confused' }, { kid: { talk: [speak(9)] } }), acts: [...sitAll(), { who: 'kid', do: 'shake', t: [0.4, 0.9] }],
  cam: cam([KX + 2.2, 6.2, KZ - 5.4], [KX + 2.6, 6.0, KZ - 4.8], [KX, 5.1, KZ], 38) };
// 10 the teacher recounts: stacks of slips grow on his desk
S[10] = { ...CLASS, props: [{ id: 'st1', type: 'stack', at: [-13.8, 3.42, -12.2] }, { id: 'st2', type: 'stack', at: [-12.4, 3.42, -12.2] }, { id: 'st3', type: 'stack', at: [-11.0, 3.42, -12.2] }, { id: 'st4', type: 'stack', at: [-9.9, 3.42, -12.2], scale: 1.3 }],
  cast: [{ id: 'reed', who: 'reed', at: [-12, -14.6], rot: 0, face: 'determined' }],
  acts: [{ who: 'reed', do: 'lookdown', t: [0, 1], hold: true }, { who: 'reed', do: 'arm', arm: 'R', x: -0.7, z: -0.15, t: [0, 1], hold: true }, { do: 'appear', acc: 'st1', t: [0.0, 0.1] }, { do: 'appear', acc: 'st2', t: [0.25, 0.35] }, { do: 'appear', acc: 'st3', t: [0.5, 0.6] }, { do: 'appear', acc: 'st4', t: [0.7, 0.8] }],
  cam: cam([-6.0, 7.2, -5.0], [-6.4, 7.0, -5.6], [-11.4, 4.6, -12.8], 44) };
// 11-12 Maya stares at the paper, then says "No. That can't be right."
S[11] = { ...CLASS, cast: klass({ maya: 'surprised' }, { maya: { acc: { handR: [['slip']] } } }), acts: [...sitAll(), { who: 'maya', do: 'phone', t: [0, 1], hold: true }, { who: 'maya', do: 'tremble', t: [0.2, 1] }],
  cam: cam([-6.6, 6.2, -9.0], [-7.0, 6.0, -8.4], [MX, 5.1, MZ], 36) };
S[12] = { ...CLASS, cast: klass({ maya: 'scared' }, { maya: { acc: { handR: [['slip']] }, talk: [speak(12)] } }), acts: [...sitAll(), { who: 'maya', do: 'phone', t: [0, 1], hold: true }, { who: 'maya', do: 'shake', t: [0.3, 0.9] }],
  cam: cam([-6.0, 6.2, -9.0], [-6.4, 6.0, -8.4], [MX, 5.1, MZ], 34) };
// 13 Theo stands up
S[13] = { ...CLASS, cast: klass({ theo: 'nervous' }), acts: [...sitAll(ids.filter(k => k !== 'theo')), { who: 'theo', do: 'sit', seat: 1.75, t: [0, 0.3] }, ...ids.filter(k => k !== 'theo').map((k, i) => ({ who: k, do: 'lookside', deg: 24, t: [0.3, 0.7], hold: true }))],
  cam: cam([-6.0, 6.8, 3.0], [-6.6, 6.6, 3.6], [TX, 5.4, TZ], 40) };
// 14-15 flashback in the hallway: Theo on the floor, kids walk past; Ellie sits beside him
const HALL = { loc: 'hallway', light: 'day', exposure: 0.78, mood: 'cool' };
const walkers = [{ id: 'k1', who: 'stu2', at: [-1, 12], rot: 180 }, { id: 'k2', who: 'stu5', at: [2, 18], rot: 180 }, { id: 'k3', who: 'walker', at: [-3.4, 24], rot: 180 }].map(c => ({ ...c, face: 'neutral' }));
const walkActs = walkers.map((c, i) => ({ who: c.id, do: 'walk', to: [c.at[0], -14], t: [0.0, 1] }));
S[14] = { ...HALL, cast: [{ id: 'theo', who: 'theo', at: [-7.0, 0], rot: 90, face: 'crying', talk: [speak(14)] }, ...walkers.map(c => ({ ...c, rot: 0 }))],
  acts: [{ who: 'theo', do: 'sit', seat: 0.2, t: [0, 1], hold: true }, { who: 'theo', do: 'lookdown', t: [0, 1], hold: true }, ...walkers.map(c => ({ who: c.id, do: 'walk', to: [c.at[0], c.at[1] - 28], t: [0, 1], face: false }))],
  cam: cam([2.2, 4.6, 4.2], [2.0, 4.4, 3.6], [-7, 2.9, 0.2], 44) };
S[15] = { ...HALL, cast: [{ id: 'theo', who: 'theo', at: [-7.0, 0], rot: 90, face: 'sad', talk: [speak(15)] }, { id: 'ellie', who: 'ellie', at: [-7.0, -3.0], rot: 90, face: 'comforting' }],
  acts: [{ who: 'theo', do: 'sit', seat: 0.2, t: [0, 1], hold: true }, { who: 'ellie', do: 'sit', seat: 0.2, t: [0, 1], hold: true }, { who: 'theo', do: 'lookdown', t: [0, 0.5] }, face('theo', 'relieved', 0.6)],
  cam: cam([2.6, 4.8, 3.4], [2.2, 4.6, 2.8], [-7, 3.0, -1.6], 48) };
// 16 Mia and 17 Sam stand up and say what Ellie did
const [SaX, SaZ] = seat(...SEATS.sam);
S[16] = { ...CLASS, cast: klass({ mia: 'happy', ellie: 'holdtears' }, { mia: { talk: [speak(16)] } }), acts: [...sitAll(ids.filter(k => k !== 'mia')), { who: 'mia', do: 'sit', seat: 1.75, t: [0, 0.2] }],
  cam: cam([MiX - 1.8, 6.6, MiZ - 5.4], [MiX - 2.2, 6.4, MiZ - 4.8], [MiX, 5.3, MiZ], 40) };
S[17] = { ...CLASS, cast: klass({ sam: 'happy', ellie: 'holdtears' }, { sam: { talk: [speak(17)] } }), acts: [...sitAll(ids.filter(k => k !== 'sam')), { who: 'sam', do: 'sit', seat: 1.75, t: [0, 0.2] }],
  cam: cam([SaX + 2.2, 6.8, SaZ - 5.4], [SaX + 2.6, 6.6, SaZ - 4.8], [SaX, 5.4, SaZ], 40) };
// 18 hands rise across the room
S[18] = { ...CLASS, cast: klass(Object.fromEntries(ids.map(k => [k, k === 'ellie' ? 'holdtears' : 'happy']))),
  acts: [...sitAll(), ...ids.filter(k => k !== 'ellie').map((k, i) => ({ who: k, do: 'lift', arm: i % 2 ? 'L' : 'R', t: [0.12 + 0.06 * i, 0.3 + 0.06 * i], hold: true })), { who: 'ellie', do: 'lookside', deg: 40, t: [0.4, 0.8], hold: true }],
  cam: cam([0, 10.4, -10.6], [0.4, 9.8, -9.8], [1, 4.6, 4], 62) };
// 19 Ellie never knew anyone was counting (her shy smile)
S[19] = { ...CLASS, cast: klass({ ellie: 'holdtears' }), acts: [...sitAll(), face('ellie', 'relieved', 0.5), { who: 'ellie', do: 'lookup', t: [0.2, 1], hold: true }],
  cam: cam([7.4, 6.4, 2.4], [7.8, 6.2, 3.0], [EX, 5.1, EZ], 38) };
// 20 final: warm light, everyone smiling, class clapping
S[20] = { ...CLASS, mood: 'golden', cast: klass(Object.fromEntries(ids.map(k => [k, 'happy']))), acts: [...sitAll(), ...ids.map((k, i) => ({ who: k, do: 'hug', t: [0.1 + 0.02 * i, 1], hold: true }))],
  cam: cam([2, 9.6, -10.4], [1, 9.2, -9.6], [2, 4.8, 4.5], 58) };


// ---- round 1 fixes ----
S[0].props[0].rot = 0; S[0].props[1].scale = 2.2;
S[0].cam = cam([-4.6, 7.6, -2.2], [-5.0, 7.2, -2.8], [-12, 4.8, -12.5], 40);
S[1].cam = cam([0, 12.6, 15.6], [0, 12.0, 14.4], [0, 6.2, -9], 66);
S[8].cam = cam([0, 7.2, -11.6], [0.2, 7.0, -11.0], [0, 5.0, -3.6], 46);
S[14].cam = cam([-1.2, 4.4, 1.6], [-1.6, 4.2, 1.2], [-7, 3.0, 0.2], 46);
S[18].cam = cam([-1, 10.6, -10.6], [0, 10.0, -9.8], [4, 4.8, 4], 62);

S[8].cam = cam([0, 5.7, -10.4], [0.2, 5.6, -9.8], [0, 5.1, -3.6], 44);
S[18].cam = cam([2, 8.6, -8.4], [3, 8.2, -7.6], [3, 5.0, 5], 56);

S[8] = { ...CLASS, cast: klass({ s1: 'happy', kid: 'happy' }, { s1: { talk: [[0.05, 0.9, 0.7]] }, kid: { talk: [[0.1, 0.95, 0.7]] } }), acts: [...sitAll(), { who: 's1', do: 'shiver', t: [0, 1], hold: true }, { who: 'kid', do: 'shiver', t: [0, 1], hold: true }],
  cam: cam([-1.0, 6.2, -9.6], [-1.4, 6.0, -9.0], [-3.5, 5.0, -0.6], 46) };

// ---------------- video QA round 1 fixes ----------------
// 0: the slip stands upright facing the camera and drops into the slot early
S[0].acts = [{ do: 'tip', acc: 'sl', deg: 85, t: [0, 0.02] }, { do: 'move', prop: 'sl', from: [-12, 8.2, -12.2], to: [-12, 5.95, -12.4], t: [0.08, 0.5], ease: 'in' }, { do: 'hide', acc: 'sl', t: 0.55 }];
S[0].props[1].scale = 2.6;
// 11-12: Maya holds a big, visible ballot paper (upright, in front of her chest)
for (const i of [11, 12]) {
  S[i].props = [{ id: 'pp', type: 'slip', at: [MX + 0.15, 4.5, MZ - 1.3], scale: 3.0 }];
  S[i].cast.forEach(c => { if (c.id === 'maya') delete c.acc; });
  S[i].acts = S[i].acts.filter(a => a.do !== 'phone').concat([{ do: 'tip', acc: 'pp', deg: 80, t: [0, 0.02] }, { who: 'maya', do: 'arm', arm: 'R', x: -1.1, z: -0.1, t: [0, 1], hold: true }, { who: 'maya', do: 'arm', arm: 'L', x: -1.1, z: -0.1, t: [0, 1], hold: true }]);
}
// 18: hands straight up across the room
S[18].acts = [...sitAll(), ...ids.filter(k => k !== 'ellie').map((k, i) => ({ who: k, do: 'arm', arm: i % 2 ? 'L' : 'R', x: -3.0, z: 0.1, t: [0.12 + 0.06 * i, 0.3 + 0.06 * i], hold: true })), { who: 'ellie', do: 'lookside', deg: 40, t: [0.4, 0.8], hold: true }];
S[18].cam = cam([1, 6.0, -9.6], [2, 5.8, -8.8], [2, 6.2, 6], 66);
// 20: Ellie and Maya stand at the front (Maya clapping); the class claps from behind
S[20] = { ...CLASS, mood: 'golden', cast: [...klass(Object.fromEntries(ids.map(k => [k, 'happy']))).filter(c => c.id !== 'ellie' && c.id !== 'maya'), { id: 'ellie', who: 'ellie', at: [1.6, -9.4], rot: 0, face: 'relieved' }, { id: 'maya', who: 'maya', at: [-2.4, -9.4], rot: 0, face: 'happy' }],
  acts: [...sitAll(ids.filter(k => k !== 'ellie' && k !== 'maya')), { who: 'maya', do: 'hug', t: [0.1, 1], hold: true }, ...ids.filter(k => k !== 'ellie' && k !== 'maya').map((k, i) => ({ who: k, do: 'hug', t: [0.1 + 0.02 * i, 1], hold: true })), gaze('ellie', 0, 0.3, 0.2)],
  cam: cam([0, 6.4, 13], [0, 6.2, 11.8], [0, 4.4, -9.4], 44) };
// captions sit at ~68% of the frame height: lower the look-at point so faces sit in the upper-middle
for (const i of [2, 3, 7, 9, 11, 12, 16, 17, 19]) { const c = S[i].cam; c.look = [c.look[0], c.look[1] - 1.2, c.look[2]]; }
{ const c = S[8].cam; c.look = [c.look[0], c.look[1] - 0.9, c.look[2]]; }

for (const i of [11, 12]) S[i].props = [{ id: 'pp', type: 'slip', at: [MX - 0.1, 3.2, MZ - 1.5], scale: 2.1 }];

for (const i of [11, 12]) S[i].props = [{ id: 'pp', type: 'slip', at: [MX + 0.1, 3.4, MZ - 1.5], rot: -90, scale: 2.2 }];
const shots = S.map((s, i) => ({ line: i, dur: +(slot(i) + 0.3).toFixed(3), props: [], acts: [], monsters: [], ...s, line: i }));
const D5 = shots[5].dur, A5 = Math.min(1.3, D5 * 0.5); shots[5].dur = A5;
shots.push({ line: 105, dur: +(D5 - A5).toFixed(3), props: [], acts: [], monsters: [], ...S105, line: 105, partOf: 5 });
fs.writeFileSync(path.join(OUT, 'shotspec.json'), JSON.stringify({ id: ID, shots }, null, 1));
console.log(`${shots.length} shots, ${shots.reduce((a, s) => a + s.dur, 0).toFixed(1)} s`);
