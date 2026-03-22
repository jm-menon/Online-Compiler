import { useEffect, useState } from "react";
import axios from "axios";
import { Search, Pencil, Trash2, FolderOpen, X, Check, Code, ArrowLeft } from "lucide-react";

function Save() {
  const [savedFiles, setSavedFiles] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ filename: "", language: "", code: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const token = localStorage.getItem("token");

  // ─── Theme values ─────────────────────────────────────────────
  const pageBg       = theme === "dark" ? "#030712" : "#f9fafb";
  const headerBg     = theme === "dark" ? "#111827" : "#ffffff";
  const textColor    = theme === "dark" ? "#f3f4f6" : "#111827";
  const mutedText    = theme === "dark" ? "#9ca3af" : "#6b7280";
  const borderColor  = theme === "dark" ? "#374151" : "#e5e7eb";
  const cardBg       = theme === "dark" ? "#1f2937" : "#ffffff";
  const inputBg      = theme === "dark" ? "#111827" : "#ffffff";
  const hoverCardBg  = theme === "dark" ? "#374151" : "#f3f4f6";

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.trim() === "") {
      fetchSavedFiles();
      return;
    }
    try {
      const res = await axios.get(`http://localhost:8080/api/save/search?query=${value}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSavedFiles(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSavedFiles = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/save", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSavedFiles(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchSavedFiles(); }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/save/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSavedFiles((prev) => prev.filter((f) => f._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLoad = (savedFile) => {
    localStorage.setItem("loadedCode", savedFile.code);
    localStorage.setItem("loadedLanguage", savedFile.language);
    window.location.href = "/compile";
  };

  const startEdit = (savedFile) => {
    setEditingId(savedFile._id);
    setEditForm({ filename: savedFile.filename, language: savedFile.language, code: savedFile.code });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ filename: "", language: "", code: "" });
  };

  const handleEdit = async (id) => {
    try {
      const response = await axios.put(
        `http://localhost:8080/api/save/${id}`,
        editForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSavedFiles((prev) => prev.map((f) => f._id === id ? response.data : f));
      setEditingId(null);
      setEditForm({ filename: "", language: "", code: "" });
    } catch (err) {
      console.error(err);
    }
  };

  const langColor = (lang) => {
    if (lang === "python") return { bg: "rgba(234,179,8,0.15)", text: "#fbbf24" };
    if (lang === "java")   return { bg: "rgba(249,115,22,0.15)", text: "#fb923c" };
    return                        { bg: "rgba(59,130,246,0.15)",  text: "#60a5fa" };
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: pageBg, color: textColor, display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <header style={{
        backgroundColor: headerBg,
        borderBottom: `1px solid ${borderColor}`,
        padding: "14px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={() => window.location.href = "/compile"}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              background: "none", border: `1px solid ${borderColor}`,
              borderRadius: "6px", padding: "6px 12px",
              color: mutedText, cursor: "pointer", fontSize: "13px"
            }}
          >
            <ArrowLeft size={14} /> Back to Compiler
          </button>
          <h1 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: theme === "dark" ? "#60a5fa" : "#2563eb" }}>
            My Saved Files
          </h1>
        </div>

        {/* Search bar in header */}
        <div style={{ position: "relative", width: "280px" }}>
          <Search size={15} style={{
            position: "absolute", left: "10px", top: "50%",
            transform: "translateY(-50%)", color: mutedText, pointerEvents: "none"
          }} />
          <input
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search by filename..."
            style={{
              width: "100%", padding: "8px 12px 8px 32px",
              borderRadius: "6px", border: `1px solid ${borderColor}`,
              backgroundColor: inputBg, color: textColor,
              fontSize: "13px", outline: "none", boxSizing: "border-box"
            }}
          />
        </div>
      </header>

      {/* Body */}
      <div style={{ flex: 1, padding: "32px 24px" }}>

        {/* File count */}
        <p style={{ margin: "0 0 24px", fontSize: "13px", color: mutedText }}>
          {savedFiles.length === 0 ? "No files saved yet." : `${savedFiles.length} file${savedFiles.length !== 1 ? "s" : ""} saved`}
        </p>

        {savedFiles.length === 0 ? (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", gap: "12px", marginTop: "80px", color: mutedText
          }}>
            <Code size={48} style={{ opacity: 0.3 }} />
            <p style={{ fontSize: "16px", margin: 0 }}>No saved files yet</p>
            <p style={{ fontSize: "13px", margin: 0 }}>Head to the compiler and hit Save</p>
            <button
              onClick={() => window.location.href = "/compile"}
              style={{
                marginTop: "8px", padding: "8px 20px", borderRadius: "6px",
                border: "none", backgroundColor: "#2563eb", color: "white",
                cursor: "pointer", fontSize: "13px", fontWeight: 600
              }}
            >
              Go to Compiler
            </button>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "16px"
          }}>
            {savedFiles.map((savedFile) => (
              <div
                key={savedFile._id}
                style={{
                  backgroundColor: cardBg,
                  border: `1px solid ${borderColor}`,
                  borderRadius: "10px", padding: "16px",
                  display: "flex", flexDirection: "column", gap: "10px",
                  transition: "background 0.15s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = hoverCardBg}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = cardBg}
              >
                {editingId === savedFile._id ? (
                  // ── Edit mode ──
                  <>
                    <p style={{ margin: 0, fontSize: "11px", color: mutedText, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Editing
                    </p>
                    <input
                      value={editForm.filename}
                      onChange={(e) => setEditForm({ ...editForm, filename: e.target.value })}
                      placeholder="Filename"
                      style={{
                        padding: "7px 10px", borderRadius: "6px",
                        border: `1px solid ${borderColor}`, backgroundColor: inputBg,
                        color: textColor, fontSize: "13px", outline: "none"
                      }}
                    />
                    <input
                      value={editForm.language}
                      onChange={(e) => setEditForm({ ...editForm, language: e.target.value })}
                      placeholder="Language"
                      style={{
                        padding: "7px 10px", borderRadius: "6px",
                        border: `1px solid ${borderColor}`, backgroundColor: inputBg,
                        color: textColor, fontSize: "13px", outline: "none"
                      }}
                    />
                    <textarea
                      value={editForm.code}
                      onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                      placeholder="Code"
                      style={{
                        padding: "7px 10px", borderRadius: "6px",
                        border: `1px solid ${borderColor}`, backgroundColor: inputBg,
                        color: textColor, fontSize: "12px", fontFamily: "monospace",
                        height: "100px", resize: "none", outline: "none"
                      }}
                    />
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => handleEdit(savedFile._id)}
                        style={{
                          flex: 1, padding: "7px", borderRadius: "6px", border: "none",
                          backgroundColor: "#16a34a", color: "white",
                          cursor: "pointer", fontSize: "12px", fontWeight: 600,
                          display: "flex", alignItems: "center", justifyContent: "center", gap: "4px"
                        }}
                      >
                        <Check size={13} /> Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        style={{
                          flex: 1, padding: "7px", borderRadius: "6px", border: `1px solid ${borderColor}`,
                          backgroundColor: "transparent", color: mutedText,
                          cursor: "pointer", fontSize: "12px", fontWeight: 600,
                          display: "flex", alignItems: "center", justifyContent: "center", gap: "4px"
                        }}
                      >
                        <X size={13} /> Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  // ── View mode ──
                  <>
                    {/* Language badge */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{
                        fontSize: "11px", fontWeight: 600, padding: "2px 8px",
                        borderRadius: "999px",
                        backgroundColor: langColor(savedFile.language).bg,
                        color: langColor(savedFile.language).text
                      }}>
                        {savedFile.language}
                      </span>
                    </div>

                    {/* Filename */}
                    <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 600, wordBreak: "break-word" }}>
                      {savedFile.filename}
                    </h3>

                    {/* Code preview */}
                    <pre style={{
                      margin: 0, padding: "8px 10px", borderRadius: "6px",
                      backgroundColor: theme === "dark" ? "#030712" : "#f3f4f6",
                      color: mutedText, fontSize: "11px", fontFamily: "monospace",
                      maxHeight: "60px", overflow: "hidden",
                      borderLeft: `3px solid ${langColor(savedFile.language).text}`
                    }}>
                      {savedFile.code.slice(0, 100)}{savedFile.code.length > 100 ? "..." : ""}
                    </pre>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                      <button
                        onClick={() => handleLoad(savedFile)}
                        style={{
                          flex: 1, padding: "7px", borderRadius: "6px", border: "none",
                          backgroundColor: "#2563eb", color: "white",
                          cursor: "pointer", fontSize: "12px", fontWeight: 600,
                          display: "flex", alignItems: "center", justifyContent: "center", gap: "4px"
                        }}
                      >
                        <FolderOpen size={13} /> Open
                      </button>
                      <button
                        onClick={() => startEdit(savedFile)}
                        style={{
                          flex: 1, padding: "7px", borderRadius: "6px",
                          border: `1px solid ${borderColor}`,
                          backgroundColor: "transparent", color: textColor,
                          cursor: "pointer", fontSize: "12px", fontWeight: 600,
                          display: "flex", alignItems: "center", justifyContent: "center", gap: "4px"
                        }}
                      >
                        <Pencil size={13} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(savedFile._id)}
                        style={{
                          padding: "7px 10px", borderRadius: "6px", border: "none",
                          backgroundColor: "rgba(239,68,68,0.15)", color: "#f87171",
                          cursor: "pointer", fontSize: "12px",
                          display: "flex", alignItems: "center", justifyContent: "center"
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Save;