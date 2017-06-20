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

import MultiDayForecastComparison
  from 'app/components/MultiDayForecastComparison';
import {AugmentedComparisonShape} from 'app/propTypes';
import Button from 'app/components/Button';
import {Card, CardHeader, CardBody} from 'app/components/Card';
import AddComparisonPointForm from 'app/components/AddComparisonPointForm';
import {Dialog} from 'app/components/Dialog';

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

const DateHeader = styled.h1`
  font-size: 36px;
  font-weight: 300;
  width: 30%;
  text-align: center;
`;

const DatePager = styled.div`
  max-width: 670px;
  display: flex;
  margin: auto;
  align-items: center;
  justify-content: space-around;
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
  };

  state = {
    currentDate: moment(new Date()).startOf('date').toDate(),
    showAddForm: false,
  };

  componentDidMount() {
    if (!this.props.comparison) {
      this.props.onResetComparison();
    } else {
      this.props.onRefreshComparison();
    }
  }

  onClickDate = currentDate => {
    this.setState({currentDate});
  };

  onClickPrevDate = () => {
    this.setState({
      currentDate: moment(this.state.currentDate).subtract(1, 'days').toDate(),
    });
  };

  onClickNextDate = () => {
    this.setState({
      currentDate: moment(this.state.currentDate).add(1, 'days').toDate(),
    });
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

  onAddComparisonPoint = (...args) => {
    this.props.onAddComparisonPoint(...args);
    this.setState({showAddForm: false});
  };

  render() {
    const hasPoints = this.props.comparison &&
      this.props.comparison.comparisonPoints.length > 0;
    return (
      <article>
        <DatePager>
          <Button onClick={this.onClickPrevDate}>
            ◀ {moment(this.state.currentDate).subtract(1, 'days').format('ddd')}
          </Button>
          <DateHeader>
            {moment(this.state.currentDate).format('dddd')}
          </DateHeader>
          <Button onClick={this.onClickNextDate}>
            {moment(this.state.currentDate).add(1, 'days').format('ddd')} ▶
          </Button>
        </DatePager>
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
                  onClickDate={this.onClickDate}
                />
              : <HelpText>
                  Add a location to start comparing forecasts.
                </HelpText>}
          </CardBody>
        </Card>
        <Dialog
          isOpen={this.state.showAddForm}
          onClose={this.onClickAddLocation}
        >
          <h1>Add Location</h1>
          <AddComparisonPointForm onAdd={this.onAddComparisonPoint} />
        </Dialog>
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

const mapStateToProps = createStructuredSelector({
  comparison: selectAugmentedComparisonToShow(),
});

// Wrap the component to inject dispatch and state into it
export default connect(mapStateToProps, mapDispatchToProps)(HomePage);
