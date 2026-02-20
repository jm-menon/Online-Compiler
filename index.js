const express= require('express');
const generateFile= require('./generateFile');
const executeCode = require('./executeCode');   // ← this line is MISSING
const app= express();

const port= 8080;

//middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({extended: true}));


app.post('/run', async (req, res) => {
    const { language = 'cpp', code } = req.body;
    // ...

    try {
        const filePath = generateFile(language, code);

        //           ↓↓↓  AWAIT here  ↓↓↓
        const output = await executeCode(filePath);

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
    console.log(`Server is running pn port ${port}`)
})
