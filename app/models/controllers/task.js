/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

import { invoke, constructAuthHeader } from '../../middleware/api'

const uuid = require('node-uuid')

/*
  Only invoked when a Task need to be created client side, rather than server
  side. That is, when the client 1) has no network connection OR 2) is not
  logged in.
*/
export const constructTaskLocally = (taskName, taskNotes,
  taskDueDateTimeUtc) => {
  return {
    name: taskName,
    notes: taskNotes,
    dueDateTimeUtc: taskDueDateTimeUtc,
    id: 'client-task-' + uuid.v4(),
    // Notably, no userId is assigned because one may not exist.
    // A successful sync will rectify any discrepencies.
  }
}

export const createTask = (taskName, taskNotes, taskDueDateTimeUtc,
   userId, password) => {
  const request = {
    endpoint: `task/create`,
    method: 'POST',
     headers: {
       'Accept': 'application/json',
       'Content-Type': 'application/json',
       'Authorization': constructAuthHeader(userId, password)
     },
     body: JSON.stringify({
       name: taskName,
       notes: taskNotes,
       dueDateTimeUtc: taskDueDateTimeUtc,
       // TODO -
     })
  }

  return invoke(request)
}

export const updateTask = (task, userId, password) => {
    const request = {
      endpoint: `task/update`,
      method: 'POST',
       headers: {
         'Accept': 'application/json',
         'Content-Type': 'application/json',
         'Authorization': constructAuthHeader(userId, password)
       },
       body: JSON.stringify({
         task: task
       })
    }

    return invoke(request)
}

export const deleteTask = (taskId, userId, password) => {
  const request = {
    endpoint: `task/delete`,
    method: 'DELETE',
     headers: {
       'Accept': 'application/json',
       'Content-Type': 'application/json',
       'Authorization': constructAuthHeader(userId, password)
     },
     body: JSON.stringify({
       taskId: taskId
     })
  }

  return invoke(request)
}

export const fetchTask = (taskId, userId, password) => {
  const request = {
      endpoint: `task/get-task-by-id/taskId=${taskId}`,
      schema: TaskSchema,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': constructAuthHeader(userId, password)
      },
  }

  return invoke(request)
}
