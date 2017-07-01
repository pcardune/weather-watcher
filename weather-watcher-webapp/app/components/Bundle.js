import {Component} from 'react';
import PropTypes from 'prop-types';

export default class Bundle extends Component {
  static propTypes = {
    load: PropTypes.func.isRequired,
    children: PropTypes.func.isRequired,
  };

  state = {
    // short for "module" but that's a keyword in js, so "mod"
    mod: null,
  };

  componentWillMount() {
    this.load(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.load !== this.props.load) {
      this.load(nextProps);
    }
  }

  load(props) {
    this.setState({
      mod: null,
    });
    const {load, ...rest} = props;
    load(mod => {
      const theModule = mod.default ? mod.default : mod;
      this.setState({
        // handle both es imports and cjs
        mod: theModule(rest),
      });
    });
  }

  render() {
    return this.state.mod ? this.props.children(this.state.mod) : null;
  }
}
