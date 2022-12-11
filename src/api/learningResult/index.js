import Router from 'koa-router';
import * as learningResultCtrl from './learningResult.ctrl';
import checkLoggedInUser from '../../lib/checkLoggedInUser';
import checkLoggedIn from '../../lib/checkLoggedIn';

const learningResult = new Router();

learningResult.get('/', checkLoggedIn, learningResultCtrl.list);
learningResult.get('/:_id', checkLoggedInUser, learningResultCtrl.findUser);
learningResult.post(
  '/register',
  checkLoggedInUser,
  learningResultCtrl.register,
);

learningResult.post('/find', checkLoggedIn, learningResultCtrl.find);
learningResult.patch('/:_id', checkLoggedInUser, learningResultCtrl.update);

export default learningResult;
