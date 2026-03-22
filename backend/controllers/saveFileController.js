/*const saveFileSchema = require('../models/saveFileSchema');

exports.saveFile= async(req, res)=>{
    try{
        const {filename, language, code}= req.body;
        const newFile= new saveFileSchema({
            userId: req.user,
            filename,
            language,
            code
        })
        res.json(newFile);
    }catch(err){
        console.error(err);
        res.status(500).json({message: 'Server error'});
    }
}

exports.findFile= async(req, res)=>{
    try{
        const file= await saveFileSchema.findById(req.params);
        if(!file) return res.status(404).json({message: 'File not found'});
        res.json(file);
    }catch(err){
        console.error(err);
        res.status(500).json({message: 'Server error'});
    }
}

exports.editFile= async(req, res)=>{
    try{
          const { id } = req.params;

  const updated = await Snippet.findOneAndUpdate(
    { _id: id, userId: req.user },
    req.body,
    { new: true }
  );

  res.json(updated);
    }catch(err){
        console.error(err);
        res.status(500).json({message: 'Server error'});
    }
}

exports.deleteFile= async(req, res)=>{
    try{
        exports.deleteSnippet = async (req, res) => {
  const { id } = req.params;

  await Snippet.findOneAndDelete({
    _id: id,
    userId: req.user
  });

  res.json({ message: "Deleted" });
};

    }catch(err){
        console.error(err);
        res.status(500).json({message: 'Server error'});
    }
}

exports.showAllFile= async(req, res)=>{
    try{
        exports.getSnippets = async (req, res) => {
  const snippets = await Snippet.find({ userId: req.user })
    .sort({ createdAt: -1 });

  res.json(snippets);
};

    }catch(err){
        console.error(err);
        res.status(500).json({message: 'Server error'});
    }
}*/

const getSaveFile = require('../models/saveFileSchema'); // CHANGED

exports.saveFile = async (req, res) => {
    const saveFileSchema = getSaveFile(); // ADDED
    try {
        const { filename, language, code } = req.body;
        const newFile = new saveFileSchema({
            userId: req.user,
            filename,
            language,
            code
        });
        await newFile.save(); // FIXED: was missing .save()
        res.json(newFile);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.findFile = async (req, res) => {
    const saveFileSchema = getSaveFile(); // ADDED
    try {
        const file = await saveFileSchema.findById(req.params.id); // FIXED: was req.params (object), needs req.params.id
        if (!file) return res.status(404).json({ message: 'File not found' });
        res.json(file);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.editFile = async (req, res) => {
    const saveFileSchema = getSaveFile(); // ADDED
    try {
        const { id } = req.params;
        const updated = await saveFileSchema.findOneAndUpdate( // FIXED: was `Snippet` which is undefined
            { _id: id, userId: req.user },
            req.body,
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: 'File not found' });
        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.deleteFile = async (req, res) => {
    const saveFileSchema = getSaveFile(); // ADDED
    try {
        const { id } = req.params; // FIXED: was nested inside another function
        await saveFileSchema.findOneAndDelete({ _id: id, userId: req.user }); // FIXED: was `Snippet`
        res.json({ message: 'Deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.showAllFile = async (req, res) => {
    const saveFileSchema = getSaveFile(); // ADDED
    try {
        const snippets = await saveFileSchema.find({ userId: req.user }) // FIXED: was `Snippet`
            .sort({ createdAt: -1 });
        res.json(snippets);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}