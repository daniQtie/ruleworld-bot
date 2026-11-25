// Shot specs for 2026-11-21-story-01 ("In this town, being kind is the worst thing you can do").
// node render/specs/2026-11-21-story-01.mjs  ->  output/2026-11-21-story-01/shotspec.json
// One shot per script line. Times are fractions of the shot; dur = narration slot + 0.3 s.
// City staging: street along z (road x -7..7, sidewalks 7..35, facades x = +-35.4), "square" = crossroad at z -42 with a dry fountain.
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const ID = '2026-11-21-story-01', OUT = path.join(ROOT, 'output', ID);
const narr = JSON.parse(fs.readFileSync(path.join(OUT, fs.readdirSync(OUT).filter(f => /^narration-.*\.json$/.test(f)).sort((a, b) => fs.statSync(path.join(OUT, b)).mtimeMs - fs.statSync(path.join(OUT, a)).mtimeMs)[0]), 'utf8'));
const times = narr.times, total = times.at(-1).end + 0.8;
const slot = i => (i + 1 < times.length ? times[i + 1].start : total) - (i === 0 ? 0 : times[i].start);

// ---- fixed looks / accessory states (continuity) ----
const HATS = [['tophat', '#1e1e1e'], ['straw', '#f4d03f'], ['bucket', '#16a085'], ['beanie', '#8e44ad'], ['cap', '#e74c3c']];  // bottom -> top (red cap on top)
const SCARVES = [['scarf', '#f1c40f'], ['scarf', '#e84393'], ['scarf', '#27ae60']];                                              // green outside
const GLASSES = [['glasses', '#151515'], ['glasses', '#2e86de']];
const PACK = [['backpack', '#f39c12']];                                                                                           // big orange backpack
const MILO_FULL = { head: HATS, neck: SCARVES, face: GLASSES, back: PACK };                 // lines 8-12
const MILO_A = { head: HATS.slice(0, 4), neck: SCARVES, face: GLASSES, back: PACK };        // after the red cap went to Pip (12)
const MILO_B = { head: HATS.slice(0, 4), neck: SCARVES.slice(0, 2), face: GLASSES, back: PACK }; // after the green scarf went to the baker (20)
const MILO_C = { head: HATS.slice(0, 2), neck: SCARVES.slice(0, 1), face: GLASSES.slice(0, 1), back: PACK }; // still giving things away (23)
const KNIT = ['knit', '#d62f2f'];                                                           // the red scarf Milo knitted (Lena's)
const PIP_CAP = { head: [['cap', '#e74c3c']] };
const LENA_BRIGHT = { head: [['beanie', '#e84393']], hair: [['ribbon', '#ff4fa3'], ['clip', '#ffd000']] };
const LENA_FINAL = { ...LENA_BRIGHT, neck: [KNIT] };
const C = (id, who, at, rot = 0, more = {}) => ({ id, who, at, rot, ...more });
const cam = (from, to, look, lookTo = look, fov = 40, fovTo = fov, extra = {}) => ({ from, to, look, lookTo, fov, fovTo, ...extra });

const shots = [
  // 0 hook: helper's big orange backpack rips off and flies onto the person he helps up
  { loc: 'city', light: 'day',
    cast: [C('a', 'towns', [1.8, -20.6], -75, { acc: { back: PACK } }), C('b', 'towns', [-1.8, -19.8], 70, { face: 'worried' })],
    acts: [{ do: 'sit', who: 'b', t: [0, 0.42] }, { do: 'reach', who: 'a', t: [0, 0.5] }, { do: 'pull', who: 'a', t: [0.2, 0.45] },
      { do: 'fly', acc: 'a.back0', to: 'b.back0', t: [0.42, 0.78], arc: 2.2 }, { do: 'face', who: 'a', kind: 'surprised', t: 0.5 }, { do: 'face', who: 'b', kind: 'surprised', t: 0.62 },
      { do: 'turn', who: 'b', to: 15, t: [0.6, 0.9] }],
    cam: cam([11, 7.5, -5], [6.5, 5.8, -10.5], [0, 3.4, -20.2], [0, 3.8, -20.2], 46, 46, { ease: 'out' }) },
  // 1 helper pats a sad grey kid; purple bow tie jumps onto the kid
  { loc: 'city', light: 'day',
    cast: [C('a', 'towns', [1.6, -21], -45, { acc: { chest: [['bowtie', '#8e44ad']] } }), C('k', 'towns', [-1.2, -19.4], 35, { scale: 0.72, face: 'sad' })],
    acts: [{ do: 'pat', who: 'a', t: [0.05, 0.55] }, { do: 'lookdown', who: 'k', t: [0, 0.5] }, { do: 'fly', acc: 'a.chest0', to: 'k.chest0', t: [0.42, 0.75], arc: 1.4 },
      { do: 'face', who: 'k', kind: 'surprised', t: 0.72 }, { do: 'lookdown', who: 'a', t: [0.7, 1], hold: true }, { do: 'face', who: 'a', kind: 'worried', t: 0.75 }],
    cam: cam([2.5, 11, -7], [1.8, 10, -9], [0, 2.8, -20.5], [0, 3.0, -20.5], 42, 40) },
  // 2 carry a bag -> green bucket hat flies onto their head
  { loc: 'city', light: 'day',
    cast: [C('a', 'towns', [1.8, -20.5], -50, { acc: { head: [['bucket', '#27ae60']] } }), C('b', 'towns', [-1.8, -19.5], 40)],
    props: [{ id: 'bag', type: 'bag', at: [-0.2, 1.1, -19.2] }],
    acts: [{ do: 'fly', acc: 'bag', to: 'a.handR0', t: [0.05, 0.3], arc: 0.2, spin: 0 }, { do: 'lift', who: 'a', t: [0.05, 1], hold: true },
      { do: 'fly', acc: 'a.head0', to: 'b.head0', t: [0.4, 0.78], arc: 2.0 }, { do: 'face', who: 'b', kind: 'surprised', t: 0.75 }, { do: 'touchhead', who: 'b', arm: 'L', t: [0.8, 1], hold: true }],
    cam: cam([-5, 6.4, -5], [-4, 6, -7.5], [0, 4.2, -20], [0, 4.4, -20], 44, 42) },
  // 3 share lunch -> round black glasses jump face to face
  { loc: 'city', light: 'day',
    cast: [C('a', 'towns', [1.5, -20.4], -45, { acc: { face: [['glasses', '#151515']], handR: [['sandwich']] } }), C('b', 'towns', [-1.5, -19.8], 45)],
    acts: [{ do: 'give', who: 'a', t: [0, 0.45] }, { do: 'reach', who: 'b', arm: 'L', t: [0.12, 0.5] }, { do: 'fly', acc: 'a.handR0', to: 'b.handL0', t: [0.18, 0.38], arc: 0.2, spin: 0 },
      { do: 'fly', acc: 'a.face0', to: 'b.face0', t: [0.45, 0.75], arc: 0.9 }, { do: 'face', who: 'a', kind: 'surprised', t: 0.5 }, { do: 'face', who: 'b', kind: 'surprised', t: 0.74 }],
    cam: { keys: [{ t: 0, pos: [0.5, 6.2, -5.5], look: [0, 4.4, -20], fov: 42 }, { t: 0.42, pos: [0.4, 6.0, -7], look: [0, 4.5, -20], fov: 40 }, { t: 0.8, pos: [-0.7, 5.0, -13.4], look: [-1.5, 4.8, -19.8], fov: 34 }, { t: 1, pos: [-0.7, 5.0, -13.6], look: [-1.5, 4.8, -19.8], fov: 33 }] } },
  // 4 hold a door -> yellow scarf wraps itself around a stranger walking through
  { loc: 'city', light: 'day', doors: [{ id: 'd', z: -24, open: -88 }],
    cast: [C('a', 'towns', [31, -27.6], -20, { acc: { neck: [['scarf', '#f1c40f']] } }), C('b', 'towns', [34.2, -24], -90, { look: 1 })],
    acts: [{ do: 'reach', who: 'a', arm: 'R', t: [0, 1], hold: true }, { do: 'walk', who: 'b', to: [27.5, -22.6], t: [0.05, 0.85] },
      { do: 'fly', acc: 'a.neck0', to: 'b.neck0', t: [0.4, 0.78], arc: 1.2, spin: 2 }, { do: 'face', who: 'a', kind: 'surprised', t: 0.5 }, { do: 'face', who: 'b', kind: 'surprised', t: 0.75 }],
    cam: { keys: [{ t: 0, pos: [15, 7.5, -12], look: [31, 4.0, -24.5], fov: 46 }, { t: 0.45, pos: [17, 6.8, -14], look: [30, 4.0, -24], fov: 44 }, { t: 0.85, pos: [21.4, 4.6, -21.0], look: [27.6, 3.9, -22.6], fov: 40 }, { t: 1, pos: [21.6, 4.6, -21.1], look: [27.6, 3.9, -22.6], fov: 39 }] } },
  // 5 nobody helps anybody: grey people pass each other, arms crossed, no accessories
  { loc: 'city', light: 'day',
    cast: [C('a', 'towns', [-6, -14]), C('b', 'towns', [6, -30]), C('c', 'towns', [9, -18]), C('d', 'towns', [-8, -28]), C('e', 'towns', [2, -10]), C('f', 'towns', [-2, -36])],
    acts: ['a', 'b', 'c', 'd', 'e', 'f'].flatMap((w, i) => [{ do: 'walk', who: w, to: [[6, -26], [-5, -16], [-7, -24], [7, -20], [-3, -26], [4, -20]][i], t: [0, 1], ease: 'lin' }, { do: 'crossarms', who: w, t: [0, 1], hold: true }, { do: 'face', who: w, kind: 'grumpy', t: 0 }]),
    cam: cam([0, 32, 2], [0, 29, -3], [0, 0, -22], [0, 0, -23], 44, 42) },
  // 6 morning: a grey man sits up in bed touching a tiny pink ribbon he has never seen
  { loc: 'bedroom', light: 'morning',
    cast: [C('p', 'towns', [0, -4.4], 0, { acc: { hair: [['ribbon', '#ff4fa3']] }, face: 'worried' })],
    acts: [{ do: 'sit', who: 'p', seat: 2.4, t: [0, 1], hold: true }, { do: 'touchhead', who: 'p', t: [0.3, 1], hold: true }, { do: 'lookside', who: 'p', deg: -18, t: [0.25, 1], hold: true },
      { do: 'face', who: 'p', kind: 'surprised', t: 0.45 }],
    cam: cam([0, 7.2, 12], [0.6, 6.4, 5], [0, 5.6, -4], [0, 6.0, -4], 40, 38) },
  // 7 a pink ribbon, a yellow hair clip: two confused neighbours compare in a doorway (close-up on each object)
  { loc: 'city', light: 'morning', doors: [{ id: 'd', z: -24, open: -88 }],
    cast: [C('p', 'towns', [32.2, -22.7], -115, { acc: { hair: [['ribbon', '#ff4fa3']] }, face: 'worried' }), C('q', 'towns', [32.0, -25.2], -65, { acc: { hair: [['clip', '#ffd000']] }, face: 'surprised' })],
    acts: [{ do: 'lookside', who: 'p', deg: -30, t: [0.1, 1], hold: true }, { do: 'lookside', who: 'q', deg: 30, t: [0.5, 1], hold: true }, { do: 'shake', who: 'p', t: [0.75, 1] }],
    cam: { keys: [{ t: 0, pos: [25.4, 6.2, -22.2], look: [32.2, 5.6, -22.7], fov: 24 }, { t: 0.4, pos: [25.6, 6.2, -22.4], look: [32.2, 5.6, -22.7], fov: 22 }, { t: 0.55, pos: [25.4, 6.2, -25.4], look: [32.0, 5.6, -25.2], fov: 24 }, { t: 0.82, pos: [25.6, 6.2, -25.3], look: [32.0, 5.6, -25.2], fov: 22 }, { t: 1, pos: [23.5, 6.4, -24.0], look: [32, 5.0, -24.0], fov: 36 }] } },
  // 8 Milo walks through the town gate (low, wide, from behind the gate)
  { loc: 'gate', light: 'day',
    cast: [C('milo', 'milo', [0, 16], 180, { acc: MILO_FULL })],
    acts: [{ do: 'walk', who: 'milo', to: [0, -5], t: [0, 0.95] }, { do: 'face', who: 'milo', kind: 'smile', t: 0 }],
    cam: cam([3, 1.4, -16], [2.2, 1.8, -13.5], [0, 8, 4], [0, 6.5, -2], 50, 48) },
  // 9 five hats, three scarves, two pairs of glasses and a backpack: tilt up from shoes to hats
  { loc: 'gate', light: 'day',
    cast: [C('milo', 'milo', [0, -6], -10, { acc: MILO_FULL })],
    acts: [{ do: 'nod', who: 'milo', t: [0.75, 1] }],
    cam: cam([0, 1.4, 3.5], [1.2, 6.2, 5.5], [0, 1.0, -6], [0, 5.6, -6], 34, 50) },
  // 10 the town stares; Milo scans the street with a serious, searching face
  { loc: 'city', light: 'day',
    cast: [C('milo', 'milo', [0, -26], 0, { acc: MILO_FULL, face: 'serious' }), C('t1', 'towns', [-1.9, -9], 170, { face: 'surprised' }), C('t2', 'towns', [2.1, -9.5], 195, { face: 'surprised' }), C('t3', 'towns', [-3.2, -14], 160, { face: 'surprised' }), C('t4', 'towns', [3.6, -15], 205, { face: 'surprised' })],
    acts: [...['t1', 't2', 't3', 't4'].map(w => ({ do: 'freeze', who: w, t: [0, 1], hold: true })),
      { do: 'lookside', who: 'milo', deg: 35, t: [0.12, 0.45] }, { do: 'lookside', who: 'milo', deg: -35, t: [0.5, 0.82] }],
    cam: cam([0.3, 6.8, -1], [0.2, 7.0, -3], [0, 4.8, -26], [0, 6.2, -26], 44, 22) },
  // 11 Pip trips and falls; grey townsfolk step around him without stopping
  { loc: 'city', light: 'day',
    cast: [C('pip', 'pip', [-6, -20.5], 90, { face: 'smile' }), C('t1', 'towns', [-9, -27]), C('t2', 'towns', [9, -25])],
    acts: [{ do: 'run', who: 'pip', to: [-1.5, -20.5], t: [0, 0.28], ease: 'lin' }, { do: 'lie', who: 'pip', t: [0.28, 1], hold: true, in: 0.18 }, { do: 'face', who: 'pip', kind: 'cry', t: 0.32 },
      { do: 'walk', who: 't1', to: [7, -25.5], t: [0.1, 1], ease: 'lin' }, { do: 'walk', who: 't2', to: [-8, -28.5], t: [0.2, 1], ease: 'lin' }, { do: 'crossarms', who: 't1', t: [0, 1], hold: true }, { do: 'crossarms', who: 't2', t: [0, 1], hold: true }],
    cam: cam([0.5, 3.0, -10], [-1.0, 4.6, -13], [-3, 1.2, -21], [-3.8, 0.6, -20.8], 46, 44) },
  // 12 Milo helps Pip up -> pop! the red cap jumps onto Pip's head
  { loc: 'city', light: 'day',
    cast: [C('milo', 'milo', [1.8, -21.2], -55, { acc: MILO_FULL }), C('pip', 'pip', [-1.3, -19.4], 50, { face: 'cry' })],
    acts: [{ do: 'sit', who: 'pip', t: [0, 0.38] }, { do: 'holdhand', who: 'milo', t: [0, 0.55] }, { do: 'reach', who: 'pip', arm: 'R', t: [0, 0.45] },
      { do: 'fly', acc: 'milo.head4', to: 'pip.head0', t: [0.42, 0.74], arc: 1.5 }, { do: 'face', who: 'pip', kind: 'surprised', t: 0.7 }, { do: 'hop', who: 'pip', t: [0.72, 0.85], h: 0.6 }],
    cam: cam([0.6, 6.6, -6.5], [0.4, 6.4, -8.5], [0.2, 5.2, -20.3], [0.2, 4.9, -20.3], 46, 44) },
  // 13 Pip touches it slowly: his first hat
  { loc: 'city', light: 'day',
    cast: [C('pip', 'pip', [0, -20], 0, { acc: PIP_CAP, face: 'surprised' })],
    acts: [{ do: 'touchhead', who: 'pip', both: true, t: [0.08, 1], hold: true, in: 0.6 }, { do: 'face', who: 'pip', kind: 'shy', t: 0.6 }, { do: 'lookup', who: 'pip', t: [0.1, 0.6] }],
    cam: cam([0.4, 3.9, -12.6], [0.1, 3.8, -14.2], [0, 3.5, -20], [0, 3.6, -20], 40, 38) },
  // 14 Milo, missing his red cap, does not look sad at all
  { loc: 'city', light: 'day',
    cast: [C('milo', 'milo', [0, -20], -15, { acc: MILO_A, face: 'smile' })],
    acts: [{ do: 'lookside', who: 'milo', deg: -20, t: [0, 1], hold: true }, { do: 'nod', who: 'milo', t: [0.55, 0.85] }, { do: 'face', who: 'milo', kind: 'happy', t: 0.5 }],
    cam: cam([1.2, 5.6, -12.5], [0.8, 5.5, -13.8], [0, 5.9, -20], [0, 5.8, -20], 40, 38) },
  // 15 Mayor Tilda walks over with her cane
  { loc: 'city', light: 'day',
    cast: [C('tilda', 'tilda', [-1, -36], 0, { bent: true })],
    acts: [{ do: 'walk', who: 'tilda', to: [0, -25], t: [0, 1], ease: 'lin' }, { do: 'arm', who: 'tilda', arm: 'R', x: -0.35, z: 0.12, t: [0, 1], hold: true }],
    cam: cam([3, 2.4, -22], [2.5, 3.6, -16], [-0.5, 2.0, -34], [0, 3.6, -25], 44, 42) },
  // 16 she holds up her bare hands: she does not own a single thing
  { loc: 'city', light: 'day',
    cast: [C('tilda', 'tilda', [0, -20], 0, { bent: true, hideCane: true, face: 'oldsad' })],
    acts: [{ do: 'emptyhands', who: 'tilda', t: [0.05, 1], hold: true, in: 0.5 }, { do: 'lookdown', who: 'tilda', t: [0, 0.5] }],
    cam: { keys: [{ t: 0, pos: [0.3, 4.6, -9.5], look: [0, 4.0, -20], fov: 38 }, { t: 1, pos: [0, 5.0, -10.5], look: [0, 4.6, -20], fov: 38 }] } },
  // 17 flashback: young Tilda carries a basket; her last hat jumps off her bun onto the townsperson
  { loc: 'city', light: 'sunset', flashback: true,
    cast: [C('yt', 'youngtilda', [4.2, -21.5], -60, { acc: { head: [['bowler', '#9b59b6']], handR: [['basket']] } }), C('b', 'towns', [-1.6, -19.6], 45)],
    acts: [{ do: 'walk', who: 'yt', to: [1.7, -20.6], t: [0, 0.35] }, { do: 'turn', who: 'yt', to: -55, t: [0.35, 0.45] }, { do: 'give', who: 'yt', t: [0, 1], hold: true },
      { do: 'fly', acc: 'yt.head0', to: 'b.head0', t: [0.4, 0.8], arc: 1.8 }, { do: 'face', who: 'yt', kind: 'surprised', t: 0.6 }, { do: 'face', who: 'b', kind: 'surprised', t: 0.8 }],
    cam: cam([1.5, 7, -3], [1, 6.2, -6.5], [0.8, 4.2, -20.5], [0.6, 4.4, -20.5], 46, 44) },
  // 18 Tilda points her cane: stop, or end up like me. Milo smiles and shakes his head
  { loc: 'city', light: 'day',
    cast: [C('tilda', 'tilda', [4.4, -16.5], 214, { bent: true, face: 'oldstern' }), C('milo', 'milo', [-0.4, -24], 15, { acc: MILO_A, face: 'smile' })],
    acts: [{ do: 'point', who: 'tilda', arm: 'R', jab: true, t: [0.03, 0.75] }, { do: 'shake', who: 'milo', t: [0.45, 0.95] }, { do: 'face', who: 'milo', kind: 'happy', t: 0.45 }],
    cam: cam([6.4, 6.8, -9], [5.8, 6.5, -10.5], [0.6, 5.0, -24], [0.2, 5.2, -24], 42, 40) },
  // 19 bakery morning: the grumpy baker tips his tray; three loaves roll neatly into the street
  { loc: 'bakery', light: 'morning',
    cast: [C('baker', 'baker', [26, 0.5], -90, { acc: { neck: [KNIT], handR: [['tray']] }, face: 'grumpy' })],
    props: [0, 1, 2].map(i => ({ id: 'l' + i, type: 'loaf', at: [23.9, 3.7, -0.3 + i * 0.75] })),
    acts: [{ do: 'carry', who: 'baker', t: [0, 1], hold: true }, { do: 'tip', acc: 'baker.handR0', deg: -35, t: [0.12, 0.32] }, { do: 'face', who: 'baker', kind: 'surprised', t: 0.15 }, { do: 'face', who: 'baker', kind: 'grumpy', t: 0.7 }, { do: 'lookdown', who: 'baker', t: [0.3, 1], hold: true },
      ...[0, 1, 2].map(i => ({ do: 'move', prop: 'l' + i, to: [22.4, 0, -0.3 + i * 0.75], t: [0.22 + i * 0.03, 0.4 + i * 0.03], ease: 'in' })),
      ...[0, 1, 2].map(i => ({ do: 'move', prop: 'l' + i, from: [22.4, 0, -0.3 + i * 0.75], to: [19.8 + i * 1.5, 0, 1.2 + i * 0.9], t: [0.42 + i * 0.03, 0.8 + i * 0.03], roll: true, ease: 'out' }))],
    cam: cam([23.6, 6.0, 18], [23.6, 5.6, 16.5], [23.6, 2.6, 0.2], [23.4, 2.3, 0.2], 50, 50) },
  // 20 Milo picked up every loaf: he brings them back to the tray -> his green scarf flies onto the baker (who scowls)
  { loc: 'bakery', light: 'morning',
    cast: [C('milo', 'milo', [19.8, -1.4], 60, { acc: { ...MILO_A, handR: [['loaf']], handL: [['loaf']] } }), C('baker', 'baker', [26.4, 0.4], -65, { acc: { neck: [KNIT], handR: [['tray']] }, face: 'grumpy' })],
    acts: [{ do: 'walk', who: 'milo', to: [22.2, -0.5], t: [0, 0.28] }, { do: 'carry', who: 'milo', t: [0, 0.5] }, { do: 'carry', who: 'baker', t: [0, 1], hold: true },
      { do: 'fly', acc: 'milo.handR0', to: [24.4, 3.8, 1.0], t: [0.28, 0.42], arc: 0.3, spin: 0 }, { do: 'fly', acc: 'milo.handL0', to: [24.7, 3.8, 1.6], t: [0.3, 0.44], arc: 0.3, spin: 0 },
      { do: 'fly', acc: 'milo.neck2', to: 'baker.neck1', t: [0.5, 0.82], arc: 1.4, spin: 2 }, { do: 'face', who: 'milo', kind: 'happy', t: 0.3 }, { do: 'face', who: 'baker', kind: 'angry', t: 0.82 }],
    cam: cam([23.6, 7, 17], [24, 6.5, 14.5], [23.8, 4.8, 0], [24.2, 4.8, 0], 44, 44) },
  // 21 the baker yells at Milo to stay away (flour flying); Milo steps back
  { loc: 'bakery', light: 'morning',
    cast: [C('baker', 'baker', [26.4, 0.4], -55, { acc: { neck: [KNIT, ['scarf', '#27ae60']] }, face: 'angry' }), C('milo', 'milo', [21.6, -1.6], 40, { acc: MILO_B, face: 'worried' })],
    acts: [{ do: 'point', who: 'baker', arm: 'R', jab: true, t: [0.05, 1], hold: true, up: 0.15 }, { do: 'puff', who: 'baker', arm: 'R', t: [0.15, 0.6] },
      { do: 'arm', who: 'baker', arm: 'L', x: -0.9, z: 0.5, t: [0.3, 1], hold: true }, { do: 'stepback', who: 'milo', dist: 2.2, t: [0.3, 0.7], hold: true }],
    cam: cam([23.2, 2.6, 15], [23.6, 2.3, 13], [24.4, 5.4, 0], [24.6, 5.6, 0], 46, 44) },
  // 22 Milo sees it: the baker already wears the red scarf Milo knitted (Milo in frame, reacting)
  { loc: 'bakery', light: 'morning',
    cast: [C('baker', 'baker', [26.4, 0.4], -110, { acc: { neck: [KNIT, ['scarf', '#27ae60']] }, face: 'grumpy' }), C('milo', 'milo', [23.4, -1.4], 105, { acc: MILO_B, face: 'smile' })],
    acts: [{ do: 'face', who: 'milo', kind: 'surprised', t: 0.35 }, { do: 'hop', who: 'milo', t: [0.35, 0.47], h: 0.4 }, { do: 'point', who: 'milo', arm: 'L', t: [0.5, 1], hold: true, up: 0.2 }],
    cam: { keys: [{ t: 0, pos: [24.9, 5.8, -9.5], look: [24.9, 4.8, -0.5], fov: 44 }, { t: 0.45, pos: [25.4, 5.2, -6.0], look: [26.3, 4.5, 0.4], fov: 26 }, { t: 0.7, pos: [24.9, 5.6, -9.0], look: [24.9, 4.8, -0.5], fov: 44 }, { t: 1, pos: [24.9, 5.6, -9.2], look: [24.9, 4.8, -0.5], fov: 44 }] } },
  // 23 the town grows scared: doors slam as Milo walks by
  { loc: 'city', light: 'day', doors: [{ id: 'd1', z: -30, open: -88 }, { id: 'd2', z: -18, open: -88 }, { id: 'd3', z: -6, open: -88 }],
    cast: [C('milo', 'milo', [26.5, -38], 0, { acc: MILO_C, face: 'worried' }), C('t1', 'towns', [12, -16], 200, { face: 'grumpy' }), C('t2', 'towns', [14, -4], 160, { face: 'worried' })],
    acts: [{ do: 'walk', who: 'milo', to: [26.5, -4], t: [0, 1], ease: 'lin' },
      { do: 'door', id: 'd1', from: -88, to: 0, t: [0.18, 0.26], slam: true }, { do: 'door', id: 'd2', from: -88, to: 0, t: [0.45, 0.53], slam: true }, { do: 'door', id: 'd3', from: -88, to: 0, t: [0.72, 0.8], slam: true },
      { do: 'turn', who: 't1', to: 20, t: [0.35, 0.55] }, { do: 'turn', who: 't2', to: -20, t: [0.6, 0.8] }, { do: 'crossarms', who: 't1', t: [0.5, 1], hold: true }, { do: 'crossarms', who: 't2', t: [0.75, 1], hold: true }],
    cam: cam([16, 6.5, -24], [16, 6.5, 6], [28, 4.5, -38], [28, 4.5, -6], 46, 46, { ease: 'lin' }) },
  // 24 sunset: Milo has given away everything but his blue shirt
  { loc: 'city', light: 'sunset',
    cast: [C('milo', 'milo', [0, -26], 10, { face: 'sad' })],
    acts: [{ do: 'lookdown', who: 'milo', t: [0.2, 1], hold: true }],
    cam: cam([1, 9, 10], [0.5, 7, 2], [0, 3, -28], [0, 3.2, -28], 40, 36) },
  // 25 tiny glowing footprints lead up to the lighthouse; Milo follows
  { loc: 'hill', light: 'sunset',
    cast: [C('milo', 'milo', [1, 32], 180, { face: 'serious' })],
    acts: [{ do: 'footprints', from: 0.08, to: 0.97, n: 26, t: [0, 0.55] }, { do: 'walk', who: 'milo', to: [3, 15], t: [0.15, 1], ease: 'lin' }],
    cam: { keys: [{ t: 0, pos: [5, 1.6, 40], look: [3, 0.6, 18], fov: 44 }, { t: 0.45, pos: [6, 4, 44], look: [2, 3, 10], fov: 46 }, { t: 1, pos: [8, 13, 52], look: [0, 12, -30], fov: 48 }] } },
  // 26 under the lighthouse: Milo opens the low door to a dark cellar with one lantern
  { loc: 'cellar', light: 'cellar',
    cast: [C('milo', 'milo', [7, -15], 0, { face: 'worried' })],
    props: [{ id: 'lan', type: 'lantern', at: [-4.6, 0.95, -6.8] }],
    acts: [{ do: 'cellardoor', from: 0, to: -105, t: [0.02, 0.35] }, { do: 'walk', who: 'milo', to: [7, -10.4], t: [0.3, 0.75] }, { do: 'lookside', who: 'milo', deg: -35, t: [0.75, 1], hold: true }],
    cam: cam([1, 5.4, 7], [3, 5.2, 1], [6.5, 4.5, -12], [6.5, 4.8, -11], 44, 42) },
  // 27 a little girl in plain grey sits in the corner
  { loc: 'cellar', light: 'cellar',
    cast: [C('lena', 'lena', [-7.5, -7.2], 35, { face: 'sad' })],
    props: [{ id: 'lan', type: 'lantern', at: [-4.6, 0.95, -6.6] }],
    acts: [{ do: 'sit', who: 'lena', seat: 3.0, knees: true, t: [0, 1], hold: true }, { do: 'lookdown', who: 'lena', t: [0, 1], hold: true }],
    cam: cam([1.5, 6, 5], [-2.2, 5.2, -0.5], [-7, 4.0, -7.3], [-7.2, 4.3, -7.3], 40, 36) },
  // 28 Milo freezes: it is Lena, his little sister (two-shot)
  { loc: 'cellar', light: 'cellar',
    cast: [C('milo', 'milo', [-2.5, -4.0], -70, { face: 'surprised' }), C('lena', 'lena', [-7.5, -7.2], 55, { face: 'sad' })],
    props: [{ id: 'lan', type: 'lantern', at: [-4.6, 0.95, -6.6] }],
    acts: [{ do: 'sit', who: 'lena', seat: 3.0, knees: true, t: [0, 1], hold: true }, { do: 'lookdown', who: 'lena', t: [0, 0.5] }, { do: 'face', who: 'lena', kind: 'surprised', t: 0.55 }, { do: 'hop', who: 'milo', t: [0.08, 0.2], h: 0.35 }, { do: 'handsface', who: 'milo', t: [0.6, 1], hold: true }],
    cam: cam([-3.0, 6.6, 8.5], [-3.2, 6.1, 6.2], [-5.0, 4.3, -5.6], [-5.0, 4.5, -5.6], 46, 44) },
  // 29 every night she sneaked out to help people while they slept
  { loc: 'city', light: 'night',
    cast: [C('lena', 'lena', [24, -30], 0, { acc: { hair: [['ribbon', '#ff4fa3']], handR: [['lantern']], handL: [['bowl']] }, face: 'smile' })],
    acts: [{ do: 'walk', who: 'lena', sneak: true, to: [15, -19], t: [0, 1], ease: 'lin' }],
    cam: cam([4, 8, -4], [6, 6.5, -7], [22, 2, -28], [16, 2, -20], 44, 42) },
  // 30 each time, the rule took one thing from her: the pink ribbon floats onto a sleeper
  { loc: 'city', light: 'night',
    cast: [C('lena', 'lena', [30, -21], 140, { acc: { hair: [['ribbon', '#ff4fa3']], handR: [['lantern']] }, face: 'smile' }), C('s', 'towns', [32.8, -23.6], -90, { face: 'sleep' })],
    acts: [{ do: 'sit', who: 's', t: [0, 1], hold: true }, { do: 'sleep', who: 's', t: [0, 1], hold: true }, { do: 'arm', who: 'lena', arm: 'R', x: -0.8, z: 0, t: [0, 1], hold: true },
      { do: 'fly', acc: 'lena.hair0', to: 's.hair2', t: [0.2, 0.72], arc: 0.7, spin: 0 }, { do: 'lookside', who: 'lena', deg: 10, t: [0.3, 1], hold: true }],
    cam: { keys: [{ t: 0, pos: [24.2, 4.8, -33.5], look: [31.4, 2.6, -22.3], fov: 44 }, { t: 0.4, pos: [26.4, 4.4, -30], look: [31.2, 3.4, -22.4], fov: 36 }, { t: 0.78, pos: [29.4, 4.0, -27.4], look: [32.6, 3.3, -23.6], fov: 28 }, { t: 1, pos: [29.5, 4.0, -27.6], look: [32.6, 3.3, -23.6], fov: 27 }] } },
  // 31 the ribbon, the hair clip, even the red scarf were all hers: remembered as glowing ghosts beside her
  { loc: 'cellar', light: 'cellar',
    cast: [C('lena', 'lena', [-7.5, -7.2], 40, { face: 'sad' })],
    props: [{ id: 'lan', type: 'lantern', at: [-4.6, 0.95, -6.6] }, { id: 'gr', type: 'ribbon', color: '#ff4fa3', at: [-6.0, 6.1, -7.9], rot: 40, scale: 1.3, ghost: true }, { id: 'gc', type: 'clip', color: '#ffd000', at: [-5.8, 5.1, -7.8], rot: 40, scale: 1.3, ghost: true }, { id: 'gs', type: 'knit', color: '#d62f2f', at: [-5.7, 3.9, -7.7], rot: 40, scale: 0.75, ghost: true }],
    acts: [{ do: 'appear', acc: 'gr', t: [0.05, 0.2] }, { do: 'appear', acc: 'gc', t: [0.25, 0.4] }, { do: 'appear', acc: 'gs', t: [0.45, 0.6] },
      { do: 'sit', who: 'lena', seat: 3.0, t: [0, 1], hold: true }, { do: 'touchneck', who: 'lena', arm: 'L', t: [0.55, 1], hold: true }, { do: 'lookside', who: 'lena', deg: 35, t: [0.05, 1], hold: true }],
    cam: cam([-2.4, 5.6, -1.6], [-3.0, 5.4, -2.4], [-6.6, 4.8, -7.4], [-6.6, 4.8, -7.4], 44, 42) },
  // 32 Lena cries; Milo kneels in front of her and holds her hands
  { loc: 'cellar', light: 'cellar',
    cast: [C('lena', 'lena', [-7.5, -7.3], 20, { face: 'cry' }), C('milo', 'milo', [-6.6, -4.6], -160, { face: 'sad' })],
    props: [{ id: 'lan', type: 'lantern', at: [-4.2, 0.95, -8.8] }],
    acts: [{ do: 'sit', who: 'lena', seat: 3.0, t: [0, 1], hold: true }, { do: 'cry', who: 'lena', t: [0, 1], hold: true }, { do: 'reach', who: 'lena', both: true, t: [0.3, 1], hold: true },
      { do: 'kneel', who: 'milo', t: [0, 1], hold: true }, { do: 'holdhand', who: 'milo', both: true, t: [0.25, 1], hold: true }],
    cam: cam([-1.6, 5.6, 0.6], [-2.4, 5.4, -0.4], [-7.1, 4.0, -6.4], [-7.1, 4.1, -6.4], 42, 40) },
  // 33 Pip (still in his red cap) bursts in: he followed Milo
  { loc: 'cellar', light: 'cellar',
    cast: [C('pip', 'pip', [7, -15], 0, { acc: PIP_CAP, face: 'surprised' }), C('milo', 'milo', [-5.2, -5.2], -130, { face: 'sad' }), C('lena', 'lena', [-7.6, -7.4], 50, { face: 'sad' })],
    props: [{ id: 'lan', type: 'lantern', at: [-4.2, 0.95, -8.8] }],
    acts: [{ do: 'cellardoor', from: 0, to: -110, t: [0.04, 0.16] }, { do: 'run', who: 'pip', to: [5.5, -7], t: [0.08, 0.45] }, { do: 'bow', who: 'pip', t: [0.48, 1], hold: true }, { do: 'shiver', who: 'pip', t: [0.48, 1], hold: true },
      { do: 'sit', who: 'lena', seat: 3.0, t: [0, 1], hold: true }, { do: 'kneel', who: 'milo', t: [0, 1], hold: true }, { do: 'turn', who: 'milo', to: 80, t: [0.25, 0.5] }, { do: 'turn', who: 'lena', to: 90, t: [0.3, 0.55] },
      { do: 'face', who: 'milo', kind: 'surprised', t: 0.3 }, { do: 'face', who: 'lena', kind: 'surprised', t: 0.35 }],
    cam: cam([-6, 6, 9], [-4.5, 5.5, 7], [3, 3.2, -10], [3.5, 3.0, -8], 46, 44) },
  // 34 Pip says the two words nobody here ever said: thank you
  { loc: 'cellar', light: 'cellar',
    cast: [C('pip', 'pip', [5.2, -7.6], -110, { acc: PIP_CAP, face: 'shy' })],
    props: [{ id: 'lan', type: 'lantern', at: [-4.2, 0.95, -8.8] }],
    acts: [{ do: 'touchhead', who: 'pip', arm: 'R', t: [0.05, 0.55] }, { do: 'bow', who: 'pip', t: [0.55, 1], hold: true }, { do: 'face', who: 'pip', kind: 'happy', t: 0.45 }],
    cam: cam([-1.0, 3.9, -10.2], [-0.4, 3.8, -10.0], [5.2, 3.2, -7.6], [5.2, 3.0, -7.6], 40, 38) },
  // 35 Milo's hair blazes gold, and a brand new red cap appears (Pip still wears his)
  { loc: 'cellar', light: 'cellar',
    cast: [C('milo', 'milo', [-0.6, -7.8], 15, { acc: { head: [['cap', '#e74c3c']] }, face: 'surprised' }), C('pip', 'pip', [1.5, -1.0], 200, { acc: PIP_CAP })],
    props: [{ id: 'lan', type: 'lantern', at: [-4.2, 0.95, -8.8] }],
    acts: [{ do: 'glow', who: 'milo', t: [0.05, 0.35], hold: true }, { do: 'appear', acc: 'milo.head0', t: [0.3, 0.48] }, { do: 'touchhead', who: 'milo', arm: 'L', t: [0.58, 1], hold: true }, { do: 'face', who: 'milo', kind: 'happy', t: 0.6 }],
    cam: cam([2.4, 5.4, 3.8], [2.0, 5.7, 2.6], [-0.5, 5.4, -7.8], [-0.5, 5.6, -7.8], 44, 42) },
  // 36 the real rule: kindness waited for thanks, and nobody knew to thank Lena
  { loc: 'cellar', light: 'cellar',
    cast: [C('milo', 'milo', [-4.4, -3.6], -140, { acc: { head: [['cap', '#e74c3c']] }, face: 'smile' }), C('lena', 'lena', [-7.5, -7.2], 30, { face: 'sad' })],
    props: [{ id: 'lan', type: 'lantern', at: [-4.2, 0.95, -8.8] }],
    acts: [{ do: 'glow', who: 'milo', t: [0, 0.01], hold: true, fade: 0.4 }, { do: 'sit', who: 'lena', seat: 3.0, t: [0, 1], hold: true }, { do: 'lookup', who: 'lena', t: [0.2, 1], hold: true }, { do: 'face', who: 'lena', kind: 'surprised', t: 0.5 }],
    cam: cam([4.2, 6.2, -10.8], [3.0, 5.8, -10.2], [-6.0, 4.6, -5.4], [-6.0, 4.6, -5.4], 44, 42) },
  // 37 flashback: back home people always said thank you, that is why Milo wore so much
  { loc: 'home', light: 'day', flashback: true,
    cast: [C('milo', 'milo', [0, -22], 0, { acc: MILO_FULL, face: 'happy' }), C('h1', 'home', [-4.4, -18.5], 125), C('h2', 'home', [4.4, -18.8], 235), C('h3', 'home', [-2.2, -14.5], 160), C('h4', 'home', [2.8, -14.2], 200)].map((c, i) => i === 0 ? c : { ...c, acc: { head: [[['bowler', 'straw', 'beanie', 'cap'][i - 1], ['#f1c40f', '#e74c3c', '#2ecc71', '#9b59b6'][i - 1]]] }, face: 'happy' }),
    acts: [...['h1', 'h2', 'h3', 'h4'].map((w, i) => ({ do: 'bow', who: w, t: [0.04 + i * 0.05, 0.5 + i * 0.05] })), ...['h1', 'h2', 'h3', 'h4'].map((w, i) => ({ do: 'bow', who: w, t: [0.55 + i * 0.04, 0.98] })),
      ...['back0', 'head0', 'head1', 'head2', 'head3', 'head4', 'neck0', 'neck1', 'neck2', 'face0', 'face1'].map((s, i) => ({ do: 'appear', acc: 'milo.' + s, t: [0.08 + i * 0.07, 0.15 + i * 0.07] }))],
    cam: cam([0, 11.5, -2], [0, 11, -5], [0, 5.0, -22], [0, 5.6, -22], 46, 44) },
  // 38 night: Pip runs down the hill and tells the whole town
  { loc: 'hill', light: 'night',
    cast: [C('pip', 'pip', [-7, -18], 160, { acc: PIP_CAP, face: 'happy' }), ...[[5, 13], [9, 16], [1, 17], [12, 11], [-2, 13]].map(([x, z], i) => C('t' + i, 'towns', [x, z], 200 - i * 8, { acc: i < 4 ? { handR: [['lantern']] } : {}, face: 'surprised' }))],
    acts: [{ do: 'run', who: 'pip', to: [5, 4], t: [0, 1], ease: 'lin' }, { do: 'wave', who: 'pip', arm: 'L', t: [0.1, 1], hold: true }, ...[0, 1, 2, 3].map(i => ({ do: 'arm', who: 't' + i, arm: 'R', x: -0.9, z: 0, t: [0, 1], hold: true }))],
    cam: cam([-14, 14, 2], [-2, 8, 22], [-6, 8, -16], [4, 3, 6], 46, 46, { ease: 'lin' }) },
  // 39 sunrise: the whole town climbed the hill and thanked her
  { loc: 'hill', light: 'sunrise',
    cast: [C('lena', 'lena', [0, -51.5], 0, { acc: { handR: [['lantern']] }, face: 'surprised' }), ...[[2.5, -46], [-2.5, -45], [3.5, -41], [-3.5, -40], [1, -37], [-5.5, -35], [3, -33], [-1.5, -31]].map(([x, z], i) => C('t' + i, 'towns', [x, z], 180 + (x > 0 ? 15 : -15), { acc: i % 2 ? { handR: [['lantern']] } : {} }))],
    acts: [...[0, 1, 2, 3, 4, 5, 6, 7].map(i => ({ do: 'bow', who: 't' + i, t: [0.1 + i * 0.04, 1], hold: true })), { do: 'face', who: 'lena', kind: 'shy', t: 0.6 }],
    cam: cam([5, 22, -29], [4, 21, -32], [0, 15, -47], [0, 15.5, -49], 44, 42) },
  // 40 hats, ribbons and scarves rain down on her, and the town bursts bright (sunrise + confetti); Lena's clothes turn bright
  { loc: 'hill', light: 'sunrise',
    cast: [C('lena', 'lena', [0, -51.5], 0, { face: 'happy' }), ...[[-4.5, -47], [4.5, -46.5], [-2, -44], [2.6, -43.5], [-6, -43], [6, -42.5]].map(([x, z], i) => C('t' + i, 'towns', [x, z], 180 + (x > 0 ? 25 : -25), { face: 'happy' }))],
    acts: [{ do: 'burst', at: [0, 14, -48], t: [0.3, 1], dim: 0.5, n: 80 },
      { do: 'rain', to: 'lena', t: [0.05, 0.6], items: [['beanie', '#e84393', 'head0'], ['ribbon', '#ff4fa3', 'hair0'], ['clip', '#ffd000', 'hair1'], ['cap', '#3498db'], ['straw', '#f4d03f'], ['bowtie', '#9b59b6'], ['scarf', '#e67e22'], ['bucket', '#16a085']] },
      { do: 'colour', who: ['lena'], shirt: '#ffd23f', pants: '#2e86de', t: [0.35, 0.65] }, { do: 'lookup', who: 'lena', t: [0, 0.5] }, { do: 'emptyhands', who: 'lena', t: [0.05, 0.6] }],
    cam: { keys: [{ t: 0, pos: [0.3, 15.0, -45.5], look: [0, 20, -52], fov: 50 }, { t: 0.45, pos: [0.3, 16.8, -42.8], look: [0, 17, -52], fov: 48 }, { t: 1, pos: [5, 32, -22], look: [0, 14, -48], fov: 46 }] } },
  // 41 last of all, a new red scarf wraps around her neck
  { loc: 'hill', light: 'sunrise',
    cast: [C('lena', 'lena', [0, -51.5], 0, { acc: LENA_FINAL, face: 'surprised', shirt: '#ffd23f', pants: '#2e86de' })],
    acts: [{ do: 'fly', acc: 'lena.neck0', from: [2, 22, -49], to: 'lena.neck0', t: [0.02, 0.5], arc: 0.3, spin: 2.5 }, { do: 'touchneck', who: 'lena', both: true, t: [0.5, 1], hold: true }, { do: 'face', who: 'lena', kind: 'happy', t: 0.5 }],
    cam: cam([0.4, 17.4, -45.4], [0.2, 17.2, -46.8], [0, 16.7, -51.5], [0, 16.6, -51.5], 40, 38) },
  // 42 Lena hugs her brother tight: she is finally going home
  { loc: 'hill', light: 'sunrise',
    cast: [C('milo', 'milo', [1.0, -50.6], -60, { acc: { head: [['cap', '#e74c3c']] }, face: 'happy' }), C('lena', 'lena', [-0.4, -49.9], 115, { acc: LENA_FINAL, face: 'happy', shirt: '#ffd23f', pants: '#2e86de' })],
    acts: [{ do: 'hug', who: 'milo', t: [0.05, 1], hold: true }, { do: 'hug', who: 'lena', t: [0.05, 1], hold: true }, { do: 'kneel', who: 'milo', t: [0, 1], hold: true }],
    cam: cam([-1.5, 18.6, -40], [-1, 18, -42.5], [0.3, 16.2, -50.2], [0.3, 16.2, -50.2], 42, 40) },
  // 43 everyone turns to Mayor Tilda, still grey and alone
  { loc: 'hill', light: 'sunrise',
    cast: [...[[-3.5, -45], [3, -45.5], [0, -43], [-5.5, -42], [5, -42.5]].map(([x, z], i) => C('t' + i, 'towns', [x, z], 0, { face: 'happy' })), C('tilda', 'tilda', [1, -30], 180, { bent: true, hideCane: true, face: 'oldsad' })],
    acts: [...[0, 1, 2, 3, 4].map(i => ({ do: 'turn', who: 't' + i, to: 180, t: [0.12 + i * 0.04, 0.4 + i * 0.04] })), { do: 'emptyhands', who: 'tilda', t: [0.35, 1], hold: true, in: 0.5 }],
    cam: { keys: [{ t: 0, pos: [0.5, 20.5, -50.5], look: [1, 13.6, -31], fov: 42 }, { t: 0.45, pos: [0.8, 22, -45], look: [1, 14.5, -31], fov: 40 }, { t: 1, pos: [1.0, 17.6, -39.5], look: [1, 15.4, -30.5], fov: 38 }] } },
  // 44 the whole town says it together: thank you, Mayor Tilda
  { loc: 'hill', light: 'sunrise',
    cast: [...[[-4, -38], [3.5, -38.5], [0, -40], [-6.5, -40.5], [6.5, -40.5], [-2.5, -42.5], [3, -42.5]].map(([x, z], i) => C('t' + i, 'towns', [x, z], (x > 0 ? -12 : 12), { face: 'happy' })), C('tilda', 'tilda', [1, -30], 180, { bent: true, face: 'oldsurprised' })],
    acts: [...[0, 1, 2, 3, 4, 5, 6].map(i => ({ do: 'bow', who: 't' + i, t: [0.12, 1], hold: true }))],
    cam: cam([16, 21, -22], [14, 20, -21], [0, 13, -36], [0.5, 13.2, -35], 46, 46) },
  // 45 her hair glows gold and a shining golden crown appears; she touches it
  { loc: 'hill', light: 'sunrise',
    cast: [C('tilda', 'tilda', [1, -30], 165, { bent: true, acc: { head: [['crown']] }, face: 'oldsurprised' })],
    acts: [{ do: 'glow', who: 'tilda', t: [0.04, 0.32], hold: true }, { do: 'appear', acc: 'tilda.head0', t: [0.26, 0.44] }, { do: 'touchhead', who: 'tilda', arm: 'L', t: [0.55, 1], hold: true }, { do: 'face', who: 'tilda', kind: 'oldhappy', t: 0.75 }],
    cam: cam([0.2, 13.9, -37.5], [0.5, 14.4, -36], [1, 16.3, -30], [1, 16.5, -30], 42, 38) },
  // 46 deep in the dark cellar, one tiny chest stayed locked
  { loc: 'cellar', light: 'cellar',
    props: [{ id: 'chest', type: 'chest', at: [0, 0, -6], rot: 20 }, { id: 'lan', type: 'lantern', at: [-3, 0.95, -7.5] }],
    cam: cam([7, 5, 9], [2.8, 2.8, 0.2], [0, 0.9, -6], [0, 0.8, -6], 40, 38) },
  // 47 a note on it said: for the one who was helped first (no writing visible); the lantern goes out
  { loc: 'cellar', light: 'cellar',
    props: [{ id: 'chest', type: 'chest', at: [0, 0, -6], rot: 20 }, { id: 'note', type: 'note', at: [0.05, 1.58, -5.9], rot: 20 }, { id: 'lan', type: 'lantern', at: [-2.2, 0.95, -7] }],
    acts: [{ do: 'lightsout', t: [0.75, 0.97] }],
    cam: cam([1.4, 4.6, -1.2], [0.9, 4.0, -2.4], [0, 1.3, -5.95], [0, 1.4, -5.95], 38, 34) },
];

// mood palette per beat: warm = kindness/celebration, cool = loneliness/night, tense = anger/slammed doors, golden = thank-you reveal
const MOODS = ['tense', 'warm', 'warm', 'warm', 'warm', 'cool', 'warm', 'warm', 'warm', 'warm', 'tense', 'tense', 'warm', 'warm', 'warm', 'cool', 'cool', null, 'tense',
  'tense', 'warm', 'tense', 'tense', 'tense', 'cool', 'cool', 'cool', 'cool', 'cool', 'cool', 'cool', 'cool', 'cool', 'warm', 'golden', 'golden', 'golden', null,
  'cool', 'golden', 'golden', 'golden', 'warm', 'cool', 'golden', 'golden', 'cool', 'cool'];
if (shots.length !== times.length) throw new Error(`have ${shots.length} shots for ${times.length} lines`);
const out = { id: ID, fps: 30, note: 'One shot per script line (story.html). Times are fractions of dur; dur = narration slot + 0.3 s.', shots: shots.map((s, i) => ({ line: i, dur: +(slot(i) + 0.3).toFixed(2), mood: MOODS[i], ...s })) };
fs.writeFileSync(path.join(OUT, 'shotspec.json'), JSON.stringify(out, null, 1));
console.log(`wrote ${out.shots.length} shots, ${out.shots.reduce((a, s) => a + s.dur, 0).toFixed(1)} s`);
