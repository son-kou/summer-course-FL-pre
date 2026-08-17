#!/usr/bin/env python3
from __future__ import annotations

import json
from html import escape
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "assets/practice/slide-scripts.json"
SPEAKER_NOTES = ROOT / "speaker-notes.md"
ENGLISH_SPEAKER_NOTES = ROOT / "speaker-notes-en.md"
PRINTABLE_QMD = ROOT / "rehearsal-notes.qmd"
EXPECTED_MAIN_SLIDES = 16
COURSE_SECONDS = 30 * 60


def mmss(seconds: int) -> str:
    minutes, secs = divmod(seconds, 60)
    return f"{minutes}:{secs:02d}"


def escape_table(text: str) -> str:
    return text.replace("|", "\\|").replace("\n", " ")


def bullets(items: list[str]) -> str:
    return "\n".join(f"- {item}" for item in items)


def html_bullets(items: list[str], lang: str | None = None) -> str:
    lang_attr = f' lang="{escape(lang)}"' if lang else ""
    list_items = "\n".join(f"<li>{escape(item)}</li>" for item in items)
    return f"<ul{lang_attr}>\n{list_items}\n</ul>"


def load_slides() -> list[dict]:
    data = json.loads(DATA.read_text(encoding="utf-8"))
    slides = data.get("slides", [])
    if len(slides) != EXPECTED_MAIN_SLIDES:
        raise SystemExit(f"Expected {EXPECTED_MAIN_SLIDES} main-slide scripts, found {len(slides)}")
    total = sum(int(slide["targetSeconds"]) for slide in slides)
    if not (26 * 60 <= total <= COURSE_SECONDS):
        raise SystemExit(f"Expected 26-30 minutes of rehearsal targets, found {mmss(total)}")
    return slides


def timing_table(slides: list[dict]) -> str:
    rows = ["| Slide | Topic | Target |", "|---:|---|---:|"]
    for slide in slides:
        rows.append(
            f"| {escape_table(str(slide['slideNumber']))} | "
            f"{escape_table(slide['title'])} | {mmss(int(slide['targetSeconds']))} |"
        )
    total = sum(int(slide["targetSeconds"]) for slide in slides)
    buffer_seconds = max(COURSE_SECONDS - total, 0)
    rows.append(f"|  | **Planned spoken content** | **{mmss(total)}** |")
    rows.append(f"|  | Buffer for questions and transitions | {mmss(buffer_seconds)} |")
    rows.append("|  | **Course slot** | **30:00** |")
    return "\n".join(rows)


def slide_block(slide: dict, printable: bool) -> str:
    title_prefix = "###" if printable else "##"
    section_prefix = "####" if printable else "###"
    parts = [
        f"{title_prefix} Slide {slide['slideNumber']}: {slide['title']}",
        f"{section_prefix} Key Points",
        bullets(slide["keyPointsEn"]),
        f"{section_prefix} 中文要点",
        bullets(slide["keyPointsZh"]),
        f"{section_prefix} English Script",
        slide["scriptEn"],
        f"{section_prefix} 中文讲稿",
        f"<div lang=\"zh-Hans\">\n\n{slide['scriptZh']}\n\n</div>",
        f"{section_prefix} Transition",
        f"**EN:** {slide['transitionEn']}\n\n**中文:** {slide['transitionZh']}",
        f"{section_prefix} Delivery And Timing",
        f"Target time: **{mmss(int(slide['targetSeconds']))}**.\n\n{slide['delivery']}",
    ]
    if slide.get("interactionNotes"):
        parts.extend(
            [
                f"{section_prefix} Interaction Notes",
                bullets(slide["interactionNotes"]),
            ]
        )
    if slide.get("interactionNotesZh"):
        parts.extend(
            [
                f"{section_prefix} 交互参数和图表读数",
                html_bullets(slide["interactionNotesZh"], lang="zh-Hans"),
            ]
        )
    parts.extend(
        [
            f"{section_prefix} Skip If Late",
            slide["skipIfLate"],
        ]
    )
    return "\n\n".join(parts)


def slide_block_en(slide: dict) -> str:
    parts = [
        f"## Slide {slide['slideNumber']}: {slide['title']}",
        "### Key Points",
        bullets(slide["keyPointsEn"]),
        "### English Script",
        slide["scriptEn"],
        "### Transition",
        slide["transitionEn"],
        "### Delivery And Timing",
        f"Target time: **{mmss(int(slide['targetSeconds']))}**.\n\n{slide['delivery']}",
    ]
    if slide.get("interactionNotes"):
        parts.extend(
            [
                "### Interaction Notes",
                bullets(slide["interactionNotes"]),
            ]
        )
    parts.extend(
        [
            "### Skip If Late",
            slide["skipIfLate"],
        ]
    )
    return "\n\n".join(parts)


def build_speaker_notes(slides: list[dict]) -> str:
    blocks = [
        "# Speaker Notes And Timing",
        "This file is generated from `assets/practice/slide-scripts.json`. The live deck also has an optional bilingual rehearsal drawer at `index.html?practice=1`.",
        "## Thirty-Minute Run",
        timing_table(slides),
        "## Rehearsal Through-Line",
        "\n".join(
            [
                "1. Start from multicentre clinical collaboration under constraints.",
                "2. Treat FL as one design option among several, then show one full round.",
                "3. Turn the room into the federation: join, inspect a synthetic site, decide.",
                "4. Run FedAvg live, then stress it with one heterogeneity or robustness event.",
                "5. Show that a global average can hide local failure, then connect to privacy and real-world evidence.",
                "6. End with four habits clinical PhD students can borrow even without deploying FL.",
            ]
        ),
        "## Slide-By-Slide Bilingual Script",
    ]
    blocks.extend(slide_block(slide, printable=False) for slide in slides)
    return "\n\n".join(blocks) + "\n"


def build_english_speaker_notes(slides: list[dict]) -> str:
    blocks = [
        "# Speaker Notes For Mentor Review",
        "This English-only file is generated from `assets/practice/slide-scripts.json`. It mirrors the bilingual rehearsal notes but omits the Chinese script so it can be sent for supervisor review.",
        "## Thirty-Minute Run",
        timing_table(slides),
        "## Rehearsal Through-Line",
        "\n".join(
            [
                "1. Start from multicentre clinical collaboration under constraints.",
                "2. Treat FL as one design option among several, then show one full round.",
                "3. Turn the room into the federation: join, inspect a synthetic site, decide.",
                "4. Run FedAvg live, then stress it with one heterogeneity or robustness event.",
                "5. Show that a global average can hide local failure, then connect to privacy and real-world evidence.",
                "6. End with four habits clinical PhD students can borrow even without deploying FL.",
            ]
        ),
        "## Slide-By-Slide English Script",
    ]
    blocks.extend(slide_block_en(slide) for slide in slides)
    return "\n\n".join(blocks) + "\n"


def build_printable_qmd(slides: list[dict]) -> str:
    frontmatter = "\n".join(
        [
            "---",
            'title: "Bilingual Rehearsal Notes"',
            'pagetitle: "Bilingual Rehearsal Notes"',
            "---",
        ]
    )
    blocks = [
        '<div class="page-header">',
        "<p>Printable English-Chinese speaking notes for the 30-minute PhD course session. The live deck exposes the same material only when opened with <code>?practice=1</code>.</p>",
        "</div>",
        '<div class="print-actions"><button onclick="window.print()">Print rehearsal notes</button><a class="button-link secondary" href="index.html?practice=1">Open rehearsal deck</a></div>',
        "## Timing Map",
        timing_table(slides),
        "## Bilingual Script",
    ]
    blocks.extend(slide_block(slide, printable=True) for slide in slides)
    return frontmatter + "\n\n" + "\n\n".join(blocks) + "\n"


def main() -> int:
    slides = load_slides()
    SPEAKER_NOTES.write_text(build_speaker_notes(slides), encoding="utf-8")
    ENGLISH_SPEAKER_NOTES.write_text(build_english_speaker_notes(slides), encoding="utf-8")
    PRINTABLE_QMD.write_text(build_printable_qmd(slides), encoding="utf-8")
    print(f"Wrote {SPEAKER_NOTES.relative_to(ROOT)}")
    print(f"Wrote {ENGLISH_SPEAKER_NOTES.relative_to(ROOT)}")
    print(f"Wrote {PRINTABLE_QMD.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
