//jshint esversion:6
require('dotenv').config();
const express=require("express");
const bodyParser=require("body-parser");
const ejs=require('ejs');
const mongoose=require("mongoose");
const session=require('express-session');
const passport=require('passport');
const passportLocalMongoose=require('passport-local-mongoose');
const encrypt=require("mongoose-encryption");
// const bcrypt=require('bcrypt');
// const saltrounds=10;

const port=3000;
const app=express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.use(session({ 
  secret:"helo how r u?",
  resave:false,
  saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://0.0.0.0:27017/secretsDB",{useNewUrlParser:true});



const uSchema=mongoose.Schema({
    email:String,   
    password:String
});


uSchema.plugin(passportLocalMongoose);


const User=new mongoose.model("User",uSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/",function(req,res){
    res.render("home");
});

app.get("/login",function(req,res){
    res.render("login");
});

app.get("/register",function(req,res){
    res.render("register");
});

app.get("/logout",function(req,res){
  req.logout(function(err) {
    if (err) { return next(err); }
  });
  res.redirect("/");
});

app.get("/secrets",function(req,res){
  if(req.isAuthenticated()){
    res.render("secrets");
  }
  else{
    res.redirect("/login");
  }
})

app.post("/register",function(req,res){
    User.register({username:req.body.username},req.body.password).then(function(user,err){
     if(user){
        passport.authenticate("local")(req,res,function(){
          res.redirect("secrets");
        })
      }
      else{
        console.log(err);
      }
    })  
});

app.post("/login", function(req, res) {
    const user =new User({
      username:req.body.username,
      password:req.body.password
    });
    
    req.login(user,function(err){
      if(err){
        console.log(err);
      } else{
        passport.authenticate("local")(req,res,function(){
          res.redirect("secrets");
        })
      }
    })
  });
  



app.listen(port,()=>{
    console.log("Server running at port 3000");
});