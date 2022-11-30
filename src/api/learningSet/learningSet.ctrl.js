import LearningSet from '../../models/learningSet';
import Joi from '@hapi/joi';

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
      .sort({ _id: -1 })
      .limit(10)
      .skip((page - 1) * 10)
      .exec();
    const userCount = await LearningSet.countDocuments({}).exec();
    ctx.set('Last-Page', Math.ceil(userCount / 10));
    ctx.body = learningSets.map((user) => user.toJSON());
  } catch (error) {
    ctx.throw(500, error);
  }
};

/*
  POST /api/learningSet/register
  {
    "learningNo" : "1",
    "videoName" : "비디오이름",
    "videoUrl" : "비디오링크",
    "quizData" : [
      {
        "text" : "1번 문제 입니다.",
        "qestion" : "1+1=?",
        "answer" : "2",
        "time" : 30
      },
      {
        "text" : "2번 문제 입니다.",
        "qestion" : "1+2=?",
        "answer" : "3",
        "time" : 30
      }
    ],
    "publishedDate" : new Date()
  }
 */
export const register = async (ctx) => {
  const schema = Joi.object().keys({
    // 객체가 다음 필드를 가지고 있음을 검증
    learningNo: Joi.string().required(), // required()가 있으면 필수 항목
    videoName: Joi.string().required(),
    videoUrl: Joi.string().required(),
    quizData: Joi.array().required(),
    publishedDate: Joi.date().required(),
  });

  // 검증하고 나서 검증 실패인 경우 에러 처리
  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = 400; // Bad Request
    ctx.body = result.error;
    return;
  }
  const { learningNo, videoName, videoUrl, quizData, publishedDate } =
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
      quizData,
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
    "quizData" : [
      {
        "text" : "1번 문제 입니다.",
        "qestion" : "1+1=?",
        "answer" : "2",
        "time" : 30
      },
      {
        "text" : "2번 문제 입니다.",
        "qestion" : "1+2=?",
        "answer" : "3",
        "time" : 30
      }
    ],
    "publishedDate" : new Date(),
  }
*/
export const update = async (ctx) => {
  const { _id } = ctx.params;

  const schema = Joi.object().keys({
    learningNo: Joi.string().required(),
    videoName: Joi.string(),
    videoUrl: Joi.string(),
    quizData: Joi.array(),
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
  POST /api/learningSet/find
  {
    "filter" : {
      "learningNo" : "1"
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
    let learningSet;
    if (body.filter) {
      const key = Object.keys(body.filter)[0];
      learningSet = await LearningSet.find(findData)
        .where(key)
        .equals(body.filter[key])
        .exec();
    } else {
      learningSet = await LearningSet.find(findData).exec();
    }
    ctx.body = learningSet;
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
