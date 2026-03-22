import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { Sun, Moon, History, X, RotateCcw, Trash2 } from 'lucide-react';
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

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/login" />;

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

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'} flex flex-col transition-colors duration-300`}>

      {/* Header */}
      <header className={`${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-b p-4 flex items-center justify-between shadow-sm`}>
        <h1 className="text-2xl font-bold">
          <span className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}>
            My Online Compiler
          </span>
        </h1>
        <div className="flex items-center gap-6">
          <button onClick={toggleTheme} className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition`}>
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <select
            value={language}
            onChange={handleLanguageChange}
            className={`px-4 py-2 rounded-md border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700 text-blue-300' : 'bg-white border-gray-300 text-blue-700'
            }`}
          >
            <option value="cpp">C++</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>
          <button
            onClick={handleRun}
            disabled={loading}
            className={`px-8 py-2.5 rounded-md font-semibold transition-all shadow-md ${
              loading ? 'bg-gray-600 cursor-not-allowed'
              : theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {loading ? 'Running...' : 'Run'}
          </button>
          <button
            onClick={toggleHistory}
            className={`flex items-center gap-2 px-5 py-2 rounded-md font-medium transition ${
              historyOpen ? 'bg-purple-600 text-white'
              : theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            }`}
          >
            <History size={16} />
            History
          </button>
          <button
            onClick={handleLogout}
            className={`px-5 py-2 rounded-md font-medium transition ${
              theme === "dark" ? "bg-red-600 hover:bg-red-700 text-white" : "bg-red-500 hover:bg-red-600 text-white"
            }`}
          >
            Logout
          </button>
          <button onClick={handleDownload}>Download Code</button>
          <button
            onClick={() => (window.location.href = "/save")}
            className="px-6 py-2 bg-gray-600 text-white rounded-md"
          >
            My Snippets
          </button>
          <button
            onClick={handleSave}
            className={`px-6 py-2 rounded-md font-semibold ${
              theme === "dark" ? "bg-yellow-600 hover:bg-yellow-700 text-white" : "bg-yellow-500 hover:bg-yellow-600 text-white"
            }`}
          >
            Save
          </button>
        </div>
      </header>

      {/* Main Area */}
      <div className="flex flex-1 overflow-hidden">

        {/* Code Editor */}
        <div className="flex-1 border-r border-gray-700 dark:border-gray-800">
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

        {/* Right Panel - Input/Output — overflow-hidden stops border-b from visually bleeding */}
        <div className="w-5/12 flex flex-col border-l border-gray-700 dark:border-gray-800 overflow-hidden">
          <div className="flex-1 flex flex-col border-b border-gray-700 dark:border-gray-800 p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Input</h2>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Enter your input here (stdin)\nExample:\n45\n19`}
              className={`flex-1 w-full p-4 rounded-lg border font-mono text-sm resize-none overflow-auto focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                theme === 'dark' ? 'bg-gray-900 border-gray-700 text-gray-200' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <div className="flex-1 flex flex-col p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Output</h2>
            {error ? (
              <div className="flex-1 p-4 rounded-lg border font-mono text-sm overflow-auto bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-800 dark:text-red-200">
                {error}
              </div>
            ) : (
              <>
                <pre className={`flex-1 w-full p-4 rounded-lg border font-mono text-sm whitespace-pre-wrap overflow-auto ${
                  theme === 'dark' ? 'bg-gray-900 border-gray-700 text-blue-200' : 'bg-white border-gray-300 text-blue-800'
                }`}>
                  {output || (loading ? 'Executing code...' : 'Run your code to see output')}
                </pre>
                {stderr && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">Stderr:</h3>
                    <pre className={`p-4 rounded-lg border font-mono text-sm whitespace-pre-wrap overflow-auto ${
                      theme === 'dark' ? 'bg-red-950/40 border-red-700 text-red-200' : 'bg-red-50 border-red-300 text-red-800'
                    }`}>
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
          <div className={`w-80 flex-shrink-0 flex flex-col border-l ${
            theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className={`flex items-center justify-between p-4 border-b ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center gap-2">
                <History size={16} className="text-purple-400" />
                <h2 className="font-semibold">Execution History</h2>
              </div>
              <button onClick={() => setHistoryOpen(false)} className="hover:text-red-400 transition">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
              {historyLoading ? (
                <p className="text-sm text-gray-400 text-center mt-8">Loading history...</p>
              ) : history.length === 0 ? (
                <p className="text-sm text-gray-400 text-center mt-8">No executions yet. Hit Run!</p>
              ) : (
                history.map((entry) => (
                  <div
                    key={entry._id}
                    className={`rounded-lg border p-3 flex flex-col gap-2 ${
                      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          entry.language === 'python' ? 'bg-yellow-500/20 text-yellow-400'
                          : entry.language === 'java' ? 'bg-orange-500/20 text-orange-400'
                          : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {entry.language}
                        </span>
                        <span className={`text-xs ${entry.status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                          {entry.status === 'success' ? '✅ Success' : '❌ Error'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">{formatTimeAgo(entry.executedAt)}</span>
                    </div>
                    <pre className={`text-xs font-mono rounded p-2 overflow-hidden ${
                      theme === 'dark' ? 'bg-gray-950 text-gray-400' : 'bg-gray-100 text-gray-600'
                    }`} style={{ maxHeight: '60px' }}>
                      {entry.code.slice(0, 120)}{entry.code.length > 120 ? '...' : ''}
                    </pre>
                    <div className="flex items-center justify-between mt-1">
                      <button
                        onClick={() => handleRestore(entry)}
                        className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition"
                      >
                        <RotateCcw size={12} />
                        Restore
                      </button>
                      <button
                        onClick={() => handleDeleteHistory(entry._id)}
                        className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition"
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Restore Modal — fixed, centered, full code visible */}
      {restoreConfirm && (
  <div
    style={{ backgroundColor: 'rgba(15, 23, 42, 1)' }}
    className="fixed inset-0 z-50 flex items-center justify-center"
    onClick={() => setRestoreConfirm(null)}
  >
    <div
      style={{ backgroundColor: theme === 'dark' ? '#2d3748' : '#e2e8f0' }}
      className="rounded-xl shadow-2xl w-full max-w-2xl mx-4 flex flex-col overflow-hidden border border-gray-500"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Modal Header */}
      <div style={{ borderBottom: '1px solid #4a5568' }} className="flex items-center justify-between px-6 py-4">
        <div>
          <h3 className="font-semibold text-lg">Restore this code?</h3>
          <p className="text-sm text-gray-400 mt-0.5">
            {restoreConfirm.language} • {formatTimeAgo(restoreConfirm.executedAt)} • {restoreConfirm.status === 'success' ? '✅ Success' : '❌ Error'}
          </p>
        </div>
        <button onClick={() => setRestoreConfirm(null)} className="hover:text-red-400 transition ml-4">
          <X size={20} />
        </button>
      </div>

      {/* Full Code — scrollable */}
      <div className="px-6 py-4">
        <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Full Code</p>
        <pre
          style={{
            backgroundColor: theme === 'dark' ? '#1a202c' : '#cbd5e0',
            maxHeight: '340px',
            color: theme === 'dark' ? '#e2e8f0' : '#1a202c'
          }}
          className="text-sm font-mono rounded-lg p-4 overflow-y-auto"
        >
          {restoreConfirm.code}
        </pre>
      </div>

      {/* Warning + Actions */}
      <div style={{ borderTop: '1px solid #4a5568' }} className="px-6 py-4 flex items-center justify-between">
        <p className="text-sm text-yellow-400">⚠️ Your current editor code will be replaced.</p>
        <div className="flex gap-3 ml-4">
          <button
            onClick={() => setRestoreConfirm(null)}
            style={{ backgroundColor: theme === 'dark' ? '#4a5568' : '#a0aec0' }}
            className="px-5 py-2 rounded-md text-sm font-medium transition hover:opacity-80"
          >
            Cancel
          </button>
          <button
            onClick={confirmRestore}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm font-medium transition"
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