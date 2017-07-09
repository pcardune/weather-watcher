/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 */

import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import styled from 'styled-components';
import moment from 'moment-mini';

import {ButtonBar} from 'app/components/forms';
import MultiDayForecastComparison
  from 'app/components/MultiDayForecastComparison';
import {AugmentedComparisonShape} from 'app/propTypes';
import Button from 'app/components/Button';
import {Card, CardHeader, CardBody} from 'app/components/Card';
import AddComparisonPointForm from 'app/components/AddComparisonPointForm';
import DatePager from 'app/components/DatePager';
import InlineInput from 'app/components/InlineInput';
import {updateComparison} from 'app/containers/Database/actions';
import {makeSelectAugmentedComparison} from 'app/containers/Database/selectors';

import {
  addComparisonPoint,
  removeComparisonPoint,
  refreshComparison,
} from './actions';

const HelpText = styled.p`
  text-align: center;
  color: ${props => props.theme.colors.secondaryText};
  font-weight: 300;
  padding: 50px;
`;

const AddFormWrapper = styled.div`
  padding: ${props => props.theme.padding.standard};
  border-bottom: 1px solid ${props => props.theme.colors.divider};
`;

export class HomePage extends Component {
  static propTypes = {
    comparison: AugmentedComparisonShape.isRequired,
    onRefreshComparison: PropTypes.func.isRequired,
    onRemoveComparisonPoint: PropTypes.func.isRequired,
    onAddComparisonPoint: PropTypes.func.isRequired,
    onUpdateComparsion: PropTypes.func.isRequired,
  };

  state = {
    currentDate: moment(new Date()).startOf('date').toDate(),
    showAddForm: false,
  };

  componentDidMount() {
    this.props.onRefreshComparison(this.props.comparison);
  }

  componentDidUpdate(oldProps) {
    if (oldProps.comparison.id !== this.props.comparison.id) {
      this.props.onRefreshComparison(this.props.comparison);
    }
  }

  onChangeDate = currentDate => {
    this.setState({currentDate});
  };

  onRemoveComparisonPoint = comparisonPointId => {
    this.props.onRemoveComparisonPoint(
      this.props.comparison,
      comparisonPointId
    );
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
    this.props.onUpdateComparsion({...this.props.comparison, name});
  };

  render() {
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
                disabled={this.state.showAddForm}
                onClick={this.onClickAddLocation}
              >
                Add Location
              </Button>
            </ButtonBar>
          </CardHeader>
          <CardBody>
            {this.state.showAddForm &&
              <AddFormWrapper>
                <AddComparisonPointForm
                  onClose={this.hideAddForm}
                  onAdd={this.onAddComparisonPoint}
                />
              </AddFormWrapper>}
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

export const mapDispatchToProps = {
  onAddComparisonPoint: addComparisonPoint,
  onRemoveComparisonPoint: removeComparisonPoint,
  onRefreshComparison: refreshComparison,
  onUpdateComparsion: updateComparison,
};

const mapStateToProps = (state, {comparisonId}) => ({
  comparison: makeSelectAugmentedComparison(state)(comparisonId),
});

// Wrap the component to inject dispatch and state into it
export default connect(mapStateToProps, mapDispatchToProps)(HomePage);
