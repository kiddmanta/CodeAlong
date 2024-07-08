const mongoose = require("mongoose");
const colors = require("colors");

const connectDB = async ()=>{
    
    try{
        console.log("connecting to MongoDB")
        await mongoose.connect(process.env.MONGO);
        console.log(`Server Running on ${mongoose.connection.host}`)
    }
    catch(err){
        console.log(err.bgRed);
    }
}

module.exports = connectDB;