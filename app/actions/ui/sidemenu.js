/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

export function toggle() {
  return {
    type: 'SIDEMENU_TOGGLE'
  }
}

export function open() {
  return {
    type: 'SIDEMENU_OPEN'
  }
}

export function close() {
  return {
    type: 'SIDEMENU_CLOSE'
  }
}
