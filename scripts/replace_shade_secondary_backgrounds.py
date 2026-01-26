"""
Replace WHITE backgrounds with Mavala GREY (#f5f5f5) for nail polish SHADE secondary images.

Why this exists:
- The UI containers already use a grey background, but many shade "secondary" images
  (typically 02.png / 03.png) have baked-in white backgrounds, causing a visible white box.
- We use PIL's flood fill from the image edges so we ONLY replace edge-connected background,
  avoiding changing internal white highlights (e.g. glossy nail reflections).

Targets:
- mavala-hydrogen/public/images/shades/**/(02.png|03.png) by default

Examples:
  # Dry run (counts only)
  python scripts/replace_shade_secondary_backgrounds.py --dry-run

  # Process all shades (overwrite in place)
  python scripts/replace_shade_secondary_backgrounds.py

  # More aggressive flood tolerance (fills more near-white)
  python scripts/replace_shade_secondary_backgrounds.py --flood-thresh 35
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path
from typing import Iterable, Set, Tuple

from PIL import Image, ImageDraw


if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")


GREY_RGB: Tuple[int, int, int] = (245, 245, 245)  # #f5f5f5


def is_near_white(rgb: Tuple[int, int, int], threshold: int) -> bool:
    r, g, b = rgb
    return r >= threshold and g >= threshold and b >= threshold


def is_near_color(
    rgb: Tuple[int, int, int], target: Tuple[int, int, int], tol: int
) -> bool:
    return (
        abs(rgb[0] - target[0]) <= tol
        and abs(rgb[1] - target[1]) <= tol
        and abs(rgb[2] - target[2]) <= tol
    )


def find_border_seeds(
    px,
    width: int,
    height: int,
    *,
    white_threshold: int,
    grey_tol: int,
) -> Set[Tuple[int, int]]:
    """
    Return a small set of seed points on the border that are white-ish and not the target grey.

    Important: We scan the FULL border (not sampled) to catch tiny 1px white halos,
    but we only keep the start of each contiguous run to avoid thousands of seeds.
    """
    seeds: Set[Tuple[int, int]] = set()

    def qualifies(x: int, y: int) -> bool:
        rgb = px[x, y]
        return is_near_white(rgb, white_threshold) and not is_near_color(
            rgb, GREY_RGB, tol=grey_tol
        )

    # Top edge y=0
    prev = False
    for x in range(width):
        cur = qualifies(x, 0)
        if cur and not prev:
            seeds.add((x, 0))
        prev = cur

    # Bottom edge y=height-1
    prev = False
    yb = height - 1
    for x in range(width):
        cur = qualifies(x, yb)
        if cur and not prev:
            seeds.add((x, yb))
        prev = cur

    # Left edge x=0
    prev = False
    for y in range(height):
        cur = qualifies(0, y)
        if cur and not prev:
            seeds.add((0, y))
        prev = cur

    # Right edge x=width-1
    prev = False
    xr = width - 1
    for y in range(height):
        cur = qualifies(xr, y)
        if cur and not prev:
            seeds.add((xr, y))
        prev = cur

    return seeds


def process_one_image(
    img_path: Path,
    *,
    white_threshold: int,
    flood_thresh: int,
    border_step: int,
    grey_tol: int,
    dry_run: bool,
) -> str:
    try:
        with Image.open(img_path) as img:
            base = img.convert("RGB")

        px = base.load()
        w, h = base.size

        # Choose border seeds that are near-white (so we don't floodfill colored borders)
        seeds = list(
            find_border_seeds(
                px,
                w,
                h,
                white_threshold=white_threshold,
                grey_tol=grey_tol,
            )
        )

        if not seeds:
            # If corners already grey and there are no border white-ish pixels,
            # consider it already processed.
            corners = [px[0, 0], px[w - 1, 0], px[0, h - 1], px[w - 1, h - 1]]
            if all(is_near_color(c, GREY_RGB, grey_tol) for c in corners):
                return "skip_already_grey"
            return "skip_no_white_border"

        if dry_run:
            return "would_process"

        # Flood fill from the selected edge points (edge-connected background only)
        draw = ImageDraw.Draw(base)
        _ = draw  # keep a reference; PIL uses internal state
        for seed in seeds:
            ImageDraw.floodfill(base, seed, GREY_RGB, thresh=flood_thresh)

        base.save(img_path, "PNG", optimize=True)
        return "processed"

    except Exception as e:
        print(f"[FAIL] {img_path}: {e}")
        return "failed"


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Replace white backgrounds with #f5f5f5 for shade secondary images (02/03)."
    )
    parser.add_argument(
        "--shades-root",
        default=str(
            Path(__file__).parent.parent
            / "mavala-hydrogen"
            / "public"
            / "images"
            / "shades"
        ),
        help="Path to the shades images root folder",
    )
    parser.add_argument(
        "--files",
        default="02.png,03.png",
        help='Comma-separated list of filenames to process (default: "02.png,03.png")',
    )
    parser.add_argument(
        "--white-threshold",
        type=int,
        default=250,
        help="Border pixels >= threshold in all RGB channels are treated as white (default: 250)",
    )
    parser.add_argument(
        "--flood-thresh",
        type=int,
        default=25,
        help="Flood fill color tolerance (default: 25). Increase if background isn't fully filled.",
    )
    parser.add_argument(
        "--border-step",
        type=int,
        default=64,
        help="(Deprecated) kept for backwards compatibility; border is now scanned fully.",
    )
    parser.add_argument(
        "--grey-tol",
        type=int,
        default=6,
        help="Tolerance for detecting already-grey backgrounds (default: 6)",
    )
    parser.add_argument("--dry-run", action="store_true", help="Don't write files")

    args = parser.parse_args()

    shades_root = Path(args.shades_root)
    if not shades_root.exists():
        print(f"Shades root not found: {shades_root}")
        return 1

    target_files = [x.strip() for x in str(args.files).split(",") if x.strip()]
    if not target_files:
        print("No target filenames provided via --files")
        return 1

    counters = {
        "processed": 0,
        "would_process": 0,
        "skip_already_grey": 0,
        "skip_no_white_border": 0,
        "failed": 0,
    }

    all_targets: list[Path] = []
    for f in target_files:
        all_targets.extend(shades_root.rglob(f))

    print("=" * 72)
    print("Shade Secondary Background Fix")
    print(f"Root: {shades_root}")
    print(f"Targets: {', '.join(target_files)}")
    print(f"Grey: #{GREY_RGB[0]:02x}{GREY_RGB[1]:02x}{GREY_RGB[2]:02x} (RGB {GREY_RGB})")
    print(f"Dry run: {bool(args.dry_run)}")
    print("=" * 72)
    print(f"Found {len(all_targets)} files")

    for i, img_path in enumerate(sorted(all_targets), 1):
        status = process_one_image(
            img_path,
            white_threshold=args.white_threshold,
            flood_thresh=args.flood_thresh,
            border_step=args.border_step,
            grey_tol=args.grey_tol,
            dry_run=args.dry_run,
        )
        counters[status] = counters.get(status, 0) + 1

        if status in {"processed", "would_process"}:
            rel = img_path.relative_to(shades_root)
            print(f"[{i}/{len(all_targets)}] [{status.upper()}] {rel}")

    print("-" * 72)
    print(
        "Results: "
        + ", ".join(f"{k}={v}" for k, v in counters.items() if v)
        + ("" if counters else "none")
    )
    print("=" * 72)

    return 0 if counters.get("failed", 0) == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())

