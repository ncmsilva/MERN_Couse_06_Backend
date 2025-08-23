import User from "../models/user.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import axios from "axios";

export function createUser(req, res) 
{
    const saltText = crypto.randomBytes(10).toString("hex");
    const passwordwithsalt = req.body.password + saltText;
    const passwordhash = bcrypt.hashSync(passwordwithsalt, 12);

    const userdata = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        username: req.body.username,
        password: passwordhash,
        salt: saltText,
    };

    const user = new User(userdata);
    user
        .save()
        .then((savedUser) => {
            res.status(201).json({
                message: "User created successfully",
                user: savedUser,
            });
        })
        .catch((error) => {
            res.status(500).json({
                message: "Error creating user",
                error: error.message,
            });
        });
}

export function login(req, res) 
{
    const Username = req.body.username;
    const Password = req.body.password;

    console.log("Username: ", Username);
    console.log("Password: ", Password);

    const _encriptionToken = process.env.JWT_SECRET;
    User.findOne({ username: Username })
        .then((user) => {
            console.log("User: ", user);
            if (user != null) {
                const salttext = user.salt;
                const passwordwithsalt = Password + salttext;

                bcrypt.compare(passwordwithsalt, user.password)
                    .then((result) => {
                        if (result) {

                            const Token = jwt.sign(
                                {
                                    userId: user._id,
                                    username: user.username,
                                    firstName: user.firstName,
                                    lastName: user.lastName,
                                    email: user.email,
                                    role: user.role,
                                    isBlocked: user.isBlocked,
                                    isEmailVerified: user.isEmailVerified,
                                    profileImage: user.profileImage,
                                    phoneNumber: user.phoneNumber
                                },_encriptionToken,
                                {
                                    expiresIn: "5minutes",
                                } )

                            res.status(200).json({
                                message: "Login successful",
                                Userrole: user.role,
                                Token: Token                                
                            });
                        } else {
                            res.status(403).json({
                                message: "Invalied username or password"
                            });
                        }
                    })
                    .catch((error) => { });
            } else {
                res.status(404).json({
                    message: "User not found",
                });
            }
        })
        .catch((error) => {
            res.status(404).json({
                message: "User not found",
            });
        });
}

export function isAdmin(req) 
{
    if (req.user == null || req.user.role !== 'admin') {
        return false;
    } else {
        return true;
    }
}

export function getUser(req, res) 
{
    if (req.user == null) {
        res.status(404).json({message : "User not found"})
    } else {
        res.json(req.user)
    }
}

export async function googleLogin(req, res) 
{
    console.log("Google Login Request Body: ", req.body);
    const access_token = req.body.token;
    console.log("Access Token: ", access_token);
    const googleauthapi = process.env.GOOGLE_AUTH_URL;
    console.log("Google Auth API: ", googleauthapi);
    const _encriptionToken = process.env.JWT_SECRET;
    try 
    {
        if (!access_token) {
            return res.status(400).json({ message: "Access token is required" });
        }

        const response = await axios.get(googleauthapi, 
        {
            headers: { 
                Authorization: `Bearer ${access_token}`
            }
        })
        console.log("Google User Info: ", response.data);
        const fname = response.data.given_name;
        const Lname = response.data.family_name;
        const email = response.data.email;
        const proPic = response.data.picture;

        const resUser = await User.findOne({ username: email })

        console.log("Response User: ", resUser);

        if(resUser !=null)
        {
            const Token = jwt.sign(
            {
                userId: resUser._id,
                username: resUser.username,
                firstName: resUser.firstName,
                lastName: resUser.lastName,
                email: resUser.email,
                role: resUser.role,
                isBlocked: resUser.isBlocked,
                isEmailVerified: resUser.isEmailVerified,
                profileImage: resUser.profileImage,
                phoneNumber: resUser.phoneNumber
            },_encriptionToken,
            {
                expiresIn: "5minutes",
            } )

            res.status(200).json(
                {
                    message: "Login successful",
                    Userrole: resUser.role,
                    Token: Token                                
                });
        }
        else
        {
            console.log("New User, Registering...");
            const userdata = {
                firstName: fname,
                lastName: Lname,
                email: email,
                username: email,
                password: "123456",
                profileImage: proPic,
                isEmailVerified: true,
                isBlocked: false
                };

            const user = new User(userdata);
            const newuserRes = await user.save()

            const Token = jwt.sign(
            {
                userId: newuserRes._id,
                username: newuserRes.username,
                firstName: newuserRes.firstName,
                lastName: newuserRes.lastName,
                email: newuserRes.email,
                role: newuserRes.role,
                isBlocked: newuserRes.isBlocked,
                isEmailVerified: newuserRes.isEmailVerified,
                profileImage: newuserRes.profileImage,
                phoneNumber: newuserRes.phoneNumber
            },_encriptionToken,
            {
                expiresIn: "5minutes",
            } )

            res.status(200).json(
                {
                    message: "Login successful",
                    Userrole: newuserRes.role,
                    Token: Token                                
                });
        }
    } 
    catch (error) 
    {
        console.error("Error during Google login:", error);
        return res.status(500).json({ message: "Failed to authenticate user with Google" });
    }    
}
