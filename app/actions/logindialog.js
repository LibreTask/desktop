/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

export function toggle() {
  return {
    type: 'LOGINDIALOG_TOGGLE'
  }
}

export function open() {
  return {
    type: 'LOGINDIALOG_OPEN'
  }
}

export function close() {
  return {
    type: 'LOGINDIALOG_CLOSE'
  }
}
