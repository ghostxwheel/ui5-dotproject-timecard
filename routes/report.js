let request = require('request');
const cheerio = require('cheerio');
const extend = require("util")._extend;
const login = require('./login');
const helpers = require('../helpers/helpers');

const updateme = '/updateme.php';

request = request.defaults({ jar: true, followAllRedirects: true });

const report = function (req, res) {
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
        res.send([]);
      } else {
        request.post(host + updateme, {
          form: {
            "user_id": userId,
            "year": req.body.year,
            "month": req.body.month,
            "_": ""
          }
        }, function (err, httpResponse, body) {
          if (err) {
            res.send([]);
          } else {
            var arrReports = [];
            var $reportResponse = cheerio.load(body);
            var arrRows = $reportResponse('table tr').not('td > table tr').get();
            var oStatus;

            arrRows.forEach(function (oRow) {

              if (oRow.children.length === 2) {

                oStatus = {
                  date: oRow.children[0].lastChild.firstChild.data.split(' ')[2]
                };

              } else {

                var arrLogDataCells = oRow.children.filter(function (oChild) { 
                  return oChild.attribs.id === "log_data";
                });

                if (arrLogDataCells.length === 0) {
                  return;
                }

                debugger;

                var reportedOn = oRow.children[0].firstChild.data;
                var company = oRow.children[1].firstChild.data;
                var project = oRow.children[2].firstChild.data;
                var task = oRow.children[3].firstChild.data;
                var description = oRow.children[4].firstChild.data;
                var timeBegin = oRow.children[5].firstChild.firstChild.data;
                var timeEnd = oRow.children[6].firstChild.data;
                var hoursWorked = oRow.children[7].firstChild.data;
                var taskLogId = "";
                var arrParam = "";

                if (oRow.children[8].firstChild && oRow.children[8].firstChild.attribs) {
                  taskLogId = /javascript:delete_row\(([0-9]*)\)/
                    .exec(oRow.children[8].firstChild.attribs["href"])[1];
                }

                if (oRow.children[9].firstChild && oRow.children[9].firstChild.attribs) {
                  arrParam = /javascript:edit_row\("",([0-9]*),([0-9]*),"(.*)",([0-9]*),"(.*)",([0-9]*),"(.*)","([0-9\/]*)","([0-9\:]*)","([0-9\:]*)",([0-9\.]*),"(.*)"\)/
                    .exec(oRow.children[9].firstChild.attribs["href"]);
                }

                oStatus.reportedOn = reportedOn;
                oStatus.company = company;
                oStatus.companyId = parseInt(arrParam[2]);
                oStatus.project = project;
                oStatus.projectId = parseInt(arrParam[4]);
                oStatus.task = task;
                oStatus.taskId = parseInt(arrParam[6]);
                oStatus.description = description;
                oStatus.timeBegin = timeBegin;
                oStatus.timeEnd = timeEnd;
                oStatus.hoursWorked = hoursWorked;
                oStatus.taskLogId = taskLogId;

                arrReports.push(extend({}, oStatus));
              }
            });

            res.send(arrReports);
          }
        });
      }
    }
  });
};

module.exports = report;