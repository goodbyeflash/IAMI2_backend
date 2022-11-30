import Memo from '../../models/memo';
import User from '../../models/user';
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
    const userCount = await Memo.countDocuments({}).exec();
    ctx.set('Last-Page', Math.ceil(userCount / 10));
    ctx.body = memos.map((user) => user.toJSON());
  } catch (error) {
    ctx.throw(500, error);
  }
};

/*
  POST /api/memo/register
  {
    "userId" : "test1",
    "text" : "선생님께",
    "publishedDate" : new Date()
  }
 */
export const register = async (ctx) => {
  const schema = Joi.object().keys({
    // 객체가 다음 필드를 가지고 있음을 검증
    userId: Joi.string().required(), // required()가 있으면 필수 항목
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
  POST /api/memo/find
  {
    "filter" : {
      "learningDate" : "2022-11-30",
    }
  }
*/
export const find = async (ctx) => {
  const body = ctx.request.body || {};

  const findData = {};

  // if (body.dateGte && body.dateLt) {
  //   findData['publishedDate'] = {
  //     $gte: moment(body.dateGte).startOf('day').format(),
  //     $lt: moment(body.dateLt).endOf('day').format(),
  //   };
  // }

  try {
    let memo;
    if (body.filter) {
      const key = Object.keys(body.filter)[0];
      memo = await Memo.find(findData)
        .where(key)
        .equals(body.filter[key])
        .exec();
    } else {
      memo = await Memo.find(findData).exec();
    }
    ctx.body = memo;
  } catch (error) {
    ctx.throw(500, error);
  }
};
