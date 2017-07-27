/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

import React, { Component } from "react";
import { connect } from "react-redux";
import { hashHistory } from "react-router";

import Dialog from "material-ui/Dialog";
import FlatButton from "material-ui/FlatButton";
import TextField from "material-ui/TextField";
import MenuItem from "material-ui/MenuItem";
import { RadioButton, RadioButtonGroup } from "material-ui/RadioButton";

import * as NavbarActions from "../actions/ui/navbar";
import * as TaskActions from "../actions/entities/task";
import * as TaskController from "../models/controllers/task";
import * as TaskQueue from "../models/storage/task-queue";
import * as TaskStorage from "../models/storage/task-storage";
import * as UserController from "../models/controllers/user";
import * as TaskViewActions from "../actions/ui/taskview";

import { SingleDatePicker } from "react-dates";
import moment from "moment";

import DateUtils from "../utils/date-utils";
import AppConstants from "../constants";
import AppStyles from "../styles";

import Validator from "validator";

const styles = {
  radioButton: {
    marginTop: 12
  },
  textField: {
    marginHorizontal: 12,
    fontSize: "100%",
    width: "100%"
  },
  successText: {
    color: "green"
  },
  datePicker: {
    paddingTop: 20,
    paddingBottom: 10,
    width: "100%"
  }
};

class SingleTaskPage extends Component {
  constructor(props) {
    super(props);

    let id = props.router.params.taskId;
    let editedTask = props.tasks[id];

    this.state = {
      deleteError: "",
      updateError: "",
      updateSuccess: "",
      isDeleting: false,
      isUpdating: false,
      deleteTaskDialogIsOpen: false,

      // TODO - we keep these references in case props are updated
      // eg: when this exact task is deleted
      // but how can we do this cleaner?

      // copy object, so that editing does not modify originals
      editedTask: Object.assign({}, editedTask),

      nameValidationError: "",
      notesValidationError: "",
      datePickerIsFocused: false
    };
  }

  componentDidMount() {
    this.props.setLeftNavButton(AppConstants.BACK_NAVBAR_BUTTON);
    this.props.setMediumRightNavButton(AppConstants.SAVE_NAVBAR_BUTTON);
    this.props.setFarRightNavButton(AppConstants.DELETE_NAVBAR_BUTTON);
    this.props.setNavbarTitle("Edit Task");
  }

  componentWillUnmount() {
    this.props.removeLeftNavButton();
    this.props.removeMediumRightNavButton();
    this.props.removeFarRightNavButton();
  }

  componentWillReceiveProps(nextProps) {
    // consume any actions triggered via the Navbar
    if (nextProps.navAction === NavbarActions.SAVE_NAV_ACTION) {
      this._onEditTask();
      this.props.setNavAction(undefined);
    } else if (nextProps.navAction === NavbarActions.DELETE_NAV_ACTION) {
      this.setState({ deleteTaskDialogIsOpen: true });
      this.props.setNavAction(undefined);
    }

    // Update the task, in case the sync has pulled in a more recent version.
    this.setState({
      editedTask: this._getTask(this.state.editedTask, nextProps)
    });
  }

  /*
    SingleTaskPage keeps a local reference to a task, so that the user can
    edit it (as well as discard edits) without polluting global state. Global
    state is only modified when the user confirms their changes.

    This function fetches the task from global state, so that a local reference
    can be made.

    However, when the task is synced while the user is editing it, we might
    need to update our local, now out-of-date, reference. We have made the
    conscious decision to ONLY, ONLY update the task's ID for two reasons.

    1. We do not want the EditTask page to unexpectedly change or discard
       the user's edits without their consent.
    2. An edge case exists such that, if the local reference to ID is not
       updated, the task cannot possibly be updated.

       See the following scenario:

          - The task is created ONLY on the client and gets assigned a
            temporary ID. This is possible when no network connectivity exists.
          - The task is queued to be submitted to the server.
          - The user navigates to the SingleTaskPage, while the task is still
            queued, which causes the local reference to have the temporary ID.
          - The task is finally submitted to the server and gets its temporary,
            client-assigned ID replaced by a permanent, server-assigned ID. In
            this scenario we absolutely MUST update our local reference with the
            server-assigned ID. Otherwise, the server will not recognize the
            old, client-assigned ID.

    NOTE: This function can likely be refined.
  */
  _getTask = (currentTask, props) => {
    let id = props.router.params.taskId;

    let updatedTask = props.tasks[id];

    if (!updatedTask) {
      for (let taskId in props.tasks) {
        if (props.tasks[taskId].clientAssignedTaskId === id) {
          updatedTask = props.tasks[taskId];
        }
      }
    }

    // We only want to update taskId. If we cannot do so (i.e., updatedTask is
    // undefined), or if the taskId does not require updated, then we simply
    // return the current task.
    if (!updatedTask || currentTask.id === updatedTask.id) {
      return currentTask;
    } else {
      return Object.assign(currentTask, { id: updatedTask.id });
    }
  };

  _onEditTask = () => {
    let task = this.state.editedTask;

    let nameValidationError = "";
    let notesValidationError = "";

    let updatedName = task.name || "";
    let updatedNotes = task.notes || "";

    if (!Validator.isLength(updatedName, { min: 1, max: 250 })) {
      nameValidationError = "Name must be between 1 and 250 characters";
    }

    if (!Validator.isLength(updatedNotes, { min: 0, max: 5000 })) {
      notesValidationError = "Notes must be between 0 and 5000 characters";
    }

    if (nameValidationError || notesValidationError) {
      this.setState({
        updateError: "",
        nameValidationError: nameValidationError,
        notesValidationError: notesValidationError
      });

      return; // validation failed; cannot updated task
    }

    if (
      task.id in this.props.pendingTaskCreates ||
      task.id in this.props.pendingTaskUpdates
    ) {
      /*
        If the task is in the pendingQueue, we update the queue rather than
        attempt to submit the update to the server. A separate process will
        handle submitting the queued tasks.
      */
      this._updateTaskLocally(task, true);
    } else if (UserController.canAccessNetwork(this.props.profile)) {
      this.setState(
        {
          isUpdating: true,
          nameValidationError: "",
          notesValidationError: ""
        },
        () => {
          let userId = this.props.profile.id;
          let pw = this.props.profile.password;

          TaskController.updateTask(task, userId, pw)
            .then(response => {
              // use the task in the reponse; it is the most up-to-date
              this._updateTaskLocally(response.task);
            })
            .catch(error => {
              if (error.name === "RetryableError") {
                this._updateTaskLocally(task, true);
              } else {
                this.setState({
                  updateError: error.message,
                  isUpdating: false
                });
              }
            });
        }
      );
    } else {
      this._updateTaskLocally(task, true);
    }
  };

  _updateTaskLocally = (task, queueTaskUpdate) => {
    if (queueTaskUpdate) {
      // mark update time, before queueing
      task.updatedAtDateTimeUtc = new Date();

      // task is queued only when network could not be reached
      this.props.addPendingTaskUpdate(task);
      TaskQueue.queueTaskUpdate(task);
    }

    TaskStorage.createOrUpdateTask(task);
    this.props.createOrUpdateTask(task);

    this.props.refreshTaskViewCollapseStatus();

    this.setState({ updateSuccess: "Successfully updated" });

    // erase update success text after 1.5 seconds
    setTimeout(() => this.setState({ updateSuccess: "" }), 1500);
  };

  /*
    Method invocation assumes an 'Are you sure?'
    dialog has been displayed.
  */
  _onDeleteTask = () => {
    let task = this.state.editedTask;
    task.isDeleted = true;

    if (
      task.id in this.props.pendingTaskCreates ||
      task.id in this.props.pendingTaskUpdates
    ) {
      /*
        If the task is in the pendingQueue, we update the queue rather than
        attempt to submit the update to the server. A separate process will
        handle submitting the queued tasks.
      */
      this._deleteTaskLocallyAndRedirect(task, true);
    } else if (UserController.canAccessNetwork(this.props.profile)) {
      this.setState({ isDeleting: true }, () => {
        let userId = this.props.profile.id;
        let pw = this.props.profile.password;

        TaskController.deleteTask(task.id, userId, pw)
          .then(response => {
            // use the task in the reponse; it is the most up-to-date
            this._deleteTaskLocallyAndRedirect(response.task);
          })
          .catch(error => {
            if (error.name === "RetryableError") {
              this._deleteTaskLocallyAndRedirect(task, true);
            } else {
              this.setState({
                deleteError: error.message,
                isDeleting: false
              });
            }
          });
      });
    } else {
      this._deleteTaskLocallyAndRedirect(task, true);
    }
  };

  _deleteTaskLocallyAndRedirect = (task, queueTaskDeletion) => {
    if (queueTaskDeletion) {
      // mark update time, before queueing
      task.updatedAtDateTimeUtc = new Date();

      // task is queued only when network could not be reached
      this.props.addPendingTaskDelete(task);
      TaskQueue.queueTaskDelete(task);
    }

    /*
     The task has been marked `isDeleted = true`.

     We choose to "createOrUpdateTask" the task, even though it is being
     deleted, so that we can correctly manage the sync. Without a reference to
     this task, a sync might receive an outdated (undeleted) version of the
     task and incorrectly re-recreate it.
    */
    TaskStorage.createOrUpdateTask(task);
    this.props.createOrUpdateTask(task);

    this.props.refreshTaskViewCollapseStatus();

    hashHistory.replace("/tasks");
  };

  _datePicker = () => {
    const selectedDate = this.state.editedTask.dueDateTimeUtc
      ? moment(this.state.editedTask.dueDateTimeUtc)
      : undefined;

    return (
      <div style={styles.datePicker}>
        <SingleDatePicker
          placeholder="Due Date"
          withFullScreenPortal={true}
          reopenPickerOnClearDate={false}
          showClearDate={true}
          numberOfMonths={1}
          date={selectedDate}
          onDateChange={selectedDate => {
            let task = this.state.editedTask;

            task.dueDateTimeUtc = DateUtils.oneSecondBeforeMidnight(
              selectedDate
            );
            this.setState({ editedTask: task });
          }}
          focused={this.state.datePickerIsFocused}
          onFocusChange={({ focused }) => {
            this.setState({ datePickerIsFocused: focused });
          }}
        />
      </div>
    );
  };

  /*
    Intended to let the "Notes" textfield grow as user enters more text.
    However, this approach is not correct. It only works if each line does
    not exceed the screen width (ie, no wordwrap).

    // TODO - can we do this better / more efficiently?
  */
  _noteRowsToDisplay = () => {
    return (this.state.editedTask.notes || "").split(/\r\n|\r|\n/).length;
  };

  render = () => {
    let task = this.state.editedTask;

    const actions = [
      <FlatButton
        label="Cancel"
        onTouchTap={() => {
          this.setState({ deleteTaskDialogIsOpen: false });
        }}
      />,
      <FlatButton
        label="Yes"
        onTouchTap={() => {
          this.setState({ deleteTaskDialogIsOpen: false });
          this._onDeleteTask();
        }}
      />
    ];

    // TODO - consider scrollable dialog instead of dropdown

    return (
      <div style={AppStyles.mainWindow}>
        <div style={AppStyles.centeredWindow}>
          <Dialog
            style={AppStyles.dialog}
            title="Delete Task"
            actions={actions}
            modal={false}
            open={this.state.deleteTaskDialogIsOpen}
            onRequestClose={() => {
              this.setState({ deleteTaskDialogIsOpen: false });
            }}
          >
            Are you sure you want to delete this task?
          </Dialog>

          <TextField
            style={{
              ...styles.textField,
              ...AppStyles.centeredElement
            }}
            multiLine={true}
            hintText="Name"
            floatingLabelText="Name"
            errorText={this.state.nameValidationError}
            type="text"
            value={task.name || ""}
            onChange={(event, name) => {
              // update our reference to task
              task.name = name;

              this.setState({ editedTask: task });
            }}
          />

          <br />

          <TextField
            multiLine={true}
            rows={this._noteRowsToDisplay()}
            style={{
              ...styles.textField,
              ...AppStyles.centeredElement
            }}
            hintText="Notes"
            floatingLabelText="Notes"
            errorText={this.state.notesValidationError}
            type="text"
            value={task.notes || ""}
            onChange={(event, notes) => {
              // update our reference to task
              task.notes = notes;

              this.setState({ editedTask: task });
            }}
          />

          <br />

          {this._datePicker()}

          <br />

          <div style={AppStyles.errorText}>
            {this.state.updateError}
          </div>

          <div style={styles.successText}>
            {this.state.updateSuccess}
          </div>
        </div>
      </div>
    );
  };
}

const mapStateToProps = state => ({
  isLoggedIn: state.entities.user.isLoggedIn,
  profile: state.entities.user.profile,
  tasks: state.entities.task.tasks,
  pendingTaskCreates: state.entities.task.pendingTaskActions.create || {},
  pendingTaskUpdates: state.entities.task.pendingTaskActions.update || {},
  navAction: state.ui.navbar.navAction
});

const mapDispatchToProps = {
  createOrUpdateTask: TaskActions.createOrUpdateTask,
  addPendingTaskUpdate: TaskActions.addPendingTaskUpdate,
  addPendingTaskDelete: TaskActions.addPendingTaskDelete,
  deleteTask: TaskActions.deleteTask,
  setLeftNavButton: NavbarActions.setLeftNavButton,
  removeLeftNavButton: NavbarActions.removeLeftNavButton,
  setMediumRightNavButton: NavbarActions.setMediumRightNavButton,
  removeMediumRightNavButton: NavbarActions.removeMediumRightNavButton,
  setFarRightNavButton: NavbarActions.setFarRightNavButton,
  removeFarRightNavButton: NavbarActions.removeFarRightNavButton,
  setNavbarTitle: NavbarActions.setNavbarTitle,
  setNavAction: NavbarActions.setNavAction,
  refreshTaskViewCollapseStatus: TaskViewActions.refreshTaskViewCollapseStatus
};

export default connect(mapStateToProps, mapDispatchToProps)(SingleTaskPage);
