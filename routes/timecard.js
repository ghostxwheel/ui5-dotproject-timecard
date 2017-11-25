let request = require('request');
const cheerio = require('cheerio');
const login = require('./login');
const helpers = require('../helpers/helpers');

const updateme = '/updateme.php';

request = request.defaults({ jar: true, followAllRedirects: true });

const timecard = function (req, res) {
  const host = helpers.getHostWithoutIndex(req.body.url);

  login("m=ajax", req, res, function (err, httpResponse, body) {
    if (err) {
      res.send({ success: false });
    } else {
      var $timecardPage = cheerio.load(body);
      var link = $timecardPage('a:contains(My Info)');
      var userId = link.prop('href').split('&')[2].split('=')[1];

      if (!req.body || !req.body.date || !req.body.timeBegin || !req.body.timeEnd || !req.body.description) {
        res.send({ success: false });
      } else {
        var strDate = req.body.date;
        var strTimeBegin = req.body.timeBegin;
        var strTimeEnd = req.body.timeEnd;
        var strTaskId = req.body.taskId;
        var strDesc = req.body.description;
        var strYear = strDate.substr(6, 4);
        var strMonth = strDate.substr(3, 2);
        var strDateStart =
          strYear + "-" + strMonth + "-" + strDate.substr(0, 2) + " " +
          strTimeBegin.substr(0, 2) + ":" + strTimeBegin.substr(3, 2) + ":00";
        var oHoursHiddenResult = helpers.calcHours(strDate, strTimeBegin, strTimeEnd);

        if (oHoursHiddenResult.success === true) {
          request.post(host + updateme, {
            form: {
              "action": "save",
              "user_id": userId,
              "year": strYear,
              "month": strMonth,
              "task_id": strTaskId,
              "date": strDateStart,
              "desc": strDesc,
              "hours_hidden": oHoursHiddenResult.hoursHidden,
              "task_log_id": "",
              "call_id": "",
              "_": ""
            }
          }, function (err, httpResponse, body) {
            if (err) {
              res.send({ success: false });
            } else {
              res.send({ success: true });
            }
          });
        }
      }
    }
  });
};

module.exports = timecard;