import User from "../models/user.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import axios from "axios";
import nodemailer from "nodemailer";
import Otp from "../models/otp.js";
dotenv.config();

const smtpHost = process.env.EMAIL_SERVICE;
const smtpPort = process.env.SMTP_PORT;
const emailUser = process.env.EMAIL_ID;
const emailPass = process.env.GMAIL_CODE;

const transporter = nodemailer.createTransport(
        {
            service: smtpHost,
            port: smtpPort,
            secure: false,
            auth: 
            {
                user: emailUser,
                pass: emailPass
            }
        });

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
        console.log("User is not Admin")
        return false;
    } else {
        console.log("User is Admin")
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

export async function sendOtp(req, res) 
{
    try 
    {
        console.log("SMTP Host: ", smtpHost);
        console.log("SMTP Port: ", smtpPort);   
        console.log("Email User: ", emailUser);
        console.log("Email Pass: ", emailPass);
        
        const email = req.body.email;
        console.log("Request Body Email: ", email);
        if (email) 
        {     
            const user = await User.findOne({ email: email }); //check if the email exists in the database
            console.log("User Found: ", user);
            if (!user) {
                return res.status(404).json({ message: "User with this email does not exist" }); // If user not found, return 404
            }

            await Otp.deleteMany({ email: email }); // Delete any existing OTPs for this email

            const otp = Math.floor(100000 + Math.random() * 900000).toString(); //generate a 6-digit OTP

            const newOtp = new Otp({ email: email, otp: otp }); // Save the OTP to the database
            newOtp.save();

            const message = {
                from: process.env.EMAIL_ID,
                to: email,
                subject: "Password reset OTP Code",
                text: `Your OTP code is ${otp}. It is valid for 5 minutes.`
            }

            console.log("transporter : ", transporter);
            console.log("Sending OTP email: ", message);

            await transporter.sendMail(message); // Send the OTP via email


            console.log(`Sent OTP ${otp} to email ${email}`);
            res.status(200).json({ message: "OTP sent to email" });

        }
    } 
    catch (error) 
    {
        console.error("Error sending OTP:", error);
        res.status(500).json({ message: "Failed to send OTP" });
    }
}

export async function verifyOtp(req, res) 
{
    try 
    {
        const email = req.body.email;
        const otp = req.body.otp;

        if (!email || !otp) 
        {
            return res.status(400).json({ message: "Email and OTP are required" });
        }

        const otpRecord = await Otp.findOne({ email: email, otp: otp, verified: false });

        if (!otpRecord) 
        {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        const curdatetime = new Date();
        console.log("OTP Record expired at ", otpRecord.expiresAt, "<  Current time: ", curdatetime.toISOString());
        if(otpRecord.expiresAt < curdatetime)
        {
            await Otp.deleteMany({ email: email }); // Delete expired OTPs            
            return res.status(400).json({ message: "OTP has been expired." });
        }
        else
        {
            await Otp.updateOne({ _id: otpRecord._id }, { $set: { verified: true } });               
            res.status(200).json(
                { 
                    message: "OTP verified successfully",
                    email: email
                });
                //await Otp.deleteMany({ email: email }); // OTP is valid, delete it
        }        
    } 
    catch (error) 
    {
        console.error("Error verifying OTP:", error);
        res.status(500).json({ message: "Failed to verify OTP" });
    }
}

export async function updatePassword(req, res){
    try
    {
        const email = req.body.email;
        const password = req.body.password;
        const otp = req.body.otp;

        if (!email || !otp || !password) 
        {
            return res.status(400).json({ message: "Email and Password are required" });
        }
        const otpRecord = await Otp.findOne({ email: email, otp: otp, verified: true });
        if (!otpRecord) 
        {
            return res.status(400).json({ message: "Invalid request or failled verified OTP successfuly." });
        }

        const user = await User.findOne({ email: email }); //check if the email exists in the database
        console.log("User Found: ", user);
        if (!user) {
            return res.status(404).json({ message: "User with this email does not exist" }); // If user not found, return 404
        }

        const saltText = crypto.randomBytes(10).toString("hex");
        const passwordwithsalt = password + saltText;
        const passwordhash = bcrypt.hashSync(passwordwithsalt, 12);
   
        const us = await User.updateOne({ _id: user._id }, { $set: { password: passwordhash, salt: saltText }});
        console.log("Password update result: ", us);
        await Otp.deleteMany({ email: email }); // OTP is valid, delete it
        res.status(200).json({ message: "Password updated successfully" });
    }
    catch(error)
    {
        console.error("Error updating password :", error);
        res.status(500).json({ message: "Failed to update password"});
    }
}
export async function getUsersWithPagination(req, res)
{
    try 
    {
        const page = parseInt(req.params.page) || 1
        const limit = parseInt(req.params.limit) || 10

        console.log("Page : ", page, " limit : ", limit)

        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized, Please log in to view users." });
        }
        if(isAdmin(req)) {
            const usercount = await User.countDocuments();
            const totalPages = Math.ceil(usercount/limit)
            const users = await User.find().skip((page-1)*limit).sort({ date: -1 }).limit(limit);
            return res.status(200).json(
                {
                    users : users,
                    totalpages : totalPages
                }
            );
        }
        else
        {
            const usercount = await User.countDocuments();
            const totalPages = Math.ceil(usercount/limit)
            const orders = await Order.find({ email: req.user.email }).skip((page-1)*limit).sort({ date: -1 }).limit(limit);
            return res.status(200).json(
                {
                    users : users,
                    totalpages : totalPages
                }
            );
        }
    }
    catch (error) 
    {
        console.error("Error fetching users: ", error);
        res.status(500).json({ error: "Failed to fetch users" });
    }
}
export async function getUserbyID(req, res)
{
    try 
    {
        const userID = req.params.id || ""
        console.log("user id: ", userID);
        if(!userID)
        {
            return res.status(400).json({ error: "Please provide valid userID." });
        }
        if (!req.user) 
        {
            return res.status(401).json({ error: "Unauthorized, Please log in to view users." });
        }
        if(isAdmin(req)) 
        {
            const user = await User.findOne({ _id: userID});
            return res.status(200).json(user)
        } 
        else
        {
            return res.status(401).json({ error: "Unauthorized, Only Admins can view users." });
        }
    } 
    catch (error) 
    {
        console.error("Error fetching user: ", error);
        res.status(500).json({ error: "Failed to fetch user" });
    }
    
}

export async function updateuser(req, res) 
{
    try 
    {
        const { phoneNumber, role, isBlocked, profileImage } = req.body;
        console.log("req.body : ", req.body)
        if (!req.user) 
        {
            return res.status(401).json({ error: "Unauthorized, Please log in to update user data." });
        }
        if(isAdmin(req)) 
        {
            if (!phoneNumber || !role || isBlocked === undefined) 
                {
                    return res.status(400).json({ error: "phoneNumber, role, isBlocked, All fields are required" });
                }
            const us = await User.updateOne({ email: req.body.email }, { $set: 
            { 
                phoneNumber: req.body.phoneNumber, 
                role: req.body.role,
                isBlocked: req.body.isBlocked,
                profileImage : req.body.profileImage 
            }
        });
        return res.status(200).json({ status: "Success", user: us});
        } 
        else
        {
            return res.status(401).json({ error: "Unauthorized, Only Admins can Update users." });
        }  
    } 
    catch (error) 
    {
        console.error("Error updateing user: ", error);
        res.status(500).json({ error: "Failed to update user" });
    }
}