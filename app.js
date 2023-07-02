//jshint esversion:6
require('dotenv').config();
const express=require("express");
const bodyParser=require("body-parser");
const ejs=require('ejs');
const mongoose=require("mongoose");
const encrypt=require("mongoose-encryption");
const bcrypt=require('bcrypt');
const saltrounds=10;

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


uSchema.plugin(encrypt,{secret:process.env.SECRET,encryptedFields:["password"]});


const User=new mongoose.model("User",uSchema);


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
    bcrypt.hash(req.body.password,saltrounds).then(function(err,hash){
         const uitem=new User({
            email:req.body.username,
            password:hash
            }).save().then(function(data){
            res.render("secrets");
            }).catch(function(err){
                console.log("err");
    });
})      
});

app.post("/login", function(req, res) {
    User.findOne({ email: req.body.username })
      .then(function(data) {
        if (!data) {
          // User doesn't exist
          res.status(401).send("Invalid username or password");
          return;
        }
  
        bcrypt.compare(req.body.password, data.password, function(err, result) {
          if (err) {
            console.log(err);
            res.status(500).send("An error occurred");
            return;
          }
  
          if (result === true) {
            res.render("secrets");
          } else {
            // Password doesn't match
            res.status(401).send("Invalid username or password");
          }
        });
      })
      .catch(function(err) {
        console.log(err);
        res.status(500).send("An error occurred");
      });
  });
  



app.listen(port,()=>{
    console.log("Server running at port 3000");
});