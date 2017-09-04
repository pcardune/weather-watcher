/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 */

import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import styled from 'styled-components';
import {compose} from 'redux';
import {subscribeProps} from 'redux-firebase-mirror';
import {withRouter} from 'react-router';

import LoadingBar from 'app/components/LoadingBar';
import MultiDayForecastComparison from 'app/components/MultiDayForecastComparison';
import {AugmentedComparisonShape} from 'app/propTypes';
import Button from 'app/components/Button';
import {Card, CardHeader, CardBody} from 'app/components/Card';
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
      <div className="container">
        <div className="row">
          <div className="col s12">
            <Card>
              <CardHeader title="Daily Forecast Comparison">
                <Button
                  floating
                  accent
                  icon="settings"
                  className="halfway-fab"
                  disabled={
                    this.state.showAddForm || this.state.showCustomizeForm
                  }
                  onClick={this.toggleCustomize}
                />
                {/* <ButtonBar>
                    <Button
                    accent
                    disabled={
                    this.state.showAddForm || this.state.showCustomizeForm
                    }
                    onClick={this.onClickAddLocation}
                    >
                    Add Location
                    </Button>

                    </ButtonBar>*/}
              </CardHeader>
              {comparison.isLoading && <LoadingBar />}
              <AssignToRouterContext
                contextKey="title"
                value={comparison.name}
              />
              <AssignToRouterContext
                contextKey="description"
                value={`Find out what the weather is at ${comparison.name}`}
              />

              <CardBody>
                {(this.state.showAddForm || this.state.showCustomizeForm) &&
                  <div className="row">
                    <div className="col s12">
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
                    </div>
                  </div>}
                <div className="row">
                  <div className="col s12">
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
                  </div>
                </div>
              </CardBody>
            </Card>
            {hasPoints &&
              <Card>
                <CardHeader title="Weekly Score Comparison" />
                <CardBody>
                  <div className="row">
                    <div className="col s12">
                      <ComparisonChart
                        comparison={comparison}
                        date={this.props.date}
                        onClickDate={this.onChangeDate}
                      />
                    </div>
                  </div>
                </CardBody>
              </Card>}
          </div>
        </div>
      </div>
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
