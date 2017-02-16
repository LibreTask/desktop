/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Link } from 'react-router';

import Divider from 'material-ui/Divider';

import AppConstants from '../constants';
import AppStyles from '../styles';

import * as NavbarActions from '../actions/navbar'

const shell = require('electron').shell;

const styles = {
  main: {
    margin: 12,
    color: '#000000',
  },
  dividerPadding: {
    paddingVertical: 5
  },
  button: {
    marginBottom: 20,
    marginTop: 20,
    marginLeft: 20,
    marginRight: 20,
    fontSize: '120%'
  },
  textField: {
    marginTop: 20,
    marginBottom: 10,
    fontSize: '120%'
  },
  linkText: {
    fontSize: '110%',
    color: AppStyles.linkColor
  }
};

class About extends Component {

  componentDidMount() {
    this.props.setNavbarTitle('About')
  }

  render() {

    return (
      <div style={styles.main}>

        <h3>Algernon</h3>

        <div style={styles.textField}>
          Organize your goals, track your progress, and have updates seamlessly sync across all of your devices.
        </div>

        <Divider />

        <p style={styles.linkText} onClick={() => {
          shell.openExternal(AppConstants.WEBSITE_LINK)
        }}>
          Website
        </p>

        <Divider />

        <p style={styles.linkText} onClick={() => {
          shell.openExternal(AppConstants.SOURCE_CODE_LINK)
        }}>
          Source Code
        </p>

        <Divider />

        <p style={styles.linkText} onClick={() => {
          shell.openExternal(AppConstants.PRODUCT_PRIVACY_LINK)
        }}>
          Privacy Policy
        </p>

        <Divider />

        <p style={styles.linkText} onClick={() => {
          shell.openExternal(AppConstants.PRODUCT_TERMS_LINK)
        }}>
          Terms of Service
        </p>

        <Divider />

      </div>
    );
  }
}

const mapStateToProps = (state) => ({ /* TODO */ });

const mapDispatchToProps = {
  setNavbarTitle: NavbarActions.setNavbarTitle
};

export default connect(mapStateToProps, mapDispatchToProps)(About);
