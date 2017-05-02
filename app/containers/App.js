/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

import React, { Component } from 'react'
import {hashHistory} from 'react-router'
import { connect } from 'react-redux'

import TitlePanel from './TitlePanel'
import SideMenu from './SideMenu'

import IconMenu from 'material-ui/IconMenu'
import MenuItem from 'material-ui/MenuItem'
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'
import IconButton from 'material-ui/IconButton'
import FontIcon from 'material-ui/FontIcon'

// see complete list of icons: https://material.io/icons/fa
import Menu from 'material-ui/svg-icons/navigation/menu'

const FaArrowLeft = require('react-icons/lib/fa/arrow-left')
const FaFloppyO = require('react-icons/lib/fa/floppy-o')
const FaTrashO = require('react-icons/lib/fa/trash-o')
const FaEdit = require('react-icons/lib/fa/edit')
const FaPlus = require('react-icons/lib/fa/plus')

import {deepOrange500} from 'material-ui/styles/colors'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'

import * as SideMenuActions from '../actions/ui/sidemenu'
import * as NavbarActions from '../actions/ui/navbar'
import * as LoginDialogActions from '../actions/ui/logindialog'
import * as LogoutDialogActions from '../actions/ui/logoutdialog'
import * as TaskViewActions from '../actions/ui/taskview'

import * as UserActions from '../actions/entities/user'
import * as TaskActions from '../actions/entities/task'

import * as UserController from '../models/controllers/user'
import * as ProfileStorage from '../models/storage/profile-storage'

let Sidebar = require('react-sidebar').default;

import AppConstants from '../constants'
import AppStyles from '../styles'

const muiTheme = getMuiTheme({
  palette: {
    accent1Color: deepOrange500,
  },
})

const styles = {
  contentHeaderMenuButton: {
    textDecoration: 'none',
    paddingHorizontal: 10
  },
  leftNavButton: {
    width: 30,
    height: 30,
    display: 'inlineFlex',
    verticalAlign: 'middle',
    color: 'black'
  },
  navbarTitle: {
    paddingHorizontal: 10,
    display: 'inlineFlex',
    verticalAlign: 'middle',
    textAlign: 'center',
  },
  contentHeader: {
    width: '100%'
  },
  content: {
    padding: '16px',
  },
  mediumIcon: {
    width: 30,
    height: 30,
  },
  mediumRightNavButton: {
    position: 'absolute',
    top: 0,
    right: 60,
    padding: '10px'
  },
  farRightNavButton: {
    position: 'absolute',
    top: 0,
    right: 10,
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

  _startTaskSync = () => {
    if (!this.props.isSyncingTasks) {
      let intervalId = setInterval( () => {
          this.props.syncTasks()
      }, AppConstants.SYNC_INTERVAL_MILLIS)

      // register intervalId so we can cancel later
      this.props.startTaskSync(intervalId)
    }
  }

  _startProfileSync = () => {
    if (!this.props.isSyncingUser) {
      let intervalId = setInterval( () => {
        this.props.syncUser()
      }, AppConstants.SYNC_INTERVAL_MILLIS)

      // register intervalId so we can cancel later
      this.props.startUserSync(intervalId)
    }
  }

  _startSubmissionOfQueuedTasks = () => {
    if (!this.props.isSubmittingQueuedTasks) {
      let intervalId = setInterval( () => {
        this.props.submitQueuedTasks()
      }, AppConstants.QUEUED_TASK_SUBMISSION_INTERVAL_MILLIS)

      // register intervalId so we can cancel later
      this.props.startQueuedTaskSubmit(intervalId)
    }
  }

  _startTaskCleanup = () => {
    if (!this.props.isCleaningUpTasks) {
      let intervalId = setInterval( () => {
        this.props.cleanupTasks()
      }, AppConstants.TASK_CLEANUP_INTERVAL_MILLIS)

      // register intervalId so we can cancel later
      this.props.startTaskCleanup(intervalId)
    }
  }

  _startUIRefreshCheck = () => {
    setInterval(() => {
      /*
        This is intended to update the TaskView once per day, at midnight

        TODO - refine this approach

        TODO - will we have a stale reference to `this`
      */
      let date = (new Date()).getDate()

      if (date !== this.props.lastTaskViewRefreshDate) {
        this.props.refreshTaskView(true)
      }
    }, AppConstants.TASKVIEW_REFRESH_CHECK_INTERVAL_MILLIS)
  }

  componentDidMount() {
    this._startTaskSync()
    this._startProfileSync()
    this._startUIRefreshCheck()
    this._startSubmissionOfQueuedTasks()
    this._startTaskCleanup()
  }

  componentWillUnmount() {
    this.props.stopTaskSync()
    this.props.stopQueuedTaskSubmission()
    this.props.stopUserSync()
    this.props.stopTaskViewRefresh()
    this.props.stopTaskCleanup()
  }

  _onSetOpen = (open) => {
    this.props.toggleSideMenu()
  }

  _menuButtonClick = (ev) => {
    ev.preventDefault()
    this.props.toggleSideMenu()
  }

  _constructLeftNavButton() {
    let leftNavButton

    if (this.props.leftNavButton === AppConstants.BACK_NAVBAR_BUTTON) {
      leftNavButton = (
        <a
          onClick={() => {
            hashHistory.goBack() // back button always goes back
          }}
          href="#">
            <FaArrowLeft style={styles.leftNavButton}/>
        </a>
      )
    } else {
      leftNavButton = (
        <a
          onClick={this._menuButtonClick}
          href="#">
          <Menu style={styles.leftNavButton}/>
        </a>
      )
    }

    return leftNavButton
  }

  _constructMediumRightNavButton() {
    let mediumRightNavIcon
    let navbarAction

    if (this.props.mediumRightNavButton
      === AppConstants.EDIT_NAVBAR_BUTTON) {
      mediumRightNavIcon = <FaEdit/>
      navbarAction = NavbarActions.EDIT_NAV_ACTION
    } else if (this.props.mediumRightNavButton
      === AppConstants.DELETE_NAVBAR_BUTTON) {
        mediumRightNavIcon = <FaTrashO/>
        navbarAction = NavbarActions.DELETE_NAV_ACTION
    } else if (this.props.mediumRightNavButton
      === AppConstants.SAVE_NAVBAR_BUTTON) {
        mediumRightNavIcon = <FaFloppyO/>
        navbarAction = NavbarActions.SAVE_NAV_ACTION
    } else if (this.props.mediumRightNavButton
        === AppConstants.CREATE_NAVBAR_BUTTON) {
        mediumRightNavIcon = <FaPlus/>
        navbarAction = NavbarActions.CREATE_NAV_ACTION
    } else {
      return; // no navbutton set; return nothing
    }

    return (
      <IconButton
        iconStyle={styles.mediumIcon}
        style={styles.mediumRightNavButton}
        onTouchTap={() => {
            this.props.setNavAction(navbarAction)
        }}>
          {mediumRightNavIcon}
      </IconButton>
    )
  }

  _constructFarRightNavButton() {

    // TODO - move this component to its own module
    if (this.props.farRightNavButton === AppConstants.MULTITASK_NAV_DROPDOWN) {
      return (
        <IconMenu
          style={{
            ...styles.farRightNavButton,
            ...{padding: 0}
          }}
          iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
          anchorOrigin={{horizontal: 'right', vertical: 'top'}}
          targetOrigin={{horizontal: 'right', vertical: 'top'}}>
           <MenuItem
             style={{fontSize: '80%'}}
             checked={this.props.showCompletedTasks}
             primaryText="Show Completed"
             onTouchTap={() => {
               this.props.toggleShowCompletedTasks()
             }}/>
        </IconMenu>
      )
    }

    let farRightNavIcon
    let navbarAction

    if (this.props.farRightNavButton
      === AppConstants.EDIT_NAVBAR_BUTTON) {
      farRightNavIcon = <FaEdit/>
      navbarAction = NavbarActions.EDIT_NAV_ACTION
    } else if (this.props.farRightNavButton
      === AppConstants.DELETE_NAVBAR_BUTTON) {
        farRightNavIcon = <FaTrashO/>
        navbarAction = NavbarActions.DELETE_NAV_ACTION
    } else if (this.props.farRightNavButton
      === AppConstants.SAVE_NAVBAR_BUTTON) {
        farRightNavIcon = <FaFloppyO/>
        navbarAction = NavbarActions.SAVE_NAV_ACTION
    } else if (this.props.farRightNavButton
        === AppConstants.CREATE_NAVBAR_BUTTON) {
        farRightNavIcon = <FaPlus/>
        navbarAction = NavbarActions.CREATE_NAV_ACTION
    } else {
      return; // no navbutton set; return nothing
    }

    return (
      <IconButton
        iconStyle={styles.mediumIcon}
        style={styles.farRightNavButton}
        onTouchTap={() => {
            this.props.setNavAction(navbarAction)
        }}>
          {farRightNavIcon}
      </IconButton>
    )
  }

  render() {

    const sidebar = <SideMenu />;

    let mediumRightNavButton = this._constructMediumRightNavButton()
    let farRightNavButton = this._constructFarRightNavButton()

    let leftNavButton = this._constructLeftNavButton()

    // TODO - fix the hack of adding 3 "&nbsp;"
    const contentHeader = (
      <div style={styles.contentHeader}>
        <span style={styles.contentHeaderMenuButton}>
          {!this.state.docked && leftNavButton}
        </span>
        &nbsp;&nbsp;&nbsp;
        <span style={styles.navbarTitle}>
          {this.props.navbarTitle}
        </span>
        <span style={styles.contentHeaderMenuButton}>
          {mediumRightNavButton}
        </span>
        <span style={styles.contentHeaderMenuButton}>
          {farRightNavButton}
        </span>
      </div>
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
      styles: {
        marginTop: -53, // display sidebar content below nav/header

        // must be passed in with 'sidebar' as key
        // https://github.com/balloob/react-sidebar#styles
        sidebar: {
          overflowY: 'hidden' // disable scroll for sidebar
        }
      }
    }

    const loginActions = [
      <FlatButton
        label="Cancel"
        onTouchTap={() => {
          this.props.closeLoginDialog()
          this.props.closeSideMenu()
        }}
      />,
      <FlatButton
        label="Signup"
        onTouchTap={() => {
            this.props.closeLoginDialog()
            this.props.closeSideMenu()
            hashHistory.replace('/signup')
        }}
      />,
      <FlatButton
        label="Login"
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
        onTouchTap={() => {
          this.props.closeLogoutDialog()
          this.props.closeSideMenu()
        }}
      />,
      <FlatButton
        label="Logout"
        onTouchTap={() => {
            this.props.closeLogoutDialog()
            this.props.closeSideMenu()

            // remove profile and all entities
            this.props.deleteProfile()
            this.props.deleteAllTasks()
            ProfileStorage.logout()

            hashHistory.replace('/tasks')
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
                  style={AppStyles.dialog}
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
                  style={AppStyles.dialog}
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
  isLoggedIn: state.entities.user.isLoggedIn,
  profile: state.entities.user.profile,
  navbarTitle: state.ui.navbar.title,
  mediumRightNavButton: state.ui.navbar.mediumRightButton,
  farRightNavButton: state.ui.navbar.farRightButton,
  leftNavButton: state.ui.navbar.leftButton,
  mediumRightNavTransitionLocation:
    state.ui.navbar.mediumRightTransitionLocation,
  farRightNavTransitionLocation: state.ui.navbar.farRightTransitionLocation,
  isSyncingTasks: state.entities.task.isSyncingTasks,
  isSubmittingQueuedTasks: state.entities.task.isSubmittingQueuedTasks,
  isCleaningUpTasks: state.entities.task.isCleaningUpTasks,
  isSyncingUser: state.entities.user.isSyncing,
  showCompletedTasks: state.ui.taskview.showCompletedTasks,
  lastTaskViewRefreshDate: state.ui.taskview.lastTaskViewRefreshDate
})

const mapDispatchToProps = {
  toggleSideMenu: SideMenuActions.toggle,
  closeSideMenu: SideMenuActions.close,
  toggleLoginDialog: LoginDialogActions.toggle,
  closeLoginDialog: LoginDialogActions.close,
  toggleLogoutDialog: LogoutDialogActions.toggle,
  closeLogoutDialog: LogoutDialogActions.toggle,
  createOrUpdateProfile: UserActions.createOrUpdateProfile,
  deleteProfile: UserActions.deleteProfile,
  startUserSync: UserActions.startUserSync,
  stopUserSync: UserActions.stopUserSync,
  syncUser: UserActions.syncUser,
  deleteAllTasks: TaskActions.deleteAllTasks,
  startTaskSync: TaskActions.startTaskSync,
  stopTaskSync: TaskActions.stopTaskSync,
  syncTasks: TaskActions.syncTasks,
  cleanupTasks: TaskActions.cleanupTasks,
  startTaskCleanup: TaskActions.startTaskCleanup,
  stopTaskCleanup: TaskActions.stopTaskCleanup,
  submitQueuedTasks: TaskActions.submitQueuedTasks,
  startQueuedTaskSubmit: TaskActions.startQueuedTaskSubmit,
  stopQueuedTaskSubmission: TaskActions.stopQueuedTaskSubmission,
  setNavAction: NavbarActions.setNavAction,
  toggleShowCompletedTasks: TaskViewActions.toggleShowCompletedTasks,
  refreshTaskView: TaskViewActions.refreshTaskView,
  stopTaskViewRefresh: TaskViewActions.stopTaskViewRefresh
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
