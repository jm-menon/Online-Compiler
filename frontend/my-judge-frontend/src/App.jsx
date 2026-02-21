import { useState } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';

function App() {
  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState(getDefaultCode('cpp'));
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [stderr, setStderr] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
        'Failed to connect to server'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-techno-bg text-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-techno-dark border-b border-techno-purple/30 p-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-techno-blue to-techno-purple bg-clip-text text-transparent">
          Online Judge
        </h1>

        <div className="flex items-center gap-4">
          <select
            value={language}
            onChange={handleLanguageChange}
            className="bg-techno-dark border border-techno-purple/50 rounded px-3 py-1.5 text-techno-blue focus:outline-none focus:ring-2 focus:ring-techno-purple/50"
          >
            <option value="cpp">C++</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>

          <button
            onClick={handleRun}
            disabled={loading}
            className={`px-6 py-2 rounded font-medium transition-all ${
              loading
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-techno-purple hover:bg-techno-purple/80 text-white shadow-lg shadow-techno-purple/30'
            }`}
          >
            {loading ? 'Running...' : 'Run'}
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor */}
        <div className="w-3/5 border-r border-techno-purple/20">
          <Editor
            height="100%"
            language={language === 'cpp' ? 'cpp' : language}
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>

        {/* Right panel: Input + Output */}
        <div className="w-2/5 flex flex-col bg-techno-dark/80">
          {/* Input */}
          <div className="flex-1 border-b border-techno-purple/20 p-4">
            <h2 className="text-lg font-semibold text-techno-blue mb-2">Input / Test Cases</h2>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter input here (one test case per run)&#10;Example:&#10;45&#10;19"
              className="w-full h-[calc(100%-2.5rem)] bg-techno-bg/70 border border-techno-purple/40 rounded p-3 text-sm font-mono text-techno-blue focus:outline-none focus:border-techno-purple resize-none"
            />
          </div>

          {/* Output */}
          <div className="flex-1 p-4 overflow-auto">
            <h2 className="text-lg font-semibold text-techno-blue mb-2">Output</h2>

            {error ? (
              <div className="text-red-400 bg-red-950/30 p-3 rounded border border-red-500/30">
                {error}
              </div>
            ) : (
              <>
                <pre className="bg-techno-bg/50 p-3 rounded font-mono text-sm text-techno-blue whitespace-pre-wrap">
                  {output || (loading ? 'Running...' : '(no output yet)')}
                </pre>

                {stderr && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-red-300 mb-1">Stderr:</h3>
                    <pre className="bg-red-950/30 p-3 rounded font-mono text-sm text-red-200 whitespace-pre-wrap">
                      {stderr}
                    </pre>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
