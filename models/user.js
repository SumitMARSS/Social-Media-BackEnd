

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        //if validation failed then custom error
        required:[true, "Please enter a name"], 
    },
    avatar:{
        type:String,
    },
    email:{
        type: String,
        required:[true, "Please enter your email"],
        //unique:[true, "Email already exists"]
    },
    password:{
        type:String,
        required:[true, "Please enter a password"],
        minlength: [4, "Password must be at least of 6 characters"],
        select:false,
    },
    token:{
        type:String,
    },
    posts:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"post",
        },
    ],
    followers:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"user",
        }
    ],
    following:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"user",
        }
    ],

})



module.exports = mongoose.model("user", userSchema);