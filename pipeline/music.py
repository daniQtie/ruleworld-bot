"""Original, code-generated music beds (no samples, no downloads, no copyright risk).

  python -m pipeline.music sample   -> output/music-samples/{musicbox,guitar}.mp3 (30 s each, for the owner to choose)

Mood reference (owner, 2026-11-21): the competitor's top Shorts use a gentle melancholic music-box/guitar feel.
These are ORIGINAL compositions in that mood. They never copy another song's melody or chords.
"""
import subprocess
import sys
from pathlib import Path

import numpy as np

from pipeline.audio import SR, write

ROOT = Path(__file__).resolve().parent.parent
A4 = 440.0
hz = lambda m: A4 * 2 ** ((m - 69) / 12)


def _bell(f, dur, amp=0.25):
    """Music-box / glockenspiel tone: FM bell with a fast attack and a long decay."""
    t = np.arange(int(dur * SR)) / SR
    env = np.minimum(t / 0.003, 1) * np.exp(-t * 3.2)
    mod = np.sin(2 * np.pi * f * 3.5 * t) * 1.6 * np.exp(-t * 6)
    return amp * env * (np.sin(2 * np.pi * f * t + mod) + 0.25 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 5))


def _pluck(f, dur, amp=0.3, bright=0.5):
    """Soft clean-guitar pluck (Karplus-Strong)."""
    n, p = int(dur * SR), max(2, int(SR / f))
    rng = np.random.default_rng(int(f * 10))
    buf = rng.uniform(-1, 1, p) * amp
    out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % p]
        j = (i + 1) % p
        buf[i % p] = (buf[i % p] * (1 - bright * 0.5) + buf[j] * (0.5 + bright * 0.5) * 0.5) * 0.996
    return out


def _pad(n, chords, beat, bars_per=1, beats_per_bar=3, amp=0.05):
    out = np.zeros(n)
    bar = beat * beats_per_bar * bars_per
    for k in range(int(n / SR / bar) + 1):
        s = int(k * bar * SR)
        if s >= n:
            break
        L = min(n - s, int(bar * 1.15 * SR))
        t = np.arange(L) / SR
        env = np.minimum(t / 0.6, 1) * np.minimum((bar * 1.15 - t) / 0.4, 1)
        sig = sum(np.sin(2 * np.pi * hz(m) * t) + 0.3 * np.sin(2 * np.pi * hz(m + 12) * t) for m in chords[k % len(chords)])
        out[s:s + L] += amp * env * sig
    return out


def _place(out, sig, t0):
    s = int(t0 * SR)
    if s < len(out):
        e = min(len(out), s + len(sig))
        out[s:e] += sig[:e - s]


# Original progression: I - vi - IV - V - I - iii - IV - V (in D, 3/4)
CHORDS = [[50, 57, 62, 66], [47, 54, 59, 62], [43, 50, 55, 59], [45, 52, 57, 61], [50, 57, 62, 66], [42, 49, 54, 57], [43, 50, 55, 59], [45, 52, 57, 61]]
# Original melody for music box (MIDI note, beats); one entry per bar (3 beats)
MELODY = [[(74, 1), (76, 1), (78, 1)], [(78, 2), (74, 1)], [(71, 1), (74, 1), (79, 1)], [(76, 3)],
          [(74, 1), (78, 1), (81, 1)], [(78, 2), (76, 1)], [(74, 1), (71, 1), (74, 1)], [(73, 3)]]


def musicbox(seconds, bpm=74):
    """Waltz-time music-box lullaby over a warm pad (original melody)."""
    n, beat = int(seconds * SR), 60 / bpm
    out = _pad(n, CHORDS, beat)
    t, bar = 0.0, 0
    while t < seconds:
        for note, b in MELODY[bar % len(MELODY)]:
            _place(out, _bell(hz(note), 2.5), t)
            if bar % 2 == 1 and b >= 2:
                _place(out, _bell(hz(note - 12), 2.0, 0.12), t)
            t += b * beat
        root = CHORDS[bar % len(CHORDS)][0] + 12
        _place(out, _bell(hz(root), 2.0, 0.08), t - 3 * beat)
        bar += 1
    return out / max(1e-6, np.abs(out).max()) * 0.6


def guitar(seconds, bpm=76):
    """Gentle clean-guitar arpeggios (original pattern) over a soft pad."""
    n, beat = int(seconds * SR), 60 / bpm
    out = _pad(n, CHORDS, beat, amp=0.035)
    t, bar = 0.0, 0
    pattern = [0, 2, 3, 1, 3, 2]   # chord-tone order in eighth notes (3/4 bar)
    while t < seconds:
        ch = CHORDS[bar % len(CHORDS)]
        for k, idx in enumerate(pattern):
            _place(out, _pluck(hz(ch[idx] + 12), 1.6, 0.35 if k == 0 else 0.25), t + k * beat / 2)
        bar += 1
        t += 3 * beat
    return out / max(1e-6, np.abs(out).max()) * 0.6


# ---------------- 2026-11-22 set (owner asked for new beds); all original ----------------
def _piano(f, dur, amp=0.22):
    """Soft felt-piano tone: a few decaying harmonics, slightly detuned, gentle attack."""
    t = np.arange(int(dur * SR)) / SR
    env = np.minimum(t / 0.008, 1) * np.exp(-t * 1.6)
    sig = sum((0.6 ** k) * np.sin(2 * np.pi * f * (k + 1) * (1 + 0.0007 * k) * t) * np.exp(-t * (0.8 + k * 0.9)) for k in range(5))
    return amp * env * sig


# Original 4/4 progression in C: Fmaj7 - Em7 - Dm7 - Cmaj7 (a common, uncopyrightable cadence) with our own melody
CH4 = [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]]
MEL4 = [[(72, 1.5), (74, 0.5), (76, 2)], [(74, 1), (71, 1), (67, 2)], [(69, 1.5), (72, 0.5), (74, 1), (72, 1)], [(67, 4)]]


def piano(seconds, bpm=68):
    """'Tender piano': slow lo-fi felt piano, soft chords + a sparse melody (romance, kindness, quiet-kid stories)."""
    n, beat = int(seconds * SR), 60 / bpm
    out = _pad(n, CH4, beat, beats_per_bar=4, amp=0.018)
    t, bar = 0.0, 0
    while t < seconds:
        ch = CH4[bar % 4]
        for k, m in enumerate(ch):
            _place(out, _piano(hz(m), 3.5, 0.10), t + k * 0.03)          # rolled chord
        _place(out, _piano(hz(ch[0] - 12), 3.5, 0.12), t)
        tt = t
        for note, b in MEL4[bar % 4]:
            _place(out, _piano(hz(note), 2.5, 0.2), tt)
            tt += b * beat
        bar += 1
        t += 4 * beat
    return out / max(1e-6, np.abs(out).max()) * 0.6


def dreamy(seconds, bpm=84):
    """'Dreamy sparkle': airy pad + a twinkling celesta arpeggio (wonder, magic numbers, reveals)."""
    n, beat = int(seconds * SR), 60 / bpm
    ch = [[57, 60, 64, 69], [53, 57, 60, 65], [48, 52, 55, 60], [55, 59, 62, 67]]   # Am - F - C - G
    out = _pad(n, ch, beat, beats_per_bar=4, amp=0.05)
    t, bar = 0.0, 0
    order = [0, 1, 2, 3, 2, 1, 3, 2]
    while t < seconds:
        c = ch[bar % 4]
        for k, i in enumerate(order):
            _place(out, _bell(hz(c[i] + 12), 1.6, 0.12 if k else 0.17), t + k * beat / 2)
        bar += 1
        t += 4 * beat
    return out / max(1e-6, np.abs(out).max()) * 0.6


def ukulele(seconds, bpm=100):
    """'Happy pluck': bright plucked strums + a light shaker (feel-good, funny, wholesome endings)."""
    n, beat = int(seconds * SR), 60 / bpm
    ch = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]]   # C - G - Am - F
    out = np.zeros(n)
    rng = np.random.default_rng(7)
    t, bar = 0.0, 0
    strum = [0, 1, 1.5, 2.5, 3]   # beat positions in the bar
    while t < seconds:
        c = ch[bar % 4]
        for k, p in enumerate(strum):
            for j, m in enumerate(c if k % 2 == 0 else c[::-1]):
                _place(out, _pluck(hz(m + 12), 0.7, 0.22 if k == 0 else 0.15, 0.8), t + p * beat + j * 0.012)
        for e in range(8):   # shaker on eighths
            L = int(0.05 * SR); s = rng.uniform(-1, 1, L) * np.exp(-np.arange(L) / (0.012 * SR)) * (0.05 if e % 2 else 0.03)
            _place(out, s, t + e * beat / 2)
        bar += 1
        t += 4 * beat
    return out / max(1e-6, np.abs(out).max()) * 0.6


def tension(seconds, bpm=60):
    """'Creepy tension': low drone + ticking clock + sparse low piano hits (monster / deer / horror rules)."""
    n, beat = int(seconds * SR), 60 / bpm
    t = np.arange(n) / SR
    out = 0.05 * (np.sin(2 * np.pi * hz(38) * t) + 0.6 * np.sin(2 * np.pi * hz(45) * t * (1 + 0.002 * np.sin(t * 0.3))))
    k = 0
    while k * beat < seconds:
        L = int(0.03 * SR); tick = np.sin(2 * np.pi * (2400 if k % 2 else 1900) * np.arange(L) / SR) * np.exp(-np.arange(L) / (0.004 * SR)) * 0.12
        _place(out, tick, k * beat)
        if k % 8 == 0:
            for m in ([45, 48, 52] if (k // 8) % 2 == 0 else [44, 47, 51]):
                _place(out, _piano(hz(m - 12), 4.0, 0.12), k * beat)
        if k % 16 == 12:
            _place(out, _bell(hz(88), 2.5, 0.06), k * beat)
        k += 1
    return out / max(1e-6, np.abs(out).max()) * 0.6


def hush(seconds, bpm=78):
    """'Hush' (2026-11-24): the closest original match to the mood the competitor Shorts use (slow clean-guitar arpeggios in 4/4 with a
    glockenspiel line on top and a warm pad). Original chords and melody; it does not copy any song."""
    n, beat = int(seconds * SR), 60 / bpm
    ch = [[52, 59, 64, 67], [48, 55, 60, 64], [45, 52, 57, 60], [43, 50, 55, 59]]     # Em - C - Am - G (spread voicings, original line)
    mel = [[(79, 1), (76, 1), (74, 2)], [(76, 2), (72, 1), (74, 1)], [(72, 1), (76, 1), (79, 2)], [(74, 3), (71, 1)]]
    out = _pad(n, ch, beat, beats_per_bar=4, amp=0.03)
    pattern = [0, 1, 2, 3, 2, 1, 2, 1]   # eighth-note arpeggio over the 4 chord tones
    t, bar = 0.0, 0
    while t < seconds:
        c = ch[bar % 4]
        for k, idx in enumerate(pattern):
            _place(out, _pluck(hz(c[idx]), 1.4, 0.30 if k == 0 else 0.20, 0.7), t + k * beat / 2)
        tt = t
        for note, b in mel[bar % 4]:
            _place(out, _bell(hz(note), 2.2, 0.10), tt + 0.01)
            tt += b * beat
        bar += 1
        t += 4 * beat
    return out / max(1e-6, np.abs(out).max()) * 0.6


def harp(seconds, bpm=64):
    """'Harp': slow rising harp-like arpeggios with long ringing tails (wistful, storybook)."""
    n, beat = int(seconds * SR), 60 / bpm
    ch = [[57, 64, 69, 72, 76], [53, 60, 65, 69, 72], [48, 55, 60, 64, 67], [55, 62, 67, 71, 74]]   # Am - F - C - G (open voicings)
    out = np.zeros(n)
    t, bar = 0.0, 0
    while t < seconds:
        c = ch[bar % 4]
        for k, m in enumerate(c + c[::-1][1:4]):
            _place(out, _bell(hz(m), 3.2, 0.12 if k else 0.16), t + k * beat / 2)
        bar += 1
        t += 4 * beat
    return out / max(1e-6, np.abs(out).max()) * 0.6


def strings(seconds, bpm=60):
    """'Strings': slow cinematic string pad that swells every bar, with a low pulse (sad, heavy, emotional twist)."""
    n = int(seconds * SR); beat = 60 / bpm
    ch = [[45, 52, 57, 60, 64], [41, 48, 53, 57, 60], [48, 55, 60, 64, 67], [43, 50, 55, 59, 62]]
    out = np.zeros(n)
    bar = beat * 4
    for k in range(int(seconds / bar) + 2):
        s = int(k * bar * SR)
        if s >= n:
            break
        L = min(n - s, int(bar * 1.3 * SR)); t = np.arange(L) / SR
        env = np.minimum(t / (bar * 0.55), 1) ** 1.5 * np.minimum((bar * 1.3 - t) / (bar * 0.5), 1)
        sig = np.zeros(L)
        for m in ch[k % 4]:
            f = hz(m)
            for det in (0.997, 1.0, 1.003):
                sig += (2 * ((f * det * t) % 1) - 1) * 0.5 + np.sin(2 * np.pi * f * det * t)
        out[s:s + L] += 0.012 * env * sig
        _place(out, _piano(hz(ch[k % 4][0] - 12), 3.6, 0.14), k * bar)
    return out / max(1e-6, np.abs(out).max()) * 0.6


def luck(seconds, bpm=61):
    """'Luck' (2026-11-24): original bed built from measurements of the reference Short (about 61 bpm, F minor / Db area, mid-range
    instruments under the voice): slow piano arpeggios over a low warm pad with a faint bell on top. Original chords and notes."""
    n, beat = int(seconds * SR), 60 / bpm
    ch = [[41, 56, 60, 65], [37, 53, 56, 61], [44, 56, 60, 63], [39, 55, 58, 63]]   # Fm - Db - Ab - Eb voicings (i, VI, III, VII)
    out = _pad(n, ch, beat, beats_per_bar=4, amp=0.04)
    t, bar = 0.0, 0
    pat = [0, 1, 2, 3, 2, 1, 3, 2]
    while t < seconds:
        c = ch[bar % 4]
        for k, i in enumerate(pat):
            _place(out, _piano(hz(c[i] + (12 if i else 0)), 2.6, 0.16 if k == 0 else 0.11), t + k * beat / 2)
        if bar % 2 == 1:
            _place(out, _bell(hz(c[3] + 24), 2.8, 0.07), t + 2 * beat)
        bar += 1
        t += 4 * beat
    return out / max(1e-6, np.abs(out).max()) * 0.6


def bounce(seconds, bpm=102):
    """'Bounce' (measured ~102 bpm, A major area): light plucked strums, a bell line and a soft shaker; upbeat story-time feel."""
    n, beat = int(seconds * SR), 60 / bpm
    ch = [[57, 61, 64, 69], [54, 57, 61, 66], [50, 54, 57, 62], [52, 56, 59, 64]]   # A - F#m - D - E
    out = _pad(n, ch, beat, beats_per_bar=4, amp=0.02)
    rng = np.random.default_rng(3)
    t, bar = 0.0, 0
    while t < seconds:
        c = ch[bar % 4]
        for k, p in enumerate([0, 1.5, 2, 3.5]):
            for j, m in enumerate(c):
                _place(out, _pluck(hz(m + 12), 0.8, 0.2 if k == 0 else 0.13, 0.8), t + p * beat + j * 0.014)
        for e in range(8):
            L = int(0.04 * SR); _place(out, rng.uniform(-1, 1, L) * np.exp(-np.arange(L) / (0.01 * SR)) * (0.035 if e % 2 else 0.02), t + e * beat / 2)
        _place(out, _bell(hz(c[3] + 12), 1.8, 0.1), t + 2 * beat)
        bar += 1
        t += 4 * beat
    return out / max(1e-6, np.abs(out).max()) * 0.6


def drift(seconds, bpm=96):
    """'Drift' (measured ~96 bpm, C# minor area): dark warm pad, a steady soft piano pulse and a low bass note; mystery, tension."""
    n, beat = int(seconds * SR), 60 / bpm
    ch = [[49, 56, 61, 64], [45, 52, 57, 61], [52, 59, 64, 68], [47, 54, 59, 63]]   # C#m - A - E - B
    out = _pad(n, ch, beat, beats_per_bar=4, amp=0.05)
    t, bar = 0.0, 0
    while t < seconds:
        c = ch[bar % 4]
        _place(out, _piano(hz(c[0] - 12), 3.4, 0.16), t)
        for k in range(8):
            _place(out, _piano(hz(c[1 + (k % 3)] + 12), 1.2, 0.07 if k % 2 else 0.1), t + k * beat / 2)
        bar += 1
        t += 4 * beat
    return out / max(1e-6, np.abs(out).max()) * 0.6


def tender(seconds, bpm=68):
    """'Tender' (measured ~68 bpm, F major / minor area): slow piano arpeggios with a glockenspiel accent; wistful, close to the top Shorts' mood."""
    n, beat = int(seconds * SR), 60 / bpm
    ch = [[53, 60, 65, 69], [57, 64, 69, 72], [58, 65, 70, 74], [48, 55, 60, 64]]   # F - Am - Bb - C
    out = _pad(n, ch, beat, beats_per_bar=4, amp=0.025)
    t, bar = 0.0, 0
    while t < seconds:
        c = ch[bar % 4]
        for k, i in enumerate([0, 1, 2, 3, 2, 1, 2, 1]):
            _place(out, _piano(hz(c[i]), 2.2, 0.15 if k == 0 else 0.1), t + k * beat / 2)
        _place(out, _bell(hz(c[3] + 12), 2.4, 0.08), t + 3 * beat)
        bar += 1
        t += 4 * beat
    return out / max(1e-6, np.abs(out).max()) * 0.6



def polish(sig):
    """2026-11-24 (pedalboard): room reverb, a touch of chorus, EQ and gentle compression so the synthesized beds sound like real instruments in a room."""
    from pedalboard import Pedalboard, HighpassFilter, LowpassFilter, Reverb, Chorus, Compressor, Limiter
    board = Pedalboard([HighpassFilter(70), Chorus(rate_hz=0.35, depth=0.12, mix=0.12), Reverb(room_size=0.6, damping=0.55, wet_level=0.30, dry_level=0.78, width=1.0),
                        LowpassFilter(9500), Compressor(threshold_db=-20, ratio=2.0, attack_ms=20, release_ms=250), Limiter(threshold_db=-1.0)])
    x = np.asarray(sig, dtype=np.float32).reshape(1, -1)
    return board(x, SR)[0]


def glass(seconds, bpm=58):
    """'Glass': airy glass-like pad with sparse high bells and long reverb tails (dreamy, cold, wonder)."""
    n, beat = int(seconds * SR), 60 / bpm
    ch = [[57, 64, 69, 76], [53, 60, 65, 72], [55, 62, 67, 74], [52, 59, 64, 71]]
    out = _pad(n, ch, beat, beats_per_bar=4, amp=0.045)
    t, bar = 0.0, 0
    while t < seconds:
        c = ch[bar % 4]
        for k, i in enumerate([3, 2, 3, 1]):
            _place(out, _bell(hz(c[i] + 12), 3.4, 0.10), t + (k * 1.5 + 0.2) * beat)
        bar += 1
        t += 4 * beat
    return out / max(1e-6, np.abs(out).max()) * 0.6


def sample(names=None):
    d = ROOT / "output" / "music-samples"
    d.mkdir(parents=True, exist_ok=True)
    allb = {"musicbox": musicbox, "guitar": guitar, "piano": piano, "dreamy": dreamy, "ukulele": ukulele, "tension": tension}
    for name, fn in ((k, allb[k]) for k in (names or allb)):
        wav = d / f"{name}.wav"
        write(wav, fn(30.0).astype(np.float32))
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), "-af", "loudnorm=I=-16", "-b:a", "160k", str(wav.with_suffix(".mp3"))], check=True)
        wav.unlink()
        print("wrote", wav.with_suffix(".mp3"))


if __name__ == "__main__":
    if sys.argv[1:2] == ["sample"]:
        sample(sys.argv[2:] or None)
    else:
        sys.exit(__doc__)
