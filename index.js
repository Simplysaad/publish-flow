const express = require("express")
const mongoose = require("mongoose")
require("dotenv").config()
const morgan = require("morgan")

const session = require("express-session")
const MongoStore = require("connect-mongo")

const connectDB = require('./Server/Config/db');

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan("dev"))

app.use(
  session({
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
    }),
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookies: {
      maxAge: 3600000,
      secure: false,
      httpOnly: true,
    },
  })
);

app.listen(process.env.PORT, ()=>{
    connectDB();
    console.log(`Server is running on port ${process.env.PORT}`)
})

app.use("/", require("./Server/Routes/admin.routes.js"))
app.use("/auth", require("./Server/Routes/auth.routes.js"))

