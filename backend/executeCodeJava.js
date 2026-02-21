const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const { spawn } = require('child_process');

const outputDir = path.join(__dirname, "outputs", "java");

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

/**
 * @param {string} filePath - path to .java file
 * @param {string} [stdinInput=''] - text to feed to System.in (multi-line ok)
 */
const executeCodeJava = (filePath, stdinInput = '') => {
    const filename = path.basename(filePath);           // e.g. Main.java
    const className = path.basename(filePath, '.java'); // e.g. Main
    const sourceDir = path.dirname(filePath);

    return new Promise(async (resolve, reject) => {
        // ─── Step 1: Compile ────────────────────────────────────────
        let compileStderr = '';
        try {
            await new Promise((res, rej) => {
                exec(
                    `javac -d "${outputDir}" "${filePath}"`,
                    { timeout: 10000 },
                    (err, stdout, stderr) => {
                        compileStderr = stderr;
                        if (err || stderr.trim()) {
                            const msg = stderr.trim() || err?.message || 'Compilation failed';
                            return rej(new Error(`Java compilation error:\n${msg}`));
                        }
                        res();
                    }
                );
            });
        } catch (compileErr) {
            return reject(compileErr);
        }

        // ─── Step 2: Run with stdin support ─────────────────────────
        const child = spawn('java', ['-cp', outputDir, className], {
            stdio: ['pipe', 'pipe', 'pipe'],   // we control stdin/out/err
            cwd: outputDir,                    // .class files are here
            timeout: 8000,
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
            reject(new Error(`Failed to start Java process: ${err.message}`));
        });

        child.on('close', (code) => {
            if (code === 0) {
                resolve({
                    stdout: stdoutData.trim() || '(no output)',
                    stderr: stderrData.trim()
                });
            } else {
                const msg = stderrData.trim() || `Java process exited with code ${code}`;
                reject(new Error(`Runtime error:\n${msg}`));
            }
        });

        // Feed input
        if (stdinInput) {
            child.stdin.setEncoding('utf-8');
            child.stdin.write(stdinInput);
            // Optional: add final newline if your test cases expect it
            // child.stdin.write(stdinInput + '\n');
        }
        child.stdin.end();   // ← Critical: signals EOF
                             // Without this, Scanner.hasNext() / readLine() may hang
    });
};

module.exports = executeCodeJava;