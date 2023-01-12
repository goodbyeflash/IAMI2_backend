import Memo from '../../models/memo';
import Joi from '@hapi/joi';

/*
  GET /api/memo?page=
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
    const memos = await Memo.find({})
      .sort({ _id: -1 })
      .limit(10)
      .skip((page - 1) * 10)
      .exec();
    const memoCount = await Memo.countDocuments({}).exec();
    ctx.set('Last-Page', Math.ceil(memoCount / 10));
    ctx.body = memos.map((memo) => memo.toJSON());
  } catch (error) {
    ctx.throw(500, error);
  }
};

/*
  POST /api/memo/register
  {
    "userId" : test1,
    "text" : "선생님께",
    "publishedDate" : new Date()
  }
 */
export const register = async (ctx) => {
  const schema = Joi.object().keys({
    // 객체가 다음 필드를 가지고 있음을 검증
    userId: Joi.number().required(), // required()가 있으면 필수 항목
    text: Joi.string().required(),
    publishedDate: Joi.date().required(),
  });

  // 검증하고 나서 검증 실패인 경우 에러 처리
  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = 400; // Bad Request
    ctx.body = result.error;
    return;
  }
  const { userId, text, publishedDate } = ctx.request.body;

  try {
    const memo = new Memo({
      userId,
      text,
      publishedDate,
    });

    await memo.save();
    ctx.body = memo;
  } catch (error) {
    ctx.throw(500, error);
  }
};

/*
  POST /api/memo/find?page=
  {
    "userId" : "test2"
  }
*/
export const find = async (ctx) => {
  const body = ctx.request.body || {};
  if (Object.keys(body).length > 0) {
    const key = Object.keys(body)[0];
    if (key == 'userId') {
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
    const memos = await Memo.find(body)
      .sort({ _id: -1 })
      .limit(10)
      .skip((page - 1) * 10)
      .exec();
    const userCount = await Memo.countDocuments(body).exec();
    ctx.set('Last-Page', Math.ceil(userCount / 10));
    ctx.body = memos.map((memo) => memo.toJSON());
  } catch (error) {
    ctx.throw(500, error);
  }
};
