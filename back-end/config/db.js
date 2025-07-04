require('dotenv').config();
const mongoose=require('mongoose');
const connectDB=async ()=>{
   try{
     await mongoose.connect(process.env.MONGODB_URI);
   }catch(error){
      console.error('MongoDB connection failed:'+error);
      process.exit(1);
   }
};
module.exports=connectDB;