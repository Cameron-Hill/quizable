const mongoose = require('mongoose')

const QuestionSchema = new mongoose.Schema({
    text:{
        type:String,
        required: true,
    },
    answers:[String],
    image:{
        type:String
    }
})

const SessionSchema = new mongoose.Schema({
    sessionID:{
        type:String,
        required:true,
    },    
    name: {
        type:String,
        required: true,
    },
    user: {
        type:String,
        required:true,
    },
    questions:[QuestionSchema]
    
})

const Session= mongoose.model('Session', SessionSchema);
const Question = mongoose.model('Question', QuestionSchema)
module.exports.Session = Session
module.exports.Question = Question