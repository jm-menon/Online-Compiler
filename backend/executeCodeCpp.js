const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const { spawn } = require('child_process');

const outputsDir = path.join(__dirname, "outputs", "cpp");

if (!fs.existsSync(outputsDir)) {
    fs.mkdirSync(outputsDir, { recursive: true });
}

/**
 * @param {string} filePath - path to .cpp file
 * @param {string} [stdinInput=''] - text to feed into stdin (multi-line ok)
 */
const executeCodeCpp = (filePath, stdinInput = '') => {
    const jobId = path.basename(filePath, path.extname(filePath));
    const executable = path.join(outputsDir, `${jobId}.out`);

    return new Promise(async (resolve, reject) => {
        // ─── Step 1: Compile ────────────────────────────────────────
        try {
            await new Promise((res, rej) => {
                exec(
                    `g++ -std=c++17 "${filePath}" -o "${executable}"`,
                    { timeout: 8000 },
                    (err, stdout, stderr) => {
                        if (err || stderr.trim()) {
                            return rej(stderr.trim() || err?.message || 'Compilation failed');
                        }
                        res();
                    }
                );
            });
        } catch (compileErr) {
            return reject(new Error(`Compilation failed:\n${compileErr}`));
        }

        // ─── Step 2: Run with stdin support ─────────────────────────
        const child = spawn(executable, [], {
            stdio: ['pipe', 'pipe', 'pipe'],   // control stdin, stdout, stderr
            timeout: 6000,                     // kill after 6 seconds
            killSignal: 'SIGKILL',
        });

        let stdoutData = '';
        let stderrData = '';

        child.stdout.on('data', (data) => {
            stdoutData += data.toString();
        });

        child.stderr.on('data', (data) => {
            stderrData += data.toString();
        });

        child.on('error', (err) => {
            reject(err);
        });

        child.on('close', (code) => {
            if (code === 0) {
                resolve({
                    stdout: stdoutData.trim() || '(no output)',
                    stderr: stderrData.trim()
                });
            } else {
                reject(new Error(
                    `Runtime error (exit code ${code}):\n${stderrData.trim() || 'No details'}`
                ));
            }
        });

        // Feed input to stdin
        if (stdinInput) {
            child.stdin.setEncoding('utf-8');
            child.stdin.write(stdinInput);
            // You can also do child.stdin.write(stdinInput + '\n'); if needed
        }
        child.stdin.end();   // ← Very important: signals EOF (like Ctrl+D)
    });
};

module.exports = executeCodeCpp;