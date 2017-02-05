/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Link } from 'react-router';

import RaisedButton from 'material-ui/RaisedButton';
import AppConstants from '../constants';

import * as NavbarActions from '../actions/navbar'

const shell = require('electron').shell;

const styles = {
  main: {
    margin: 12,
    color: '#000000',
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
};

class About extends Component {

  componentDidMount() {
    this.props.setNavbarTitle('About')
  }

  render() {

    return (
      <div style={styles.main}>

        <div style={styles.textField}>
          Seamlessly sync tasks across all devices.
        </div>

        <RaisedButton
          label="Terms"
          style={styles.button}
          onTouchTap={() => {
             // TODO - consider going manually via a-href
             shell.openExternal(AppConstants.PRODUCT_TERMS_LINK)
           }}
         />

        <RaisedButton
          label="Privacy"
          style={styles.button}
           onTouchTap={() => {
             // TODO - consider going manually via a-href
              shell.openExternal(AppConstants.PRODUCT_PRIVACY_LINK)
           }}
         />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({ });

const mapDispatchToProps = {
  setNavbarTitle: NavbarActions.setNavbarTitle
};

export default connect(mapStateToProps, mapDispatchToProps)(About);
