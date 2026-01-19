"""
One-off helper to generate a transparent-background version of the Mavadry banner.

Input (repo root):  Mavadry-promotional.png
Output (Hydrogen):  mavala-hydrogen/public/mavadry-promotional.png

This keys out near-black background pixels and preserves soft edges.
"""

from __future__ import annotations

from pathlib import Path


def main() -> None:
    try:
        from PIL import Image  # type: ignore
    except Exception as e:  # pragma: no cover
        raise SystemExit(
            "Pillow is required. Install with: python -m pip install Pillow"
        ) from e

    repo_root = Path(__file__).resolve().parents[2]
    input_path = repo_root / "Mavadry-promotional.png"
    output_path = repo_root / "mavala-hydrogen" / "public" / "mavadry-promotional.png"

    if not input_path.exists():
        raise SystemExit(f"Input file not found: {input_path}")

    img = Image.open(input_path).convert("RGBA")
    px = img.load()
    w, h = img.size

    # Thresholds for background keying (tweak if needed)
    # - luma <= t0 => fully transparent
    # - luma >= t1 => fully opaque
    t0 = 8
    t1 = 42

    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue

            # Luma (perceived brightness)
            luma = int(0.2126 * r + 0.7152 * g + 0.0722 * b)

            if luma <= t0:
                px[x, y] = (r, g, b, 0)
            elif luma < t1:
                # Fade edges to avoid harsh cutout halos
                new_a = int((luma - t0) / (t1 - t0) * 255)
                px[x, y] = (r, g, b, min(a, new_a))

    output_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(output_path, optimize=True)
    print(f"Wrote: {output_path}")


if __name__ == "__main__":
    main()

