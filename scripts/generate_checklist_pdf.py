#!/usr/bin/env python3
from pathlib import Path
import textwrap

from PIL import Image, ImageDraw, ImageFont


OUT = Path("downloads/federated-study-readiness-checklist.pdf")
W, H = 1754, 1240
COLORS = {
    "navy": "#10243f",
    "ink": "#172033",
    "teal": "#0c6b6f",
    "coral": "#c85446",
    "amber": "#d99a2b",
    "paper": "#f7f4ee",
    "mist": "#e9edf0",
    "line": "#cfd8dd",
    "white": "#ffffff",
}

SECTIONS = [
    ("Clinical question", [
        "Target population, intended use, and decision context are explicit.",
        "Outcome is clinically meaningful and measured similarly across sites.",
        "A non-FL baseline and site-held-out validation plan are defined.",
    ]),
    ("Data movement", [
        "Patient-level centralization was evaluated and documented.",
        "Permitted outputs are specified: updates, metrics, aggregates, logs.",
        "Disclosure rules are written for counts and reporting.",
    ]),
    ("Harmonization", [
        "Cohort definitions and exclusions are site-tested.",
        "Data dictionary, label protocol, and preprocessing are versioned.",
        "Missingness, timing, and annotation quality are profiled by site.",
    ]),
    ("Evaluation", [
        "Per-site, worst-site, subgroup, and global metrics are specified.",
        "Calibration and clinical utility are included, not only discrimination.",
        "Failure criteria and stop rules are defined.",
    ]),
    ("Privacy and security", [
        "Threat model covers honest-but-curious, compromised, and malicious participants.",
        "Secure transport, authentication, authorization, and audit logging are assigned.",
        "Update review, poisoning detection, and incident response are included.",
    ]),
    ("Operations and governance", [
        "Each site has clinical, technical, and governance owners.",
        "Ethics, data-protection, contracts, authorship, and model ownership are documented.",
        "Maintenance, withdrawal, deletion, and publication plans are agreed.",
    ]),
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
    chars = max(int(width / avg), 18)
    for line in textwrap.wrap(text, width=chars):
        draw.text((x, y), line, font=fnt, fill=fill)
        y += fnt.size + line_gap if hasattr(fnt, "size") else 28
    return y


def checkbox(draw: ImageDraw.ImageDraw, x: int, y: int) -> None:
    draw.rounded_rectangle((x, y, x + 28, y + 28), radius=4, outline=COLORS["teal"], width=3, fill=COLORS["white"])


def main() -> None:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    img = Image.new("RGB", (W, H), COLORS["paper"])
    draw = ImageDraw.Draw(img)
    title = font(52, bold=True)
    subtitle = font(24)
    h2 = font(28, bold=True)
    body = font(20)
    small = font(16)

    draw.rectangle((0, 0, W, 132), fill=COLORS["navy"])
    draw.rectangle((0, 132, W, 146), fill=COLORS["teal"])
    draw.text((58, 32), "Federated Study Readiness Checklist", font=title, fill=COLORS["white"])
    draw.text((60, 94), "For medical AI projects where patient-level data may not move", font=subtitle, fill=COLORS["mist"])

    draw.rounded_rectangle((60, 176, W - 60, 278), radius=16, fill=COLORS["white"], outline=COLORS["line"], width=2)
    draw.text((88, 198), "Use before the first federation meeting", font=h2, fill=COLORS["navy"])
    wrapped(draw, "A project is not ready because the algorithm has a name. It is ready when the clinical question, data movement, harmonization, evaluation, privacy, and governance are explicit.", 88, 235, W - 176, body, COLORS["ink"], 6)

    x0, y0 = 60, 318
    card_w, card_h = 520, 258
    gap_x, gap_y = 36, 32
    for idx, (heading, items) in enumerate(SECTIONS, start=1):
        col = (idx - 1) % 3
        row = (idx - 1) // 3
        x = x0 + col * (card_w + gap_x)
        y = y0 + row * (card_h + gap_y)
        draw.rounded_rectangle((x, y, x + card_w, y + card_h), radius=14, fill=COLORS["white"], outline=COLORS["line"], width=2)
        draw.rounded_rectangle((x, y, x + 56, y + 52), radius=14, fill=COLORS["teal"])
        draw.text((x + 18, y + 11), str(idx), font=h2, fill=COLORS["white"])
        draw.text((x + 74, y + 14), heading, font=h2, fill=COLORS["navy"])
        item_y = y + 74
        for item in items:
            checkbox(draw, x + 22, item_y + 2)
            item_y = wrapped(draw, item, x + 62, item_y, card_w - 88, body, COLORS["ink"], 4) + 9

    footer_y = H - 126
    draw.rounded_rectangle((60, footer_y, W - 60, H - 48), radius=14, fill="#fff9ec", outline=COLORS["amber"], width=2)
    draw.text((88, footer_y + 20), "Red flag:", font=h2, fill=COLORS["coral"])
    wrapped(draw, "Pause the FL plan if the governance problem is being handed to the algorithm, or if the only privacy statement is that data stay local.", 212, footer_y + 23, W - 300, body, COLORS["ink"], 4)
    draw.text((W - 380, H - 34), "MIT-licensed original handout | 2026-08-04", font=small, fill=COLORS["ink"])

    img.save(OUT, "PDF", resolution=150.0)
    print(f"Generated {OUT}")


if __name__ == "__main__":
    main()
