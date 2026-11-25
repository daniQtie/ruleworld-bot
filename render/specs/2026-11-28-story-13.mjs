// "A Giant Tsunami Is Coming. Where Would You Hide?" (9 lines). Wave behind the town, three options with numbers, subscribe call-to-action.
import * as K from './_common.mjs';
const ID = '2026-11-28-story-13'; const { OUT, slot } = K.timing(ID);
const { C, arm, both, push, pull, drift, low, high, follow, cam, FX } = K;
const BEACH = { loc: 'field', light: 'day', exposure: 1.0, fx: FX.danger };
const ELI = (o = {}) => C('e', 'eli', 0, 4, 0, 'shocked', o);
const WAVE = (z = -55, s = 2.2) => ({ id: 'wv', type: 'wave', at: [0, 0, z], scale: s });
const num = (n, x, z) => ({ id: 'n' + n, type: 'sign', color: String(n), at: [x, 0, z], scale: 1.6 });
const S = [];
S[0] = { ...BEACH, props: [WAVE(-16, 2.4)], cast: [ELI({ at: [0, 6] }), C('a', 'lucy', -4, 9, 0, 'scared'), C('b', 'noob', 4, 10, 0, 'shocked')], acts: [...both('e', [0.1, 0.3])], cam: { ...low(0, 6, 9, 18, 52), shake: 0.04 } };
S[1] = { ...BEACH, props: [WAVE(-16, 2.4)], cast: [ELI({ at: [-8, 6], rot: 90, face: 'scared' })], acts: [{ who: 'e', do: 'run', to: [9, 6], t: [0.05, 0.95] }], cam: follow(-8, 8, 6, 3.2, 17, 42) };
S[2] = { ...BEACH, fx: FX.day, props: [{ id: 'cb', type: 'cabin', at: [0, 0, -4], scale: 1.1 }, num(1, 4.2, 3)], cast: [ELI({ at: [-4, 5], rot: 30, face: 'happy' })], acts: [arm('e', -1.6, -0.6, [0.2, 0.45])], cam: push(0, 0, 4.0, 22, 17, 42) };
S[3] = { ...BEACH, props: [{ id: 'cb', type: 'cabin', at: [0, 0, -4], scale: 1.1 }, WAVE(-14, 1.6)], cast: [], acts: [], cam: { ...high(0, -4, 3, 22, 48), shake: 0.05 } };
S[4] = { ...BEACH, fx: FX.day, props: [{ id: 'tw', type: 'tower', at: [0, 0, -10] }, num(2, 4.5, 3)], cast: [ELI({ at: [-4, 5], rot: 30, face: 'thinking' })], acts: [{ who: 'e', do: 'lookup', t: [0.2, 1], hold: true }], cam: low(0, -6, 14, 26, 50) };
S[5] = { ...BEACH, props: [{ id: 'tw', type: 'tower', at: [0, 0, -10] }, WAVE(-22, 2.0)], cast: [], acts: [], cam: { ...drift(0, -10, 10, 34, 6, 50), shake: 0.04 } };
S[6] = { ...BEACH, fx: FX.win, props: [{ id: 'bk', type: 'bunker', at: [0, 0, -6] }, num(3, 4.5, 3)], cast: [ELI({ at: [-4, 6], rot: 30, face: 'starstruck' })], acts: [...both('e', [0.3, 0.5])], cam: push(0, 0, 4.0, 24, 18, 44) };
S[7] = { loc: 'lilyroom', light: 'day', exposure: 0.55, fx: { ...FX.indoor, sparkles: { color: '#9fe0ff', count: 120, size: 0.45, speed: 0.4 } }, props: [{ id: 'st', type: 'stack', at: [2.4, 0, 4], scale: 1.2 }], cast: [ELI({ at: [0, 3], face: 'laugh' })], acts: [], cam: pull(0, 3, 3.2, 12, 16, 40) };
S[8] = { ...BEACH, fx: FX.win, props: [{ id: 'sub', type: 'sign', color: 'SUBSCRIBE', at: [3.2, 0, 2], rot: -15, scale: 1.4 }, num(1, -7, -6), num(2, 0, -8), num(3, 7, -6)], cast: [ELI({ at: [-1, 4], face: 'laugh' })], acts: [arm('e', -1.55, 0.1, [0.1, 0.3])], cam: pull(0, 3, 3.6, 13, 19, 42) };
K.write(ID, S, slot, OUT);
