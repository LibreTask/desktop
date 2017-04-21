/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

import { combineReducers } from 'redux'
import {
  CREATE_OR_UPDATE_TASK,
  CREATE_OR_UPDATE_TASKS,
  DELETE_ALL_TASKS,
  DELETE_TASK,
  START_TASK_SYNC,
  END_TASK_SYNC,
  SYNC_TASKS
} from '../../actions/entities/task'
import {
  updateObject,
  createReducer,
} from '../reducer-utils'

import * as _ from 'lodash'

function startTaskSync(state, action) {
  return updateObject(state, {
    isSyncing: true,
    intervalId: action.intervalId
  })
}

function endTaskSync(state, action) {
  clearInterval(state.intervalId) // TODO - is this the best place to do it?

  return updateObject(state, {
    isSyncing: false,
    intervalId: undefined
  })
}

function deleteAllTasks(state, action) {
  return updateObject(state, {
    tasks: { /* all tasks are deleted */ }
  })
}

function deleteTask(state, action) {
  let remainingTasks = _.filter(state.tasks, function(task) {
    return task.id !== action.taskId // filter out taskId
  })

  let taskMap = {}
  _.forEach(remainingTasks, (task) => {
    taskMap[task.id] = task
  })

  return updateObject(state, { tasks: taskMap })
}

function addTasks(state, action) {
  let normalizedTasks = {}
  _.forEach(action.tasks, (task) => {
    normalizedTasks[task.id] = task
  })
  return updateObject(state,
    {
      tasks: updateObject(state.tasks, normalizedTasks),
    }
  )
}

function addTask(state, action) {
  return addNormalizedTask(state, action.task)
}

function addNormalizedTask(state, normalizedTask) {

  let updatedTaskEntry = {}
  updatedTaskEntry[normalizedTask.id] = normalizedTask

  return updateObject(state,
    {
      tasks: updateObject(state.tasks, updatedTaskEntry)
    }
  )
}

function syncTasks(state, action) {

  let updatedState = updateObject(state, {
    lastSuccessfulSyncDateTimeUtc: action.lastSuccessfulSyncDateTimeUtc
  })

  return (action.tasks && action.tasks.length > 0)
    ? addTasks(updatedState, action)
    : state
}

const initialState = {
  tasks: {
    // taskId: {public task attributes}
  },
  isSyncing: false,
  intervalId: undefined, // used to cancel sync
  lastSuccessfulSyncDateTimeUtc: undefined
}

function tasksReducer(state = initialState, action) {
  switch(action.type) {

    /*
      TODO - doc
    */
    case START_TASK_SYNC:
      return startTaskSync(state, action)

    /*
      TODO - doc
    */
    case END_TASK_SYNC:
      return endTaskSync(state, action)

    /*
     TODO - doc
    */
    case SYNC_TASKS:
      return syncTasks(state, action)

    /*
      TODO - doc
    */
    case CREATE_OR_UPDATE_TASK:
      return addTask(state, action)

    /*
      TODO - doc
    */
    case CREATE_OR_UPDATE_TASKS:
      return addTasks(state, action)

    /*
      TODO - doc
    */
    case DELETE_ALL_TASKS:
      return deleteAllTasks(state, action)

    /*
      TODO - doc
    */
    case DELETE_TASK:
      return deleteTask(state, action)

    default:
      return state
  }
}

export default tasksReducer
