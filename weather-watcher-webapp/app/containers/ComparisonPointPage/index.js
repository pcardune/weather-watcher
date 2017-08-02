import {compose} from 'redux';
import {connect} from 'react-redux';
import convert from 'convert-units';
import moment from 'moment';
import React, {Component} from 'react';
import styled from 'styled-components';
import {subscribeProps} from 'redux-firebase-mirror';

import {ComparisonPointShape, ScoreConfigShape} from 'app/propTypes';
import {augmentedComparisonPointById} from 'app/containers/Database/subscriptions';
import {Card, CardHeader, CardBody} from 'app/components/Card';
import {
  InterpolatedGridForecast,
  InterpolatedScoreFunction,
} from 'app/containers/Database/scoring';
import ForecastTableHeader from 'app/components/ForecastTableHeader';
import LoadingBar from 'app/components/LoadingBar';
import Number from 'app/components/Number';
import {selectScoreConfig} from 'app/containers/Database/selectors';
import {getForecastDates} from 'app/utils/dates';
import {DesktopForecastRow, PhoneForecastRow} from 'app/components/ForecastRow';

const DescriptionList = styled.dl`
  margin: 0;
  dd,
  dt {
    display: inline;
  }
  dd {
    margin-left: 8px;
  }
`;

export class ComparisonPointPage extends Component {
  static propTypes = {
    comparisonPoint: ComparisonPointShape,
    scoreConfig: ScoreConfigShape,
  };

  static defaultProps = {
    comparisonPoint: null,
    scoreConfig: null,
  };

  render() {
    let {comparisonPoint} = this.props;

    if (!comparisonPoint) {
      return <LoadingBar />;
    }

    const scoreConfig = this.props.scoreConfig;
    const noaaGridForecast = this.props.comparisonPoint.noaaGridForecast;

    comparisonPoint = {
      ...comparisonPoint,
      interpolatedScore: new InterpolatedScoreFunction({
        interpolatedGridForecast: new InterpolatedGridForecast(
          noaaGridForecast
        ),
        scoreConfig,
      }),
    };

    return (
      <div className="container">
        <Card>
          <CardHeader title={comparisonPoint.name} />
          <CardBody>
            <div className="row">
              <div className="col s12">
                <DescriptionList>
                  <dt>Elevation:</dt>
                  <dd>
                    <Number
                      value={convert(
                        comparisonPoint.noaaGridForecast.properties.elevation
                          .value
                      )
                        .from('m')
                        .to('ft')}
                    />
                    ft.
                  </dd>
                </DescriptionList>
              </div>
            </div>
            <div className="row">
              <div className="col s12">
                <table>
                  <ForecastTableHeader />
                  <tbody>
                    {getForecastDates().map(date => [
                      <DesktopForecastRow
                        key={`${comparisonPoint.id}-desktop`}
                        point={comparisonPoint}
                        date={date}
                        getName={() => moment(date).format('dddd')}
                      />,
                      <PhoneForecastRow
                        key={`${comparisonPoint.id}-phone`}
                        point={comparisonPoint}
                        date={date}
                        getName={() => moment(date).format('dddd')}
                      />,
                    ])}
                  </tbody>
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
