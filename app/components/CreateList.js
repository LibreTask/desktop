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
import * as ListActions from '../actions/entities/list'
import * as ListController from '../models/controllers/list'
import * as ListStorage from '../models/storage/list-storage'
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

class CreateList extends Component {

  constructor(props) {
    super(props)

    this.state = {
      createError: '',
      isCreatingList: false,
      currentName: '',
      nameValidationError: ''
    }
  }

  componentDidMount() {
    this.props.setNavbarTitle('Create List')
    this.props.setRightNavButton(AppConstants.BACK_NAVBAR_BUTTON)
  }

  _createList = () => {
    let name = this.state.currentName

    let nameValidationError = ''

    if (!Validator.isLength(name, {min: 2, max: 100})) {
      nameValidationError = 'Name must be between 2 and 100 characters'
    }

    if (nameValidationError) {
      this.setState({ nameValidationError: nameValidationError })

      return; // validation failed; cannot create list
    }

    if (UserController.canAccessNetwork(this.props.profile)) {
      this.setState({
        isCreatingList: true,
        nameValidationError: '',
        createError: ''
      }, () => {

        let userId = this.props.profile.id
        let pw = this.props.profile.password

        ListController.createList(name, userId, pw)
        .then( response => {

          let list = response.list

          ListStorage.createOrUpdateList(list)
          this.props.createOrUpdateList(list)

          // navigate to main on success
          hashHistory.replace(`/tasks/${list.id}`)
         })
         .catch( error => {

           if (error.name === 'NoConnection') {
             this._createListLocallyAndRedirect(name, userId)
           } else {
             this.setState({
               createError: error.message,
               isCreatingList: false
             })
           }
         })
      })
    } else {
      this._createListLocallyAndRedirect(name)
    }
  }

  _createListLocallyAndRedirect = (name, userId) => {
    // create list locally; user it not logged in or has no network connection
    let list = ListController.constructListLocally(name, userId)
    ListStorage.createOrUpdateList(list)
    this.props.createOrUpdateList(list)
    hashHistory.replace(`/tasks/${list.id}`)
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
          label="Create"
          style={styles.button}
           onTouchTap={this._createList}
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
  createOrUpdateList: ListActions.createOrUpdateList,
  setRightNavButton: NavbarActions.setRightNavButton,
  setNavbarTitle: NavbarActions.setNavbarTitle
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateList)
