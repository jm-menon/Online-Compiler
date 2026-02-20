const path= require('path');
const fs= require('fs');
const {v4}= require('uuid');

const directory= path.join(__dirname, "codes");
if(!fs.existsSync(directory)){
    fs.mkdirSync(directory, { recursive: true });


}

const generateFile=(language, code) => {

    const jobId= v4();
    const filename= `${jobId}.${language}`;
    const filePath= path.join(directory, filename);
    fs.writeFileSync(filePath, code);
    console.log(`Generated filename: ${filename}`);
    //const filePath= path.join(directory, `code.${language}`);
    //fs.writeFileSync(filePath, code);
    return filePath;
}

module.exports= generateFile;