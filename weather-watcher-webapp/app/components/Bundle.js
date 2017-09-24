import {Component} from 'react';
import PropTypes from 'prop-types';

export default class Bundle extends Component {
  static propTypes = {
    load: PropTypes.object.isRequired,
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
    const {load, ...rest} = props;
    const setMod = mod => {
      const theModule = mod.default ? mod.default : mod;
      this.setState({
        // handle both es imports and cjs
        mod: theModule(rest),
      });
    };
    if (load instanceof Promise) {
      load.then(setMod);
    } else {
      setMod(load);
    }
  }

  render() {
    return this.props.children(this.state.mod);
  }
}
