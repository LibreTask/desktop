/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router";

import Divider from "material-ui/Divider";

import AppConstants from "../constants";
import AppStyles from "../styles";

import * as NavbarActions from "../actions/ui/navbar";

const shell = require("electron").shell;

const styles = {
  textField: {
    marginTop: 10,
    marginBottom: 10,
    fontSize: "100%"
  },
  titleText: {
    marginTop: 15,
    marginBottom: 5,
    fontWeight: "normal",
    fontSize: "105%"
  },
  linkText: {
    fontSize: "100%",
    color: AppStyles.linkColor,
    cursor: "pointer"
  }
};

class About extends Component {
  componentDidMount() {
    this.props.setNavbarTitle("About");
  }

  render() {
    return (
      <div style={AppStyles.mainWindow}>
        <div style={AppStyles.centeredWindow}>
          <div style={styles.titleText}>Algernon</div>

          <div style={styles.textField}>
            Organize your goals, track your progress, and have updates
            seamlessly sync across all of your devices.
          </div>

          <Divider />

          <p
            style={styles.linkText}
            onClick={() => {
              shell.openExternal(AppConstants.WEBSITE_LINK);
            }}
          >
            Website
          </p>

          <Divider />

          <p
            style={styles.linkText}
            onClick={() => {
              shell.openExternal(AppConstants.SOURCE_CODE_LINK);
            }}
          >
            Source Code
          </p>

          <Divider />

          <p
            style={styles.linkText}
            onClick={() => {
              shell.openExternal(AppConstants.PRODUCT_PRIVACY_LINK);
            }}
          >
            Privacy Policy
          </p>

          <Divider />

          <p
            style={styles.linkText}
            onClick={() => {
              shell.openExternal(AppConstants.PRODUCT_TERMS_LINK);
            }}
          >
            Terms of Service
          </p>

          <Divider />
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  /* TODO */
});

const mapDispatchToProps = {
  setNavbarTitle: NavbarActions.setNavbarTitle
};

export default connect(mapStateToProps, mapDispatchToProps)(About);
