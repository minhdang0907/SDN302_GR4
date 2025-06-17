const express=require('express');
const connectDB=require('./config/db');
const router=require('./src/routes/index.js');
const cors = require("cors");
const app=express();
connectDB();
app.use(express.json()); 
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true 
}));
app.use("/",router);
const PORT=process.env.PORT||9999
app.listen(PORT,()=>{
    console.log(`localhost://${PORT}`);
});
