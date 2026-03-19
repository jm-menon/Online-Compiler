import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { Sun, Moon } from 'lucide-react';
import { Navigate, useNavigate } from "react-router-dom";
import Chatbot from "./Chatbot";
import Save from "./Save";


function Compiler() {
  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState(getDefaultCode('cpp'));
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [stderr, setStderr] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState('dark');
  const navigate = useNavigate();
  
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

  const blob = new Blob([response.data]);

  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  link.download = `code.${language}`;

  link.click();
};

const handleSave = async () => {
  const title = prompt("Enter snippet title:");

  if (!title) return;

  try {
    await axios.post(
      "http://localhost:8080/api/save",
      {
        title,
        language,
        code
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );

    alert("Snippet saved successfully!");
  } catch (err) {
    console.error(err);
    alert("Failed to save snippet");
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

  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" />;
  }

  function getDefaultCode(lang) {
    const templates = {
      cpp: `#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    cout << "Sum: " << a + b << endl;
    return 0;
}`,
      python: `a = int(input())
b = int(input())
print("Sum:", a + b)`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        System.out.println("Sum: " + (a + b));
    }
}`
    };
    return templates[lang] || '// Write your code here';
  }

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    setCode(getDefaultCode(newLang));
  };

  const handleRun = async () => {
    setLoading(true);
    setOutput('');
    setStderr('');
    setError('');

    try {
      const response = await axios.post('http://localhost:8080/run', {
        language,
        code,
        input: input.trim()
      });

      const data = response.data;

      if (data.success) {
        setOutput(data.output || '(no output)');
        setStderr(data.stderr || '');
      } else {
        setError(data.error || 'Unknown error');
      }
    } catch (err) {
      setError(
        err.response?.data?.details ||
        err.response?.data?.error ||
        err.message ||
        'Failed to connect to server. Is backend running?'
      );
    } finally {
      setLoading(false);
    }
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
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition`}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <select
            value={language}
            onChange={handleLanguageChange}
            className={`px-4 py-2 rounded-md border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-blue-300'
                : 'bg-white border-gray-300 text-blue-700'
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
              loading
                ? 'bg-gray-600 cursor-not-allowed'
                : theme === 'dark'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {loading ? 'Running...' : 'Run'}
          </button>
          <button
              onClick={handleLogout}
              className={`px-5 py-2 rounded-md font-medium transition ${
                          theme === "dark"
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : "bg-red-500 hover:bg-red-600 text-white"
                              }`
                        }
>
  Logout
</button>
<button onClick={handleDownload}>
  Download Code
</button>
<button
  onClick={() => (window.location.href = "/save")}
  className="px-6 py-2 bg-gray-600 text-white rounded-md"
>
  My Snippets
</button>

<button
  onClick={handleSave}
  className={`px-6 py-2 rounded-md font-semibold ${
    theme === "dark"
      ? "bg-yellow-600 hover:bg-yellow-700 text-white"
      : "bg-yellow-500 hover:bg-yellow-600 text-white"
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

        {/* Right Panel */}
        <div className="w-5/12 flex flex-col border-l border-gray-700 dark:border-gray-800">

          {/* Input */}
          <div className="flex-1 flex flex-col border-b border-gray-700 dark:border-gray-800 p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Input
            </h2>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Enter your input here (stdin)
Example for sum program:
45
19`}
              className={`flex-1 w-full p-4 rounded-lg border font-mono text-sm resize-none overflow-auto focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                theme === 'dark'
                  ? 'bg-gray-900 border-gray-700 text-gray-200'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>

          {/* Output */}
          <div className="flex-1 flex flex-col p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Output
            </h2>

            {error ? (
              <div className="flex-1 p-4 rounded-lg border font-mono text-sm overflow-auto
                bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700
                text-red-800 dark:text-red-200">
                {error}
              </div>
            ) : (
              <>
                <pre
                  className={`flex-1 w-full p-4 rounded-lg border font-mono text-sm whitespace-pre-wrap overflow-auto ${
                    theme === 'dark'
                      ? 'bg-gray-900 border-gray-700 text-blue-200'
                      : 'bg-white border-gray-300 text-blue-800'
                  }`}
                >
                  {output || (loading ? 'Executing code...' : 'Run your code to see output')}
                </pre>

                {stderr && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">
                      Stderr:
                    </h3>
                    <pre className={`p-4 rounded-lg border font-mono text-sm whitespace-pre-wrap overflow-auto ${
                      theme === 'dark'
                        ? 'bg-red-950/40 border-red-700 text-red-200'
                        : 'bg-red-50 border-red-300 text-red-800'
                    }`}>
                      {stderr}
                    </pre>
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      </div>
      <Chatbot code={code} />
    </div>
  );
}

export default Compiler;