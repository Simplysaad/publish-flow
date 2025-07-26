//db.js

const mongoose = require('mongoose')

const connectDb = async() =>{


  try{    
   mongoose.set('strictQuery', false)
    
    let conn = await mongoose.connect(process.env.MONGO_URI)

    if(!conn) throw new Error(`trouble while connecting to ${conn.connection.host}`)
    console.log(`MongoDB connected to ${conn.connection.host}`)

    
  }
  catch(err){
    console.error(err)
  }
}

module.exports = connectDb
