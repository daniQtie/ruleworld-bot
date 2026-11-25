// "Which Pill Would You Take For A Million Dollars?" (8 lines). Three glowing pills, power demos, subscribe call-to-action.
import * as K from './_common.mjs';
const ID = '2026-11-28-story-12'; const { OUT, slot } = K.timing(ID);
const { C, arm, both, push, pull, drift, low, high, follow, cam, ins, FX } = K;
const PARK = { loc: 'forest', light: 'day', exposure: 0.95, fx: FX.day };
const NIGHT = { loc: 'forest', light: 'night', exposure: 0.95, fog: [14, 70, '#0d2a33'], fx: FX.danger };
const ELI = (o = {}) => C('e', 'eli', 0, 4, 0, 'neutral', o);
const pills = (y = 3.4, z = 6.5) => [{ id: 'pb', type: 'pill', color: '#2f6fe0', at: [-1.6, y, z], scale: 1.3 }, { id: 'pr', type: 'pill', color: '#e02f2f', at: [0, y, z], scale: 1.3 }, { id: 'pg', type: 'pill', color: '#2fd85a', at: [1.6, y, z], scale: 1.3 }];
const S = [];
S[0] = { ...PARK, props: pills(2.4, 7), cast: [C('s', 'suitman', 0, 3, 0, 'smirk')], acts: [arm('s', -1.6, 0.3, [0.05, 0.25])], cam: push(0, 5, 3.8, 15, 11, 38) };
S[1] = { ...PARK, props: pills(2.6, 5), cast: [C('s', 'suitman', 2, 3.5, -60, 'smirk'), ELI({ at: [-2, 4], rot: 60, face: 'surprised' })], acts: [arm('s', -1.4, 0.4, [0.05, 0.3])], cam: drift(0, 4, 3.4, 15, 3) };
S[2] = { ...PARK, props: [{ id: 'pb', type: 'pill', color: '#2f6fe0', at: [0, 3.2, 7], scale: 2.4 }], cast: [ELI({ at: [0, 3], face: 'determined' })], acts: [...both('e', [0.45, 0.65], -2.7)], cam: low(0, 3, 3.8, 14) };
S[3] = { ...PARK, fx: FX.sad, cast: [ELI({ at: [0, 4], face: 'sob' })], acts: [{ who: 'e', do: 'sit', seat: 0.8, t: [0.1, 1], hold: true }, { who: 'e', do: 'tremble', t: [0.2, 1] }], cam: high(0, 4, 2.4, 13) };
S[4] = { ...PARK, props: [{ id: 'pr', type: 'pill', color: '#e02f2f', at: [0, 3.2, 7], scale: 2.4 }], cast: [ELI({ at: [0, 3], face: 'starstruck' }), C('a', 'lucy', -4, 0, 30, 'happy'), C('b', 'noob', 4, 0, -30, 'laugh')], acts: [], cam: push(0, 3, 3.4, 16, 12, 40) };
S[5] = { ...NIGHT, cast: [ELI({ at: [0, 4], face: 'shocked' }), C('a', 'lucy', -3.5, 1, 30, 'neutral'), C('b', 'noob', 3.5, 1, -30, 'neutral'), C('c', 'beanie', 0, -2, 0, 'neutral')], acts: [arm('e', -2.6, 0.9, [0.1, 0.3]), arm('e', -2.6, -0.9, [0.1, 0.3], 'L'), { who: 'e', do: 'tremble', t: [0.2, 1] }], cam: push(0, 4, 3.4, 15, 11.5, 40) };
S[6] = { ...PARK, fx: FX.win, props: [{ id: 'pg', type: 'pill', color: '#2fd85a', at: [-3, 3.2, 8], scale: 2.0 }], cast: [ELI({ at: [0, 3], face: 'laugh' })], acts: [{ who: 'e', do: 'jump', to: [0, 3], toY: 0, h: 9, t: [0.25, 0.9], crouch: 0.15 }, ...both('e', [0.35, 0.5])], cam: low(0, 3, 5.5, 18, 48) };
S[7] = { ...PARK, fx: FX.win, props: [{ id: 'sub', type: 'sign', color: 'SUBSCRIBE', at: [3.2, 0, 2], rot: -15, scale: 1.4 }, ...pills(1.6, 7)], cast: [ELI({ at: [-1, 4], face: 'laugh' })], acts: [arm('e', -1.55, 0.1, [0.1, 0.3])], cam: pull(0, 4, 3.4, 12, 17, 40) };
K.write(ID, S, slot, OUT);
