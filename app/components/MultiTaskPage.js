/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

import React, { Component, PropTypes } from "react";
import { connect } from "react-redux";
import { hashHistory } from "react-router";

import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import { deepOrange500 } from "material-ui/styles/colors";
import getMuiTheme from "material-ui/styles/getMuiTheme";
import { List, ListItem } from "material-ui/List";
import Checkbox from "material-ui/Checkbox";

const FaChevronRight = require("react-icons/lib/fa/chevron-right");
const FaChevronDown = require("react-icons/lib/fa/chevron-down");

import * as NavbarActions from "../actions/ui/navbar";
import * as TaskViewActions from "../actions/ui/taskview";
import * as TaskActions from "../actions/entities/task";
import * as TaskController from "../models/controllers/task";
import * as UserController from "../models/controllers/user";

import TaskUtils from "../utils/task-utils";
import AppConstants from "../constants";
import AppStyles from "../styles";

const styles = {
  listItem: {
    color: "black",
    fontSize: "95%",
    fontWeight: 500,
    wordWrap: "break-word"
  },
  createTaskListItem: {
    color: AppStyles.linkColor,
    fontSize: "110%",
    textAlign: "center"
  },
  listItemHeader: {
    color: "black",
    fontSize: "100%",
    fontWeight: "bold"
  },
  completedTask: {
    opacity: 0.3
    // TODO - strike through the task when completed
  },
  emptyListText: {
    margin: 30,
    fontSize: "140%"
  }
};

// TODO - look into alternate themes
const muiTheme = getMuiTheme({
  palette: {
    accent1Color: deepOrange500
  }
});

class MultiTaskPage extends Component {
  componentDidMount() {
    this.props.setNavbarTitle("Tasks");
    this.props.setMediumRightNavButton(AppConstants.CREATE_NAVBAR_BUTTON);
    this.props.setFarRightNavButton(AppConstants.SETTINGS_NAV_BUTTON);
  }

  componentWillUnmount() {
    this.props.removeMediumRightNavButton();
    this.props.removeFarRightNavButton();
  }

  componentWillReceiveProps(nextProps) {
    // consume any actions triggered via the Navbar
    if (nextProps.navAction === NavbarActions.CREATE_NAV_ACTION) {
      // remove before transition
      this.props.removeMediumRightNavButton();
      this.props.removeFarRightNavButton();

      this.props.setNavAction(undefined);
      hashHistory.push("/task/create");
    } else if (nextProps.navAction === NavbarActions.SETTINGS_NAV_ACTION) {
      // remove before transition
      this.props.removeMediumRightNavButton();
      this.props.removeFarRightNavButton();

      this.props.setNavAction(undefined);
      hashHistory.push("/settings");
    }

    if (nextProps.shouldRefreshTaskView) {
      this.forceUpdate(); // this triggers a refresh
      this.props.refreshTaskView(false); // set to false, after refresh
    }
  }

  // TODO - clean up this sloppy logic / indirection; should not need a function
  _viewIsCollapsed(view) {
    return this.props.taskCategories[view].isCollapsed;
  }

  _sortTasksByDateAndInsertHeaders(tasks) {
    // TODO - fix the hacky date logic in this method

    const today = new Date();
    const tomorrow = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );

    let todaysTasks = [];
    let tomorrowsTasks = [];
    let futureTasks = [];
    let overdueTasks = [];
    let tasksWithNoDate = [];

    for (let task of tasks) {
      const taskDate = task.dueDateTimeUtc
        ? new Date(task.dueDateTimeUtc)
        : null;

      if (!taskDate) {
        task.displayCategory = "No Date";
        tasksWithNoDate.push(task);
      } else if (taskDate.toDateString() === today.toDateString()) {
        task.displayCategory = "Today";
        todaysTasks.push(task);
      } else if (taskDate.toDateString() === tomorrow.toDateString()) {
        task.displayCategory = "Tomorrow";
        tomorrowsTasks.push(task);
      } else if (taskDate.getTime() > tomorrow.getTime()) {
        task.displayCategory = "Future";
        futureTasks.push(task);
      } else if (taskDate.getTime() < today.getTime()) {
        task.displayCategory = "Overdue";
        overdueTasks.push(task);
      } else {
        // TODO - what here?
      }
    }

    if (tasksWithNoDate.length > 0) {
      tasksWithNoDate.unshift({
        isHeader: true,
        name: "No Date"
      });
    }

    if (todaysTasks.length > 0) {
      todaysTasks.unshift({
        isHeader: true,
        name: "Today"
      });
    }

    if (tomorrowsTasks.length > 0) {
      tomorrowsTasks.unshift({
        isHeader: true,
        name: "Tomorrow"
      });
    }

    if (futureTasks.length > 0) {
      futureTasks.unshift({
        isHeader: true,
        name: "Future"
      });
    }

    if (overdueTasks.length > 0) {
      overdueTasks.unshift({
        isHeader: true,
        name: "Overdue"
      });
    }

    return tasksWithNoDate.concat(
      todaysTasks,
      tomorrowsTasks,
      futureTasks,
      overdueTasks
    );
  }

  _isHeaderCurrentlyCollapsed(category) {
    if (category === "No Date") {
      return this._viewIsCollapsed(TaskViewActions.TASKS_WITH_NO_DATE);
    } else if (category === "Today") {
      return this._viewIsCollapsed(TaskViewActions.TODAYS_TASKS);
    } else if (category === "Tomorrow") {
      return this._viewIsCollapsed(TaskViewActions.TOMORROWS_TASKS);
    } else if (category === "Future") {
      return this._viewIsCollapsed(TaskViewActions.FUTURE_TASKS);
    } else if (category === "Overdue") {
      return this._viewIsCollapsed(TaskViewActions.OVERDUE_TASKS);
    } else {
      return false; // TODO - what here?
    }
  }

  _renderRow(row) {
    try {
      return row.isHeader ? this._renderHeader(row) : this._renderTask(row);
    } catch (err) {
      console.log("err rendering row: " + err);
    }
  }

  _renderTask(task) {
    // only render if header is not collapsed
    if (!this._isHeaderCurrentlyCollapsed(task.displayCategory)) {
      let listItemStyle = task.isCompleted
        ? { ...styles.listItem, ...styles.completedTask }
        : styles.listItem;

      return (
        <ListItem
          style={listItemStyle}
          key={`task-list-item-${task.id}`}
          leftCheckbox={
            <Checkbox
              checked={task.isCompleted}
              onClick={event => {
                /*
                  We must use `onClick`, rather than `onCheck`, so that we can
                  stop event propagation. That means we do not have access to
                  the checked status, so we simply invert the task's current
                  completion status.
                */
                event.stopPropagation();

                let completionDateTimeUtc = new Date().getTime();

                task.isCompleted = !task.isCompleted;
                task.completionDateTimeUtc = completionDateTimeUtc;
                task.updatedAtDateTimeUtc = completionDateTimeUtc;

                let userId = this.props.profile.id;
                let pw = this.props.profile.password;

                if (!task.isCompleted && task.completionDateTimeUtc) {
                  // if the task is "unchecked", delete the completion time
                  task.completionDateTimeUtc = undefined;
                }

                /*
                  Update task locally, before checking network access. This is
                  because we will perform a local update regardless, and doing
                  so immediately is a much better user experience.
                */
                this._updateTaskLocally(task);

                if (UserController.canAccessNetwork(this.props.profile)) {
                  TaskController.updateTask(task, userId, pw).catch(error => {
                    if (error.name === "RetryableError") {
                      this._queueTaskUpdate(task);
                    } else {
                      this.setState({
                        updateError: error.message,
                        isUpdating: false
                      });
                    }
                  });
                } else {
                  this._queueTaskUpdate(task);
                }
              }}
            />
          }
          onClick={event => {
            // remove before transition
            this.props.removeMediumRightNavButton();
            this.props.removeFarRightNavButton();

            hashHistory.push(`/task/${task.id}`);
          }}
          primaryText={task.name}
        />
      );
    }

    return <div key={`empty-task-list-item-${task.id}`} />;
  }

  _queueTaskUpdate = task => {
    // task is queued only when network could not be reached
    this.props.addPendingTaskUpdate(task);
  };

  _updateTaskLocally = task => {
    this.props.createOrUpdateTask(task);
  };

  _renderHeader(header) {
    let listsArrowImage = this._isHeaderCurrentlyCollapsed(header.name)
      ? <FaChevronRight />
      : <FaChevronDown />;

    return (
      <ListItem
        innerDivStyle={styles.listItemHeader}
        key={`list-item-header-${header.name}`}
        leftIcon={listsArrowImage}
        primaryText={header.name}
        onTouchTap={() => {
          if (header.name === "No Date") {
            this.props.toggleTaskView(TaskViewActions.TASKS_WITH_NO_DATE);
          } else if (header.name === "Today") {
            this.props.toggleTaskView(TaskViewActions.TODAYS_TASKS);
          } else if (header.name === "Tomorrow") {
            this.props.toggleTaskView(TaskViewActions.TOMORROWS_TASKS);
          } else if (header.name === "Future") {
            this.props.toggleTaskView(TaskViewActions.FUTURE_TASKS);
          } else if (header.name === "Overdue") {
            this.props.toggleTaskView(TaskViewActions.OVERDUE_TASKS);
          }
        }}
      />
    );
  }

  _getTasksToDisplay() {
    let tasks = [];

    let showCompletedTasks =
      this.props.profile && this.props.profile.showCompletedTasks;

    for (let taskId in this.props.tasks) {
      let task = this.props.tasks[taskId];

      if (TaskUtils.shouldRenderTask(task, showCompletedTasks)) {
        tasks.push(task);
      }
    }

    return this._sortTasksByDateAndInsertHeaders(tasks);
  }

  _renderTasks() {
    let listItems = [];
    let tasksToDisplay = this._getTasksToDisplay();

    for (let task of tasksToDisplay) {
      listItems.push(this._renderRow(task));
    }

    // if no tasks exist, prompt user to create one
    if (!listItems.length) {
      listItems.push(
        <ListItem
          style={styles.createTaskListItem}
          key={"create-task-list-item"}
          onClick={event => {
            hashHistory.push("/task/create");
          }}
          primaryText={"Create Task"}
        />
      );
    }

    return (
      <List>
        {listItems}
      </List>
    );
  }

  render() {
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        {this._renderTasks()}
      </MuiThemeProvider>
    );
  }
}

const mapStateToProps = state => ({
  isLoggedIn: state.entities.user.isLoggedIn,
  profile: state.entities.user.profile,
  tasks: state.entities.task.tasks,
  navAction: state.ui.navbar.navAction,
  taskCategories: state.ui.taskview,
  shouldRefreshTaskView: state.ui.taskview.shouldRefreshTaskView
});

const mapDispatchToProps = {
  refreshTaskView: TaskViewActions.refreshTaskView,
  collapseTaskView: TaskViewActions.collapseCategory,
  showTaskView: TaskViewActions.showCategory,
  toggleTaskView: TaskViewActions.toggleCategory,
  setMediumRightNavButton: NavbarActions.setMediumRightNavButton,
  removeMediumRightNavButton: NavbarActions.removeMediumRightNavButton,
  setFarRightNavButton: NavbarActions.setFarRightNavButton,
  removeFarRightNavButton: NavbarActions.removeFarRightNavButton,
  createOrUpdateTask: TaskActions.createOrUpdateTask,
  addPendingTaskUpdate: TaskActions.addPendingTaskUpdate,
  setNavbarTitle: NavbarActions.setNavbarTitle,
  setNavAction: NavbarActions.setNavAction
};

export default connect(mapStateToProps, mapDispatchToProps)(MultiTaskPage);
