const saveFileSchema= require('../models/saveFileSchema');

const saveFile= async(req, res)=>{
    try{
        const { code, language, filename}= req.body;
        const saveFile= await saveFileSchema.create({
            userId: req.user,
            code,
            language,
            filename
        });
        res.status(200).json({ message: 'File saved successfully', file: saveFile });
    }catch(err){
        console.error(err);
        res.status(500).json({ error: 'Failed to save file' });
    }
}

module.exports= saveFile;