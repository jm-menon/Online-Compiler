const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');  // ← use spawn instead of exec

const outputsDir = path.join(__dirname, "outputs", "python");

if (!fs.existsSync(outputsDir)) {
    fs.mkdirSync(outputsDir, { recursive: true });
}

/**
 * Executes Python code and supports feeding stdin input
 * @param {string} filePath - full path to the .py file
 * @param {string} [stdinInput=''] - optional multi-line input to send to stdin
 */
const executeCodePy = (filePath, stdinInput = '') => {
    return new Promise((resolve, reject) => {
        // Start python3 process
        const child = spawn('python3', [filePath], {
            stdio: ['pipe', 'pipe', 'pipe'],   // we control stdin/out/err
            timeout: 10000,                    // kill after 10 seconds
            killSignal: 'SIGKILL',
        });

        let stdoutData = '';
        let stderrData = '';

        // Collect output
        child.stdout.on('data', (data) => {
            stdoutData += data.toString();
        });

        child.stderr.on('data', (data) => {
            stderrData += data.toString();
        });

        // Handle spawn/startup errors (file not found, permission, etc.)
        child.on('error', (err) => {
            reject(new Error(`Failed to start Python: ${err.message}`));
        });

        // Process finished
        child.on('close', (code) => {
            if (code === 0) {
                // Success
                resolve({
                    stdout: stdoutData.trim() || '(no output)',
                    stderr: stderrData.trim()     // usually empty on success
                });
            } else {
                // Non-zero exit = runtime error or explicit sys.exit(n)
                const msg = stderrData.trim() || `Python exited with code ${code}`;
                reject(new Error(`Runtime error:\n${msg}`));
            }
        });

        // ─── Feed input to stdin ─────────────────────────────────────
        if (stdinInput) {
            child.stdin.setEncoding('utf-8');
            child.stdin.write(stdinInput);
            // Optional: ensure final newline if your test cases expect it
            // child.stdin.write(stdinInput + '\n');
        }
        child.stdin.end();   // ← Critical: signals EOF (like Ctrl+D)
                             // Without this, input() loops may hang forever
    });
};

module.exports = executeCodePy;