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
  color: ${props => props.theme.colors.primaryText};
  font-weight: bolder;
  text-align: center;
  display: inline-block;
  width: 2em;
  height: 2em;
  font-weight: 300;
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

function getScoreGrade(score) {
  const letter =
    score < 60
      ? 'F'
      : score < 70 ? 'D' : score < 80 ? 'C' : score < 90 ? 'B' : 'A';
  const remainder = score % 10;
  if (score >= 60) {
    const modifier = remainder < 3 / 10 ? '-' : remainder < 6 / 10 ? '' : '+';
    return letter + modifier;
  }
  return letter;
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
    const grade = getScoreGrade(this.props.score.score);
    return (
      <Circle color={color}>
        {grade}
      </Circle>
    );
  }
}
