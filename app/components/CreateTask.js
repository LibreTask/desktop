/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { hashHistory } from 'react-router'

import RaisedButton from 'material-ui/RaisedButton'
import TextField from 'material-ui/TextField'

import * as NavbarActions from '../actions/navbar'
import * as TaskActions from '../actions/entities/task'
import * as TaskController from '../models/controllers/task'
import * as TaskStorage from '../models/storage/task-storage'
import * as UserController from '../models/controllers/user'

import Validator from 'validator'

import AppConstants from '../constants'

const styles = {
  main: {
    margin: 12,
    color: '#000000',
  },
  button: {
    marginTop: 15,
  },
  errorText: {
    color: 'red'
  }
}

class CreateTask extends Component {

  constructor(props) {
    super(props)

    this.state = {
      createError: '',
      isCreatingTask: false,
      currentName: '',
      nameValidationError: ''
    }
  }

  componentDidMount() {
    this.props.setNavbarTitle('Create Task')
    this.props.setRightNavButton(AppConstants.BACK_NAVBAR_BUTTON)
  }

  _getListId = () => {
    return (this.props.router.params && this.props.router.params.listId)
      ? this.props.router.params.listId
      : AppConstants.ALL_TASKS_IDENTIFIER;
  }

  _createTask = () => {
    let name = this.state.currentName
    let listId = this._getListId()

    let nameValidationError = ''

    if (!Validator.isLength(name, {min: 2, max: 100})) {
      nameValidationError = 'Name must be between 2 and 100 characters'
    }

    if (nameValidationError) {
      this.setState({ nameValidationError: nameValidationError })

      return; // validation failed; cannot create list
    }

    if (listId == AppConstants.ALL_TASKS_IDENTIFIER) {
      // TODO - fix this
      throw "Cannot handle yet!";
    }

    if (UserController.canAccessNetwork(this.props.profile)) {
      this.setState({
        isCreatingTask: true,
        nameValidationError: '',
        createError: ''
      }, () => {

        let userId = this.props.profile.id
        let pw = this.props.profile.password

        TaskController.createTask(name, listId, userId, pw)
        .then( response => {

          let task = response.task
          task.isCompleted = false // initialize to false 

          TaskStorage.createOrUpdateTask(task)
          this.props.createOrUpdateTask(task)

          // navigate to main on success
          hashHistory.replace(`/tasks/${listId}`)
         })
         .catch( error => {

             if (error.name === 'NoConnection') {
               this._createTaskLocallyAndRedirect(name, listId)
             } else {
               this.setState({
                 createError: error.message,
                 isCreatingTask: false
               })
             }
         })
      })
    } else {
      this._createTaskLocallyAndRedirect(name, listId)
    }
  }

  _createTaskLocallyAndRedirect = (name, listId) => {
    // create task locally; user it not logged in or has no network connection
    let task = TaskController.constructTaskLocally(name, listId)
    TaskStorage.createOrUpdateTask(task)
    this.props.createOrUpdateTask(task)

    // navigate to main on success
    hashHistory.replace(`/tasks/${listId}`)
  }

  render = () => {
    return (
      <div style={styles.main}>

        <TextField
          errorText={this.state.nameValidationError}
          hintText="Name Field"
          floatingLabelText="Name"
          type="text"
          onChange={
            (event, name) => {
              this.setState({currentName: name})
            }
          }
        />

        <br/>

        <div style={styles.errorText}>
          {this.state.createError}
        </div>

        <br/>

        <RaisedButton
          style={styles.button}
          label="Create"
          onTouchTap={this._createTask}
         />
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  isLoggedIn: state.user.isLoggedIn,
  profile: state.user.profile
})

const mapDispatchToProps = {
  createOrUpdateTask: TaskActions.createOrUpdateTask,
  setNavbarTitle: NavbarActions.setNavbarTitle,
  setRightNavButton: NavbarActions.setRightNavButton,
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateTask)
