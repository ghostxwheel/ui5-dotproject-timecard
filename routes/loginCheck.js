let request = require('request');
const cheerio = require('cheerio');
const login = require('./login');

const queries = '/queries.php';

request = request.defaults({ jar: true, followAllRedirects: true });

const loginCheck = function (req, res) {
  login("m=ajax", req, res, function (err, httpResponse, body) {

    if (err) {
      res.status(400).send("Failed to connect to remote server. HTTP status " + httpResponse.statusCode + ".");
    } else {
      var $loginResponse = cheerio.load(body);
      var $errorOnPage = $loginResponse(".error .message");

      if (!$errorOnPage || !$errorOnPage.text() || $errorOnPage.text() === "") {
        res.send("Success");
      } else {
        res.status(400).send("Failed to connect to remote server. Login failed.");
      }
    }

  });
};

module.exports = loginCheck;
