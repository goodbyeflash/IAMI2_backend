import mongoose, { Schema } from 'mongoose';

const learningInfoSchema = new Schema({
  learningDate: String,
  learningTime: String,
  userId: String,
  teacherImgUrl: String,
  learningText: String,
  learningNo: String,
  publishedDate: Date,
});

const LearningInfo = mongoose.model('LearningInfo', learningInfoSchema);
export default LearningInfo;
