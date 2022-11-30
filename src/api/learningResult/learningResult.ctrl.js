import LearningResult from '../../models/learningResult';
import User from '../../models/user';
import LearningSet from '../../models/learningSet';
import Joi from '@hapi/joi';
import moment from 'moment';

/*
  GET /api/learningResult?page=
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
    const users = await LearningResult.find({})
      .sort({ _id: -1 })
      .limit(10)
      .skip((page - 1) * 10)
      .exec();
    const userCount = await LearningResult.countDocuments({}).exec();
    ctx.set('Last-Page', Math.ceil(userCount / 10));
    ctx.body = users.map((user) => user.toJSON());
  } catch (error) {
    ctx.throw(500, error);
  }
};

/*
  POST /api/learningResult/register
  {
    "userId" : "test1",
    "learningNo" : "1",
    "learningTime" : 20,
    "videoRunTime" : 30,
    "quizAvg" : 77.3,
    "quizAvgRunTime" : 78,
    "quizIncorrectNumber" : "2,4,7,10,15",
    "quizTotalScore" : 2340,
    "replayAvg" : 30,
    "replayAvgRunTime" : 30,
    "publishedDate" : new Date()
  }
 */
export const register = async (ctx) => {
  const schema = Joi.object().keys({
    // 객체가 다음 필드를 가지고 있음을 검증
    userId: Joi.string().required(), // required()가 있으면 필수 항목
    learningNo: Joi.string().required(),
    learningTime: Joi.number().required(),
    videoRunTime: Joi.number().required(),
    quizAvg: Joi.number().required(),
    quizAvgRunTime: Joi.number().required(),
    quizIncorrectNumber: Joi.string().required(),
    quizTotalScore: Joi.number().required(),
    replayAvg: Joi.number().required(),
    replayAvgRunTime: Joi.number().required(),
    publishedDate: Joi.date().required(),
  });

  // 검증하고 나서 검증 실패인 경우 에러 처리
  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = 400; // Bad Request
    ctx.body = result.error;
    return;
  }
  const {
    userId,
    learningNo,
    learningTime,
    videoRunTime,
    quizAvg,
    quizAvgRunTime,
    quizIncorrectNumber,
    quizTotalScore,
    replayAvg,
    replayAvgRunTime,
    publishedDate,
  } = ctx.request.body;

  try {
    const user = await User.find().where('userId').equals(userId);
    // 계정이 존재하지 않으면 Not Found 처리
    if (!user) {
      ctx.status = 404;
      return;
    }

    const learningSet = await LearningSet.find()
      .where('learningNo')
      .equals(learningNo);
    // learningNo가 존재하지 않으면 Not Found 처리
    if (!learningSet) {
      ctx.status = 404;
      return;
    }

    const learningResult = new LearningResult({
      userId,
      learningNo,
      learningTime,
      videoRunTime,
      quizAvg,
      quizAvgRunTime,
      quizIncorrectNumber,
      quizTotalScore,
      replayAvg,
      replayAvgRunTime,
      publishedDate,
    });

    await learningResult.save();
    ctx.body = learningResult;
  } catch (error) {
    ctx.throw(500, error);
  }
};

/*
  POST /api/learningResult/find
  {
    "filter" : {
      "learningDate" : "2022-11-30",
    }
  }
*/
export const find = async (ctx) => {
  const body = ctx.request.body || {};

  const findData = {};

  if (body.dateGte && body.dateLt) {
    findData['publishedDate'] = {
      $gte: moment(body.dateGte).startOf('day').format(),
      $lt: moment(body.dateLt).endOf('day').format(),
    };
  }

  try {
    let learningResult;
    if (body.filter) {
      const key = Object.keys(body.filter)[0];
      learningResult = await LearningResult.find(findData)
        .where(key)
        .equals(body.filter[key])
        .exec();
    } else {
      learningResult = await LearningResult.find(findData).exec();
    }
    ctx.body = learningResult;
  } catch (error) {
    ctx.throw(500, error);
  }
};
