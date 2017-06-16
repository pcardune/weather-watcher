/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 */

import React, {PureComponent, PropTypes} from 'react';
import {connect} from 'react-redux';
import {createStructuredSelector} from 'reselect';
import {FormattedMessage} from 'react-intl';

import Comparison from 'models/Comparison';
import MultiDayForecastComparison from 'components/MultiDayForecastComparison';
import AddPointToCompareForm from 'components/AddPointToCompareForm';

import Section from './Section';
import {refreshComparison, addPointToCompare} from './actions';
import {selectComparison} from './selectors';
import messages from './messages';

export class HomePage extends PureComponent {
  // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    onRefreshComparison: PropTypes.func.isRequired,
    comparison: PropTypes.instanceOf(Comparison).isRequired,
    onAddPointToCompare: PropTypes.func.isRequired,
  };

  /**
   * when initial state username is not null, submit the form to load repos
   */
  componentDidMount() {
    this.props.onRefreshComparison();
  }

  render() {
    return (
      <article>
        <div>
          <Section>
            <div>
              <FormattedMessage {...messages.comparisonHeader} />
            </div>
            <AddPointToCompareForm onAdd={this.props.onAddPointToCompare} />
            {this.props.comparison &&
              <MultiDayForecastComparison comparison={this.props.comparison} />}
          </Section>
        </div>
      </article>
    );
  }
}

export const mapDispatchToProps = {
  onRefreshComparison: refreshComparison,
  onAddPointToCompare: addPointToCompare,
};

const mapStateToProps = createStructuredSelector({
  comparison: selectComparison,
});

// Wrap the component to inject dispatch and state into it
export default connect(mapStateToProps, mapDispatchToProps)(HomePage);
