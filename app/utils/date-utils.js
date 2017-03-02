/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

const DateUtils = {
  yesterday: function() {
    let date = new Date()
    date.setDate(date.getDate() - 1)
    return date
  }
}

module.exports = DateUtils;
