import express from 'express';
import { createUser, getUser, googleLogin, login, sendOtp, updatePassword, verifyOtp } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.get('/', getUser)
userRouter.post('/', createUser);
userRouter.post("/login", login);
userRouter.post("/googlelogin", googleLogin);
userRouter.post("/send-otp", sendOtp);
userRouter.post("/verify-otp", verifyOtp);
userRouter.post("/change-password", updatePassword);








export default userRouter;