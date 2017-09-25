import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from 'material-ui';

import {ComparisonShape} from 'app/propTypes';
import firebase from 'app/firebaseApp';
import trackEvent from 'app/trackEvent';
import {createComparison} from 'app/containers/Database/actions';

@withRouter
@connect(null, {
  onCreateComparison: createComparison,
})
export default class EditComparisonDialog extends Component {
  static propTypes = {
    ...Dialog.propTypes,
    type: PropTypes.oneOf(['create', 'edit']).isRequired,
    comparison: ComparisonShape,
    onCreateComparison: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
  };

  static defaultProps = {
    comparison: null,
  };

  state = {
    name: this.props.comparison ? this.props.comparison.name : '',
  };

  handleChange = name => event => this.setState({[name]: event.target.value});

  onClickCreate = async () => {
    const id = firebase.database().ref('/comparisons').push().key;
    await this.props.onCreateComparison({name: this.state.name, id}).promise;
    this.props.history.push(`/compare/${id}`);
    this.props.onRequestClose();
    trackEvent('Create', {
      content_ids: [id],
      content_type: 'comparison',
    });
  };

  onClickSave = () => {
    firebase
      .database()
      .ref(`/comparisons/${this.props.comparison.id}`)
      .update({name: this.state.name});
    this.props.onRequestClose();
  };

  render() {
    const {type, open, onRequestClose} = this.props;

    const title =
      type === 'create' ? 'Create New Comparison' : 'Edit Comparison';
    const button =
      type === 'create'
        ? <Button color="accent" raised onClick={this.onClickCreate}>
            Create
          </Button>
        : <Button color="accent" raised onClick={this.onClickSave}>
            Save
          </Button>;

    return (
      <Dialog open={open} onRequestClose={onRequestClose}>
        <DialogTitle>
          {title}
        </DialogTitle>
        <DialogContent>
          <form noValidate autoComplete="off">
            <TextField
              value={this.state.name}
              label="Name"
              onChange={this.handleChange('name')}
              margin="normal"
              fullWidth
              helperText="help"
              InputProps={{placeholder: 'Name'}}
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.onRequestClose}>Cancel</Button>
          {button}
        </DialogActions>
      </Dialog>
    );
  }
}
