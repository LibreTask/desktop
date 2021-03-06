/*
 * @link https://libretask.org/
 * @license https://github.com/LibreTask/desktop/blob/master/LICENSE.md
 */

import PouchDB from "pouchdb-browser";
PouchDB.plugin(require("pouchdb-upsert"));

const db = new PouchDB("./libretaskdb", { adapter: "websql" });

export const WINDOW_WIDTH = "window-width";
export const WINDOW_HEIGHT = "window-height";

const WINDOW_DIMENSIONS = "window-dimensions";

export async function getWindowSize() {
  return await db.query(WINDOW_DIMENSIONS);
}

export async function updateWindowSize(width, height) {
  await db.upsert(WINDOW_DIMENSIONS, function(doc) {
    return {
      WINDOW_WIDTH: width,
      WINDOW_HEIGHT: height
    };
  });
}
