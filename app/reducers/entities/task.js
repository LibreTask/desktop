/*
 * @link https://libretask.org/
 * @license https://github.com/LibreTask/desktop/blob/master/LICENSE.md
 */

import { combineReducers } from "redux";
import {
  ADD_PENDING_TASK_CREATE,
  ADD_PENDING_TASK_UPDATE,
  ADD_PENDING_TASK_DELETE,
  REMOVE_PENDING_TASK_CREATE,
  REMOVE_PENDING_TASK_UPDATE,
  REMOVE_PENDING_TASK_DELETE,
  START_QUEUED_TASK_SUBMIT,
  STOP_QUEUED_TASK_SUBMIT,
  START_TASK_CLEANUP,
  STOP_TASK_CLEANUP,
  CREATE_OR_UPDATE_TASK,
  DELETE_ALL_TASKS,
  DELETE_TASK,
  START_TASK_SYNC,
  END_TASK_SYNC,
  SYNC_TASKS
} from "../../actions/entities/task";
import { updateObject } from "../reducer-utils";

import * as TaskStorage from "../../models/storage/task-storage";
import * as TaskQueue from "../../models/storage/task-queue";

import * as _ from "lodash";

function removeTask(tasks, taskId) {
  let remainingTasks = _.filter(tasks, function(task) {
    return task.id !== taskId; // filter out taskId
  });

  return remainingTasks;
}

function addPendingTaskCreate(state, action) {
  let newTaskEntry = {};
  newTaskEntry[action.task.id] = action.task;

  let queuedCreates = updateObject(
    state.pendingTaskActions.create,
    newTaskEntry
  );

  try {
    TaskQueue.queueTaskCreate(action.task);
  } catch (err) {
    /*
     If an error occurs when writing to disk, ignore it. Disk storage is a
     non-critical feature, unlike the rest of the code here. We never want to
     throw an error from a reducer.

     TODO - reevaluate
   */
  }

  return updateObject(state, {
    pendingTaskActions: {
      create: queuedCreates,
      update: state.pendingTaskActions.update,
      delete: state.pendingTaskActions.delete
    }
  });
}

function addPendingTaskUpdate(state, action) {
  let taskId = action.task.id;
  let newTaskEntry = {};
  newTaskEntry[taskId] = action.task;

  let updatedPendingTaskActions = undefined;

  // the task is already queued to be created; replace it
  if (taskId in state.pendingTaskActions.create) {
    let queuedCreates = updateObject(
      state.pendingTaskActions.create,
      newTaskEntry
    );

    try {
      TaskQueue.queueTaskCreate(action.task);
    } catch (err) {
      /*
     If an error occurs when writing to disk, ignore it. Disk storage is a
     non-critical feature, unlike the rest of the code here. We never want to
     throw an error from a reducer.

     TODO - reevaluate
   */
    }

    updatedPendingTaskActions = {
      create: queuedCreates,
      update: state.pendingTaskActions.update,
      delete: state.pendingTaskActions.delete
    };
  } else {
    /*
        This block handles the following cases:
        1. The task is already queued to be deleted
        2. The task is already queued to be updated
        3. The task is not queued for anything

        For all these scenarios, we want to queue an update.
     */

    let queuedUpdates = updateObject(
      state.pendingTaskActions.update,
      newTaskEntry
    );

    try {
      TaskQueue.queueTaskUpdate(action.task);
    } catch (err) {
      /*
     If an error occurs when writing to disk, ignore it. Disk storage is a
     non-critical feature, unlike the rest of the code here. We never want to
     throw an error from a reducer.

     TODO - reevaluate
   */
    }

    updatedPendingTaskActions = {
      update: queuedUpdates,
      create: state.pendingTaskActions.create,
      delete: state.pendingTaskActions.delete
    };
  }

  return updateObject(state, {
    pendingTaskActions: updatedPendingTaskActions
  });
}

function addPendingTaskDelete(state, action) {
  let taskId = action.task.id;
  let newTaskEntry = {};
  newTaskEntry[taskId] = action.task;

  let updatedPendingTaskActions = undefined;

  // the task is already queued to be created; remove it from creation
  if (taskId in state.pendingTaskActions.create) {
    let remainingTasks = removeTask(state.pendingTaskActions.create, taskId);

    let taskMap = {};
    for (let task of remainingTasks) {
      taskMap[task.id] = task;
    }

    try {
      TaskQueue.dequeueTaskByTaskId(taskId);
    } catch (err) {
      /*
     If an error occurs when writing to disk, ignore it. Disk storage is a
     non-critical feature, unlike the rest of the code here. We never want to
     throw an error from a reducer.

     TODO - reevaluate
   */
    }

    updatedPendingTaskActions = {
      create: taskMap,
      update: state.pendingTaskActions.update,
      delete: state.pendingTaskActions.delete
    };
  } else if (
    !(taskId in state.pendingTaskActions.delete) ||
    taskId in state.pendingTaskActions.update
  ) {
    /*
      If the task is not queued to be deleted, queue it now.

      If the task is already queued to be updated; queue it for deletion anyways,
      because the backend design is such that deletes and updates do not conflict
      with each other.
     */
    let queuedDeletes = updateObject(
      state.pendingTaskActions.delete,
      newTaskEntry
    );

    try {
      TaskQueue.queueTaskDelete(action.task);
    } catch (err) {
      /*
     If an error occurs when writing to disk, ignore it. Disk storage is a
     non-critical feature, unlike the rest of the code here. We never want to
     throw an error from a reducer.

     TODO - reevaluate
   */
    }

    updatedPendingTaskActions = {
      delete: queuedDeletes,
      update: state.pendingTaskActions.update,
      create: state.pendingTaskActions.create
    };
  } else {
    // the task is already queued to be deleted; do nothing
    updatedPendingTaskActions = state.pendingTaskActions;
  }

  return updateObject(state, {
    pendingTaskActions: updatedPendingTaskActions
  });
}

function removePendingTaskCreate(state, action) {
  let remainingTasks = removeTask(
    state.pendingTaskActions.create,
    action.taskId
  );

  let remainingTasksQueuedForCreation = {};
  for (let task of remainingTasks) {
    remainingTasksQueuedForCreation[task.id] = task;
  }

  /*
     Each task has a unique ID. This identifier is usually assigned by the
     server. However, if for some reason, the client is unable to reach the
     server, the client will create a temporary ID and then queue the task
     for creation.

     Later, when the client can finally reach the server, the server will give
     the task a new ID. Here we replace the old, client-assigned ID with the new,
     server-assigned ID.

     Three places must be checked
     1. state.tasks
         --- this is where all tasks live
     2. state.pendingTaskActions.update
         --- unlikely but possible the task is also queued for an update
     3. state.pendingTaskActions.delete
         --- unlikely but possible the task is also queued for deletion
   */

  // TODO - we must also update update / delete now that we have
  // the REAL task ID

  let clientAssignedTaskId = action.taskId;
  let serverAssignedTaskId = action.serverAssignedTaskId;

  // TODO - refine the approach of replacing the existing task

  let task = Object.assign({}, state.tasks[clientAssignedTaskId]);
  task.id = serverAssignedTaskId;

  /*
     Keep a reference to the clientAssignedTaskId in case a local reference
     exists. TODO - refine this approach.
   */
  task.clientAssignedTaskId = clientAssignedTaskId;
  delete state.tasks[clientAssignedTaskId]; // delete existing task
  state.tasks[serverAssignedTaskId] = task; // replace with new ID

  TaskQueue.dequeueTaskByTaskId(action.taskId); // delete task from queue

  /*
    Delete the previously-queued task and reinsert the newly server-created
    task. We do this because we need the server-assigned ID stored locally,
    not the client-assigned ID.
  */
  TaskStorage.deleteTaskByTaskId(action.taskId);
  TaskStorage.createOrUpdateTask(task);

  let pendingUpdates = state.pendingTaskActions.update || {};
  if (clientAssignedTaskId in pendingUpdates) {
    delete pendingUpdates[clientAssignedTaskId]; // delete existing task
    pendingUpdates[serverAssignedTaskId] = task; // replace with new ID

    try {
      TaskQueue.dequeueTaskByTaskId(clientAssignedTaskId);
      TaskQueue.queueTaskUpdate(task);
    } catch (err) {
      /*
    If an error occurs when writing to disk, ignore it. Disk storage is a
    non-critical feature, unlike the rest of the code here. We never want to
    throw an error from a reducer.

    TODO - reevaluate
  */
    }
  }

  let pendingDeletes = state.pendingTaskActions.delete || {};
  if (clientAssignedTaskId in pendingDeletes) {
    delete pendingDeletes[clientAssignedTaskId]; // delete existing task
    pendingDeletes[serverAssignedTaskId] = task; // replace with new ID

    try {
      TaskQueue.dequeueTaskByTaskId(clientAssignedTaskId);
      TaskQueue.queueTaskDelete(task);
    } catch (err) {
      /*
    If an error occurs when writing to disk, ignore it. Disk storage is a
    non-critical feature, unlike the rest of the code here. We never want to
    throw an error from a reducer.

    TODO - reevaluate
  */
    }
  }

  return updateObject(state, {
    pendingTaskActions: {
      create: remainingTasksQueuedForCreation,
      update: pendingUpdates,
      delete: pendingDeletes
    }
  });
}

function removePendingTaskUpdate(state, action) {
  let remainingTasks = removeTask(
    state.pendingTaskActions.update,
    action.taskId
  );

  let taskMap = {};
  for (let task of remainingTasks) {
    taskMap[task.id] = task;
  }

  try {
    TaskQueue.dequeueTaskByTaskId(action.taskId);
  } catch (err) {
    /*
     If an error occurs when writing to disk, ignore it. Disk storage is a
     non-critical feature, unlike the rest of the code here. We never want to
     throw an error from a reducer.

     TODO - reevaluate
   */
  }

  return updateObject(state, {
    pendingTaskActions: {
      update: taskMap,
      create: state.pendingTaskActions.create,
      delete: state.pendingTaskActions.delete
    }
  });
}

function removePendingTaskDelete(state, action) {
  let remainingTasks = removeTask(
    state.pendingTaskActions.delete,
    action.taskId
  );

  let taskMap = {};
  for (let task of remainingTasks) {
    taskMap[task.id] = task;
  }

  try {
    TaskQueue.dequeueTaskByTaskId(action.taskId);
  } catch (err) {
    /*
     If an error occurs when writing to disk, ignore it. Disk storage is a
     non-critical feature, unlike the rest of the code here. We never want to
     throw an error from a reducer.

     TODO - reevaluate
   */
  }

  return updateObject(state, {
    pendingTaskActions: {
      delete: taskMap,
      create: state.pendingTaskActions.create,
      update: state.pendingTaskActions.update
    }
  });
}

function startQueuedTaskSubmit(state, action) {
  return updateObject(state, {
    isSubmittingQueuedTasks: true,
    queuedTaskSubmitIntervalId: action.intervalId
  });
}

function stopQueuedTaskSubmission(state, action) {
  //clearInterval(state.intervalId); // TODO - is this the best place to do it?

  return updateObject(state, {
    isSubmittingQueuedTasks: false,
    queuedTaskSubmitIntervalId: undefined
  });
}

function startTaskSync(state, action) {
  return updateObject(state, {
    isSyncing: true,
    syncIntervalId: action.intervalId
  });
}

function endTaskSync(state, action) {
  //clearInterval(state.intervalId); // TODO - is this the best place to do it?

  return updateObject(state, {
    isSyncing: false,
    syncIntervalId: undefined
  });
}

function startTaskCleanup(state, action) {
  return updateObject(state, {
    isCleaningUpTasks: true,
    taskCleanupIntervalId: action.intervalId
  });
}

function stopTaskCleanup(state, action) {
  //clearInterval(state.intervalId); // TODO - is this the best place to do it?

  return updateObject(state, {
    isCleaningUpTasks: false,
    taskCleanupIntervalId: undefined
  });
}

function deleteAllTasks(state, action) {
  try {
    TaskQueue.cleanTaskQueue();
    TaskStorage.cleanTaskStorage();
  } catch (err) {
    /*
     If an error occurs when writing to disk, ignore it. Disk storage is a
     non-critical feature, unlike the rest of the code here. We never want to
     throw an error from a reducer.

     TODO - reevaluate
   */
  }

  return updateObject(state, {
    tasks: {
      /* all tasks are deleted */
    },
    pendingTaskActions: {
      update: {},
      delete: {},
      create: {}
    }
  });
}

function deleteTask(state, action) {
  let remainingTasks = removeTask(state.tasks, action.taskId);

  let taskMap = {};
  for (let task of remainingTasks) {
    taskMap[task.id] = task;
  }

  try {
    TaskStorage.deleteTaskByTaskId(action.taskId);
  } catch (err) {
    /*
     If an error occurs when writing to disk, ignore it. Disk storage is a
     non-critical feature, unlike the rest of the code here. We never want to
     throw an error from a reducer.

     TODO - reevaluate
   */
  }

  return updateObject(state, { tasks: taskMap });
}

function addTasks(state, action) {
  let normalizedTasks = {};
  for (let task of action.tasks) {
    normalizedTasks[task.id] = task;
  }

  try {
    TaskStorage.createOrUpdateTasks(action.tasks);
  } catch (err) {
    /*
     If an error occurs when writing to disk, ignore it. Disk storage is a
     non-critical feature, unlike the rest of the code here. We never want to
     throw an error from a reducer.

     TODO - reevaluate
   */
  }

  return updateObject(state, {
    tasks: updateObject(state.tasks, normalizedTasks)
  });
}

function addTask(state, action) {
  return addNormalizedTask(state, action.task);
}

function addNormalizedTask(state, normalizedTask) {
  let updatedTaskEntry = {};
  updatedTaskEntry[normalizedTask.id] = normalizedTask;

  try {
    TaskStorage.createOrUpdateTask(normalizedTask);
  } catch (err) {
    /*
     If an error occurs when writing to disk, ignore it. Disk storage is a
     non-critical feature, unlike the rest of the code here. We never want to
     throw an error from a reducer.

     TODO - reevaluate
   */
  }

  return updateObject(state, {
    tasks: updateObject(state.tasks, updatedTaskEntry)
  });
}

/*
    This function always updates the value lastSuccessfulSyncDateTimeUtc. This is
    because it is assumed that this function is ONLY invoked after a successful
    sync.
  */
function syncTasks(state, action) {
  const syncedTasks = action.tasks;
  const existingTasks = state.tasks;

  let tasksToCreateOrUpdate = [];

  for (let syncedTask of syncedTasks) {
    if (syncedTask.id in existingTasks) {
      const syncedTaskUpdateDateTimeUtc = syncedTask.updatedAtDateTimeUtc;
      const existingTaskUpdateDateTimeUtc =
        existingTasks[syncedTask.id].updatedAtDateTimeUtc;

      let syncedTaskWasUpdatedMostRecently =
        (syncedTaskUpdateDateTimeUtc && !existingTaskUpdateDateTimeUtc) ||
        syncedTaskUpdateDateTimeUtc > existingTaskUpdateDateTimeUtc;

      if (
        syncedTaskWasUpdatedMostRecently &&
        syncedTaskDoesNotConflictWithQueuedTask(state, syncedTask)
      ) {
        // synced task was updated more recently than the version on
        // this device. so we must mark it for update/creation.
        tasksToCreateOrUpdate.push(syncedTask);
      } else {
        /*
            The synced task was less up-to-date than the version residing on the
            client. This is expected in some scenarios, such as when the client
            looses network connectivity, and must queue up a task action.

            For this case, we do nothing here. The queue-logic is designed to
            completely handle such scenarios.
          */
      }
    } else {
      // synced task does not already exist on this device.
      // so we must mark it for update/creation.
      tasksToCreateOrUpdate.push(syncedTask);
    }
  }

  return addTasks(state, {
    tasks: tasksToCreateOrUpdate,
    lastSuccessfulSyncDateTimeUtc: action.lastSuccessfulSyncDateTimeUtc
  });
}

/*
    This method is not expected to always be correct. There are many nuances
    involved with correctly syncing and queueing state, especially as more
    clients are involved and the network is assumed to be unreliable.

    The current approach is to simply return false if the synced task was updated
    at a LESS RECENT date than the task on the client.
  */
function syncedTaskDoesNotConflictWithQueuedTask(state, syncedTask) {
  let pendingTaskActions = state.pendingTaskActions;

  if (pendingTaskActions.create && syncedTask.id in pendingTaskActions.create) {
    // This should never happen. It would indicate either a bug (most likely)
    // or a UUID collision resulting from a client-assigned id being identical
    // to a server-assignd id (near impossible).
    throw new Error("Synced task was found in to-be-created queue.");
  } else if (
    pendingTaskActions.update &&
    syncedTask.id in pendingTaskActions.update
  ) {
    let queuedTask = pendingTaskActions.update[syncedTask.id];

    // TODO - improve

    // Always update if the queuedTask has undefined updatedAtDateTimeUtc AND
    // the syncedTask does not.
    if (syncedTask.updatedAtDateTimeUtc > queuedTask.updatedAtDateTimeUtc) {
      return false;
    } else {
      return false;
    }
  } else if (
    pendingTaskActions.delete &&
    syncedTask.id in pendingTaskActions.delete
  ) {
    let queuedTask = pendingTaskActions.delete[syncedTask.id];

    // TODO - improve

    // Always update if the queuedTask has undefined updatedAtDateTimeUtc AND
    // the syncedTask does not.
    if (syncedTask.updatedAtDateTimeUtc > queuedTask.updatedAtDateTimeUtc) {
      return false;
    } else {
      return false;
    }
  } else {
    /* the synced task does not conflict; it is not in the queue. */
    return true;
  }
}

const initialState = {
  tasks: {
    // taskId: {public task attributes}
  },
  pendingTaskActions: {
    update: {
      // taskId: {public task attributes}
    },
    delete: {
      // taskId: {public task attributes}
    },
    create: {
      // taskId: {public task attributes}
    }
  },
  isSyncing: false,
  syncIntervalId: undefined, // used to cancel sync
  lastSuccessfulSyncDateTimeUtc: undefined,
  isSubmittingQueuedTasks: false,
  queuedTaskSubmitIntervalId: undefined,
  isCleaningUpTasks: false,
  taskCleanupIntervalId: undefined
};

function tasksReducer(state = initialState, action) {
  switch (action.type) {
    case START_QUEUED_TASK_SUBMIT:
      return startQueuedTaskSubmit(state, action);
    case STOP_QUEUED_TASK_SUBMIT:
      return stopQueuedTaskSubmission(state, action);
    case START_TASK_SYNC:
      return startTaskSync(state, action);
    case END_TASK_SYNC:
      return endTaskSync(state, action);
    case START_TASK_CLEANUP:
      return startTaskCleanup(state, action);
    case STOP_TASK_CLEANUP:
      return stopTaskCleanup(state, action);
    case SYNC_TASKS:
      return syncTasks(state, action);
    case CREATE_OR_UPDATE_TASK:
      return addTask(state, action);
    case DELETE_ALL_TASKS:
      return deleteAllTasks(state, action);
    case DELETE_TASK:
      return deleteTask(state, action);
    case ADD_PENDING_TASK_DELETE:
      return addPendingTaskDelete(state, action);
    case ADD_PENDING_TASK_UPDATE:
      return addPendingTaskUpdate(state, action);
    case ADD_PENDING_TASK_CREATE:
      return addPendingTaskCreate(state, action);
    case REMOVE_PENDING_TASK_DELETE:
      return removePendingTaskDelete(state, action);
    case REMOVE_PENDING_TASK_UPDATE:
      return removePendingTaskUpdate(state, action);
    case REMOVE_PENDING_TASK_CREATE:
      return removePendingTaskCreate(state, action);

    default:
      return state;
  }
}

export default tasksReducer;
