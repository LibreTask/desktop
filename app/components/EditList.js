/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { hashHistory } from 'react-router'

import Dialog from 'material-ui/Dialog'
import TextField from 'material-ui/TextField'
import FlatButton from 'material-ui/FlatButton'

import * as NavbarActions from '../actions/navbar'
import * as ListActions from '../actions/entities/list'
import * as ListController from '../models/controllers/list'
import * as ListStorage from '../models/storage/list-storage'
import * as UserController from '../models/controllers/user'

import Validator from 'validator'

import AppConstants from '../constants'
import AppStyles from '../styles'

const styles = {
  main: {
    margin: 12,
    color: '#000000',
  },
  textField: {
    fontSize: '120%'
  },
  divider: {
    marginTop: 15,
    marginBottom: 15
  },
  errorText: {
    color: 'red'
  },
  successText: {
    color: 'green'
  }
}

class EditList extends Component {

  constructor(props) {
    super(props)

    this.state = {
      updateError: '',
      updateSuccess: '',
      deleteError: '',
      isUpdatingList: false,
      isDeletingList: false,
      deleteListDialogIsOpen: false,
      nameValidationError: '',

      // TODO - we keep these references in case props are updated
        // eg: when this exact task is deleted
        // but how can we do this cleaner?

      // copy objects, so that editing does not modify original
      editedList: Object.assign({}, this._getList())
    }
  }

  componentDidMount() {

    let list = this._getList()

    this.props.setLeftNavButton(AppConstants.BACK_NAVBAR_BUTTON)
    this.props.setMediumRightNavButton(AppConstants.EDIT_NAVBAR_BUTTON)
    this.props.setFarRightNavButton(AppConstants.DELETE_NAVBAR_BUTTON)
    this.props.setNavbarTitle('Edit List')
  }

  componentWillUnmount() {
    this.props.removeLeftNavButton()
    this.props.removeMediumRightNavButton()
    this.props.removeFarRightNavButton()
  }

  componentWillReceiveProps(nextProps) {

    // consume any actions triggered via the Navbar
    if (nextProps.navAction === NavbarActions.EDIT_NAV_ACTION) {
      this._editList()
      this.props.setNavAction(undefined)
    } else if (nextProps.navAction === NavbarActions.DELETE_NAV_ACTION) {
      this.setState({deleteListDialogIsOpen: true})
      this.props.setNavAction(undefined)
    }
  }

  _getList = () => {
    return this.props.lists[this.props.router.params.listId]
  }

  _editList = () => {
    let list = this.state.editedList

    let nameValidationError = ''

    if (!Validator.isLength(list.name, {min: 2, max: 100})) {
      nameValidationError = 'Name must be between 2 and 100 characters'
    }

    if (nameValidationError) {
      this.setState({ nameValidationError: nameValidationError })

      return; // validation failed; cannot create list
    }

    if (UserController.canAccessNetwork(this.props.profile)) {
      this.setState({
        isUpdatingList: true,
        updateError: '',
        updateSuccess: '',
        nameValidationError: ''
      }, () => {

        let userId = this.props.profile.id
        let pw = this.props.profile.password

        ListController.updateList(list, userId, pw)
        .then( response => {
          this._editListLocally(response.list)
         })
         .catch( error => {
             if (error.name === 'NoConnection') {
               this._editListLocally(list)
             } else {
               this.setState({
                 updateError: error.message,
                 isUpdatingList: false
               })
             }
         })
      })
    } else {
      this._editListLocally(list)
    }
  }

  _editListLocally = (list) => {
    ListStorage.createOrUpdateList(list)
    this.props.createOrUpdateList(list)

    this.setState({updateSuccess: 'Successfully updated'})

    // erase update success text after 1.5 seconds
    setTimeout(() => this.setState({updateSuccess: ''}), 1500)
  }

  /*
    Method invocation assumes an 'Are you sure?'
    dialog has been displayed.
  */
  _deleteList = () => {

    let listId = this.state.editedList.id

    if (UserController.canAccessNetwork(this.props.profile)) {
      this.setState({isDeletingList: true}, () => {

        let userId = this.props.profile.id
        let pw = this.props.profile.password

        ListController.deleteList(listId, userId, pw)
        .then( response => {
            this._deleteListLocallyAndRedirect(listId)
         })
         .catch( error => {

            if (error.name === 'NoConnection') {
              this._deleteListLocallyAndRedirect(listId)
            } else {
              this.setState({
                deleteError: error.message,
                isDeletingList: false
              })
            }
         })
      })
    } else {
      this._deleteListLocallyAndRedirect(listId)
    }
  }

  _deleteListLocallyAndRedirect = (listId) => {
    ListStorage.deleteListByListId(listId)
    this.props.deleteList(listId)
    hashHistory.replace(`/`) // navigate to main on deletion
  }

  render = () => {

    let list = this.state.editedList

    const actions = [
      <FlatButton
        label="Cancel"
        onTouchTap={() => {
          this.setState({deleteListDialogIsOpen: false})
        }}
      />,
      <FlatButton
        label="Yes"
        keyboardFocused={true}
        onTouchTap={() => {
          this.setState({deleteListDialogIsOpen: false})
          this._deleteList()
        }}
      />,
    ];

    return (
      <div style={styles.main}>
        <Dialog
          title="List Deletion"
          actions={actions}
          modal={false}
          open={this.state.deleteListDialogIsOpen}
          onRequestClose={() => {
              this.setState({deleteListDialogIsOpen: false})
          }}
        >
          Are you sure you want to delete this list?
        </Dialog>

        <h2> Name </h2>

        <TextField
          style={styles.TextField}
          errorText={this.state.nameValidationError}
          hintText="Name Field"
          floatingLabelText="Name"
          type="text"
          value={list.name}
          onChange={
            (event, name) => {

              // update our reference to list
              let list = this.state.editedList
              list.name = name

              this.setState({list: list})
            }
          }
        />

        <br/>

        <div style={styles.errorText}>
          {this.state.updateError}
        </div>

        <div style={styles.successText}>
          {this.state.updateSuccess}
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  isLoggedIn: state.user.isLoggedIn,
  profile: state.user.profile,
  lists: state.entities.lists,
  navAction: state.ui.navbar.navAction
})

const mapDispatchToProps = {
  createOrUpdateList: ListActions.createOrUpdateList,
  deleteList: ListActions.deleteList,
  setLeftNavButton: NavbarActions.setLeftNavButton,
  removeLeftNavButton: NavbarActions.removeLeftNavButton,
  setMediumRightNavButton: NavbarActions.setMediumRightNavButton,
  removeMediumRightNavButton: NavbarActions.removeMediumRightNavButton,
  setFarRightNavButton: NavbarActions.setFarRightNavButton,
  removeFarRightNavButton: NavbarActions.removeFarRightNavButton,
  setNavbarTitle: NavbarActions.setNavbarTitle,
  setNavAction: NavbarActions.setNavAction
}

export default connect(mapStateToProps, mapDispatchToProps)(EditList)
