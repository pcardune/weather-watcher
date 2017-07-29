import _ from 'lodash';
import {compose} from 'redux';
import {connect} from 'react-redux';
import convert from 'convert-units';
import React, {Component, PropTypes} from 'react';
import styled from 'styled-components';
import {subscribeProps} from 'redux-firebase-mirror';

import {ComparisonPointShape} from 'app/propTypes';
import {augmentedComparisonPointById} from 'app/containers/Database/subscriptions';
import {Card, CardHeader, CardBody} from 'app/components/Card';

const ScrollingContainer = styled.div`
  max-height: 300px;
  overflow-y: scroll;
`;

export class ComparisonPointPage extends Component {
  static propTypes = {
    comparisonPoint: ComparisonPointShape,
  };

  render() {
    const comparisonPoint = this.props.comparisonPoint;
    const roundedElevationFeet = _.round(
      convert(comparisonPoint.noaaGridForecast.properties.elevation.value)
        .from('m')
        .to('ft')
    );
    return (
      <Card>
        <CardHeader>
          <h1>
            {comparisonPoint.name}
          </h1>
        </CardHeader>
        <CardBody>
          <div>{`${roundedElevationFeet} ft.`}</div>
          <ScrollingContainer>
            {comparisonPoint.noaaDailyForecast.properties.periods.map(period =>
              <div>
                <h4>
                  {period.name}
                </h4>
                <div>
                  <span>
                    {`${convert(period.temperature)
                      .from(period.temperatureUnit)
                      .to('F')} \u2109`}
                  </span>
                  <span>
                    {period.detailedForecast}
                  </span>
                </div>
              </div>
            )}
          </ScrollingContainer>
        </CardBody>
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
