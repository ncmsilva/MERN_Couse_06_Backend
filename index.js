import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import userRouter from './routers/userRouter.js';
import productRouter from './routers/productRouter.js';
import orderRouter from './routers/orderRouter.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cors from 'cors';
import feedBackRouter from './routers/feedBackRouter.js';
import wishlistRouter from './routers/wishlistRouter.js';

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

const _encriptionToken = process.env.JWT_SECRET;
if (!_encriptionToken) {
  console.error('JWT secret is not defined. Please set JWT_SECRET in your environment variables.');
  process.exit(1);
}
app.use((req, res, next) => {
  console.log('Request received for : ', req.url);
  console.log('Request body : ', req.body);
  const token = req.headers.authorization;
  console.log('Token received: ', token);
  if (token != null) {
    const cleanToken = token.replace('Bearer ', '');
    const valid = jwt.verify(cleanToken, _encriptionToken, (err, decoded) => {
      if (decoded == null) {
        console.log('Token verification failed: ', err);
        return res.status(401).json({ error: 'Unauthorized' });
      }
      else {
        console.log('Token verified successfully: ', decoded);
        req.user = decoded;
        next();
      }
    });
  } else {
    console.log('No token provided, proceeding without authentication');
    next();
  }
});

const conStrt = process.env.Mongo_URI;
if (!conStrt) {
  console.error('MongoDB connection string is not defined. Please set MONGO_URL in your environment variables.');
  process.exit(1);
}
mongoose.connect(conStrt).then(
  () => {
    console.log('MongoDB connected')
  }
).catch(
  (err) => {
    console.log('MongoDB connection error: ', err)
  }
);

app.use("/api/v1/user", userRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/review", feedBackRouter);
app.use("/api/v1/wishlist", wishlistRouter);


app.listen(5005, () => {
  console.log('Server is running on port 5005');
});