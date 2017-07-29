import React, {Component, PropTypes} from 'react';

export default class ComparisonPointPage extends Component {
  static propTypes = {
    // TODO: is there a stricter definition of an ID type?
    comparisonPointId: PropTypes.string.isRequired,
  };

  render() {
    return (
      <h1>
        {this.props.comparisonPointId}
      </h1>
    );
  }
}
