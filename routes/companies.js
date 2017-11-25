let request = require('request');
const cheerio = require('cheerio');
const login = require('./login');
const helpers = require('../helpers/helpers');

const queries = '/queries.php';

request = request.defaults({ jar: true, followAllRedirects: true });

const companies = function (req, res) {
  const host = helpers.getHostWithoutIndex(req.body.url);

  login("m=ajax", req, res, function (err, httpResponse, body) {
    if (err) {
      res.send([]);
    } else {
      request.post(host + queries, {
        form: {
          "company": "",
          "type": "company",
          "_": ""
        }
      }, function (err, httpResponse, body) {
        if (err) {
          res.send([]);
        } else {
          var $companyResponse = cheerio.load(body);

          var resp = $companyResponse('li').map(function (index, node) {
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

module.exports = companies;