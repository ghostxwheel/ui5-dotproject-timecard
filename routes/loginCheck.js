let request = require('request');
const cheerio = require('cheerio');
const login = require('./login');

const queries = '/queries.php';

request = request.defaults({ jar: true, followAllRedirects: true });

const loginCheck = function (req, res) {
  login("m=ajax", req, res, function (err, httpResponse, body) {
    var oResp = {
      loginSuccess: false
    };

    if (!err) {
      var $loginResponse = cheerio.load(body);
      var $errorOnPage = $loginResponse(".error .message");

      if (!$errorOnPage || !$errorOnPage.text() || $errorOnPage.text() === "") {
        oResp.loginSuccess = true;
      }
    }

    res.send(oResp);
  });
};

module.exports = loginCheck;