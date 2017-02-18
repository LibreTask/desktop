/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

import React, { Component } from 'react'
import {hashHistory} from 'react-router'
import { connect } from 'react-redux'

import TitlePanel from './TitlePanel'
import SideMenu from './SideMenu'

import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'
import IconButton from 'material-ui/IconButton'
import FontIcon from 'material-ui/FontIcon'

// see complete list of icons: https://material.io/icons/
import ModeEdit from 'material-ui/svg-icons/editor/mode-edit'

import {deepOrange500} from 'material-ui/styles/colors'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'

import * as SideMenuActions from '../actions/sidemenu'
import * as LoginDialogActions from '../actions/logindialog'
import * as LogoutDialogActions from '../actions/logoutdialog'

import * as UserActions from '../actions/entities/user'
import * as TaskActions from '../actions/entities/task'
import * as ListActions from '../actions/entities/list'

import * as ProfileStorage from '../models/storage/profile-storage'

import * as SyncActions from '../actions/sync'

let Sidebar = require('react-sidebar').default;

import AppConstants from '../constants'

const muiTheme = getMuiTheme({
  palette: {
    accent1Color: deepOrange500,
  },
})

const styles = {
  contentHeaderMenuLink: {
    textDecoration: 'none',
    color: 'white',
    padding: 8,
  },
  content: {
    padding: '16px',
  },
  mediumIcon: {
    width: 40,
    height: 40,
  },
  mediumRightNavButton: {
    position: 'absolute',
    top: 0,
    right: 24,
    padding: '10px'
  },
  mediumRightBackButton: {
    position: 'absolute',
    top: 0,
    right: 24,
    padding: '10px',
  },
  mediumRightBackButtonLabel: {
    fontSize: '80%',
    fontWeight: 'bold',
  }
}

class App extends Component {
  props: {
    children: HTMLElement
  }

  constructor(props) {
    super(props)

    this.state = {
      docked: false,
      open: false,
      transitions: true,
      touch: true,
      shadow: true,
      pullRight: false,
      touchHandleWidth: 20,
      dragToggleDistance: 30,
    }
  }

  componentDidMount() {

    if (!this.props.isSyncing) {
      let intervalId = setInterval( () => {
        console.log("within setInterval.sync!")

        // TODO - also check for network
        if (this.props.isLoggedIn) {
          this.props.sync()
        }

      }, AppConstants.SYNC_INTERVAL_MILLIS)

      // register intervalId so we can cancel later
      this.props.startSync(intervalId)
    }
  }

  componentWillUnmount() {
    this.props.stopSync()
  }

  _onSetOpen = (open) => {
    this.props.toggleSideMenu()
  }

  _menuButtonClick = (ev) => {
    ev.preventDefault()
    this.props.toggleSideMenu()
  }

  render() {

    const sidebar = <SideMenu />;

    let navbutton;
    if (this.props.rightNavButton === AppConstants.LIST_EDIT_NAVBAR_BUTTON) {
      navbutton = <IconButton
        iconStyle={styles.mediumIcon}
        style={styles.mediumRightNavButton}
        onTouchTap={() => {
            hashHistory.push(this.props.rightNavTransitionLocation)
        }}>
          <ModeEdit/>
      </IconButton>
    } else if (this.props.rightNavButton === AppConstants.BACK_NAVBAR_BUTTON) {
      navbutton =  <FlatButton
              label="Back"
              hoverColor="transparent"
              style={styles.mediumRightBackButton}
              labelStyle={styles.mediumRightBackButtonLabel}
              onTouchTap={() => {
                hashHistory.goBack() // back button always goes back
              }}
            />
    }

    const contentHeader = (
      <span>
        {!this.state.docked &&
         <a onClick={this._menuButtonClick} href="#" style={styles.contentHeaderMenuLink}>=</a>}
        <span>
          {this.props.navbarTitle}
          {navbutton}
        </span>
      </span>
    )

    const sidebarProps = {
      sidebar: sidebar,
      docked: this.state.docked,
      sidebarClassName: 'custom-sidebar-class',
      open: this.props.sideMenuIsOpen,
      touch: this.state.touch,
      shadow: this.state.shadow,
      pullRight: this.state.pullRight,
      touchHandleWidth: this.state.touchHandleWidth,
      dragToggleDistance: this.state.dragToggleDistance,
      transitions: this.state.transitions,
      onSetOpen: this._onSetOpen,
    }

    const loginActions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={() => {
          this.props.closeLoginDialog()
          this.props.closeSideMenu()
        }}
      />,
      <FlatButton
        label="Signup"
        primary={true}
        keyboardFocused={true}
        onTouchTap={() => {
            this.props.closeLoginDialog()
            this.props.closeSideMenu()
            hashHistory.replace('/signup')
        }}
      />,
      <FlatButton
        label="Login"
        primary={true}
        keyboardFocused={true}
        onTouchTap={() => {
            this.props.closeLoginDialog()
            this.props.closeSideMenu()
            hashHistory.replace('/login')
        }}
      />,
    ];

    const logoutActions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={() => {
          this.props.closeLogoutDialog()
          this.props.closeSideMenu()
        }}
      />,
      <FlatButton
        label="Logout"
        primary={true}
        keyboardFocused={true}
        onTouchTap={() => {
            this.props.closeLogoutDialog()
            this.props.closeSideMenu()

            // remove profile and all entities
            this.props.deleteProfile()
            this.props.deleteAllTasks()
            this.props.deleteAllLists()
            ProfileStorage.logout()

            hashHistory.replace('/')
        }}
      />,
    ];

    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <Sidebar {...sidebarProps}>
          <TitlePanel
            title={contentHeader}
            >
            <div>
              <div>
                <Dialog
                  title="Login"
                  actions={loginActions}
                  modal={false}
                  open={this.props.loginDialogIsOpen}
                  onRequestClose={() => {
                    this.props.closeLoginDialog()
                  }}
                >
                  You must be logged in before you can completed this action.
                </Dialog>
                <Dialog
                  title="Logout"
                  actions={logoutActions}
                  modal={false}
                  open={this.props.logoutDialogIsOpen}
                  onRequestClose={() => {
                    this.props.closeLogoutDialog()
                  }}
                >
                  Do you really want to logout?
                </Dialog>
                </div>
              <div>
                {this.props.children}
              </div>
            </div>
          </TitlePanel>
        </Sidebar>
      </MuiThemeProvider>
    )
  }
}

const mapStateToProps = (state) => ({
  sideMenuIsOpen: state.ui.sideMenu.isOpen,
  loginDialogIsOpen: state.ui.logindialog.isOpen,
  logoutDialogIsOpen: state.ui.logoutdialog.isOpen,
  isLoggedIn: state.user.isLoggedIn,
  profile: state.user.profile,
  navbarTitle: state.ui.navbar.title,
  rightNavButton: state.ui.navbar.rightButton,
  rightNavTransitionLocation: state.ui.navbar.transitionLocation,
  isSyncing: state.sync.isSyncing
})

const mapDispatchToProps = {
  toggleSideMenu: SideMenuActions.toggle,
  closeSideMenu: SideMenuActions.close,
  toggleLoginDialog: LoginDialogActions.toggle,
  closeLoginDialog: LoginDialogActions.close,
  toggleLogoutDialog: LogoutDialogActions.toggle,
  closeLogoutDialog: LogoutDialogActions.toggle,
  deleteProfile: UserActions.deleteProfile,
  deleteAllLists: ListActions.deleteAllLists,
  deleteAllTasks: TaskActions.deleteAllTasks,
  startSync: SyncActions.startSync,
  stopSync: SyncActions.stopSync,
  sync: SyncActions.sync
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
