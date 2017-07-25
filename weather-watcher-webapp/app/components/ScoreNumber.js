import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import Number from 'app/components/Number';
import Theme from 'app/Theme';

import {FORECAST_BAD, FORECAST_OK} from 'app/constants';

const Circle = styled.div`
  background-color: ${props => props.color};
  border: 5px solid ${props => props.color};
  border-radius: 20px;
  color: white;
  font-weight: bolder;
  text-align: center;
`;

function getColorFromScore(score) {
  if (score < FORECAST_BAD) {
    return Theme.colors.forecastBad;
  }
  if (score < FORECAST_OK) {
    return Theme.colors.forecastOK;
  }
  return Theme.colors.forecastGood;
}

/* eslint-disable react/no-unused-prop-types */
export default class ScoreNumber extends PureComponent {
  static propTypes = Number.propTypes;
  static defaultProps = Number.defaultProps;

  render() {
    const color = getColorFromScore(this.props.value);
    return (
      <Circle color={color}>
        <Number {...this.props} />
      </Circle>
    );
  }
}