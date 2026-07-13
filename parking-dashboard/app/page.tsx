"use client";
import Link from "next/link";
import {
  Car,
  CheckCircle2,
  XCircle,
  Zap,
  Settings2,
  Radio,
  BarChart3,
  Navigation2,
  ArrowRight,
  Cpu,
  Activity,
  AlertCircle,
} from "lucide-react";

function StatCard({
  label,
  value,
  unit,
  icon: Icon,
  color,
  glowClass,
  sub,
}: {
  label: string;
  value: string;
  unit?: string;
  icon: React.ElementType;
  color: string;
  glowClass: string;
  sub: string;
}) {
  return (
    <div className={`glass perspective-card ${glowClass} p-6 flex flex-col gap-4`} style={{ minHeight: 160 }}>
      <div className="flex items-start justify-between">
        <div
          className="rounded-xl flex items-center justify-center"
          style={{
            width: 44,
            height: 44,
            background: `${color}15`,
            border: `1px solid ${color}30`,
          }}
        >
          <Icon size={22} style={{ color }} strokeWidth={2} />
        </div>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.06em', fontWeight: 600 }}>
          {label}
        </span>
      </div>
      <div>
        <div className="flex items-end gap-1">
          <span style={{ fontSize: 36, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
            {value}
          </span>
          {unit && <span style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 4 }}>{unit}</span>}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>{sub}</div>
      </div>
    </div>
  );
}

function QuickNavCard({
  href,
  icon: Icon,
  label,
  description,
  color,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  description: string;
  color: string;
}) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div
        className="glass perspective-card group p-5 cursor-pointer"
        style={{ border: '1px solid transparent', transition: 'border-color 0.2s' }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = `${color}30`)}
        onMouseLeave={e => (e.currentTarget.style.borderColor = 'transparent')}
      >
        <div className="flex items-center justify-between mb-3">
          <div
            className="rounded-xl flex items-center justify-center"
            style={{
              width: 40,
              height: 40,
              background: `${color}12`,
              border: `1px solid ${color}25`,
            }}
          >
            <Icon size={20} style={{ color }} strokeWidth={2} />
          </div>
          <ArrowRight
            size={16}
            style={{ color: 'var(--text-muted)', transition: 'transform 0.2s, color 0.2s' }}
            className="group-hover:translate-x-1"
          />
        </div>
        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{description}</div>
      </div>
    </Link>
  );
}

function SystemRow({ label, value, status }: { label: string; value: string; status: "ok" | "warn" | "off" }) {
  const dotClass = status === "ok" ? "online" : status === "warn" ? "waiting" : "offline";
  return (
    <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid rgba(0,212,255,0.05)' }}>
      <div className="flex items-center gap-3">
        <span className={`status-dot ${dotClass}`} />
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
      </div>
      <span style={{ fontSize: 12, color: status === "ok" ? 'var(--accent-green)' : status === "warn" ? '#f59e0b' : 'var(--text-muted)', fontWeight: 600 }}>
        {value}
      </span>
    </div>
  );
}

export default function OverviewPage() {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-black gradient-text mb-2">System Overview</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Smart Parking AI — Real-time intelligence dashboard
          </p>
        </div>
        <div
          className="glass rounded-2xl px-5 py-3 flex items-center gap-3"
        >
          <span className="status-dot waiting" />
          <div>
            <div style={{ fontSize: 12, color: '#f59e0b', fontWeight: 600 }}>Awaiting Backend</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>ws://localhost:8000/ws</div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-5">
        <StatCard
          label="TOTAL SLOTS"
          value="—"
          icon={Car}
          color="#00d4ff"
          glowClass="glow-blue"
          sub="Load slots_config.json to populate"
        />
        <StatCard
          label="OCCUPIED"
          value="—"
          icon={XCircle}
          color="#ff3b5c"
          glowClass="glow-red"
          sub="Backend connection required"
        />
        <StatCard
          label="AVAILABLE"
          value="—"
          icon={CheckCircle2}
          color="#00ff88"
          glowClass="glow-green"
          sub="Backend connection required"
        />
        <StatCard
          label="INFERENCE"
          value="—"
          unit="FPS"
          icon={Zap}
          color="#7c3aed"
          glowClass="glow-purple"
          sub="YOLOv8n inference speed"
        />
      </div>

      {/* Middle section */}
      <div className="grid grid-cols-3 gap-5">
        {/* Live map skeleton */}
        <div className="col-span-2 glass p-6" style={{ minHeight: 280 }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Radio size={16} style={{ color: 'var(--accent-blue)' }} />
              <span style={{ fontWeight: 700, fontSize: 15 }}>Live Parking Map</span>
            </div>
            <Link href="/live">
              <button className="btn-ghost" style={{ padding: '6px 14px', fontSize: 12 }}>
                Open Full Map →
              </button>
            </Link>
          </div>
          {/* Skeleton map */}
          <div
            className="rounded-xl flex flex-col items-center justify-center gap-3"
            style={{
              height: 200,
              background: 'rgba(0,212,255,0.03)',
              border: '1px dashed rgba(0,212,255,0.15)',
            }}
          >
            <div
              className="rounded-full flex items-center justify-center"
              style={{
                width: 56,
                height: 56,
                background: 'rgba(0,212,255,0.08)',
                border: '1px solid rgba(0,212,255,0.15)',
              }}
            >
              <AlertCircle size={24} style={{ color: 'var(--text-muted)' }} />
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 600 }}>
              WebSocket Not Connected
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', maxWidth: 280 }}>
              The live map will render here once the FastAPI backend is running and{" "}
              <code style={{ color: 'var(--accent-blue)', fontSize: 11 }}>slots_config.json</code> is loaded
            </div>
            <Link href="/admin">
              <button className="btn-primary" style={{ marginTop: 4 }}>
                Set Up Polygon Map First
              </button>
            </Link>
          </div>
        </div>

        {/* System status */}
        <div className="glass p-6">
          <div className="flex items-center gap-2 mb-5">
            <Activity size={16} style={{ color: 'var(--accent-blue)' }} />
            <span style={{ fontWeight: 700, fontSize: 15 }}>System Status</span>
          </div>
          <div>
            <SystemRow label="FastAPI Backend" value="Offline" status="off" />
            <SystemRow label="WebSocket" value="Disconnected" status="off" />
            <SystemRow label="YOLO Model" value="Pending" status="warn" />
            <SystemRow label="Polygon Config" value="Not Loaded" status="off" />
            <SystemRow label="PostgreSQL DB" value="Offline" status="off" />
          </div>
          <div className="mt-5">
            <div
              className="rounded-xl p-3 text-center"
              style={{
                background: 'rgba(245,158,11,0.06)',
                border: '1px solid rgba(245,158,11,0.15)',
              }}
            >
              <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600, marginBottom: 3 }}>
                Backend work in progress
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                Plug in when FastAPI is ready at port 8000
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick access cards */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 16 }}>
          QUICK ACCESS
        </div>
        <div className="grid grid-cols-4 gap-4">
          <QuickNavCard
            href="/admin"
            icon={Settings2}
            label="Admin Setup"
            description="Draw parking polygons and export slots_config.json"
            color="#00d4ff"
          />
          <QuickNavCard
            href="/live"
            icon={Radio}
            label="Live Map"
            description="Real-time slot occupancy from the AI inference engine"
            color="#00ff88"
          />
          <QuickNavCard
            href="/analytics"
            icon={BarChart3}
            label="Analytics"
            description="Peak hour heatmaps, occupancy trends, revenue stats"
            color="#7c3aed"
          />
          <QuickNavCard
            href="/navigate"
            icon={Navigation2}
            label="Wayfinding"
            description="A* routing to guide drivers to the nearest free slot"
            color="#f59e0b"
          />
        </div>
      </div>

      {/* Pipeline info */}
      <div className="glass p-6">
        <div className="flex items-center gap-2 mb-5">
          <Cpu size={16} style={{ color: 'var(--accent-blue)' }} />
          <span style={{ fontWeight: 700, fontSize: 15 }}>ML Pipeline Configuration</span>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Model", value: "YOLOv8n", note: "ultimate_parking_model.pt" },
            { label: "Confidence", value: "conf=0.25", note: "Recall-optimized threshold" },
            { label: "Geometry", value: "3-of-5 pts", note: "Polygon point check" },
            { label: "Debounce", value: "3 seconds", note: "Temporal smoothing window" },
          ].map(({ label, value, note }) => (
            <div
              key={label}
              className="rounded-xl p-4"
              style={{
                background: 'rgba(0,212,255,0.04)',
                border: '1px solid rgba(0,212,255,0.08)',
              }}
            >
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.08em', fontWeight: 600 }}>
                {label.toUpperCase()}
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent-blue)', marginBottom: 4 }}>{value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{note}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
