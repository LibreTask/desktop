/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

import * as _ from 'lodash'

import PouchDB from 'pouchdb-browser'
PouchDB.plugin(require('pouchdb-upsert'))

const db = new PouchDB('./endoradb', {adapter: 'websql'})

function _endoraFormat(task) {
  let endoraFormattedTask = {}

  if (task) {
    endoraFormattedTask = task.key
    delete endoraFormattedTask._id
    delete endoraFormattedTask._rev
    delete endoraFormattedTask.type
  }

  return endoraFormattedTask
}

export async function getTaskByTaskId(taskId) {
  return _endoraFormat(await db.get(taskId))
}

export async function getAllTasks() {
  // TODO - look into "design doc" for map queries
  function map(doc) {

    if (doc.type === 'task') {
      emit(doc)
    }
  }

  let tasks = await db.query(map)

  let taskMap = {}
  for (let task of tasks.rows) {
    taskMap[task.id] = _endoraFormat(task)
  }

  return taskMap
}

export async function getTasksByListId(listId) {
  // TODO - look into "design doc" for map queries
  function map(doc) {

    if (doc.type === 'task' && doc.listd === listId ) {
      emit(doc)
    }
  }

  let tasks = await db.query(map)

  let taskMap = {}
  for (let task of tasks.rows) {
    taskMap[task.id] = _endoraFormat(task)
  }

  return taskMap
}

export function createOrUpdateTasks(tasks) {

  for (let task of tasks) {
    createOrUpdateTask(task)
  }
}

export function createOrUpdateTask(task) {

  return db.upsert(task.id, function(doc) {

    task._id = task.id
    task.type = 'task'

    return task;
  })
}

export function deleteTaskByTaskId(taskId) {
  return db.remove(taskId)
}

export function cleanTaskStorage() {

}
