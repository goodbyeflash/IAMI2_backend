import mongoose, { Schema } from 'mongoose';

const learningSetchema = new Schema({
  learningNo: String,
  videoName: String,
  videoUrl: String,
  quizData: Array,
  publishedDate: Date,
});

const LearningSet = mongoose.model('LearningSet', learningSetchema);
export default LearningSet;
