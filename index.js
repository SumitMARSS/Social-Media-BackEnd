const express = require("express");
const DbConnection = require("./config/database");
require("dotenv").config();
const cookieParser = require("cookie-parser");


const PORT = process.env.PORT || 4001 ;

const app = express();

//using middlewares
app.use(express.json());    //if we want data from body-parsing
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// mount
app.use("/api/v1", post);
app.use("/api/v1", user);

//db connection
DbConnection();

//app route 
const post = require("./routes/post");
const user = require("./routes/user");

//activate app

app.listen(PORT, () => {
    console.log(`App is listening at ${PORT}`)
})


//default page
app.get("/", (req, res) => {
    res.send("<h1>Home page Baby</h1>");
})
