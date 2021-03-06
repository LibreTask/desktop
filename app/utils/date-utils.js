/*
 * @link https://libretask.org/
 * @license https://github.com/LibreTask/desktop/blob/master/LICENSE.md
 */

const DateUtils = {
  yesterday: function() {
    let date = new Date();
    date.setDate(date.getDate() - 1);
    return date;
  },
  twoWeeksAgo: function() {
    let date = new Date();
    date.setDate(date.getDate() - 14);
    return date;
  },
  fiveMinutesAgo: function() {
    let date = new Date();
    date.setMinutes(date.getMinutes() - 5);
    return date;
  },
  oneSecondBeforeMidnight: function(date) {
    /*
      Primarily used to set each task's dueDateTimeUtc
      to very last moment of specified date.
    */

    if (!date) return undefined;

    if (!(date instanceof Date)) {
      date = new Date(date);
    }

    date.setHours(23, 59, 59, 0);
    return date;
  }
};

module.exports = DateUtils;
