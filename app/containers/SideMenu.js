/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

import React, { PropTypes } from 'react';
import { hashHistory } from 'react-router';
import { connect } from 'react-redux'

const FaChevronRight = require('react-icons/lib/fa/chevron-right');
const FaChevronDown = require('react-icons/lib/fa/chevron-down');

import TitlePanel from './TitlePanel';

import * as SideMenuActions from '../actions/sidemenu'
import * as LoginDialogActions from '../actions/logindialog'
import * as LogoutDialogActions from '../actions/logoutdialog'

import AppStyles from '../styles'

const styles = {
  sidebar: {
    width: 256,
    height: '100%',
  },
  sidebarLink: {
    display: 'block',
    marginBottom: 15,
    marginTop: 15,
    color: 'black',
    fontSize: '140%',
  },
  content: {
    padding: '16px',
    minHeight: '100%',
    backgroundColor: 'white',
  },
  listsSubmenuItem: {
    marginTop: 15,
    marginBottom: 15,
    fontSize: '80%',
    fontWeight: 'normal'
  },
  listItems: {
    marginLeft: 20,
  },
  listsChevron: {
    marginRight: 10,
  }
};

function _constructListsDropdown(props) {
  let listsArrowImage =
      props.sideMenuListsViewIsCollapsed
      ? <FaChevronRight/>
      : <FaChevronDown/>;

    let listsMenuItems = [];

    if (!props.sideMenuListsViewIsCollapsed) {

      for (let listId in props.lists) {

        let list = props.lists[listId]

        listsMenuItems.push(
          <div
            key={`list-view-${list.id}`}
            style={styles.listsSubmenuItem}
            onClick={()=>{

              props.closeSideMenu();

              // navigate to tasks view for this list
              hashHistory.replace(`/tasks/${list.id}`);
            }}>
            <span className={'sideMenuItem'}>
              {list.name}
            </span>
          </div>
        );
      }

      listsMenuItems.push(
        <div
          key={'create-list-view'}
          style={{
            ...styles.listsSubmenuItem,
            ...{color: AppStyles.linkColor}
          }}
          onClick={()=>{
            props.closeSideMenu();
            hashHistory.push('/list/create');
          }}>

          <span className={'sideMenuItem'}>
            Create List
          </span>
        </div>
      );
    }

    return <div
      key={'lists-dropdown-view'}
      style={styles.sidebarLink}
      onClick={()=>props.toggleListsView()}>

      <span style={styles.listsChevron}>
        {listsArrowImage}
      </span>

      <span className={'sideMenuItem'}>
        Lists
      </span>

      <div style={styles.listItems}>
        {listsMenuItems}
      </div>
    </div>
}

const SideMenu = (props) => {
  const style = props.style
    ? {...styles.sidebar, ...props.style}
    : styles.sidebar;

  let sideMenuItems = [
    <div
      key={'all-tasks-view'}
      style={styles.sidebarLink}
      onClick={
      () =>  {
          props.closeSideMenu();
          hashHistory.replace('/');
      }
    }>

    <span className={'sideMenuItem'}>
      All Tasks
    </span>

    </div>,
  ];

  sideMenuItems = sideMenuItems.concat(_constructListsDropdown(props));

  sideMenuItems.push(
    <div
      key={'profile-view'}
      style={styles.sidebarLink}
      onClick={
      () =>  {

        if (props.isLoggedIn) {
          props.closeSideMenu();
          hashHistory.replace('/profile');
        } else {
          props.toggleLoginDialog();
        }
      }
    }>
      <span className={'sideMenuItem'}>
        Profile
      </span>
    </div>,
  );

  if (props.isLoggedIn) {
    sideMenuItems.push(
      <div
        key={'logout-view'}
        style={styles.sidebarLink}
        onClick={
        () =>  {
            props.toggleLogoutDialog();
        }
      }>
      <span className={'sideMenuItem'}>
        Logout
      </span>
      </div>
    )
  }

  sideMenuItems.push(
    <div
      key={'about-view'}
      style={styles.sidebarLink}
      onClick={
      () =>  {
          props.closeSideMenu();
          hashHistory.replace('/about');
      }
    }>
      <span className={'sideMenuItem'}>
        About
      </span>
    </div>
  );

  let welcomeText = "Hello!"
  if (props.isLoggedIn && props.profile && props.profile.name) {
    welcomeText = `Hello, ${props.profile.name}!`
  }

  return (
    <TitlePanel title={welcomeText} style={style}>
      <div style={styles.content}>
        {sideMenuItems}

        <style>
          { ".sideMenuItem:hover {color: " + AppStyles.hoverColor + "} " }
        </style>
      </div>
    </TitlePanel>
  );
};

SideMenu.propTypes = {
  style: PropTypes.object,
};

const mapStateToProps = (state) => ({
  sideMenuListsViewIsCollapsed: state.ui.sideMenu.isListsViewCollapsed,
  sideMenuIsOpen: state.ui.sideMenu.isOpen,
  loginDialogIsOpen: state.ui.logindialog.isOpen,
  logoutDialogIsOpen: state.ui.logoutdialog.isLopen,
  isLoggedIn: state.user.isLoggedIn,
  profile: state.user.profile,
  lists: state.entities.lists
});

const mapDispatchToProps = {
  toggleListsView: SideMenuActions.toggleListsView,
  toggleSideMenu: SideMenuActions.toggle,
  closeSideMenu: SideMenuActions.close,
  toggleLoginDialog: LoginDialogActions.toggle,
  closeLoginDialog: LoginDialogActions.close,
  toggleLogoutDialog: LogoutDialogActions.toggle,
  closeLogoutDialog: LogoutDialogActions.toggle,
};

export default connect(mapStateToProps, mapDispatchToProps)(SideMenu);
