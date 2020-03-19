const User = require('../models/user')
const jwt = require('jsonwebtoken')
const auth = async (req,res,next)=>{
    try{
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        const user = await User.findOne({__id:decoded.__id, 'tokens.token':token})
        if(!user){
            throw new Error('User not found!')
        }
        req.user = user
        req.token = token
        next()
    }catch(e){
        res.status(401).send({
            message:'Authentication error!'
        })
        next()
    }

}

module.exports = auth
