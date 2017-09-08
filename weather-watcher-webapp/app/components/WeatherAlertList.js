import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Collapsible from './Collapsible';
import WeatherAlert from './WeatherAlert';

export default class WeatherAlertList extends Component {
  static propTypes = {
    alerts: PropTypes.array.isRequired,
  };

  render() {
    const {alerts} = this.props;
    if (alerts.length === 0) {
      return null;
    }
    return (
      <Collapsible>
        {alerts.map(alert => <WeatherAlert key={alert.id} alert={alert} />)}
      </Collapsible>
    );
  }
}
