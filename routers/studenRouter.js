import express from 'express';
import Student from '../models/student.js';
import { createStudent, getstudent } from '../controllers/studentController.js';

const StudentRouter = express.Router();

StudentRouter.get('/', getstudent);

StudentRouter.post('/', createStudent) 
  
  
export default StudentRouter;