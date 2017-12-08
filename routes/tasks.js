let request = require('request');
const cheerio = require('cheerio');
const login = require('./login');
const helpers = require('../helpers/helpers');

const queries = '/queries.php';

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

      request.post(host + queries, {
        form: {
          "task": "",
          "user_id": userId,
          "type": "task",
          "project": req.params.project,
          "_": ""
        }
      }, function (err, httpResponse, body) {
        if (err) {
          res.send([]);
        } else {
          var $projectResponse = cheerio.load(body);

          var resp = $projectResponse('li').map(function (index, node) {
            var $node = cheerio(node);

            return {
              id: $node.prop('id').split('|')[4],
              text: $node.text()
            };
          });

          res.send(resp.get());
        }
      });
    }
  });
};

module.exports = tasks;