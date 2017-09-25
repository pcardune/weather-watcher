import {List} from 'immutable';
import {connect} from 'react-redux';
import moment from 'moment-mini';
import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {subscribeProps} from 'redux-firebase-mirror';
import {withRouter} from 'react-router';
import {Snackbar, Grid, Card, CardContent, Menu, MenuItem} from 'material-ui';

import firebase from 'app/firebaseApp';
import {ComparisonPointShape, ScoreConfigShape} from 'app/propTypes';
import {
  augmentedComparisonPointById,
  myComparisons,
} from 'app/containers/Database/subscriptions';
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
import ComparisonPickerDialog from 'app/components/ComparisonPickerDialog';
import CardBar from 'app/components/CardBar';
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

@withRouter
@connect((state, {location}) => ({
  scoreConfig: getScoreConfigFromLocation(location),
}))
@subscribeProps({
  comparisons: myComparisons,
  comparisonPoint: augmentedComparisonPointById,
})
export default class ComparisonPointPage extends PureComponent {
  static propTypes = {
    comparisonPoint: ComparisonPointShape,
    scoreConfig: ScoreConfigShape,
    comparisons: PropTypes.object,
  };

  static defaultProps = {
    comparisonPoint: null,
    scoreConfig: null,
    comparisons: List(),
  };

  state = {
    showAddToComparison: false,
    showSnackbar: false,
    snackbarMessage: '',
  };

  componentDidMount() {
    trackEvent('ViewContent', {
      content_type: 'comparisonPoint',
      content_ids: [this.props.comparisonPoint.id],
    });
  }

  onClickAddToComparison = () => this.setState({showAddToComparison: true});
  onRequestCloseAddToComparison = () =>
    this.setState({showAddToComparison: false});

  onRequestCloseSnackbar = () => this.setState({showSnackbar: false});

  onSelectComparison = comparison => {
    firebase
      .database()
      .ref(
        `comparisons/${comparison.id}/comparisonPointIds/${this.props
          .comparisonPoint.id}`
      )
      .set(this.props.comparisonPoint.id);
    this.setState({
      showSnackbar: true,
      snackbarMessage: `Added ${this.props.comparisonPoint
        .name} to ${comparison.name}`,
    });
  };

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

    const user = firebase.auth().currentUser;

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
            <CardBar
              title={comparisonPoint.name}
              menu={
                <Menu>
                  <MenuItem onClick={this.onClickAddToComparison}>
                    Add to Comparison
                  </MenuItem>
                </Menu>
              }
            >
              <ComparisonPickerDialog
                open={this.state.showAddToComparison}
                onRequestClose={this.onRequestCloseAddToComparison}
                comparisons={this.props.comparisons
                  .valueSeq()
                  .toArray()
                  .filter(c => user && c.creator === user.uid)}
                title="Add to Comparison"
                onSelect={this.onSelectComparison}
              />
              <Snackbar
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                open={this.state.showSnackbar}
                autoHideDuration={6000}
                onRequestClose={this.onRequestCloseSnackbar}
                message={this.state.snackbarMessage}
              />
            </CardBar>
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
