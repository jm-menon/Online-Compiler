const mongoose= require('mongoose');

const connectDB = async () => {
    try{
        const connect= await mongoose.connect(process.env.CONNECTION_STRING);
        console.log(`MongoDB Connected: ${connect.connection.host} and ${connect.connection.name}`);
    }catch(err){
        console.error(err.message);
        process.exit(1);
    }

}

module.exports=connectDB;