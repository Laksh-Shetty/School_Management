"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const API_BASE = "http://localhost:8000";

const EMOJIS = ["😊","👍","👎","❓","📋","🔍","✏️","🗑️","📊","🎓","➕","📝","🔄","⭐","💡"];

const QUICK_REPLIES_INITIAL = [
  { label: "📋 Help", cmd: "Help" },
  { label: "👥 Show all students", cmd: "Show all" },
  { label: "📊 Grade breakdown", cmd: "Grade breakdown" },
  { label: "⭐ Top students", cmd: "Top students" },
  { label: "🔢 Count students", cmd: "Count students" },
  { label: "📈 Summary", cmd: "Summary" },
];

function extractGrade(cmd) {
  const match = cmd.match(/grade\s+([a-f])/i) || cmd.match(/\bgrade([a-f])\b/i);
  return match ? match[1].toUpperCase() : null;
}

const ALL_GRADES = ["A", "B", "C", "D", "F"];

function getContextualQuickReplies(lastCmd, lastDetails) {
  const cmd = (lastCmd || "").toLowerCase();
  const fns = (lastDetails || []).map((d) => d.function);
  const firstFn = fns[0] || "";

  if (firstFn === "all" || cmd.includes("show all")) {
    return [
      { label: "⭐ Top 5 students", cmd: "Top 5 students" },
      { label: "🔼 Sort by name A–Z", cmd: "Sort by name" },
      { label: "🔽 Sort by age", cmd: "Sort by age" },
      { label: "📊 Grade breakdown", cmd: "Grade breakdown" },
      { label: "📈 Summary", cmd: "Summary" },
    ];
  }

  if (firstFn === "filter" || firstFn === "advfilter") {
    const filteredGrade = extractGrade(lastCmd || "");
    const otherGrades = ALL_GRADES.filter((g) => g !== filteredGrade);
    const suggestions = [
      { label: "🔼 Sort by age", cmd: `Sort by age` },
      { label: "🔽 Sort by name", cmd: `Sort by name` },
      ...otherGrades.slice(0, 2).map((g) => ({ label: `🎓 Filter grade ${g}`, cmd: `Filter grade ${g}` })),
      { label: "👥 Show all students", cmd: "Show all" },
      { label: "📊 Grade breakdown", cmd: "Grade breakdown" },
    ];
    return suggestions;
  }

  if (firstFn === "search") {
    return [
      { label: "👥 Show all students", cmd: "Show all" },
      { label: "⭐ Top students", cmd: "Top students" },
      { label: "📊 Grade breakdown", cmd: "Grade breakdown" },
      { label: "📈 Summary", cmd: "Summary" },
    ];
  }

  if (firstFn === "add" || firstFn === "addmany") {
    return [
      { label: "👥 Show all students", cmd: "Show all" },
      { label: "🔢 Count students", cmd: "Count students" },
      { label: "📊 Grade breakdown", cmd: "Grade breakdown" },
      { label: "📈 Summary", cmd: "Summary" },
    ];
  }

  if (firstFn === "edit" || firstFn === "editwhere" || firstFn === "setfield" || firstFn === "promote" || firstFn === "addyear") {
    return [
      { label: "👥 Show all students", cmd: "Show all" },
      { label: "⭐ Top students", cmd: "Top students" },
      { label: "📊 Grade breakdown", cmd: "Grade breakdown" },
      { label: "📈 Summary", cmd: "Summary" },
    ];
  }

  if (firstFn === "remove" || firstFn === "deletewhere" || firstFn === "deleteall") {
    return [
      { label: "👥 Show all students", cmd: "Show all" },
      { label: "🔢 Count students", cmd: "Count students" },
      { label: "📈 Summary", cmd: "Summary" },
      { label: "➕ Add a student", cmd: "Add student" },
    ];
  }

  if (firstFn === "summary") {
    return [
      { label: "🎓 Filter grade A", cmd: "Filter grade A" },
      { label: "⭐ Top students", cmd: "Top students" },
      { label: "🔽 Sort by age", cmd: "Sort by age" },
      { label: "👥 Show all students", cmd: "Show all" },
    ];
  }

  if (firstFn === "grades") {
    return [
      { label: "🎓 Filter grade A", cmd: "Filter grade A" },
      { label: "🎓 Filter grade B", cmd: "Filter grade B" },
      { label: "⭐ Top students", cmd: "Top students" },
      { label: "👥 Show all students", cmd: "Show all" },
    ];
  }

  if (firstFn === "count") {
    return [
      { label: "📊 Grade breakdown", cmd: "Grade breakdown" },
      { label: "📈 Summary", cmd: "Summary" },
      { label: "👥 Show all students", cmd: "Show all" },
      { label: "⭐ Top students", cmd: "Top students" },
    ];
  }

  if (firstFn === "avgage") {
    return [
      { label: "📈 Summary", cmd: "Summary" },
      { label: "🔽 Sort by age", cmd: "Sort by age" },
      { label: "👥 Show all students", cmd: "Show all" },
      { label: "📊 Grade breakdown", cmd: "Grade breakdown" },
    ];
  }

  if (firstFn === "top") {
    return [
      { label: "🎓 Filter grade A", cmd: "Filter grade A" },
      { label: "📊 Grade breakdown", cmd: "Grade breakdown" },
      { label: "📈 Summary", cmd: "Summary" },
      { label: "👥 Show all students", cmd: "Show all" },
    ];
  }

  if (firstFn === "sort") {
    const sortedByAge = cmd.includes("age");
    return [
      sortedByAge
        ? { label: "🔼 Sort by name A–Z", cmd: "Sort by name" }
        : { label: "🔽 Sort by age (oldest first)", cmd: "Sort by age" },
      { label: "🎓 Filter grade A", cmd: "Filter grade A" },
      { label: "⭐ Top students", cmd: "Top students" },
      { label: "📊 Grade breakdown", cmd: "Grade breakdown" },
      { label: "👥 Show all students", cmd: "Show all" },
    ];
  }

  if (firstFn === "help") {
    return [
      { label: "👥 Show all students", cmd: "Show all" },
      { label: "📊 Grade breakdown", cmd: "Grade breakdown" },
      { label: "⭐ Top students", cmd: "Top students" },
      { label: "➕ Add a student", cmd: "Add student" },
      { label: "📈 Summary", cmd: "Summary" },
    ];
  }

  if (firstFn === "get" || firstFn === "byroll") {
    return [
      { label: "👥 Show all students", cmd: "Show all" },
      { label: "📊 Grade breakdown", cmd: "Grade breakdown" },
      { label: "⭐ Top students", cmd: "Top students" },
      { label: "📈 Summary", cmd: "Summary" },
      { label: "➕ Add a student", cmd: "Add student" },
    ];
  }

  if (firstFn === "chitchat") {
    return QUICK_REPLIES_INITIAL;
  }

  return [
    { label: "👥 Show all students", cmd: "Show all" },
    { label: "📊 Grade breakdown", cmd: "Grade breakdown" },
    { label: "⭐ Top students", cmd: "Top students" },
    { label: "📈 Summary", cmd: "Summary" },
    { label: "📋 Help", cmd: "Help" },
  ];
}

const FUNC_META = {
  add: { label: "Created", color: "#16a34a" },
  edit: { label: "Updated", color: "#2563eb" },
  remove: { label: "Deleted", color: "#dc2626" },
  get: { label: "Found", color: "#7c3aed" },
  all: { label: "Listed", color: "#0891b2" },
  filter: { label: "Filtered", color: "#d97706" },
  advfilter: { label: "Filtered", color: "#d97706" },
  search: { label: "Search", color: "#d97706" },
  byroll: { label: "Found", color: "#7c3aed" },
  exists: { label: "Checked", color: "#7c3aed" },
  duplicates: { label: "Duplicates", color: "#d97706" },
  help: { label: "Help", color: "#0891b2" },
  sort: { label: "Sorted", color: "#0891b2" },
  page: { label: "Page", color: "#0891b2" },
  count: { label: "Count", color: "#0891b2" },
  avgage: { label: "Avg Age", color: "#0891b2" },
  grades: { label: "Grades", color: "#0891b2" },
  oldest: { label: "Oldest", color: "#7c3aed" },
  youngest: { label: "Youngest", color: "#7c3aed" },
  bycity: { label: "By City", color: "#0891b2" },
  top: { label: "Top", color: "#16a34a" },
  summary: { label: "Summary", color: "#0891b2" },
  addmany: { label: "Bulk created", color: "#16a34a" },
  editwhere: { label: "Bulk updated", color: "#2563eb" },
  deletewhere: { label: "Bulk deleted", color: "#dc2626" },
  deleteall: { label: "Cleared", color: "#dc2626" },
  promote: { label: "Promoted", color: "#16a34a" },
  addyear: { label: "Age +1", color: "#2563eb" },
  setfield: { label: "Field set", color: "#2563eb" },
  swapgrade: { label: "Swapped", color: "#7c3aed" },
  archive: { label: "Archived", color: "#52525b" },
};

const MUTATING = new Set([
  "add","edit","remove","editwhere","deletewhere","deleteall",
  "addmany","promote","addyear","setfield","swapgrade","archive",
]);

const SHOW_CARDS = new Set([
  "get","filter","advfilter","search","all","sort","page","byroll","top",
]);

function EmojiPicker({ onSelect, onClose }) {
  return (
    <div style={{
      position: "absolute", bottom: "calc(100% + 6px)", left: 0,
      background: "#fff", border: "1px solid #e4e4e7", borderRadius: 10,
      padding: 8, display: "flex", flexWrap: "wrap", gap: 4, width: 196,
      boxShadow: "0 4px 16px rgba(0,0,0,0.10)", zIndex: 200,
      animation: "slideUp 0.15s ease",
    }}>
      {EMOJIS.map((e) => (
        <button key={e} onClick={() => { onSelect(e); onClose(); }}
          style={{
            width: 30, height: 30, background: "none", border: "1px solid transparent",
            borderRadius: 6, cursor: "pointer", fontSize: 16,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
          onMouseEnter={(ev) => (ev.currentTarget.style.background = "#f4f4f5")}
          onMouseLeave={(ev) => (ev.currentTarget.style.background = "none")}
        >{e}</button>
      ))}
    </div>
  );
}

function ResponseRating({ msg }) {
  const [rated, setRated] = useState(null);
  const handleRate = async (rating) => {
    if (rated) return;
    setRated(rating);
    const functionNames = (msg.details || []).map((d) => d.function).join(",");
    try {
      await fetch(`${API_BASE}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message_text: msg.text || "", function_names: functionNames, rating }),
      });
    } catch (e) { console.error("Feedback error:", e); }
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
      <span style={{ fontSize: 10, color: "#a1a1aa" }}>Was this helpful?</span>
      <button onClick={() => handleRate("helpful")} style={{
        background: rated === "helpful" ? "#dcfce7" : "#fafafa",
        border: `1px solid ${rated === "helpful" ? "#16a34a" : "#e4e4e7"}`,
        borderRadius: 6, padding: "2px 7px", fontSize: 12,
        cursor: rated ? "default" : "pointer",
        color: rated === "helpful" ? "#16a34a" : "#71717a", transition: "all 0.15s",
      }}>👍</button>
      <button onClick={() => handleRate("not_helpful")} style={{
        background: rated === "not_helpful" ? "#fee2e2" : "#fafafa",
        border: `1px solid ${rated === "not_helpful" ? "#dc2626" : "#e4e4e7"}`,
        borderRadius: 6, padding: "2px 7px", fontSize: 12,
        cursor: rated ? "default" : "pointer",
        color: rated === "not_helpful" ? "#dc2626" : "#71717a", transition: "all 0.15s",
      }}>👎</button>
      {rated && (
        <span style={{ fontSize: 10, color: rated === "helpful" ? "#16a34a" : "#dc2626" }}>
          {rated === "helpful" ? "Thanks!" : "Got it"}
        </span>
      )}
    </div>
  );
}

function InlineQuickReplies({ replies, onSelect }) {
  return (
    <div style={{
      display: "flex", flexWrap: "wrap", gap: 5, marginTop: 10,
      animation: "fadeIn 0.2s ease",
    }}>
      {replies.map(({ label, cmd }) => (
        <button
          key={cmd}
          onClick={() => onSelect(cmd)}
          style={{
            fontSize: 11, padding: "5px 11px",
            background: "#f4f4f5", border: "1px solid #e4e4e7",
            borderRadius: 20, color: "#3f3f46", cursor: "pointer",
            transition: "all 0.12s", whiteSpace: "nowrap",
            fontFamily: "inherit",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#e9e9eb";
            e.currentTarget.style.borderColor = "#d4d4d8";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#f4f4f5";
            e.currentTarget.style.borderColor = "#e4e4e7";
          }}
        >{label}</button>
      ))}
    </div>
  );
}

function ChatMessage({ msg, isLast, chatLoading, onQuickReply, activeQuickReplies }) {
  const isUser = msg.role === "user";

  if (isUser) {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
        <div style={{
          background: "#18181b", color: "#fff",
          borderRadius: "14px 14px 3px 14px",
          padding: "8px 13px", fontSize: 13, maxWidth: "80%", lineHeight: 1.5,
        }}>{msg.text}</div>
      </div>
    );
  }

  const details = msg.details || [];
  const showDetails = details.length > 0;
  const isMeaningfulResponse = msg.text !== "What would you like to do?" && (showDetails || msg.text);

  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "flex-start" }}>
      <div style={{
        width: 22, height: 22, borderRadius: "50%", background: "#18181b",
        flexShrink: 0, marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#a3e635" }} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {msg.text && (
          <div style={{ fontSize: 13, color: "#27272a", lineHeight: 1.55, marginBottom: showDetails ? 6 : 0 }}>
            {msg.text}
          </div>
        )}

        {showDetails && details.map((d, i) => {
          if (d.function === "chitchat") return null;

          const meta = FUNC_META[d.function] || { label: d.function, color: "#52525b" };
          const result = d.result;
          const isArr = Array.isArray(result);
          const students = d.function === "page" && result?.students ? result.students : null;
          const count = students ? students.length : isArr ? result.length : null;

          const scalarResult =
            d.function === "count" ? `${result?.count ?? "?"} students`
            : d.function === "avgage" ? `Avg age: ${result?.average_age ?? "?"}`
            : d.function === "exists" ? (result?.exists ? "Yes, exists" : "Not found")
            : d.function === "oldest" ? (result ? `${result.name} (${result.age}y)` : "—")
            : d.function === "youngest" ? (result ? `${result.name} (${result.age}y)` : "—")
            : d.function === "summary" ? null
            : d.function === "swapgrade" ? d.message
            : null;

          return (
            <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: i < details.length - 1 ? 3 : 0 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: meta.color, flexShrink: 0 }}>
                {meta.label}
              </span>
              <span style={{ fontSize: 12, color: d.success ? "#3f3f46" : "#dc2626" }}>
                {d.success
                  ? scalarResult !== null ? scalarResult
                    : count !== null ? `${count} student${count !== 1 ? "s" : ""}`
                    : result?.name ? `${result.name} (#${result.id})`
                    : d.message
                  : d.message}
              </span>
            </div>
          );
        })}

        {showDetails && details.map((d, i) => {
          if (d.function === "chitchat") return null;

          const result = d.result;
          const list = d.function === "page" && result?.students ? result.students
            : Array.isArray(result) ? result : null;
          const showCards = d.success && list && list.length > 0 && SHOW_CARDS.has(d.function);

          if (d.function === "grades" && d.success && result && !Array.isArray(result)) {
            return (
              <div key={`grades-${i}`} style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 2 }}>
                {Object.entries(result).map(([g, c]) => (
                  <div key={g} style={{ display: "flex", justifyContent: "space-between", background: "#fafafa", border: "1px solid #e4e4e7", borderRadius: 6, padding: "4px 10px", fontSize: 12 }}>
                    <span style={{ fontWeight: 600, color: "#18181b" }}>Grade {g}</span>
                    <span style={{ color: "#71717a" }}>{c} student{c !== 1 ? "s" : ""}</span>
                  </div>
                ))}
              </div>
            );
          }

          if (d.function === "help" && d.success && result) {
            return (
              <div key={`help-${i}`} style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 8 }}>
                {result.categories.map(cat => (
                  <div key={cat.name}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#0891b2", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{cat.name}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      {cat.commands.map(cmd => (
                        <div key={cmd} style={{ background: "#fafafa", border: "1px solid #e4e4e7", borderRadius: 6, padding: "4px 10px", fontSize: 11, color: "#3f3f46" }}>{cmd}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          }

          if (d.function === "get" && d.success && result && !Array.isArray(result)) {
            return (
              <div key={`get-${i}`} style={{ marginTop: 6, background: "#fafafa", border: "1px solid #e4e4e7", borderRadius: 8, padding: "5px 10px", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 600, color: "#18181b" }}>
                  {result.name}<span style={{ fontWeight: 400, color: "#a1a1aa", marginLeft: 4 }}>#{result.id}</span>
                </span>
                <span style={{ color: "#71717a" }}>{result.roll_no} · Gr {result.grade} · {result.age}y</span>
              </div>
            );
          }

          if (d.function === "bycity" && d.success && result && !Array.isArray(result)) {
            return (
              <div key={`bycity-${i}`} style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 2 }}>
                {Object.entries(result).map(([city, arr]) => (
                  <div key={city} style={{ display: "flex", justifyContent: "space-between", background: "#fafafa", border: "1px solid #e4e4e7", borderRadius: 6, padding: "4px 10px", fontSize: 12 }}>
                    <span style={{ fontWeight: 600, color: "#18181b" }}>{city}</span>
                    <span style={{ color: "#71717a" }}>{arr.length} student{arr.length !== 1 ? "s" : ""}</span>
                  </div>
                ))}
              </div>
            );
          }

          if (d.function === "duplicates" && d.success && result && !Array.isArray(result)) {
            return (
              <div key={`duplicates-${i}`} style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 4 }}>
                {Object.entries(result).map(([val, arr]) => (
                  <div key={val}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#d97706", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>{val}</div>
                    {arr.map(s => (
                      <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fafafa", border: "1px solid #e4e4e7", borderRadius: 8, padding: "5px 10px", fontSize: 12, marginBottom: 2 }}>
                        <span style={{ fontWeight: 600, color: "#18181b" }}>{s.name}<span style={{ fontWeight: 400, color: "#a1a1aa", marginLeft: 4 }}>#{s.id}</span></span>
                        <span style={{ color: "#71717a" }}>Gr {s.grade} · {s.age}y</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            );
          }

          if (d.function === "summary" && d.success && result) {
            return (
              <div key={`summary-${i}`} style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 2 }}>
                {[
                  { label: "Total", value: result.total_students },
                  { label: "Avg Age", value: result.average_age ?? "—" },
                  { label: "Oldest", value: result.oldest_age ?? "—" },
                  { label: "Youngest", value: result.youngest_age ?? "—" },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", background: "#fafafa", border: "1px solid #e4e4e7", borderRadius: 6, padding: "4px 10px", fontSize: 12 }}>
                    <span style={{ fontWeight: 600, color: "#18181b" }}>{label}</span>
                    <span style={{ color: "#71717a" }}>{value}</span>
                  </div>
                ))}
                {Object.entries(result.grade_distribution || {}).map(([g, c]) => (
                  <div key={g} style={{ display: "flex", justifyContent: "space-between", background: "#fafafa", border: "1px solid #e4e4e7", borderRadius: 6, padding: "4px 10px", fontSize: 12 }}>
                    <span style={{ fontWeight: 600, color: "#18181b" }}>Grade {g}</span>
                    <span style={{ color: "#71717a" }}>{c} student{c !== 1 ? "s" : ""}</span>
                  </div>
                ))}
              </div>
            );
          }

          if (!showCards) return null;
          return (
            <div key={`cards-${i}`} style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 3 }}>
              {list.map((s) => (
                <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fafafa", border: "1px solid #e4e4e7", borderRadius: 8, padding: "5px 10px", fontSize: 12 }}>
                  <span style={{ fontWeight: 600, color: "#18181b" }}>
                    {s.name}<span style={{ fontWeight: 400, color: "#a1a1aa", marginLeft: 4 }}>#{s.id}</span>
                  </span>
                  <span style={{ color: "#71717a" }}>Gr {s.grade} · {s.age}y</span>
                </div>
              ))}
            </div>
          );
        })}

        {isLast && !chatLoading && isMeaningfulResponse && (
          <ResponseRating msg={msg} />
        )}

        {isLast && !chatLoading && activeQuickReplies && activeQuickReplies.length > 0 && (
          <InlineQuickReplies replies={activeQuickReplies} onSelect={onQuickReply} />
        )}

        {msg.navigate && msg.navigate.path !== "/students" && (
          <button onClick={msg.onNavigate} style={{ marginTop: 7, fontSize: 11, padding: "3px 10px", background: "#18181b", border: "none", borderRadius: 6, color: "#fff", cursor: "pointer" }}>
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
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "#a1a1aa", animation: "chatDot 1.2s infinite", animationDelay: `${i * 0.2}s` }} />
      ))}
    </div>
  );
}

export default function Page() {
  const router = useRouter();

  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", text: "What would you like to do?" },
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [activeQuickReplies, setActiveQuickReplies] = useState(QUICK_REPLIES_INITIAL);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const emojiRef = useRef(null);

  const fetchStudents = async () => {
    try {
      const res = await fetch(`${API_BASE}/students`);
      setStudents(await res.json());
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchStudents(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, chatLoading]);
  useEffect(() => { if (chatOpen) setTimeout(() => inputRef.current?.focus(), 80); }, [chatOpen]);
  useEffect(() => {
    const handleClick = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) setShowEmoji(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const sendChat = async (text) => {
    const cmd = (text || chatInput).trim();
    if (!cmd || chatLoading) return;
    setChatInput("");
    setShowEmoji(false);
    setActiveQuickReplies([]);
    setMessages((p) => [...p, { role: "user", text: cmd }]);
    setChatLoading(true);

    try {
      const res = await fetch(`${API_BASE}/command`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: cmd }),
      });
      const data = await res.json();
      const newDetails = data.details || [];

      setMessages((p) => [
        ...p,
        {
          role: "assistant",
          text: data.message || (data.success ? "" : "Something went wrong."),
          details: newDetails,
          navigate: data.navigate,
          onNavigate: data.navigate ? () => router.push(data.navigate.path) : undefined,
        },
      ]);

      const newReplies = getContextualQuickReplies(cmd, newDetails);
      setActiveQuickReplies(newReplies);

      if (newDetails.some((d) => d.success && MUTATING.has(d.function))) fetchStudents();
    } catch {
      setMessages((p) => [...p, { role: "assistant", text: "Can't reach the server." }]);
      setActiveQuickReplies(QUICK_REPLIES_INITIAL);
    } finally {
      setChatLoading(false);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.grade?.toString().toLowerCase().includes(search.toLowerCase()) ||
      s.id?.toString().includes(search),
  );

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes chatDot { 0%,80%,100%{opacity:.3;transform:scale(1)} 40%{opacity:1;transform:scale(1.3)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
        .row-hover:hover { background: #f4f4f5 !important; cursor: pointer; }
        .search-input:focus { outline: none; border-color: #18181b !important; }
        .chat-ta:focus { outline: none; }
        .send-btn:hover:not(:disabled) { background: #27272a !important; }
        .fab:hover { transform: scale(1.06); }
        .fab { transition: transform 0.15s; }
        .add-btn:hover { background: #27272a !important; }
        .emoji-btn:hover { background: #f4f4f5 !important; }
      `}</style>

      <header style={{ background: "#fff", borderBottom: "1px solid #e4e4e7", padding: "0 40px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "#18181b", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a3e635" strokeWidth="2.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#18181b", letterSpacing: "-0.02em" }}>Students</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => router.push("/")} style={{ fontSize: 13, color: "#71717a", background: "none", border: "none", cursor: "pointer", padding: "4px 8px" }}>← Home</button>
          <button className="add-btn" onClick={() => router.push("/create")} style={{ fontSize: 13, fontWeight: 600, color: "#fff", background: "#18181b", border: "none", borderRadius: 8, padding: "7px 16px", cursor: "pointer", transition: "background 0.15s" }}>Add student</button>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "36px 24px 80px" }}>
        <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
          {[{ label: "Total", value: students.length }, { label: "Shown", value: filteredStudents.length }].map((stat) => (
            <div key={stat.label} style={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: 10, padding: "12px 20px" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#18181b", letterSpacing: "-0.03em" }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: "#a1a1aa", marginTop: 1 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={{ position: "relative", marginBottom: 16 }}>
          <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input className="search-input" type="text" placeholder="Search by name, grade or ID…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: "100%", padding: "10px 12px 10px 34px", border: "1px solid #e4e4e7", borderRadius: 9, fontSize: 13, color: "#18181b", background: "#fff", transition: "border-color 0.15s" }} />
        </div>

        <div style={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: 12, overflow: "hidden" }}>
          <Table>
            <TableHeader>
              <TableRow style={{ background: "#fafafa" }}>
                {["ID", "Name", "Grade", "Age", "Address"].map((h) => (
                  <TableHead key={h} style={{ fontSize: 11, fontWeight: 600, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.06em", padding: "10px 16px", borderBottom: "1px solid #e4e4e7" }}>{h}</TableHead>
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
              ) : (
                filteredStudents.map((s, i) => (
                  <TableRow key={s.id} className="row-hover" onClick={() => router.push(`/read/${s.id}`)} style={{ borderTop: i === 0 ? "none" : "1px solid #f4f4f5", transition: "background 0.1s" }}>
                    <TableCell style={{ padding: "12px 16px", fontSize: 12, color: "#a1a1aa", fontVariantNumeric: "tabular-nums" }}>#{s.id}</TableCell>
                    <TableCell style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "#18181b" }}>{s.name}</TableCell>
                    <TableCell style={{ padding: "12px 16px" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: "#f4f4f5", color: "#52525b" }}>{s.grade}</span>
                    </TableCell>
                    <TableCell style={{ padding: "12px 16px", fontSize: 13, color: "#3f3f46" }}>{s.age}</TableCell>
                    <TableCell style={{ padding: "12px 16px", fontSize: 13, color: "#71717a" }}>{s.address || "—"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>

      <button className="fab" onClick={() => setChatOpen((o) => !o)} style={{ position: "fixed", bottom: 24, right: 24, width: 50, height: 50, borderRadius: "50%", background: "#18181b", border: "none", cursor: "pointer", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(0,0,0,0.22)" }}>
        {chatOpen ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
        )}
        {!chatOpen && <div style={{ position: "absolute", top: 10, right: 10, width: 8, height: 8, borderRadius: "50%", background: "#a3e635", border: "2px solid #18181b" }} />}
      </button>

      {chatOpen && (
        <div style={{ position: "fixed", bottom: 84, right: 24, width: 340, height: 530, background: "#fff", borderRadius: 16, border: "1px solid #e4e4e7", boxShadow: "0 8px 32px rgba(0,0,0,0.14)", display: "flex", flexDirection: "column", overflow: "hidden", zIndex: 99, animation: "slideUp 0.18s ease" }}>
          <div style={{ padding: "13px 16px 11px", borderBottom: "1px solid #f4f4f5", display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "#18181b", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#a3e635" }} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#18181b" }}>Assistant</div>
              <div style={{ fontSize: 10, color: chatLoading ? "#d97706" : "#a3e635", fontWeight: 500 }}>
                {chatLoading ? "Thinking…" : "Online"}
              </div>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px 8px", scrollbarWidth: "thin", scrollbarColor: "#e4e4e7 transparent" }}>
            {messages.map((msg, i) => (
              <ChatMessage
                key={i}
                msg={msg}
                isLast={i === messages.length - 1}
                chatLoading={chatLoading}
                onQuickReply={sendChat}
                activeQuickReplies={i === messages.length - 1 ? activeQuickReplies : null}
              />
            ))}
            {chatLoading && <TypingDots />}
            <div ref={bottomRef} />
          </div>

          <div style={{ padding: "10px 12px", borderTop: "1px solid #f4f4f5", display: "flex", gap: 7, alignItems: "flex-end", position: "relative" }}>
            <div ref={emojiRef} style={{ position: "relative", flexShrink: 0 }}>
              <button className="emoji-btn" onClick={() => setShowEmoji((o) => !o)} style={{ width: 30, height: 30, borderRadius: 8, background: showEmoji ? "#f4f4f5" : "none", border: "1px solid transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, transition: "background 0.1s" }}>😊</button>
              {showEmoji && (
                <EmojiPicker onSelect={(e) => { setChatInput((prev) => prev + e); inputRef.current?.focus(); }} onClose={() => setShowEmoji(false)} />
              )}
            </div>
            <textarea ref={inputRef} className="chat-ta" rows={1} value={chatInput} onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
              placeholder="Ask anything…" disabled={chatLoading}
              style={{ flex: 1, resize: "none", border: "1px solid #e4e4e7", borderRadius: 9, padding: "8px 11px", fontSize: 13, fontFamily: "inherit", color: "#18181b", background: "#fafafa", lineHeight: 1.5, maxHeight: 80, overflow: "auto" }}
            />
            <button className="send-btn" onClick={() => sendChat()} disabled={!chatInput.trim() || chatLoading}
              style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, background: chatInput.trim() && !chatLoading ? "#18181b" : "#f4f4f5", border: "none", cursor: chatInput.trim() ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={chatInput.trim() && !chatLoading ? "#fff" : "#a1a1aa"} strokeWidth="2.5" strokeLinecap="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}