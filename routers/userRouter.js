import express from 'express';
import { createUser, getUser, getUserbyID, getUsersWithPagination, googleLogin, login, sendOtp, updatePassword, updateuser, verifyOtp } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.get('/', getUser)
userRouter.post('/', createUser);
userRouter.post("/login", login);
userRouter.post("/googlelogin", googleLogin);
userRouter.post("/send-otp", sendOtp);
userRouter.post("/verify-otp", verifyOtp);
userRouter.post("/change-password", updatePassword);
userRouter.get('/:page/:limit', getUsersWithPagination);
userRouter.get('/:id', getUserbyID);
userRouter.patch("/update", updateuser);








export default userRouter;