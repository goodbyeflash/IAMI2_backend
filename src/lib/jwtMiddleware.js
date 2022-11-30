import jwt from 'jsonwebtoken';
import Teacher from '../models/teacher';

const jwtMiddleware = async (ctx, next) => {
  const token = ctx.cookies.get('teacher_access_token');
  if (!token) return next(); // 토큰이 없음
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    ctx.state.teacher = {
      id: decoded.id,
    };

    // 토큰의 남은 유효 기간이 3.5일 미만이면 재발급
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp - now < 60 * 60 * 24 * 3.5) {
      const teacher = await Teacher.findById(decoded._id);
      const token = teacher.generateToken();
      ctx.cookies.set('teacher_access_token', token, {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
        httpOnly: true,
      });
    }
    return next();
  } catch (error) {
    // 토큰 검증 실패
    return next();
  }
};

export default jwtMiddleware;
