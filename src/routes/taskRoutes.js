const express = require('express')
const auth = require('../middleware/auth')
const Task = require('../models/task')

const router = new express.Router()

router.post('/api/tasks',auth, async (req,res)=>{
    const myTask = new Task({
        ...req.body,
        owner: req.user._id
    })
    try{
        const result = await myTask.save()
        res.status(201).send(result)
    }catch(error){
        res.status(400).send(error)
    }
    // myTask.save().then((result)=>{
    //     res.status(201).send(result)
    // }).catch((error)=>{
    //     res.status(400).send(error)
    // })
})

//QUERY ?
//PARAM :



router.get('/api/tasks/',auth,async (req,res)=>{

    const match = {}
    if(req.query.completed){
        match.completed = req.query.completed==='true'?true:false
    }
    try{
        await req.user.populate({
            path:'tasks',
            match,
            options:{
                limit:parseInt( req.query.limit),
                skip:parseInt(req.query.skip),
                sort:{
                    //completed:1
                }
            }
        }).execPopulate()
        res.send(req.user.tasks)
    }catch(e){
        res.status(500).send(e)
    }
})

router.get('/api/tasks/:id',auth,(req,res)=>{
    Task.findOne({_id: req.params.id, owner:req.user._id}).then(result=>{
        if(result){
            return res.status(201).send(result)
        }
        return res.status(400).send({message:'No task found.'})
    }).catch(error=>{
        res.status(500).send(error)
    })
})

router.patch('/api/tasks/:id', auth, async (req,res)=>{    
    try{
            //const task = await Task.findByIdAndUpdate(req.params.id, req.body, {new:true, runValidators:true})
            const task = await Task.findOneAndUpdate({_id:req.params.id, owner:req.user._id},req.body,{new:true, runValidators:true})
            if(!task){
                return res.status(404).send({message:'Wrong update!'})
            }
            res.send(task)
        }catch(error){
            res.status(500).send(error)
        }
})

router.delete('/api/tasks/:id',auth,async (req,res)=>{
    try{
        const task = await Task.findOneAndDelete({_id:req.params.id, owner:req.user._id})
        if(!task) return res.status(404).send({message:'Document not found!'})
        res.send(task)
    }catch(e){
        res.send(e)
    }
})

module.exports = router