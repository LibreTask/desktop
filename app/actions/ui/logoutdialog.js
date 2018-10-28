/*
 * @link https://libretask.org/
 * @license https://github.com/LibreTask/desktop/blob/master/LICENSE.md
 */

export function toggle() {
  return {
    type: "LOGOUTDIALOG_TOGGLE"
  };
}

export function open() {
  return {
    type: "LOGOUTDIALOG_OPEN"
  };
}

export function close() {
  return {
    type: "LOGOUTDIALOG_CLOSE"
  };
}
