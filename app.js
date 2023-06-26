const mongoose = require("mongoose");
const express = require("express");
require("dotenv").config();
require("./db/conn");
const app = express();
const cookieParser = require("cookie-parser");
const Products = require("./models/productsSchema");
const DefaultData = require("./defaultdata");
const cors = require("cors");
const router = require("./routes/router")
const productRoutes = require('./routes/router');
const path = require('path');

app.use(express.json());
app.use(cookieParser(""));
app.use(cors());
app.use(router);
app.use( productRoutes);


app.use(express.static(path.join(__dirname,'./client/build')))

app.get('*',function(req,res){
    res.sendFile(path.join(__dirname,'./client/build/index.html' ));
});

const port = process.env.PORT || 8005;

app.listen(port,()=>{
    console.log(`server is running on port number ${port}`);
});

DefaultData();