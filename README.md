# VisionPark YOLOv8

A clean local PyTorch/Ultralytics project for training and running a YOLOv8 vehicle detector.

## Project Layout

- `data/raw/` - put the original dataset splits here
- `data/processed/` - generated YOLO-ready dataset
- `runs/` - Ultralytics training and prediction outputs
- `weights/` - copied best checkpoints for easy reuse

## Expected Dataset Structure

Place the VisDrone splits in a structure like this:

```text
data/raw/VisDrone2019-DET-train/
  images/
  labels/   or annotations/

data/raw/VisDrone2019-DET-val/
  images/
  labels/   or annotations/
```

The training script filters the original VisDrone vehicle classes into a single `vehicle` class.

## Setup

1. Create a virtual environment.
2. Install dependencies:

```bash
pip install -r requirements.txt
```

If you need a CUDA-enabled PyTorch build, install the matching torch wheel for your platform first, then install the rest of the requirements.

## Train

```bash
python train.py --train-dir data/raw/VisDrone2019-DET-train --val-dir data/raw/VisDrone2019-DET-val
```

Useful options:

```bash
python train.py --epochs 100 --imgsz 640 --batch 16 --device 0
```

Training writes the prepared dataset to `data/processed/`, logs to `runs/`, and copies the best checkpoint to `weights/vehicle-yolov8_best.pt`.

## Predict

Run inference on a folder of images or a single image:

```bash
python predict.py --source data/processed/images/val
```

You can also point to any local path:

```bash
python predict.py --source path/to/images --weights weights/vehicle-yolov8_best.pt
```

Predictions are saved under `runs/predict/` by default.
