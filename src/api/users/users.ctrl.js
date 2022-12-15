import User from '../../models/user';
import mongoose from 'mongoose';
import Joi from '@hapi/joi';
import requsetIp from 'request-ip';

const { ObjectId } = mongoose.Types;

/*
  GET /api/users/_id
*/
export const read = async (ctx) => {
  const { _id } = ctx.params;
  if (!ObjectId.isValid(_id)) {
    ctx.status = 400; // Bad Request
    return;
  }
  try {
    const user = await User.findById(_id);
    // 유저가 존재하지 않을 때
    if (!user) {
      ctx.status = 404; // Not Found
      return;
    }
    ctx.body = user;
  } catch (e) {
    ctx.throw(500, e);
  }
};

/*
  GET /api/users?page=
*/
export const list = async (ctx) => {
  // query는 문자열이기 때문에 숫자로 변환해 주어야 합니다.
  // 값이 주어지지 않았다면 1을 기본으로 사용합니다.
  const page = parseInt(ctx.query.page || '1', 10);

  if (page < 1) {
    ctx.status = 400;
    return;
  }

  try {
    const users = await User.find({})
      .sort({ id: -1 })
      .limit(10)
      .skip((page - 1) * 10)
      .exec();
    const userCount = await User.countDocuments({}).exec();
    ctx.set('Last-Page', Math.ceil(userCount / 10));
    ctx.body = users.map((user) => user.toJSON());
  } catch (error) {
    ctx.throw(500, error);
  }
};

/*
  POST /api/users
  {
    "id" : "test",
    "password" : "",
    "name" : "홍길동",
    "publishedDate" : new Date()
  }
 */
export const register = async (ctx) => {
  const schema = Joi.object().keys({
    // 객체가 다음 필드를 가지고 있음을 검증
    id: Joi.string().required(),
    password: Joi.string().required(),
    name: Joi.string().required(),
    publishedDate: Joi.date().required(),
  });

  // 검증하고 나서 검증 실패인 경우 에러 처리
  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = 400; // Bad Request
    ctx.body = result.error;
    return;
  }
  const { id, password, name, publishedDate } = ctx.request.body;

  try {
    // id이 이미 존재하는지 확인
    const exists = await User.findByid(id);
    if (exists) {
      ctx.status = 409; // Confict
      return;
    }

    let ip = requsetIp.getClientIp(ctx.request);

    if (ip.indexOf('::ffff:') > -1) {
      ip = ip.replace('::ffff:', '');
    }

    const user = new User({
      id,
      password,
      name,
      ip,
      publishedDate,
    });

    await user.setPassword(password); // 비밀번호 설정
    await user.save(); // 데이터베이스에 저장

    // 응답할 데이터에서 hashedPassword 필드 제거
    ctx.body = user.serialize();

    const token = user.generateToken();
    ctx.cookies.set('user_access_token', token, {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
      httpOnly: true,
    });
  } catch (error) {
    ctx.throw(500, error);
  }
};

/*
  POST /api/users/find?page=
  {
    "name" : "김"
  }
*/
export const find = async (ctx) => {
  const body = ctx.request.body || {};
  if (Object.keys(body).length > 0) {
    const key = Object.keys(body)[0];
    if (key == 'id') {
      body[key] = { $eq: body[key] };
    } else {
      body[key] = { $regex: '.*' + body[key] + '.*' };
    }
  }
  const page = parseInt(ctx.query.page || '1', 10);

  if (page < 1) {
    ctx.status = 400;
    return;
  }

  try {
    const users = await User.find(body)
      .sort({ id: -1 })
      .limit(10)
      .skip((page - 1) * 10)
      .exec();
    const userCount = await User.countDocuments(body).exec();
    ctx.set('Last-Page', Math.ceil(userCount / 10));
    ctx.body = users.map((user) => user.toJSON());
  } catch (error) {
    ctx.throw(500, error);
  }
};

/*
    POST /api/users/login
    {
        "id" : "test",
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
    const user = await User.findByid(id);
    // 계정이 존재하지 않으면 에러 처리
    if (!user) {
      ctx.status = 401;
      return;
    }
    const valid = await user.checkPassword(password);
    // 잘못된 비밀번호
    if (!valid) {
      ctx.status = 401;
      return;
    }

    ctx.body = user.serialize();
    const token = user.generateToken();
    ctx.cookies.set('user_access_token', token, {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
      httpOnly: true,
    });
  } catch (e) {
    ctx.throw(500, e);
  }
};

/*
    GET /api/users/check
*/
export const check = async (ctx) => {
  const { user } = ctx.state;
  if (!user) {
    // 로그인 중 아님
    ctx.status = 401; // Unteacherorized
    return;
  }
  ctx.body = user;
};

/*
    POST /api/users/logout
*/
export const logout = async (ctx) => {
  ctx.cookies.set('user_access_token');
  ctx.status = 204; // No Content
};

/*
  DELETE /api/users/:_id
*/
export const remove = async (ctx) => {
  const { _id } = ctx.params;
  try {
    await User.findByIdAndRemove(_id).exec();
    ctx.status = 204; // No Content (성공하기는 했지만 응답할 데이터는 없음)
  } catch (error) {
    ctx.throw(500, error);
  }
};

/*
  PATCH /api/users/:_id
  {
    "password" : "수정비밀번호",
    "name" : "수정이름",
  }
*/
export const update = async (ctx) => {
  const { _id } = ctx.params;
  // write에서 사용한 schema와 비슷한데, required()가 없습니다.
  const schema = Joi.object().keys({
    password: Joi.string(),
    name: Joi.string(),
  });

  // 검증하고 나서 검증 실패인 경우 에러 처리
  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = 400; // Bad Request
    ctx.body = result.error;
    return;
  }

  const { password } = ctx.request.body;

  try {
    const admin = new User({
      password,
    });

    const nextData = { ...ctx.request.body }; // 객체를 복사하고 body 값이 주어졌으면 HTML 필터링
    if (nextData.password) {
      nextData.hashedPassword = await admin.setPassword(password);
      delete nextData.password;
    }

    const updateUser = await User.findByIdAndUpdate(_id, nextData, {
      new: true, // 이 값을 설정하면 업데이트된 데이터를 반환합니다.
      // false일 때는 업데이트되기 전의 데이터를 반환합니다.
    }).exec();
    if (!updateUser) {
      ctx.status = 404;
      return;
    }
    ctx.body = updateUser.serialize();
  } catch (error) {
    ctx.throw(500, error);
  }
};
