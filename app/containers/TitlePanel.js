/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

import React, { PropTypes } from 'react'

import AppStyles from '../styles'

const styles = {
  root: {
    fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
    fontWeight: 300,
  },
  header: {
    backgroundColor: AppStyles.mainColor,
    color: 'white',
    padding: '16px',
    fontSize: '1.2em',
  },
}

const TitlePanel = (props) => {
  const rootStyle = props.style
    ? {...styles.root, ...props.style}
    : styles.root;

  return (
    <div style={rootStyle}>
      <div style={styles.header}>
        {props.title}

      </div>

      {props.children}
    </div>
  )
}

TitlePanel.propTypes = {
  style: PropTypes.object,
  title: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
  ]),
  children: PropTypes.object,
}

export default TitlePanel;
