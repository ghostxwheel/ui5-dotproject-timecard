const cheerio = require('cheerio');

const helpers = {
  getHostWithoutIndex: function (host) {
    if (!host) {
      return "";
    } else {
      var arrParts = host.split("/");
      arrParts = arrParts.slice(0, arrParts.length - 1);
      return arrParts.join("/");
    }
  },

  calcHours: function (date, timeBegin, timeEnd) {
    var d1 = new Date();
    var d2 = new Date();

    d1.setFullYear(date.substr(6, 4));
    d1.setMonth(date.substr(3, 2) - 1);
    d1.setDate(date.substr(0, 2));
    d1.setHours(timeBegin.substr(0, 2));
    d1.setMinutes(timeBegin.substr(3, 2));
    d1.setSeconds(0);

    d2.setFullYear(date.substr(6, 4));
    d2.setMonth(date.substr(3, 2) - 1);
    d2.setDate(date.substr(0, 2));
    d2.setHours(timeEnd.substr(0, 2));
    d2.setMinutes(timeEnd.substr(3, 2));
    d2.setSeconds(0);

    if (d1 >= d2) {
      return {
        success: false
      };
    }

    return {
      success: true,
      hoursHidden: (d2 - d1) / (1000 * 60 * 60)
    };
  },

  getUserId: function (body) {
    var $timecardPage = cheerio.load(body);
    var link = $timecardPage('a:contains(My Info)');
    var userId = link.prop('href').split('&')[2].split('=')[1];

    return userId;
  }
}

module.exports = helpers;