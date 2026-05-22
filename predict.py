from __future__ import annotations

import argparse
from pathlib import Path

from ultralytics import YOLO

ROOT = Path(__file__).resolve().parent
DEFAULT_SOURCE = ROOT / "data" / "processed" / "images" / "val"
DEFAULT_WEIGHTS = ROOT / "weights" / "vehicle-yolov8_best.pt"
DEFAULT_PROJECT = ROOT / "runs"


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Run YOLOv8 inference on local images or directories.")
    parser.add_argument(
        "--weights",
        type=Path,
        default=DEFAULT_WEIGHTS,
        help="Path to the trained checkpoint.",
    )
    parser.add_argument(
        "--source",
        type=Path,
        default=DEFAULT_SOURCE,
        help="Image, video, or directory to run inference on.",
    )
    parser.add_argument("--conf", type=float, default=0.6)
    parser.add_argument("--iou", type=float, default=0.4)
    parser.add_argument("--device", type=str, default=None, help="Optional device string such as cpu, 0, or 0,1.")
    parser.add_argument("--project", type=Path, default=DEFAULT_PROJECT)
    parser.add_argument("--name", type=str, default="predict")
    parser.add_argument("--exist-ok", action="store_true", help="Reuse the output directory if it already exists.")
    return parser


def run_prediction(args: argparse.Namespace) -> None:
    if not args.weights.exists():
        raise FileNotFoundError(
            f"Checkpoint not found at {args.weights}. Run train.py first or pass --weights explicitly."
        )

    if not args.source.exists():
        raise FileNotFoundError(f"Source not found at {args.source}")

    model = YOLO(str(args.weights))
    model.predict(
        source=str(args.source),
        conf=args.conf,
        iou=args.iou,
        device=args.device,
        save=True,
        project=str(args.project),
        name=args.name,
        exist_ok=args.exist_ok,
    )


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    run_prediction(args)


if __name__ == "__main__":
    main()
