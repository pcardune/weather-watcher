import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Button, DialogTitle, DialogActions, List, ListItem} from 'material-ui';
import {ComparisonShape} from 'app/propTypes';
import NewComparisonButton from './NewComparisonButton';
import Dialog from './Dialog';

export default class ComparisonPickerDialog extends Component {
  static propTypes = {
    ...Dialog.propTypes,
    comparisons: PropTypes.arrayOf(ComparisonShape).isRequired,
    onSelect: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
  };

  selectItem = comparison => () => {
    this.props.onRequestClose();
    this.props.onSelect(comparison);
  };

  onComparisonCreated = comparison => this.selectItem(comparison)();

  render() {
    const {title, comparisons, open, onRequestClose} = this.props;
    return (
      <Dialog open={open} onRequestClose={onRequestClose}>
        <DialogTitle>
          {title}
        </DialogTitle>
        <List>
          {comparisons.map(comparison =>
            <ListItem
              key={comparison.id}
              button
              onClick={this.selectItem(comparison)}
            >
              {comparison.name}
            </ListItem>
          )}
          <ListItem>
            <NewComparisonButton
              raised
              color="accent"
              onComparisonCreated={this.onComparisonCreated}
            >
              + New Comparison
            </NewComparisonButton>
          </ListItem>
        </List>
        <DialogActions>
          <Button onClick={onRequestClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    );
  }
}
