import cv2
import json
import time
import numpy as np
from ultralytics import YOLO
from collections import defaultdict

# ─────────────────────────────────────────────────────────────────────────────
# CONFIGURATION
# ─────────────────────────────────────────────────────────────────────────────
CONFIDENCE_THRESHOLD = 0.25   # Low threshold → maximize Recall (per PDF plan)
TEMPORAL_SMOOTHING_SECS = 3.0  # Car must stay inside polygon for 3s before state change
POINTS_REQUIRED = 3            # 3-of-5 point rule: at least 3 points must be inside


class CloudParkingInference:
    def __init__(self, model_path="ultimate_parking_model.pt", config_path="slots_config.json"):
        """
        Initializes the AI model and loads the parking lot geometry.

        Args:
            model_path: Path to the trained YOLOv8 weights file.
                        Defaults to 'ultimate_parking_model.pt' (the custom-trained model).
                        Falls back gracefully to 'yolov8n.pt' for quick testing.
            config_path: Path to the slots_config.json produced by the Polygon Tool.
        """
        print(f"[INFO] Loading YOLO model from: {model_path}")
        self.model = YOLO(model_path)

        print(f"[INFO] Loading parking slots geometry from: {config_path}")
        try:
            with open(config_path, "r") as f:
                self.slots = json.load(f)
            print(f"[INFO] Loaded {len(self.slots)} parking slots.")
        except FileNotFoundError:
            print(f"[WARNING] '{config_path}' not found. Run the Polygon Tool to generate it.")
            self.slots = {}

        # ── Since the model was trained with Class 0 = Vehicle (universal),
        #    we check for class 0. If using a stock COCO model for quick testing,
        #    COCO vehicle class IDs are: 2=car, 3=motorcycle, 5=bus, 7=truck.
        self.universal_model = True  # Set False if using a raw COCO yolov8n.pt
        self.coco_vehicle_classes = [2, 3, 5, 7]

        # ── Temporal Smoothing State Machine ──────────────────────────────────
        # Tracks when each slot FIRST entered a candidate state change.
        # { slot_id: { "candidate": "OCCUPIED"/"EMPTY", "since": timestamp } }
        self._pending_state = defaultdict(lambda: {"candidate": None, "since": None})

        # Confirmed stable states (what we broadcast / return)
        self._confirmed_state = {slot_id: "EMPTY" for slot_id in self.slots}

    # ─────────────────────────────────────────────────────────────────────────
    # INTERNAL HELPERS
    # ─────────────────────────────────────────────────────────────────────────

    def _extract_5_points(self, x1, y1, x2, y2):
        """
        Extracts 5 representative points from a YOLO bounding box.
        Returns: [(top-left), (top-right), (bottom-left), (bottom-right), (center)]
        """
        cx = (x1 + x2) / 2
        cy = (y1 + y2) / 2
        return [
            (x1, y1),   # Top-Left
            (x2, y1),   # Top-Right
            (x1, y2),   # Bottom-Left
            (x2, y2),   # Bottom-Right
            (cx, cy),   # Center
        ]

    def _is_vehicle(self, class_id):
        """Checks if a detected class is a vehicle, depending on model type."""
        if self.universal_model:
            return class_id == 0  # Class 0 = Vehicle in the trained model
        return class_id in self.coco_vehicle_classes

    def _check_slot_occupancy(self, polygon_contour, vehicle_boxes):
        """
        Implements the 3-of-5 Point Geometric Verification rule.

        For every detected vehicle bounding box, extracts 5 points and counts
        how many fall inside the polygon. If any vehicle gets ≥ 3 points inside,
        the slot is OCCUPIED.

        Args:
            polygon_contour: numpy array contour for cv2.pointPolygonTest
            vehicle_boxes:   list of (x1, y1, x2, y2) tuples for each detected vehicle

        Returns:
            True if slot is occupied, False otherwise.
        """
        for (x1, y1, x2, y2) in vehicle_boxes:
            points = self._extract_5_points(x1, y1, x2, y2)
            hits = 0
            for pt in points:
                result = cv2.pointPolygonTest(polygon_contour, pt, False)
                if result >= 0:  # >= 0 means on edge or inside
                    hits += 1
            if hits >= POINTS_REQUIRED:
                return True  # This vehicle is definitively inside the slot
        return False

    def _apply_temporal_smoothing(self, slot_id, raw_occupied):
        """
        State-machine debouncer. A slot's state only officially changes after
        the new state has been stable for TEMPORAL_SMOOTHING_SECS seconds.

        This prevents 'drive-by flicker' where a car passing through an aisle
        momentarily triggers an OCCUPIED reading.

        Returns:
            Confirmed state string: "OCCUPIED" or "EMPTY"
        """
        candidate = "OCCUPIED" if raw_occupied else "EMPTY"
        current_confirmed = self._confirmed_state.get(slot_id, "EMPTY")
        pending = self._pending_state[slot_id]
        now = time.time()

        if candidate == current_confirmed:
            # State is stable — reset any pending transition
            pending["candidate"] = None
            pending["since"] = None
            return current_confirmed

        # State differs from confirmed — start or continue tracking the transition
        if pending["candidate"] != candidate:
            # New transition candidate — start the clock
            pending["candidate"] = candidate
            pending["since"] = now
        else:
            # Candidate has been consistent — check if enough time has passed
            elapsed = now - pending["since"]
            if elapsed >= TEMPORAL_SMOOTHING_SECS:
                print(f"  [STATE CHANGE] Slot {slot_id}: {current_confirmed} → {candidate} "
                      f"(stable for {elapsed:.1f}s)")
                self._confirmed_state[slot_id] = candidate
                pending["candidate"] = None
                pending["since"] = None
                return candidate

        # Still within debounce window — return last confirmed state
        return current_confirmed

    # ─────────────────────────────────────────────────────────────────────────
    # PUBLIC API
    # ─────────────────────────────────────────────────────────────────────────

    def process_frame(self, image, output_path=None):
        """
        Core processing function. Accepts a raw OpenCV image (numpy array).
        This is what the backend loop calls 30x per second.

        Args:
            image:       OpenCV BGR image (numpy array)
            output_path: Optional path to save a debug visualization JPEG

        Returns:
            status_report: dict like { "A1": "OCCUPIED", "B2": "EMPTY", ... }
                           Contains only CONFIRMED (debounced) states.
        """
        if image is None:
            raise ValueError("[ERROR] process_frame received a None image.")

        # ── Step 1: Run YOLO inference ────────────────────────────────────────
        results = self.model(image, conf=CONFIDENCE_THRESHOLD, verbose=False)[0]

        # ── Step 2: Extract all vehicle bounding boxes ────────────────────────
        vehicle_boxes = []
        for box in results.boxes:
            class_id = int(box.cls[0])
            if self._is_vehicle(class_id):
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                vehicle_boxes.append((float(x1), float(y1), float(x2), float(y2)))

        # ── Step 3: Geometry check + temporal smoothing per slot ──────────────
        status_report = {}
        debug_image = image.copy() if output_path else None

        for slot_id, coords in self.slots.items():
            polygon = np.array(coords, np.int32).reshape((-1, 1, 2))

            # 3-of-5 point geometric check (raw, unsmoothed)
            raw_occupied = self._check_slot_occupancy(polygon, vehicle_boxes)

            # Apply temporal smoothing to get stable confirmed state
            confirmed_state = self._apply_temporal_smoothing(slot_id, raw_occupied)
            status_report[slot_id] = confirmed_state

            # ── Debug visualization ───────────────────────────────────────────
            if debug_image is not None:
                color = (0, 0, 255) if confirmed_state == "OCCUPIED" else (0, 255, 0)
                cv2.polylines(debug_image, [polygon], isClosed=True, color=color, thickness=3)

                # Fill polygon with semi-transparent overlay
                overlay = debug_image.copy()
                cv2.fillPoly(overlay, [polygon], color)
                cv2.addWeighted(overlay, 0.2, debug_image, 0.8, 0, debug_image)

                # Draw slot ID label at polygon centroid
                M = cv2.moments(polygon)
                if M["m00"] != 0:
                    cx = int(M["m10"] / M["m00"])
                    cy = int(M["m01"] / M["m00"])
                    cv2.putText(debug_image, slot_id, (cx - 15, cy),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.65, (255, 255, 255), 2)

        # ── Draw all 5 verification points for each vehicle ───────────────────
        if debug_image is not None:
            for (x1, y1, x2, y2) in vehicle_boxes:
                pts = self._extract_5_points(x1, y1, x2, y2)
                # Draw bounding box
                cv2.rectangle(debug_image, (int(x1), int(y1)), (int(x2), int(y2)),
                               (255, 165, 0), 2)  # Orange box
                # Draw the 5 test points
                for pt in pts:
                    cv2.circle(debug_image, (int(pt[0]), int(pt[1])), 5, (0, 255, 255), -1)  # Cyan dots

            cv2.imwrite(output_path, debug_image)
            print(f"[DEBUG] Visualization saved → {output_path}")

        return status_report

    def process_image(self, image_path, output_path="debug_output.jpg"):
        """
        Convenience wrapper: loads an image from disk and calls process_frame().
        Used for single-image testing before the live RTSP backend is wired up.

        Args:
            image_path:  Path to input image file
            output_path: Path to save debug visualization

        Returns:
            status_report dict
        """
        print(f"[INFO] Reading image from: {image_path}")
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"[ERROR] Could not read image at '{image_path}'")
        return self.process_frame(image, output_path=output_path)

    def get_confirmed_states(self):
        """Returns the current confirmed (debounced) state of all slots."""
        return dict(self._confirmed_state)


# ─────────────────────────────────────────────────────────────────────────────
# QUICK TEST (run directly: python cloud_inference.py)
# ─────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import os

    print("=" * 60)
    print("  Smart Parking — Inference Engine Test")
    print("=" * 60)

    # Try ultimate_parking_model.pt first, fall back to yolov8n.pt for testing
    model_file = "ultimate_parking_model.pt"
    if not os.path.exists(model_file):
        print(f"[WARNING] '{model_file}' not found. Falling back to yolov8n.pt for testing.")
        print("          Place your friend's model file here as 'ultimate_parking_model.pt'")
        model_file = "yolov8n.pt"

    engine = CloudParkingInference(model_path=model_file, config_path="slots_config.json")

    # If using COCO fallback model, switch to COCO class IDs
    if model_file == "yolov8n.pt":
        engine.universal_model = False

    test_image = "test_frame.jpg"
    if os.path.exists(test_image) and engine.slots:
        print(f"\n[TEST] Processing '{test_image}'...")
        results = engine.process_image(test_image, output_path="debug_output.jpg")

        print("\n=== SLOT STATUS REPORT ===")
        for slot, state in sorted(results.items()):
            icon = "🔴" if state == "OCCUPIED" else "🟢"
            print(f"  {icon}  {slot:>6} → {state}")

        occupied = sum(1 for s in results.values() if s == "OCCUPIED")
        total = len(results)
        print(f"\n  Summary: {occupied}/{total} slots OCCUPIED  |  {total - occupied}/{total} EMPTY")
        print(f"\n[OUTPUT] Debug image saved → debug_output.jpg")
    else:
        print(f"\n[SETUP REQUIRED]")
        print(f"  1. Place 'ultimate_parking_model.pt' from your friend in this folder")
        print(f"  2. Place a test camera frame as 'test_frame.jpg'")
        print(f"  3. Run the Polygon Tool to generate 'slots_config.json'")
        print(f"  Then re-run this script.")
