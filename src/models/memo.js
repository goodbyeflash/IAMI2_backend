import mongoose, { Schema } from 'mongoose';

const memoSchema = new Schema({
  userId: String,
  text: String,
  publishedDate: Date,
});

const Memo = mongoose.model('Memo', memoSchema);
export default Memo;
