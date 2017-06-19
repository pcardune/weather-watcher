import React, {PureComponent, PropTypes} from 'react';
import {connect} from 'react-redux';
import {createStructuredSelector} from 'reselect';

import {Toolbar, ToolbarButton} from 'app/components/Toolbar';
import AddComparisonPointForm from 'app/components/AddComparisonPointForm';

import {resetComparison, addComparisonPoint} from './actions';
import {selectAugmentedComparisonToShow} from './selectors';

export class ComparisonToolbar extends PureComponent {
  // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    onAddComparisonPoint: PropTypes.func.isRequired,
  };

  state = {
    showAddForm: false,
  };

  onClickAdd = () => {
    this.setState({showAddForm: !this.state.showAddForm});
  };

  render() {
    return (
      <Toolbar style={{marginBottom: 10}}>
        <ToolbarButton onClick={this.onClickAdd}>Add</ToolbarButton>
        {this.state.showAddForm &&
          <AddComparisonPointForm onAdd={this.props.onAddComparisonPoint} />}
      </Toolbar>
    );
  }
}

export const mapDispatchToProps = {
  onAddComparisonPoint: addComparisonPoint,
  onResetComparison: resetComparison,
};

const mapStateToProps = createStructuredSelector({
  comparison: selectAugmentedComparisonToShow(),
});

// Wrap the component to inject dispatch and state into it
export default connect(mapStateToProps, mapDispatchToProps)(ComparisonToolbar);
