import LearningSet from '../../models/learningSet';
import mongoose from 'mongoose';
import Joi from '@hapi/joi';

const { ObjectId } = mongoose.Types;

/*
  GET /api/learningSet?page=
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
    const learningSets = await LearningSet.find({})
      .sort({ learningNo: -1 })
      .limit(10)
      .skip((page - 1) * 10)
      .exec();
    const learningSetCount = await LearningSet.countDocuments({}).exec();
    ctx.set('Last-Page', Math.ceil(learningSetCount / 10));
    ctx.body = learningSets.map((learningSet) => learningSet.toJSON());
  } catch (error) {
    ctx.throw(500, error);
  }
};

/*
  GET /api/learningSet/_id
*/
export const read = async (ctx) => {
  const { _id } = ctx.params;
  if (!ObjectId.isValid(_id)) {
    ctx.status = 400; // Bad Request
    return;
  }
  try {
    const learningSet = await LearningSet.findById(_id);
    // 학습세트가 존재하지 않을 때
    if (!learningSet) {
      ctx.status = 404; // Not Found
      return;
    }
    ctx.body = learningSet;
  } catch (e) {
    ctx.throw(500, e);
  }
};

/*
  POST /api/learningSet/register
  {
    "learningNo" : "1",
    "videoName" : "비디오이름",
    "videoUrl" : "비디오링크",
    "quizNo" : ["1","2","3"],
    "publishedDate" : new Date()
  }
 */
export const register = async (ctx) => {
  const schema = Joi.object().keys({
    // 객체가 다음 필드를 가지고 있음을 검증
    learningNo: Joi.string().required(), // required()가 있으면 필수 항목
    videoName: Joi.string().required(),
    videoUrl: Joi.string().required(),
    quizNo: Joi.array().required(),
    publishedDate: Joi.date().required(),
  });

  // 검증하고 나서 검증 실패인 경우 에러 처리
  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = 400; // Bad Request
    ctx.body = result.error;
    return;
  }
  const { learningNo, videoName, videoUrl, quizNo, publishedDate } =
    ctx.request.body;

  try {
    // learningNo가 이미 존재하는지 확인
    const exists = await LearningSet.find()
      .where('learningNo')
      .equals(learningNo);
    if (exists.length > 0) {
      ctx.status = 409; // Confict
      return;
    }

    const learningSet = new LearningSet({
      learningNo,
      videoName,
      videoUrl,
      quizNo,
      publishedDate,
    });

    await learningSet.save();
    ctx.body = learningSet;
  } catch (error) {
    ctx.throw(500, error);
  }
};

/*
  PATCH /api/learningSet/:_id
  { 
    "learningNo" : "1",
    "videoName" : "비디오이름",
    "videoUrl" : "비디오링크",
    "quizNo" : ["1","2"],
    "publishedDate" : new Date(),
  }
*/
export const update = async (ctx) => {
  const { _id } = ctx.params;

  const schema = Joi.object().keys({
    learningNo: Joi.string().required(),
    videoName: Joi.string(),
    videoUrl: Joi.string(),
    quizNo: Joi.array(),
    publishedDate: Joi.date(),
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

    const updateContent = await LearningSet.findByIdAndUpdate(_id, nextData, {
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
  POST /api/learningSet/find?page=
  {
    "learningNo" : "1"
  }
*/
export const find = async (ctx) => {
  const body = ctx.request.body || {};
  if (Object.keys(body).length > 0) {
    const key = Object.keys(body)[0];
    if( key == "learningNo" ) {
      body[key] = { $eq : body[key] };
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
    const learningSets = await LearningSet.find(body)
      .sort({ learningNo: -1 })
      .limit(10)
      .skip((page - 1) * 10)
      .exec();
    const learningSetCount = await LearningSet.countDocuments(body).exec();
    ctx.set('Last-Page', Math.ceil(learningSetCount / 10));
    ctx.body = learningSets.map((learningSet) => learningSet.toJSON());
  } catch (error) {
    ctx.throw(500, error);
  }
};

/*
  POST /api/learningSet/select
  {
    "learningNo" : "2"
  }
*/
export const select = async (ctx) => {
  const schema = Joi.object().keys({
    // 객체가 다음 필드를 가지고 있음을 검증
    learningNo: Joi.string().required(), // required()가 있으면 필수 항목
  });

  // 검증하고 나서 검증 실패인 경우 에러 처리
  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = 400; // Bad Request
    ctx.body = result.error;
    return;
  }
  const { learningNo } = ctx.request.body;

  try {
    const exists = await LearningSet.findOne()
      .where('learningNo')
      .equals(learningNo);
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
  DELETE /api/learningSet/:_id
*/
export const remove = async (ctx) => {
  const { _id } = ctx.params;
  try {
    await LearningSet.findByIdAndRemove(_id).exec();
    ctx.status = 204; // No LearningSet (성공하기는 했지만 응답할 데이터는 없음)
  } catch (error) {
    ctx.throw(500, error);
  }
};
