import Teacher from '../../models/teacher';
import mongoose from 'mongoose';
import Joi from '@hapi/joi';

const { ObjectId } = mongoose.Types;

export const getTeacherById = async (ctx, next) => {
  const { id } = ctx.params;
  if (!ObjectId.isValid(id)) {
    ctx.status = 400; // Bad Request
    return;
  }
  try {
    const teacher = await Teacher.findById(id);
    // 선생이 존재하지 않을 때
    if (!teacher) {
      ctx.status = 404; // Not Found
      return;
    }
    ctx.state.teacher = teacher;
    return next();
  } catch (e) {
    ctx.throw(500, e);
  }
};

/*
  POST /api/teachers/register
  {
      "id" : "kim",
      "password" : "",
      "name" : "김교사",
      "publishedDate" : new Date(),
  }
*/
export const register = async (ctx) => {
  // Request Body 검증하기
  const schema = Joi.object().keys({
    id: Joi.string().alphanum().min(3).max(20).required(),
    password: Joi.string().required(),
    name: Joi.string().required(),
    publishedDate: Joi.date().required(),
  });
  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.result = 400;
    ctx.body = result.error;
    return;
  }

  const { id, password, name, publishedDate } = ctx.request.body;
  try {
    // id이 이미 존재하는지 확인
    const exists = await Teacher.findByid(id);
    if (exists) {
      ctx.status = 409; // Confict
      return;
    }

    const teacher = new Teacher({
      id,
      password,
      name,
      publishedDate,
    });
    await teacher.setPassword(password); // 비밀번호 설정
    await teacher.save(); // 데이터베이스에 저장

    // 응답할 데이터에서 hashedPassword 필드 제거
    ctx.body = teacher.serialize();

    const token = teacher.generateToken();
    ctx.cookies.set('teacher_access_token', token, {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
      httpOnly: true,
    });
  } catch (e) {
    ctx.throw(500, e);
  }
};

/*
    POST /api/teachers/login
    {
        "id" : "kim",
        "password" : ""
    }
*/
export const login = async (ctx) => {
  const { id, password } = ctx.request.body;
  // id, password가 없으면 에러 처리
  if (!id || !password) {
    ctx.status = 401; // Unteacherorized
    return;
  }

  try {
    const teacher = await Teacher.findByid(id);
    // 계정이 존재하지 않으면 에러 처리
    if (!teacher) {
      ctx.status = 401;
      return;
    }
    const valid = await teacher.checkPassword(password);
    // 잘못된 비밀번호
    if (!valid) {
      ctx.status = 401;
      return;
    }
    ctx.body = teacher.serialize();
    const token = teacher.generateToken();
    ctx.cookies.set('teacher_access_token', token, {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
      httpOnly: true,
    });
  } catch (e) {
    ctx.throw(500, e);
  }
};

/*
    GET /api/teachers/check
*/
export const check = async (ctx) => {
  const { teacher } = ctx.state;
  if (!teacher) {
    // 로그인 중 아님
    ctx.status = 401; // Unteacherorized
    return;
  }
  ctx.body = teacher;
};

/*
    POST /api/teachers/logout
*/
export const logout = async (ctx) => {
  ctx.cookies.set('teacher_access_token');
  ctx.status = 204; // No Content
};
