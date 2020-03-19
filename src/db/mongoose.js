const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser:true,
        useUnifiedTopology:true,
        useCreateIndex:true
}).then((result)=>{
        console.log('Connected to database!')
}).catch((error) => console.log(error))
