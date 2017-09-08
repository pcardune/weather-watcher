import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import moment from 'moment-mini';

import CollapsibleItem from './CollapsibleItem';

function Format({children, className}) {
  if (!children || typeof children !== 'string') {
    return null;
  }
  const sections = children.split('\n\n');
  return (
    <div className={className}>
      {sections.map(section =>
        <p key={section}>
          {section}
        </p>
      )}
    </div>
  );
}

const Wrapper = styled(CollapsibleItem)`
  ${Format} p {
    margin-bottom: 10px !important;
  }
`;

export default class WeatherAlert extends Component {
  static propTypes = {
    alert: PropTypes.object.isRequired,
  };

  render() {
    const {alert} = this.props;
    const red = 'red lighten-4';
    return (
      <Wrapper
        icon={<i className="material-icons red-text text-darken-2">warning</i>}
        header={
          <CollapsibleItem.Header className={red}>
            <strong>
              {alert.properties.headline}
            </strong>
          </CollapsibleItem.Header>
        }
      >
        <Format>
          {alert.properties.description}
        </Format>
        <Format>
          {alert.properties.instruction}
        </Format>
        <p>
          <em>
            In effect from {moment(
              new Date(alert.properties.onset)
            ).fromNow()}{' '}
            to {moment(new Date(alert.properties.expires)).fromNow()}
          </em>
        </p>
      </Wrapper>
    );
  }
}
