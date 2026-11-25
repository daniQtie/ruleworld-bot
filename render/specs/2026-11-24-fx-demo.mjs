// FX demo (2026-11-24): episode 14's narration re-shot with the FB-reel techniques. Preview for the owner only, never uploaded.
import * as K from './_common.mjs';
const ID = '2026-11-24-fx-demo'; const { OUT, slot } = K.timing(ID);
const { C, arm, both, push, pull, drift, low, high, cam, FX, drone, dutch, feet, ots, eye } = K;
const CLASS = { loc: 'classroom', light: 'day', exposure: 0.7, fx: FX.indoor, boardText: 'NO|TALKING', boardSub: '' };
const SCHOOL = { loc: 'field', light: 'day', exposure: 1.0, fx: FX.day };
const TEACH = (o = {}) => C('t', 'suitman', 0, -4.5, 0, 'smirk', o);
const LEO = (o = {}) => C('l', 'leo', 0, 4.4, 180, 'neutral', { scale: 0.95, ...o });
const KIDS = (face = 'neutral', rot = 180) => [
  C('a', 'lucy', -3.5, 6, rot, face), C('b', 'beanie', 3.5, 6, rot, face),
  C('c', 'noob', -3.5, 12, rot, face), C('e', 'eli', 3.5, 12, rot, face), C('d', 'pia', -6.75, 9, rot, face),
];
const S = [];
// 1 drone dive from the sky onto Leo outside school + name tag
S[0] = { ...SCHOOL, cast: [C('l', 'leo', 0, 6, 0, 'worried', { tag: { name: 'Leo', role: 'The quiet kid', from: 0.6 } }), C('a', 'lucy', -4, 2, 30, 'neutral'), C('b', 'beanie', 4, 1, -30, 'neutral')], acts: [], cam: drone(0, 6) };
// 2 zoom-through into the classroom: teacher close, name tag, slight Dutch tilt
S[1] = { ...CLASS, cast: [TEACH({ face: 'angry', tag: { name: 'Mr. Grant', role: 'Strict teacher', from: 0.15 } })], acts: [arm('t', -1.6, 0.1, [0.25, 0.45])], cam: dutch(push(0, -4.5, 3.6, 14, 10.5, 38), -10) };
// 3 whip to the silent class (high reverse angle)
S[2] = { ...CLASS, trans: 'whip', cast: [...KIDS('worried', 180), LEO({ face: 'worried' })], acts: [], cam: cam([3, 9.5, -7.2], [-3, 8.9, -6.2], [0, 3.4, 8], 50) };
// 4 feet shot: the teacher walks to the board like nothing happened
S[3] = { ...CLASS, trans: 'whip', cast: [TEACH({ at: [-5, -4.5], rot: 90, face: 'happy' })], acts: [{ who: 't', do: 'walk', to: [2, -4.5], t: [0.05, 0.95] }], cam: { ...feet(-1.5, -4.5, 0.5), lookTo: [1.5, 0.9, -4.5] } };
// 5 over Leo's shoulder towards the teacher
S[4] = { ...CLASS, cast: [TEACH({ face: 'happy' }), LEO({ face: 'neutral' })], acts: [arm('t', -1.5, 0.3, [0.1, 0.3])], cam: ots(0, 4.4, 0, -4.5) };
// 6 extreme close-up on Leo's worried face
S[5] = { ...CLASS, trans: 'zoom', cast: [LEO({ rot: 0, face: 'worried', still: true })], acts: [], cam: eye(0, 4.4, 4.3) };
// 7 teacher shouts: low Dutch angle + glitch burst
S[6] = { ...CLASS, trans: 'flash', glitch: [[0.15, 0.32]], cast: [TEACH({ face: 'angry' })], acts: [...both('t', [0.1, 0.3]), { who: 't', do: 'tremble', t: [0.3, 1] }], cam: { ...dutch(low(0, -4.5, 3.6, 12, 46), 14), shake: 0.05 } };
// 8 Leo raises his hand and points
S[7] = { ...CLASS, trans: 'whip', cast: [...KIDS('nervous', 180), LEO({ face: 'determined' })], acts: [arm('l', -2.9, 0.15, [0.08, 0.4]), arm('l', -1.4, -0.9, [0.6, 0.8])], cam: cam([2.5, 5.4, -3], [1.2, 4.8, -1], [0, 3.8, 4.4], 38) };
// 9 flash: the board, teacher realises
S[8] = { ...CLASS, trans: 'flash', cast: [TEACH({ at: [-3, -4], rot: 145, face: 'shocked' })], acts: [{ who: 't', do: 'lookup', t: [0.15, 1], hold: true }], cam: cam([5, 7.5, 9], [4, 7.2, 6], [-1.5, 6, -6], 48) };
// 10 glitch into the school news screen + cheering kids
S[9] = { ...CLASS, trans: 'glitch', fx: { ...FX.indoor, sparkles: { color: '#ffe9a0', count: 90, size: 0.4, speed: 0.4 } }, props: [{ id: 'tv', type: 'screen', color: '!SCHOOL NEWS|NO HOMEWORK|ALL WEEK', at: [-2.4, 0, 10], rot: 12, scale: 0.9 }], cast: [C('a', 'lucy', -3.5, 6, 0, 'laugh'), C('b', 'beanie', 3.5, 6, 0, 'laugh'), LEO({ at: [1.8, 4.4], rot: 0, face: 'laugh' })], acts: [...both('l', [0.15, 0.35]), ...both('a', [0.2, 0.4]), ...both('b', [0.25, 0.45])], cam: pull(0, 4, 3.8, 15, 21, 46) };
K.write(ID, S, slot, OUT);
