"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import { astar, DEMO_GRAPH, SLOT_IDS, type Node } from "@/lib/astar";
import {
  Navigation2,
  Zap,
  AlertCircle,
  RotateCcw,
  MapPin,
  Info,
} from "lucide-react";

type SlotStatus = "empty" | "occupied";

const CANVAS_W = 760;
const CANVAS_H = 520;
const SLOT_R = 22;

// Draw helpers
function drawArrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const len = 10;
  ctx.beginPath();
  ctx.moveTo(x2 - len * Math.cos(angle - 0.4), y2 - len * Math.sin(angle - 0.4));
  ctx.lineTo(x2, y2);
  ctx.lineTo(x2 - len * Math.cos(angle + 0.4), y2 - len * Math.sin(angle + 0.4));
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
}

export default function NavigatePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // All slots start as empty in the demo
  const [slotStatus, setSlotStatus] = useState<Record<string, SlotStatus>>(() =>
    Object.fromEntries(SLOT_IDS.map((id) => [id, "empty"]))
  );
  const [path, setPath] = useState<string[] | null>(null);
  const [targetSlot, setTargetSlot] = useState<string | null>(null);
  const [routeRerouted, setRouteRerouted] = useState(false);
  const [instructions, setInstructions] = useState<string[]>([]);
  const [animOffset, setAnimOffset] = useState(0);

  // Animate dash offset for route
  useEffect(() => {
    if (!path) return;
    const interval = setInterval(() => {
      setAnimOffset((o) => (o - 1) % 20);
    }, 40);
    return () => clearInterval(interval);
  }, [path]);

  // ── Canvas draw ─────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    // Background
    ctx.fillStyle = "#050d1a";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Grid
    ctx.strokeStyle = "rgba(0,212,255,0.05)";
    ctx.lineWidth = 1;
    for (let x = 0; x < CANVAS_W; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_H); ctx.stroke();
    }
    for (let y = 0; y < CANVAS_H; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_W, y); ctx.stroke();
    }

    const nodes = DEMO_GRAPH.nodes;

    // Draw aisle edges
    ctx.strokeStyle = "rgba(0,212,255,0.1)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    for (const edge of DEMO_GRAPH.edges) {
      const a = nodes[edge.from];
      const b = nodes[edge.to];
      if (!a || !b) continue;
      if (a.type === "slot" || b.type === "slot") continue;
      ctx.beginPath();
      ctx.moveTo(a.x + 50, a.y + 50);
      ctx.lineTo(b.x + 50, b.y + 50);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Draw A* route path
    if (path && path.length > 1) {
      ctx.save();
      ctx.shadowColor = "#00d4ff";
      ctx.shadowBlur = 12;
      ctx.strokeStyle = "#00d4ff";
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 4]);
      ctx.lineDashOffset = animOffset;
      ctx.beginPath();
      const first = nodes[path[0]];
      ctx.moveTo(first.x + 50, first.y + 50);
      for (let i = 1; i < path.length; i++) {
        const n = nodes[path[i]];
        ctx.lineTo(n.x + 50, n.y + 50);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // Arrows along the path
      for (let i = 1; i < path.length; i++) {
        const prev = nodes[path[i - 1]];
        const curr = nodes[path[i]];
        const mx = (prev.x + curr.x) / 2 + 50;
        const my = (prev.y + curr.y) / 2 + 50;
        drawArrow(ctx, prev.x + 50, prev.y + 50, mx, my, "#00d4ff");
      }
    }

    // Draw slots
    SLOT_IDS.forEach((id) => {
      const node = nodes[id];
      if (!node) return;
      const occupied = slotStatus[id] === "occupied";
      const isTarget = id === targetSlot;
      const x = node.x + 50;
      const y = node.y + 50;

      // Slot rectangle
      const w = 36, h = 24;
      ctx.save();
      if (isTarget) {
        ctx.shadowColor = "#00d4ff";
        ctx.shadowBlur = 20;
      } else if (occupied) {
        ctx.shadowColor = "#ff3b5c";
        ctx.shadowBlur = 10;
      } else {
        ctx.shadowColor = "#00ff88";
        ctx.shadowBlur = 6;
      }

      ctx.fillStyle = isTarget
        ? "rgba(0,212,255,0.3)"
        : occupied
        ? "rgba(255,59,92,0.3)"
        : "rgba(0,255,136,0.15)";
      ctx.strokeStyle = isTarget ? "#00d4ff" : occupied ? "#ff3b5c" : "#00ff88";
      ctx.lineWidth = isTarget ? 2.5 : 1.5;
      ctx.beginPath();
      ctx.roundRect(x - w / 2, y - h / 2, w, h, 4);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Slot label
      ctx.font = "bold 9px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = isTarget ? "#00d4ff" : occupied ? "#ff3b5c" : "#00ff88";
      ctx.fillText(id, x, y);
    });

    // Waypoint dots
    Object.values(nodes).forEach((node) => {
      if (node.type !== "waypoint") return;
      const x = node.x + 50;
      const y = node.y + 50;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,212,255,0.2)";
      ctx.fill();
    });

    // Entrance
    const ent = nodes["entrance"];
    const ex = ent.x + 50, ey = ent.y + 50;
    ctx.save();
    ctx.shadowColor = "#f59e0b";
    ctx.shadowBlur = 16;
    ctx.fillStyle = "rgba(245,158,11,0.2)";
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ex, ey, 14, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    ctx.restore();
    ctx.font = "bold 9px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#f59e0b";
    ctx.fillText("IN", ex, ey);

    // Labels
    ctx.font = "500 10px Inter, sans-serif";
    ctx.fillStyle = "rgba(0,212,255,0.3)";
    ctx.textAlign = "center";
    ctx.fillText("▲ ROW D", CANVAS_W / 2, 20);
    ctx.fillText("ROW C", CANVAS_W / 2, 120);
    ctx.fillText("ROW B", CANVAS_W / 2, 220);
    ctx.fillText("ROW A", CANVAS_W / 2, 320);
    ctx.fillText("ENTRANCE", CANVAS_W / 2, 470);
  }, [slotStatus, path, targetSlot, animOffset]);

  useEffect(() => { draw(); }, [draw]);

  // ── Find nearest empty slot ─────────────────────────────────────────────
  const findBestSlot = useCallback(() => {
    setRouteRerouted(false);
    const emptySlots = SLOT_IDS.filter((id) => slotStatus[id] === "empty");
    if (emptySlots.length === 0) {
      setPath(null);
      setTargetSlot(null);
      setInstructions(["No empty slots available."]);
      return;
    }

    // Find the closest empty slot from entrance
    let bestSlot = "";
    let bestResult: ReturnType<typeof astar> = null;

    for (const slotId of emptySlots) {
      const result = astar(DEMO_GRAPH, "entrance", slotId);
      if (result && (!bestResult || result.cost < bestResult.cost)) {
        bestResult = result;
        bestSlot = slotId;
      }
    }

    if (bestResult) {
      setPath(bestResult.path);
      setTargetSlot(bestSlot);
      buildInstructions(bestResult.path, bestSlot);
    }
  }, [slotStatus]);

  const buildInstructions = (p: string[], target: string) => {
    const steps: string[] = ["Start at Entrance"];
    for (let i = 1; i < p.length; i++) {
      const n = DEMO_GRAPH.nodes[p[i]];
      if (n.type === "waypoint") steps.push(`Continue through aisle`);
      else if (n.type === "slot") steps.push(`🅿️ Park in Slot ${n.id}`);
    }
    steps.push(`✅ Arrived at Slot ${target}`);
    setInstructions(steps);
  };

  // ── Toggle slot (demo occupancy control) ───────────────────────────────
  const toggleSlot = (id: string) => {
    setSlotStatus((s) => {
      const newStatus: Record<string, SlotStatus> = { ...s, [id]: s[id] === "empty" ? "occupied" : "empty" };

      // Live reroute: if the target slot just got occupied, find a new one
      if (targetSlot && newStatus[targetSlot] === "occupied" && path) {
        setTimeout(() => {
          setRouteRerouted(true);
          const emptySlots = SLOT_IDS.filter((sid) => newStatus[sid] === "empty");
          let best: ReturnType<typeof astar> = null;
          let bestSlot = "";
          for (const slotId of emptySlots) {
            const r = astar(DEMO_GRAPH, "entrance", slotId);
            if (r && (!best || r.cost < best.cost)) { best = r; bestSlot = slotId; }
          }
          if (best) {
            setPath(best.path);
            setTargetSlot(bestSlot);
            buildInstructions(best.path, bestSlot);
          } else {
            setPath(null); setTargetSlot(null); setInstructions(["No empty slots — all occupied."]);
          }
        }, 400);
      }

      return newStatus;
    });
  };

  const reset = () => {
    setSlotStatus(Object.fromEntries(SLOT_IDS.map((id) => [id, "empty"])));
    setPath(null); setTargetSlot(null); setInstructions([]); setRouteRerouted(false);
  };

  const emptyCount = SLOT_IDS.filter((id) => slotStatus[id] === "empty").length;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-black gradient-text mb-2">Driver Navigation</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            A* pathfinding — shortest route from entrance to nearest available slot
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-ghost flex items-center gap-2" onClick={reset}>
            <RotateCcw size={14} />
            Reset
          </button>
          <button
            className="btn-primary flex items-center gap-2"
            onClick={findBestSlot}
            disabled={emptyCount === 0}
            style={{ opacity: emptyCount === 0 ? 0.5 : 1 }}
          >
            <Navigation2 size={15} />
            Find Me a Spot
          </button>
        </div>
      </div>

      {/* Live reroute banner */}
      {routeRerouted && (
        <div
          className="glass rounded-2xl p-4 flex items-center gap-3"
          style={{ borderColor: 'rgba(255,59,92,0.3)', background: 'rgba(255,59,92,0.05)' }}
        >
          <Zap size={18} style={{ color: 'var(--accent-red)' }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--accent-red)' }}>
              Live Reroute! Target slot was taken
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              A* instantly recalculated the best available route → navigating to{" "}
              <strong style={{ color: 'var(--accent-blue)' }}>Slot {targetSlot}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Backend notice */}
      <div
        className="glass rounded-xl p-3 flex items-center gap-3"
        style={{ borderColor: 'rgba(245,158,11,0.15)' }}
      >
        <Info size={14} style={{ color: '#f59e0b', flexShrink: 0 }} />
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          <strong style={{ color: '#f59e0b' }}>Demo mode:</strong> Click any slot below to toggle its occupancy and test live rerouting.
          In production, slot states come from the FastAPI WebSocket.
        </div>
      </div>

      <div className="flex gap-5" style={{ alignItems: 'flex-start' }}>
        {/* Canvas map */}
        <div className="glass flex-1 p-2">
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 12 }}
          />
        </div>

        {/* Side panel */}
        <div className="flex flex-col gap-4" style={{ width: 240 }}>
          {/* Stats */}
          <div className="glass p-4 space-y-3">
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.08em' }}>
              SLOT STATUS
            </div>
            {[
              { label: "Available", count: emptyCount, color: "#00ff88" },
              { label: "Occupied", count: SLOT_IDS.length - emptyCount, color: "#ff3b5c" },
              { label: "Total", count: SLOT_IDS.length, color: "#00d4ff" },
            ].map(({ label, count, color }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
                </div>
                <span style={{ fontSize: 16, fontWeight: 700, color }}>{count}</span>
              </div>
            ))}
          </div>

          {/* Route info */}
          {targetSlot && (
            <div
              className="glass p-4"
              style={{ borderColor: 'rgba(0,212,255,0.25)', background: 'rgba(0,212,255,0.04)' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={14} style={{ color: 'var(--accent-blue)' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-blue)' }}>
                  TARGET SLOT
                </span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--accent-blue)', marginBottom: 4 }}>
                {targetSlot}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {path ? `Route: ${path.length} waypoints` : "—"}
              </div>
            </div>
          )}

          {/* Turn-by-turn */}
          {instructions.length > 0 && (
            <div className="glass p-4">
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 12 }}>
                TURN-BY-TURN
              </div>
              <ol className="space-y-2">
                {instructions.map((step, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        background: i === instructions.length - 1 ? 'rgba(0,255,136,0.15)' : 'rgba(0,212,255,0.1)',
                        border: `1px solid ${i === instructions.length - 1 ? 'rgba(0,255,136,0.3)' : 'rgba(0,212,255,0.2)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        fontSize: 9,
                        fontWeight: 700,
                        color: i === instructions.length - 1 ? 'var(--accent-green)' : 'var(--accent-blue)',
                        marginTop: 1,
                      }}
                    >
                      {i + 1}
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Slot toggle panel */}
          <div className="glass p-4">
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 10 }}>
              TOGGLE SLOTS (DEMO)
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {SLOT_IDS.map((id) => {
                const occ = slotStatus[id] === "occupied";
                const isTgt = id === targetSlot;
                return (
                  <button
                    key={id}
                    onClick={() => toggleSlot(id)}
                    style={{
                      padding: '5px 2px',
                      borderRadius: 6,
                      border: `1px solid ${isTgt ? 'rgba(0,212,255,0.5)' : occ ? 'rgba(255,59,92,0.3)' : 'rgba(0,255,136,0.2)'}`,
                      background: isTgt ? 'rgba(0,212,255,0.15)' : occ ? 'rgba(255,59,92,0.15)' : 'rgba(0,255,136,0.08)',
                      color: isTgt ? '#00d4ff' : occ ? '#ff3b5c' : '#00ff88',
                      fontSize: 9,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {id}
                  </button>
                );
              })}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5 }}>
              Click a slot to toggle occupied/empty. If your target gets taken, watch the route reroute automatically.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
