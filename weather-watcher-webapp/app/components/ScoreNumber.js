import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import Number from 'app/components/Number';
import Theme from 'app/Theme';
import {FORECAST_OK, FORECAST_BAD, SCORE_MULTIPLIERS} from 'app/constants';
import {safeAverage} from 'app/utils/math';

const Circle = styled.div`
  background-color: ${props => props.color};
  border: 5px solid ${props => props.color};
  border-radius: 20px;
  color: white;
  font-weight: bolder;
  text-align: center;
  display: inline-block;
  width: 2em;
  height: 2em;
`;

const MOSTLY_BAD = safeAverage([
  SCORE_MULTIPLIERS.red,
  SCORE_MULTIPLIERS.yellow,
]);

export function getScoreColor({score, theme}) {
  for (const component of Object.values(score.scoreComponents)) {
    if (component <= MOSTLY_BAD) {
      return theme.colors.forecastBad;
    }
  }
  return score.score <= FORECAST_BAD
    ? theme.colors.forecastBad
    : score.score <= FORECAST_OK
      ? theme.colors.forecastOK
      : theme.colors.forecastGood;
}

/* eslint-disable react/no-unused-prop-types */
export default class ScoreNumber extends PureComponent {
  static propTypes = {
    ...Number.propTypes,
    score: PropTypes.shape({
      score: PropTypes.number.isRequired,
      scoreComponents: PropTypes.object.isRequired,
    }).isRequired,
  };
  static defaultProps = Number.defaultProps;

  render() {
    const color = getScoreColor({score: this.props.score, theme: Theme});
    return (
      <Circle color={color}>
        <Number {...this.props} value={this.props.score.score} />
      </Circle>
    );
  }
}
