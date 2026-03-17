const express= require('express');
const router = express.Router();


router.post("/", (req, res)=>{
    const {code, language}= req.body
    var String, extension;
    if(language ==="cpp"){  
        extension = "cpp"
}else if(language ==="python"){
    extension = "py"
}else if(language ==="java"){
    extension = "java"
}else{
    extension = "txt";
}

const filename = `code.${extension}`;

res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
res.setHeader('Content-Type', 'text/plain');
res.send(code);
});

module.exports = router;