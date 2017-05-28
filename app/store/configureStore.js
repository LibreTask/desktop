/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

if (process.env.NODE_ENV === "production") {
  module.exports = require("./configureStore.production");
} else {
  module.exports = require("./configureStore.development");
}
