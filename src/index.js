const express = require('express')
const taskRoutes = require('./routes/taskRoutes')
const userRoutes = require('./routes/userRoutes')


require('./db/mongoose')

const app = express()

app.use(express.json())

app.use(taskRoutes)
app.use(userRoutes)

const PORT = process.env.PORT||5000

app.listen(PORT, ()=>{
    console.log(`Server is up and running on ${PORT}`)
})

const task = require('./models/task')
const user = require('./models/user')

const main = async ()=>{
    // const mytask = await task.findById('5e6c7c653b9bf32ce026c605')
    // await mytask.populate('owner').execPopulate()
    // console.log(mytask.owner)

    // const myuser = await user.findById('5e6713b4e9dbd00a0858c371')
    // await myuser.populate('tasks').execPopulate()
    // console.log(myuser.tasks)

}
main()