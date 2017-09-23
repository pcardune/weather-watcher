/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import styled from 'styled-components';
import {compose} from 'redux';
import {subscribeProps} from 'redux-firebase-mirror';
import {withRouter} from 'react-router';
import {
  Icon,
  Card,
  CardHeader,
  CardContent,
  Grid,
  Button,
  AppBar,
  Toolbar,
  Typography,
  withStyles,
} from 'material-ui';

import LoadingBar from 'app/components/LoadingBar';
import PageBody from 'app/components/PageBody';
import MultiDayForecastComparison from 'app/components/MultiDayForecastComparison';
import {AugmentedComparisonShape} from 'app/propTypes';
import AddComparisonPointForm from 'app/components/AddComparisonPointForm';
import CustomizeScoreForm from 'app/components/CustomizeScoreForm';
import {augmentedComparisonById} from 'app/containers/Database/subscriptions';
import ComparisonChart from 'app/components/ComparisonChart';
import AssignToRouterContext from 'app/components/AssignToRouterContext';
import {
  getScoreConfigFromLocation,
  getDateFromLocation,
  getPathWithScoreConfigAndDate,
} from 'app/utils/url';
import {clampDateToForecastDates} from 'app/utils/dates';
import {
  addComparisonPoint,
  removeComparisonPoint,
} from 'app/containers/Database/actions';
import trackEvent from 'app/trackEvent';

const HelpText = styled.p`
  text-align: center;
  color: ${props => props.theme.colors.secondaryText};
  font-weight: 300;
  padding: 50px;
`;

const InnerPane = styled.div`
  padding: ${props => props.theme.padding.standard};
  border-bottom: 1px solid ${props => props.theme.colors.divider};
`;

@withStyles({
  title: {flex: 1},
  customizeButton: {position: 'relative', top: 30},
})
export class HomePage extends Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    comparison: AugmentedComparisonShape,
    onRemoveComparisonPoint: PropTypes.func.isRequired,
    onAddComparisonPoint: PropTypes.func.isRequired,
    date: PropTypes.instanceOf(Date).isRequired,
  };

  static defaultProps = {
    comparison: null,
  };

  state = {
    showAddForm: false,
    showCustomizeForm: false,
  };

  componentDidMount() {
    trackEvent('ViewContent', {
      content_type: 'comparison',
      content_ids: [this.props.comparison.id],
    });
  }

  onRemoveComparisonPoint = comparisonPointId => {
    this.props.onRemoveComparisonPoint(
      this.props.comparison,
      comparisonPointId
    );
  };

  toggleCustomize = () => {
    this.setState({showCustomizeForm: !this.state.showCustomizeForm});
  };

  onClickAddLocation = () => {
    this.setState({showAddForm: !this.state.showAddForm});
  };

  hideAddForm = () => {
    this.setState({showAddForm: false});
  };

  onAddComparisonPoint = args => {
    this.props.onAddComparisonPoint({
      ...args,
      comparisonId: this.props.comparison.id,
    });
    this.hideAddForm();
  };

  onChangeDate = date => {
    this.props.history.push(
      getPathWithScoreConfigAndDate(this.props.location, {date})
    );
  };

  onChangeScoreConfig = scoreConfig => {
    this.props.history.push(
      getPathWithScoreConfigAndDate(this.props.location, {scoreConfig})
    );
  };

  render() {
    const {comparison} = this.props;
    const hasPoints =
      !comparison.isLoading && comparison.comparisonPoints.length > 0;
    return (
      <PageBody>
        <Grid container spacing={24} direction="column">
          <Grid item>
            <Card>
              <Toolbar>
                <Typography
                  type="title"
                  color="inherit"
                  className={this.props.classes.title}
                >
                  Daily Forecast Comparison
                </Typography>
                <Button
                  fab
                  className={this.props.classes.customizeButton}
                  color="accent"
                  disabled={
                    this.state.showAddForm || this.state.showCustomizeForm
                  }
                  onClick={this.toggleCustomize}
                >
                  <Icon>settings</Icon>
                </Button>
              </Toolbar>
              {comparison.isLoading && <LoadingBar />}
              <AssignToRouterContext
                contextKey="title"
                value={comparison.name}
              />
              <AssignToRouterContext
                contextKey="description"
                value={`Find out what the weather is at ${comparison.name}`}
              />

              {(this.state.showAddForm || this.state.showCustomizeForm) &&
                <CardContent>
                  {this.state.showAddForm &&
                    <InnerPane>
                      <AddComparisonPointForm
                        onClose={this.hideAddForm}
                        onAdd={this.onAddComparisonPoint}
                      />
                    </InnerPane>}
                  {this.state.showCustomizeForm &&
                    <InnerPane>
                      <CustomizeScoreForm
                        onClose={this.toggleCustomize}
                        scoreConfig={comparison.scoreConfig}
                        onChange={this.onChangeScoreConfig}
                      />
                    </InnerPane>}
                </CardContent>}
              <CardContent>
                {hasPoints
                  ? <MultiDayForecastComparison
                      onChangeDate={this.onChangeDate}
                      date={this.props.date}
                      comparison={comparison}
                      onRemoveComparisonPoint={this.onRemoveComparisonPoint}
                    />
                  : <HelpText>
                      {comparison.isLoading
                        ? 'Loading...'
                        : 'Add a location to start comparing forecasts.'}
                    </HelpText>}
              </CardContent>
            </Card>
          </Grid>
          <Grid item>
            {hasPoints &&
              <Card>
                <CardHeader title="Weekly Score Comparison" />
                <CardContent>
                  <ComparisonChart
                    comparison={comparison}
                    date={this.props.date}
                    onClickDate={this.onChangeDate}
                  />
                </CardContent>
              </Card>}
          </Grid>
        </Grid>
      </PageBody>
    );
  }
}

export default compose(
  withRouter,
  connect(
    (state, {location}) => ({
      scoreConfig: getScoreConfigFromLocation(location),
      date: clampDateToForecastDates(getDateFromLocation(location)),
    }),
    {
      onAddComparisonPoint: addComparisonPoint,
      onRemoveComparisonPoint: removeComparisonPoint,
    }
  ),
  subscribeProps({
    comparison: augmentedComparisonById,
  })
)(HomePage);
