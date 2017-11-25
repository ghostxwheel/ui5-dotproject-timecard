let request = require('request');
const cheerio = require('cheerio');
const helpers = require('../helpers/helpers');

const index = "/index.php";

request = request.defaults({ jar: true, followAllRedirects: true });

const login = function (redirect, req, res, callback) {
  const host = helpers.getHostWithoutIndex(req.body.url);

  request(host + index, function (error, response, html) {
    if (error || response.statusCode >= 400) {
      if (!error) {
        error = true;
      }

      callback(error, response, html);
    } else {
      var $loginPage = cheerio.load(html);
      var csrfToken = $loginPage('input[name="login"]').val();
      var strRedirect = 'm=ajax';
      var username = "";
      var password = "";

      if (req.body) {

        if (req.body.username) {
          username = req.body.username;
        }

        if (req.body.password) {
          password = req.body.password;
        }
      }

      if (redirect) {
        strRedirect = redirect;
      }

      request.post(host + index, {
        form: {
          login: csrfToken,
          redirect: strRedirect,
          username: username,
          password: password
        }
      }, function (err, httpResponse, body) {
        var oResp = {
          loginSuccess: false
        };
    
        if (!err) {
          var $loginResponse = cheerio.load(body);
          var $errorOnPage = $loginResponse(".error .message");

          err = true;
    
          if (!$errorOnPage || !$errorOnPage.text() || $errorOnPage.text() === "") {
            err = undefined;
          }
        }
    
        callback(err, httpResponse, body);
      });
    }
  });
};

module.exports = login;