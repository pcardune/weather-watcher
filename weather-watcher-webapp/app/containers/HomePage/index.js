/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 */

import React, {PureComponent, PropTypes} from 'react';
import {connect} from 'react-redux';
import {createStructuredSelector} from 'reselect';
import {FormattedMessage} from 'react-intl';

import MultiDayForecastComparison
  from 'app/components/MultiDayForecastComparison';
import AddComparisonPointForm from 'app/components/AddComparisonPointForm';
import {AugmentedComparisonShape} from 'app/propTypes';

import Section from './Section';
import {
  resetComparison,
  addComparisonPoint,
  removeComparisonPoint,
} from './actions';
import {selectAugmentedComparisonToShow} from './selectors';
import messages from './messages';

export class HomePage extends PureComponent {
  // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    comparison: AugmentedComparisonShape,
    onResetComparison: PropTypes.func.isRequired,
    onAddComparisonPoint: PropTypes.func.isRequired,
    onRemoveComparisonPoint: PropTypes.func.isRequired,
  };

  /**
   * when initial state username is not null, submit the form to load repos
   */
  componentDidMount() {
    this.props.onResetComparison();
  }

  onRemoveComparisonPoint = comparisonPointId => {
    this.props.onRemoveComparisonPoint(
      this.props.comparison,
      comparisonPointId
    );
  };

  render() {
    return (
      <article>
        <div>
          <Section>
            <div>
              <FormattedMessage {...messages.comparisonHeader} />
            </div>
            <AddComparisonPointForm onAdd={this.props.onAddComparisonPoint} />
            {this.props.comparison &&
              <MultiDayForecastComparison
                comparison={this.props.comparison}
                onRemoveComparisonPoint={this.onRemoveComparisonPoint}
              />}
          </Section>
        </div>
      </article>
    );
  }
}

export const mapDispatchToProps = {
  onAddComparisonPoint: addComparisonPoint,
  onResetComparison: resetComparison,
  onRemoveComparisonPoint: removeComparisonPoint,
};

const mapStateToProps = createStructuredSelector({
  comparison: selectAugmentedComparisonToShow(),
});

// Wrap the component to inject dispatch and state into it
export default connect(mapStateToProps, mapDispatchToProps)(HomePage);
