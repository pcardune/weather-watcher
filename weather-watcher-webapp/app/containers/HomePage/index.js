/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 */

import React from 'react';
import Helmet from 'react-helmet';
import {connect} from 'react-redux';
import {createStructuredSelector} from 'reselect';
import {FormattedMessage} from 'react-intl';

import {Comparison} from 'weather-watcher-core';

import Section from './Section';
import {refreshComparison} from './actions';
import {selectComparison} from './selectors';
import messages from './messages';

export class HomePage extends React.PureComponent {
  // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    onRefreshComparison: React.PropTypes.func,
    comparison: React.PropTypes.instanceOf(Comparison),
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
        <Helmet
          title="Home Page"
          meta={[
            {
              name: 'description',
              content: 'A React.js Boilerplate application homepage',
            },
          ]}
        />
        <div>
          <Section>
            <div>
              <FormattedMessage {...messages.comparisonHeader} />
            </div>
            {this.props.comparison && <span>I have a comparison!</span>}
          </Section>
        </div>
      </article>
    );
  }
}

export function mapDispatchToProps(dispatch) {
  return {
    onRefreshComparison: () => dispatch(refreshComparison()),
  };
}

const mapStateToProps = createStructuredSelector({
  comparison: selectComparison,
});

// Wrap the component to inject dispatch and state into it
export default connect(mapStateToProps, mapDispatchToProps)(HomePage);
