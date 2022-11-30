//import Content from '../../models/content';
import excel from 'exceljs';

export const download = async (ctx) => {
  const { columns, rows } = ctx.request.body;

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
  try {
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

// export const sortContent = async (ctx) => {
//   const { sortKey } = ctx.request.body;

//   // key가 없으면 에러 처리
//   if (!sortKey) {
//     ctx.status = 401; // Unteacherorized
//     return;
//   }

//   try {
//     let contents = await Content.find({}).exec();
//     contents = contents.map((content) => content.toJSON());
//     contents.sort(arrOrder(sortKey));
//   } catch (error) {
//     ctx.throw(500, error);
//   }
// };

function pad(number, length) {
  let str = '' + number;
  while (str.length < length) {
    str = '0' + str;
  }
  return str;
}

function arrOrder(key) {
  return function (a, b) {
    if (a[key] > b[key]) {
      return 1;
    } else if (a[key] < b[key]) {
      return -1;
    }

    return 0;
  };
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
