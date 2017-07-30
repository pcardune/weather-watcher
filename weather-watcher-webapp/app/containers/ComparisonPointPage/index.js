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
import LoadingBar from 'app/components/LoadingBar';
import {selectScoreConfig} from 'app/containers/Database/selectors';

const ForecastPeriodHeader = styled.div`
  margin-bottom: 0px;
  font-weight: bold;
`;

export class ComparisonPointPage extends Component {
  static propTypes = {
    comparisonPoint: ComparisonPointShape,
  };

  render() {
    const comparisonPoint = this.props.comparisonPoint;

    if (!comparisonPoint) {
      return <LoadingBar />;
    }

    const roundedElevationFeet = _.round(
      convert(comparisonPoint.noaaGridForecast.properties.elevation.value)
        .from('m')
        .to('ft')
    );
    return (
      <div className="container">
        <Card>
          <CardHeader>
            <h1>
              {comparisonPoint.name}
            </h1>
          </CardHeader>
          <CardBody>
            <div className="row">
              <div className="col s12">
                {`Elevation: ${roundedElevationFeet} ft.`}
              </div>
            </div>
            <div>
              {comparisonPoint.noaaDailyForecast.properties.periods.map(
                period =>
                  <div key={period.name}>
                    <ForecastPeriodHeader className="row">
                      <div className="col s12">
                        {period.name}
                      </div>
                    </ForecastPeriodHeader>
                    <div className="row">
                      <div className="col s1">
                        {`${convert(period.temperature)
                          .from(period.temperatureUnit)
                          .to('F')} \u2109`}
                      </div>
                      <div className="col s11">
                        {period.detailedForecast}
                      </div>
                    </div>
                  </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }
}

export default compose(
  connect(
    state => ({
      scoreConfig: selectScoreConfig(state),
    }),
    {}
  ),
  subscribeProps({
    comparisonPoint: augmentedComparisonPointById,
  })
)(ComparisonPointPage);
