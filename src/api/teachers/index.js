import Router from 'koa-router';
import * as teacherCtrl from './teachers.ctrl';

const teachers = new Router();

// Auth
teachers.post('/register', teacherCtrl.register);
teachers.post('/login', teacherCtrl.login);
teachers.get('/check', teacherCtrl.check);
teachers.post('/logout', teacherCtrl.logout);

export default teachers;
