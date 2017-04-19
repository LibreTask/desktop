/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

import React, { Component } from 'react'
import { hashHistory } from 'react-router'
import { connect } from 'react-redux'

import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'

import * as NavbarActions from '../actions/ui/navbar'
import * as UserActions from '../actions/entities/user'
import * as UserController from '../models/controllers/user'
import * as ProfileStorage from '../models/storage/profile-storage'

import AppConstants from '../constants'
import AppStyles from '../styles'
import Validator from 'validator'

const shell = require('electron').shell;

const styles = {
  input: {
    fontSize: '120%'
  },
  button: {
    width: 200,
    fontSize: '120%'
  },
  spacer: {
    marginTop: 10,
    marginBottom: 10
  },
  profileButtonLabel: {
    textTransform: 'none',
    fontSize: '100%'
  },
  errorText: {
    color: 'red'
  },
  successText: {
    color: 'green'
  },
}

class Profile extends Component {

  constructor(props) {
    super(props)

    this.state = {
      updateError: '',
      updateSuccess: '',
      isUpdatingProfile: false,
      currentEmail: this.props.profile.email,
      currentName: this.props.profile.name,
      deleteProfileDialogIsOpen: false,
      nameValidationError: '',
      emailValidationError: ''
    }
  }

  componentDidMount() {
    this.props.setMediumRightNavButton(AppConstants.SAVE_NAVBAR_BUTTON)
    this.props.setFarRightNavButton(AppConstants.DELETE_NAVBAR_BUTTON)
    this.props.setNavbarTitle('Profile')
  }

  componentWillUnmount() {
    this.props.removeMediumRightNavButton()
    this.props.removeFarRightNavButton()
  }

  componentWillReceiveProps(nextProps) {

    // consume any actions triggered via the Navbar
    if (nextProps.navAction === NavbarActions.SAVE_NAV_ACTION) {
      this._onProfileUpdate()
      this.props.setNavAction(undefined)
    } else if (nextProps.navAction === NavbarActions.DELETE_NAV_ACTION) {
      this.setState({deleteProfileDialogIsOpen: true })
      this.props.setNavAction(undefined)
    }
  }

  _onProfileUpdate = () => {
    let updatedName = this.state.currentName || ''
    let updatedEmail = this.state.currentEmail || ''

    let emailValidationError = ''
    let nameValidationError = ''

    if (!Validator.isEmail(updatedEmail)) {
      emailValidationError = 'Email is not valid'
    }

    if (!Validator.isLength(updatedName, {min: 0, max: 100})) {
      nameValidationError = 'Name must be between 0 and 100 characters'
    }

    if (emailValidationError || nameValidationError) {
      this.setState({
        emailValidationError: emailValidationError,
        nameValidationError: nameValidationError
      })

      return; // validation failed; cannot updated profile
    }

    let updatedProfile = Object.assign({}, this.props.profile, {
      name: updatedName,
      email: updatedEmail
    })

    this.setState({
      isUpdatingProfile: true,
      nameValidationError: '',
      emailValidationError: ''
    }, () => {
      UserController.updateProfile(updatedProfile)
      .then( response => {

        let profile = response.profile

         // TODO - handle PW in more secure way
         profile.password = this.props.profile.password

         this._updateProfileLocally(profile)
       })
       .catch( error => {

          if (error.name === 'NoConnection') {
            this._updateProfileLocally(updatedProfile)
          } else {
            this.setState({
              updateError: error.message,
              isUpdatingProfile: false
            })
          }
       })
    })
  }

  _updateProfileLocally = (profile) => {
    this.props.createOrUpdateProfile(profile)
    ProfileStorage.createOrUpdateProfile(profile)

    this.setState({
      isUpdatingProfile: false,
      updateSuccess: 'Successfully updated'
    }, () => {
      // erase update success text after 1.5 seconds
      setTimeout(() => this.setState({updateSuccess: ''}), 1500)
    })
  }

  /*
    Method invocation assumes an 'Are you sure?'
    dialog has been displayed.
  */
  _onProfileDelete = () => {

    // TODO - check network status

    this.setState({isUpdatingProfile: true}, () => {
      UserController.deleteProfile(this.props.profile)
      .then( response => {
         this._deleteProfileLocallyAndRedirect()
       })
       .catch( error => {

         if (error.name === 'NoConnection') {
           this._deleteProfileLocallyAndRedirect()
         } else {
           this.setState({
             updateError: error.message,
             isUpdatingProfile: false
           })
         }
       })
    })
  }

  _deleteProfileLocallyAndRedirect = () => {
    this.props.deleteProfile()
    ProfileStorage.deleteProfile()

    hashHistory.replace('/tasks') // navigate to main on deletion
  }

  _onAccountUpgrade = () => {
    hashHistory.replace('/premium-tour')
  }

  _onAccountDowngrade = () => {
    shell.openExternal(AppConstants.ACCOUNT_DOWNGRADE_LINK)
  }

  _accountStatusButton = () => {
    let accountStatusButton;

    if (this.props.profile
      && this.props.profile.currentPlan === 'premium') {
      accountStatusButton = (
        <RaisedButton
          style={{
            ...styles.button,
            ...AppStyles.centeredElement
          }}
          backgroundColor={AppStyles.buttonColor}
          labelStyle={styles.profileButtonLabel}
          label="Cancel Premium"
          onTouchTap={this._onAccountDowngrade}
         />
     )
    } else {
      accountStatusButton = (
        <RaisedButton
          style={{
            ...styles.button,
            ...AppStyles.centeredElement
          }}
          backgroundColor={AppStyles.buttonColor}
          labelStyle={styles.profileButtonLabel}
          label="Learn about Premium"
          onTouchTap={this._onAccountUpgrade}
         />
       )
    }

    return accountStatusButton
  }

  render = () => {

    const actions = [
      <FlatButton
        label="Cancel"
        onTouchTap={() => {
          this.setState({deleteProfileDialogIsOpen: false})
        }}
      />,
      <FlatButton
        label="Yes"
        onTouchTap={() => {
          this.setState({deleteProfileDialogIsOpen: false})
          this._onProfileDelete()
        }}
      />,
    ];

    return (
      <div style={AppStyles.mainWindow}>
        <div style={AppStyles.centeredWindow}>
          <Dialog
            style={AppStyles.dialog}
            title="Profile Deletion"
            actions={actions}
            modal={false}
            open={this.state.deleteProfileDialogIsOpen}
            onRequestClose={() => {
                this.setState({deleteProfileDialogIsOpen: false})
            }}
          >
            Are you sure you want to delete your profile?
          </Dialog>

          <TextField
            style={{
              ...styles.input,
              ...AppStyles.centeredElement
            }}
            hintText="Name"
            floatingLabelText="Name"
            errorText={this.state.nameValidationError}
            type="text"
            value={this.state.currentName}
            onChange={
              (event, name) => {
                this.setState({currentName: name})
              }
            }
          />

          <br/>

          <TextField
            style={{
              ...styles.input,
              ...AppStyles.centeredElement
            }}
            hintText="Email Field"
            floatingLabelText="Email"
            errorText={this.state.emailValidationError}
            type="email"
            value={this.state.currentEmail}
            onChange={
              (event, email) => {
                this.setState({currentEmail: email})
              }
            }
          />

          <div style={styles.spacer}/>

          {this._accountStatusButton()}

          <div style={styles.spacer}/>

          <div style={styles.errorText}>
            {this.state.updateError}
          </div>

          <div style={styles.successText}>
            {this.state.updateSuccess}
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  isLoggedIn: state.entities.user.isLoggedIn,
  profile: state.entities.user.profile,
  navAction: state.ui.navbar.navAction
})

const mapDispatchToProps = {
  createOrUpdateProfile: UserActions.createOrUpdateProfile,
  deleteProfile: UserActions.deleteProfile,
  setNavbarTitle: NavbarActions.setNavbarTitle,
  setNavbarTitle: NavbarActions.setNavbarTitle,
  setNavAction: NavbarActions.setNavAction,
  setMediumRightNavButton: NavbarActions.setMediumRightNavButton,
  removeMediumRightNavButton: NavbarActions.removeMediumRightNavButton,
  setFarRightNavButton: NavbarActions.setFarRightNavButton,
  removeFarRightNavButton: NavbarActions.removeFarRightNavButton,
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile)
