//jshint esversion:6
require('dotenv').config();
const express=require("express");
const bodyParser=require("body-parser");
const ejs=require('ejs');
const mongoose=require("mongoose");
const session=require('express-session');
const passport=require('passport');
const passportLocalMongoose=require('passport-local-mongoose');
// const encrypt=require("mongoose-encryption");
const findOrCreate=require('mongoose-findorcreate');
// const bcrypt=require('bcrypt');
// const saltrounds=10;
const GoogleStrategy = require('passport-google-oauth20').Strategy;


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
uSchema.plugin(findOrCreate)

const User=new mongoose.model("User",uSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/secrets",
  userProfileURL:"https://www.googleapis.com/oauth2/v3/userinfo"
},
function(accessToken, refreshToken, profile, cb) {
  User.findOrCreate({ googleId: profile.id }, function (err, user) {
    return cb(err, user);
  });
}
));


app.get("/",function(req,res){
    res.render("home");
});

app.get("/auth/google",
  passport.authenticate("google",{scope:["profile"]})
);

app.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect("/secrets");
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