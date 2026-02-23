const jwt= require('jsonwebtoken');
const User= require('./userSchema')

const registerUser= async (req, res)=>{
    const {username, email, password}= req.body;
    
    try{
        // Check if user already exists
        if(await User.findOne({email})){
            return res.status(400).json({success: false, error:'Email already taken'});
        }
        if(await User.findOne({username})){
            return res.status(400).json({success: false, error:'Username already taken'});
        }
        //check if any field is missing
        if(!username || !email || !password){
            return res.status(400).json({success: false, error:'All fields are mandatory'})
        }

        //check password strength
        if(password.length<10){
            return res.status(400).json({success: false, error:'Password must be at least 10 characters long'})
        }

        //Create new user
        const newUser= new User({username, email, password});
        await newUser.save();

        //generate JWT token
        const token= jwt.sign({userId: newUser._id}, process.env.JWT_SECRET, {expiresIn: '10min'});

        res.status(201).json({success: true, message: "user registered successfully",token});
    }catch(err){
        console.error(err);
        res.status(500).json({success: false, error:'Server error'});
    }
}