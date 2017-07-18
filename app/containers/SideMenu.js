/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

import React, { PropTypes } from "react";
import { hashHistory } from "react-router";
import { connect } from "react-redux";

const FaChevronRight = require("react-icons/lib/fa/chevron-right");
const FaChevronDown = require("react-icons/lib/fa/chevron-down");

import TitlePanel from "./TitlePanel";

import * as SideMenuActions from "../actions/ui/sidemenu";
import * as LoginDialogActions from "../actions/ui/logindialog";
import * as LogoutDialogActions from "../actions/ui/logoutdialog";

import AppStyles from "../styles";

const styles = {
  sidebar: {
    width: 220,
    height: "100%",
    top: 0,

    // sidemenu should take precedence over everything, except dialogs
    zIndex: 10000
  },
  sidebarLink: {
    display: "block",
    padding: 16,
    width: "100%",
    color: "black",
    fontSize: "140%",
    cursor: "pointer"
  },
  sidebarLinkSelected: {
    display: "block",
    padding: 16,
    width: "100%",
    color: "black",
    fontSize: "140%",
    cursor: "pointer",
    backgroundColor: AppStyles.selectedSidebarLinkColor
  },
  content: {
    marginTop: 50,
    paddingTop: 16,
    minHeight: "100%",
    backgroundColor: "white"
  }
};

function _linkStyle(links) {
  let currentLink = hashHistory.getCurrentLocation().pathname;
  return links.indexOf(currentLink) >= 0
    ? styles.sidebarLinkSelected
    : styles.sidebarLink;
}

const SideMenu = props => {
  const style = props.style
    ? { ...styles.sidebar, ...props.style }
    : styles.sidebar;

  let sideMenuItems = [
    <div
      key={"all-tasks-view"}
      style={_linkStyle(["/tasks"])}
      onClick={() => {
        props.closeSideMenu();
        hashHistory.replace("/tasks");
      }}
    >
      <span className={"sideMenuItem"}>Tasks</span>
    </div>
  ];

  sideMenuItems.push(
    <div
      key={"profile-view"}
      style={_linkStyle(["/profile", "/login", "/signup"])}
      onClick={() => {
        if (props.isLoggedIn) {
          props.closeSideMenu();
          hashHistory.push("/profile");
        } else {
          props.toggleLoginDialog();
        }
      }}
    >
      <span className={"sideMenuItem"}>Profile</span>
    </div>
  );

  if (props.isLoggedIn) {
    sideMenuItems.push(
      <div
        key={"logout-view"}
        style={styles.sidebarLink}
        onClick={() => {
          props.toggleLogoutDialog();
        }}
      >
        <span className={"sideMenuItem"}>Logout</span>
      </div>
    );
  }

  sideMenuItems.push(
    <div
      key={"about-view"}
      style={_linkStyle(["/about"])}
      onClick={() => {
        props.closeSideMenu();
        hashHistory.replace("/about");
      }}
    >
      <span className={"sideMenuItem"}>About</span>
    </div>
  );

  let welcomeText =
    ""; /*= "Hello!"
  if (props.isLoggedIn && props.profile && props.profile.name) {
    welcomeText = `Hello, ${props.profile.name}!`
  }
  */

  return (
    <TitlePanel title={welcomeText} style={style}>
      <div style={styles.content}>
        {sideMenuItems}

        {/* hack to enable hover CSS */}
        <style>
          {`.sideMenuItem:hover {
              color: ${AppStyles.hoverColor}
             }

             .sideMenuItem {
               font-weight: lighter
             }
          `}
        </style>
      </div>
    </TitlePanel>
  );
};

SideMenu.propTypes = {
  style: PropTypes.object
};

const mapStateToProps = state => ({
  sideMenuIsOpen: state.ui.sideMenu.isOpen,
  loginDialogIsOpen: state.ui.logindialog.isOpen,
  logoutDialogIsOpen: state.ui.logoutdialog.isLopen,
  isLoggedIn: state.entities.user.isLoggedIn,
  profile: state.entities.user.profile
});

const mapDispatchToProps = {
  toggleSideMenu: SideMenuActions.toggle,
  closeSideMenu: SideMenuActions.close,
  toggleLoginDialog: LoginDialogActions.toggle,
  closeLoginDialog: LoginDialogActions.close,
  toggleLogoutDialog: LogoutDialogActions.toggle,
  closeLogoutDialog: LogoutDialogActions.toggle
};

export default connect(mapStateToProps, mapDispatchToProps)(SideMenu);
