"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import {
  Upload,
  Trash2,
  Undo2,
  Download,
  MousePointer2,
  Layers,
  CheckCircle2,
  Edit3,
  AlertCircle,
  X,
} from "lucide-react";

type Point = [number, number];
type Slot = {
  id: string;
  points: Point[];
  color: string;
};

const SLOT_COLORS = [
  "#00d4ff", "#00ff88", "#7c3aed", "#f59e0b",
  "#ff6b35", "#e879f9", "#34d399", "#fb7185",
];

export default function AdminPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [hoverPt, setHoverPt] = useState<Point | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [namingSlot, setNamingSlot] = useState(false);
  const [newSlotName, setNewSlotName] = useState("");
  const [pendingPoints, setPendingPoints] = useState<Point[]>([]);
  const [canvasSize, setCanvasSize] = useState({ w: 900, h: 500 });
  const [exportMsg, setExportMsg] = useState("");

  // ── Draw everything on canvas ────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background image or dark placeholder
    if (bgImage) {
      ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
      // Dark overlay to make polygons pop
      ctx.fillStyle = "rgba(5,13,26,0.35)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = "#050d1a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // Grid
      ctx.strokeStyle = "rgba(0,212,255,0.06)";
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 50) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 50) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }
      // Placeholder text
      ctx.fillStyle = "rgba(0,212,255,0.25)";
      ctx.font = "600 16px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Upload a parking lot camera frame to begin", canvas.width / 2, canvas.height / 2 - 10);
      ctx.font = "400 12px Inter, sans-serif";
      ctx.fillStyle = "rgba(0,212,255,0.15)";
      ctx.fillText("Then click to draw polygon vertices around each parking spot", canvas.width / 2, canvas.height / 2 + 16);
    }

    // Draw completed slots
    slots.forEach((slot) => {
      if (slot.points.length < 2) return;
      const isSelected = slot.id === selectedSlot;
      const col = slot.color;

      ctx.beginPath();
      ctx.moveTo(slot.points[0][0], slot.points[0][1]);
      slot.points.slice(1).forEach(([x, y]) => ctx.lineTo(x, y));
      ctx.closePath();

      // Fill
      ctx.fillStyle = isSelected
        ? `${col}35`
        : `${col}18`;
      ctx.fill();

      // Stroke
      ctx.strokeStyle = col;
      ctx.lineWidth = isSelected ? 2.5 : 1.8;
      ctx.setLineDash(isSelected ? [6, 3] : []);
      ctx.stroke();
      ctx.setLineDash([]);

      // Vertices
      slot.points.forEach(([px, py]) => {
        ctx.beginPath();
        ctx.arc(px, py, isSelected ? 5 : 4, 0, Math.PI * 2);
        ctx.fillStyle = col;
        ctx.fill();
        ctx.strokeStyle = "rgba(5,13,26,0.7)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // Label
      const cx = slot.points.reduce((s, p) => s + p[0], 0) / slot.points.length;
      const cy = slot.points.reduce((s, p) => s + p[1], 0) / slot.points.length;
      ctx.font = "bold 12px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Label bg
      const tw = ctx.measureText(slot.id).width + 12;
      ctx.fillStyle = "rgba(5,13,26,0.75)";
      roundRect(ctx, cx - tw / 2, cy - 10, tw, 20, 4);
      ctx.fill();

      ctx.fillStyle = col;
      ctx.fillText(slot.id, cx, cy);
      ctx.textBaseline = "alphabetic";
    });

    // Draw in-progress polygon
    if (currentPoints.length > 0) {
      const col = SLOT_COLORS[slots.length % SLOT_COLORS.length];
      ctx.strokeStyle = col;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(currentPoints[0][0], currentPoints[0][1]);
      currentPoints.slice(1).forEach(([x, y]) => ctx.lineTo(x, y));
      if (hoverPt) ctx.lineTo(hoverPt[0], hoverPt[1]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Vertices
      currentPoints.forEach(([px, py], i) => {
        ctx.beginPath();
        ctx.arc(px, py, i === 0 ? 7 : 5, 0, Math.PI * 2);
        ctx.fillStyle = col;
        ctx.fill();
        if (i === 0) {
          ctx.strokeStyle = "white";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      });
    }
  }, [bgImage, slots, currentPoints, hoverPt, selectedSlot]);

  useEffect(() => { draw(); }, [draw]);

  // ── Image upload ──────────────────────────────────────────────────────────
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const aspectRatio = img.width / img.height;
      const newW = Math.min(900, img.width);
      const newH = newW / aspectRatio;
      setCanvasSize({ w: Math.round(newW), h: Math.round(newH) });
      setBgImage(img);
    };
    img.src = url;
  };

  // ── Canvas click = add point ──────────────────────────────────────────────
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = canvasSize.w / rect.width;
    const scaleY = canvasSize.h / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Click first point = close polygon if we have ≥ 3 points
    if (currentPoints.length >= 3) {
      const [fx, fy] = currentPoints[0];
      const dist = Math.hypot(x - fx, y - fy);
      if (dist < 20) {
        // Close and prompt for name
        setPendingPoints(currentPoints);
        setCurrentPoints([]);
        setNamingSlot(true);
        setNewSlotName(`A${slots.length + 1}`);
        return;
      }
    }
    setCurrentPoints((p) => [...p, [x, y]]);
  };

  const handleCanvasMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = canvasSize.w / rect.width;
    const scaleY = canvasSize.h / rect.height;
    setHoverPt([(e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY]);
  };

  const handleCanvasLeave = () => setHoverPt(null);

  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (currentPoints.length >= 3) {
      setPendingPoints(currentPoints);
      setCurrentPoints([]);
      setNamingSlot(true);
      setNewSlotName(`A${slots.length + 1}`);
    }
  };

  // ── Confirm slot name ────────────────────────────────────────────────────
  const confirmSlot = () => {
    if (!newSlotName.trim() || pendingPoints.length < 3) return;
    const newSlot: Slot = {
      id: newSlotName.trim().toUpperCase(),
      points: pendingPoints,
      color: SLOT_COLORS[slots.length % SLOT_COLORS.length],
    };
    setSlots((s) => [...s, newSlot]);
    setPendingPoints([]);
    setNamingSlot(false);
    setNewSlotName("");
  };

  // ── Delete slot ──────────────────────────────────────────────────────────
  const deleteSlot = (id: string) => {
    setSlots((s) => s.filter((sl) => sl.id !== id));
    if (selectedSlot === id) setSelectedSlot(null);
  };

  // ── Undo last point ──────────────────────────────────────────────────────
  const undoPoint = () => setCurrentPoints((p) => p.slice(0, -1));

  // ── Export JSON ──────────────────────────────────────────────────────────
  const exportJSON = () => {
    if (slots.length === 0) {
      setExportMsg("No slots drawn yet.");
      setTimeout(() => setExportMsg(""), 2000);
      return;
    }
    const config: Record<string, number[][]> = {};
    slots.forEach((s) => { config[s.id] = s.points.map(([x, y]) => [Math.round(x), Math.round(y)]); });
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "slots_config.json"; a.click();
    setExportMsg(`✓ Exported ${slots.length} slot${slots.length > 1 ? "s" : ""}`);
    setTimeout(() => setExportMsg(""), 3000);
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black gradient-text mb-2">Admin Polygon Setup</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          Upload a camera frame · Draw polygons around each parking slot · Export slots_config.json
        </p>
      </div>

      {/* Tool bar */}
      <div className="glass p-4 flex items-center gap-3 flex-wrap">
        {/* Upload */}
        <button
          className="btn-primary flex items-center gap-2"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={15} />
          Upload Frame
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />

        <div className="divider" style={{ width: 1, height: 32, background: 'rgba(0,212,255,0.1)' }} />

        <button
          className="btn-ghost flex items-center gap-2"
          onClick={undoPoint}
          disabled={currentPoints.length === 0}
          style={{ opacity: currentPoints.length === 0 ? 0.4 : 1 }}
        >
          <Undo2 size={15} />
          Undo Vertex
        </button>

        <button
          className="btn-ghost flex items-center gap-2"
          onClick={() => { setCurrentPoints([]); setPendingPoints([]); }}
          disabled={currentPoints.length === 0}
          style={{ opacity: currentPoints.length === 0 ? 0.4 : 1 }}
        >
          <X size={15} />
          Cancel Draw
        </button>

        <div style={{ flex: 1 }} />

        {exportMsg && (
          <span
            className="badge badge-green"
            style={{ fontSize: 12, padding: '6px 14px' }}
          >
            {exportMsg}
          </span>
        )}

        <button
          className="btn-primary flex items-center gap-2"
          onClick={exportJSON}
          style={{
            background: slots.length > 0
              ? 'linear-gradient(135deg, #00ff88 0%, #00d4ff 100%)'
              : 'rgba(0,255,136,0.1)',
            color: slots.length > 0 ? '#000' : 'var(--text-muted)',
          }}
        >
          <Download size={15} />
          Export slots_config.json
        </button>
      </div>

      <div className="flex gap-5" style={{ alignItems: 'flex-start' }}>
        {/* Canvas */}
        <div className="glass flex-1 p-2 overflow-hidden" style={{ minHeight: 520 }}>
          <canvas
            ref={canvasRef}
            width={canvasSize.w}
            height={canvasSize.h}
            className="drawing rounded-xl"
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
            }}
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMove}
            onMouseLeave={handleCanvasLeave}
            onDoubleClick={handleDoubleClick}
          />
        </div>

        {/* Slots panel */}
        <div className="glass flex flex-col" style={{ width: 240, minHeight: 520 }}>
          <div className="p-4 pb-3">
            <div className="flex items-center gap-2">
              <Layers size={15} style={{ color: 'var(--accent-blue)' }} />
              <span style={{ fontWeight: 700, fontSize: 14 }}>Slot Registry</span>
              <span className="badge badge-blue" style={{ marginLeft: 'auto', fontSize: 10 }}>
                {slots.length}
              </span>
            </div>
          </div>
          <div className="divider" />

          {/* Instructions */}
          <div
            className="mx-3 mt-3 mb-2 rounded-xl p-3"
            style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.1)' }}
          >
            <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              <div className="flex items-start gap-2 mb-1">
                <MousePointer2 size={12} style={{ color: 'var(--accent-blue)', marginTop: 2, flexShrink: 0 }} />
                <span>Click to place vertices</span>
              </div>
              <div className="flex items-start gap-2 mb-1">
                <MousePointer2 size={12} style={{ color: 'var(--accent-blue)', marginTop: 2, flexShrink: 0 }} />
                <span>Click 1st dot or double-click to close</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={12} style={{ color: 'var(--accent-green)', marginTop: 2, flexShrink: 0 }} />
                <span>Name the slot → it saves</span>
              </div>
            </div>
          </div>

          {/* In-progress indicator */}
          {currentPoints.length > 0 && (
            <div
              className="mx-3 mb-2 rounded-xl p-3 flex items-center gap-2"
              style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}
            >
              <Edit3 size={13} style={{ color: '#f59e0b' }} />
              <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600 }}>
                Drawing… {currentPoints.length} pts
              </span>
            </div>
          )}

          {/* Slot list */}
          <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2 mt-1">
            {slots.length === 0 ? (
              <div
                className="rounded-xl p-4 text-center"
                style={{ border: '1px dashed rgba(0,212,255,0.1)', marginTop: 8 }}
              >
                <AlertCircle size={20} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No slots drawn yet</div>
              </div>
            ) : (
              slots.map((slot) => (
                <div
                  key={slot.id}
                  onClick={() => setSelectedSlot(slot.id === selectedSlot ? null : slot.id)}
                  className="rounded-xl p-3 flex items-center justify-between cursor-pointer"
                  style={{
                    background: slot.id === selectedSlot ? `${slot.color}12` : 'rgba(0,212,255,0.03)',
                    border: `1px solid ${slot.id === selectedSlot ? slot.color + '40' : 'rgba(0,212,255,0.08)'}`,
                    transition: 'all 0.15s',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 3,
                        background: slot.color,
                        boxShadow: `0 0 6px ${slot.color}`,
                        flexShrink: 0,
                      }}
                    />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{slot.id}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{slot.points.length} vertices</div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteSlot(slot.id); }}
                    className="rounded-lg p-1.5 transition-all"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-red)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>

          {slots.length > 0 && (
            <div className="p-3 pt-0">
              <button
                className="btn-danger w-full flex items-center justify-center gap-2"
                style={{ width: '100%' }}
                onClick={() => { setSlots([]); setSelectedSlot(null); }}
              >
                <Trash2 size={14} />
                Clear All Slots
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Slot naming modal */}
      {namingSlot && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(5,13,26,0.85)', backdropFilter: 'blur(8px)' }}
        >
          <div className="glass-strong p-8 rounded-2xl glow-blue" style={{ width: 380 }}>
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 size={20} style={{ color: 'var(--accent-green)' }} />
              <span style={{ fontWeight: 700, fontSize: 16 }}>Polygon Closed!</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
              Give this parking slot a name (e.g. A1, B3, HANDICAP-1)
            </p>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                SLOT ID
              </label>
              <input
                className="input-dark"
                value={newSlotName}
                onChange={(e) => setNewSlotName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") confirmSlot(); if (e.key === "Escape") { setNamingSlot(false); setCurrentPoints(pendingPoints); } }}
                autoFocus
                style={{ fontSize: 16, fontWeight: 700, textTransform: 'uppercase' }}
              />
            </div>
            <div className="flex gap-3">
              <button
                className="btn-primary flex-1"
                onClick={confirmSlot}
                disabled={!newSlotName.trim()}
              >
                Save Slot
              </button>
              <button
                className="btn-ghost"
                onClick={() => {
                  setNamingSlot(false);
                  setCurrentPoints(pendingPoints);
                  setPendingPoints([]);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper: rounded rect for ctx
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
