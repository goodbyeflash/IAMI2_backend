import mongoose, { Schema } from 'mongoose';

const learningSetchema = new Schema({
  learningNo: Number,
  videoName: String,
  videoUrl: String,
  quizNo: Array,
  publishedDate: Date,
});

const LearningSet = mongoose.model('LearningSet', learningSetchema);
export default LearningSet;
