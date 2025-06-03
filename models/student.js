import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: String,
  age: Number,
  email: String,
  seq: { type: Number, default: 0 }
});

const Student = mongoose.model('Student', studentSchema);

export default Student;