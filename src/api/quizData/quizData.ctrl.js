import QuizData from '../../models/quizData';
import mongoose from 'mongoose';
import Joi from '@hapi/joi';

const { ObjectId } = mongoose.Types;

/*
  GET /api/quizData?page=
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
    const quizDatas = await QuizData.find({})
      .sort({ quizNo: -1 })
      .limit(10)
      .skip((page - 1) * 10)
      .exec();
    const quizDataCount = await QuizData.countDocuments({}).exec();
    ctx.set('Last-Page', Math.ceil(quizDataCount / 10));
    ctx.body = quizDatas.map((quizData) => quizData.toJSON());
  } catch (error) {
    ctx.throw(500, error);
  }
};

/*
  GET /api/quizData/_id
*/
export const read = async (ctx) => {
  const { _id } = ctx.params;
  if (!ObjectId.isValid(_id)) {
    ctx.status = 400; // Bad Request
    return;
  }
  try {
    const quizData = await QuizData.findById(_id);
    // 학습세트가 존재하지 않을 때
    if (!quizData) {
      ctx.status = 404; // Not Found
      return;
    }
    ctx.body = quizData;
  } catch (e) {
    ctx.throw(500, e);
  }
};

/*
  POST /api/quizData/register
  {
    "quizNo" : "1",
    "text" : "1번 문제 입니다.",
    "question" : "1+1=?",
    "answer" : "2",
    "time" : 30,
    "publishedDate" : new Date()
  }
 */
export const register = async (ctx) => {
  const schema = Joi.object().keys({
    // 객체가 다음 필드를 가지고 있음을 검증
    quizNo: Joi.string().required(), // required()가 있으면 필수 항목
    text: Joi.string().required(),
    question: Joi.string().required(),
    answer: Joi.string().required(),
    time: Joi.number().required(),
    publishedDate: Joi.date().required(),
  });

  // 검증하고 나서 검증 실패인 경우 에러 처리
  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = 400; // Bad Request
    ctx.body = result.error;
    return;
  }
  const { quizNo, text, question, answer, time, publishedDate } =
    ctx.request.body;

  try {
    const exists = await QuizData.find().where('quizNo').equals(quizNo);
    // quizData가 존재하면 중복 처리
    if (exists.length > 0) {
      ctx.status = 409;
      return;
    }

    const quizData = new QuizData({
      quizNo,
      text,
      question,
      answer,
      time,
      publishedDate,
    });

    await quizData.save();
    ctx.body = quizData;
  } catch (error) {
    ctx.throw(500, error);
  }
};

/*
  POST /api/quizData/find?page=
  {
    "quizNo" : "2"
  }
*/
export const find = async (ctx) => {
  const body = ctx.request.body || {};
  if (Object.keys(body).length > 0) {
    const key = Object.keys(body)[0];
    if (key == 'quizNo') {
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
    const quizDatas = await QuizData.find(body)
      .sort({ quizNo: -1 })
      .limit(10)
      .skip((page - 1) * 10)
      .exec();
    const quizDataCount = await QuizData.countDocuments(body).exec();
    ctx.set('Last-Page', Math.ceil(quizDataCount / 10));
    ctx.body = quizDatas.map((quizData) => quizData.toJSON());
  } catch (error) {
    ctx.throw(500, error);
  }
};

/*
  PATCH /api/quizData/:_id
  {
    "quizNo" : "1",
    "text" : "1번 문제 입니다.",
    "question" : "1+1=?",
    "answer" : "2",
    "time" : 30
  }
*/
export const update = async (ctx) => {
  const { _id } = ctx.params;

  const schema = Joi.object().keys({
    quizNo: Joi.string().required(),
    text: Joi.string(),
    question: Joi.string(),
    answer: Joi.string(),
    time: Joi.number(),
  });

  // 검증하고 나서 검증 실패인 경우 에러 처리
  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = 400; // Bad Request
    ctx.body = result.error;
    return;
  }

  try {
    const nextData = { ...ctx.request.body };

    const updateContent = await QuizData.findByIdAndUpdate(_id, nextData, {
      new: true, // 이 값을 설정하면 업데이트된 데이터를 반환합니다.
      // false일 때는 업데이트되기 전의 데이터를 반환합니다.
    }).exec();
    if (!updateContent) {
      ctx.status = 404;
      return;
    }
    ctx.body = updateContent;
  } catch (error) {
    ctx.throw(500, error);
  }
};

/*
  POST /api/quizData/select
  {
    "quizNo" : ["1","3"]
  }
*/
export const select = async (ctx) => {
  const schema = Joi.object().keys({
    // 객체가 다음 필드를 가지고 있음을 검증
    quizNo: Joi.array().required(), // required()가 있으면 필수 항목
  });

  // 검증하고 나서 검증 실패인 경우 에러 처리
  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = 400; // Bad Request
    ctx.body = result.error;
    return;
  }
  const { quizNo } = ctx.request.body;

  try {
    const exists = await QuizData.find({
      quizNo: {
        $in: quizNo,
      },
    }).exec();
    if (exists) {
      ctx.body = exists;
    } else {
      ctx.status = 404;
    }
  } catch (error) {
    ctx.throw(500, error);
  }
};

/*
  DELETE /api/quizData/:_id
*/
export const remove = async (ctx) => {
  const { _id } = ctx.params;
  try {
    await QuizData.findByIdAndRemove(_id).exec();
    ctx.status = 204; // No QuizData (성공하기는 했지만 응답할 데이터는 없음)
  } catch (error) {
    ctx.throw(500, error);
  }
};
