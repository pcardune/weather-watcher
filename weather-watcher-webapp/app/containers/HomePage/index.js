/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 */

import React, {PureComponent, PropTypes} from 'react';
import {connect} from 'react-redux';
import {createStructuredSelector} from 'reselect';
import {FormattedMessage} from 'react-intl';
import styled from 'styled-components';
import moment from 'moment-mini';
import {withRouter} from 'react-router';

import {makeSelectAugmentedComparison} from 'app/containers/Database/selectors';
import MultiDayForecastComparison
  from 'app/components/MultiDayForecastComparison';
import {AugmentedComparisonShape} from 'app/propTypes';
import Button from 'app/components/Button';
import {Card, CardHeader, CardBody} from 'app/components/Card';
import AddComparisonPointForm from 'app/components/AddComparisonPointForm';
import Dialog from 'app/components/Dialog';
import DatePager from 'app/components/DatePager';

import {
  resetComparison,
  addComparisonPoint,
  removeComparisonPoint,
  refreshComparison,
} from './actions';
import {selectAugmentedComparisonToShow} from './selectors';
import messages from './messages';

const HelpText = styled.p`
  text-align: center;
  color: ${props => props.theme.colors.secondaryText};
  font-weight: 300;
  padding: 50px;
`;

const Buttons = styled.div`
  display: flex;
  width: 100%;
  justify-content: flex-end;
  > * {
    margin-left: 25px;
  }
`;

export class HomePage extends PureComponent {
  static propTypes = {
    comparison: AugmentedComparisonShape,
    onResetComparison: PropTypes.func.isRequired,
    onRefreshComparison: PropTypes.func.isRequired,
    onRemoveComparisonPoint: PropTypes.func.isRequired,
    match: PropTypes.shape({
      params: PropTypes.shape({
        comparisonId: PropTypes.string,
      }),
    }),
  };

  state = {
    currentDate: moment(new Date()).startOf('date').toDate(),
    showAddForm: false,
  };

  componentDidMount() {
    if (!this.props.comparison) {
      this.props.onResetComparison();
    } else {
      this.props.onRefreshComparison(this.props.comparison);
    }
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

  onAddComparisonPoint = (...args) => {
    this.props.onAddComparisonPoint(...args);
    this.hideAddForm();
  };

  render() {
    const hasPoints = this.props.comparison &&
      this.props.comparison.comparisonPoints.length > 0;
    return (
      <article>
        <DatePager
          onChange={this.onChangeDate}
          currentDate={this.state.currentDate}
        />
        <Card>
          <CardHeader>
            <h1>
              <FormattedMessage {...messages.comparisonHeader} />
            </h1>
            <Buttons>
              <Button accent onClick={this.onClickAddLocation}>
                Add Location
              </Button>
              {hasPoints &&
                <Button accent onClick={this.props.onRefreshComparison}>
                  Refresh
                </Button>}
            </Buttons>
          </CardHeader>
          <CardBody>
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
        <AddComparisonPointForm
          isOpen={this.state.showAddForm}
          onClose={this.hideAddForm}
          onAdd={this.onAddComparisonPoint}
        />
      </article>
    );
  }
}

export const mapDispatchToProps = {
  onAddComparisonPoint: addComparisonPoint,
  onResetComparison: resetComparison,
  onRemoveComparisonPoint: removeComparisonPoint,
  onRefreshComparison: refreshComparison,
};

const mapStateToProps = (state, {comparisonId}) => {
  return createStructuredSelector({
    comparison: selectAugmentedComparisonToShow(comparisonId),
  });
};

// Wrap the component to inject dispatch and state into it
export default connect(mapStateToProps, mapDispatchToProps)(HomePage);
