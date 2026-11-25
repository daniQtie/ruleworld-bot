// "She Whispers I Love You Every Morning, Thinking I Can't Hear" — full story, 20 lines (owner 2026-11-24: one complete episode,
// length exception). Kaito = narrator (headphones), Hana = the girl. The truck is only headlights + white flash to black (no impact).
import * as K from './_common.mjs';
const ID = '2026-11-27-story-17'; const { OUT, slot } = K.timing(ID);
const { C, arm, both, push, pull, drift, low, high, follow, cam, FX, drone, dutch, ots, eye } = K;
const DAY = { loc: 'field', light: 'day', exposure: 1.0, fx: { sat: 1.1, contrast: 1.05 } };
const WARM = { loc: 'forest', light: 'day', exposure: 1.05, fx: { sat: 1.1, contrast: 1.05, tint: [1.08, 1.0, 0.9] } };
const HALL = { loc: 'hallway', light: 'day', exposure: 0.85, fx: { sat: 1.08, contrast: 1.05 } };
const GREY = { loc: 'forest', light: 'day', exposure: 0.95, fx: { sat: 0.85, contrast: 1.05, tint: [0.92, 0.96, 1.08], sparkles: { color: '#bfe0ff', count: 260, size: 0.32, speed: -2.2 } } };
const MORN = { loc: 'field', light: 'day', exposure: 1.0, fx: { sat: 0.95, contrast: 1.05, tint: [0.96, 0.99, 1.05] } };
const RAIN = { color: '#bfe0ff', count: 300, size: 0.3, speed: -2.4 };
const KAI = (o = {}) => C('k', 'kaitoh', 1.2, 4, 0, 'neutral', o);
const HANA = (o = {}) => C('h', 'hana', -1.2, 4, 0, 'happy', o);
const S = [];
// 1 drone down onto the two walking to school
S[0] = { ...DAY, cast: [KAI({ at: [1.2, 6] }), HANA({ at: [-1.2, 6] })], acts: [], cam: drone(0, 6) };
// 2 Kaito close, deadpan, headphones, name tag
S[1] = { ...DAY, trans: 'zoom', cast: [KAI({ at: [0, 4], tag: { name: 'Kaito', role: 'Broken headphones', from: 0.1 } })], acts: [], cam: push(0, 4, 3.8, 11, 8, 34) };
// 3 the broken headphones: taps them, sad
S[2] = { ...HALL, cast: [KAI({ at: [0, 4], face: 'sad' })], acts: [arm('k', -2.5, 0.9, [0.15, 0.4]), { who: 'k', do: 'lookdown', t: [0.5, 1], hold: true }], cam: drift(0, 4, 3.6, 13, 3, 38) };
// 4 Hana intro: shy, blushing, name tag, pink sparkles
S[3] = { ...HALL, fx: { sat: 1.12, contrast: 1.05, sparkles: { color: '#ffd6ec', count: 110, size: 0.4, speed: 0.35 } }, cast: [HANA({ at: [0, 4], face: 'laugh', tag: { name: 'Hana', role: 'Shyest girl in school', from: 0.1 } })], acts: [{ who: 'h', do: 'wave', t: [0.35, 0.9] }], cam: push(0, 4, 3.8, 12, 8.5, 34) };
// 5 MONDAY: walking toward camera side by side, she whispers, eyes ahead
S[4] = { ...DAY, cast: [HANA({ at: [-1.3, -2], rot: 0 }), KAI({ at: [1.3, -2], rot: 0 })], acts: [{ who: 'h', do: 'walk', to: [-1.3, 5], t: [0.02, 1] }, { who: 'k', do: 'walk', to: [1.3, 5], t: [0.02, 1] }], cam: cam([0.6, 5.6, 9], [0.6, 5.6, 15.5], [0, 3.6, -1], 40, [0, 3.6, 5]) };
// 6 deadpan... then he walks into the SCHOOL sign pole (whip in, shake)
S[5] = { ...DAY, trans: 'whip', props: [{ id: 'pole', type: 'sign', color: 'SCHOOL', at: [3.4, 0, 5.4], rot: 0, scale: 1.3 }], cast: [KAI({ at: [-2.5, 6], rot: 90 })], acts: [{ who: 'k', do: 'walk', to: [2.4, 6], t: [0.05, 0.55] }, { who: 'k', do: 'face', kind: 'shocked', t: 0.56 }, { who: 'k', do: 'stepback', dist: 1.2, t: [0.56, 0.7] }], cam: { ...cam([1.2, 5.2, 22], [1.8, 5.0, 19], [1.6, 3.3, 5.6], 44), shake: 0.03 } };
// 7 he can never react: big close-up, Dutch tilt
S[6] = { ...DAY, trans: 'zoom', cast: [KAI({ at: [0, 4], face: 'worried', still: true })], acts: [], cam: dutch(eye(0, 4, 4.4, 5.8, 4.6), 8) };
// 8 TUESDAY: she taps his headphones, he panics; rain falls on "rain sounds"
S[7] = { ...DAY, fx: { sat: 1.05, contrast: 1.05, sparkles: RAIN }, cast: [HANA({ at: [-1.3, 4], rot: 60, face: 'surprised' }), KAI({ at: [1.3, 4], rot: -60, face: 'nervous' })], acts: [arm('h', -2.3, -0.4, [0.1, 0.3]), { who: 'k', do: 'face', kind: 'scared', t: 0.55 }], cam: drift(0, 4, 3.6, 12, 3, 38) };
// 9 WEDNESDAY: her rain facts on a screen, she proudly points
S[8] = { ...HALL, trans: 'flash', props: [{ id: 'tv', type: 'screen', color: 'RAIN FACTS|FACT #27:|RAIN SMELLS SWEET', at: [2.6, 0, 3], rot: -20, scale: 0.95 }], cast: [HANA({ at: [-1.4, 4.5], rot: 30, face: 'starstruck' }), KAI({ at: [-4.4, 6.5], rot: 40 })], acts: [arm('h', -1.6, -0.7, [0.15, 0.35])], cam: pull(0, 4, 3.6, 13, 17, 42) };
// 10 fire drill: red alarm bell, glitch, she holds his hand and blushes, he just nods
S[9] = { ...DAY, trans: 'glitch', glitch: [[0.0, 0.12]], props: [{ id: 'al', type: 'alarm', at: [2.9, 0, 2.2] }], cast: [HANA({ at: [-1.0, 4], rot: 40, face: 'laugh', redFlash: [[0.45, 0.75]] }), KAI({ at: [1.0, 4], rot: -20 }), C('a', 'lucy', -5, 1, 20, 'worried'), C('b', 'noob', 5, 1, -20, 'scared')], acts: [arm('h', -1.0, -0.9, [0.25, 0.4], 'L'), arm('k', -0.9, 0.8, [0.25, 0.4]), { who: 'k', do: 'nod', t: [0.75, 1] }], cam: push(0, 4, 3.6, 15, 11, 40) };
// 11 THURSDAY: on the bus, she falls asleep on his shoulder and mumbles
S[10] = { ...HALL, trans: 'zoom', props: [{ id: 'seat', type: 'busseat', at: [0, 0, 3.3], scale: 1 }], cast: [HANA({ at: [-0.8, 3.6], rot: 10, face: 'happy' }), KAI({ at: [0.85, 3.6], rot: -5 })], acts: [{ who: 'h', do: 'sit', seat: 1.6, t: [0, 1], hold: true }, { who: 'k', do: 'sit', seat: 1.6, t: [0, 1], hold: true }, { who: 'h', do: 'sleep', t: [0.2, 1], hold: true }], cam: push(0, 3.6, 3.0, 12, 9, 38) };
// 12 FRIDAY: he takes the headphones off and says it back
S[11] = { ...DAY, trans: 'flash', cast: [C('k', 'kaito', 1.3, 4, -60, 'determined'), HANA({ at: [-1.3, 4], rot: 60 })], acts: [arm('k', -2.7, 0.9, [0.05, 0.25]), arm('k', -1.2, 0.4, [0.4, 0.55]), { who: 'h', do: 'face', kind: 'shocked', t: 0.72 }], cam: drift(0, 4, 3.6, 12, 3, 38) };
// 13 she freezes, turns red, hides her face in her sleeves
S[12] = { ...DAY, cast: [HANA({ at: [0, 4], face: 'shocked', redFlash: [[0.35, 1]] })], acts: [{ who: 'h', do: 'face', kind: 'surprised', t: 0.25 }, { who: 'h', do: 'handsface', t: [0.55, 0.75], hold: true }], cam: push(0, 4, 3.8, 11, 8, 34) };
// 14 she laughs and runs across the road shouting it
S[13] = { ...DAY, fx: { sat: 1.15, contrast: 1.05, sparkles: { color: '#ffe0f0', count: 160, size: 0.45, speed: 0.6 } }, cast: [HANA({ at: [-6, 5], rot: 90, face: 'laugh' })], acts: [{ who: 'h', do: 'run', to: [7, 5], t: [0.05, 1] }, ...both('h', [0.45, 0.6])], cam: follow(-7, 6, 5, 3.4, 15, 42) };
// 15 for the first time, she wasn't shy: arms wide in the middle of the road, warm light
S[14] = { ...WARM, fx: { ...WARM.fx, sparkles: { color: '#ffe9a0', count: 180, size: 0.5, speed: 0.5 } }, cast: [HANA({ at: [0, 4], face: 'laugh' })], acts: [...both('h', [0.1, 0.3], -2.2), { who: 'h', do: 'dance', t: [0.3, 1], keepArms: true }], cam: low(0, 4, 3.6, 12, 44) };
// 16 she never saw the truck: headlights roll in, white flash, black (nothing else shown)
S[15] = { ...DAY, blackout: 0.62, props: [{ id: 'tr', type: 'truck', at: [-24, 0, 2.5], rot: 90, scale: 1.1 }], cast: [HANA({ at: [2.2, 4], rot: 0, face: 'laugh' })], acts: [{ who: 'h', do: 'face', kind: 'surprised', t: 0.5 }, { who: 'h', do: 'turn', to: -70, t: [0.45, 0.6] }, { prop: 'tr', do: 'move', to: [-3, 0, 2.5], t: [0.1, 0.62] }], cam: low(0, 4, 3.6, 17, 52) };
// 17 her stone with a little raindrop, flowers; he stands beside it (fade in from black, quiet rain)
S[16] = { ...GREY, trans: 'black', props: [{ id: 'gs', type: 'gravestone', at: [0, 0, 3.5], scale: 1.2 }], cast: [KAI({ at: [3.2, 5.2], rot: -40, face: 'sob' })], acts: [{ who: 'k', do: 'lookdown', t: [0.3, 1], hold: true }], cam: push(0.8, 3.5, 2.4, 12, 9, 40) };
// 18 he still walks to school every morning, alone, headphones on
S[17] = { ...MORN, trans: 'zoom', cast: [KAI({ at: [-5, 6], rot: 90 })], acts: [{ who: 'k', do: 'walk', to: [4, 6], t: [0.02, 1] }], cam: follow(-6, 3, 6, 3.4, 15, 40) };
// 19 the corner: flowers on the pole, he stops; pink sparkles drift past him (he hears her)
S[18] = { ...MORN, fx: { ...MORN.fx, sparkles: { color: '#ffd6ec', count: 90, size: 0.42, speed: 0.3 } }, props: [{ id: 'pole', type: 'sign', color: 'SCHOOL', at: [2.6, 0, 4.2], rot: 0, scale: 1.3 }, { id: 'fl', type: 'flowers', at: [2.1, 0, 5.0], scale: 1.2 }], cast: [KAI({ at: [-0.5, 5], rot: 0, face: 'sad' })], acts: [{ who: 'k', do: 'lookside', deg: -25, t: [0.4, 0.7], hold: true }], cam: push(1, 5, 3.4, 14, 10.5, 40) };
// 20 loop: deadpan close-up, perfectly still (same look as line 2)
S[19] = { ...MORN, trans: 'zoom', cast: [KAI({ at: [0, 4], face: 'determined', still: true })], acts: [], cam: push(0, 4, 3.8, 11, 7.5, 34) };
K.write(ID, S, slot, OUT);
