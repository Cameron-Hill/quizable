const express = require('express');
const expressLayouts = require('express-ejs-layouts')
const mongoose = require('mongoose')
const passport = require('passport')
const flash = require('connect-flash')
const session = require('express-session')

const app = express()

//Passport Config
require('./config/passport')(passport)

//DB Config
const db = require('./config/keys').mongoURI

//Connect to Mongo
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology:true})
  .then(()=> console.log('MongoDB Connected...'))
  .catch(err => console.log(err));


// const MongoClient = require('mongodb').MongoClient;
// const uri = "mongodb+srv://dbAdmin:<password>@c1-tmagb.mongodb.net/test?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology:true });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });


//EJS
app.use(expressLayouts)
app.set('view engine','ejs')

//Bodyparser
app.use(express.urlencoded({extended: false}))

//Express Session
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true,
}))

//Passport
app.use(passport.initialize());
app.use(passport.session());

//Connect Flash
app.use(flash());

//Global Vars
app.use(express.static(__dirname+'/resources'));
app.use((req, res, next)=>{
  res.locals.success_msg = req.flash('success_msg')
  res.locals.error_msg = req.flash('error_msg')
  res.locals.error = req.flash('error')
  next()
})

//Routes
app.use('/', require('./routes/index'))
app.use('/hosts', require('./routes/hosts'))
const PORT  = process.env.PORT || 5000

app.listen(PORT, console.log(`Server Started on port ${PORT}`))
