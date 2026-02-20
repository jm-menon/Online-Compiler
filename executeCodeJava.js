const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const outputDir = path.join(__dirname, "outputs", "java");

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const executeCodeJava = (filePath) => {
    const filename = path.basename(filePath);           // e.g. Main.java
    const className = path.basename(filePath, '.java'); // e.g. Main
    const dir = path.dirname(filePath);

    return new Promise((resolve, reject) => {
        // Step 1: Compile
        exec(`javac -d "${outputDir}" "${filePath}"`, { timeout: 10000 }, (compileErr, compileStdout, compileStderr) => {
            if (compileErr || compileStderr) {
                const msg = compileStderr.trim() || compileErr?.message || 'Compilation failed';
                return reject(new Error(`Java compilation error:\n${msg}`));
            }

            // Step 2: Run
            exec(
                `java -cp "${outputDir}" ${className}`,
                { 
                    cwd: outputDir,    // important: .class files are here
                    timeout: 8000,     // prevent infinite loops
                    maxBuffer: 1024 * 1024
                },
                (runErr, stdout, stderr) => {
                    if (runErr) {
                        return reject(new Error(`Runtime error:\n${stderr || runErr.message}`));
                    }
                    if (stderr.trim()) {
                        return reject(new Error(`stderr output:\n${stderr.trim()}`));
                    }

                    resolve(stdout.trim() || '(no output)');
                }
            );
        });
    });
};

module.exports = executeCodeJava;