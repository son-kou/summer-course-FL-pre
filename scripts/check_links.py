#!/usr/bin/env python3
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse
import re
import sys


REQUIRED = [
    "index.html",
    "decision-guide.html",
    "checklist.html",
    "multicentre-research-lens.html",
    "frontier.html",
    "references.html",
    "resources.html",
    "demo/heterogeneity.html",
    "labs/aggregation/index.html",
    "labs/mri-domain-shift/index.html",
    "labs/personalization/index.html",
    "labs/missing-modality/index.html",
    "labs/privacy-threat-model/index.html",
    "labs/evaluation-shift/index.html",
    "downloads/federated-study-readiness-checklist.pdf",
    "downloads/multicentre-clinical-ai-research-lens.pdf",
    "assets/qr/site-qr.svg",
    "assets/brand/au-logo-uk-blue.png",
    "assets/brand/cercare-wordmark.svg",
    "assets/mri/brain_mri_glioma_00.jpg",
]

LAB_REQUIRED = [
    "labs/aggregation/style.css",
    "labs/aggregation/app.js",
    "labs/mri-domain-shift/style.css",
    "labs/mri-domain-shift/app.js",
    "labs/personalization/style.css",
    "labs/personalization/app.js",
    "labs/missing-modality/style.css",
    "labs/missing-modality/app.js",
    "labs/privacy-threat-model/style.css",
    "labs/privacy-threat-model/app.js",
    "labs/evaluation-shift/style.css",
    "labs/evaluation-shift/app.js",
]

PROVENANCE_REQUIRED = [
    "au-logo-uk-blue.png",
    "cercare-wordmark.svg",
    "brain_mri_glioma_00.jpg",
    "multicentre-clinical-ai-research-lens.pdf",
]

LOCAL_PATH_RE = re.compile(r"(/Users/[^\s\"'<>]+|/home/[^\s\"'<>]+|[A-Za-z]:\\Users\\[^\s\"'<>]+)")
RAW_ATTR_RE = re.compile(r"\{(?:\.[A-Za-z0-9_-]+|#[A-Za-z0-9_-]+)[^}]*\}")
MALFORMED_VISUAL_RE = re.compile(r"\{[^}\n]*\.visual\s+(?![.#])(?!(?:[\w-]+)=)[^}\n]*\}")
SMART_ATTR_RE = re.compile(r"\{[^}\n]*[“”‘’][^}\n]*\}")


class LinkParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.links: list[tuple[str, str]] = []
        self.images: list[dict[str, str]] = []
        self.iframes: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attr = {name: value or "" for name, value in attrs}
        for name, value in attr.items():
            if name in {"href", "src"} and value:
                self.links.append((name, value))
        if tag == "img":
            self.images.append(attr)
        if tag == "iframe" and attr.get("src"):
            self.iframes.append(attr["src"])


def is_external(value: str) -> bool:
    parsed = urlparse(value)
    return parsed.scheme in {"http", "https", "mailto", "tel", "javascript", "data", "blob"}


def local_target(root: Path, source_file: Path, value: str) -> Path | None:
    if not value or value.startswith("#") or is_external(value):
        return None
    path_part = value.split("#", 1)[0].split("?", 1)[0]
    if not path_part:
        return None
    decoded = unquote(path_part)
    base = root if decoded.startswith("/") else source_file.parent
    candidate = (base / decoded.lstrip("/")).resolve()
    if decoded.endswith("/"):
        candidate = candidate / "index.html"
    return candidate


def css_urls(text: str) -> list[str]:
    return re.findall(r"url\(['\"]?([^)'\"]+)['\"]?\)", text)


def ignored_render_path(path: Path) -> bool:
    return any(part in {"node_modules", ".asset-downloads", "qa-screenshots"} for part in path.parts)


def check_source_files(project: Path, errors: list[str]) -> None:
    for qmd in project.glob("*.qmd"):
        text = qmd.read_text(encoding="utf-8", errors="replace")
        if MALFORMED_VISUAL_RE.search(text):
            errors.append(f"malformed image attribute block in {qmd.name}")
        if SMART_ATTR_RE.search(text):
            errors.append(f"smart quote inside attribute block in {qmd.name}")
    for html in list((project / "labs").rglob("*.html")) + list((project / "demo").rglob("*.html")):
        text = html.read_text(encoding="utf-8", errors="replace")
        if LOCAL_PATH_RE.search(text):
            errors.append(f"absolute local path leaked in source {html.relative_to(project)}")


def main() -> int:
    root = Path(sys.argv[1] if len(sys.argv) > 1 else "_site").resolve()
    project = Path.cwd()
    errors: list[str] = []
    bib_count = 0

    check_source_files(project, errors)

    for item in LAB_REQUIRED:
        if not (project / item).exists():
            errors.append(f"missing lab source file: {item}")

    provenance = (project / "research/image-licence-log.md").read_text(encoding="utf-8", errors="replace")
    for item in PROVENANCE_REQUIRED:
        if item not in provenance:
            errors.append(f"missing licence/provenance entry for {item}")

    if not root.exists():
        errors.append(f"rendered site does not exist: {root}")
    else:
        for item in REQUIRED:
            if not (root / item).exists():
                errors.append(f"missing required rendered file: {item}")

        for html in root.rglob("*.html"):
            if ignored_render_path(html.relative_to(root)):
                continue
            parser = LinkParser()
            text = html.read_text(encoding="utf-8", errors="replace")
            parser.feed(text)
            rel = html.relative_to(root)
            if LOCAL_PATH_RE.search(text):
                errors.append(f"absolute local path leaked in {rel}")
            if RAW_ATTR_RE.search(text):
                errors.append(f"raw Pandoc/Reveal attribute block visible in rendered HTML: {rel}")
            for _, value in parser.links:
                target = local_target(root, html, value)
                if target and not target.exists():
                    errors.append(f"broken local link in {rel}: {value}")
            for value in parser.iframes:
                target = local_target(root, html, value)
                if target and not target.exists():
                    errors.append(f"broken iframe target in {rel}: {value}")
            for image in parser.images:
                src = image.get("src", "")
                if src.startswith("data:"):
                    continue
                if image.get("alt", None) is None:
                    errors.append(f"missing alt text in {rel}: {src}")

        for css in root.rglob("*.css"):
            if ignored_render_path(css.relative_to(root)):
                continue
            text = css.read_text(encoding="utf-8", errors="replace")
            rel = css.relative_to(root)
            if LOCAL_PATH_RE.search(text):
                errors.append(f"absolute local path leaked in {rel}")
            for value in css_urls(text):
                target = local_target(root, css, value)
                if target and not target.exists():
                    errors.append(f"broken CSS asset in {rel}: {value}")

    bib = project / "references.bib"
    if not bib.exists():
        errors.append("references.bib is missing")
    else:
        bib_count = len(re.findall(r"^@", bib.read_text(encoding="utf-8"), flags=re.MULTILINE))
        if bib_count < 75 or bib_count > 90:
            errors.append(f"expected 75-90 bibliography entries, found {bib_count}")

    if errors:
        print("Validation failed:")
        for error in errors:
            print(f"- {error}")
        return 1

    print(f"Validation passed for {root}")
    print(f"Required files present: {len(REQUIRED)}")
    print(f"Lab source files present: {len(LAB_REQUIRED)}")
    print(f"Bibliography entries: {bib_count}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
