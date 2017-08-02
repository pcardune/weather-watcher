import React from 'react';

import {SCORE_MULTIPLIERS, SCORE_COMPONENTS} from 'app/constants';

export default ({scoreComponents}) => {
  const componentsByScore = {
    red: [],
    yellow: [],
    green: [],
  };
  for (const key in SCORE_COMPONENTS) {
    if (scoreComponents[key] <= SCORE_MULTIPLIERS.red) {
      componentsByScore.red.push(SCORE_COMPONENTS[key].name);
    } else if (scoreComponents[key] <= SCORE_MULTIPLIERS.yellow) {
      componentsByScore.yellow.push(SCORE_COMPONENTS[key].name);
    } else {
      componentsByScore.green.push(SCORE_COMPONENTS[key].name);
    }
  }
  return (
    <ul>
      <li>
        Green: {componentsByScore.green.join(', ')}
      </li>
      <li>
        Yellow: {componentsByScore.yellow.join(', ')}
      </li>
      <li>
        Red: {componentsByScore.red.join(', ')}
      </li>
    </ul>
  );
};
