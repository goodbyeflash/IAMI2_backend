import Router from 'koa-router';
import * as memoCtrl from './memo.ctrl';
import checkLoggedInUser from '../../lib/checkLoggedInUser';
import checkLoggedIn from '../../lib/checkLoggedIn';

const memo = new Router();

memo.get('/', checkLoggedIn, memoCtrl.list);
memo.post('/register', checkLoggedInUser, memoCtrl.register);
memo.post('/find', checkLoggedIn, memoCtrl.find);

export default memo;
