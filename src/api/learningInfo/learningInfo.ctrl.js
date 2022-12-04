import LearningInfo from '../../models/learningInfo';
import Joi from '@hapi/joi';

/*
  GET /api/LearningInfo?page=
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
    const learningInfos = await LearningInfo.find({})
      .sort({ learningDate: -1, userId: -1 })
      .limit(10)
      .skip((page - 1) * 10)
      .exec();
    const learningInfoCount = await LearningInfo.countDocuments({}).exec();
    ctx.set('Last-Page', Math.ceil(learningInfoCount / 10));
    ctx.body = learningInfos.map((learningInfo) => learningInfo.toJSON());
  } catch (error) {
    ctx.throw(500, error);
  }
};

/*
  POST /api/learningInfo/register
  {
    "userId" : "test1",
    "learningDate" : "2022-12-04",
    "learningTime" : "10:30~23:59",
    "teacherImgUrl" : "../image/teacher/1.png",
    "learningText" : "학습내용",
    "learningData" : [
      {
        "learningNo" : "1",
        "complete" : "N"
      },
      {
        "learningNo" : "2",
        "complete" : "N"
      }
    ],
    "publishedDate" : new Date()
  }
 */
export const register = async (ctx) => {
  const schema = Joi.object().keys({
    // 객체가 다음 필드를 가지고 있음을 검증
    userId: Joi.string().required(),
    learningDate: Joi.string().required(), // required()가 있으면 필수 항목
    learningTime: Joi.string().required(),
    teacherImgUrl: Joi.string().required(),
    learningText: Joi.string().required(),
    learningData: Joi.array().required(),
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
    learningDate,
    learningTime,
    userId,
    teacherImgUrl,
    learningText,
    learningData,
    publishedDate,
  } = ctx.request.body;

  try {
    const learningInfo = new LearningInfo({
      learningDate,
      learningTime,
      userId,
      teacherImgUrl,
      learningText,
      learningData,
      publishedDate,
    });

    await learningInfo.save();
    ctx.body = learningInfo;
  } catch (error) {
    ctx.throw(500, error);
  }
};

/*
  PATCH /api/learningInfo/:_id
  {
    "learningTime" : "10:30~23:59",
    "teacherImgUrl" : "../image/teacher/1.png",
    "learningText" : "학습내용",
    "learningData": [
        {
            "learningNo": "1",
            "complete": "Y"
        },
        {
            "learningNo": "2",
            "complete": "N"
        }
    ],
    "publishedDate" : new Date()
  }
*/
export const update = async (ctx) => {
  const { _id } = ctx.params;

  const schema = Joi.object().keys({
    learningTime: Joi.string(),
    teacherImgUrl: Joi.string(),
    learningText: Joi.string(),
    learningData: Joi.array(),
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

    const updateContent = await LearningInfo.findByIdAndUpdate(_id, nextData, {
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
  POST /api/learningInfo/find?page=
  {
    "learningDate" : "2022-12-02"
  }
*/
export const find = async (ctx) => {
  const body = ctx.request.body || {};
  if (Object.keys(body).length > 0) {
    const key = Object.keys(body)[0];
    body[key] = { $regex: '.*' + body[key] + '.*' };
  }
  const page = parseInt(ctx.query.page || '1', 10);

  if (page < 1) {
    ctx.status = 400;
    return;
  }

  try {
    const learningInfos = await LearningInfo.find(body)
      .sort({ learningDate: -1, userId: -1 })
      .limit(10)
      .skip((page - 1) * 10)
      .exec();
    const learningInfoCount = await LearningInfo.countDocuments(body).exec();
    ctx.set('Last-Page', Math.ceil(learningInfoCount / 10));
    ctx.body = learningInfos.map((learningInfo) => learningInfo.toJSON());
  } catch (error) {
    ctx.throw(500, error);
  }
};

/*
  POST /api/learningInfo/today
  {
    "learningDate" : "2022-11-30",
    "userId" : "test1"
  }
*/
export const today = async (ctx) => {
  const body = ctx.request.body || {};
  const findData = {};

  const schema = Joi.object().keys({
    learningDate: Joi.string().required(),
    userId: Joi.string().required(),
  });

  // 검증하고 나서 검증 실패인 경우 에러 처리
  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = 400; // Bad Request
    ctx.body = result.error;
    return;
  }

  try {
    let learningInfo;
    findData['$and'] = [
      {
        learningDate: body.learningDate,
      },
      {
        userId: body.userId,
      },
    ];
    learningInfo = await LearningInfo.findOne(findData).exec();
    if (learningInfo == null) {
      ctx.status = 404;
    } else {
      ctx.body = learningInfo;
    }
  } catch (error) {
    ctx.throw(500, error);
  }
};

/*
  DELETE /api/learningInfo/:_id
*/
export const remove = async (ctx) => {
  const { _id } = ctx.params;
  try {
    await LearningInfo.findByIdAndRemove(_id).exec();
    ctx.status = 204; // No LearningInfo (성공하기는 했지만 응답할 데이터는 없음)
  } catch (error) {
    ctx.throw(500, error);
  }
};
