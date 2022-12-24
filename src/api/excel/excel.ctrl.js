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
    { header: '틀린퀴즈넘버', key: 'quizIncorrectQuizNo', width: 25 },
    { header: '총 점수', key: 'quizTotalScore', width: 25 },
    { header: '등록날짜', key: 'publishedDate', width: 25 },
    { header: '평균점수(리플레이)', key: 'replayAvg', width: 25 },
    { header: '평균풀이시간(리플레이)', key: 'replayAvgRunTime', width: 25 },
    { header: '등록날짜(리플레이)', key: 'replayPublishedDate', width: 25 },
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
      .sort({ publishedDate: -1, userId: -1 })
      .exec();
    rows = learningResults.map((learningResult) => learningResult.toJSON());

    let rowArray = [];
    rows.forEach((row) => {
      row.learningTime = padText(Math.round(row.learningTime.toFixed(1)));
      row.videoRunTime = padText(Math.round(row.videoRunTime.toFixed(1)));
      row.quizAvg = `${Math.ceil(row.quizAvg)}점`;
      row.quizAvgRunTime = `${row.quizAvgRunTime.toFixed(1)}초`;
      row.quizIncorrectQuizNo = row.quizIncorrectQuizNo.join();
      row.publishedDate = new Date(row.publishedDate).YYYYMMDDHHMMSS();
      row.replayAvg =
        row.replayAvg >= 0 ? `${Math.ceil(row.replayAvg)}점` : 'X';
      row.replayAvgRunTime =
        row.replayAvgRunTime >= 0
          ? `${row.replayAvgRunTime.toFixed(1)}초`
          : 'X';
      row.replayPublishedDate = row.replayPublishedDate
        ? new Date(row.replayPublishedDate).YYYYMMDDHHMMSS()
        : 'X';
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

function padText(seconds) {
  var pad = function (num) {
    var str = num < 10 ? '0' + num : num;

    return str;
  };

  var min = parseInt(seconds / 60);
  var sec = pad(parseInt(seconds % 60));

  return min + ':' + sec;
}
