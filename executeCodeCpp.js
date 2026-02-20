const path= require('path');
const fs= require('fs');
//const {v4}= require('uuid');

const { exec } = require('child_process');

const output= path.join(__dirname, "outputs", "cpp");
if(!fs.existsSync(output)){
    fs.mkdirSync(output, { recursive: true })
}

const executeCodeCpp=(filePath) => {
    // Logic to execute the code in the file at filePath
    const jobId= path.basename(filePath).split(".")[0];
    const executable= `${jobId}.out`
    const outputFilePath= path.join(output,executable);

    return new Promise((resolve, reject) => {
        exec(`g++ ${filePath} -o ${outputFilePath}  && cd ${output} && ./${executable}`, (error, stdout, stderr) => {
            if(error){
                reject(error, stderr)
            }if(stderr){
                reject(stderr)
            }else{
                resolve(stdout)
            }
        })
    })
}
module.exports = executeCodeCpp;

