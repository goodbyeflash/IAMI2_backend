import Router from 'koa-router';
import * as learningSetCtrl from './learningSet.ctrl';
import checkLoggedIn from '../../lib/checkLoggedIn';

const learningSet = new Router();

learningSet.get('/', checkLoggedIn, learningSetCtrl.list);
learningSet.post('/register', checkLoggedIn, learningSetCtrl.register);
learningSet.post('/find', checkLoggedIn, learningSetCtrl.find);
learningSet.patch('/:_id', checkLoggedIn, learningSetCtrl.update);
learningSet.delete('/:_id', checkLoggedIn, learningSetCtrl.remove);

export default learningSet;
