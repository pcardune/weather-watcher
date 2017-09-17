/*
 *
 * Database
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {createStructuredSelector} from 'reselect';
import makeSelectDatabase from './selectors';

export class Database extends React.PureComponent {
  // eslint-disable-line react/prefer-stateless-function
  render() {
    return <div />;
  }
}

Database.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  Database: makeSelectDatabase(),
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Database);
