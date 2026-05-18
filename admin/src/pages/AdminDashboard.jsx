import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
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

const TechVedhuLogo = ({ size = 32 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M20 4C20 4 8 10 8 22C8 28 12 33 18 35L20 28L22 35C28 33 32 28 32 22C32 10 20 4 20 4Z"
      fill="white"
      opacity="0.9"
    />
    <path
      d="M20 4C20 4 14 14 16 22L20 18L24 22C26 14 20 4 20 4Z"
      fill="white"
    />
    <circle cx="17" cy="14" r="1.5" fill="#1a3b82" />
  </svg>
);

const NAV = [
  { key: "overview", icon: "📊", label: "Overview" },
  { key: "users", icon: "👥", label: "Users" },
  { key: "resumes", icon: "📄", label: "Resumes" },
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
  const [users, setUsers] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uSnap, rSnap] = await Promise.all([
        getDocs(query(collection(db, "users"), orderBy("createdAt", "desc"))),
        getDocs(query(collection(db, "resumes"), orderBy("createdAt", "desc"))),
      ]);
      setUsers(uSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setResumes(rSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem("adminLoggedIn");
    navigate("/login");
  };

  // Generic CSV export (used for Users)
  const exportCSV = (data, filename) => {
    if (!data?.length) return;
    const headers = Object.keys(data[0]).join(",");
    const rows = data
      .map((o) =>
        Object.values(o)
          .map((v) => `"${(v ?? "").toString().replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    const a = document.createElement("a");
    a.href = `data:text/csv;charset=utf-8,${encodeURI(headers + "\n" + rows)}`;
    a.download = filename;
    a.click();
  };

  // Structured CSV export for Resumes — exactly: Name, Mobile, Email, Role, Industry, Date, Score, Resume URL
  const exportResumesCSV = (data) => {
    if (!data?.length) return;
    const headers = [
      "Name",
      "Mobile No",
      "Email",
      "Role",
      "Industry",
      "Date",
      "ATS Score",
      "Resume URL",
    ];
    const rows = data.map((r) =>
      [
        r.userName || "",
        r.userMobile || "",
        r.userEmail || "",
        r.targetRole || "",
        r.industry || "",
        r.createdAt
          ? new Date(r.createdAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "",
        r.overallScore != null ? `${r.overallScore}%` : "",
        r.fileUrl || "",
      ]
        .map((v) => `"${v.toString().replace(/"/g, '""')}"`)
        .join(","),
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const a = document.createElement("a");
    a.href = `data:text/csv;charset=utf-8,${encodeURI(csv)}`;
    a.download = "resumes_export.csv";
    a.click();
  };

  // Chart helpers
  const uploadsByDate = (() => {
    const c = {};
    resumes.forEach((r) => {
      const d = new Date(r.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      });
      c[d] = (c[d] || 0) + 1;
    });
    return Object.entries(c)
      .map(([d, v]) => ({ date: d, uploads: v }))
      .slice(-7);
  })();

  const scoreRanges = [
    { name: "0–40", value: resumes.filter((r) => r.overallScore < 40).length },
    {
      name: "40–60",
      value: resumes.filter((r) => r.overallScore >= 40 && r.overallScore < 60)
        .length,
    },
    {
      name: "60–75",
      value: resumes.filter((r) => r.overallScore >= 60 && r.overallScore < 75)
        .length,
    },
    {
      name: "75–90",
      value: resumes.filter((r) => r.overallScore >= 75 && r.overallScore < 90)
        .length,
    },
    { name: "90+", value: resumes.filter((r) => r.overallScore >= 90).length },
  ];

  const avgScore = resumes.length
    ? Math.round(
        resumes.reduce((a, r) => a + (r.overallScore || 0), 0) / resumes.length,
      )
    : 0;
  const todayCount = resumes.filter(
    (r) => new Date(r.createdAt).toDateString() === new Date().toDateString(),
  ).length;

  // Build a lookup map from userId -> user record (for backfilling mobile on old records)
  // Users are stored as doc(db, 'users', uid) so d.id === uid
  const usersById = users.reduce((acc, u) => {
    const key = u.uid || u.id; // uid field in data, or doc ID — both equal Firebase uid
    acc[key] = u;
    return acc;
  }, {});

  // Enrich resumes: if userMobile is missing, fall back to the user's mobile from the users collection
  const enrichedResumes = resumes.map((r) => ({
    ...r,
    userMobile: r.userMobile || usersById[r.userId]?.mobile || "",
  }));

  const filtered = search.trim().toLowerCase();
  const fUsers = users.filter(
    (u) =>
      !filtered ||
      u.name?.toLowerCase().includes(filtered) ||
      u.email?.toLowerCase().includes(filtered),
  );
  const fResumes = enrichedResumes.filter(
    (r) =>
      !filtered ||
      r.userName?.toLowerCase().includes(filtered) ||
      r.userEmail?.toLowerCase().includes(filtered),
  );

  return (
    <div
      style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}
    >
      {/* ─── Sidebar ─── */}
      <aside className="sidebar">
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
            onClick={() => setActive(n.key)}
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
              Loading dashboard...
            </p>
          </div>
        ) : (
          <>
            {/* ─── Overview ─── */}
            {active === "overview" && (
              <div className="anim-fade-up">
                <div style={{ marginBottom: 32 }}>
                  <h1 className="t-h1" style={{ marginBottom: 4 }}>
                    Overview
                  </h1>
                  <p className="t-sm">
                    Real-time analytics for your ATS Checker platform.
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
                      label: "Total Users",
                      value: users.length,
                      icon: "👥",
                      color: "#1a3b82",
                      bg: "#e8f0fe",
                    },
                    {
                      label: "Total Resumes",
                      value: resumes.length,
                      icon: "📄",
                      color: "#059669",
                      bg: "#ecfdf5",
                    },
                    {
                      label: "Avg ATS Score",
                      value: `${avgScore}%`,
                      icon: "⭐",
                      color: "#d97706",
                      bg: "#fffbeb",
                    },
                    {
                      label: "Today's Uploads",
                      value: todayCount,
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
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.6fr 1fr",
                    gap: 20,
                  }}
                >
                  <div className="card card-p">
                    <div style={{ marginBottom: 20 }}>
                      <h2 className="t-h2" style={{ marginBottom: 2 }}>
                        Upload Activity
                      </h2>
                      <p className="t-sm">
                        Resume submissions over the last 7 days.
                      </p>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart
                        data={uploadsByDate}
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
                          name="uploads"
                          fill="#1a3b82"
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="card card-p">
                    <div style={{ marginBottom: 20 }}>
                      <h2 className="t-h2" style={{ marginBottom: 2 }}>
                        Score Distribution
                      </h2>
                      <p className="t-sm">
                        Breakdown of ATS scores across all resumes.
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
                        No data yet
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={scoreRanges}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={74}
                            innerRadius={42}
                            paddingAngle={3}
                          >
                            {scoreRanges.map((_, i) => (
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
                        Recent Submissions
                      </h2>
                      <p className="t-sm">Last 5 resumes analyzed.</p>
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
                          <th>User</th>
                          <th>File</th>
                          <th>Score</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resumes.slice(0, 5).map((r) => (
                          <tr key={r.id}>
                            <td
                              style={{
                                fontWeight: 600,
                                color: "var(--text-1)",
                              }}
                            >
                              {r.userName}
                            </td>
                            <td
                              style={{
                                color: "var(--text-3)",
                                fontSize: "0.8rem",
                              }}
                            >
                              {r.fileName?.substring(0, 30)}
                              {r.fileName?.length > 30 ? "..." : ""}
                            </td>
                            <td>
                              <span
                                className={`badge ${r.overallScore >= 75 ? "badge-success" : r.overallScore >= 50 ? "badge-warning" : "badge-danger"}`}
                              >
                                {r.overallScore}%
                              </span>
                            </td>
                            <td>
                              {new Date(r.createdAt).toLocaleDateString(
                                "en-IN",
                                { day: "2-digit", month: "short" },
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ─── Users ─── */}
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
                      Users
                    </h1>
                    <p className="t-sm">
                      {users.length} registered users total
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <input
                      className="form-control"
                      style={{ width: 240, height: 38 }}
                      placeholder="Search by name or email..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => exportCSV(users, "users_export.csv")}
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
                          <th>Name</th>
                          <th>Email</th>
                          <th>Mobile</th>
                          <th>Registered On</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fUsers.map((u) => (
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
                            <td>{u.email}</td>
                            <td>
                              {u.mobile || (
                                <span style={{ color: "var(--text-4)" }}>
                                  —
                                </span>
                              )}
                            </td>
                            <td>
                              {new Date(u.createdAt).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ─── Resumes ─── */}
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
                      Resumes
                    </h1>
                    <p className="t-sm">
                      {resumes.length} resumes analyzed in total
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <input
                      className="form-control"
                      style={{ width: 240, height: 38 }}
                      placeholder="Search by name or email..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => exportResumesCSV(fResumes)}
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
                          <th>Name</th>
                          <th>Mobile No</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Industry</th>
                          <th>Date</th>
                          <th>Score</th>
                          <th>Resume</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fResumes.map((r) => (
                          <tr key={r.id}>
                            <td
                              style={{
                                fontWeight: 600,
                                color: "var(--text-1)",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {r.userName}
                            </td>
                            <td
                              style={{
                                color: "var(--text-3)",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {r.userMobile || (
                                <span style={{ color: "var(--text-4)" }}>
                                  —
                                </span>
                              )}
                            </td>
                            <td style={{ color: "var(--text-3)" }}>
                              {r.userEmail}
                            </td>
                            <td>
                              {r.targetRole || (
                                <span style={{ color: "var(--text-4)" }}>
                                  —
                                </span>
                              )}
                            </td>
                            <td>
                              {r.industry || (
                                <span style={{ color: "var(--text-4)" }}>
                                  —
                                </span>
                              )}
                            </td>
                            <td style={{ whiteSpace: "nowrap" }}>
                              {new Date(r.createdAt).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </td>
                            <td>
                              <span
                                className={`badge ${r.overallScore >= 75 ? "badge-success" : r.overallScore >= 50 ? "badge-warning" : "badge-danger"}`}
                              >
                                {r.overallScore}%
                              </span>
                            </td>
                            <td>
                              {r.fileUrl ? (
                                <a
                                  href={`${import.meta.env.VITE_API_URL}/api/pdf-proxy?url=${encodeURIComponent(r.fileUrl)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="btn btn-ghost btn-sm"
                                  style={{ textDecoration: "none" }}
                                >
                                  View PDF ↗
                                </a>
                              ) : (
                                <span style={{ color: "var(--text-4)" }}>
                                  —
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
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
