/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

import React from 'react'
import { Route, IndexRedirect } from 'react-router'
import App from './containers/App'

import About from './components/About'
import CreateTask from './components/CreateTask'
import Login from './components/Login'
import MultiTaskPage from './components/MultiTaskPage'
import Profile from './components/Profile'
import Signup from './components/Signup'
import SingleTaskPage from './components/SingleTaskPage'

// TODO - look at more advanced routing:
  // https://github.com/ReactTraining/react-router

/*
Per the documentation...

We can pass params like

/foo/:fooId

And we can get params like

this.props.params.fooId

Additionally, parenthsis around arguments make them optional.
*/
export default (
  <Route path="/" component={App}>
    <IndexRedirect to="/tasks" />
    <Route path="/tasks" component={MultiTaskPage} />
    <Route path="/about" component={About} />
    <Route path="/task/create" component={CreateTask} />
    <Route path="/task/:taskId" component={SingleTaskPage} />
    <Route path="/login" component={Login} />
    <Route path="/profile" component={Profile} />
    <Route path="/signup" component={Signup} />
  </Route>
)
