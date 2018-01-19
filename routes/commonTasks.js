let request = require('request');
const cheerio = require('cheerio');
const login = require('./login');
const helpers = require('../helpers/helpers');

request = request.defaults({ jar: true, followAllRedirects: true });

const tasks = function (req, res) {
  const host = helpers.getHostWithoutIndex(req.body.url);

  login("m=ajax", req, res, function (err, httpResponse, body) {
    if (err) {
      res.send([]);
    } else {
      var userId = helpers.getUserId(body, res);
      if (!userId) {
        return;
      }

      var $ajaxResponse = cheerio.load(body);
      var arrCommonTaskLinks = $ajaxResponse('td:contains("Common Tasks:")').last().find("a");
      var nIndex = -1;
      var arrCommonTask = [];

      arrCommonTaskLinks.each(function(nKey, oCommonTaskLink) {
        var sHref = oCommonTaskLink.attribs.href;
        var sDescription = oCommonTaskLink.firstChild.data;
        var oCommonTask = {};

        var arrParam = /javascript:edit_row\("","",([0-9]*),"(.*)",([0-9]*),"(.*)",([0-9]*),"(.*)","","","","",""\)/
          .exec(sHref);

        oCommonTask.statusId = nIndex;
        oCommonTask.title = sDescription;
        oCommonTask.company = decodeURIComponent(arrParam[2]);
        oCommonTask.companyId = parseInt(arrParam[1]);
        oCommonTask.project = decodeURIComponent(arrParam[4]);
        oCommonTask.projectId = parseInt(arrParam[3]);
        oCommonTask.task = decodeURIComponent(arrParam[6]);
        oCommonTask.taskId = parseInt(arrParam[5]);
        oCommonTask.description = ".";

        nIndex -= 1;

        arrCommonTask.push(oCommonTask)
      });

      res.send(arrCommonTask);
    }
  });
};

module.exports = tasks;