/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

/*
  This module serves as a persistent queue for task operations.

  Not all task operations are queued, only those that could not originally
  reach the server. Note that tasks should live in the queue as briefly as
  possible; a separate background process has the sole job of clearing the
  queue.
*/

import * as _ from "lodash";

import PouchDB from "pouchdb-browser";
PouchDB.plugin(require("pouchdb-upsert"));

const db = new PouchDB("./endoradb", { adapter: "websql" });

const UPDATE = "UPDATE";
const DELETE = "DELETE";
const CREATE = "CREATE";

function _endoraFormat(task) {
  let endoraFormattedTask = {};

  if (task) {
    endoraFormattedTask = task.key;
    delete endoraFormattedTask._id;
    delete endoraFormattedTask._rev;
    delete endoraFormattedTask.type;
    delete endoraFormattedTask.operation;
  }

  return endoraFormattedTask;
}

export async function getQueuedTaskByTaskId(taskId) {
  return _endoraFormat(await db.get(taskId));
}

export async function getAllPendingUpdates() {
  return await _getPendingTasks(doc => {
    if (doc.type === "queue/task" && doc.operation === "UPDATE") {
      emit(doc);
    }
  });
}

export async function getAllPendingDeletes() {
  return await _getPendingTasks(doc => {
    if (doc.type === "queue/task" && doc.operation === "DELETE") {
      emit(doc);
    }
  });
}

export async function getAllPendingCreates() {
  return await _getPendingTasks(doc => {
    if (doc.type === "queue/task" && doc.operation === "CREATE") {
      emit(doc);
    }
  });
}

async function _getPendingTasks(map) {
  // TODO - look into "design doc" for map queries

  let tasks = await db.query(map);

  let taskMap = {};
  for (let task of tasks.rows) {
    let formattedTask = _endoraFormat(task);
    taskMap[formattedTask.id] = formattedTask;
  }

  return taskMap;
}

export function queueTaskCreate(task) {
  return _upsertTask(task, CREATE);
}

export function queueTaskUpdate(task) {
  return _upsertTask(task, UPDATE);
}

export function queueTaskDelete(task) {
  return _upsertTask(task, DELETE);
}

function _upsertTask(task, operation) {
  return db.upsert(`queue/task/${task.id}`, function(doc) {
    task._id = task.id;
    task.type = "queue/task";
    task.operation = operation;

    return task;
  });
}

export function dequeueTaskByTaskId(taskId) {
  // TODO - we should instead update the "deletion status"
  return db.get(`queue/task/${taskId}`).then(function(task) {
    return db.remove(task);
  });
}

export function cleanTaskQueue() {}
