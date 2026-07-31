"use client";
import Link from "next/link";
import ParkingMap from "@/components/ParkingMap";
import { useEffect, useState, type ElementType } from "react";
import {
  Car,
  CheckCircle2,
  XCircle,
  Zap,
  Radio,
  Cpu,
  Activity,
  Wifi,
} from "lucide-react";

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  sub,
}: {
  label: string;
  value: string;
  icon: ElementType;
  color: string;
  sub: string;
}) {
  return (
    <div className="glass flex min-h-42 flex-col justify-between rounded-xl border border-slate-800/90 bg-slate-900/50 p-5 backdrop-blur-xl">
      <div className="flex items-center gap-2.5">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-800/80"
          style={{
            color,
            border: `1px solid ${color}26`,
            background: "rgba(15, 23, 42, 0.72)",
          }}
        >
          <Icon size={20} style={{ color }} strokeWidth={2} />
        </div>
        <span style={{ fontSize: 14, color: "var(--text-muted)", letterSpacing: "0.12em", fontWeight: 700 }}>
          {label}
        </span>
      </div>
      <div className="flex flex-1 items-center justify-center">
        <div className="text-4xl font-extrabold leading-none text-white">{value}</div>
      </div>
      <div className="flex flex-col gap-1 text-center">
        <div className="text-sm text-slate-300">{sub}</div>
      </div>
    </div>
  );
}

function SystemRow({ label, value, status }: { label: string; value: string; status: "ok" | "warn" | "off" }) {
  const dotClass = status === "ok" ? "online" : status === "warn" ? "waiting" : "offline";
  return (
    <div className="flex items-center justify-between border-b border-white/8 py-3 last:border-b-0">
      <div className="flex items-center gap-3">
        <span className={`status-dot ${dotClass}`} />
        <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{label}</span>
      </div>
      <span
        style={{
          fontSize: 12,
          color: status === "ok" ? "var(--accent-green)" : status === "warn" ? "#f59e0b" : "var(--text-muted)",
          fontWeight: 600,
        }}
      >
        {value}
      </span>
    </div>
  );
}

export default function OverviewPage() {
  type Slot = {
    id: string;
    status: string;
    points: number[][];
  };

  const [slots, setSlots] = useState<Slot[]>([]);
  const [connected, setConnected] = useState(false);
  const [detections, setDetections] = useState(0);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/slots");
        const data = await res.json();

        if (data.success) {
          setSlots(data.slots);
          setDetections(data.detections);
          setConnected(true);
        }
      } catch {
        setConnected(false);
      }
    };

    fetchSlots();
    const interval = setInterval(fetchSlots, 1000);

    return () => clearInterval(interval);
  }, []);

  const totalSlots = slots.length;
  const occupied = slots.filter((s) => s.status === "Occupied").length;
  const available = totalSlots - occupied;
  const statusLabel = connected ? "Backend Connected" : "Awaiting Backend";

  return (
    <div className="flex flex-col gap-y-8 p-6 lg:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black gradient-text">System Overview</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            VisionPark AI — live monitoring and pipeline status
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 shadow-[0_0_24px_rgba(16,185,129,0.15)]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          <span>{connected ? "Backend Connected" : "Awaiting Backend"}</span>
        </div>
      </div>

      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="TOTAL SLOTS" value={String(totalSlots)} icon={Car} color="#38bdf8" sub="Configured parking slots" />
        <StatCard label="OCCUPIED" value={String(occupied)} icon={XCircle} color="#fb7185" sub="Currently occupied" />
        <StatCard label="AVAILABLE" value={String(available)} icon={CheckCircle2} color="#10b981" sub="Ready for guidance" />
        <StatCard label="INFERENCE" value={String(detections)} icon={Zap} color="#8b5cf6" sub="Detections per refresh" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.6fr_0.9fr]">
        <div className="glass p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Radio size={16} style={{ color: "var(--accent-blue)" }} />
              <span style={{ fontWeight: 700, fontSize: 15 }}>Live Parking Map</span>
            </div>
            <Link href="/live">
              <button className="btn-ghost" style={{ padding: "6px 12px", fontSize: 12 }}>
                Open Full Map →
              </button>
            </Link>
          </div>
          <div
            className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/50"
            style={{ height: 300 }}
          >
            <ParkingMap slots={slots} />
          </div>
        </div>

        <div className="glass p-5 sm:p-6">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
            <Activity size={16} style={{ color: "var(--accent-blue)" }} />
            <span style={{ fontWeight: 700, fontSize: 15 }}>System Status</span>
          </div>
          <div className="flex-1 pt-4">
            <SystemRow label="FastAPI Backend" value={connected ? "Online" : "Offline"} status={connected ? "ok" : "off"} />
            <SystemRow label="WebSocket" value={connected ? "Connected" : "Disconnected"} status={connected ? "ok" : "off"} />
            <SystemRow label="YOLO Model" value="Pending" status="warn" />
            <SystemRow label="Polygon Config" value={slots.length > 0 ? "Loaded" : "Not Loaded"} status={slots.length > 0 ? "ok" : "off"} />
            <SystemRow label="MongoDB" value="Offline" status="off" />
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col gap-3">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-200">
          <Cpu size={16} style={{ color: "var(--accent-blue)" }} />
          <span style={{ fontWeight: 700, fontSize: 15 }}>ML Pipeline Configuration</span>
        </div>
        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Model", value: "YOLOv8n", note: "ultimate_parking_model.pt" },
            { label: "Confidence", value: "conf=0.25", note: "Recall-optimized threshold" },
            { label: "Geometry", value: "3-of-5 pts", note: "Polygon point check" },
            { label: "Debounce", value: "3 seconds", note: "Temporal smoothing window" },
          ].map(({ label, value, note }) => (
            <div key={label} className="flex flex-col gap-1 rounded-lg border border-slate-800 bg-slate-900/40 p-4 backdrop-blur-xl">
              <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.12em", fontWeight: 700 }}>
                {label.toUpperCase()}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--accent-blue)" }}>{value}</div>
              <div className="truncate" style={{ fontSize: 12, color: "var(--text-secondary)" }}>{note}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
