import 'console.table';
import chalk from 'chalk';
import moment from 'moment';

import {Comparison} from 'weather-watcher-core';
import {saveNOAAGridDataForecast} from './storage';

async function run() {
  const comparison = Comparison.fromJSON({
    name: 'climbing',
    pointsToCompare: [
      {
        name: 'Seattle',
        latitude: 47.6062,
        longitude: -122.3321,
      },
      {
        name: 'Vantage',
        latitude: 46.9502,
        longitude: -119.9534,
      },
      {
        name: 'Tieton',
        latitude: 46.7021,
        longitude: -120.7553,
      },
      {
        name: 'Index',
        latitude: 47.8207,
        longitude: -121.5551,
      },
      {
        name: 'Mt. Erie',
        latitude: 48.4537,
        longitude: -122.6254,
      },
      {
        name: 'Mt. Baker',
        latitude: 48.7586,
        longitude: -121.8283,
      },
    ],
  });

  await comparison.fetch();

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = moment(new Date()).add(dayOffset, 'days').toDate();

    const sorted = comparison.getSortedPointsForDate(date);
    console.log('');
    console.log(
      chalk.underline(chalk.bold(moment(date).format('dddd, MMMM Do')))
    );
    console.table(
      sorted.map((point, index) => {
        const periods = point.noaaPoint.dailyForecast.data.properties.periods;
        const [day, night] = periods[0].isDaytime
          ? [periods[0], periods[1]]
          : [periods[1], periods[2]];
        const score = point.getScoreForDate(date);
        return {
          Rank: index + 1,
          Name: point.name,
          Score: score.score,
          High: day.temperature,
          Low: night.temperature,
          Wind: Math.round(score.windSpeed),
          PoP: Math.round(score.probabilityOfPrecipitation) + '%',
          Precip: isNaN(score.quantitativePrecipitation)
            ? '-'
            : Math.round(score.quantitativePrecipitation * 100) / 100,
          Forecast: day.shortForecast,
        };
      })
    );
  }
  return Promise.all(
    comparison.pointsToCompare.map(pointToCompare =>
      saveNOAAGridDataForecast(pointToCompare.noaaPoint.gridDataForecast))
  );
}

run();
