const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('../models/task')

const userSchema = mongoose.Schema({
    'name':{
        type:String,
        trim:true,
        required:true
    },
    'email':{
        unique:true,
        type:String,
        trim:true,
        required:true,
        validate(value){
            if(!validator.isEmail(value)) throw new Error({
                message:'Invalid email format.'
            })
        } 
    },
    'password':{
        type:String,
        required:true
    },
    'age':{
        type: Number,
        required : false,
        default:0,
        validate(value){
            if(value<0) throw new Error({
                error:'Age can not be negative number.'
            })
        }
    },
    'tokens':[{
        'token':{
            type:String,
            required:true
        }
    }],
    'avatar':{
        type:Buffer
    }
},{
    timestamps:true
})

userSchema.virtual('tasks',{
    ref:'Task',
    localField:'_id',
    foreignField:'owner'
})

userSchema.methods.genAuthToken = async function(){
    try{
        const user = this
        const token = jwt.sign({_id:user._id.toString()},process.env.JWT_SECRET)
        user.tokens = user.tokens.concat({token:token})
        await user.save()
        return token
    }catch(e){
        throw new Error(e)
    }
}   


userSchema.methods.getPublicProfile = function(){
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.tokens
    return userObject
}

userSchema.statics.findCredential = async (email, password)=>{
    try{
        const user = await User.findOne({email})
        if(!user) return {message:'User doesn\'t exist.'}
        const check = await bcrypt.compare(password, user.password)
        if(check) return user
        else return {message:'Incorrect email/password.'}
    }catch(error){
        throw new Error(error)
    }
}

userSchema.pre('save', async function(next){
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password,8)
    }
    next()
})

userSchema.pre('remove',async function(next){
    await Task.deleteMany({owner:this._id})
    next()
})

const User = mongoose.model('User',userSchema)

module.exports = User