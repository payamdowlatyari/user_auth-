var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');
var bodyParser = require('body-parser');
var User = require('./models/user');
var LocalStrategy = require('passport-local');
var passportLocalMongoose = require('passport-local-mongoose');
mongoose.connect('mongodb://localhost/auth_app', {useCreateIndex: true, useNewUrlParser: true });

var app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.use(require('express-session')({
    secret: "My name is Payam",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// routes

app.get('/', function(req, res){
    res.render('home');
});

app.get('/secret', isLoggedIn, function(req, res){
    res.render('secret');
});

// auth 
// show sign up form 
app.get('/register', function(req, res){
    res.render('register');
});

// user sign up
app.post('/register', function(req, res){
    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
        if (err) {
            console.log(err);
            return res.render('register');
        } else {
            passport.authenticate('local')(req, res, function(){
                res.redirect('/secret');
            });
        }
    });
});

// login 
app.get('/login', function(req, res){
    res.render('login');
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/secret',
    failureRedirect: '/login'
}), function(req, res){

});

// logout
app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

// check loggedin 

function isLoggedIn(req, res, next){
    if (req.isAuthenticated()) {
        return next();        
    }
    res.redirect('/login');
}

app.listen(3000, function(){
    console.log("Server has started on localhost 3000");
});