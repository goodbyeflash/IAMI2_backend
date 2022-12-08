import Router from 'koa-router';
import * as quizDataCtrl from './quizData.ctrl';
import checkLoggedIn from '../../lib/checkLoggedIn';
import checkLoggedInUser from '../../lib/checkLoggedInUser';

const quizData = new Router();

quizData.get('/', checkLoggedIn, quizDataCtrl.list);
quizData.get('/:_id', checkLoggedIn, quizDataCtrl.read);
quizData.post('/register', checkLoggedIn, quizDataCtrl.register);
quizData.post('/find', checkLoggedIn, quizDataCtrl.find);
quizData.post('/select', checkLoggedInUser, quizDataCtrl.select);
quizData.patch('/:_id', checkLoggedIn, quizDataCtrl.update);
quizData.delete('/:_id', checkLoggedIn, quizDataCtrl.remove);

export default quizData;
