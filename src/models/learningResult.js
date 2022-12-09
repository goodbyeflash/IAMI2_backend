import mongoose, { Schema } from 'mongoose';

const learningResultSchema = new Schema({
  userId: String,
  learningNo: String,
  learningTime: Number,
  videoRunTime: Number,
  quizAvg: Number,
  quizAvgRunTime: Number,
  quizIncorrectNumber: String,
  quizTotalScore: Number,
  publishedDate: Date,
  replayAvg: Number,
  replayAvgRunTime: Number,
  replayPublishedDate: Date,
});

const LearningResult = mongoose.model('LearningResult', learningResultSchema);
export default LearningResult;
