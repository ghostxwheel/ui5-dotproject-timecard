const BotBrother = require('bot-brother');
const helpers = require('./helpers');
let request = require('request');
const cheerio = require('cheerio');

const strCRMUrl = "https://crm.unitask-inc.com/dotproject/index.php";

let bot = null;

if (process.env.NODE_ENV === 'production') {
  bot = BotBrother({
    key: process.env.TELEGRAM_BOT_KEY,
    sessionManager: BotBrother.sessionManager.memory(),
    polling: {
      interval: 0,
      timeout: 1
    }
  });
} else {
  bot = BotBrother({
    key: require("../telegramBotKey"),
    sessionManager: BotBrother.sessionManager.memory(),
    polling: {
      interval: 0,
      timeout: 1
    }
  });
}

const baseRequest = request.defaults({
  followAllRedirects: true
})

// Let's create command '/start'.
bot.command('start')
  .invoke(function (ctx) {
    // Setting data, data is used in text message templates.
    ctx.data.user = ctx.meta.user;

    ctx.session.memory = {};

    // Invoke callback must return promise.
    return ctx.sendMessage(
      'Hello <%=user.first_name%>.\n' +
      'This bot can report working hours via ui5 timecard application.\n' +
      'This bot has following commands:\n' +
      '/login - Login to Unitask CRM with your credentials. This is an mandatory step.\n' +
      '/report - Report working hours.');
  });

bot.command('login')
  .invoke(function (ctx) {
    ctx.session.memory = ctx.session.memory || {};

    if (ctx.session.memory.loggedIn === true) {
      return ctx.sendMessage('You have already logged in. Now you can report with /report command.');
    }

    ctx.session.memory = {};
    return ctx.sendMessage('What is your Unitask CRM username?');
  })
  .answer(function (ctx) {
    ctx.session.memory = ctx.session.memory || {};

    if (!ctx.session.memory.username) {

      ctx.session.memory.username = ctx.answer;
      return ctx.sendMessage('May I have you password? It will be used only for the login purposes.');

    } else if (!ctx.session.memory.password) {

      ctx.session.memory.password = ctx.answer;
      ctx.session.memory.loggedIn = false;

    }

    if (ctx.session.memory.loggedIn === true) {
      ctx.sendMessage('You have successfully logged in. Now you can report with /report command.');
    } else {

      ctx.sendMessage("Checking your login credentials...").then(function () {

        baseRequest(strCRMUrl, function (error, response, html) {
          if (error || response.statusCode >= 400) {
            ctx.sendMessage('Could not log you in. Check your credentials and try again with /login command. Returning status: ' + response.statusCode);
          } else {
            var $loginPage = cheerio.load(html);
            var csrfToken = $loginPage('input[name="login"]').val();
            var strRedirect = 'm=ajax';
            var username = "";
            var password = "";

            if (ctx.session.memory.username) {
              username = ctx.session.memory.username;
            }

            if (ctx.session.memory.password) {
              password = ctx.session.memory.password;
            }

            baseRequest.post(strCRMUrl, {
              form: {
                login: csrfToken,
                redirect: "",
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

              if (err === true) {
                ctx.sendMessage('Could not log you in. Check your credentials and try again with /login command. Error: ' + $errorOnPage.text());
              } else {

                request.get(strCRMUrl + "?" + strRedirect, {}, function (err, httpResponse, body) {
                  ctx.session.memory.loggedIn = true;
                  ctx.sendMessage('You have successfully logged in. Now you can report with /report command.');
                });
                
              }
            });
          }
        });

      });

    }

  });

module.exports = bot;
