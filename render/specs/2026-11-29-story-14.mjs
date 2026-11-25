// "Our Teacher Banned Talking For A Whole Week" (10 lines). Classroom comedy: board says NO TALKING, the teacher asks a question nobody may answer.
// Classroom local coords (shiftZ dz -8): board at z -7.8, desk rows z 2 / 8 / 14, aisles x -6.75 / 0 / 6.75.
import * as K from './_common.mjs';
const ID = '2026-11-29-story-14'; const { OUT, slot } = K.timing(ID);
const { C, arm, both, push, pull, drift, low, high, cam, FX } = K;
const CLASS = { loc: 'classroom', light: 'day', exposure: 0.7, fx: FX.indoor, boardText: 'NO|TALKING', boardSub: '' };
const TEACH = (o = {}) => C('t', 'suitman', 0, -4.5, 0, 'smirk', o);
const LEO = (o = {}) => C('l', 'leo', 0, 4.4, 180, 'neutral', { scale: 0.95, ...o });
// students in the aisles, backs to the camera (facing the board) unless rot is overridden
const KIDS = (face = 'neutral', rot = 180) => [
  C('a', 'lucy', -3.5, 6, rot, face), C('b', 'beanie', 3.5, 6, rot, face),
  C('c', 'noob', -3.5, 12, rot, face), C('e', 'eli', 3.5, 12, rot, face), C('d', 'pia', -6.75, 9, rot, face),
];
// reverse angle: camera stands by the board and looks back at the class
const REV = (x0 = 2, x1 = -2, h = 9.5, fov = 50) => cam([x0, h, -7.2], [x1, h - 0.6, -6.2], [0, 3.4, 8], fov);
const S = [];
S[0] = { ...CLASS, cast: [TEACH({ at: [-2.5, -4.5], rot: 25 }), C('a', 'lucy', -3.5, 12, 180, 'neutral'), C('b', 'beanie', 3.5, 12, 180, 'neutral')], acts: [arm('t', -2.2, -0.9, [0.15, 0.4])], cam: cam([1.5, 9.5, 20], [0.6, 8.6, 14], [0, 6.2, -6], 46) };
S[1] = { ...CLASS, cast: [TEACH({ face: 'angry' })], acts: [arm('t', -1.6, 0.1, [0.1, 0.3])], cam: push(0, -4.5, 3.6, 14, 10.5, 38) };
S[2] = { ...CLASS, cast: [...KIDS('worried', 180), LEO({ face: 'worried' })], acts: [], cam: REV(3, -3) };
S[3] = { ...CLASS, cast: [TEACH({ at: [-2, -5.5], rot: 180, face: 'happy' }), C('c', 'noob', -3.5, 12, 180, 'neutral'), C('e', 'eli', 3.5, 12, 180, 'neutral')], acts: [arm('t', -2.6, 0.2, [0.1, 0.3]), { who: 't', do: 'wipe', t: [0.3, 0.9] }], cam: cam([-3, 9, 18], [3, 9, 18], [0, 6, -6], 46) };
S[4] = { ...CLASS, cast: [TEACH({ face: 'happy' })], acts: [arm('t', -1.5, 0.3, [0.1, 0.3])], cam: low(0, -4.5, 3.6, 13, 42) };
S[5] = { ...CLASS, cast: [...KIDS('shocked', 180), LEO({ face: 'worried', still: true })], acts: [], cam: cam([0, 10, -7.2], [0, 8.6, -5.6], [0, 3.4, 8], 48) };
S[6] = { ...CLASS, cast: [TEACH({ face: 'angry' })], acts: [...both('t', [0.1, 0.3]), { who: 't', do: 'tremble', t: [0.3, 1] }], cam: { ...low(0, -4.5, 3.6, 12, 46), shake: 0.05 } };
S[7] = { ...CLASS, cast: [...KIDS('nervous', 180), LEO({ face: 'determined' })], acts: [arm('l', -2.9, 0.15, [0.08, 0.4]), arm('l', -1.4, -0.9, [0.6, 0.8])], cam: cam([2.5, 5.4, -3], [1.2, 4.8, -1], [0, 3.8, 4.4], 38) };
S[8] = { ...CLASS, cast: [TEACH({ at: [-3, -4], rot: 145, face: 'shocked' })], acts: [{ who: 't', do: 'lookup', t: [0.15, 1], hold: true }], cam: cam([5, 7.5, 9], [4, 7.2, 6], [-1.5, 6, -6], 48) };
S[9] = { ...CLASS, fx: { ...FX.indoor, sparkles: { color: '#ffe9a0', count: 90, size: 0.4, speed: 0.4 } }, props: [{ id: 'nh', type: 'sign', color: 'NO|HOMEWORK', at: [-2.6, 0, 1.5], rot: 10, scale: 1.9 }], cast: [...KIDS('laugh', 0), LEO({ at: [1.6, 4.4], rot: 0, face: 'laugh' })], acts: [...both('l', [0.15, 0.35]), ...both('a', [0.2, 0.4]), ...both('b', [0.25, 0.45])], cam: pull(0, 4, 3.8, 15, 21, 46) };
K.write(ID, S, slot, OUT);
