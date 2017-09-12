/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

export function updateShown() {
  return {
    type: "UPDATEDIALOG_SHOWN"
  };
}

export function toggle() {
  return {
    type: "UPDATEDIALOG_TOGGLE"
  };
}

export function open() {
  return {
    type: "UPDATEDIALOG_OPEN"
  };
}

export function close() {
  return {
    type: "UPDATEDIALOG_CLOSE"
  };
}
