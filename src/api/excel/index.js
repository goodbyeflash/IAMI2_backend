import Router from 'koa-router';
import * as excelCtrl from './excel.ctrl';

const excels = new Router();

excels.post('/download', excelCtrl.download);

export default excels;
