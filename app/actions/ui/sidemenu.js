/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

export const SIDEMENU_TOGGLE = 'SIDEMENU_TOGGLE'

export const toggle = () => {
  return {
    type: SIDEMENU_TOGGLE
  }
}

export const SIDEMENU_OPEN = 'SIDEMENU_OPEN'

export const open = () => {
  return {
    type: SIDEMENU_OPEN
  }
}

export const SIDEMENU_CLOSE = 'SIDEMENU_CLOSE'

export const close = () => {
  return {
    type: SIDEMENU_CLOSE
  }
}
