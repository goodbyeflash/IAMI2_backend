import Router from 'koa-router';
import * as learningInfoCtrl from './learningInfo.ctrl';
import checkLoggedIn from '../../lib/checkLoggedIn';
import checkLoggedInUser from '../../lib/checkLoggedInUser';

const learningInfo = new Router();

learningInfo.get('/', checkLoggedIn, learningInfoCtrl.list);
learningInfo.get('/:_id', checkLoggedIn, learningInfoCtrl.read);
learningInfo.post('/register', checkLoggedIn, learningInfoCtrl.register);
learningInfo.post('/find', checkLoggedIn, learningInfoCtrl.find);
learningInfo.post('/today', checkLoggedInUser, learningInfoCtrl.today);
learningInfo.patch(
  '/user/:_id',
  checkLoggedInUser,
  learningInfoCtrl.updateUser,
);
learningInfo.patch('/:_id', checkLoggedIn, learningInfoCtrl.update);
learningInfo.delete('/:_id', checkLoggedIn, learningInfoCtrl.remove);

export default learningInfo;
