import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {
  Button,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from 'material-ui';
import withResponsiveFullScreen from 'material-ui/Dialog/withResponsiveFullScreen';

import {ComparisonShape} from 'app/propTypes';
import firebase from 'app/firebaseApp';
import trackEvent from 'app/trackEvent';
import {createComparison} from 'app/containers/Database/actions';
import Dialog from './Dialog';

const ResponsiveDialog = withResponsiveFullScreen()(Dialog);

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
    onComparisonCreated: PropTypes.func,
    history: PropTypes.object.isRequired,
    navigateOnSave: PropTypes.bool,
  };

  static defaultProps = {
    comparison: null,
    navigateOnSave: false,
    onComparisonCreated: () => {},
  };

  state = this.getInitialStateForComparison(this.props.comparison);

  getInitialStateForComparison(comparison) {
    return {
      name: comparison ? comparison.name : '',
    };
  }

  componentWillReceiveProps(newProps) {
    if (newProps.comparison !== this.props.comparison) {
      this.setState(this.getInitialStateForComparison(newProps.comparison));
    }
  }

  handleChange = name => event => this.setState({[name]: event.target.value});

  onClickCreate = async () => {
    const id = firebase.database().ref('/comparisons').push().key;
    const comparison = {id, name: this.state.name};
    const promise = this.props.onCreateComparison(comparison).promise;
    this.props.onComparisonCreated(comparison);
    await promise;
    if (this.props.navigateOnSave) {
      this.props.history.push(`/compare/${id}`);
    }
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
      <ResponsiveDialog open={open} onRequestClose={onRequestClose}>
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
              InputProps={{placeholder: 'Name'}}
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.onRequestClose}>Cancel</Button>
          {button}
        </DialogActions>
      </ResponsiveDialog>
    );
  }
}
