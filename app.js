//jshint esversion:6
const express=require("express");
const bodyParser=require("body-parser");
const ejs=require('ejs');
const mongoose=require("mongoose");
const encrypt=require("mongoose-encryption");
const { gunzip } = require("zlib");
const port=3000;
const app=express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb://0.0.0.0:27017/secretsDB",{useNewUrlParser:true});

const uSchema=mongoose.Schema({
    email:String,   
    password:String
});

const User=mongoose.model("User",uSchema);


app.get("/",function(req,res){
    res.render("home");
});

app.get("/login",function(req,res){
    res.render("login");
});

app.get("/register",function(req,res){
    res.render("register");
});

app.post("/register",function(req,res){
    const uitem=new User({
    email:req.body.username,
    password:req.body.password
    })
    uitem.save().then(function(data){
        res.render("secrets");
    }).catch(function(err){
        console.log("err");
    });    
});

app.post("/login",function(req,res){
    User.findOne({email:req.body.username}).then(function(data){
        if(data.password===req.body.password){
            res.render("secrets");
        }
    }).catch(function(data){
        console.log("User not found");
    })
});


app.listen(port,()=>{
    console.log("Server running at port 3000");
});