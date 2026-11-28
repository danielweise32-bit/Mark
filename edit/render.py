"""Edit vertical (1080x1920) in stilul "polaroid + ploaie + text mare", FARA muzica,
cu actiuni sincronizate pe beat (zoom, shake, flash, glitch, text pe beat, personaje animate).

Rulare:  python3 render.py            -> edit_murder_on_my_mind.mp4

Sincronizare cu melodia:
  BPM    = tempo-ul piesei (default 115). Daca beat-urile nu cad bine, ajusteaza-l.
  OFFSET = la cate secunde din video cade primul beat. Pune melodia sa inceapa
           exact cu un beat (kick) la secunda OFFSET si totul va fi pe ritm.
"""
import math
import os
import random
import subprocess

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
W, H, FPS = 1080, 1920, 30
OUT = os.path.join(HERE, "edit_murder_on_my_mind.mp4")
F_TITLE = os.path.join(HERE, "fonts", "Anton-Regular.ttf")
F_SCRIPT = os.path.join(HERE, "fonts", "DancingScript.ttf")

BPM = 115.0
OFFSET = 0.0
BEAT = 60.0 / BPM

# (linia mica, linia mare, poza, actiune, nr. de masuri a cate 4 beat-uri)
SCENES = [
    ("WE WERE", "BEST FRIENDS", "sunset", "bounce", 2),
    ("NEVER THOUGHT", "YOU'D LEAVE", "sunset", "walk_away", 2),
    ("NOW YOU'RE", "A MEMORY", "dusk", "fade", 2),
    ("I NEVER GOT", "TO SAY GOODBYE", "night", "glitch_ghost", 2),
    ("STILL ON", "MY MIND", "night", "alone", 2),
]
CAPTION = "best friends"

random.seed(7)
np.random.seed(7)


# ---------------------------------------------------------------- helpers
def lerp(a, b, t):
    return a + (b - a) * t


def ease_out_back(t):
    c1, c3 = 1.70158, 2.70158
    return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2


def clamp(x, lo=0.0, hi=1.0):
    return max(lo, min(hi, x))


def vgrad(w, h, top, bottom):
    t = np.linspace(0, 1, h)[:, None, None]
    arr = np.array(top)[None, None, :] * (1 - t) + np.array(bottom)[None, None, :] * t
    return Image.fromarray(np.repeat(arr, w, axis=1).astype(np.uint8), "RGB")


def glow(size, radius, color, alpha):
    img = Image.new("RGBA", size, (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    cx, cy = size[0] // 2, size[1] // 2
    d.ellipse((cx - radius, cy - radius, cx + radius, cy + radius), fill=color + (alpha,))
    return img.filter(ImageFilter.GaussianBlur(radius * 0.6))


def beat_info(t):
    """Returneaza (indice beat, puls beat 1->0, puls masura 1->0)."""
    b = (t - OFFSET) / BEAT
    if b < 0:
        return -1, 0.0, 0.0
    bi = int(b)
    ph = b - bi
    pulse = math.exp(-ph * 5.5)
    bar = pulse if bi % 4 == 0 else 0.0
    return bi, pulse, bar


# ------------------------------------------------------------- background
def make_background():
    bg = vgrad(W, H, (6, 10, 24), (10, 16, 34)).convert("RGBA")
    lights = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(lights)
    for _ in range(26):
        side = random.choice([0, 1])
        x = random.randint(-80, 160) if side == 0 else random.randint(W - 160, W + 80)
        y = random.randint(300, 1700)
        r = random.randint(30, 110)
        col = random.choice([(150, 40, 30), (40, 70, 160), (30, 50, 110), (120, 60, 30)])
        d.rounded_rectangle((x - r // 2, y - r, x + r // 2, y + r), r // 3, fill=col + (random.randint(50, 110),))
    bg.alpha_composite(lights.filter(ImageFilter.GaussianBlur(45)))
    return bg


def make_vignette():
    yy, xx = np.mgrid[0:H, 0:W]
    dist = np.sqrt(((xx - W / 2) / (W * 0.62)) ** 2 + ((yy - H / 2) / (H * 0.6)) ** 2)
    return np.clip(dist - 0.45, 0, 1).astype(np.float32)


# ---------------------------------------------------------------- polaroid
PHOTO = 600


def silhouette(d, cx, base_y, head_r, alpha=255, cap=False, smile=True, nod=0.0, tilt=0.0):
    black = (8, 8, 10, alpha)
    d.ellipse((cx - head_r * 2.1, base_y - head_r * 1.5, cx + head_r * 2.1, base_y + head_r * 2.2), fill=black)
    hx = cx + tilt * head_r
    hy = base_y - head_r * 2.35 + nod * head_r
    d.ellipse((hx - head_r, hy - head_r * 1.15, hx + head_r, hy + head_r * 1.15), fill=black)
    if cap:
        d.chord((hx - head_r * 1.02, hy - head_r * 1.22, hx + head_r * 1.02, hy + head_r * 0.3), 180, 360,
                fill=(30, 26, 24, alpha))
    if smile:
        sw = head_r * 0.55
        d.arc((hx - sw, hy + head_r * 0.05, hx + sw, hy + head_r * 0.6), 20, 160,
              fill=(245, 240, 225, alpha), width=max(4, int(head_r * 0.12)))


def make_sky(kind):
    s = PHOTO
    if kind == "sunset":
        top, bot = (244, 178, 82), (238, 128, 52)
    elif kind == "dusk":
        top, bot = (196, 110, 86), (92, 52, 82)
    else:
        top, bot = (18, 28, 62), (44, 54, 100)
    img = vgrad(s, s, top, bot).convert("RGBA")
    d = ImageDraw.Draw(img)
    if kind == "night":
        for _ in range(45):
            x, y = random.randint(0, s), random.randint(0, int(s * 0.6))
            r = random.choice([1, 1, 2])
            d.ellipse((x - r, y - r, x + r, y + r), fill=(230, 235, 255, random.randint(120, 230)))
        d.ellipse((s * 0.72 - 55, s * 0.25 - 55, s * 0.72 + 55, s * 0.25 + 55), fill=(232, 236, 248, 255))
        d.ellipse((s * 0.72 - 30, s * 0.25 - 70, s * 0.72 + 80, s * 0.25 + 40), fill=top + (255,))
    else:
        sun_c = (255, 232, 120) if kind == "sunset" else (250, 170, 110)
        img.alpha_composite(glow((s, s), 150, sun_c, 200), (int(s * 0.7) - s // 2, int(s * 0.32) - s // 2))
        d = ImageDraw.Draw(img)
        d.ellipse((s * 0.7 - 115, s * 0.32 - 115, s * 0.7 + 115, s * 0.32 + 115), fill=sun_c + (235,))
    return img


def draw_people(action, p, bi, pulse, bar):
    """Personajele din poza, animate pe beat. p = progresul scenei 0..1."""
    s = PHOTO
    layer = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    base = s * 0.93
    hop = pulse * 22  # sar pe beat
    L, R = s * 0.33, s * 0.65
    if action == "bounce":
        # sar pe rand (stanga pe beat-uri pare, dreapta pe impare), pe masura se apropie
        lean = bar * 18
        silhouette(d, L + lean, base - (hop if bi % 2 == 0 else 0), 52, tilt=0.15 * pulse)
        silhouette(d, R - lean, base - 8 - (hop if bi % 2 == 1 else 0), 58, cap=True, tilt=-0.15 * pulse)
    elif action == "walk_away":
        # cel din stanga pleaca pas cu pas, pe fiecare beat
        steps = p * 8
        x = L - (int(steps) + clamp((steps % 1) * 3)) * 42
        silhouette(d, x, base - hop * 0.6, 52, smile=p < 0.35)
        silhouette(d, R, base - 8, 58, cap=True, smile=p < 0.5, nod=0.25 * p, tilt=-0.35 * p)
    elif action == "fade":
        # prietenul "palpaie" pe beat si dispare
        a = int(255 * (1 - p) * (0.35 + 0.65 * (1 - pulse)) if bi % 2 else 255 * (1 - p) * 0.5)
        ghost = Image.new("RGBA", (s, s), (0, 0, 0, 0))
        silhouette(ImageDraw.Draw(ghost), L, base, 52, smile=False)
        ghost.putalpha(ghost.getchannel("A").point(lambda v: v * a // 255))
        layer.alpha_composite(ghost)
        silhouette(d, R, base - 8, 58, cap=True, smile=False, nod=0.15 + 0.15 * pulse)
    elif action == "glitch_ghost":
        ghost = Image.new("RGBA", (s, s), (0, 0, 0, 0))
        jit = random.uniform(-30, 30) * pulse
        silhouette(ImageDraw.Draw(ghost), L + jit, base, 52, smile=False)
        g = np.array(ghost)
        if pulse > 0.4:  # felii glitch pe beat
            for _ in range(5):
                y0 = random.randint(int(s * 0.5), s - 30)
                hh = random.randint(6, 26)
                g[y0:y0 + hh] = np.roll(g[y0:y0 + hh], random.randint(-40, 40), axis=1)
        g[..., 3] = (g[..., 3] * (0.35 + 0.4 * pulse)).astype(np.uint8)
        g[..., 0] = np.maximum(g[..., 0], 60)
        g[..., 2] = np.maximum(g[..., 2], 140)
        layer.alpha_composite(Image.fromarray(g, "RGBA"))
        silhouette(d, R, base - 8, 58, cap=True, smile=False, nod=0.3, tilt=-0.3)
    else:  # alone: ramane singur in centru, da din cap pe beat
        silhouette(d, s * 0.5, base - 8 - hop * 0.3, 58, cap=True, smile=False, nod=0.25 + 0.2 * pulse)
    return layer


def make_frame_card():
    pw, ph = PHOTO + 80, PHOTO + 230
    card = Image.new("RGBA", (pw + 80, ph + 80), (0, 0, 0, 0))
    sh = Image.new("RGBA", card.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).rectangle((40, 52, 40 + pw, 52 + ph), fill=(0, 0, 0, 170))
    card.alpha_composite(sh.filter(ImageFilter.GaussianBlur(18)))
    frame = vgrad(pw, ph, (240, 240, 236), (222, 222, 218)).convert("RGBA")
    fd = ImageDraw.Draw(frame)
    font = ImageFont.truetype(F_SCRIPT, 62)
    try:
        font.set_variation_by_axes([700])
    except Exception:
        pass
    tw = fd.textlength(CAPTION, font=font)
    fd.text(((pw - tw) / 2, 40 + PHOTO + 50), CAPTION, font=font, fill=(25, 25, 30, 255))
    card.alpha_composite(frame, (40, 40))
    return card


# -------------------------------------------------------------------- text
def text_img(txt, size, color=(255, 255, 255)):
    font = ImageFont.truetype(F_TITLE, size)
    l, t, r, b = font.getbbox(txt)
    pad = 30
    img = Image.new("RGBA", (r - l + pad * 2, b - t + pad * 2), (0, 0, 0, 0))
    shadow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(shadow).text((pad - l + 4, pad - t + 6), txt, font=font, fill=(0, 0, 0, 210))
    img.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(8)))
    ImageDraw.Draw(img).text((pad - l, pad - t), txt, font=font, fill=color + (255,))
    return img


def fit_size(txt, want, max_w):
    size = want
    while size > 40:
        l, _, r, _ = ImageFont.truetype(F_TITLE, size).getbbox(txt)
        if r - l <= max_w:
            return size
        size -= 4
    return size


def place(frame, img, cx, cy, scale, alpha, rot=0.0):
    if alpha <= 0.01 or scale <= 0.01:
        return
    w, h = max(1, int(img.width * scale)), max(1, int(img.height * scale))
    im = img.resize((w, h), Image.BILINEAR)
    if abs(rot) > 0.05:
        im = im.rotate(rot, resample=Image.BICUBIC, expand=True)
        w, h = im.size
    if alpha < 1:
        im.putalpha(im.getchannel("A").point(lambda p: int(p * alpha)))
    frame.alpha_composite(im, (int(cx - w / 2), int(cy - h / 2)))


def build_words(line, size, max_w):
    """Imparte linia in cuvinte (apar unul cate unul pe beat) cu pozitiile lor."""
    words = line.split()
    imgs = [text_img(w, size) for w in words]
    space = size * 0.22
    total = sum(i.width - 60 for i in imgs) + space * (len(imgs) - 1)
    x = -total / 2
    out = []
    for im in imgs:
        ww = im.width - 60
        out.append((im, x + ww / 2))
        x += ww + space
    return out


# -------------------------------------------------------------------- rain
class Rain:
    def __init__(self, n=170):
        self.drops = [self._new(random.uniform(0, H)) for _ in range(n)]

    def _new(self, y=None):
        z = random.uniform(0.3, 1.0)
        return [random.uniform(-100, W + 200), -60 if y is None else y, z]

    def step_draw(self, frame, speed=1.0):
        layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        d = ImageDraw.Draw(layer)
        for dr in self.drops:
            x, y, z = dr
            ln = (40 + 70 * z) * (0.7 + 0.3 * speed)
            d.line((x, y, x - ln * 0.12, y + ln), fill=(200, 210, 235, int(40 + 90 * z)), width=1 if z < 0.7 else 2)
            v = (38 * z + 14) * speed
            dr[1] += v
            dr[0] -= v * 0.12
            if dr[1] > H + 50:
                dr[:] = self._new()
        frame.alpha_composite(layer)


# ------------------------------------------------------------- post (numpy)
def chroma(arr, k):
    if k < 1:
        return arr
    out = arr.copy()
    out[..., 0] = np.roll(arr[..., 0], k, axis=1)
    out[..., 2] = np.roll(arr[..., 2], -k, axis=1)
    return out


def glitch(arr, n):
    for _ in range(n):
        y = random.randint(0, H - 80)
        hh = random.randint(10, 70)
        arr[y:y + hh] = np.roll(arr[y:y + hh], random.randint(-90, 90), axis=1)
    return arr


def whip(arr, amount):
    """Blur de miscare orizontal (tranzitie whip-pan)."""
    if amount < 1:
        return arr
    acc = arr.astype(np.float32)
    n = 6
    for i in range(1, n):
        acc += np.roll(arr, int(amount * i / n), axis=1)
    return (acc / n).astype(np.uint8)


def punch(img, z, rot=0.0):
    """Zoom de camera (punch-in) + inclinare."""
    if z <= 1.001 and abs(rot) < 0.05:
        return img
    if abs(rot) >= 0.05:
        img = img.rotate(rot, resample=Image.BILINEAR)
    zw, zh = int(W * z), int(H * z)
    big = img.resize((zw, zh), Image.BILINEAR)
    x0, y0 = (zw - W) // 2, (zh - H) // 2
    return big.crop((x0, y0, x0 + W, y0 + H))


# -------------------------------------------------------------------- main
def main():
    bg = make_background()
    vig = make_vignette()
    skies = {k: make_sky(k) for k in {s[2] for s in SCENES}}
    card = make_frame_card()
    rain = Rain()
    grain = [np.random.randint(-4, 5, (H, W, 1), np.int16) for _ in range(4)]

    texts = []
    for small, big, *_ in SCENES:
        texts.append((build_words(small, fit_size(small, 150, 820), 820),
                      text_img(big, fit_size(big, 230, 980))))

    starts, t0 = [], OFFSET
    for s in SCENES:
        starts.append(t0)
        t0 += s[4] * 4 * BEAT
    total = int(math.ceil(t0 * FPS))

    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
           "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", "23",
           "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", OUT]
    ff = subprocess.Popen(cmd, stdin=subprocess.PIPE)

    for f in range(total):
        t = f / FPS
        i = max([k for k in range(len(SCENES)) if starts[k] <= t] or [0])
        small_line, big_line, kind, action, bars = SCENES[i]
        dur = bars * 4 * BEAT
        lt = max(0.0, t - starts[i])
        p = clamp(lt / dur)
        bi, pulse, bar = beat_info(t)
        lb = lt / BEAT  # beat-ul local din scena
        side = 1 if bi % 2 == 0 else -1
        is_night = kind == "night"

        frame = bg.copy()
        rain.step_draw(frame, speed=1.0 + 1.8 * bar + (0.6 if is_night else 0))

        # fulger pe masura in scenele de noapte
        if is_night and bar > 0.5 and bi % 8 == 0:
            frame.alpha_composite(Image.new("RGBA", (W, H), (180, 200, 255, int(110 * bar))))

        # ---- polaroid: poza + personaje animate
        photo = skies[kind].copy()
        photo.alpha_composite(draw_people(action, p, bi, pulse, bar))
        # zoom lent in poza in ultima scena
        if action == "alone":
            zz = 1 + 0.25 * p
            pw_ = int(PHOTO * zz)
            photo = photo.resize((pw_, pw_), Image.BILINEAR).crop(
                ((pw_ - PHOTO) // 2, (pw_ - PHOTO) // 2 + int(40 * p), (pw_ - PHOTO) // 2 + PHOTO,
                 (pw_ - PHOTO) // 2 + PHOTO + int(40 * p)))
        pol = card.copy()
        pol.alpha_composite(photo, (80, 80))
        ImageDraw.Draw(pol).rectangle((80, 80, 80 + PHOTO, 80 + PHOTO), outline=(0, 0, 0, 40), width=2)

        # intrare cu rotire la inceput de scena, apoi "kick" pe fiecare beat
        pin = ease_out_back(clamp(lt / (BEAT * 0.9)))
        ang = -4 + (1 - pin) * (-25 if i % 2 else 25) + side * 2.2 * pulse + 1.0 * math.sin(t * 1.3)
        scl = (0.55 + 0.45 * pin) * (1 + 0.05 * pulse + 0.05 * bar)
        sh = 18 * bar
        px = W / 2 + 10 + (1 - pin) * (side * 500) + random.uniform(-sh, sh)
        py = 1250 + 8 * math.sin(t * 1.1) - 18 * pulse + random.uniform(-sh, sh)
        place(frame, pol, px, py, scl * 0.98, clamp(lt / 0.12),
              rot=ang)

        # ---- text: cuvintele mici apar pe jumatati de beat, linia mare "slam" pe beat-ul 2
        out = clamp((dur - lt) / (BEAT * 0.5))
        words, big = texts[i]
        for k, (wimg, dx) in enumerate(words):
            wl = lb - k * 0.5
            if wl < 0:
                continue
            s1 = lerp(1.8, 1.0, ease_out_back(clamp(wl / 0.35)))
            place(frame, wimg, W / 2 + dx, 470, s1 * (1 + 0.04 * pulse), clamp(wl / 0.15) * out)
        bl = lb - 2
        slam_shake = 0
        if bl >= 0:
            s2 = lerp(2.4, 1.0, ease_out_back(clamp(bl / 0.4))) * (1 + 0.06 * pulse)
            ty = 470 + words[0][0].height * 0.5 + big.height * 0.42
            place(frame, big, W / 2, ty, s2, clamp(bl / 0.12) * out, rot=side * 1.5 * pulse)
            slam_shake = 26 * math.exp(-bl * 6)

        # ---- camera: punch-in pe beat, mai tare pe masura si la "slam"
        z = 1 + 0.035 * pulse + 0.06 * bar + 0.002 * slam_shake
        frame = punch(frame, z, rot=side * 0.8 * bar)
        arr = np.array(frame.convert("RGB"))
        if slam_shake > 1:
            arr = np.roll(arr, (int(random.uniform(-slam_shake, slam_shake)),
                                int(random.uniform(-slam_shake, slam_shake))), axis=(0, 1))

        # ---- efecte pe beat: aberatie cromatica, glitch, whip intre scene
        arr = chroma(arr, int(10 * bar + 4 * pulse + (10 if action == "glitch_ghost" and pulse > 0.5 else 0)))
        if bar > 0.6 or (action == "glitch_ghost" and pulse > 0.7):
            arr = glitch(arr, 6)
        to_end = dur - lt
        if i < len(SCENES) - 1 and to_end < 0.13:
            arr = whip(arr, (0.13 - to_end) / 0.13 * 160)
        if i > 0 and lt < 0.13:
            arr = whip(arr, (0.13 - lt) / 0.13 * 160)

        # ---- lumina: flash pe masura, vigneta care "bate" ca o inima, grain
        a = arr.astype(np.float32)
        flash = 0.5 * bar if lt > BEAT * 0.5 or i == 0 else 0.75 * math.exp(-lt * 12)
        if flash > 0.01:
            a = a + (255 - a) * flash
        a *= (1 - vig[..., None] * (0.75 + 0.25 * pulse))
        a += grain[f % len(grain)]
        dark = max(clamp(1 - t / 0.4), clamp((t - (t0 - 0.8)) / 0.8))
        a *= (1 - dark)
        ff.stdin.write(np.clip(a, 0, 255).astype(np.uint8).tobytes())
        if f % 90 == 0:
            print(f"frame {f}/{total}", flush=True)

    ff.stdin.close()
    ff.wait()
    print("gata:", OUT)


if __name__ == "__main__":
    main()
