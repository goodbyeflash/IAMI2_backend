import Router from 'koa-router';
import users from './users';
import teachers from './teachers';
import learningInfo from './learningInfo';
import learningResult from './learningResult';
import learningSet from './learningSet';
import quizData from './quizData';
import memo from './memo';
import excel from './excel';

const api = new Router();

api.use('/users', users.routes());
api.use('/teachers', teachers.routes());
api.use('/learningInfo', learningInfo.routes());
api.use('/learningResult', learningResult.routes());
api.use('/learningSet', learningSet.routes());
api.use('/quizData', quizData.routes());
api.use('/memo', memo.routes());
api.use('/excel', excel.routes());

// 라우터를 내보냅니다.
export default api;
