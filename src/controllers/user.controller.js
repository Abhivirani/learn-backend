import asyncHandeler from "../utils/asyncHandeler.js";
import ApiError from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import { uploadImageToCloudinary } from "../utils/cloudinary.js";   
import { ApiResponse } from "../utils/ApiResponse.js";


const registerUser = asyncHandeler(async (req,res) => {
   // get user detail from frontend
   // validation-not empty
   // check if user already exists: username , email
   // check for image , check for avatar
   // upload them to cloudinary,avatar
   // create user object- create entry in db
   // remove password and refresh token field from responce
   // check for user creation 
   // return res

   //data comes from form/json nor url 
    const {fullName,email,userName , password} = req.body
    console.log("email: ", email);

    if([fullName,email,userName,password].some((field)=> field?.trim() === "")){
        throw new ApiError(400,"All fields are required")
    }

    const existedUser = User.findOne({
        $or: [{ username}, {email}]
    })

    if(existedUser){
        throw new ApiError(409,"User already exists with this username or email")   
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar image is required")
    }

    uploadImageToCloudinary(avatarLocalPath)
    .then((result)=>{
        console.log("avatar uploaded: ", result);
    })
    .catch((error)=>{
        console.log("error while uploading avatar: ", error);
    })

    const avatar = await uploadImageToCloudinary(avatarLocalPath)
    const coverImage = await uploadImageToCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(500,"Error while uploading avatar image")
    }

    const user = await User.create({
        fullName,
        email,
        userName: userName.toLowerCase(),
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500,"Error while creating user")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User created successfully")
    )
})

export {registerUser}