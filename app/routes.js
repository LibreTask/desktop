/*
 * @link https://libretask.org/
 * @license https://github.com/LibreTask/desktop/blob/master/LICENSE.md
 */

import React from "react";
import { Route, IndexRedirect } from "react-router";
import App from "./containers/App";

import About from "./components/About";
import Settings from "./components/Settings";
import CreateTask from "./components/CreateTask";
import Login from "./components/Login";
import MultiTaskPage from "./components/MultiTaskPage";
import Profile from "./components/Profile";
import Signup from "./components/Signup";
import SingleTaskPage from "./components/SingleTaskPage";

export default (
  <Route path="/" component={App}>
    <IndexRedirect to="/tasks" />
    <Route path="/tasks" component={MultiTaskPage} />
    <Route path="/about" component={About} />
    <Route path="/settings" component={Settings} />
    <Route path="/task/create" component={CreateTask} />
    <Route path="/task/:taskId" component={SingleTaskPage} />
    <Route path="/login" component={Login} />
    <Route path="/profile" component={Profile} />
    <Route path="/signup" component={Signup} />
  </Route>
);
