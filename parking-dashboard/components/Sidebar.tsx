"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Settings2,
  Radio,
  BarChart3,
  Navigation2,
  Cpu,
  ChevronRight,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/",          icon: LayoutDashboard, label: "Overview",    desc: "System summary" },
  { href: "/admin",     icon: Settings2,        label: "Admin Setup", desc: "Polygon mapping" },
  { href: "/live",      icon: Radio,            label: "Live Map",    desc: "Real-time slots" },
  { href: "/analytics", icon: BarChart3,        label: "Analytics",   desc: "Peak hours & trends" },
  { href: "/navigate",  icon: Navigation2,      label: "Navigate",    desc: "A* wayfinding" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="glass-strong flex flex-col relative z-20 shrink-0"
      style={{
        width: '240px',
        height: '100vh',
        borderRight: '1px solid rgba(0,212,255,0.1)',
        borderRadius: 0,
      }}
    >
      {/* Logo */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center rounded-xl glow-blue"
            style={{
              width: 40,
              height: 40,
              background: 'linear-gradient(135deg, #00d4ff 0%, #0066ff 100%)',
            }}
          >
            <Cpu size={20} color="#000" strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-bold text-sm gradient-text" style={{ letterSpacing: '0.05em' }}>
              SmartPark
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
              AI SYSTEM v2.0
            </div>
          </div>
        </div>
      </div>

      <div className="divider mx-4 mb-4" />

      {/* System status */}
      <div
        className="mx-4 mb-5 rounded-xl p-3 flex items-center gap-3"
        style={{
          background: 'rgba(0,255,136,0.04)',
          border: '1px solid rgba(0,255,136,0.1)',
        }}
      >
        <span className="status-dot waiting" />
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#f59e0b' }}>Backend Offline</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Awaiting ws://localhost:8000</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.1em', padding: '0 12px 8px' }}>
          NAVIGATION
        </div>
        {NAV_ITEMS.map(({ href, icon: Icon, label, desc }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link key={href} href={href} className={`nav-link ${active ? "active" : ""}`}>
              <Icon size={18} strokeWidth={active ? 2.5 : 2} />
              <div className="flex-1 min-w-0">
                <div style={{ fontSize: 13, fontWeight: active ? 600 : 500 }}>{label}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>{desc}</div>
              </div>
              {active && <ChevronRight size={14} style={{ color: 'var(--accent-blue)', opacity: 0.7 }} />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4">
        <div className="divider mb-4" />
        <div
          className="rounded-xl p-3"
          style={{
            background: 'rgba(0,212,255,0.04)',
            border: '1px solid rgba(0,212,255,0.08)',
          }}
        >
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 6 }}>MODEL STATUS</div>
          <div className="flex items-center justify-between">
            <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500 }}>
              ultimate_parking_model.pt
            </span>
            <span className="badge badge-amber" style={{ fontSize: 9 }}>PENDING</span>
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
            YOLOv8n · conf=0.25
          </div>
        </div>
      </div>
    </aside>
  );
}
