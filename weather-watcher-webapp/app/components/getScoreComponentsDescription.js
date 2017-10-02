import {SCORE_MULTIPLIERS, SCORE_COMPONENTS} from 'app/constants';
import * as strings from 'app/utils/strings';

export default function getScoreComponentsDescription({
  badness,
  dailyForecast,
}) {
  // TODO: make this actually better than the plain daily forecast
  return dailyForecast;
  const componentsByScore = {
    red: [],
    yellow: [],
    green: [],
  };
  Object.keys(SCORE_COMPONENTS).forEach(key => {
    const {score, descriptor} = badness[key];
    if (score <= SCORE_MULTIPLIERS.red) {
      componentsByScore.red.push({
        name: SCORE_COMPONENTS[key].name,
        descriptor: `${SCORE_COMPONENTS[key][descriptor]}`,
      });
    } else if (score <= SCORE_MULTIPLIERS.yellow) {
      componentsByScore.yellow.push({
        name: SCORE_COMPONENTS[key].name,
        descriptor: `${SCORE_COMPONENTS[key][descriptor]}`,
      });
    } else {
      componentsByScore.green.push({name: SCORE_COMPONENTS[key].name});
    }
  });
  return strings.list(
    [
      dailyForecast,
      componentsByScore.yellow.length > 0 &&
        `somewhat ${strings.list(
          componentsByScore.yellow.map(a => a.descriptor)
        )}`,
      componentsByScore.red.length > 0 &&
        `too ${strings.list(componentsByScore.red.map(a => a.descriptor))}`,
    ].filter(s => !!s)
  );
}
