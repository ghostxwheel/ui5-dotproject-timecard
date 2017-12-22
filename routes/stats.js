let request = require('request');
const cheerio = require('cheerio');
const extend = require("util")._extend;
const login = require('./login');
const helpers = require('../helpers/helpers');

const statsUrl = '/stats.php';

request = request.defaults({ jar: true, followAllRedirects: true });

const stats = function (req, res) {
  const host = helpers.getHostWithoutIndex(req.body.url);

  login("m=ajax", req, res, function (err, httpResponse, body) {
    if (err) {
      res.send([]);
    } else {
      var userId = helpers.getUserId(body, res);
      if (!userId) {
        return;
      }

      if (!req.body || !req.body.month || !req.body.year) {
        res.send({
          hoursWorkedTotal: 0
        });
      } else {
        request.post(host + statsUrl, {
          form: {
            "user_id": userId,
            "year": req.body.year,
            "month": req.body.month,
            "_": ""
          }
        }, function (err, httpResponse, body) {
          if (err) {
            res.send({
              hoursWorkedTotal: 0
            });
          } else {
            var hoursWorkedTotal = 0;
            var arrReports = [];
            var $reportResponse = cheerio.load(body);
            var arrRows = $reportResponse('table td strong').get();

            if (arrRows[1]) {
              hoursWorkedTotal = parseFloat(arrRows[1].firstChild.data.split(' ')[1]);
            }

            res.send({
              hoursWorkedTotal: hoursWorkedTotal
            });
          }
        });
      }
    }
  });
};

module.exports = stats;