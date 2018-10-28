/*
 * @link https://libretask.org/
 * @license https://github.com/LibreTask/desktop/blob/master/LICENSE.md
 */

if (process.env.NODE_ENV === "production") {
  module.exports = require("./configureStore.production");
} else {
  module.exports = require("./configureStore.development");
}
