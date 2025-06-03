import User from "../models/user.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";

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

    User.findOne({ username: Username })
        .then((user) => {
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
                                    profileImage: user.profileImage
                                },"afdagdsadbaHDU783462RHJ43HREWUF8EW")

                            res.status(200).json({
                                message: "Login successful",
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
