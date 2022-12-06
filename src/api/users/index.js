import Router from 'koa-router';
import * as usersCtrl from './users.ctrl';
import checkLoggedIn from '../../lib/checkLoggedIn';

const users = new Router();

// Auth
users.post('/login', usersCtrl.login);
users.get('/check', usersCtrl.check);
users.post('/logout', usersCtrl.logout);

// Control
users.get('/', checkLoggedIn, usersCtrl.list);
users.get('/:_id', checkLoggedIn, usersCtrl.read);
users.post('/find', checkLoggedIn, usersCtrl.find);
users.post('/register', checkLoggedIn, usersCtrl.register);
users.patch('/:_id', checkLoggedIn, usersCtrl.update);
users.delete('/:_id', checkLoggedIn, usersCtrl.remove);

export default users;
