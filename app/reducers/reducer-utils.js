/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

export function updateObject(oldObject, newValues) {

  // TODO - should we use lodash merge instead of Object.assign?
    // import merge from "lodash/object/merge";

    return Object.assign({}, oldObject, newValues)
}
