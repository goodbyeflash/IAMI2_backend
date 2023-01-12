import mongoose, { Schema } from 'mongoose';

const quizDataSchema = new Schema({
  quizNo: Number,
  text: String,
  question: String,
  answer: String,
  time: Number,
  publishedDate: Date,
});

const QuizData = mongoose.model('QuizData', quizDataSchema);
export default QuizData;
