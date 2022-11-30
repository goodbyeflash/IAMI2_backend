import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const TeacherSchema = new Schema({
  id: String,
  hashedPassword: String,
  name: String,
  publishedDate: Date,
});

TeacherSchema.methods.setPassword = async function (password) {
  const hash = await bcrypt.hash(password, 10);
  this.hashedPassword = hash;
  return hash;
};

TeacherSchema.methods.checkPassword = async function (password) {
  const result = await bcrypt.compare(password, this.hashedPassword);
  return result; // true / false
};

TeacherSchema.statics.findByid = function (id) {
  return this.findOne({ id });
};

TeacherSchema.methods.serialize = function () {
  const data = this.toJSON();
  delete data.hashedPassword;
  return data;
};

TeacherSchema.methods.generateToken = function () {
  const token = jwt.sign(
    // 첫 번째 파라미터에는 토큰 안에 집어넣고 싶은 데이터를 넣습니다.
    {
      id: this.id,
    },
    process.env.JWT_SECRET, // 두 번째 파라미터에는 JWT 암호를 넣습니다.
    {
      expiresIn: '7d',
    },
  );
  return token;
};

const Teacher = mongoose.model('Teacher', TeacherSchema);
export default Teacher;
