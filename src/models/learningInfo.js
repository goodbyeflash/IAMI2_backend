import mongoose, { Schema } from 'mongoose';

const learningInfoSchema = new Schema({
  learningDate: String,
  learningTime: String,
  userId: String,
  teacherImgUrl: String,
  learningText: String,
  learningData: Array,
  publishedDate: Date,
});

const LearningInfo = mongoose.model('LearningInfo', learningInfoSchema);
export default LearningInfo;
