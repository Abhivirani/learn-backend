import mongoose, { Schema } from "mongoose";
import jwt from "jasonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true, // remove extraspace from start and end
        index: true // Creates an index on username, Makes search faster
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true, 
    },
    fullname:{
        type: String,
        required: true,
        trim: true, 
        index: true
    },
    avatar:{
        type: String, // cloudinary url
        required: true,
    },
    coverimage:{
        type: String, //cloudinary url
    },
    watchHistory:[
        {
        type: Schema.Types.ObjectId,
        ref: "Video"     
        }
    ],
    password:{
        type: String,
        require: [true,"Password is Required"], // true + costum error message
    },
    refreshToken:{
        type: String
    }
    
},{timestamps: true})

userSchema.pre("save", async function (next) { // we not use call back function because it doesnt have this pointer
                                                // enctyption takes time so use async function
    if(!this.isModified("password")){return next();}
    this.password = bcrypt.hash(this.password, 10)
    next()
})
export const User = mongoose.model("User",userSchema)