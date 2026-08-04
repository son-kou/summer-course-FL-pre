#!/usr/bin/env python3
from pathlib import Path
import textwrap

from PIL import Image, ImageDraw, ImageFont


OUT = Path("downloads/multicentre-clinical-ai-research-lens.pdf")
W, H = 1754, 1240
COLORS = {
    "navy": "#10243f",
    "ink": "#172033",
    "teal": "#0c6b6f",
    "coral": "#c85446",
    "amber": "#d99a2b",
    "paper": "#f7f4ee",
    "line": "#cfd8dd",
    "white": "#ffffff",
    "soft": "#edf4f2",
}

HABITS = [
    ("Collaboration design", "Name what moves: data, updates, metrics, aggregates, or conclusions. Justify why that movement is needed."),
    ("Institution as a variable", "Treat site, workflow, scanner, assay, referral, and annotation differences as measurable scientific context."),
    ("Missingness and modality", "Make the modality-by-site matrix early. Decide what common core is possible and what remains local."),
    ("Site-level evaluation", "Predefine global, per-site, worst-site, subgroup, calibration, uncertainty, abstention, unseen-site, and drift criteria."),
    ("Privacy as information flow", "Write who can see what, what can be inferred, what is logged, what is released, and who responds."),
    ("Governance and maintenance", "Assign clinical, data, security, ethics, contract, authorship, monitoring, withdrawal, and update responsibilities."),
]


def font(size: int, bold: bool = False) -> ImageFont.ImageFont:
    candidates = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Supplemental/Helvetica Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Helvetica.ttf",
        "/Library/Fonts/Arial Bold.ttf" if bold else "/Library/Fonts/Arial.ttf",
    ]
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size=size)
    return ImageFont.load_default()


def wrapped(draw: ImageDraw.ImageDraw, text: str, x: int, y: int, width: int, fnt: ImageFont.ImageFont, fill: str, line_gap: int = 8) -> int:
    avg = max(draw.textlength("abcdefghijklmnopqrstuvwxyz", font=fnt) / 26, 1)
    chars = max(int(width / avg), 20)
    for line in textwrap.wrap(text, width=chars):
        draw.text((x, y), line, font=fnt, fill=fill)
        y += fnt.size + line_gap if hasattr(fnt, "size") else 28
    return y


def main() -> None:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    img = Image.new("RGB", (W, H), COLORS["paper"])
    draw = ImageDraw.Draw(img)
    title = font(50, bold=True)
    subtitle = font(24)
    h2 = font(28, bold=True)
    body = font(20)
    small = font(16)

    draw.rectangle((0, 0, W, 134), fill=COLORS["navy"])
    draw.rectangle((0, 134, W, 148), fill=COLORS["teal"])
    draw.text((58, 30), "What Clinical Researchers Can Borrow from Federated Learning", font=title, fill=COLORS["white"])
    draw.text((60, 92), "A multicentre clinical AI research lens", font=subtitle, fill=COLORS["soft"])

    draw.rounded_rectangle((60, 184, W - 60, 282), radius=14, fill=COLORS["white"], outline=COLORS["line"], width=2)
    wrapped(draw, "Use this before the first protocol meeting. The point is not to force federated learning into every project; it is to make collaboration design, heterogeneity, privacy, evaluation, and governance explicit.", 88, 208, W - 176, body, COLORS["ink"], 6)

    x0, y0 = 60, 326
    card_w, card_h = 520, 252
    gap_x, gap_y = 36, 30
    for idx, (heading, text) in enumerate(HABITS, start=1):
        col = (idx - 1) % 3
        row = (idx - 1) // 3
        x = x0 + col * (card_w + gap_x)
        y = y0 + row * (card_h + gap_y)
        draw.rounded_rectangle((x, y, x + card_w, y + card_h), radius=14, fill=COLORS["white"], outline=COLORS["line"], width=2)
        draw.ellipse((x + 22, y + 22, x + 70, y + 70), fill=COLORS["teal"])
        draw.text((x + 39, y + 30), str(idx), font=h2, fill=COLORS["white"])
        draw.text((x + 92, y + 26), heading, font=h2, fill=COLORS["navy"])
        wrapped(draw, text, x + 28, y + 92, card_w - 56, body, COLORS["ink"], 7)

    footer_y = H - 138
    draw.rounded_rectangle((60, footer_y, W - 60, H - 50), radius=14, fill="#fff9ec", outline=COLORS["amber"], width=2)
    draw.text((88, footer_y + 20), "Protocol sentence:", font=h2, fill=COLORS["coral"])
    wrapped(draw, "The study will be considered unsuccessful if any site, subgroup, or calibration stratum falls below the predefined clinical threshold.", 360, footer_y + 25, W - 440, body, COLORS["ink"], 5)
    draw.text((W - 410, H - 34), "MIT-licensed original handout | 2026-08-04", font=small, fill=COLORS["ink"])

    img.save(OUT, "PDF", resolution=150.0)
    print(f"Generated {OUT}")


if __name__ == "__main__":
    main()
