/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 */

import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import styled from 'styled-components';
import moment from 'moment-mini';
import {compose} from 'redux';
import {subscribeProps} from 'redux-firebase-mirror';

import {ButtonBar} from 'app/components/forms';
import MultiDayForecastComparison from 'app/components/MultiDayForecastComparison';
import {AugmentedComparisonShape} from 'app/propTypes';
import Button from 'app/components/Button';
import {Card, CardHeader, CardBody} from 'app/components/Card';
import AddComparisonPointForm from 'app/components/AddComparisonPointForm';
import CustomizeScoreForm from 'app/components/CustomizeScoreForm';
import DatePager from 'app/components/DatePager';
import InlineInput from 'app/components/InlineInput';
import {updateComparison} from 'app/containers/Database/actions';
import {augmentedComparisonById} from 'app/containers/Database/subscriptions';

import {addComparisonPoint, removeComparisonPoint} from './actions';

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
    comparison: AugmentedComparisonShape,
    onRemoveComparisonPoint: PropTypes.func.isRequired,
    onAddComparisonPoint: PropTypes.func.isRequired,
    onUpdateComparison: PropTypes.func.isRequired,
  };

  static defaultProps = {
    comparison: null,
  };

  state = {
    currentDate: moment(new Date()).startOf('date').toDate(),
    showAddForm: false,
    showCustomizeForm: false,
  };

  onChangeDate = currentDate => {
    this.setState({currentDate});
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

  onChangeComparisonName = name => {
    this.props.onUpdateComparison({...this.props.comparison, name});
  };

  onChangeScoreConfig = scoreConfig => {
    this.props.onUpdateComparison({...this.props.comparison, scoreConfig});
  };

  render() {
    if (!this.props.comparison) {
      return <div>loading...</div>;
    }
    const hasPoints = this.props.comparison.comparisonPoints.length > 0;
    return (
      <article>
        <DatePager
          onChange={this.onChangeDate}
          currentDate={this.state.currentDate}
        />
        <Card>
          <CardHeader>
            <h1>
              <InlineInput
                value={this.props.comparison.name}
                onChange={this.onChangeComparisonName}
              />
            </h1>
            <ButtonBar>
              <Button
                accent
                disabled={
                  this.state.showAddForm || this.state.showCustomizeForm
                }
                onClick={this.onClickAddLocation}
              >
                Add Location
              </Button>
              <Button
                accent
                disabled={
                  this.state.showAddForm || this.state.showCustomizeForm
                }
                onClick={this.toggleCustomize}
              >
                Customize
              </Button>
            </ButtonBar>
          </CardHeader>
          <CardBody>
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
                  scoreConfig={this.props.comparison.scoreConfig}
                  onChange={this.onChangeScoreConfig}
                />
              </InnerPane>}
            {hasPoints
              ? <MultiDayForecastComparison
                  date={this.state.currentDate}
                  comparison={this.props.comparison}
                  onRemoveComparisonPoint={this.onRemoveComparisonPoint}
                  onClickDate={this.onChangeDate}
                />
              : <HelpText>
                  Add a location to start comparing forecasts.
                </HelpText>}
          </CardBody>
        </Card>
      </article>
    );
  }
}

export default compose(
  connect(null, {
    onAddComparisonPoint: addComparisonPoint,
    onRemoveComparisonPoint: removeComparisonPoint,
    onUpdateComparison: updateComparison,
  }),
  subscribeProps({
    comparison: augmentedComparisonById,
  })
)(HomePage);
