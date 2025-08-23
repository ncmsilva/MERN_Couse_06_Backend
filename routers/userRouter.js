import express from 'express';
import { createUser, getUser, googleLogin, login } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.get('/', getUser)
userRouter.post('/', createUser);
userRouter.post("/login", login);
userRouter.post("/googlelogin", googleLogin);








export default userRouter;