from __future__ import annotations

import argparse
import shutil
from pathlib import Path
from typing import Iterable

from ultralytics import YOLO

ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"
RAW_DATA_DIR = DATA_DIR / "raw"
PROCESSED_DATA_DIR = DATA_DIR / "processed"
RUNS_DIR = ROOT / "runs"
WEIGHTS_DIR = ROOT / "weights"
DATASET_YAML = DATA_DIR / "vehicle.yaml"
DEFAULT_BASE_MODEL = "yolov8n.pt"
VEHICLE_CLASSES = {3, 4, 5, 8}
CLASS_NAMES = ["vehicle"]


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Train a YOLOv8 vehicle detector locally.")
    parser.add_argument(
        "--train-dir",
        type=Path,
        default=RAW_DATA_DIR / "VisDrone2019-DET-train",
        help="Path to the raw training split.",
    )
    parser.add_argument(
        "--val-dir",
        type=Path,
        default=RAW_DATA_DIR / "VisDrone2019-DET-val",
        help="Path to the raw validation split.",
    )
    parser.add_argument(
        "--processed-dir",
        type=Path,
        default=PROCESSED_DATA_DIR,
        help="Output directory for the YOLO-ready dataset.",
    )
    parser.add_argument(
        "--weights-dir",
        type=Path,
        default=WEIGHTS_DIR,
        help="Directory where the trained checkpoint will be copied.",
    )
    parser.add_argument(
        "--model",
        type=str,
        default=DEFAULT_BASE_MODEL,
        help="Base YOLOv8 model to fine-tune.",
    )
    parser.add_argument("--epochs", type=int, default=50)
    parser.add_argument("--imgsz", type=int, default=640)
    parser.add_argument("--batch", type=int, default=16)
    parser.add_argument("--device", type=str, default=None, help="Optional device string such as cpu, 0, or 0,1.")
    parser.add_argument("--name", type=str, default="vehicle-yolov8")
    parser.add_argument("--project", type=Path, default=RUNS_DIR)
    return parser


def find_existing_dir(candidates: Iterable[Path]) -> Path:
    for candidate in candidates:
        if candidate.exists():
            return candidate
    searched = ", ".join(str(path) for path in candidates)
    raise FileNotFoundError(f"Could not find any of these directories: {searched}")


def split_layout(split_dir: Path) -> tuple[Path, Path]:
    image_dir = find_existing_dir(
        [
            split_dir / "images",
            split_dir / "image",
            split_dir / "JPEGImages",
            split_dir / "jpg_images",
        ]
    )
    label_dir = find_existing_dir(
        [
            split_dir / "labels",
            split_dir / "annotations",
        ]
    )
    return image_dir, label_dir


def copy_images(src_dir: Path, dst_dir: Path) -> None:
    dst_dir.mkdir(parents=True, exist_ok=True)
    for image_path in sorted(src_dir.iterdir()):
        if image_path.is_file():
            shutil.copy2(image_path, dst_dir / image_path.name)


def filter_labels(src_dir: Path, dst_dir: Path) -> None:
    dst_dir.mkdir(parents=True, exist_ok=True)

    for label_path in sorted(src_dir.glob("*.txt")):
        filtered_lines: list[str] = []

        with label_path.open("r", encoding="utf-8") as handle:
            for line in handle:
                parts = line.strip().split()
                if not parts:
                    continue

                class_id = int(parts[0])
                if class_id not in VEHICLE_CLASSES:
                    continue

                filtered_lines.append("0 " + " ".join(parts[1:]))

        if filtered_lines:
            output_path = dst_dir / label_path.name
            output_path.write_text("\n".join(filtered_lines), encoding="utf-8")


def prepare_split(split_name: str, raw_split_dir: Path, processed_root: Path) -> None:
    image_dir, label_dir = split_layout(raw_split_dir)
    copy_images(image_dir, processed_root / "images" / split_name)
    filter_labels(label_dir, processed_root / "labels" / split_name)


def write_dataset_yaml(yaml_path: Path, processed_root: Path) -> None:
    yaml_path.parent.mkdir(parents=True, exist_ok=True)
    yaml_content = "\n".join(
        [
            f"path: {processed_root.as_posix()}",
            "train: images/train",
            "val: images/val",
            "nc: 1",
            "names: ['vehicle']",
            "",
        ]
    )
    yaml_path.write_text(yaml_content, encoding="utf-8")


def prepare_dataset(train_dir: Path, val_dir: Path, processed_dir: Path) -> Path:
    prepare_split("train", train_dir, processed_dir)
    prepare_split("val", val_dir, processed_dir)
    write_dataset_yaml(DATASET_YAML, processed_dir)
    return DATASET_YAML


def train_model(args: argparse.Namespace) -> Path:
    args.project.mkdir(parents=True, exist_ok=True)
    args.weights_dir.mkdir(parents=True, exist_ok=True)

    data_yaml = prepare_dataset(args.train_dir, args.val_dir, args.processed_dir)

    model = YOLO(args.model)
    model.train(
        data=str(data_yaml),
        epochs=args.epochs,
        imgsz=args.imgsz,
        batch=args.batch,
        device=args.device,
        project=str(args.project),
        name=args.name,
        exist_ok=True,
    )

    trainer = getattr(model, "trainer", None)
    if trainer is None:
        raise RuntimeError("Ultralytics trainer was not initialized after training.")

    best_checkpoint = Path(trainer.save_dir) / "weights" / "best.pt"
    if not best_checkpoint.exists():
        raise FileNotFoundError(f"Training finished, but checkpoint was not found at {best_checkpoint}")

    final_checkpoint = args.weights_dir / f"{args.name}_best.pt"
    shutil.copy2(best_checkpoint, final_checkpoint)
    return final_checkpoint


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    best_checkpoint = train_model(args)
    print(f"Saved best checkpoint to: {best_checkpoint}")


if __name__ == "__main__":
    main()
