import { useState } from "react";
import API from "./api";
import { Link, useNavigate } from "react-router-dom";
import { Code, LogIn } from "lucide-react";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const theme = localStorage.getItem("theme") || "dark";

  // ─── Theme values ─────────────────────────────────────────────
  const pageBg      = theme === "dark" ? "#030712" : "#f9fafb";
  const cardBg      = theme === "dark" ? "#111827" : "#ffffff";
  const textColor   = theme === "dark" ? "#f3f4f6" : "#111827";
  const mutedText   = theme === "dark" ? "#9ca3af" : "#6b7280";
  const borderColor = theme === "dark" ? "#374151" : "#e5e7eb";
  const inputBg     = theme === "dark" ? "#1f2937" : "#f9fafb";

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/login", { username, password });
      localStorage.setItem("token", res.data.token);
      navigate("/compile");
    } catch (err) {
      setMessage(err.response?.data?.error || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", backgroundColor: pageBg,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px"
    }}>
      <div style={{
        backgroundColor: cardBg, border: `1px solid ${borderColor}`,
        borderRadius: "12px", padding: "40px",
        width: "100%", maxWidth: "400px",
        boxShadow: "0 25px 50px rgba(0,0,0,0.3)"
      }}>

        {/* Logo / Title */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: "48px", height: "48px", borderRadius: "12px",
            backgroundColor: "rgba(37,99,235,0.15)", marginBottom: "16px"
          }}>
            <Code size={24} style={{ color: "#60a5fa" }} />
          </div>
          <h1 style={{ margin: "0 0 6px", fontSize: "22px", fontWeight: 700, color: textColor }}>
            My Online Compiler
          </h1>
          <p style={{ margin: 0, fontSize: "13px", color: mutedText }}>
            Sign in to your account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "13px", fontWeight: 500, color: mutedText }}>
              Username
            </label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                padding: "10px 14px", borderRadius: "6px",
                border: `1px solid ${borderColor}`, backgroundColor: inputBg,
                color: textColor, fontSize: "14px", outline: "none",
                transition: "border-color 0.2s"
              }}
              onFocus={(e) => e.target.style.borderColor = "#2563eb"}
              onBlur={(e) => e.target.style.borderColor = borderColor}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "13px", fontWeight: 500, color: mutedText }}>
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                padding: "10px 14px", borderRadius: "6px",
                border: `1px solid ${borderColor}`, backgroundColor: inputBg,
                color: textColor, fontSize: "14px", outline: "none",
                transition: "border-color 0.2s"
              }}
              onFocus={(e) => e.target.style.borderColor = "#2563eb"}
              onBlur={(e) => e.target.style.borderColor = borderColor}
            />
          </div>

          {/* Error message */}
          {message && (
            <div style={{
              padding: "10px 14px", borderRadius: "6px",
              backgroundColor: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#f87171", fontSize: "13px"
            }}>
              {message}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "11px", borderRadius: "6px", border: "none",
              backgroundColor: loading ? "#374151" : "#2563eb",
              color: "white", fontSize: "14px", fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              marginTop: "4px", transition: "background 0.2s"
            }}
            onMouseEnter={(e) => { if (!loading) e.target.style.backgroundColor = "#1d4ed8"; }}
            onMouseLeave={(e) => { if (!loading) e.target.style.backgroundColor = "#2563eb"; }}
          >
            <LogIn size={16} />
            {loading ? "Signing in..." : "Sign In"}
          </button>

        </form>

        {/* Register link */}
        <p style={{ margin: "24px 0 0", textAlign: "center", fontSize: "13px", color: mutedText }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "#60a5fa", textDecoration: "none", fontWeight: 500 }}>
            Create one
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Login;