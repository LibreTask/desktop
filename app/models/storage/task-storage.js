/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

import * as _ from "lodash";

import PouchDB from "pouchdb-browser";
PouchDB.plugin(require("pouchdb-upsert"));

let db = new PouchDB("./algernondb", { adapter: "websql" });

function _algernonFormat(task) {
  let algernonFormattedTask = {};

  if (task) {
    algernonFormattedTask = task.key;
    delete algernonFormattedTask._id;
    delete algernonFormattedTask._rev;
    delete algernonFormattedTask.type;
  }

  return algernonFormattedTask;
}

export async function getTaskByTaskId(taskId) {
  return _algernonFormat(await db.get(taskId));
}

export async function getAllTasks() {
  // TODO - look into "design doc" for map queries
  function map(doc) {
    if (doc.type === "task") {
      emit(doc);
    }
  }

  let tasks = await db.query(map);

  let taskMap = {};
  for (let task of tasks.rows) {
    taskMap[task.id] = _algernonFormat(task);
  }

  return taskMap;
}

export function createOrUpdateTasks(tasks) {
  for (let task of tasks) {
    createOrUpdateTask(task);
  }
}

export function createOrUpdateTask(task) {
  return db.upsert(task.id, function(doc) {
    task._id = task.id;
    task.type = "task";

    return task;
  });
}

export function deleteTaskByTaskId(taskId) {
  return db.get(taskId).then(function(task) {
    return db.remove(task);
  });
}

export function cleanTaskStorage() {
  // TODO - refine
  return db.destroy().then(function(response) {
    db = new PouchDB("./algernondb", { adapter: "websql" });
  });
}
