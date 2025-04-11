import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
// import { ApiResponse } from "../utils/ApiResponse.js";
// import jwt from "jsonwebtoken"
// import mongoose from "mongoose";

const registerUser = asyncHandler(async (req, res) => {
  //get user details from frontend
  //validation - not empty
  //check if user already exists: username or email
  //check for images, check for avatar
  //upload them to the cloudinary, avatar
  //create user object - create entry in the database
  //remove password and refresh token from response
  // check for user creation
  //return res

  const { fullName, email, username, password } = req.body||{} ;
  console.log("email", email);

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError("Please fill all the fields", 400);
  }

  const existedUser =await User.findOne({
        $or: [{ email }, { username }],
  })

    if (existedUser) {
        throw new ApiError("User with email or username already exists", 409);
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400,"Please upload an avatar");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError("Avatar upload failed", 400);
    }

    const user = await User.create({
        fullName,
        email,
        username: username.toLowerCase(),
        password,
        avatar: avatar.secure_url,
        coverImage: coverImage?.secure_url || null,
    });

    const createUser = await User.findById(user._id).select("-password -refreshToken"); 
    if (!createUser) {
        throw new ApiError("Something went wrong while registering the user", 500);
    }


    return res.status(201).json
    (
        new ApiResponse(200, createUser, "User created successfully")
    );

});

export { registerUser };