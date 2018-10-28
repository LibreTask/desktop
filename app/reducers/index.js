/*
 * @link https://libretask.org/
 * @license https://github.com/LibreTask/desktop/blob/master/LICENSE.md
 */

import { combineReducers } from "redux";
import { routerReducer as routing } from "react-router-redux";

import sideMenu from "./ui/sidemenu";
import navbar from "./ui/navbar";
import logindialog from "./ui/logindialog";
import logoutdialog from "./ui/logoutdialog";
import updatedialog from "./ui/updatedialog";
import taskview from "./ui/taskview";

import userReducer from "./entities/user";
import taskReducer from "./entities/task";

const uiReducer = combineReducers({
  logindialog,
  logoutdialog,
  updatedialog,
  sideMenu,
  navbar,
  taskview
});

const entitiesReducer = combineReducers({
  task: taskReducer,
  user: userReducer
});

const appReducer = combineReducers({
  ui: uiReducer,
  entities: entitiesReducer,
  routing
});

const rootReducer = (state, action) => {
  if (action.type === "RESET") {
    state = undefined;
  }

  return appReducer(state, action);
};

export default rootReducer;
