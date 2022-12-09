import Router from 'koa-router';
import * as excelCtrl from './excel.ctrl';
import checkLoggedIn from '../../lib/checkLoggedIn';

const excels = new Router();

excels.post('/download', checkLoggedIn, excelCtrl.download);

export default excels;
