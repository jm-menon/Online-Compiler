const path= require('path');
const fs= require('fs');
//const {v4}= require('uuid');

const { exec } = require('child_process');
const { rejects } = require('assert');

const output= path.join(__dirname, "outputs", "python");
if(!fs.existsSync(output)){
    fs.mkdirSync(output, { recursive: true })
}

const executeCodePy=(filePath) => {
    // Logic to execute the code in the file at filePath
    return new Promise((resolve, reject) => {

    exec(`python3 "${filePath}"`, { timeout: 10000 }, (error, stdout, stderr) => {
        if (error) {
            // Usually syntax error, import error, or non-zero exit
            return rejects(error.message + (stderr ? `\n${stderr}` : ''));
        }

        // Python often puts warnings / debug output in stderr even on success
        if (stderr && !stderr.includes('Warning')) {
            return reject(stderr);
        }

        resolve(stdout.trim() || '(no output)');
    });
});
    

}
module.exports = executeCodePy;

