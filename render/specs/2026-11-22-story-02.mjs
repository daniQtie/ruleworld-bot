// Shot specs for kit script 001 "In This Town, Only The Person You Lie To Can See Your Monster" (one shot per line).
// node render/specs/2026-11-22-story-02.mjs  -> output/2026-11-22-story-02/shotspec.json
// Continuity: Noah (blue hoodie) / Lily (pink sweater, bow) from render/kit.js; monster grows only after a lie.
import fs from 'fs'; import path from 'path';
const ID = '2026-11-22-story-02', OUT = path.join('output', ID);
const narr = fs.readdirSync(OUT).filter(f => /^narration-.*\.json$/.test(f)).map(f => path.join(OUT, f)).sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
const N = JSON.parse(fs.readFileSync(narr, 'utf8')), T = N.times;
const script = JSON.parse(fs.readFileSync(fs.readdirSync('scripts').filter(f => f.startsWith(ID) && !f.endsWith('.qa.json')).map(f => path.join('scripts', f)).sort().pop(), 'utf8'));
const total = T[T.length - 1].end + (script.tail_hold ?? 0.8);
const slot = i => (i + 1 < T.length ? T[i + 1].start : total) - (i === 0 ? 0 : T[i].start);
const speak = i => { const s0 = i === 0 ? 0 : T[i].start, d = slot(i) + 0.3; return [Math.max(0, (T[i].start - s0) / d), Math.min(1, (T[i].end - s0) / d)]; };   // fraction window where line i is heard

const TOP = 2.82, SEAT = { noah: [-2.4, -1.2], lily: [2.6, -1.2] };
const sit = (who, t = [0, 1]) => ({ who, do: 'sit', seat: 1.75, t, hold: true });
const noahC = (o = {}) => ({ id: 'noah', who: 'noah', at: SEAT.noah, rot: 0, face: 'neutral', ...o });
const lilyC = (o = {}) => ({ id: 'lily', who: 'lily', at: [5.8, -3.4], rot: -70, face: 'happy', ...o });
const face = (who, kind, t) => ({ who, do: 'face', kind, t });
const gaze = (who, gx, gy, t) => ({ who, do: 'gaze', gx, gy, t });
const M = (o) => ({ id: 'm', rot: 0, eyes: 0.5, ...o });
const cam = (from, to, look, fov = 40, lookTo) => ({ from, to, look, lookTo, fov });
const BS = { noah: [-1.7, -1.2], lily: [1.7, -1.2] };
const birthdayProps = [
  { id: 'cake', type: 'cake', at: [2.6, TOP, 3.0] }, { id: 'pn', type: 'plate', at: [-1.7, TOP, 0.4] }, { id: 'pl', type: 'plate', at: [1.7, TOP, 0.4] },
  { id: 'pd', type: 'plateslice', at: [4.4, TOP, 1.5] }, { id: 'lt', type: 'lighter', at: [0.4, TOP + 0.1, 0.9], rot: 30 }];
const trackPhone = (o1, o2) => ({ keys: [{ t: 0, track: 'noah.handR0', off: o1, fov: 44 }, { t: 1, track: 'noah.handR0', off: o2, fov: 44 }] });
const home = (o) => ({ loc: 'house', light: 'sunset', time: 'evening', ...o });
const bday = (o) => ({ loc: 'house', light: 'sunset', time: 'night', birthday: true, seats: BS, props: birthdayProps, ...o });
const TALL = 6.9;

const S = [];
// 0 HOOK: close on Lily's frightened face, then cut over her shoulder: a creature behind Noah he cannot see.
S[0] = home({ mood: 'tense',
  cast: [noahC({ face: 'neutral', gaze: [0.4, 0.7], acc: { handR: [['phone']] } }), lilyC({ face: 'scared', gaze: [-1, 0.4] })],
  acts: [sit('noah'), { who: 'noah', do: 'phone', t: [0, 1], hold: true }],
  monsters: [M({ at: [-3.4, -4.4], rot: 35, h: 'waist', eyes: 0.75 })],
  cam: { keys: [{ t: 0, pos: [2.4, 4.0, -2.2], look: [5.8, 3.6, -3.4], fov: 38 }, { t: 0.48, pos: [2.8, 3.95, -2.4], look: [5.8, 3.6, -3.4], fov: 36 },
    { t: 0.49, cut: true, pos: [8.8, 5.7, -5.4], look: [-2.6, 3.6, -2.6], fov: 42 }, { t: 1, pos: [8.4, 5.5, -5.2], look: [-2.8, 3.5, -2.8], fov: 38 }] } });
// 1 "watched mine grow for three days": wide; the creature grows behind Noah while Lily watches.
S[1] = home({ mood: 'warm',
  cast: [noahC({ gaze: [0.4, 0.7], acc: { handR: [['phone']] } }), lilyC({ at: [3.2, -3.6], face: 'scared', gaze: [-1, 0.3] })],
  acts: [sit('noah'), { who: 'noah', do: 'phone', t: [0, 1], hold: true }, face('lily', 'sad', 0.6)],
  monsters: [M({ at: [-6.6, -2.4], rot: 60, h: 'shoe', hTo: 'waist', grow: [0.1, 0.9], eyes: 0.15, eyesTo: 0.7 })],
  cam: cam([-9.5, 5.4, 11.5], [-9.0, 5.1, 10.5], [-3.0, 2.8, -2.6], 60) });
// 2-5 THE RULE (street demo): a neighbour lies; a creature appears behind him; only the listener sees it; truth -> gone.
const demoCast = (nf = 'happy', lf = 'happy', o = {}) => [
  { id: 'nb', who: 'neighbor', at: [20.6, 0], rot: 200, face: nf, ...o.nb }, { id: 'ls', who: 'listener', at: [18.2, -4.2], rot: 25, face: lf, ...o.ls }];
S[2] = { loc: 'city', light: 'day', cast: demoCast('happy', 'happy', { nb: { talk: [[0, 1]] } }),
  monsters: [M({ at: [21.7, 2.3], rot: 195, h: 'shoe', eyes: 0.2, appear: [0.35, 0.55] })],
  acts: [face('ls', 'surprised', 0.6), gaze('ls', 0.8, 0.6, 0.55)], cam: cam([12, 6.2, 18], [12.5, 5.6, 16], [19.8, 3.0, -1.5], 40) };
S[3] = { loc: 'city', light: 'day', cast: demoCast('happy', 'scared', { nb: { talk: [[0, 0.8]] }, ls: { gaze: [0.8, 0.6] } }),
  monsters: [M({ at: [21.7, 2.3], rot: 195, h: 'shoe', eyes: 0.3 })],
  acts: [{ who: 'ls', do: 'stepback', t: [0.3, 0.6], dist: 0.5 }], cam: cam([16.0, 4.5, 4.4], [16.4, 4.4, 3.4], [18.4, 4.1, -4.2], 36) };
S[4] = { loc: 'city', light: 'day', cast: demoCast('happy', 'scared', { ls: { gaze: [0.8, 0.6] } }),
  monsters: [M({ at: [21.7, 2.3], rot: 195, h: 'shoe', hTo: 1.3, grow: [0.2, 0.8], eyes: 0.3, eyesTo: 0.9 })],
  cam: cam([19.2, 1.6, 8.5], [19.8, 1.4, 6.8], [21.6, 1.0, 2.0], 38) };
S[5] = { loc: 'city', light: 'day', cast: demoCast('guilty', 'scared', { nb: { talk: [[0.05, 0.3]] }, ls: { gaze: [0.8, 0.6] } }),
  monsters: [M({ at: [21.7, 2.3], rot: 195, h: 1.3, eyes: 0.9, crack: [0.12, 0.35], dissolve: [0.3, 0.6] })],
  acts: [face('nb', 'relieved', 0.55), face('ls', 'relieved', 0.6), gaze('ls', 0.2, 0, 0.6), { who: 'nb', do: 'lookdown', t: [0.05, 0.35] }],
  cam: cam([13.5, 5.6, 15], [14.5, 5.0, 12.5], [19.8, 3.2, -1.5], 40) };
// 6 phone insert ("I'm sorry. I can't make it this weekend.") while Lily asks off-screen, then cut: Lily with her paper crown.
S[6] = home({ mood: 'warm',
  cast: [noahC({ face: 'sad', gaze: [0, 0.7], acc: { handR: [['phone']] } }), lilyC({ face: 'happy', gaze: [-1, 0], acc: { handL: [['papercrown']] }, talk: [speak(6)] })],
  /* phone insert moved to the silent beat of line 5 (shot 105) */
  acts: [sit('noah'), { who: 'noah', do: 'phone', t: [0, 0.2] }, { do: 'hide', acc: 'noah.handR0', t: 0.2 }, face('noah', 'nervous', 0.25), gaze('noah', 0.8, 0, 0.25),
    { who: 'noah', do: 'turn', to: 35, t: [0.2, 0.4] }, { who: 'lily', do: 'lift', arm: 'L', t: [0.05, 0.3], hold: true }],
  cam: cam([3.6, 5.4, 14.5], [3.5, 5.2, 13.2], [2.2, 3.6, -2.4], 48) });
// 105 = second half of line 5's silent beat: the phone insert (kit storyboard: message before Lily asks)
const S105 = home({ mood: 'warm', cast: [noahC({ face: 'sad', gaze: [0, 0.7], acc: { handR: [['phone']] } })], acts: [sit('noah'), { who: 'noah', do: 'phone', t: [0, 1], hold: true }],
  cam: { keys: [{ t: 0, track: 'noah.handR0', off: [0.15, 0.1, 2.1], fov: 34 }, { t: 1, track: 'noah.handR0', off: [0.1, 0.08, 1.7], fov: 32 }] } });
// 7 "Of course. He promised." nervous smile, gaze breaks; then a tiny creature crawls out from behind his shoe; Lily notices.
S[7] = home({ mood: 'warm',
  cast: [noahC({ rot: 35, face: 'nervous', gaze: [0.8, 0], talk: [speak(7)] }), lilyC({ face: 'happy', gaze: [-1, 0], acc: { handL: [['papercrown']] } })],
  acts: [sit('noah'), gaze('noah', -0.6, 0.5, 0.18), gaze('noah', 0.8, 0, 0.3), face('lily', 'confused', 0.66), gaze('lily', -1, 0.8, 0.6)],
  monsters: [M({ at: [-3.6, -2.6], rot: 60, h: 'shoe', eyes: 0.15, appear: [0.45, 0.52], creep: { from: [-3.6, -4.2], t: [0.45, 0.8] } })],
  cam: { keys: [{ t: 0, pos: [0.4, 5.4, 9.5], look: [-1.2, 4.2, -1.5], fov: 38 }, { t: 0.44, pos: [0.3, 5.3, 9.0], look: [-1.2, 4.1, -1.5], fov: 38 },
    { t: 0.45, cut: true, pos: [-7.0, 1.5, 0.4], look: [-3.4, 1.0, -2.4], fov: 42 }, { t: 1, pos: [-6.6, 1.4, 0.0], look: [-3.5, 1.0, -2.5], fov: 40 }] } });
// 8 "Noah... what's standing behind you?" Lily close-up, breath-held fear, eyes over his shoulder.
S[8] = home({ mood: 'tense',
  cast: [noahC({ rot: 35, face: 'nervous' }), lilyC({ face: 'scared', gaze: [-1, 0.5], acc: { handL: [['papercrown']] }, talk: [[speak(8)[0], speak(8)[1], 0.6]] })],
  acts: [sit('noah'), { who: 'lily', do: 'lookside', deg: 12, t: [0, 1], hold: true }],
  monsters: [M({ at: [-3.6, -2.6], rot: 60, h: 'shoe', eyes: 0.25 })],
  cam: cam([2.4, 4.0, -2.2], [2.7, 3.95, -2.35], [5.8, 3.6, -3.4], 38) });
// 9 "Nothing. You're probably just tired. Go finish your crown." Then it grows to knee height; Lily steps away.
S[9] = home({ mood: 'tense',
  cast: [noahC({ rot: 55, face: 'neutral', gaze: [0.6, 0], talk: [speak(9)] }), lilyC({ face: 'scared', gaze: [-0.8, 0.5], acc: { handL: [['papercrown']] } })],
  acts: [sit('noah'), { who: 'noah', do: 'shake', t: [0.02, 0.15] }, { who: 'lily', do: 'stepback', t: [0.72, 0.9], dist: 1.0 }, { who: 'lily', do: 'lift', arm: 'L', t: [0.45, 0.6], hold: true }],
  monsters: [M({ at: [-3.6, -2.9], rot: 70, h: 'shoe', hTo: 'knee', grow: [0.6, 0.88], eyes: 0.25, eyesTo: 0.45 })],
  cam: { keys: [{ t: 0, pos: [8.8, 5.8, -5.4], look: [-2.6, 3.8, -2.2], fov: 44 }, { t: 0.5, pos: [8.6, 5.75, -5.3], look: [-2.6, 3.8, -2.2], fov: 44 },
    { t: 0.51, cut: true, pos: [2.0, 4.7, -3.6], look: [5.6, 3.3, -3.6], fov: 46 }, { t: 1, pos: [2.3, 4.6, -3.6], look: [5.6, 3.3, -3.6], fov: 44 }] } });
// 10 breakfast (morning): "Did Dad remember my favorite cake?"
const brk = [{ id: 'bn', type: 'cereal', at: [-2.4, TOP, 0.3] }, { id: 'bl', type: 'cereal', at: [2.6, TOP, 0.3] }, { id: 'tn', type: 'toast', at: [-1.0, TOP, 0.6] }];
S[10] = { loc: 'house', light: 'morning', time: 'morning', breakfast: true, props: brk, mood: 'warm',
  cast: [noahC({ face: 'neutral', gaze: [0.5, 0.4] }), { id: 'lily', who: 'lily', at: SEAT.lily, rot: -25, face: 'happy', gaze: [-1, 0], talk: [speak(10)] }],
  acts: [sit('noah'), sit('lily')], monsters: [M({ at: [-5.4, -2.0], rot: 30, h: 'knee', eyes: 0.6 })],
  cam: cam([0.2, 7.0, 14.5], [0.2, 6.8, 13.6], [0.1, 3.9, -1.2], 50) };
// 11 "Of course. Chocolate, right?" strained smile; the creature grows behind him.
S[11] = { ...S[10], cast: [noahC({ rot: 20, face: 'nervous', gaze: [0.6, 0], talk: [speak(11)] }), { id: 'lily', who: 'lily', at: SEAT.lily, rot: -25, face: 'happy', gaze: [-1, 0] }],
  acts: [sit('noah'), sit('lily'), face('lily', 'confused', 0.7), gaze('lily', -1, -0.3, 0.68)],
  monsters: [M({ at: [-5.4, -2.0], rot: 30, h: 'knee', hTo: 2.9, grow: [0.55, 0.9], eyes: 0.6, eyesTo: 0.75 })],
  cam: cam([-9.0, 4.8, 5.8], [-8.6, 4.7, 5.2], [-3.6, 3.4, -1.6], 44) };
// 12 after school, front gate (city): "Do you think he'll like this?" Lily holds up her drawing.
S[12] = { loc: 'city', light: 'day', mood: 'warm',
  cast: [{ id: 'noah', who: 'noah', at: [-19.6, -27.2], rot: 40, face: 'nervous', acc: { back: [['backpack', '#3a6fd8']] } },
    { id: 'lily', who: 'lily', at: [-17.0, -25.0], rot: 15, face: 'happy', gaze: [-0.9, 0.1], talk: [speak(12)], acc: { front: [['drawing']], back: [['backpack', '#ff86b6']] } }],
  acts: [{ who: 'lily', do: 'carry', t: [0, 1], hold: true }, { who: 'lily', do: 'hop', t: [0.1, 0.3], h: 0.4 }],
  monsters: [M({ at: [-21.6, -28.4], rot: 30, h: 2.9, eyes: 0.55 })],
  cam: cam([-15.6, 3.7, -18.4], [-15.8, 3.6, -19.0], [-17.2, 2.9, -25.0], 40) };
// 13 "He's going to love it." avoids her eyes; the creature reaches his waist behind him; Lily sees it.
S[13] = { ...S[12], cast: [{ ...S[12].cast[0], face: 'nervous', gaze: [-0.8, 0.3], talk: [speak(13)] }, { ...S[12].cast[1], talk: undefined, face: 'happy' }],
  acts: [{ who: 'lily', do: 'carry', t: [0, 1], hold: true }, face('lily', 'sad', 0.7), gaze('lily', 1, -0.4, 0.66)],
  monsters: [M({ at: [-22.4, -27.4], rot: 30, h: 2.9, hTo: 'waist', grow: [0.55, 0.9], eyes: 0.55, eyesTo: 0.65 })],
  cam: cam([-17.0, 4.8, -20.0], [-17.2, 4.7, -20.6], [-20.6, 3.6, -27.8], 46) };
// 14 night, Lily's window: "Will he really be here tomorrow?"
S[14] = { loc: 'lilyroom', light: 'night', mood: 'cool',
  cast: [{ id: 'lily', who: 'lily', at: [2.3, -7.8], rot: 180, face: 'sad', gaze: [0, -0.4], talk: [speak(14)] }, { id: 'noah', who: 'noah', at: [7.5, 9.0], rot: -150, face: 'neutral' }],
  acts: [{ who: 'lily', do: 'turn', to: 25, t: [0.12, 0.42] }, gaze('lily', 0.6, 0, 0.4)],
  monsters: [M({ at: [8.6, 11.2], rot: -150, h: 'waist', eyes: 0.7 })],
  cam: cam([6.8, 4.6, -3.8], [6.4, 4.5, -4.3], [2.3, 3.6, -8.0], 40) };
// 15 "Yes, Lily. I already told you." impatient, then softer; behind him the creature rises taller than Noah.
S[15] = { ...S[14], cast: [{ id: 'lily', who: 'lily', at: [2.3, -7.8], rot: 25, face: 'sad', gaze: [0.6, 0] }, { id: 'noah', who: 'noah', at: [7.5, 9.0], rot: -150, face: 'angry', gaze: [0, 0.2], talk: [speak(15)] }],
  acts: [face('noah', 'sad', 0.22), face('lily', 'scared', 0.62), gaze('lily', 0.6, -0.8, 0.6), { who: 'lily', do: 'stepback', t: [0.66, 0.85], dist: 0.6 }],
  monsters: [M({ at: [8.6, 11.2], rot: -150, h: 'waist', hTo: TALL, grow: [0.45, 0.85], eyes: 0.7, eyesTo: 1 })],
  cam: cam([-0.4, 5.8, -9.4], [-0.2, 5.9, -9.1], [7.8, 5.0, 9.5], 30, [7.8, 6.2, 9.5]) };
// 16 birthday: two kids, empty chair, untouched plate. "Should we wait a little longer?" Noah cannot answer.
const kidsAtTable = (nf, lf, o = {}) => [noahC({ at: BS.noah, face: nf, ...o.noah }), { id: 'lily', who: 'lily', at: BS.lily, rot: -20, face: lf, acc: { handL: [['papercrown']] }, ...o.lily }];
S[16] = bday({ mood: 'golden', cast: kidsAtTable('nervous', 'holdtears', { lily: { gaze: [1, 0.2], talk: [speak(16)] } }),
  acts: [sit('noah'), sit('lily'), gaze('lily', -1, 0, 0.62), face('noah', 'surprised', 0.66), face('noah', 'sad', 0.9), gaze('noah', 0, 0.6, 0.9)],
  monsters: [M({ at: [-4.6, -6.0], rot: 20, h: TALL, eyes: 1 })],
  cam: cam([3.2, 8.6, 17.5], [3.0, 7.6, 15.5], [2.2, 3.4, -0.6], 50) });
// 17 "Noah... I think it gets bigger every time you tell me he's coming." looking toward the monster.
S[17] = bday({ mood: 'golden', cast: kidsAtTable('sad', 'sad', { lily: { gaze: [-1, -0.7], talk: [speak(17)] } }), acts: [sit('noah'), sit('lily'), { who: 'lily', do: 'lookup', t: [0.2, 1], hold: true }],
  monsters: [M({ at: [-4.6, -6.0], rot: 20, h: TALL, eyes: 1 })], cam: cam([4.6, 5.0, 5.2], [4.3, 5.0, 4.6], [1.6, 4.9, -2.5], 44) });
// 18-19 narrator: "That's when I realized..." / "She had seen every lie." Noah close-up: the smile goes, eyes lower.
S[18] = bday({ mood: 'golden', cast: kidsAtTable('nervous', 'sad'), acts: [sit('noah'), sit('lily'), face('noah', 'surprised', 0.35)],
  monsters: [M({ at: [-4.6, -6.0], rot: 20, h: TALL, eyes: 1 })], cam: cam([-1.6, 5.6, 6.5], [-1.8, 5.5, 5.3], [-2.6, 5.2, -2.0], 40) });
S[19] = bday({ mood: 'golden', cast: kidsAtTable('surprised', 'sad'), acts: [sit('noah'), sit('lily'), face('noah', 'guilty', 0.2), gaze('noah', 0, 1, 0.25)],
  monsters: [M({ at: [-4.6, -6.0], rot: 20, h: TALL, eyes: 1 })], cam: cam([-1.9, 5.5, 5.0], [-2.0, 5.4, 4.2], [-2.6, 5.1, -2.0], 38) });
// 20-23 confession. Lily now stands beside Noah (her chair empty at her plate).
const conf = (nf, lf, o = {}) => [noahC({ at: BS.noah, rot: 40, face: nf, ...o.noah }), { id: 'lily', who: 'lily', at: BS.lily, rot: -40, face: lf, acc: { handL: [['papercrown']] }, ...o.lily }];
S[20] = bday({ mood: 'warm', cast: conf('guilty', 'sad', { noah: { gaze: [0.8, 0.3], talk: [speak(20)] } }), acts: [sit('noah'), sit('lily')],
  monsters: [M({ at: [-4.6, -6.0], rot: 20, h: TALL, eyes: 1 })], cam: cam([1.6, 5.2, 4.4], [1.4, 5.2, 3.9], [-1.7, 4.8, -1.2], 40) });
S[21] = bday({ mood: 'warm', cast: conf('guilty', 'sad', { noah: { gaze: [0.6, 0.6], talk: [speak(21)], acc: { handR: [['phone']] } } }),
  acts: [sit('noah'), sit('lily'), { who: 'noah', do: 'phone', t: [0.05, 1], hold: true }],
  monsters: [M({ at: [-4.6, -6.0], rot: 20, h: TALL, eyes: 1 })], cam: trackPhone([1.6, 0.9, 2.4], [1.4, 0.85, 2.1]) });
S[22] = bday({ mood: 'warm', cast: conf('sad', 'sad', { noah: { talk: [speak(22)] }, lily: { gaze: [-1, 0.2] } }), acts: [sit('noah'), sit('lily')],
  monsters: [M({ at: [-4.6, -6.0], rot: 20, h: TALL, eyes: 1 })], cam: cam([-0.9, 4.9, 1.9], [-0.7, 4.8, 1.5], [1.7, 4.0, -1.2], 38) });
S[23] = bday({ mood: 'warm', cast: conf('holdtears', 'sad', { noah: { gaze: [0.8, 0.5], talk: [speak(23)] }, lily: { gaze: [-1, -0.8] } }),
  acts: [sit('noah'), sit('lily'), { who: 'noah', do: 'tremble', t: [0.05, 0.4] }, face('lily', 'surprised', 0.5), face('noah', 'sad', 0.5), face('lily', 'holdtears', 0.85), gaze('lily', -1, 0.2, 0.85)],
  monsters: [M({ at: [-4.6, -6.0], rot: 20, h: TALL, eyes: 1, crack: [0.4, 0.62], dissolve: [0.58, 0.95] })],
  cam: cam([-0.6, 7.6, 15], [-0.5, 6.8, 12.5], [-0.4, 4.6, -2.6], 46) });
// 24-26 payoff: "I was already sad, Noah." / "I just didn't want to be sad alone." (+ wipes eyes, crown on his head) / "Can you stay for the dance?"
S[24] = bday({ mood: 'warm', cast: conf('sad', 'crying', { lily: { gaze: [-1, 0], talk: [speak(24)] } }), acts: [sit('noah'), sit('lily')], cam: cam([-0.7, 4.8, 2.5], [-0.5, 4.7, 2.1], [1.7, 4.1, -1.2], 36) });
S[25] = bday({ mood: 'golden', cast: conf('sad', 'holdtears', { lily: { gaze: [-1, 0], talk: [speak(25)] } }),
  acts: [sit('noah'), sit('lily'), { who: 'lily', do: 'wipe', arm: 'R', t: [0.42, 0.62] }, face('lily', 'relieved', 0.6), { who: 'lily', do: 'holdhand', arm: 'R', t: [0.62, 1], hold: true }, { who: 'noah', do: 'holdhand', arm: 'L', t: [0.62, 1], hold: true },
    { who: 'lily', do: 'lift', arm: 'L', t: [0.62, 0.78] }, { do: 'fly', acc: 'lily.handL0', to: 'noah.head0', t: [0.72, 0.9], arc: 0.6, spin: 0 }, face('noah', 'surprised', 0.88), face('noah', 'relieved', 0.96)],
  cam: cam([0.3, 6.2, 9.5], [0.2, 6.0, 8.6], [0.0, 4.2, -1.4], 42) });
S[26] = bday({ mood: 'golden', cast: conf('relieved', 'relieved', { lily: { gaze: [-1, 0], talk: [speak(26)], acc: {} }, noah: { acc: { head: [['papercrown']] } } }),
  acts: [sit('noah'), sit('lily'), { who: 'lily', do: 'holdhand', arm: 'R', t: [0, 1], hold: true }, { who: 'noah', do: 'holdhand', arm: 'L', t: [0, 1], hold: true }],
  cam: cam([0.0, 5.6, 7.4], [0.0, 5.5, 6.8], [0.0, 4.3, -1.2], 46) });
// 27 "Of course. And this time, I mean it." then they dance beside the cake; the empty chair stays.
const dancers = (nf, lf, o = {}) => [{ id: 'noah', who: 'noah', at: [10.9, 1.4], rot: -50, face: nf, acc: { head: [['papercrown']] }, ...o.noah }, { id: 'lily', who: 'lily', at: [8.7, 1.8], rot: 50, face: lf, ...o.lily }];
S[27] = bday({ mood: 'golden', cast: dancers('comforting', 'relieved', { noah: { talk: [speak(27)] } }),
  acts: [{ who: 'noah', do: 'holdhand', arm: 'R', t: [0, 1], hold: true }, { who: 'lily', do: 'holdhand', arm: 'L', t: [0, 1], hold: true }, face('noah', 'happy', 0.42), face('lily', 'happy', 0.45),
    { who: 'noah', do: 'dance', t: [0.42, 1], hold: true, keepArms: true }, { who: 'lily', do: 'dance', t: [0.45, 1], hold: true, keepArms: true }],
  cam: cam([8.6, 6.0, 13.5], [8.8, 5.6, 11.8], [9.6, 3.8, 1.4], 44) });
// 28 narrator: "Sometimes, the truth hurts for a moment." empty chair in the foreground, the siblings dancing behind it.
S[28] = bday({ mood: 'golden', cast: dancers('happy', 'happy'), acts: [{ who: 'noah', do: 'dance', t: [0, 1], hold: true }, { who: 'lily', do: 'dance', t: [0, 1], hold: true }],
  cam: cam([2.8, 4.6, 9.0], [3.2, 4.5, 8.4], [9.6, 3.6, 1.2], 44) });
// 29 "But a lie can make someone feel alone for much longer." slow crane back: two siblings, cake, empty chair.
S[29] = bday({ mood: 'golden', cast: dancers('relieved', 'happy'), acts: [{ who: 'noah', do: 'dance', t: [0, 1], hold: true }, { who: 'lily', do: 'dance', t: [0, 1], hold: true }],
  cam: cam([7.5, 5.2, 10.5], [5.0, 10.5, 17.0], [9.6, 3.8, 1.4], 42, [6.0, 3.2, 0.8]) });

const shots = S.map((s, i) => ({ line: i, dur: +(slot(i) + 0.3).toFixed(3), props: [], acts: [], monsters: [], ...s, line: i }));
// line 5 = street demo (truth -> creature dissolves) for the first 1.7 s, then the kitchen phone insert (shot 105); assembled by render-all
const D5 = shots[5].dur, A5 = 1.7;
shots[5].dur = A5; shots[5].monsters[0].crack = [0.25, 0.55]; shots[5].monsters[0].dissolve = [0.5, 0.9];
shots[5].acts = shots[5].acts.map(a => a.do === 'face' ? { ...a, t: Math.min(0.9, a.t + 0.2) } : a);
shots.push({ line: 105, dur: +(D5 - A5).toFixed(3), props: [], acts: [], monsters: [], ...S105, line: 105, partOf: 5 });
fs.writeFileSync(path.join(OUT, 'shotspec.json'), JSON.stringify({ id: ID, shots }, null, 1));
console.log(`${shots.length} shots, ${shots.reduce((a, s) => a + s.dur, 0).toFixed(1)} s`);
