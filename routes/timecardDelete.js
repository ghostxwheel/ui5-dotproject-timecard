let request = require('request');
const cheerio = require('cheerio');
const login = require('./login');
const helpers = require('../helpers/helpers');

const updateme = '/updateme.php';

request = request.defaults({ jar: true, followAllRedirects: true });

const timecardDelete = function (req, res) {
  const host = helpers.getHostWithoutIndex(req.body.url);

  login("m=ajax", req, res, function (err, httpResponse, body) {
    if (err) {
      res.status(400).send("Remote server is down. HTTP status: " + httpResponse.statusCode);
    } else {
      var userId = helpers.getUserId(body, res);
      if (!userId) {
        return;
      }

      if (!req.body.year || !req.body.month || !req.body.taskLogId) {
        res.status(400).send("Form data is incomplete");
      } else {
        request.post(host + updateme, {
          form: {
            "action": "delete",
            "user_id": userId,
            "year": req.body.year,
            "month": req.body.month,
            "task_log_id": req.body.taskLogId,
            "_": ""
          }
        }, function (err, httpResponse, body) {
          if (err) {
            res.status(400).send("Failed to delete this report");
          } else {
            res.send({ success: true });
          }
        });
      }
    }
  });
};

module.exports = timecardDelete;