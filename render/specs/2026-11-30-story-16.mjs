// "In This Town, Every Birthday Gives You A New Power" (11 lines). Snow power laughed at, then it saves the town in a heatwave. Loop ending.
// House local coords (shiftZ dz +8): table centre at z -6.5 (top y 2.75); stand behind it at z -9.2.
import * as K from './_common.mjs';
const ID = '2026-11-30-story-16'; const { OUT, slot } = K.timing(ID);
const { C, arm, both, push, pull, drift, low, high, follow, cam, ins, FX } = K;
const PARTY = { loc: 'house', light: 'day', time: 'day', birthday: true, exposure: 0.95, fx: { ...FX.indoor, sparkles: { color: '#ffe0f0', count: 80, size: 0.4, speed: 0.35 } } };
const CAKE = { id: 'ck', type: 'cake', at: [0, 2.75, -6.5] };
const FIELD = { loc: 'field', light: 'day', exposure: 1.0, fx: FX.day };
const HEAT = { loc: 'field', light: 'day', exposure: 1.05, fx: { bloom: 0.4, bloomThreshold: 0.85, vignette: 0.38, grain: 0.05, sat: 1.12, contrast: 1.08, tint: [1.12, 1.0, 0.84] } };
const SNOWFX = (n = 280, sp = -1.1) => ({ bloom: 0.3, bloomThreshold: 0.85, vignette: 0.3, grain: 0.03, sat: 1.05, contrast: 1.05, tint: [0.94, 1.0, 1.1], sparkles: { color: '#ffffff', count: n, size: 0.5, speed: sp } });
const MASON = (o = {}) => C('m', 'mason', 0, 4, 0, 'happy', o);
const ELI = (o = {}) => C('e', 'eli', 0, 4, 0, 'happy', o);
const S = [];
S[0] = { ...PARTY, props: [CAKE], cast: [MASON({ at: [-2, -9.2] }), ELI({ at: [2, -9.2] }), C('a', 'lucy', -5.5, -8, 30, 'happy'), C('b', 'noob', 5.5, -8, -30, 'laugh')], acts: [...both('b', [0.3, 0.5])], cam: push(0, -7.5, 4.2, 20, 15, 42) };
S[1] = { ...FIELD, cast: [ELI({ at: [-10, 6], rot: 90, face: 'laugh' })], acts: [{ who: 'e', do: 'run', to: [10, 6], t: [0.05, 0.95] }], cam: follow(-12, 8, 6, 3.2, 16, 44) };
S[2] = { ...PARTY, props: [CAKE], cast: [MASON({ at: [0, -9.2] }), ELI({ at: [-4, -8.5], rot: 30 }), C('a', 'lucy', 4, -8.5, -30, 'happy')], acts: [{ who: 'm', do: 'face', kind: 'determined', t: 0.5 }], cam: cam([1.2, 8, 2], [0.5, 7.4, -0.5], [0, 4.4, -8.6], 40) };
S[3] = { ...PARTY, exposure: 0.8, fx: { ...SNOWFX(50, -0.35), bloom: 0.15, bloomThreshold: 0.97 }, props: [CAKE], cast: [MASON({ at: [0, -9.2], face: 'confused' })], acts: [{ who: 'm', do: 'lookside', deg: -20, t: [0.2, 0.5], hold: true }], cam: cam([1, 7.2, 1], [0.4, 6.9, -1.5], [0, 4.4, -8.6], 40) };
S[4] = { ...PARTY, props: [CAKE], cast: [MASON({ at: [0, -9.2], face: 'sad' }), ELI({ at: [-4, -8.5], rot: 30, face: 'laugh' }), C('a', 'lucy', 4, -8.5, -30, 'laugh'), C('b', 'noob', 6.5, -6, -50, 'laugh'), C('c', 'beanie', -6.5, -6, 50, 'laugh')], acts: [arm('b', -1.5, 0.2, [0.1, 0.3]), arm('c', -1.5, -0.2, [0.15, 0.35], 'L')], cam: drift(0, -7.5, 3.6, 17, 4, 42) };
S[5] = { ...HEAT, cast: [MASON({ at: [-6, 6], rot: 90, face: 'worried' })], acts: [{ who: 'm', do: 'walk', to: [3, 6], t: [0.05, 1] }, { who: 'm', do: 'wipe', t: [0.3, 1] }], cam: { ...follow(-6, 3, 6, 3.4, 17, 42), shake: 0.01 } };
S[6] = { ...HEAT, cast: [C('b', 'noob', -2.5, 4, 30, 'sob'), C('a', 'lucy', 2.5, 5, -30, 'worried'), C('c', 'beanie', 6, 2, -40, 'sob')], acts: [{ who: 'b', do: 'sit', seat: 0.2, t: [0, 1], hold: true }, { who: 'c', do: 'kneel', t: [0.1, 1], hold: true }, { who: 'a', do: 'wipe', t: [0.2, 1] }], cam: high(1, 4, 2.4, 16, 46) };
S[7] = { ...HEAT, cast: [ELI({ face: 'sad' })], acts: [{ who: 'e', do: 'sit', seat: 0.2, t: [0, 1], hold: true }, { who: 'e', do: 'tremble', t: [0.2, 1] }, { who: 'e', do: 'lookdown', t: [0.3, 1], hold: true }], cam: push(0, 4, 2.4, 13, 10, 40) };
S[8] = { ...HEAT, fx: { ...HEAT.fx, sparkles: { color: '#ffffff', count: 120, size: 0.45, speed: -0.6 } }, cast: [MASON({ face: 'determined' })], acts: [...both('m', [0.25, 0.5]), { who: 'm', do: 'lookup', t: [0.4, 1], hold: true }], cam: { ...low(0, 4, 3.8, 14, 46), shake: 0.02 } };
S[9] = { ...FIELD, fx: SNOWFX(), cast: [MASON({ face: 'laugh' }), ELI({ at: [-4, 5], rot: 30, face: 'laugh' }), C('a', 'lucy', 4, 5, -30, 'starstruck'), C('b', 'noob', -7, 7, 40, 'laugh'), C('c', 'beanie', 7, 7, -40, 'laugh')], acts: [...both('m', [0.1, 0.25]), ...both('e', [0.15, 0.3]), ...both('a', [0.2, 0.35]), { who: 'b', do: 'jump', to: [-7, 7], toY: 0, h: 3, t: [0.3, 0.6], crouch: 0.15 }, { who: 'c', do: 'jump', to: [7, 7], toY: 0, h: 3, t: [0.45, 0.75], crouch: 0.15 }], cam: pull(0, 5, 3.6, 16, 23, 46) };
S[10] = { ...PARTY, exposure: 0.85, fx: { ...SNOWFX(60, -0.3), bloomThreshold: 0.97, bloom: 0.15 }, props: [CAKE], cast: [C('a', 'lucy', 0, -9.2, 0, 'thinking')], acts: [], cam: cam([1, 8, 3], [0.4, 7.4, 0], [0, 4.4, -8.6], 40) };
K.write(ID, S, slot, OUT);
