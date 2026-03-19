const mongoose = require('mongoose');

let usersConn = null;
let saveFilesConn = null;

exports.connectDB_users = async () => {
    try {
        usersConn = await mongoose.createConnection(process.env.CONNECTION_STRING_USERS).asPromise();
        console.log(`Users DB Connected: ${usersConn.host} - ${usersConn.name}`);
        return usersConn;
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

exports.connectDB_saveFiles = async () => {
    try {
        saveFilesConn = await mongoose.createConnection(process.env.CONNECTION_STRING_SAVE_FILES).asPromise();
        console.log(`SaveFiles DB Connected: ${saveFilesConn.host} - ${saveFilesConn.name}`);
        return saveFilesConn;
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

exports.getConn = () => ({ usersConn, saveFilesConn });