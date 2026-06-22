"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const API_BASE = "http://localhost:8000";

// ── Badge: only for bulk/special ops, hidden for routine ones ────────────────
const FUNC_META = {
  create_student:      { label: "Created",      color: "#16a34a" },
  update_student:      { label: "Updated",      color: "#2563eb" },
  delete_student:      { label: "Deleted",      color: "#dc2626" },
  read_student:        { label: "Found",        color: "#7c3aed" },
  all_students:        { label: "Listed",       color: "#0891b2" },
  filter_students:     { label: "Filtered",     color: "#d97706" },
  delete_all_students: { label: "Cleared",      color: "#dc2626" },
  delete_where:        { label: "Bulk deleted", color: "#dc2626" },
  update_where:        { label: "Bulk updated", color: "#2563eb" },
};

function ChatMessage({ msg }) {
  const isUser = msg.role === "user";

  if (isUser) {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
        <div style={{
          background: "#18181b",
          color: "#fff",
          borderRadius: "14px 14px 3px 14px",
          padding: "8px 13px",
          fontSize: 13,
          maxWidth: "80%",
          lineHeight: 1.5,
        }}>
          {msg.text}
        </div>
      </div>
    );
  }

  // Assistant: only show the essentials
  const details = msg.details || [];
  const showDetails = details.length > 0;

  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "flex-start" }}>
      {/* Avatar dot */}
      <div style={{
        width: 22, height: 22, borderRadius: "50%",
        background: "#18181b",
        flexShrink: 0, marginTop: 2,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#a3e635" }} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Main message — only if meaningful */}
        {msg.text && (
          <div style={{
            fontSize: 13, color: "#27272a", lineHeight: 1.55,
            marginBottom: showDetails ? 6 : 0,
          }}>
            {msg.text}
          </div>
        )}

        {/* Details: one line per operation, no clutter */}
        {showDetails && details.map((d, i) => {
          const meta = FUNC_META[d.function] || { label: d.function, color: "#52525b" };
          const result = d.result;
          const isArr = Array.isArray(result);
          const count = isArr ? result.length : null;

          return (
            <div key={i} style={{
              display: "flex", alignItems: "baseline", gap: 6,
              marginBottom: i < details.length - 1 ? 3 : 0,
            }}>
              <span style={{
                fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
                textTransform: "uppercase", color: meta.color,
                flexShrink: 0,
              }}>{meta.label}</span>
              <span style={{ fontSize: 12, color: d.success ? "#3f3f46" : "#dc2626" }}>
                {d.success
                  ? count !== null
                    ? `${count} student${count !== 1 ? "s" : ""}`
                    : result?.name
                      ? `${result.name} (#${result.id})`
                      : d.message
                  : d.message}
              </span>
            </div>
          );
        })}

        {/* Student mini-cards only for read/filter results with actual data */}
        {showDetails && details.map((d, i) => {
          const result = d.result;
          const isArr = Array.isArray(result);
          const showCards =
            d.success && isArr && result.length > 0 &&
            ["read_student","filter_students","all_students"].includes(d.function);

          if (!showCards) return null;
          return (
            <div key={`cards-${i}`} style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 3 }}>
              {result.map((s) => (
                <div key={s.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: "#fafafa", border: "1px solid #e4e4e7",
                  borderRadius: 8, padding: "5px 10px", fontSize: 12,
                }}>
                  <span style={{ fontWeight: 600, color: "#18181b" }}>
                    {s.name}
                    <span style={{ fontWeight: 400, color: "#a1a1aa", marginLeft: 4 }}>#{s.id}</span>
                  </span>
                  <span style={{ color: "#71717a" }}>Gr {s.grade} · {s.age}y</span>
                </div>
              ))}
            </div>
          );
        })}

        {/* Navigate button — only when useful */}
        {msg.navigate && msg.navigate.path !== "/students" && (
          <button
            onClick={msg.onNavigate}
            style={{
              marginTop: 7, fontSize: 11, padding: "3px 10px",
              background: "#18181b", border: "none",
              borderRadius: 6, color: "#fff", cursor: "pointer",
            }}
          >
            View →
          </button>
        )}
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, paddingLeft: 30 }}>
      {[0,1,2].map(i => (
        <div key={i} style={{
          width: 5, height: 5, borderRadius: "50%", background: "#a1a1aa",
          animation: "chatDot 1.2s infinite", animationDelay: `${i*0.2}s`,
        }} />
      ))}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function Page() {
  const router = useRouter();

  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([{
    role: "assistant",
    text: "What would you like to do?",
  }]);
  const [chatLoading, setChatLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const fetchStudents = async () => {
    try {
      const res = await fetch(`${API_BASE}/students`);
      setStudents(await res.json());
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchStudents(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, chatLoading]);
  useEffect(() => { if (chatOpen) setTimeout(() => inputRef.current?.focus(), 80); }, [chatOpen]);

  const sendChat = async (text) => {
    const cmd = (text || chatInput).trim();
    if (!cmd || chatLoading) return;
    setChatInput("");
    setMessages(p => [...p, { role: "user", text: cmd }]);
    setChatLoading(true);

    try {
      const res = await fetch(`${API_BASE}/command`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: cmd }),
      });
      const data = await res.json();

      setMessages(p => [...p, {
        role: "assistant",
        text: data.success ? "" : (data.message || "Something went wrong."),
        details: data.details || [],
        navigate: data.navigate,
        onNavigate: data.navigate ? () => router.push(data.navigate.path) : undefined,
      }]);

      const mutating = ["create_student","update_student","delete_student","delete_all_students","delete_where","update_where"];
      if ((data.details || []).some(d => d.success && mutating.includes(d.function))) {
        fetchStudents();
      }
    } catch {
      setMessages(p => [...p, { role: "assistant", text: "Can't reach the server." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.grade?.toString().toLowerCase().includes(search.toLowerCase()) ||
    s.id?.toString().includes(search)
  );

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes chatDot { 0%,80%,100%{opacity:.3;transform:scale(1)} 40%{opacity:1;transform:scale(1.3)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .row-hover:hover { background: #f4f4f5 !important; cursor: pointer; }
        .search-input:focus { outline: none; border-color: #18181b !important; }
        .chat-ta:focus { outline: none; }
        .send-btn:hover:not(:disabled) { background: #27272a !important; }
        .fab:hover { transform: scale(1.06); }
        .fab { transition: transform 0.15s; }
        .add-btn:hover { background: #27272a !important; }
      `}</style>

      {/* ── Top nav ── */}
      <header style={{
        background: "#fff", borderBottom: "1px solid #e4e4e7",
        padding: "0 40px", height: 56,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "#18181b",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a3e635" strokeWidth="2.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#18181b", letterSpacing: "-0.02em" }}>
            Students
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => router.push("/")}
            style={{
              fontSize: 13, color: "#71717a", background: "none",
              border: "none", cursor: "pointer", padding: "4px 8px",
            }}
          >← Home</button>
          <button
            className="add-btn"
            onClick={() => router.push("/create")}
            style={{
              fontSize: 13, fontWeight: 600, color: "#fff",
              background: "#18181b", border: "none",
              borderRadius: 8, padding: "7px 16px", cursor: "pointer",
              transition: "background 0.15s",
            }}
          >Add student</button>
        </div>
      </header>

      {/* ── Content ── */}
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "36px 24px 80px" }}>

        {/* Stats strip */}
        <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
          {[
            { label: "Total", value: students.length },
            { label: "Shown", value: filteredStudents.length },
          ].map(stat => (
            <div key={stat.label} style={{
              background: "#fff", border: "1px solid #e4e4e7",
              borderRadius: 10, padding: "12px 20px",
            }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#18181b", letterSpacing: "-0.03em" }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 12, color: "#a1a1aa", marginTop: 1 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: 16 }}>
          <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            className="search-input"
            type="text"
            placeholder="Search by name, grade or ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "10px 12px 10px 34px",
              border: "1px solid #e4e4e7", borderRadius: 9,
              fontSize: 13, color: "#18181b", background: "#fff",
              transition: "border-color 0.15s",
            }}
          />
        </div>

        {/* Table */}
        <div style={{
          background: "#fff", border: "1px solid #e4e4e7",
          borderRadius: 12, overflow: "hidden",
        }}>
          <Table>
            <TableHeader>
              <TableRow style={{ background: "#fafafa" }}>
                {["ID", "Name", "Grade", "Age", "Address"].map(h => (
                  <TableHead key={h} style={{
                    fontSize: 11, fontWeight: 600, color: "#71717a",
                    textTransform: "uppercase", letterSpacing: "0.06em",
                    padding: "10px 16px", borderBottom: "1px solid #e4e4e7",
                  }}>{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} style={{ textAlign: "center", padding: "40px 0", color: "#a1a1aa", fontSize: 13 }}>
                    {search ? `No students matching "${search}"` : "No students yet — add one or use the assistant."}
                  </TableCell>
                </TableRow>
              ) : filteredStudents.map((s, i) => (
                <TableRow
                  key={s.id}
                  className="row-hover"
                  onClick={() => router.push(`/read/${s.id}`)}
                  style={{
                    borderTop: i === 0 ? "none" : "1px solid #f4f4f5",
                    transition: "background 0.1s",
                  }}
                >
                  <TableCell style={{ padding: "12px 16px", fontSize: 12, color: "#a1a1aa", fontVariantNumeric: "tabular-nums" }}>
                    #{s.id}
                  </TableCell>
                  <TableCell style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "#18181b" }}>
                    {s.name}
                  </TableCell>
                  <TableCell style={{ padding: "12px 16px" }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: "2px 8px",
                      borderRadius: 20, background: "#f4f4f5", color: "#52525b",
                    }}>{s.grade}</span>
                  </TableCell>
                  <TableCell style={{ padding: "12px 16px", fontSize: 13, color: "#3f3f46" }}>{s.age}</TableCell>
                  <TableCell style={{ padding: "12px 16px", fontSize: 13, color: "#71717a" }}>{s.address || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>

      {/* ── FAB ── */}
      <button
        className="fab"
        onClick={() => setChatOpen(o => !o)}
        style={{
          position: "fixed", bottom: 24, right: 24,
          width: 50, height: 50, borderRadius: "50%",
          background: "#18181b", border: "none",
          cursor: "pointer", zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 16px rgba(0,0,0,0.22)",
        }}
      >
        {chatOpen
          ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        }
        {/* Green dot */}
        {!chatOpen && (
          <div style={{
            position: "absolute", top: 10, right: 10,
            width: 8, height: 8, borderRadius: "50%",
            background: "#a3e635", border: "2px solid #18181b",
          }} />
        )}
      </button>

      {/* ── Chat panel ── */}
      {chatOpen && (
        <div style={{
          position: "fixed", bottom: 84, right: 24,
          width: 340, height: 480,
          background: "#fff", borderRadius: 16,
          border: "1px solid #e4e4e7",
          boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
          display: "flex", flexDirection: "column",
          overflow: "hidden", zIndex: 99,
          animation: "slideUp 0.18s ease",
        }}>

          {/* Header */}
          <div style={{
            padding: "13px 16px 11px",
            borderBottom: "1px solid #f4f4f5",
            display: "flex", alignItems: "center", gap: 9,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: "#18181b",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#a3e635" }} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#18181b" }}>Assistant</div>
              <div style={{ fontSize: 10, color: chatLoading ? "#d97706" : "#a3e635", fontWeight: 500 }}>
                {chatLoading ? "Thinking…" : "Online"}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: "auto", padding: "14px 14px 4px",
            scrollbarWidth: "thin", scrollbarColor: "#e4e4e7 transparent",
          }}>
            {messages.map((msg, i) => <ChatMessage key={i} msg={msg} />)}
            {chatLoading && <TypingDots />}
            <div ref={bottomRef} />
          </div>

          {/* Quick actions — only on first open */}
          {messages.length <= 1 && !chatLoading && (
            <div style={{ padding: "0 14px 10px", display: "flex", flexWrap: "wrap", gap: 5 }}>
              {["Show all", "Filter grade A", "Delete all"].map(s => (
                <button key={s} onClick={() => sendChat(s)} style={{
                  fontSize: 11, padding: "4px 10px",
                  background: "#fafafa", border: "1px solid #e4e4e7",
                  borderRadius: 20, color: "#52525b", cursor: "pointer",
                }}>{s}</button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{
            padding: "10px 12px",
            borderTop: "1px solid #f4f4f5",
            display: "flex", gap: 7, alignItems: "flex-end",
          }}>
            <textarea
              ref={inputRef}
              className="chat-ta"
              rows={1}
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
              placeholder="Ask anything…"
              disabled={chatLoading}
              style={{
                flex: 1, resize: "none",
                border: "1px solid #e4e4e7", borderRadius: 9,
                padding: "8px 11px", fontSize: 13,
                fontFamily: "inherit", color: "#18181b",
                background: "#fafafa", lineHeight: 1.5,
                maxHeight: 80, overflow: "auto",
              }}
            />
            <button
              className="send-btn"
              onClick={() => sendChat()}
              disabled={!chatInput.trim() || chatLoading}
              style={{
                width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                background: chatInput.trim() && !chatLoading ? "#18181b" : "#f4f4f5",
                border: "none", cursor: chatInput.trim() ? "pointer" : "default",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.15s",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke={chatInput.trim() && !chatLoading ? "#fff" : "#a1a1aa"}
                strokeWidth="2.5" strokeLinecap="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}