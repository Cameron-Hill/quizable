const express = require("express");
const bcrypt = require("bcrypt");
const passport = require('passport');
const router = express.Router();
const {ensureAuthenticated} = require('../config/auth')

let x=1;

//Models
const User = require("../models/User");
const Session = require("../models/Session").Session
const Question = require("../models/Session").Question

//Pages
router.get("/login", (req, res) => res.render("login"));
router.get("/register", (req, res) => res.render("register"));
router.get("/dashboard", ensureAuthenticated, (req,res) => {
  x++;
  console.log(x)
  res.render("dashboard", {name:req.user.name})
})

//Sessions
router.get("/sessions/:id", ensureAuthenticated, (req, res)=>{
  sessionID = req.params.id
  if (sessionID === "new"){
    console.log("Creating New Session: s1")
    const q1 = new Question({
      text:'What... is your Name?',
      answers: ['Sir Galahad of Camelot', "Arthur, King of the Britons "]
    })
    const q2 = new Question({
      text:'What... is your quest?',
      answers:['I seek the Grail!',  "To find the Princess"]
    })
    const q3 = new Question({
      text: 'What is your favorite color!',
      image: '../resources/ahh.jpeg',
      answers: ['Red!', 'No, Yellow!']

    })
    const newSession = new Session({
      sessionID:"s1",
      name: "test session",
      user: req.user._id,
      questions: [q1, q2,q3]
    })
    newSession.save()
  }
  console.log(`Searching for session: ${sessionID}`)
  Session.findOne({sessionID:sessionID}).then(session=>{
    if (session){
      console.log(`Found session: ${sessionID}`)
      if (session.user === String(req.user._id)){
        console.log(`Authenticated`)
        res.render("session", {session:session, tag:"1"})
      }else{
        // Not Authorised
        req.flash('error_msg','You are not authorised to access this resource')
        res.redirect("/hosts/dashboard")
        return
      }

    } else {
      req.flash('error_msg','Session does not exist')
      res.redirect("/hosts/dashboard")
      return
    }
  })
})

//Logout Handle
router.get('/logout', (req, res)=> {
  req.logout();
  req.flash('success_msg','You are logged out');
  res.redirect('/hosts/login')
})

//Register Handle
router.post("/register", (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  //Check required fields
  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Please fill in all fields" });
  }
  //Check passwords match
  if (password != password2) {
    errors.push({ msg: "Passwords do not match" });
  }
  // Check password length
  if (password.length < 6) {
    errors.push({ msg: "Password should be at least 6 characters" });
  }
  if (errors.length > 0) {
    res.render("register", {
      errors,
      name,
      email,
      password,
      password2
    });
  } else {
    // Validation passed
    User.findOne({ email: email }).then(user => {
      if (user) {
        // User exists
        errors.push({ msg: "Email is already registered" });
        res.render("register", {
          errors,
          name,
          email,
          password,
          password2
        });
      } else {
        console.log(`Creating new User: ${name} : ${email}`);
        //Create new user
        const newUser = new User({
          name,
          email,
          password
        });

        //Hash Password
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if(err) throw err;
            newUser.password = hash;
            newUser.save()
              .then(user=>{
                  req.flash('success_msg', 'Registration Successful, please Log In to view host')
                  res.redirect('/hosts/login')
              })
              .catch(err=> console.log(err));
          })
        );
      }
    });
  }
});

//Login Handle
router.post('/Login', (req, res, next)=>{
  passport.authenticate('local', {
    successRedirect: '/hosts/dashboard',
    failureRedirect: '/hosts/login',
    failureFlash: true,
  })(req,res,next)
})

module.exports = router;
