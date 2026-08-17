#!/usr/bin/env python3
from pathlib import Path

import qrcode
import qrcode.image.svg


TARGETS = {
    "assets/qr/site-qr.svg": "https://son-kou.github.io/summer-course-FL-pre/",
    "assets/qr/playground-qr.svg": "https://son-kou.github.io/summer-course-FL-pre/live/playground/index.html",
}


def generate(out_path: str, url: str) -> None:
    out = Path(out_path)
    out.parent.mkdir(parents=True, exist_ok=True)
    qr = qrcode.QRCode(version=None, error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=10, border=3)
    qr.add_data(url)
    qr.make(fit=True)
    image = qr.make_image(image_factory=qrcode.image.svg.SvgPathImage)
    with out.open("wb") as handle:
        image.save(handle)
    print(f"Generated {out} for {url}")


def main() -> None:
    for out_path, url in TARGETS.items():
        generate(out_path, url)


if __name__ == "__main__":
    main()
