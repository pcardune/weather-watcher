import {compose} from 'redux';
import {connect} from 'react-redux';
import moment from 'moment-mini';
import React, {PureComponent} from 'react';
import styled from 'styled-components';
import {subscribeProps} from 'redux-firebase-mirror';
import {withRouter} from 'react-router';
import {Grid, Card, CardHeader, CardContent} from 'material-ui';

import {ComparisonPointShape, ScoreConfigShape} from 'app/propTypes';
import {augmentedComparisonPointById} from 'app/containers/Database/subscriptions';
import {
  InterpolatedGridForecast,
  InterpolatedScoreFunction,
} from 'app/containers/Database/scoring';
import ForecastTableHeader from 'app/components/ForecastTableHeader';
import Number from 'app/components/Number';
import {getForecastDates} from 'app/utils/dates';
import ForecastRow from 'app/components/ForecastRow';
import {getScoreConfigFromLocation} from 'app/utils/url';
import AssignToRouterContext from 'app/components/AssignToRouterContext';
import LoadingBar from 'app/components/LoadingBar';
import WeatherAlertList from 'app/components/WeatherAlertList';
import trackEvent from 'app/trackEvent';

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

export class ComparisonPointPage extends PureComponent {
  static propTypes = {
    comparisonPoint: ComparisonPointShape,
    scoreConfig: ScoreConfigShape,
  };

  static defaultProps = {
    comparisonPoint: null,
    scoreConfig: null,
  };

  componentDidMount() {
    trackEvent('ViewContent', {
      content_type: 'comparisonPoint',
      content_ids: [this.props.comparisonPoint.id],
    });
  }

  render() {
    let {comparisonPoint} = this.props;

    if (comparisonPoint.isLoading || comparisonPoint.isLoadingForecast) {
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

    const currentAlerts = comparisonPoint.alerts.filter(
      alert => alert && new Date(alert.properties.expires) >= new Date()
    );

    const expiredAlerts = comparisonPoint.alerts.filter(
      alert => alert && new Date(alert.properties.expires) < new Date()
    );

    return (
      <Grid container>
        <Grid item xs={2} hidden={{smDown: true}} />
        <Grid item xs={12} md={8}>
          <AssignToRouterContext
            contextKey="title"
            value={comparisonPoint.name}
          />
          <AssignToRouterContext
            contextKey="description"
            value={`Find out what the weather is at ${comparisonPoint.name}`}
          />
          <Card>
            <CardHeader title={comparisonPoint.name} />
            <CardContent>
              <WeatherAlertList alerts={currentAlerts} />
              <DescriptionList>
                <dt>Elevation:</dt>
                <dd>
                  <Number
                    value={
                      comparisonPoint.noaaGridForecast &&
                      comparisonPoint.noaaGridForecast.properties.elevation
                        .value
                    }
                    from="m"
                    to="ft"
                  />
                  ft.
                </dd>
              </DescriptionList>
            </CardContent>
            <CardContent>
              <table>
                <ForecastTableHeader />
                <tbody>
                  {getForecastDates().map(date =>
                    <ForecastRow
                      key={`${comparisonPoint.id}-${date.getTime()}`}
                      point={comparisonPoint}
                      date={date}
                      getName={() => moment(date).format('dddd')}
                    />
                  )}
                </tbody>
              </table>
            </CardContent>
            <CardContent>
              <a
                target="_blank"
                href={`http://forecast.weather.gov/MapClick.php?lon=${comparisonPoint.longitude}&lat=${comparisonPoint.latitude}`}
              >
                Forecast information from NOAA
              </a>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  }
}

export default compose(
  withRouter,
  connect((state, {location}) => ({
    scoreConfig: getScoreConfigFromLocation(location),
  })),
  subscribeProps({
    comparisonPoint: augmentedComparisonPointById,
  })
)(ComparisonPointPage);
