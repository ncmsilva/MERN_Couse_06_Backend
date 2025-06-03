import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import StudentRouter from './routers/studenRouter.js';
import userRouter from './routers/userRouter.js';
import jwt from 'jsonwebtoken';

const app = express();
app.use(bodyParser.json());
const conStrt = "mongodb+srv://mern:Mern123@cluster0.psjxyb0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"



mongoose.connect(conStrt).then(
  () => {
    console.log('MongoDB connected')
  }
).catch(
  (err) => {
    console.log('MongoDB connection error: ', err)
  }
);

app.use((req, res, next) => {
  console.log('Request received for : ', req.url);
  const token = req.headers.authorization;
  console.log('Token received: ', token);
  if (token != null) {
    const cleanToken = token.replace('Bearer ', '');
    const valid = jwt.verify(cleanToken, 'afdagdsadbaHDU783462RHJ43HREWUF8EW', (err, decoded) => {
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
    next();
  }
});

app.use("/student", StudentRouter);
app.use("/user", userRouter);



app.listen(5005, () => {
  console.log('Server is running on port 5005');
});