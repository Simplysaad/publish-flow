const express = require("express")
const mongoose = require("mongoose")
require("dotenv").config()
const morgan = require("morgan")

const connectDB = require('./Server/Config/db');

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan("dev"))

app.listen(process.env.PORT, ()=>{
    connectDB();
    console.log(`Server is running on port ${process.env.PORT}`)
})

app.use("/", require("./Server/Routes/admin.routes.js"))

