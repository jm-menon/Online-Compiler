require('dotenv').config();  
const express = require('express');

const cors = require('cors');

const path = require('path'); // needed for path.basename

const generateFile = require('./generateFile');
const executeCodeCpp = require('./executeCodeCpp');
const executeCodePy = require('./executeCodePy');
const executeCodeJava = require('./executeCodeJava');
const { cleanupOldFiles } = require('./cleanupOutput');
const authRoutes = require('./routes/auth'); // Import auth routes
const aiRoutes = require('./routes/aiRoutes'); // Import AI routes
const downloadFileRoutes = require('./routes/downloadFile'); // Import download file routes
const saveFileRoutes = require('./routes/saveFile'); // Import save file routes

const app = express();
const port = 8080;
const { connectDB_users, connectDB_saveFiles } = require('./connectDB');

const start = async () => {
    await connectDB_users();
    await connectDB_saveFiles();
    app.listen(3000, () => console.log('Server running'));
}

start();

connectDB_users(); // Connect to MongoDB
connectDB_saveFiles(); // Connect to MongoDB for save files

// Allow frontend origin (Vite dev server)
app.use(cors({
  origin: 'http://localhost:5173',          // ← your frontend URL
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],      // allow POST
  allowedHeaders: ['Content-Type', 'Authorization'],         // allow JSON body and AIs bearer token
}));


// Middleware with limits on API for safety
//app.use(express.json());
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true }));


app.use('/api/ai', aiRoutes);
app.use('/api/download', downloadFileRoutes);
app.use('/api/save', saveFileRoutes);
app.use('/api/auth', authRoutes);

app.post('/run', async (req, res) => {
    const { language = 'cpp', code, input = '' } = req.body;

    // Basic validation
    if (!code || typeof code !== 'string' || code.trim() === '') {
        return res.status(400).json({
            success: false,
            error: 'Valid code is required'
        });
    }

    try {
        const filePath = generateFile(language, code);

        let result;

        // Normalize language for easier matching
        const lang = language.toLowerCase();

        switch (lang) {
            case 'cpp':
            case 'c++':
            case 'cc':
                result = await executeCodeCpp(filePath, input);
                console.log('C++ output:', result);
                break;

            case 'python':
            case 'py':
                result = await executeCodePy(filePath, input);
                console.log('Python output:', result);
                break;

            case 'java':
                result = await executeCodeJava(filePath, input);
                console.log('Java output:', result);
                break;

            default:
                throw new Error(`Unsupported language: ${language}`);
        }

        // Normalize output format (in case some executors return string, others object)
        const outputValue = typeof result === 'object' && result !== null
            ? (result.stdout ?? result)
            : result;

        res.json({
            success: true,
            language: lang,
            output: outputValue,
            stderr: result?.stderr || '',
            file: path.basename(filePath)
        });
    } catch (err) {
        console.error('Execution error:', err);

        res.status(500).json({
            success: false,
            error: 'Execution failed',
            details: err.message || String(err)
        });
    }
});


cleanupOldFiles(); // Run once on server start


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});