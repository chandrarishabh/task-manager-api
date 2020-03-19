const express = require('express')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const sharp = require('sharp')

const router = new express.Router()

const auth = require('../middleware/auth')

const upload = multer({
    limits:{
        fileSize:1024*1024
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpeg|jpg|png)$/)){
            return cb(new Error('Please upload a valid image file format.'))
        }
        cb(undefined, true)
    }
})

router.get('/api/users/avatar/:id', async(req,res)=>{
    try{
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar){
            throw new Error('Not found!')
        }
        res.set('Content-Type','image/png')
        res.send(user.avatar)
    }catch(e){
        res.status(500).send(e)
    }
})

router.delete('/api/users/me/avatar',auth, upload.single('avatar'), async(req, res)=>{
    try{
        req.user.avatar = undefined
        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send(e)
    }
    
})

router.post('/api/users/me/avatar',auth, upload.single('avatar'), async(req, res)=>{
    try{
        req.user.avatar = await sharp(req.file.buffer).png().toBuffer()
        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send(e)
    }
    
},(error, req, res, next)=>{
    if(error){
        res.status(404).send({error: error.message})
    }
    next()
})

router.post('/api/users', async (req,res)=>{
    const myUser = new User(req.body)
    try{
        await myUser.save()
        const token = await myUser.genAuthToken()
        res.status(201).send({myUser, token})   
    }catch(error){
        res.status(400).send(error)
    }
})

router.get('/api/users/me',auth, (req,res)=>{
    try{
        res.send(req.user)
    }catch(e){
        res.status(401).send(e)
    }
})

router.post('/api/users/logout', auth, async (req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((t)=>{
            return t.token !== req.token
        })
        await req.user.save()
        return res.status(200).send({message: 'Logged out'})
    }catch(e){
        return res.status(500).send(e)
    }
})

router.patch('/api/users/me', auth, async (req,res)=>{
    const keys = ['name', 'email', 'password', 'age']
    const updates = Object.keys(req.body)
    const valid = updates.every((update)=>keys.includes(update))
    req.user[k] = req.body[k]
    if(!valid) res.status(400).send({'error':'Invalid update!'})
    try{
        updates.forEach((k)=>{
        })
        await req.user.save()
        res.status(200).send(req.user)
    }catch(e){
        res.status(500).send(e)
    }
})

router.delete('/api/users/me', auth, async (req, res)=>{
    try{
        await req.user.remove()
        res.send(req.user)  
    }catch(e){
        res.status(500).send(e)
    }
})

router.patch('/api/users/:id', async (req,res)=>{
    const updates = Object.keys(req.body)
    try{
        const user = await User.findById(req.params.id)
        updates.forEach((u)=>{
            user[u] = req.body[u]
        })
        await user.save()
        //const user = await User.findByIdAndUpdate(req.params.id, req.body, {new:true, runValidators:true})
        if(!user){
            return res.status(404).send({message:'Wrong update!'})
        }
        res.send(user)
    }catch(error){
        res.status(500).send(error) 
    }
})

router.post('/api/users/login', async (req,res)=>{
    try{
        const result = await User.findCredential(req.body.email, req.body.password)
        if(!result.message){
            const token = await result.genAuthToken()
            res.send({user: result.getPublicProfile(), token:token})
        }else{
            res.status(401).send(result)
        }
    }catch(error){
        res.status(500).send(error)
    }
})



module.exports = router





// router.get('/api/users',async (req,res)=>{
//     try{
//         const result = await User.find({})
//         if(result){
//             return res.status(201).send(result)
//         }else{
//             return res.status(400).send({message:'No user found.'})
//         }
//     }catch(error){
//         res.status(500).send(error)
//     }   
//     // User.find({}).then(result=>{
//     //     if(result){
//     //         return res.status(201).send(result)
//     //     }
//     //     return res.status(400).send({message:'No user found.'})
//     // }).catch(error=>{
//     //     res.status(500).send(error)
//     // })
// })

// router.get('/api/users/:id',async (req,res)=>{
//     try{
//         const result = await User.findById(req.params.id)
//         if(result){
//             return res.status(201).send(result)
//         }else{
//             return res.status(400).send({message:'No user found.'})
//         }
//     }catch(error){
//         res.status(500).send(error)
//     }
//     // User.findById(req.params.id).then(result=>{
//     //     if(result){
//     //         return res.status(201).send(result)
//     //     }
//     //     return res.status(400).send({message:'No user found.'})
//     // }).catch(error=>{
//     //     res.status(500).send(error)
//     // })
// })