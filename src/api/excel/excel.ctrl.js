import LearningResult from '../../models/learningResult';
import moment from 'moment';
import excel from 'exceljs';

export const download = async (ctx) => {
  let columns = [
    { header: '회원아이디', key: 'userId', width: 25 },
    { header: '학습세트넘버', key: 'learningNo', width: 25 },
    { header: '학습시간', key: 'learningTime', width: 25 },
    { header: '비디오시청시간', key: 'videoRunTime', width: 25 },
    { header: '평균점수', key: 'quizAvg', width: 25 },
    { header: '평균풀이시간', key: 'quizAvgRunTime', width: 25 },
    { header: '틀린문제', key: 'quizIncorrectNumber', width: 25 },
    { header: '총 점수', key: 'quizTotalScore', width: 25 },
    { header: '리플레이 평균시간', key: 'replayAvg', width: 25 },
    { header: '리플레이 풀이시간', key: 'replayAvgRunTime', width: 25 },
    { header: '등록날짜', key: 'publishedDate', width: 25 },
  ];

  const body = ctx.request.body || {};

  const findData = {};

  if (body.dateGte && body.dateLt) {
    findData['publishedDate'] = {
      $gte: moment(body.dateGte).startOf('day').format(),
      $lt: moment(body.dateLt).endOf('day').format(),
    };
  }

  let rows;
  try {
    const learningResults = await LearningResult.find(findData)
      .sort({ userId: -1 })
      .exec();
    rows = learningResults.map((learningResult) => learningResult.toJSON());

    let rowArray = [];
    rows.forEach((row) => {
      row.publishedDate = new Date(row.publishedDate).YYYYMMDDHHMMSS();
      rowArray.push(row);
    });

    let workbook = new excel.Workbook();
    let worksheet = workbook.addWorksheet('Sheet1');
    worksheet.columns = columns;
    // Add Array Rows
    worksheet.addRows(rowArray);
    // res is a Stream object

    ctx.set(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    ctx.status = 200;
    await workbook.xlsx.write(ctx.res).then(() => {
      ctx.res.end();
    });
  } catch (error) {
    ctx.throw(500, error);
  }
};

function pad(number, length) {
  let str = '' + number;
  while (str.length < length) {
    str = '0' + str;
  }
  return str;
}

Date.prototype.YYYYMMDDHHMMSS = function () {
  let yyyy = this.getFullYear().toString();
  let MM = pad(this.getMonth() + 1, 2);
  let dd = pad(this.getDate(), 2);
  let hh = pad(this.getHours(), 2);
  let mm = pad(this.getMinutes(), 2);
  let ss = pad(this.getSeconds(), 2);

  return `${yyyy}-${MM}-${dd} ${hh}:${mm}:${ss}`;
};
