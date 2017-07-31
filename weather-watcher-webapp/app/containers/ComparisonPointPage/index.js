import _ from 'lodash';
import {compose} from 'redux';
import {connect} from 'react-redux';
import convert from 'convert-units';
import React, {Component, PropTypes} from 'react';
import styled from 'styled-components';
import {subscribeProps} from 'redux-firebase-mirror';
import Tooltip from 'rc-tooltip';

import {ComparisonPointShape, ScoreConfigShape} from 'app/propTypes';
import {augmentedComparisonPointById} from 'app/containers/Database/subscriptions';
import {Card, CardHeader, CardBody} from 'app/components/Card';
import {
  InterpolatedGridForecast,
  InterpolatedScoreFunction,
} from 'app/containers/Database/scoring';
import {
  getDailyForecastForPoint,
  ScoreComponentsDescription,
} from 'app/components/SingleDayForecastComparison';
import ForecastTableHeader from 'app/components/ForecastTableHeader';
import LoadingBar from 'app/components/LoadingBar';
import ScoreNumber from 'app/components/ScoreNumber';
import {selectScoreConfig} from 'app/containers/Database/selectors';

export class ComparisonPointPage extends Component {
  static propTypes = {
    comparisonPoint: ComparisonPointShape,
    scoreConfig: ScoreConfigShape,
  };

  render() {
    const comparisonPoint = this.props.comparisonPoint;

    if (!comparisonPoint) {
      return <LoadingBar />;
    }

    const scoreConfig = this.props.scoreConfig;
    const noaaGridForecast = this.props.comparisonPoint.noaaGridForecast;

    const roundedElevationFeet = _.round(
      convert(comparisonPoint.noaaGridForecast.properties.elevation.value)
        .from('m')
        .to('ft')
    );

    const interpolatedScore = new InterpolatedScoreFunction({
      interpolatedGridForecast: new InterpolatedGridForecast(noaaGridForecast),
      scoreConfig,
    });

    return (
      <div className="container">
        <Card>
          <CardHeader title={comparisonPoint.name} />
          <CardBody>
            <div className="row">
              <div className="col s12">
                {`Elevation: ${roundedElevationFeet} ft.`}
              </div>
            </div>
            <div className="row">
              <div className="col s12">
                <table>
                  <ForecastTableHeader />
                </table>
              </div>
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
