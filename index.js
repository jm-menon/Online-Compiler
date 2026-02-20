const express= require('express');

const generateFile= require('./generateFile');

const executeCodeCpp = require('./executeCodeCpp');  
const executeCodePy = require('./executeCodePy');
const executeCodeJava = require('./executeCodeJava');

const app= express();

const port= 8080;

//middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({extended: true}));


app.post('/run', async (req, res) => {
    const { language = 'cpp', code} = req.body;
    // ...

    try {
        const filePath = generateFile(language, code);

        switch (language) {
            case 'cpp':
                output = await executeCodeCpp(filePath);
                console.log("C++ output:", output);   
                break;
            case 'python':
                output = await executeCodePy(filePath);
                console.log("Python output:", output);   
                break;
            case 'java':
                output = await executeCodeJava(filePath);
                console.log("Java output:", output);
                break;
            default:
                throw new Error(`Unsupported language: ${language}`);
        }
        

        res.json({
            comment: `Code received in ${filePath}`,
            value: output
        });
    } catch (err) {
        console.error("Execution error:", err);   // ← better logging
        res.status(500).json({
            error: 'Execution failed',
            details: err.message || String(err)   // ← send something useful to client
        });
    }
});


app.listen(port,()=>{
    console.log(`Server is running on port ${port}`)
})