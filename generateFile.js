const path= require('path');
const fs= require('fs');
const {v4}= require('uuid');


const generateFile=(language, code) => {

    const jobId= v4();
    if(language === 'cpp'){
        language = 'cpp';
        
    }else if(language === 'python'){
        language = 'py';
        
    }else if(language === 'java'){
        language = 'java';
        
    }else{
        throw new Error(`Unsupported language: ${language}`);
    }
    const directory= path.join(__dirname, "codes", language);
        if(!fs.existsSync(directory)){
            fs.mkdirSync(directory, { recursive: true });
        }
    const filename= `${jobId}.${language}`;
    const filePath= path.join(directory, filename);
    fs.writeFileSync(filePath, code);
    console.log(`Generated filename: ${filename}`);
    //const filePath= path.join(directory, `code.${language}`);
    //fs.writeFileSync(filePath, code);
    return filePath;
}

module.exports= generateFile;