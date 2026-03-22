import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { Sun, Moon, History, X, RotateCcw, Trash2, User, ChevronDown } from 'lucide-react';
import { Navigate, useNavigate } from "react-router-dom";
import Chatbot from "./Chatbot";

function Compiler() {
  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState(getDefaultCode('cpp'));
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [stderr, setStderr] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState('dark');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [restoreConfirm, setRestoreConfirm] = useState(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const profileMenuRef = useRef(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/login" />;

  // close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await axios.get("http://localhost:8080/api/history", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const toggleHistory = () => {
    if (!historyOpen) fetchHistory();
    setHistoryOpen((prev) => !prev);
    setProfileMenuOpen(false);
  };

  const handleRestore = (entry) => setRestoreConfirm(entry);

  const confirmRestore = () => {
    setCode(restoreConfirm.code);
    setLanguage(restoreConfirm.language);
    setRestoreConfirm(null);
    setHistoryOpen(false);
  };

  const handleDeleteHistory = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/history/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory((prev) => prev.filter((h) => h._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleDownload = async () => {
    const response = await axios.post(
      "http://localhost:8080/api/download",
      { code, language },
      { responseType: "blob" }
    );
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([response.data]));
    link.download = `code.${language}`;
    link.click();
  };

  const handleSave = async () => {
    const filename = prompt("Enter snippet filename:");
    if (!filename) return;
    try {
      await axios.post(
        "http://localhost:8080/api/save",
        { filename, language, code },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Snippet saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save snippet");
    }
  };

  const handleRun = async () => {
    setLoading(true);
    setOutput('');
    setStderr('');
    setError('');
    try {
      const response = await axios.post('http://localhost:8080/run', {
        language, code, input: input.trim()
      });
      const data = response.data;
      if (data.success) {
        setOutput(data.output || '(no output)');
        setStderr(data.stderr || '');
        await axios.post("http://localhost:8080/api/history",
          { code, language, output: data.output, status: 'success' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        setError(data.error || 'Unknown error');
        await axios.post("http://localhost:8080/api/history",
          { code, language, output: data.error, status: 'error' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.details ||
        err.response?.data?.error ||
        err.message ||
        'Failed to connect to server'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  useEffect(() => {
    const savedCode = localStorage.getItem("loadedCode");
    const savedLang = localStorage.getItem("loadedLanguage");
    if (savedCode && savedLang) {
      setCode(savedCode);
      setLanguage(savedLang);
      localStorage.removeItem("loadedCode");
      localStorage.removeItem("loadedLanguage");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  function getDefaultCode(lang) {
    const templates = {
      cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << "Sum: " << a + b << endl;\n    return 0;\n}`,
      python: `a = int(input())\nb = int(input())\nprint("Sum:", a + b)`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int a = sc.nextInt();\n        int b = sc.nextInt();\n        System.out.println("Sum: " + (a + b));\n    }\n}`
    };
    return templates[lang] || '// Write your code here';
  }

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    setCode(getDefaultCode(newLang));
  };

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  // ─── Shared inline styles ────────────────────────────────────

  const headerBg = theme === 'dark' ? '#111827' : '#ffffff';
  const pageBg = theme === 'dark' ? '#030712' : '#f9fafb';
  const textColor = theme === 'dark' ? '#f3f4f6' : '#111827';
  const borderColor = theme === 'dark' ? '#374151' : '#e5e7eb';
  const panelBg = theme === 'dark' ? '#111827' : '#ffffff';
  const inputBg = theme === 'dark' ? '#030712' : '#ffffff';
  const cardBg = theme === 'dark' ? '#1f2937' : '#f9fafb';
  const mutedText = theme === 'dark' ? '#9ca3af' : '#6b7280';
  const dropdownBg = theme === 'dark' ? '#1f2937' : '#ffffff';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: pageBg, color: textColor, display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <header style={{
        backgroundColor: headerBg,
        borderBottom: `1px solid ${borderColor}`,
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: theme === 'dark' ? '#60a5fa' : '#2563eb' }}>
          My Online Compiler
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: textColor, padding: '6px', borderRadius: '50%',
              display: 'flex', alignItems: 'center'
            }}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Language select */}
          <select
            value={language}
            onChange={handleLanguageChange}
            style={{
              padding: '6px 12px', borderRadius: '6px',
              border: `1px solid ${borderColor}`,
              backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
              color: theme === 'dark' ? '#93c5fd' : '#1d4ed8',
              fontSize: '13px', fontWeight: 500, cursor: 'pointer'
            }}
          >
            <option value="cpp">C++</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>

          {/* Run button */}
          <button
            onClick={handleRun}
            disabled={loading}
            style={{
              padding: '8px 24px', borderRadius: '6px', border: 'none',
              fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              backgroundColor: loading ? '#4b5563' : '#2563eb',
              color: 'white', fontSize: '14px'
            }}
          >
            {loading ? 'Running...' : 'Run'}
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            style={{
              padding: '8px 16px', borderRadius: '6px', border: `1px solid ${borderColor}`,
              backgroundColor: 'transparent', color: textColor,
              cursor: 'pointer', fontSize: '13px', fontWeight: 500
            }}
          >
            Download
          </button>

          {/* Save */}
          <button
            onClick={handleSave}
            style={{
              padding: '8px 16px', borderRadius: '6px', border: 'none',
              backgroundColor: theme === 'dark' ? '#d97706' : '#f59e0b',
              color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: 600
            }}
          >
            Save
          </button>

          {/* Profile dropdown */}
          <div ref={profileMenuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setProfileMenuOpen((prev) => !prev)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', borderRadius: '6px', border: `1px solid ${borderColor}`,
                backgroundColor: profileMenuOpen
                  ? (theme === 'dark' ? '#374151' : '#f3f4f6')
                  : 'transparent',
                color: textColor, cursor: 'pointer', fontSize: '13px', fontWeight: 500
              }}
            >
              <User size={16} />
              My Profile
              <ChevronDown size={14} style={{
                transform: profileMenuOpen ? 'rotate(180deg)' : 'rotate(0)',
                transition: 'transform 0.2s'
              }} />
            </button>

            {/* Dropdown Menu */}
            {profileMenuOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                backgroundColor: dropdownBg,
                border: `1px solid ${borderColor}`,
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                minWidth: '180px',
                zIndex: 100,
                overflow: 'hidden'
              }}>

                {/* History */}
                <button
                  onClick={toggleHistory}
                  style={{
                    width: '100%', padding: '10px 16px',
                    display: 'flex', alignItems: 'center', gap: '10px',
                    background: historyOpen
                      ? (theme === 'dark' ? '#7c3aed' : '#ede9fe')
                      : 'none',
                    border: 'none',
                    borderBottom: `1px solid ${borderColor}`,
                    color: historyOpen ? (theme === 'dark' ? 'white' : '#5b21b6') : textColor,
                    cursor: 'pointer', fontSize: '13px', textAlign: 'left'
                  }}
                >
                  <History size={15} />
                  Execution History
                </button>

                {/* My Snippets */}
                <button
                  onClick={() => { window.location.href = "/save"; setProfileMenuOpen(false); }}
                  style={{
                    width: '100%', padding: '10px 16px',
                    display: 'flex', alignItems: 'center', gap: '10px',
                    background: 'none', border: 'none',
                    borderBottom: `1px solid ${borderColor}`,
                    color: textColor, cursor: 'pointer',
                    fontSize: '13px', textAlign: 'left'
                  }}
                >
                  📁 My Snippets
                </button>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%', padding: '10px 16px',
                    display: 'flex', alignItems: 'center', gap: '10px',
                    background: 'none', border: 'none',
                    color: '#f87171', cursor: 'pointer',
                    fontSize: '13px', textAlign: 'left'
                  }}
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Code Editor */}
        <div style={{ flex: 1, borderRight: `1px solid ${borderColor}` }}>
          <Editor
            height="100%"
            language={language === 'cpp' ? 'cpp' : language}
            theme={theme === 'dark' ? 'vs-dark' : 'vs'}
            value={code}
            onChange={(value) => setCode(value || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 16 },
            }}
          />
        </div>

        {/* Right Panel - Input/Output */}
        <div style={{
          width: '41.666%', display: 'flex', flexDirection: 'column',
          borderLeft: `1px solid ${borderColor}`, overflow: 'hidden'
        }}>
          {/* Input */}
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            borderBottom: `1px solid ${borderColor}`, padding: '24px'
          }}>
            <h2 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: 600 }}>Input</h2>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Enter your input here (stdin)\nExample:\n45\n19`}
              style={{
                flex: 1, width: '100%', padding: '14px',
                borderRadius: '8px', border: `1px solid ${borderColor}`,
                backgroundColor: inputBg, color: textColor,
                fontFamily: 'monospace', fontSize: '13px',
                resize: 'none', outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Output */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px' }}>
            <h2 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: 600 }}>Output</h2>
            {error ? (
              <div style={{
                flex: 1, padding: '14px', borderRadius: '8px',
                border: '1px solid #ef4444', backgroundColor: theme === 'dark' ? 'rgba(239,68,68,0.1)' : '#fef2f2',
                color: theme === 'dark' ? '#fca5a5' : '#991b1b',
                fontFamily: 'monospace', fontSize: '13px', overflow: 'auto'
              }}>
                {error}
              </div>
            ) : (
              <>
                <pre style={{
                  flex: 1, width: '100%', padding: '14px',
                  borderRadius: '8px', border: `1px solid ${borderColor}`,
                  backgroundColor: inputBg,
                  color: theme === 'dark' ? '#93c5fd' : '#1e40af',
                  fontFamily: 'monospace', fontSize: '13px',
                  whiteSpace: 'pre-wrap', overflow: 'auto', margin: 0,
                  boxSizing: 'border-box'
                }}>
                  {output || (loading ? 'Executing code...' : 'Run your code to see output')}
                </pre>
                {stderr && (
                  <div style={{ marginTop: '16px' }}>
                    <h3 style={{ fontSize: '13px', fontWeight: 500, color: '#f87171', marginBottom: '8px' }}>Stderr:</h3>
                    <pre style={{
                      padding: '14px', borderRadius: '8px',
                      border: `1px solid #ef4444`,
                      backgroundColor: theme === 'dark' ? 'rgba(239,68,68,0.05)' : '#fef2f2',
                      color: theme === 'dark' ? '#fca5a5' : '#991b1b',
                      fontFamily: 'monospace', fontSize: '13px',
                      whiteSpace: 'pre-wrap', overflow: 'auto', margin: 0
                    }}>
                      {stderr}
                    </pre>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* History Side Panel */}
        {historyOpen && (
          <div style={{
            width: '320px', flexShrink: 0, display: 'flex', flexDirection: 'column',
            borderLeft: `1px solid ${borderColor}`, backgroundColor: panelBg
          }}>
            {/* Panel Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 16px', borderBottom: `1px solid ${borderColor}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History size={16} style={{ color: '#a78bfa' }} />
                <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Execution History</h2>
              </div>
              <button
                onClick={() => setHistoryOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: mutedText }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Panel Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {historyLoading ? (
                <p style={{ fontSize: '13px', color: mutedText, textAlign: 'center', marginTop: '32px' }}>Loading history...</p>
              ) : history.length === 0 ? (
                <p style={{ fontSize: '13px', color: mutedText, textAlign: 'center', marginTop: '32px' }}>No executions yet. Hit Run!</p>
              ) : (
                history.map((entry) => (
                  <div key={entry._id} style={{
                    borderRadius: '8px', border: `1px solid ${borderColor}`,
                    padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px',
                    backgroundColor: cardBg
                  }}>
                    {/* Card Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '999px',
                          backgroundColor: entry.language === 'python' ? 'rgba(234,179,8,0.15)'
                            : entry.language === 'java' ? 'rgba(249,115,22,0.15)'
                            : 'rgba(59,130,246,0.15)',
                          color: entry.language === 'python' ? '#fbbf24'
                            : entry.language === 'java' ? '#fb923c'
                            : '#60a5fa'
                        }}>
                          {entry.language}
                        </span>
                        <span style={{ fontSize: '11px', color: entry.status === 'success' ? '#4ade80' : '#f87171' }}>
                          {entry.status === 'success' ? '✅ Success' : '❌ Error'}
                        </span>
                      </div>
                      <span style={{ fontSize: '11px', color: mutedText }}>{formatTimeAgo(entry.executedAt)}</span>
                    </div>

                    {/* Code Preview */}
                    <pre style={{
                      fontSize: '11px', fontFamily: 'monospace',
                      borderRadius: '4px', padding: '6px 8px',
                      backgroundColor: theme === 'dark' ? '#030712' : '#f3f4f6',
                      color: mutedText, maxHeight: '55px', overflow: 'hidden', margin: 0
                    }}>
                      {entry.code.slice(0, 120)}{entry.code.length > 120 ? '...' : ''}
                    </pre>

                    {/* Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <button
                        onClick={() => handleRestore(entry)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '4px',
                          background: 'none', border: 'none', cursor: 'pointer',
                          fontSize: '12px', color: '#a78bfa'
                        }}
                      >
                        <RotateCcw size={12} /> Restore
                      </button>
                      <button
                        onClick={() => handleDeleteHistory(entry._id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '4px',
                          background: 'none', border: 'none', cursor: 'pointer',
                          fontSize: '12px', color: '#f87171'
                        }}
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Restore Modal */}
      {restoreConfirm && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(15, 23, 42, 0.97)'
          }}
          onClick={() => setRestoreConfirm(null)}
        >
          <div
            style={{
              backgroundColor: theme === 'dark' ? '#2d3748' : '#e2e8f0',
              border: '1px solid #4a5568', borderRadius: '12px',
              boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
              width: '100%', maxWidth: '700px', margin: '0 16px',
              display: 'flex', flexDirection: 'column', overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 24px', borderBottom: '1px solid #4a5568'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Restore this code?</h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#9ca3af' }}>
                  {restoreConfirm.language} • {formatTimeAgo(restoreConfirm.executedAt)} • {restoreConfirm.status === 'success' ? '✅ Success' : '❌ Error'}
                </p>
              </div>
              <button
                onClick={() => setRestoreConfirm(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', marginLeft: '16px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Full Code */}
            <div style={{ padding: '16px 24px' }}>
              <p style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Full Code
              </p>
              <pre style={{
                backgroundColor: theme === 'dark' ? '#1a202c' : '#cbd5e0',
                color: theme === 'dark' ? '#e2e8f0' : '#1a202c',
                borderRadius: '8px', padding: '16px', fontSize: '13px',
                fontFamily: 'monospace', overflowY: 'auto', maxHeight: '340px', margin: 0
              }}>
                {restoreConfirm.code}
              </pre>
            </div>

            {/* Footer */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 24px', borderTop: '1px solid #4a5568'
            }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#fbbf24' }}>
                ⚠️ Your current editor code will be replaced.
              </p>
              <div style={{ display: 'flex', gap: '12px', marginLeft: '16px' }}>
                <button
                  onClick={() => setRestoreConfirm(null)}
                  style={{
                    padding: '8px 20px', borderRadius: '6px', fontSize: '13px',
                    fontWeight: 500, cursor: 'pointer', border: 'none',
                    backgroundColor: theme === 'dark' ? '#4a5568' : '#a0aec0',
                    color: theme === 'dark' ? '#e2e8f0' : '#1a202c'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRestore}
                  style={{
                    padding: '8px 20px', borderRadius: '6px', fontSize: '13px',
                    fontWeight: 500, cursor: 'pointer', border: 'none',
                    backgroundColor: '#7c3aed', color: 'white'
                  }}
                >
                  Yes, Restore
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Chatbot code={code} />
    </div>
  );
}

export default Compiler;