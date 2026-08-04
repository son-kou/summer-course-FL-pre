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
    "references.html",
    "resources.html",
    "demo/heterogeneity.html",
    "downloads/federated-study-readiness-checklist.pdf",
    "assets/qr/site-qr.svg",
]

LOCAL_PATH_RE = re.compile(r"(/Users/[^\\s\"'<>]+|/home/[^\\s\"'<>]+|[A-Za-z]:\\\\Users\\\\[^\\s\"'<>]+)")


class LinkParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.links: list[tuple[str, str]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        for name, value in attrs:
            if name in {"href", "src"} and value:
                self.links.append((name, value))


def is_external(value: str) -> bool:
    parsed = urlparse(value)
    return parsed.scheme in {"http", "https", "mailto", "tel", "javascript", "data"}


def local_target(root: Path, html_file: Path, value: str) -> Path | None:
    if not value or value.startswith("#") or is_external(value):
        return None
    path_part = value.split("#", 1)[0].split("?", 1)[0]
    if not path_part:
        return None
    decoded = unquote(path_part)
    base = root if decoded.startswith("/") else html_file.parent
    candidate = (base / decoded.lstrip("/")).resolve()
    if decoded.endswith("/"):
        candidate = candidate / "index.html"
    return candidate


def css_urls(text: str) -> list[str]:
    return re.findall(r"url\\(['\"]?([^)'\"]+)['\"]?\\)", text)


def main() -> int:
    root = Path(sys.argv[1] if len(sys.argv) > 1 else "_site").resolve()
    project = Path.cwd()
    errors: list[str] = []
    bib_count = 0

    if not root.exists():
        errors.append(f"rendered site does not exist: {root}")
    else:
        for item in REQUIRED:
            if not (root / item).exists():
                errors.append(f"missing required rendered file: {item}")

        for html in root.rglob("*.html"):
            parser = LinkParser()
            text = html.read_text(encoding="utf-8", errors="replace")
            parser.feed(text)
            if LOCAL_PATH_RE.search(text):
                errors.append(f"absolute local path leaked in {html.relative_to(root)}")
            for _, value in parser.links:
                target = local_target(root, html, value)
                if target and not target.exists():
                    errors.append(f"broken local link in {html.relative_to(root)}: {value}")

        for css in root.rglob("*.css"):
            text = css.read_text(encoding="utf-8", errors="replace")
            if LOCAL_PATH_RE.search(text):
                errors.append(f"absolute local path leaked in {css.relative_to(root)}")
            for value in css_urls(text):
                target = local_target(root, css, value)
                if target and not target.exists():
                    errors.append(f"broken CSS asset in {css.relative_to(root)}: {value}")

    bib = project / "references.bib"
    if not bib.exists():
        errors.append("references.bib is missing")
    else:
        bib_count = len(re.findall(r"^@", bib.read_text(encoding="utf-8"), flags=re.MULTILINE))
        if bib_count < 45:
            errors.append(f"expected at least 45 bibliography entries, found {bib_count}")

    if errors:
        print("Validation failed:")
        for error in errors:
            print(f"- {error}")
        return 1

    print(f"Validation passed for {root}")
    print(f"Required files present: {len(REQUIRED)}")
    print(f"Bibliography entries: {bib_count}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
