const mongoose = require('mongoose')
const taskSchema = new mongoose.Schema({
    'completed':{
        type:Boolean,
        required:true
    },
    'title':{
        type:String,
        required:true
    },
    'description':{
        type:String,
        required:true
    },
    'owner':{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:'User' 
    }
},{
    timestamps:true
})
const Task = mongoose.model('Task',taskSchema)



module.exports = Task