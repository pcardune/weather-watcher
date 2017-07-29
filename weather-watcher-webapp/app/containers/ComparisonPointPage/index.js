import React, {Component, PropTypes} from 'react';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {subscribeProps} from 'redux-firebase-mirror';

import {ComparisonPointShape} from 'app/propTypes';
import {augmentedComparisonPointById} from 'app/containers/Database/subscriptions';
import {Card, CardHeader, CardBody} from 'app/components/Card';

export class ComparisonPointPage extends Component {
  static propTypes = {
    comparisonPoint: ComparisonPointShape,
  };

  render() {
    return (
      <Card>
        <CardHeader>
          <h1>
            {this.props.comparisonPoint.name}
          </h1>
        </CardHeader>
        <CardBody />
      </Card>
    );
  }
}

export default compose(
  connect(null, {}),
  subscribeProps({
    comparisonPoint: augmentedComparisonPointById,
  })
)(ComparisonPointPage);
