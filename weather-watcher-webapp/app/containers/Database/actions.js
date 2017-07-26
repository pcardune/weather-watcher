import {UPDATE_SCORE_CONFIG, CREATE_COMPARISON} from './constants';

export function updateScoreConfig(scoreConfig) {
  return {
    type: UPDATE_SCORE_CONFIG,
    scoreConfig,
  };
}

export function createComparison({name}) {
  return {
    type: CREATE_COMPARISON,
    comparison: {
      name,
    },
  };
}
