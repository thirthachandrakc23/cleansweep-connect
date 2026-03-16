import { useState, useEffect, useRef } from "react";
import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";
import { loginUser } from "./login";
import FriendUI from "./FriendUI";


// ── Fonts ──────────────────────────────────────────────────────────────────
const FontLink = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Sans', sans-serif; background: #050d0f; color: #e2f0ef; }
    ::-webkit-scrollbar { width: 6px; } 
    ::-webkit-scrollbar-track { background: #0a1a1c; }
    ::-webkit-scrollbar-thumb { background: #0d9488; border-radius: 3px; }
    @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
    @keyframes pulse-ring { 0%,100% { box-shadow: 0 0 0 0 rgba(13,148,136,.4); } 50% { box-shadow: 0 0 0 12px rgba(13,148,136,0); } }
    @keyframes scan { 0%,100% { transform: translateY(-100%); opacity:.6; } 50% { transform: translateY(400%); opacity:.2; } }
    @keyframes counter { from { opacity:0; transform: scale(.8); } to { opacity:1; transform: scale(1); } }
    @keyframes glow { 0%,100% { text-shadow: 0 0 20px #0d9488aa; } 50% { text-shadow: 0 0 40px #0d9488, 0 0 80px #0d948844; } }
    @keyframes shimmer { 0%{background-position:-400px 0}100%{background-position:400px 0} }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes blink { 0%,100%{opacity:1}50%{opacity:.3} }
    .fade-up { animation: fadeUp .5s ease forwards; }
    .glow-text { animation: glow 3s ease-in-out infinite; }
    .pulse-btn { animation: pulse-ring 2s infinite; }
    .card-hover { transition: transform .2s, box-shadow .2s; }
    .card-hover:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(13,148,136,.2); }
  `}</style>
);

// ── Color palette ──────────────────────────────────────────────────────────
const C = {
  bg: "#050d0f",
  surface: "#0a1a1c",
  card: "#0f2225",
  border: "#163035",
  teal: "#0d9488",
  tealLight: "#14b8a8",
  tealDim: "#0d948840",
  green: "#22c55e",
  orange: "#f97316",
  red: "#ef4444",
  yellow: "#eab308",
  text: "#e2f0ef",
  muted: "#7da8a4",
  white: "#ffffff",
};

// ── Mock Data ──────────────────────────────────────────────────────────────
const MOCK_REPORTS = [
  {
    id: 1, title: "Large Garbage Dump Near Bus Stop", location: "Shivaji Park, Dadar, Mumbai",
    distance: "600m", time: "12 min ago", status: "waiting",
    category: "Garbage Dump", img: "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=500&q=80",
    aiWasteType: "Mixed Solid Waste", aiVolunteers: 5, aiTime: "30 minutes",
    volunteersJoined: 2, description: "Huge pile of garbage accumulated next to bus stop. Smell is unbearable and blocking pedestrian path.",
    severity: "High", upvotes: 34,
  },
  {
    id: 2, title: "Overflowing Drain Blocking Traffic", location: "MG Road, Pune",
    distance: "1.2km", time: "45 min ago", status: "active",
    category: "Blocked Drain", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80",
    aiWasteType: "Sewage / Organic Waste", aiVolunteers: 3, aiTime: "45 minutes",
    volunteersJoined: 3, description: "Drain is completely blocked causing water logging. Vehicles are unable to pass.",
    severity: "High", upvotes: 67,
  },
  {
    id: 3, title: "Plastic Waste on Beach Shore", location: "Juhu Beach, Mumbai",
    distance: "3.4km", time: "2 hrs ago", status: "completed",
    category: "Road Waste", img: "https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=500&q=80",
    aiWasteType: "Plastic / Marine Waste", aiVolunteers: 8, aiTime: "2 hours",
    volunteersJoined: 8, description: "Tons of plastic waste washed up on shore. Immediate cleanup needed before tide.",
    severity: "Critical", upvotes: 129,
  },
  {
    id: 4, title: "Deep Pothole Causing Accidents", location: "FC Road, Pune",
    distance: "900m", time: "3 hrs ago", status: "govt",
    category: "Road Damage", img: "https://images.unsplash.com/photo-1573074617613-fc8ef27e6744?w=500&q=80",
    aiWasteType: "Road Infrastructure", aiVolunteers: 0, aiTime: "N/A",
    volunteersJoined: 0, description: "2 foot deep pothole caused 3 accidents today. Needs immediate government intervention.",
    severity: "Critical", upvotes: 203,
  },
  {
    id: 5, title: "Construction Debris on Footpath", location: "Koregaon Park, Pune",
    distance: "1.8km", time: "5 hrs ago", status: "waiting",
    category: "Road Waste", img: "https://images.unsplash.com/photo-1581094480784-9793c6c10d00?w=500&q=80",
    aiWasteType: "Construction Debris", aiVolunteers: 6, aiTime: "1 hour",
    volunteersJoined: 1, description: "Building materials dumped on footpath making it unusable for pedestrians.",
    severity: "Medium", upvotes: 18,
  },
];

const MOCK_VOLUNTEERS = [
  { id: 1, name: "Ravi Kumar", points: 350, tasks: 12, avatar: "RK", badge: "🏆" },
  { id: 2, name: "Sneha Patil", points: 300, tasks: 10, avatar: "SP", badge: "🥈" },
  { id: 3, name: "Akash Sharma", points: 280, tasks: 9, avatar: "AS", badge: "🥉" },
  { id: 4, name: "Ananya Desai", points: 220, tasks: 7, avatar: "AD", badge: "⭐" },
  { id: 5, name: "Priya Nair", points: 190, tasks: 6, avatar: "PN", badge: "⭐" },
];

const MOCK_GOVT = [
  { id: 1, issue: "Pothole", location: "MG Road, Pune", severity: "High", status: "Pending", reported: "2 days ago" },
  { id: 2, issue: "Broken Drain Cover", location: "FC Road, Pune", severity: "Critical", status: "Assigned", reported: "1 day ago" },
  { id: 3, issue: "Streetlight Damage", location: "Koregaon Park", severity: "Medium", status: "Resolved", reported: "5 days ago" },
  { id: 4, issue: "Road Cave-in", location: "Baner, Pune", severity: "Critical", status: "Pending", reported: "3 hrs ago" },
  { id: 5, issue: "Broken Footpath", location: "Camp Area, Pune", severity: "Low", status: "Resolved", reported: "1 week ago" },
];

const MOCK_CHAT = [
  { user: "Ravi", msg: "I will bring trash bags and gloves", time: "10:12 AM" },
  { user: "Sneha", msg: "I will reach in 10 minutes 🚴", time: "10:14 AM" },
  { user: "Akash", msg: "Bringing my team of 3 from NSS COEP", time: "10:15 AM" },
  { user: "Ananya", msg: "Location confirmed, parking near the metro station", time: "10:18 AM" },
];

// ── Utility components ─────────────────────────────────────────────────────
const Badge = ({ children, color = C.teal }) => (
  <span style={{
    background: color + "22", color, border: `1px solid ${color}44`,
    borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 600, letterSpacing: .5,
  }}>{children}</span>
);

const StatusBadge = ({ status }) => {
  const map = {
    waiting: [C.orange, "Waiting for Volunteers"],
    active: [C.teal, "Cleanup In Progress"],
    completed: [C.green, "Completed ✓"],
    govt: ["#a78bfa", "Sent to Government"],
  };
  const [color, label] = map[status] || [C.muted, status];
  return <Badge color={color}>{label}</Badge>;
};

const SeverityDot = ({ sev }) => {
  const c = { Critical: C.red, High: C.orange, Medium: C.yellow, Low: C.green }[sev] || C.muted;
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
    <span style={{ width: 8, height: 8, borderRadius: "50%", background: c, display: "inline-block" }} />
    <span style={{ color: c, fontSize: 12, fontWeight: 600 }}>{sev}</span>
  </span>;
};

const ProgressBar = ({ value, max, color = C.teal }) => (
  <div style={{ background: C.border, borderRadius: 4, height: 6, overflow: "hidden" }}>
    <div style={{
      width: `${Math.min(100, (value / max) * 100)}%`, height: "100%",
      background: `linear-gradient(90deg, ${color}, ${color}aa)`,
      borderRadius: 4, transition: "width .4s ease",
    }} />
  </div>
);

const Icon = ({ name, size = 18, color = C.muted }) => {
  const icons = {
    map: "📍", time: "🕐", vol: "👥", cat: "🏷️", fire: "🔥", check: "✓",
    bell: "🔔", trash: "🗑️", leaf: "🌿", chart: "📊", gear: "⚙️",
    star: "⭐", chat: "💬", share: "🔗", eye: "👁️", warn: "⚠️",
    road: "🛣️", drain: "🚰", light: "💡", plus: "＋", arrow: "→",
    govt: "🏛️", nss: "🎓", cam: "📷", loc: "📌", up: "▲", runner: "🏃",
  };
  return <span style={{ fontSize: size, lineHeight: 1 }}>{icons[name] || "•"}</span>;
};

const StatCard = ({ label, value, sub, icon, color = C.teal, delay = 0 }) => (
  <div className="card-hover fade-up" style={{
    background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px 24px",
    animationDelay: `${delay}ms`, flex: 1, minWidth: 160,
  }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
      <span style={{ fontSize: 22 }}>{icon}</span>
      <span style={{ color, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{sub}</span>
    </div>
    <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 32, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
    <div style={{ color: C.muted, fontSize: 13, marginTop: 6 }}>{label}</div>
  </div>
);

// ── NAVBAR ─────────────────────────────────────────────────────────────────
const Navbar = ({ page, setPage, handleReportClick, handleVolunteerClick, handleGovClick }) => {
  const tabs = [];
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: "rgba(5,13,15,.92)", backdropFilter: "blur(20px)",
      borderBottom: `1px solid ${C.border}`, padding: "0 32px",
      display: "flex", alignItems: "center", gap: 32, height: 60,
    }}>
      <div onClick={() => setPage("landing")} style={{
        fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20,
        color: C.teal, cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
      }}>
        <span style={{ fontSize: 24 }}>🌿</span> CleanSweep<span style={{ color: C.text }}>Connect</span>
      </div>
      <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => {
  if (t.id === "reports") handleReportClick();
  else if (t.id === "volunteer") handleVolunteerClick();
  else if (t.id === "govt") handleGovClick();
  else setPage(t.id);
}} style={{
            background: page === t.id ? C.tealDim : "transparent",
            color: page === t.id ? C.teal : C.muted,
            border: page === t.id ? `1px solid ${C.teal}44` : "1px solid transparent",
            borderRadius: 8, padding: "6px 16px", fontSize: 14, fontWeight: 500,
            cursor: "pointer", transition: "all .2s",
          }}>{t.label}</button>
        ))}
      </div>
      <div style={{display:"flex", gap:"12px"}}>

<button
onClick={() => setPage("login")}
style={{
background:"linear-gradient(135deg,#22c55e,#16a34a)",
color:"#000",
border:"none",
borderRadius:8,
padding:"8px 18px",
fontSize:13,
fontWeight:700,
cursor:"pointer"
}}
>
Login
</button>

<button
style={{
background:"linear-gradient(135deg,#38bdf8,#0ea5e9)",
color:"#000",
border:"none",
borderRadius:8,
padding:"8px 18px",
fontSize:13,
fontWeight:700,
cursor:"pointer"
}}
>
Register
</button>

</div>
    </nav>
  );
};

// ── LANDING PAGE ───────────────────────────────────────────────────────────
const LandingPage = ({ handleReportClick, handleVolunteerClick }) => {
  const [counts, setCounts] = useState({ vol: 0, waste: 0, reports: 0, cities: 0 });

  useEffect(() => {
    const targets = { vol: 4280, waste: 12400, reports: 8750, cities: 24 };
    const duration = 1800;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCounts({
        vol: Math.floor(targets.vol * ease),
        waste: Math.floor(targets.waste * ease),
        reports: Math.floor(targets.reports * ease),
        cities: Math.floor(targets.cities * ease),
      });
      if (progress < 1) requestAnimationFrame(tick);
    };
    const timer = setTimeout(() => requestAnimationFrame(tick), 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ minHeight: "100vh", overflowX: "hidden" }}>
      {/* Hero */}
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", textAlign: "center", padding: "100px 24px 60px",
        background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${C.teal}18 0%, transparent 70%)`,
        position: "relative",
      }}>
        {/* Grid bg */}
        <div style={{
          position: "absolute", inset: 0, opacity: .03,
          backgroundImage: "linear-gradient(#0d9488 1px, transparent 1px), linear-gradient(90deg, #0d9488 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />

        <div className="fade-up" style={{ animationDelay: "0ms" }}>
          <span style={{
            background: C.tealDim, color: C.teal, border: `1px solid ${C.teal}44`,
            borderRadius: 20, padding: "5px 16px", fontSize: 12, fontWeight: 700,
            letterSpacing: 2, textTransform: "uppercase",
          }}>🌿 Civic Tech Platform for Indian Cities</span>
        </div>

        <h1 className="fade-up glow-text" style={{
          fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(40px,7vw,80px)",
          lineHeight: 1.1, marginTop: 24, marginBottom: 16,
          animationDelay: "100ms",
        }}>
          Turn Citizens Into<br />
          <span style={{ color: C.teal }}>City Cleaners</span>
        </h1>

        <p className="fade-up" style={{
          color: C.muted, fontSize: "clamp(16px,2vw,20px)", maxWidth: 540,
          lineHeight: 1.7, marginBottom: 40, animationDelay: "200ms",
        }}>
          CleanSweep Connect bridges citizens, NSS volunteers, and government authorities to resolve civic issues — faster, smarter, together.
        </p>

        <div className="fade-up" style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center", animationDelay: "300ms" }}>
          <button className="pulse-btn" onClick={handleReportClick} style={{
            background: `linear-gradient(135deg, ${C.teal}, ${C.tealLight})`,
            color: "#000", border: "none", borderRadius: 12, padding: "14px 32px",
            fontSize: 16, fontWeight: 700, cursor: "pointer",
          }}>📷 Report Issue</button>
          <button onClick={handleVolunteerClick} style={{
            background: "transparent", color: C.teal,
            border: `1px solid ${C.teal}`, borderRadius: 12, padding: "14px 32px",
            fontSize: 16, fontWeight: 600, cursor: "pointer",
          }}>🙋 Join as Volunteer</button>
        </div>

        {/* Stats */}
        <div className="fade-up" style={{
          display: "flex", gap: 40, flexWrap: "wrap", justifyContent: "center",
          marginTop: 80, animationDelay: "500ms",
        }}>
          {[
            { val: counts.vol.toLocaleString(), label: "Active Volunteers", icon: "👥" },
            { val: counts.waste.toLocaleString() + " kg", label: "Waste Cleaned", icon: "🗑️" },
            { val: counts.reports.toLocaleString(), label: "Reports Submitted", icon: "📋" },
            { val: counts.cities, label: "Cities Covered", icon: "🏙️" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 4 }}>{s.icon}</div>
              <div style={{
                fontFamily: "'Syne', sans-serif", fontSize: 36, fontWeight: 800, color: C.teal,
              }}>{s.val}</div>
              <div style={{ color: C.muted, fontSize: 13 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{ padding: "80px 32px", maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{
          fontFamily: "'Syne', sans-serif", fontSize: 36, fontWeight: 800,
          textAlign: "center", marginBottom: 12,
        }}>How It <span style={{ color: C.teal }}>Works</span></h2>
        <p style={{ color: C.muted, textAlign: "center", marginBottom: 60 }}>Three steps to a cleaner city</p>

        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {[
            { step: "01", icon: "📷", title: "Citizen Reports", desc: "Snap a photo, share your location, and describe the issue. Our AI instantly analyses waste type and volunteer requirements." },
            { step: "02", icon: "🙋", title: "Volunteers Join", desc: "Nearby volunteers see the report, join the task. Once the required count is reached, cleanup begins automatically." },
            { step: "03", icon: "🏛️", title: "Govt. Tracks Infra", desc: "Infrastructure issues like potholes and broken drains are routed to the Government Dashboard for official repair assignment." },
          ].map((s, i) => (
            <div key={i} className="card-hover" style={{
              flex: 1, minWidth: 260, background: C.card, border: `1px solid ${C.border}`,
              borderRadius: 16, padding: 32, position: "relative",
            }}>
              <div style={{
                fontFamily: "'Syne', sans-serif", fontSize: 64, fontWeight: 900,
                color: C.teal + "18", position: "absolute", top: 16, right: 20, lineHeight: 1,
              }}>{s.step}</div>
              <div style={{ fontSize: 36, marginBottom: 16 }}>{s.icon}</div>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{s.title}</h3>
              <p style={{ color: C.muted, lineHeight: 1.7, fontSize: 14 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div style={{ padding: "40px 32px 80px", maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{
          fontFamily: "'Syne', sans-serif", fontSize: 36, fontWeight: 800,
          textAlign: "center", marginBottom: 48,
        }}>Issue <span style={{ color: C.teal }}>Categories</span></h2>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {[
            { icon: "🗑️", label: "Garbage Dump", count: "3,240 reports", color: C.orange },
            { icon: "🛣️", label: "Road Waste", count: "1,820 reports", color: C.teal },
            { icon: "🕳️", label: "Road Damage", count: "2,110 reports", color: C.red },
            { icon: "🚰", label: "Blocked Drain", count: "980 reports", color: "#a78bfa" },
          ].map((c, i) => (
            <div key={i} className="card-hover" onClick={handleReportClick} style={{
              flex: 1, minWidth: 200, background: C.card, border: `1px solid ${c.color}33`,
              borderRadius: 16, padding: 24, cursor: "pointer", textAlign: "center",
            }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>{c.icon}</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700 }}>{c.label}</div>
              <div style={{ color: c.color, fontSize: 13, marginTop: 6 }}>{c.count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{
        margin: "0 32px 80px", borderRadius: 24, overflow: "hidden",
        background: `linear-gradient(135deg, ${C.teal}22, ${C.teal}08)`,
        border: `1px solid ${C.teal}33`, padding: "60px 40px", textAlign: "center",
      }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 36, fontWeight: 800, marginBottom: 16 }}>
          Ready to Make Your City <span style={{ color: C.teal }}>Cleaner?</span>
        </h2>
        <p style={{ color: C.muted, marginBottom: 32 }}>Join 4,000+ volunteers already making a difference across 24 Indian cities.</p>
        <button onClick={handleVolunteerClick} style={{
          background: `linear-gradient(135deg, ${C.teal}, ${C.tealLight})`,
          color: "#000", border: "none", borderRadius: 12, padding: "16px 40px",
          fontSize: 17, fontWeight: 700, cursor: "pointer",
        }}>Start Reporting Now 🌿</button>
      </div>
    </div>
  );
};

// ── CITIZEN REPORTS PAGE ───────────────────────────────────────────────────
const ReportsPage = () => {
  const [reports, setReports] = useState(MOCK_REPORTS);
  const [filter, setFilter] = useState("All");
  const [form, setForm] = useState({ title: "", location: "", desc: "", category: "Garbage Dump" });
  const [joined, setJoined] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showForm, setShowForm] = useState(true);

  const categories = ["All", "Garbage Dump", "Road Waste", "Road Damage", "Blocked Drain"];
  const filtered = filter === "All" ? reports : reports.filter(r => r.category === filter);

  const handleJoin = (id) => {
    if (joined[id]) return;
    setJoined(j => ({ ...j, [id]: true }));
    setReports(rs => rs.map(r => {
      if (r.id !== id) return r;
      const newJoined = r.volunteersJoined + 1;
      return { ...r, volunteersJoined: newJoined, status: newJoined >= r.aiVolunteers ? "active" : r.status };
    }));
  };

  const handleSubmit = () => {
    if (!form.title || !form.location) return;
    setSubmitting(true);
    setAiLoading(true);
    setTimeout(() => {
      setAiLoading(false);
      const newReport = {
        id: Date.now(), ...form, distance: "0.1km", time: "Just now", status: "waiting",
        img: "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=500&q=80",
        aiWasteType: form.category === "Road Damage" ? "Road Infrastructure" : "Mixed Waste",
        aiVolunteers: Math.floor(Math.random() * 5) + 2,
        aiTime: `${Math.floor(Math.random() * 30) + 20} minutes`,
        volunteersJoined: 0, severity: "Medium", upvotes: 0,
      };
      setReports(rs => [newReport, ...rs]);
      setForm({ title: "", location: "", desc: "", category: "Garbage Dump" });
      setSubmitting(false);
      setShowForm(false);
      setTimeout(() => setShowForm(true), 100);
    }, 2000);
  };

  return (
    <div style={{ display: "flex", gap: 0, paddingTop: 60, minHeight: "100vh" }}>
      {/* Left Sidebar */}
      <div style={{
        width: 320, flexShrink: 0, position: "sticky", top: 60, height: "calc(100vh - 60px)",
        overflowY: "auto", background: C.surface, borderRight: `1px solid ${C.border}`,
        padding: 20,
      }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 20, color: C.teal }}>
          📷 Create Report
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { label: "Issue Title", key: "title", placeholder: "e.g. Garbage near bus stop" },
            { label: "Location", key: "location", placeholder: "📍 Detecting GPS..." },
          ].map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 12, color: C.muted, marginBottom: 6, display: "block", fontWeight: 600, letterSpacing: .5 }}>
                {f.label}
              </label>
              <input
                value={form[f.key]}
                onChange={e => setForm(x => ({ ...x, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                style={{
                  width: "100%", background: C.card, border: `1px solid ${C.border}`,
                  borderRadius: 8, padding: "10px 12px", color: C.text, fontSize: 14,
                  outline: "none",
                }}
              />
            </div>
          ))}

          <div>
            <label style={{ fontSize: 12, color: C.muted, marginBottom: 6, display: "block", fontWeight: 600, letterSpacing: .5 }}>
              Category
            </label>
            <select
              value={form.category}
              onChange={e => setForm(x => ({ ...x, category: e.target.value }))}
              style={{
                width: "100%", background: C.card, border: `1px solid ${C.border}`,
                borderRadius: 8, padding: "10px 12px", color: C.text, fontSize: 14, outline: "none",
              }}
            >
              {["Garbage Dump", "Road Waste", "Road Damage", "Blocked Drain"].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 12, color: C.muted, marginBottom: 6, display: "block", fontWeight: 600, letterSpacing: .5 }}>
              Description
            </label>
            <textarea
              value={form.desc}
              onChange={e => setForm(x => ({ ...x, desc: e.target.value }))}
              rows={3}
              placeholder="Describe the issue..."
              style={{
                width: "100%", background: C.card, border: `1px solid ${C.border}`,
                borderRadius: 8, padding: "10px 12px", color: C.text, fontSize: 14,
                outline: "none", resize: "vertical",
              }}
            />
          </div>

          {/* Upload zone */}
          <div style={{
            border: `2px dashed ${C.border}`, borderRadius: 8, padding: "20px",
            textAlign: "center", color: C.muted, cursor: "pointer",
          }}>
            <div style={{ fontSize: 28 }}>📷</div>
            <div style={{ fontSize: 13, marginTop: 8 }}>Upload Photo</div>
            <div style={{ fontSize: 11, marginTop: 4 }}>AI will analyze the image</div>
          </div>

          {aiLoading && (
            <div style={{
              background: C.tealDim, border: `1px solid ${C.teal}44`,
              borderRadius: 8, padding: 12, textAlign: "center",
            }}>
              <div style={{ animation: "spin 1s linear infinite", display: "inline-block", fontSize: 20 }}>⚙️</div>
              <div style={{ color: C.teal, fontSize: 13, marginTop: 8 }}>AI analyzing issue...</div>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              background: submitting ? C.border : `linear-gradient(135deg, ${C.teal}, ${C.tealLight})`,
              color: "#000", border: "none", borderRadius: 10, padding: "12px",
              fontSize: 15, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer",
              width: "100%",
            }}
          >
            {submitting ? "Submitting..." : "🚀 Report Issue"}
          </button>
        </div>

        {/* Quick Stats */}
        <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 12, color: C.muted, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
            Live Stats
          </div>
          {[
            { icon: "📋", label: "Total Reports", val: reports.length },
            { icon: "🙋", label: "Active Cleanups", val: reports.filter(r => r.status === "active").length },
            { icon: "✅", label: "Completed", val: reports.filter(r => r.status === "completed").length },
          ].map((s, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              background: C.card, borderRadius: 8, padding: "8px 12px",
            }}>
              <span style={{ fontSize: 13 }}>{s.icon} {s.label}</span>
              <span style={{ color: C.teal, fontWeight: 700 }}>{s.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Feed */}
      <div style={{ flex: 1, padding: "24px 28px", overflowY: "auto", maxHeight: "calc(100vh - 60px)" }}>
        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {categories.map(c => (
            <button key={c} onClick={() => setFilter(c)} style={{
              background: filter === c ? C.teal : C.card,
              color: filter === c ? "#000" : C.muted,
              border: `1px solid ${filter === c ? C.teal : C.border}`,
              borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 600,
              cursor: "pointer", transition: "all .2s",
            }}>{c}</button>
          ))}
          <span style={{ marginLeft: "auto", color: C.muted, fontSize: 13, alignSelf: "center" }}>
            {filtered.length} reports
          </span>
        </div>

        {/* Report Cards */}
        {filtered.map((r, i) => (
          <div key={r.id} className="card-hover fade-up" style={{
            background: C.card, border: `1px solid ${C.border}`, borderRadius: 16,
            marginBottom: 20, overflow: "hidden", animationDelay: `${i * 60}ms`,
          }}>
            {/* Top bar */}
            <div style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: `linear-gradient(135deg, ${C.teal}, ${C.tealLight})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16,
              }}>👤</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15 }}>{r.title}</div>
                <div style={{ color: C.muted, fontSize: 12 }}>📍 {r.location} · {r.distance} · {r.time}</div>
              </div>
              <StatusBadge status={r.status} />
            </div>

            {/* Image */}
            <div style={{ position: "relative", height: 200, overflow: "hidden" }}>
              <img src={r.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{
                position: "absolute", top: 12, left: 12,
                background: "rgba(0,0,0,.7)", borderRadius: 6,
                padding: "4px 10px", fontSize: 12, color: C.text,
              }}>🏷️ {r.category}</div>
              <div style={{
                position: "absolute", top: 12, right: 12,
              }}><SeverityDot sev={r.severity} /></div>
            </div>

            {/* Description */}
            <div style={{ padding: "14px 20px 0" }}>
              <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.6 }}>{r.description}</p>
            </div>

            {/* AI Analysis */}
            <div style={{ margin: "14px 20px", background: C.teal + "11", border: `1px solid ${C.teal}33`, borderRadius: 12, padding: "12px 16px" }}>
              <div style={{ color: C.teal, fontWeight: 700, fontSize: 12, letterSpacing: 1, marginBottom: 10, textTransform: "uppercase" }}>
                🤖 AI Analysis
              </div>
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                {[
                  { label: "Waste Type", val: r.aiWasteType },
                  { label: "Volunteers Required", val: r.aiVolunteers === 0 ? "Govt. Action" : r.aiVolunteers },
                  { label: "Est. Cleanup Time", val: r.aiTime },
                ].map((a, i) => (
                  <div key={i}>
                    <div style={{ color: C.muted, fontSize: 11 }}>{a.label}</div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: C.text }}>{a.val}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Volunteer Progress */}
            {r.aiVolunteers > 0 && (
              <div style={{ padding: "0 20px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: C.muted }}>
                    👥 Volunteers: <strong style={{ color: C.text }}>{r.volunteersJoined} / {r.aiVolunteers}</strong>
                  </span>
                  <span style={{ fontSize: 12, color: C.muted }}>
                    {Math.round((r.volunteersJoined / r.aiVolunteers) * 100)}%
                  </span>
                </div>
                <ProgressBar value={r.volunteersJoined} max={r.aiVolunteers}
                  color={r.volunteersJoined >= r.aiVolunteers ? C.green : C.teal} />
              </div>
            )}

            {/* Action buttons */}
            <div style={{ padding: "12px 20px 16px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 8, flexWrap: "wrap" }}>
              {r.aiVolunteers > 0 && r.status !== "completed" && (
                <button
                  onClick={() => handleJoin(r.id)}
                  disabled={joined[r.id] || r.volunteersJoined >= r.aiVolunteers}
                  style={{
                    background: joined[r.id] ? C.green : C.teal,
                    color: "#000", border: "none", borderRadius: 8, padding: "8px 16px",
                    fontSize: 13, fontWeight: 700, cursor: joined[r.id] ? "default" : "pointer",
                  }}
                >
                  {joined[r.id] ? "✓ Joined" : "🙋 Join Task"}
                </button>
              )}
              <button style={{
                background: C.surface, color: C.teal, border: `1px solid ${C.teal}44`,
                borderRadius: 8, padding: "8px 14px", fontSize: 13, cursor: "pointer",
              }}>🎓 Request NSS</button>
              <button style={{
                background: C.surface, color: C.muted, border: `1px solid ${C.border}`,
                borderRadius: 8, padding: "8px 14px", fontSize: 13, cursor: "pointer",
              }}>🔗 Share</button>
              <button style={{
                background: C.surface, color: C.muted, border: `1px solid ${C.border}`,
                borderRadius: 8, padding: "8px 14px", fontSize: 13, cursor: "pointer",
              }}>📍 View Location</button>
              <span style={{ marginLeft: "auto", color: C.muted, fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}>
                ▲ {r.upvotes}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── VOLUNTEER DASHBOARD ────────────────────────────────────────────────────
const VolunteerDashboard = () => {
  const [activeTab, setActiveTab] = useState("nearby");
  const [chatMsg, setChatMsg] = useState("");
  const [chatHistory, setChatHistory] = useState(MOCK_CHAT);

  const sendMsg = () => {
    if (!chatMsg.trim()) return;
    setChatHistory(h => [...h, { user: "You", msg: chatMsg, time: "Now" }]);
    setChatMsg("");
  };

  const tabs = [
    { id: "nearby", label: "Nearby Tasks" },
    { id: "active", label: "Active Tasks" },
    { id: "leaderboard", label: "Leaderboard" },
    { id: "chat", label: "Task Chat" },
  ];

  return (
    <div style={{ paddingTop: 60, minHeight: "100vh", padding: "80px 28px 40px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800 }}>
              🙋 Volunteer <span style={{ color: C.teal }}>Dashboard</span>
            </h1>
            <p style={{ color: C.muted, fontSize: 14, marginTop: 4 }}>Coordinate, join, and complete cleanup tasks</p>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {[
              { label: "Your Points", val: "350", icon: "⭐" },
              { label: "Tasks Done", val: "12", icon: "✅" },
            ].map((s, i) => (
              <div key={i} style={{
                background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
                padding: "12px 20px", textAlign: "center",
              }}>
                <div style={{ fontSize: 20 }}>{s.icon}</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: C.teal }}>{s.val}</div>
                <div style={{ color: C.muted, fontSize: 11 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 28, background: C.card, padding: 4, borderRadius: 12, width: "fit-content" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              background: activeTab === t.id ? C.teal : "transparent",
              color: activeTab === t.id ? "#000" : C.muted,
              border: "none", borderRadius: 8, padding: "8px 18px",
              fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all .2s",
            }}>{t.label}</button>
          ))}
        </div>

        {/* Nearby Tasks */}
        {activeTab === "nearby" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {MOCK_REPORTS.filter(r => r.aiVolunteers > 0 && r.status !== "completed").map((r, i) => (
              <div key={r.id} className="card-hover" style={{
                background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden",
              }}>
                <img src={r.img} alt="" style={{ width: "100%", height: 140, objectFit: "cover" }} />
                <div style={{ padding: 16 }}>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 6 }}>{r.title}</div>
                  <div style={{ color: C.muted, fontSize: 13, marginBottom: 10 }}>📍 {r.location} · {r.distance}</div>
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                      <span style={{ color: C.muted }}>Volunteers</span>
                      <span style={{ color: C.text, fontWeight: 700 }}>{r.volunteersJoined}/{r.aiVolunteers}</span>
                    </div>
                    <ProgressBar value={r.volunteersJoined} max={r.aiVolunteers} />
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <StatusBadge status={r.status} />
                    <SeverityDot sev={r.severity} />
                  </div>
                  <button style={{
                    width: "100%", marginTop: 12,
                    background: r.status === "active"
                      ? `linear-gradient(135deg, ${C.green}, ${C.green}bb)`
                      : `linear-gradient(135deg, ${C.teal}, ${C.tealLight})`,
                    color: "#000", border: "none", borderRadius: 8, padding: "10px",
                    fontSize: 14, fontWeight: 700, cursor: "pointer",
                  }}>
                    {r.status === "active" ? "📋 View Task" : "🙋 Join Task"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Active Tasks */}
        {activeTab === "active" && (
          <div>
            {MOCK_REPORTS.filter(r => r.status === "active").map((r, i) => (
              <div key={r.id} style={{
                background: C.card, border: `1px solid ${C.teal}44`, borderRadius: 16, padding: 20, marginBottom: 16,
              }}>
                <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
                  <img src={r.img} alt="" style={{ width: 120, height: 80, objectFit: "cover", borderRadius: 8 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
                      <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700 }}>{r.title}</h3>
                      <StatusBadge status={r.status} />
                    </div>
                    <p style={{ color: C.muted, fontSize: 13, marginBottom: 12 }}>📍 {r.location}</p>

                    {/* Team Members */}
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ color: C.muted, fontSize: 12, marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: .5 }}>
                        Team Members
                      </div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {MOCK_VOLUNTEERS.slice(0, r.aiVolunteers).map((v, i) => (
                          <div key={i} style={{
                            display: "flex", alignItems: "center", gap: 6,
                            background: C.surface, borderRadius: 20, padding: "5px 12px",
                            fontSize: 13,
                          }}>
                            <div style={{
                              width: 24, height: 24, borderRadius: "50%",
                              background: `linear-gradient(135deg, ${C.teal}, ${C.tealLight})`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 10, fontWeight: 800, color: "#000",
                            }}>{v.avatar}</div>
                            {v.name.split(" ")[0]}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      <button style={{
                        background: C.orange + "22", color: C.orange, border: `1px solid ${C.orange}44`,
                        borderRadius: 8, padding: "6px 14px", fontSize: 13, cursor: "pointer",
                      }}>📷 Before Photo</button>
                      <button style={{
                        background: C.green + "22", color: C.green, border: `1px solid ${C.green}44`,
                        borderRadius: 8, padding: "6px 14px", fontSize: 13, cursor: "pointer",
                      }}>📷 After Photo</button>
                      <button style={{
                        background: C.tealDim, color: C.teal, border: `1px solid ${C.teal}44`,
                        borderRadius: 8, padding: "6px 14px", fontSize: 13, cursor: "pointer",
                      }}>✅ Mark Complete</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Leaderboard */}
        {activeTab === "leaderboard" && (
          <div style={{ maxWidth: 600 }}>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16 }}>🏆 Top Volunteers</span>
                <span style={{ color: C.muted, fontSize: 13 }}>This Month</span>
              </div>
              {MOCK_VOLUNTEERS.map((v, i) => (
                <div key={v.id} style={{
                  display: "flex", alignItems: "center", gap: 16, padding: "14px 20px",
                  borderBottom: i < MOCK_VOLUNTEERS.length - 1 ? `1px solid ${C.border}` : "none",
                  background: i === 0 ? `${C.teal}08` : "transparent",
                }}>
                  <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, color: i < 3 ? C.teal : C.muted, width: 24 }}>
                    {i + 1}
                  </span>
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: `linear-gradient(135deg, ${C.teal}, ${C.tealLight})`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 800, color: "#000",
                  }}>{v.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{v.name}</div>
                    <div style={{ color: C.muted, fontSize: 12 }}>{v.tasks} tasks completed</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: C.teal }}>{v.points}</div>
                    <div style={{ color: C.muted, fontSize: 11 }}>points</div>
                  </div>
                  <span style={{ fontSize: 22 }}>{v.badge}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat */}
        {activeTab === "chat" && (
          <div style={{ maxWidth: 680 }}>
            <div style={{
              background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden",
            }}>
              <div style={{
                padding: "14px 20px", background: C.surface, borderBottom: `1px solid ${C.border}`,
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: C.green }} />
                <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700 }}>
                  Task Chat — Overflowing Drain: MG Road
                </span>
                <Badge color={C.green}>Active</Badge>
              </div>

              <div style={{ height: 320, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                {chatHistory.map((m, i) => (
                  <div key={i} style={{
                    display: "flex", gap: 10, alignItems: "flex-start",
                    flexDirection: m.user === "You" ? "row-reverse" : "row",
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: m.user === "You"
                        ? `linear-gradient(135deg, ${C.green}, ${C.green}bb)`
                        : `linear-gradient(135deg, ${C.teal}, ${C.tealLight})`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 800, color: "#000", flexShrink: 0,
                    }}>{m.user[0]}</div>
                    <div style={{
                      background: m.user === "You" ? C.green + "22" : C.surface,
                      border: `1px solid ${m.user === "You" ? C.green + "44" : C.border}`,
                      borderRadius: 12, padding: "8px 12px", maxWidth: "75%",
                    }}>
                      <div style={{ fontSize: 11, color: m.user === "You" ? C.green : C.teal, fontWeight: 700, marginBottom: 4 }}>
                        {m.user}
                      </div>
                      <div style={{ fontSize: 14 }}>{m.msg}</div>
                      <div style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>{m.time}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{
                padding: 16, borderTop: `1px solid ${C.border}`, display: "flex", gap: 10,
              }}>
                <input
                  value={chatMsg}
                  onChange={e => setChatMsg(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendMsg()}
                  placeholder="Type a message..."
                  style={{
                    flex: 1, background: C.surface, border: `1px solid ${C.border}`,
                    borderRadius: 8, padding: "10px 14px", color: C.text, fontSize: 14, outline: "none",
                  }}
                />
                <button onClick={sendMsg} style={{
                  background: `linear-gradient(135deg, ${C.teal}, ${C.tealLight})`,
                  color: "#000", border: "none", borderRadius: 8, padding: "10px 20px",
                  fontWeight: 700, cursor: "pointer",
                }}>Send</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── GOVERNMENT DASHBOARD ───────────────────────────────────────────────────
const GovtDashboard = () => {
  const [govtData, setGovtData] = useState(MOCK_GOVT);
  const [filter, setFilter] = useState("All");

  const filtered = filter === "All" ? govtData : govtData.filter(r => r.status === filter);

  const stats = {
    total: govtData.length,
    pending: govtData.filter(r => r.status === "Pending").length,
    assigned: govtData.filter(r => r.status === "Assigned").length,
    resolved: govtData.filter(r => r.status === "Resolved").length,
  };

  const updateStatus = (id, status) => {
    setGovtData(d => d.map(r => r.id === id ? { ...r, status } : r));
  };

  return (
    <div style={{ paddingTop: 60, minHeight: "100vh", padding: "80px 28px 40px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
          <div style={{
            width: 50, height: 50, borderRadius: 12, background: "#a78bfa22",
            border: "1px solid #a78bfa44", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24,
          }}>🏛️</div>
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800 }}>
              Government <span style={{ color: "#a78bfa" }}>Dashboard</span>
            </h1>
            <p style={{ color: C.muted, fontSize: 14 }}>Infrastructure damage reports · PUNE Municipal Corporation</p>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
            <div style={{
              background: C.card, border: "1px solid #a78bfa44", borderRadius: 8,
              padding: "6px 14px", fontSize: 13, color: "#a78bfa",
            }}>
              <span style={{ animation: "blink 1.5s infinite", display: "inline-block", marginRight: 6 }}>●</span>
              Live Dashboard
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: "flex", gap: 16, marginBottom: 32, flexWrap: "wrap" }}>
          <StatCard label="Total Damage Reports" value={stats.total} sub="All Time" icon="📊" color="#a78bfa" />
          <StatCard label="Pending Repairs" value={stats.pending} sub="Action Needed" icon="⚠️" color={C.red} delay={80} />
          <StatCard label="Assigned to Crew" value={stats.assigned} sub="In Progress" icon="🔧" color={C.orange} delay={160} />
          <StatCard label="Resolved Issues" value={stats.resolved} sub="Completed" icon="✅" color={C.green} delay={240} />
        </div>

        {/* Main layout */}
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          {/* Reports table */}
          <div style={{ flex: "1 1 620px" }}>
            <div style={{
              background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden",
            }}>
              <div style={{
                padding: "16px 20px", borderBottom: `1px solid ${C.border}`,
                display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
              }}>
                <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16 }}>
                  Infrastructure Reports
                </span>
                <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
                  {["All", "Pending", "Assigned", "Resolved"].map(s => (
                    <button key={s} onClick={() => setFilter(s)} style={{
                      background: filter === s ? "#a78bfa22" : "transparent",
                      color: filter === s ? "#a78bfa" : C.muted,
                      border: `1px solid ${filter === s ? "#a78bfa44" : "transparent"}`,
                      borderRadius: 6, padding: "4px 12px", fontSize: 12, cursor: "pointer",
                    }}>{s}</button>
                  ))}
                </div>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: C.surface }}>
                      {["Issue", "Location", "Severity", "Status", "Reported", "Actions"].map(h => (
                        <th key={h} style={{
                          padding: "10px 16px", textAlign: "left",
                          color: C.muted, fontSize: 11, fontWeight: 700,
                          textTransform: "uppercase", letterSpacing: .8,
                          borderBottom: `1px solid ${C.border}`,
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r, i) => (
                      <tr key={r.id} style={{
                        borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : "none",
                        transition: "background .15s",
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = C.surface}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <td style={{ padding: "12px 16px", fontWeight: 600, fontSize: 14 }}>
                          {r.issue === "Pothole" ? "🕳️" : r.issue === "Broken Drain Cover" ? "🚰" : r.issue === "Streetlight Damage" ? "💡" : "🛣️"} {r.issue}
                        </td>
                        <td style={{ padding: "12px 16px", color: C.muted, fontSize: 13 }}>📍 {r.location}</td>
                        <td style={{ padding: "12px 16px" }}><SeverityDot sev={r.severity} /></td>
                        <td style={{ padding: "12px 16px" }}>
                          <Badge color={
                            r.status === "Resolved" ? C.green :
                            r.status === "Assigned" ? C.orange : C.red
                          }>{r.status}</Badge>
                        </td>
                        <td style={{ padding: "12px 16px", color: C.muted, fontSize: 12 }}>{r.reported}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", gap: 6 }}>
                            {r.status === "Pending" && (
                              <>
                                <button onClick={() => updateStatus(r.id, "Assigned")} style={{
                                  background: C.orange + "22", color: C.orange, border: `1px solid ${C.orange}44`,
                                  borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer", fontWeight: 600,
                                }}>🔧 Assign</button>
                                <button onClick={() => updateStatus(r.id, "Acknowledged")} style={{
                                  background: "#a78bfa22", color: "#a78bfa", border: "1px solid #a78bfa44",
                                  borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer", fontWeight: 600,
                                }}>👁️ Ack</button>
                              </>
                            )}
                            {r.status === "Assigned" && (
                              <button onClick={() => updateStatus(r.id, "Resolved")} style={{
                                background: C.green + "22", color: C.green, border: `1px solid ${C.green}44`,
                                borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer", fontWeight: 600,
                              }}>✅ Mark Fixed</button>
                            )}
                            {r.status === "Resolved" && (
                              <span style={{ color: C.green, fontSize: 12 }}>✓ Done</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div style={{ flex: "1 1 280px", display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Map placeholder */}
            <div style={{
              background: C.card, border: `1px solid ${C.border}`, borderRadius: 16,
              overflow: "hidden", height: 280, position: "relative",
            }}>
              <div style={{
                position: "absolute", inset: 0,
                background: `
                  radial-gradient(circle at 30% 40%, ${C.teal}22 0%, transparent 50%),
                  radial-gradient(circle at 70% 70%, ${C.red}22 0%, transparent 40%),
                  linear-gradient(135deg, #0a1a1c, #050d0f)
                `,
              }} />
              <div style={{
                position: "absolute", inset: 0, opacity: .08,
                backgroundImage: "linear-gradient(#0d9488 1px, transparent 1px), linear-gradient(90deg, #0d9488 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }} />
              {/* Map markers */}
              {[
                { x: 30, y: 40, color: C.red, label: "Pothole" },
                { x: 55, y: 60, color: C.orange, label: "Drain" },
                { x: 70, y: 30, color: C.yellow, label: "Light" },
                { x: 45, y: 75, color: C.red, label: "Cave-in" },
              ].map((m, i) => (
                <div key={i} style={{
                  position: "absolute", left: `${m.x}%`, top: `${m.y}%`,
                  transform: "translate(-50%, -50%)",
                }}>
                  <div style={{
                    width: 14, height: 14, borderRadius: "50%", background: m.color,
                    boxShadow: `0 0 0 4px ${m.color}44, 0 0 0 8px ${m.color}22`,
                    cursor: "pointer",
                  }} title={m.label} />
                </div>
              ))}
              <div style={{ position: "absolute", bottom: 12, left: 16 }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14 }}>📍 Issue Map</div>
                <div style={{ color: C.muted, fontSize: 11 }}>Pune, Maharashtra</div>
              </div>
              <div style={{
                position: "absolute", top: 12, right: 12,
                background: "rgba(0,0,0,.6)", borderRadius: 8, padding: "6px 10px",
                fontSize: 11,
              }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
                  <span style={{ width: 8, height: 8, background: C.red, borderRadius: "50%", display: "inline-block" }} />
                  <span style={{ color: C.muted }}>Critical</span>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ width: 8, height: 8, background: C.orange, borderRadius: "50%", display: "inline-block" }} />
                  <span style={{ color: C.muted }}>High</span>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20 }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 14 }}>Quick Actions</div>
              {[
                { icon: "🔧", label: "Assign All Pending to Crew", color: C.orange },
                { icon: "📣", label: "Send Public Alert", color: C.red },
                { icon: "📊", label: "Export Monthly Report", color: "#a78bfa" },
                { icon: "🤝", label: "Request NSS Support", color: C.teal },
              ].map((a, i) => (
                <button key={i} style={{
                  width: "100%", background: a.color + "11", color: a.color,
                  border: `1px solid ${a.color}33`, borderRadius: 8,
                  padding: "10px 14px", fontSize: 13, fontWeight: 600,
                  cursor: "pointer", marginBottom: 8, textAlign: "left",
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  {a.icon} {a.label}
                </button>
              ))}
            </div>

            {/* Priority alerts */}
            <div style={{ background: C.red + "11", border: `1px solid ${C.red}33`, borderRadius: 16, padding: 20 }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: C.red, marginBottom: 12 }}>
                ⚠️ Priority Alerts
              </div>
              {govtData.filter(r => r.severity === "Critical").map((r, i) => (
                <div key={i} style={{
                  background: C.card, borderRadius: 8, padding: "10px 12px", marginBottom: 8,
                  borderLeft: `3px solid ${C.red}`,
                }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{r.issue}</div>
                  <div style={{ color: C.muted, fontSize: 11 }}>📍 {r.location}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── ROOT APP ───────────────────────────────────────────────────────────────
export default function App() {

  const [page, setPage] = useState("landing");

  const roleBtn = {
    width: "100%",
    padding: "12px",
    marginTop: "15px",
    borderRadius: "8px",
    border: "none",
    background: "#22c55e",
    cursor: "pointer",
    fontWeight: "bold"
  };

  async function handleLoginRole(role) {
    const user = await loginUser();

    if (!user) return;

    window.location.href = "/friend-ui.html?role=" + role;
  }

  async function handleReportClick() {
    handleLoginRole("citizen");
  }

  async function handleVolunteerClick() {
    handleLoginRole("volunteer");
  }

  async function handleGovClick() {
    handleLoginRole("govt");
  }

  const pages = {

    login: (
      <div style={{padding:"120px 40px", maxWidth:400, margin:"auto", textAlign:"center"}}>

        <h2>Select Role to Login</h2>

        <button onClick={() => handleLoginRole("citizen")} style={roleBtn}>
          Citizen
        </button>

        <button onClick={() => handleLoginRole("volunteer")} style={roleBtn}>
          Volunteer
        </button>

        <button onClick={() => handleLoginRole("govt")} style={roleBtn}>
          Government
        </button>

        <button
          onClick={() => setPage("landing")}
          style={{
            width:"100%",
            padding:"10px",
            marginTop:"20px",
            borderRadius:"8px",
            border:"1px solid #22c55e",
            background:"transparent",
            color:"#22c55e",
            cursor:"pointer"
          }}
        >
          Back
        </button>

      </div>
    ),

    landing: (
      <LandingPage
        handleReportClick={handleReportClick}
        handleVolunteerClick={handleVolunteerClick}
      />
    ),

    reports: (
      <iframe
        src="/friend-ui.html"
        title="dashboard"
        style={{
          width: "100%",
          height: "100vh",
          border: "none"
        }}
      />
    ),

    volunteer: <FriendUI />,
    govt: <FriendUI />,
  };

  return (
    <>
      <FontLink />

      <div style={{ background: C.bg, minHeight: "100vh", color: C.text }}>

        <Navbar
          page={page}
          setPage={setPage}
          handleReportClick={handleReportClick}
          handleVolunteerClick={handleVolunteerClick}
          handleGovClick={handleGovClick}
        />

        {pages[page]}

      </div>
    </>
  );
}



