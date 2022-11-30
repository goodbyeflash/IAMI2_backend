import Router from 'koa-router';
import * as learningInfoCtrl from './learningInfo.ctrl';
import checkLoggedIn from '../../lib/checkLoggedIn';

const learningInfo = new Router();

learningInfo.get('/', checkLoggedIn, learningInfoCtrl.list);
learningInfo.post('/register', checkLoggedIn, learningInfoCtrl.register);
learningInfo.post('/find', checkLoggedIn, learningInfoCtrl.find);
learningInfo.patch('/:_id', checkLoggedIn, learningInfoCtrl.update);
learningInfo.delete('/:_id', checkLoggedIn, learningInfoCtrl.remove);

export default learningInfo;
