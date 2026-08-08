import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import logoImg from "../assets/image.png";

const TechVedhuLogo = ({ size = 32 }) => (
  <img src={logoImg} alt="Logo" style={{ width: size, height: size, objectFit: "contain", borderRadius: 6 }} />
);

const NAV = [
  { key: "overview", icon: "📊", label: "Overview" },
  { key: "users", icon: "👥", label: "Candidates" },
  { key: "resumes", icon: "📄", label: "Resume Scans" },
];
const PIE_COLORS = ["#ef4444", "#f59e0b", "#1a56db", "#059669", "#0ea5e9"];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "white",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "10px 14px",
        boxShadow: "var(--shadow-md)",
        fontSize: 12,
      }}
    >
      {label && (
        <p style={{ color: "var(--text-3)", marginBottom: 4, fontWeight: 600 }}>
          {label}
        </p>
      )}
      {payload.map((p, i) => (
        <p
          key={i}
          style={{
            color: p.color || "var(--accent)",
            fontWeight: 700,
            margin: 0,
          }}
        >
          {p.value} {p.name}
        </p>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [active, setActive] = useState("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [userSort, setUserSort] = useState("newest");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalResumes: 0,
    avgScore: 0,
    todayCount: 0,
    uploadsByDate: [],
    scoreRanges: []
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const [subRes, statsRes] = await Promise.all([
        axios.get(`${apiUrl}/api/admin/submissions`),
        axios.get(`${apiUrl}/api/admin/stats`)
      ]);
      
      if (subRes.data?.success) {
        setResumes(subRes.data.documents);
        
        // Group submissions by email to create a list of candidate profiles
        const candidatesMap = {};
        subRes.data.documents.forEach(doc => {
          const emailKey = (doc.userEmail || '').trim().toLowerCase();
          // Keep the earliest scan as the "registration" profile, or latest. Let's keep latest details.
          if (emailKey) {
            if (!candidatesMap[emailKey]) {
              candidatesMap[emailKey] = {
                id: doc.id,
                name: doc.userName,
                email: doc.userEmail,
                mobile: doc.userMobile,
                degree: doc.degree,
                department: doc.department,
                college: doc.college,
                graduationYear: doc.graduationYear,
                currentStatus: doc.currentStatus,
                createdAt: doc.createdAt
              };
            }
          }
        });
        setUsers(Object.values(candidatesMap));
      }

      if (statsRes.data?.success) {
        setStats(statsRes.data.stats);
      }
    } catch (e) {
      console.error("Error fetching admin dashboard data:", e);
    }
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem("adminLoggedIn");
    navigate("/login");
  };

  const exportCandidatesCSV = () => {
    if (!users?.length) return;
    const headers = [
      "Name",
      "Email",
      "Mobile",
      "Degree",
      "Department",
      "College",
      "Graduation Year",
      "Current Status",
      "First Scan Date"
    ];
    const rows = users.map((u) => {
      return [
        u.name || "",
        u.email || "",
        u.mobile || "",
        u.degree || "",
        u.department || "",
        u.college || "",
        u.graduationYear || "",
        u.currentStatus || "",
        u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN") : ""
      ].map((v) => `"${v.toString().replace(/"/g, '""')}"`);
    });
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "candidates_export.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const exportResumesCSV = () => {
    if (!resumes?.length) return;
    const headers = [
      "Name",
      "Email",
      "Mobile No",
      "Degree",
      "Department",
      "College",
      "Graduation Year",
      "Current Status",
      "Target Role",
      "Company",
      "ATS Score",
      "Scan Date",
      "Resume PDF"
    ];
    const rows = resumes.map((r) => {
      const fields = [
        r.userName || "",
        r.userEmail || "",
        r.userMobile || "",
        r.degree || "",
        r.department || "",
        r.college || "",
        r.graduationYear || "",
        r.currentStatus || "",
        r.targetRole || "",
        r.company || "",
        r.overallScore != null ? `${r.overallScore}%` : "0%",
        r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-IN") : ""
      ].map((v) => `"${v.toString().replace(/"/g, '""')}"`);

      const pdfCell = r.fileUrl ? `"${r.fileUrl}"` : `""`;
      return [...fields, pdfCell].join(",");
    });
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "resume_scans_export.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const resumeCounts = resumes.reduce((acc, r) => {
    const key = (r.userEmail || '').trim().toLowerCase();
    if (key) {
      acc[key] = (acc[key] || 0) + 1;
    }
    return acc;
  }, {});

  const filtered = search.trim().toLowerCase();

  const fUsers = users.filter(
    (u) =>
      !filtered ||
      u.name?.toLowerCase().includes(filtered) ||
      u.email?.toLowerCase().includes(filtered) ||
      u.college?.toLowerCase().includes(filtered) ||
      u.degree?.toLowerCase().includes(filtered)
  ).sort((a, b) => {
    if (userSort === "frequent") {
      const emailA = (a.email || '').trim().toLowerCase();
      const emailB = (b.email || '').trim().toLowerCase();
      const countA = resumeCounts[emailA] || 0;
      const countB = resumeCounts[emailB] || 0;
      if (countB !== countA) return countB - countA;
    }
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  const fResumes = resumes.filter(
    (r) =>
      !filtered ||
      r.userName?.toLowerCase().includes(filtered) ||
      r.userEmail?.toLowerCase().includes(filtered) ||
      r.targetRole?.toLowerCase().includes(filtered) ||
      r.college?.toLowerCase().includes(filtered)
  );

  return (
    <div
      style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}
    >
      {/* ─── Mobile Overlay ─── */}
      {mobileOpen && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 998 }} 
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ─── Sidebar ─── */}
      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">
            <TechVedhuLogo size={30} />
          </div>
          <div>
            <div
              style={{
                fontSize: "0.88rem",
                fontWeight: 800,
                color: "white",
                letterSpacing: "0.02em",
              }}
            >
              TECH VEDHU
            </div>
            <div
              style={{
                fontSize: "0.62rem",
                fontWeight: 600,
                color: "rgba(255,255,255,0.5)",
                textTransform: "uppercase",
                letterSpacing: "0.07em",
              }}
            >
              Admin Panel
            </div>
          </div>
        </div>

        <div className="nav-section">Main</div>
        {NAV.map((n) => (
          <button
            key={n.key}
            className={`nav-item ${active === n.key ? "active" : ""}`}
            onClick={() => {
              setActive(n.key);
              setMobileOpen(false);
            }}
          >
            <span className="icon">{n.icon}</span>
            <span>{n.label}</span>
          </button>
        ))}

        <div style={{ flex: 1 }} />

        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.15)",
            paddingTop: 14,
            marginTop: 14,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: "0 10px 12px",
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: "0.95rem",
                color: "white",
                flexShrink: 0,
              }}
            >
              A
            </div>
            <div>
              <div
                style={{ fontWeight: 700, fontSize: "0.82rem", color: "white" }}
              >
                Admin
              </div>
              <div
                style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)" }}
              >
                Administrator
              </div>
            </div>
          </div>
          <button
            className="nav-item"
            onClick={logout}
            style={{ color: "#fca5a5" }}
          >
            <span className="icon">🚪</span> Sign out
          </button>
        </div>
      </aside>

      {/* ─── Main ─── */}
      <main className="admin-main">
        {/* Mobile Header */}
        <div className="mobile-header">
          <div style={{ fontWeight: 800, fontSize: "1rem" }}>Tech Vedhu Admin</div>
          <button className="btn btn-ghost" onClick={() => setMobileOpen(true)}>☰ Menu</button>
        </div>
        {loading ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "60vh",
              gap: 14,
            }}
          >
            <span
              className="spinner spinner-dark"
              style={{ width: 32, height: 32, borderWidth: 3 }}
            />
            <p style={{ fontSize: "0.875rem", color: "var(--text-3)" }}>
              Loading dashboard analytics...
            </p>
          </div>
        ) : (
          <>
            {/* ─── Overview ─── */}
            {active === "overview" && (
              <div className="anim-fade-up">
                <div style={{ marginBottom: 32 }}>
                  <h1 className="t-h1" style={{ marginBottom: 4 }}>
                    Dashboard Overview
                  </h1>
                  <p className="t-sm">
                    Real-time candidate scans & ATS system metrics.
                  </p>
                </div>

                {/* Stat Cards */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(196px,1fr))",
                    gap: 16,
                    marginBottom: 28,
                  }}
                >
                  {[
                    {
                      label: "Total Candidates",
                      value: stats.totalUsers,
                      icon: "👥",
                      color: "#16325b",
                      bg: "#e6f0ff",
                    },
                    {
                      label: "Total Scans",
                      value: stats.totalResumes,
                      icon: "📄",
                      color: "#059669",
                      bg: "#ecfdf5",
                    },
                    {
                      label: "Avg ATS Score",
                      value: `${stats.avgScore}%`,
                      icon: "⭐",
                      color: "#d97706",
                      bg: "#fffbeb",
                    },
                    {
                      label: "Scans Today",
                      value: stats.todayCount,
                      icon: "📅",
                      color: "#1a56db",
                      bg: "#e8f0fe",
                    },
                  ].map((s, i) => (
                    <div key={i} className="stat-card">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 14,
                        }}
                      >
                        <span className="t-label">{s.label}</span>
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 10,
                            background: s.bg,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.1rem",
                          }}
                        >
                          {s.icon}
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: "2rem",
                          fontWeight: 900,
                          color: s.color,
                          letterSpacing: "-0.03em",
                        }}
                      >
                        {s.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Charts Row */}
                <div className="grid-layout-charts">
                  <div className="card card-p">
                    <div style={{ marginBottom: 20 }}>
                      <h2 className="t-h2" style={{ marginBottom: 2 }}>
                        Upload Activity
                      </h2>
                      <p className="t-sm">
                        Resume scans over the last 7 days.
                      </p>
                    </div>
                    {stats.uploadsByDate?.length === 0 ? (
                      <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-4)' }}>No activity data</div>
                    ) : (
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart
                          data={stats.uploadsByDate}
                          barSize={30}
                          margin={{ top: 0, right: 0, left: -24, bottom: 0 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="var(--border)"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="date"
                            tick={{ fill: "#94a3b8", fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            tick={{ fill: "#94a3b8", fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            allowDecimals={false}
                          />
                          <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ fill: "#e8f0fe" }}
                          />
                          <Bar
                            dataKey="uploads"
                            name="scans"
                            fill="#16325b"
                            radius={[6, 6, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  <div className="card card-p">
                    <div style={{ marginBottom: 20 }}>
                      <h2 className="t-h2" style={{ marginBottom: 2 }}>
                        Score Distribution
                      </h2>
                      <p className="t-sm">
                        Breakdown of ATS scores across scans.
                      </p>
                    </div>
                    {resumes.length === 0 ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          height: 180,
                          color: "var(--text-4)",
                          fontSize: "0.875rem",
                        }}
                      >
                        No scores recorded
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={stats.scoreRanges}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={70}
                            innerRadius={40}
                            paddingAngle={3}
                          >
                            {stats.scoreRanges.map((_, i) => (
                              <Cell
                                key={i}
                                fill={PIE_COLORS[i % PIE_COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                          <Legend
                            iconType="circle"
                            iconSize={8}
                            wrapperStyle={{ fontSize: "11px" }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Recent Resumes */}
                <div
                  className="card"
                  style={{ marginTop: 20, overflow: "hidden" }}
                >
                  <div
                    style={{
                      padding: "18px 22px",
                      borderBottom: "1px solid var(--border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <h2 className="t-h2" style={{ marginBottom: 2 }}>
                        Recent Scans
                      </h2>
                      <p className="t-sm">Latest 5 resumes scanned.</p>
                    </div>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setActive("resumes")}
                    >
                      View all →
                    </button>
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Candidate</th>
                          <th>Degree / College</th>
                          <th>Role</th>
                          <th>Score</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resumes.slice(0, 5).map((r) => (
                          <tr key={r.id}>
                            <td style={{ fontWeight: 600, color: "var(--text-1)" }}>
                              {r.userName}
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontWeight: 400 }}>{r.userEmail}</div>
                            </td>
                            <td>
                              <div style={{ fontWeight: 500 }}>{r.degree} ({r.department})</div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{r.college}</div>
                            </td>
                            <td>{r.targetRole || <span style={{ color: 'var(--text-4)' }}>—</span>}</td>
                            <td>
                              <span
                                className={`badge ${r.overallScore >= 75 ? "badge-success" : r.overallScore >= 50 ? "badge-warning" : "badge-danger"}`}
                              >
                                {r.overallScore}%
                              </span>
                            </td>
                            <td>
                              {r.createdAt ? new Date(r.createdAt).toLocaleDateString(
                                "en-IN",
                                { day: "2-digit", month: "short" }
                              ) : ""}
                            </td>
                          </tr>
                        ))}
                        {resumes.length === 0 && (
                          <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-4)' }}>No scan records found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ─── Candidates (Users) ─── */}
            {active === "users" && (
              <div className="anim-fade-up">
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    marginBottom: 28,
                    flexWrap: "wrap",
                    gap: 14,
                  }}
                >
                  <div>
                    <h1 className="t-h1" style={{ marginBottom: 4 }}>
                      Candidates
                    </h1>
                    <p className="t-sm">
                      {users.length} unique candidates recorded
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <input
                      className="form-control"
                      style={{ width: 240, height: 38 }}
                      placeholder="Search by name, email, college..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <select
                      className="form-control"
                      style={{ height: 38, width: 140 }}
                      value={userSort}
                      onChange={(e) => setUserSort(e.target.value)}
                    >
                      <option value="newest">Newest First</option>
                      <option value="frequent">Frequent Scanners</option>
                    </select>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={exportCandidatesCSV}
                    >
                      ↓ Export CSV
                    </button>
                  </div>
                </div>
                <div className="card" style={{ overflow: "hidden" }}>
                  <div style={{ overflowX: "auto" }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Candidate</th>
                          <th>Mobile / Email</th>
                          <th>Degree & Department</th>
                          <th>College / University</th>
                          <th>Status</th>
                          <th>Total Scans</th>
                          <th>First Seen</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fUsers.map((u) => {
                          const emailKey = (u.email || '').trim().toLowerCase();
                          const count = resumeCounts[emailKey] || 1;
                          return (
                            <tr key={u.id}>
                              <td>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                  }}
                                >
                                  <div
                                    style={{
                                      width: 32,
                                      height: 32,
                                      borderRadius: 8,
                                      background: "var(--accent-light)",
                                      color: "var(--accent)",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontWeight: 800,
                                      fontSize: "0.88rem",
                                      flexShrink: 0,
                                    }}
                                  >
                                    {u.name?.[0]?.toUpperCase() || "?"}
                                  </div>
                                  <span
                                    style={{
                                      fontWeight: 600,
                                      color: "var(--text-1)",
                                    }}
                                  >
                                    {u.name}
                                  </span>
                                </div>
                              </td>
                              <td>
                                <div>{u.email}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{u.mobile || "—"}</div>
                              </td>
                              <td>
                                <div style={{ fontWeight: 500 }}>{u.degree}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{u.department}</div>
                              </td>
                              <td>
                                <div>{u.college}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>Class of {u.graduationYear}</div>
                              </td>
                              <td>
                                <span className="badge badge-accent" style={{ textTransform: 'capitalize' }}>
                                  {u.currentStatus}
                                </span>
                              </td>
                              <td>
                                <span className="badge" style={{ background: "rgba(26, 86, 219, 0.1)", color: "#1a56db", padding: "4px 8px", borderRadius: 6, fontWeight: 700 }}>
                                  {count}
                                </span>
                              </td>
                              <td style={{ whiteSpace: "nowrap" }}>
                                {u.createdAt ? new Date(u.createdAt).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  }
                                ) : ""}
                              </td>
                            </tr>
                          );
                        })}
                        {fUsers.length === 0 && (
                          <tr>
                            <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-4)' }}>No candidates found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ─── Resume Scans ─── */}
            {active === "resumes" && (
              <div className="anim-fade-up">
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    marginBottom: 28,
                    flexWrap: "wrap",
                    gap: 14,
                  }}
                >
                  <div>
                    <h1 className="t-h1" style={{ marginBottom: 4 }}>
                      Resume Scans
                    </h1>
                    <p className="t-sm">
                      {resumes.length} scans run in total
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <input
                      className="form-control"
                      style={{ width: 240, height: 38 }}
                      placeholder="Search by name, role, college..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={exportResumesCSV}
                    >
                      ↓ Export CSV
                    </button>
                  </div>
                </div>
                <div className="card" style={{ overflow: "hidden" }}>
                  <div style={{ overflowX: "auto" }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Candidate</th>
                          <th>Degree / College</th>
                          <th>Status</th>
                          <th>Target Details</th>
                          <th>Scan Date</th>
                          <th>Score</th>
                          <th>Resume</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fResumes.map((r) => (
                          <tr key={r.id}>
                            <td style={{ fontWeight: 600, color: "var(--text-1)" }}>
                              {r.userName}
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontWeight: 400 }}>{r.userEmail}</div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontWeight: 400 }}>{r.userMobile || "—"}</div>
                            </td>
                            <td>
                              <div style={{ fontWeight: 500 }}>{r.degree} ({r.department})</div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{r.college}</div>
                            </td>
                            <td>
                              <span className="badge badge-accent">{r.currentStatus || "—"}</span>
                            </td>
                            <td>
                              <div><strong>Role:</strong> {r.targetRole || <span style={{ color: "var(--text-4)" }}>—</span>}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}><strong>Company:</strong> {r.company || "—"}</div>
                            </td>
                            <td style={{ whiteSpace: "nowrap" }}>
                              {r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : ""}
                            </td>
                            <td>
                              <span className={`badge ${r.overallScore >= 75 ? "badge-success" : r.overallScore >= 50 ? "badge-warning" : "badge-danger"}`}>
                                {r.overallScore}%
                              </span>
                            </td>
                            <td>
                              {r.fileUrl ? (
                                <a href={r.fileUrl}
                                  target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ textDecoration: "none" }}>View PDF ↗</a>
                              ) : <span style={{ color: "var(--text-4)" }}>—</span>}
                            </td>
                          </tr>
                        ))}
                        {fResumes.length === 0 && (
                          <tr>
                            <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-4)' }}>No scan records found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
