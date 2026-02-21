// utils/cleanup.js
const cron = require('node-cron');
const fs = require('fs').promises;
const path = require('path');

const cleanupOldFiles = async () => {
    const dirs = [
        //path.join(__dirname, '../outputs/cpp'),
        '/Users/jahnavimenon/Desktop/o/backend/outputs/cpp',
        '/Users/jahnavimenon/Desktop/o/backend/outputs/java',
        //path.join(__dirname, '../outputs/java'),
        '/Users/jahnavimenon/Desktop/o/backend/outputs/python',

        //path.join(__dirname, '../codes')
    ];

    for (const dir of dirs) {
        try {
            const files = await fs.readdir(dir);
            for (const file of files) {
                const filePath = path.join(dir, file);
                const stats = await fs.stat(filePath);
                
                // Delete files older than 1 hour
                if (Date.now() - stats.mtimeMs > 60 * 60 * 1000) {
                    await fs.unlink(filePath);
                }
            }
        } catch (e) {
            console.error(`Cleanup error in ${dir}:`, e);
        }
    }
    console.log('✅ Temp files cleaned');
};

// Run every 30 minutes
cron.schedule('*/30 * * * *', cleanupOldFiles);


module.exports = {
    cleanupOldFiles
};