"""Shared (OpenArt pipeline): narration with the owner's Fish Audio voice "Adam" (paid API, owner-approved),
the owner-chosen lo-fi music bed (Rule G), and the voice + music mix. SR is the mix sample rate."""
from pathlib import Path
import numpy as np
import soundfile as sf

ROOT = Path(__file__).parent.parent
SR = 24000


def _env_file():
    d = {}
    p = ROOT / ".env"
    if p.exists():
        for ln in p.read_text(encoding="utf-8").splitlines():
            if "=" in ln and not ln.lstrip().startswith("#"):
                k, v = ln.split("=", 1)
                d[k.strip()] = v.strip()
    return d


S2_PACE = 1.14   # owner 2026-11-24: s2.1 Adam sounds the same but speaks ~13% slower than s1; this matches s1 pacing


def _fish_line(text, speed, key, ref, volume=0, model="s1"):
    """One line via Fish Audio (paid API, owner-approved 2026-11-19). Returns mono float32 at SR.
    model: .env FISH_MODEL (default s1). s2.x models read [bracket] emotion tags, so a leading (tag) becomes [tag]
    (2026-11-24: owner wants to try the free s2.1-pro-free; s1 retires 2026-12-31)."""
    import json, re, subprocess, urllib.request
    if model.startswith("s2"):
        text = re.sub(r"\(([a-z ]+)\)", r"[\1]", text)
    body = json.dumps(dict(text=text, reference_id=ref, format="mp3", mp3_bitrate=128, latency="normal",
                           prosody=dict(speed=round(speed * (S2_PACE if model.startswith("s2") else 1.0), 3), volume=volume))).encode()
    req = urllib.request.Request("https://api.fish.audio/v1/tts", body, {
        "Authorization": "Bearer " + key, "Content-Type": "application/json", "model": model})
    mp3 = urllib.request.urlopen(req, timeout=120).read()
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", "pipe:0", "-f", "f32le", "-ac", "1", "-ar", str(SR), "pipe:1"],
                         input=mp3, capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


def tts(lines, speed=1.0, gap=0.22, lead=0.7, cache_dir=None):
    """Speak each line with Adam (FISH_API_KEY / FISH_VOICE_ID in .env, never printed).
    Returns (voice array, [{start,end}] per line). `lead` keeps the first word near 0 s (hook rule)."""
    env = _env_file()
    key, ref, model = env["FISH_API_KEY"], env["FISH_VOICE_ID"], env.get("FISH_MODEL", "s1")
    parts, meta, t = [], [], lead
    for line in lines:
        said = line.get("say", line["text"].replace("*", ""))  # * = caption highlight, never spoken
        sp = line.get("speed", speed)
        vol = line.get("volume", 0)  # dB (owner Rule Q3: shock louder, worry softer)
        cf = None
        if cache_dir:  # per-line cache: fixing one line re-renders only that line (same voice + settings)
            import hashlib
            cf = Path(cache_dir) / ("line-" + hashlib.sha256((f"{said}|{sp}|{ref}|{model}" + (f"|v{vol}" if vol else "")).encode()).hexdigest()[:16] + ".npy")
        if cf is not None and cf.exists():
            a = np.load(cf)
        else:
            a = _fish_line(said, sp, key, ref, vol, model)
            if cf is not None:
                cf.parent.mkdir(parents=True, exist_ok=True); np.save(cf, a)
        nz = np.where(np.abs(a) > 0.01)[0]
        a = a[max(nz[0] - 120, 0): nz[-1] + 400].astype(np.float32).copy()  # trim silence
        fi, fo = int(0.02 * SR), int(0.04 * SR)   # 2026-11-24: short fades stop the click/"crash" at the start of a line (owner heard it near 7 s)
        if len(a) > fi + fo:
            a[:fi] *= np.linspace(0.0, 1.0, fi, dtype=np.float32) ** 1.5
            a[-fo:] *= np.linspace(1.0, 0.0, fo, dtype=np.float32)
        meta.append(dict(start=round(t, 3), end=round(t + len(a) / SR, 3)))
        parts.append((t, a))
        t += len(a) / SR + line.get("pause", gap)
    out = np.zeros(int((t + 0.5) * SR), dtype=np.float32)
    for st, a in parts:
        s = int(st * SR)
        out[s:s + len(a)] += a
    return out, meta


def _env(d, a=0.002, dec=8):
    tt = np.arange(int(d * SR)) / SR
    return np.minimum(tt / a, 1) * np.exp(-dec * tt), tt


def thud():
    e, tt = _env(0.35, dec=14)
    return e * np.sin(2*np.pi*(70 + 60*np.exp(-20*tt))*tt)


def _pad(n, bpm, chords, bars_per=2):
    out = np.zeros(n)
    bar = 60 / bpm * 4
    for i in range(int(n / SR / bar) + 2):
        ch = chords[(i // bars_per) % len(chords)]
        s = int(i * bar * SR); L = int(bar * 1.3 * SR)
        t = np.arange(L) / SR
        env = np.minimum(t / 0.4, 1) * np.exp(-t / (bar * 1.1))
        sig = sum(np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t) for f in ch) * env
        e = min(n, s + L)
        if s < n:
            out[s:e] += sig[:e - s]
    return out


def _hat(rng, d=0.05):
    x = rng.uniform(-1, 1, int(d * SR))
    return x * np.exp(-np.arange(len(x)) / SR / 0.012)


def _place(out, sig, t, g=1.0):
    s = int(t * SR)
    if s < len(out):
        e = min(len(out), s + len(sig))
        out[s:e] += g * sig[:e - s]


def lofi(n, bpm=78):
    """Owner-chosen music bed (2026-11-19, Rule G): soft pad chords + gentle kick/hat. Peak 1."""
    rng = np.random.default_rng(1)
    chords = ((220, 261.6, 329.6, 392), (174.6, 220, 261.6, 329.6), (130.8, 164.8, 196, 246.9), (196, 246.9, 293.7, 349.2))
    p = _pad(n, bpm, chords)
    o = np.zeros(n)
    beat = 60 / bpm
    for i in range(int(n / SR / beat)):
        if i % 4 in (0, 2):
            _place(o, thud(), i * beat, .7)
        if i % 4 in (1, 3):
            _place(o, _hat(rng, .09), i * beat, .35)
        _place(o, _hat(rng, .03), i * beat + beat / 2, .2)
    nm = lambda x: x / (np.max(np.abs(x)) or 1)
    return nm(nm(p) * 0.8 + nm(o) * 0.5)


def write(path, a):
    sf.write(str(path), a, SR)


def mix(voice, music_gain=0.16, duck=0.35, bed_name="musicbox"):
    """Voice + music bed ducked under the voice, faded out at the end. Peak 0.95.
    bed_name: "musicbox" (owner's choice 2026-11-21, default), "guitar" or "lofi" (pipeline/music.py, all original)."""
    n = len(voice)
    out = voice.astype(np.float64).copy()
    env = np.convolve(np.abs(voice), np.ones(int(0.12*SR))/int(0.12*SR), "same")
    env = np.clip(env / ((np.percentile(env, 95) or 1) * 0.25), 0, 1)
    # 2026-11-24: hold the duck through short gaps between lines (<0.5 s) and release slowly, so the music does not "pump" up and down between sentences
    ds = max(1, SR // 100); e100 = env[::ds]; hold = 50
    pad_ = np.pad(e100, (hold, 0), mode='edge'); mx = np.array([pad_[i:i + hold + 1].max() for i in range(len(e100))])
    k = np.ones(15) / 15; sm = np.convolve(np.pad(mx, (7, 7), mode='edge'), k, 'valid')[:len(mx)]
    env = np.clip(np.interp(np.arange(len(env)), np.arange(len(sm)) * ds, sm), 0, 1)   # any speech (even a soft line, Rule Q) ducks the music fully, so loud/soft differences survive the mix
    if bed_name == "lofi":
        raw = lofi(n)
    else:
        from pipeline import music
        raw = getattr(music, bed_name)(n / SR + 0.1)[:n]
        try:
            raw = music.polish(raw)[:n]   # reverb + EQ + compression (pedalboard)
        except Exception as e:  # pedalboard missing: keep the dry bed
            print('polish skipped:', e)
        raw = np.pad(raw, (0, max(0, n - len(raw))))
    bed = raw * music_gain * np.max(np.abs(voice)) * (1 - (1 - duck) * env)
    out += bed * np.clip((n / SR - np.arange(n) / SR) / 0.8, 0, 1)
    return out / max(1, np.max(np.abs(out)) / 0.95)
