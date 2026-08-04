#!/usr/bin/env python3
from pathlib import Path

import qrcode
import qrcode.image.svg


URL = "https://son-kou.github.io/summer-course-FL-pre/"
OUT = Path("assets/qr/site-qr.svg")


def main() -> None:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    qr = qrcode.QRCode(version=None, error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=10, border=3)
    qr.add_data(URL)
    qr.make(fit=True)
    image = qr.make_image(image_factory=qrcode.image.svg.SvgPathImage)
    with OUT.open("wb") as handle:
        image.save(handle)
    print(f"Generated {OUT} for {URL}")


if __name__ == "__main__":
    main()
