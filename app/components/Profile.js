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

import * as NavbarActions from '../actions/navbar'
import * as UserActions from '../actions/entities/user'
import * as UserController from '../models/controllers/user'
import * as ProfileStorage from '../models/storage/profile-storage'

import AppConstants from '../constants'
import AppStyles from '../styles'
import Validator from 'validator'

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
  }
}

class Profile extends Component {

  constructor(props) {
    super(props)

    this.state = {
      updateError: '',
      isUpdatingProfile: false,
      currentEmail: this.props.profile.email,
      currentName: this.props.profile.name,
      deleteProfileDialogIsOpen: false,
      nameValidationError: '',
      emailValidationError: ''
    }
  }

  componentDidMount() {
    this.props.setNavbarTitle('Profile')
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

         this.props.createOrUpdateProfile(profile)
         ProfileStorage.createOrUpdateProfile(profile)

         // TODO - toast success

         this.setState({isUpdatingProfile: false})

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

  _deleteProfileocallyAndRedirect = () => {
    this.props.deleteProfile()
    ProfileStorage.deleteProfile()

    hashHistory.replace('/') // navigate to main on deletion
  }

  _onAccountUpgrade = () => {
    let profile = this.props.profile

    UserController.upgradeAccount(profile)
    .then( response => {

      profile.currentPlan = 'premium'

      this.props.createOrUpdateProfile(profile)
      ProfileStorage.createOrUpdateProfile(profile)
     })
     .catch( error => {

         // TODO - properly set `loginError`

         this.setState({
           updateError: 'An error occurred',
           isUpdatingProfile: false
         })
     })
  }

  _onAccountDowngrade = () => {

    let profile = this.props.profile

    UserController.downgradeAccount(profile)
    .then( response => {

      profile.currentPlan = 'basic'

      this.props.createOrUpdateProfile(profile)
      ProfileStorage.createOrUpdateProfile(profile)
     })
     .catch( error => {

         // TODO - properly set `loginError`

         this.setState({
           updateError: 'An error occurred',
           isUpdatingProfile: false
         })
     })
  }

  _accountStatusButton = () => {
    let accountStatusButton;

    if (this.props.profile.currentPlan === 'premium') {
      accountStatusButton = (
        <RaisedButton
          style={{
            ...styles.button,
            ...AppStyles.centeredElement
          }}
          labelColor={AppStyles.linkColor}
          label="Downgrade"
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
          labelColor={AppStyles.linkColor}
          label="Upgrade"
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
            hintText="Name Field"
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

          <div>
            <RaisedButton
              style={{
                ...styles.button,
                ...AppStyles.centeredElement
              }}
              labelColor={AppStyles.linkColor}
              label="Update"
              onTouchTap={this._onProfileUpdate}
             />

             <div style={styles.spacer}/>

             <RaisedButton
               style={{
                 ...styles.button,
                 ...AppStyles.centeredElement
               }}
               labelColor={AppStyles.linkColor}
               label="Delete"
               onTouchTap={()=>{
                 this.setState({deleteProfileDialogIsOpen: true })
               }}
              />

              <div style={styles.spacer}/>

              {this._accountStatusButton()}
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  isLoggedIn: state.user.isLoggedIn,
  profile: state.user.profile
})

const mapDispatchToProps = {
  createOrUpdateProfile: UserActions.createOrUpdateProfile,
  deleteProfile: UserActions.deleteProfile,
  setNavbarTitle: NavbarActions.setNavbarTitle,
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile)
