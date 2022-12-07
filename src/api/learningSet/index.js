import Router from 'koa-router';
import * as learningSetCtrl from './learningSet.ctrl';
import checkLoggedIn from '../../lib/checkLoggedIn';
import checkLoggedInUser from '../../lib/checkLoggedInUser';

const learningSet = new Router();

learningSet.get('/', checkLoggedIn, learningSetCtrl.list);
learningSet.get('/:_id', checkLoggedIn, learningSetCtrl.read);
learningSet.post('/register', checkLoggedIn, learningSetCtrl.register);
learningSet.post('/find', checkLoggedIn, learningSetCtrl.find);
learningSet.post('/select', checkLoggedInUser, learningSetCtrl.select);
learningSet.patch('/:_id', checkLoggedIn, learningSetCtrl.update);
learningSet.delete('/:_id', checkLoggedIn, learningSetCtrl.remove);

export default learningSet;
