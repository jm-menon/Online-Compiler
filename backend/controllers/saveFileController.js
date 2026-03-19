const saveFileSchema = require('../models/saveFileSchema');

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
}