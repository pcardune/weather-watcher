import 'isomorphic-fetch';
import 'console.table';
import chalk from 'chalk';
import moment from 'moment';
import fs from 'fs';

const WEIGHTS = {
  WIND_SPEED: -1,
  PRECIPITATION_PERCENT: -0.5,
  PRECIPITATION_QUANTITY: -1,
};

function filterNOAAValuesByDate(values, date) {
  const filtered = values.filter(value => {
    return moment(new Date(value.validTime.split('/')[0])).isSame(date, 'day')
  }).map(v => v.value);
  return filtered;
}

function average(nums) {
  let s = 0;
  nums.forEach(n => s += n);
  return s/nums.length;
}

function getAverageNOAAValueForDate(property, date) {
  const avg = average(filterNOAAValuesByDate(property.values, date));
  return avg;
}

class NOAAGridDataForecast {
  constructor({data}) {
    this.data = data;
  }

  static async fetchForPoint(noaaPoint) {
    const data = await NOAAClient.fetch(noaaPoint.gridDataForecastUrl);
    return new NOAAGridDataForecast({data});
  }
}

class NOAADailyForecast {
  constructor({data}) {
    this.data = data;
  }

  static async fetchForPoint(noaaPoint) {
    const data = await NOAAClient.fetch(noaaPoint.dailyForecastUrl);
    return new NOAADailyForecast({data});
  }
}

class NOAAHourlyForecast {
  constructor({data}) {
    this.data = data;
  }

  static async fetchForPoint(noaaPoint) {
    const data = await NOAAClient.fetch(noaaPoint.hourlyForecastUrl);
    return new NOAAHourlyForecast({data});
  }
}

class NOAAPoint {
  constructor({data, dailyForecast, hourlyForecast, gridDataForecast}) {
    this.data = data;
    this.dailyForecast = dailyForecast;
    this.hourlyForecast = hourlyForecast;
    this.gridDataForecast = gridDataForecast;
  }

  toJSON() {
    return {
      data: this.data,
      dailyForecast: this.dailyForecast ? this.dailyForecast.data : null,
      hourlyForecast: this.hourlyForecast ? this.hourlyForecast.data : null,
      gridDataForecast: this.gridDataForecast
        ? this.gridDataForecast.data
        : null,
    };
  }

  static fromJSON(data) {
    return new NOAAPoint({
      data: data.data,
      dailyForecast: data.dailyForecast
        ? new NOAADailyForecast({data: data.dailyForecast})
        : null,
      hourlyForecast: data.hourlyForecast
        ? new NOAAHourlyForecast({data: data.hourlyForecast})
        : null,
      gridDataForecast: data.gridDataForecast
        ? new NOAAGridDataForecast({data: data.gridDataForecast})
        : null,
    });
  }

  get gridDataForecastUrl() {
    return this.data.properties.forecastGridData;
  }

  get dailyForecastUrl() {
    return this.data.properties.forecast;
  }

  get hourlyForecastUrl() {
    return this.data.properties.forecastHourly;
  }

  static async fetch({latitude, longitude}) {
    const data = await NOAAClient.fetchPath(`points/${latitude},${longitude}`);
    return new NOAAPoint({data});
  }

  async fetchAllForecasts() {
    await Promise.all([
      this.fetchDailyForecast(),
      this.fetchHourlyForecast(),
      this.fetchGridDataForecast(),
    ]);
  }

  async fetchDailyForecast() {
    if (!this.dailyForecast) {
      this.dailyForecast = await NOAADailyForecast.fetchForPoint(this);
    }
    return this.dailyForecast;
  }

  async fetchHourlyForecast() {
    if (!this.hourlyForecast) {
      this.hourlyForecast = await NOAAHourlyForecast.fetchForPoint(this);
    }
    return this.hourlyForecast;
  }

  async fetchGridDataForecast() {
    if (!this.gridDataForecast) {
      this.gridDataForecast = await NOAAGridDataForecast.fetchForPoint(this);
    }
    return this.gridDataForecast;
  }
}

class NOAAClient {
  static async fetch(url) {
    console.log('fetching url', url);
    const response = await fetch(url);
    if (response.status < 400) {
      const data = await response.json();
      if (data) {
        return data;
      } else {
        console.error('error collecting data', data);
      }
    } else {
      console.error('failed to get url', response);
    }
  }

  static fetchPath(path) {
    const url = `https://api.weather.gov/${path}`;
    return NOAAClient.fetch(url);
  }
}

class PointToCompare {
  constructor({name, latitude, longitude}) {
    this.name = name;
    this.latitude = latitude;
    this.longitude = longitude;
    this.noaaPoint = null;
  }

  toJSON() {
    return {
      name: this.name,
      latitude: this.latitude,
      longitude: this.longitude,
      noaaPoint: this.noaaPoint ? this.noaaPoint.toJSON() : null,
    };
  }

  static fromJSON(data) {
    const pointToCompare = new PointToCompare(data);
    pointToCompare.noaaPoint = data.noaaPoint ? NOAAPoint.fromJSON(data.noaaPoint) : null;
    return pointToCompare;
  }

  async fetch() {
    if (!this.noaaPoint) {
      this.noaaPoint = await NOAAPoint.fetch({
        latitude: this.latitude,
        longitude: this.longitude,
      });
    }
    await this.noaaPoint.fetchAllForecasts();
  }

  getScoreForDate(date) {
    const props = this.noaaPoint.gridDataForecast.data.properties;
    const precipAvg = getAverageNOAAValueForDate(props.probabilityOfPrecipitation, date);
    const windSpeedAvg = getAverageNOAAValueForDate(props.windSpeed, date);
    const precipQuantityAvg = getAverageNOAAValueForDate(props.quantitativePrecipitation, date);

    const score = (
      (isNaN(precipQuantityAvg) ? 0 : WEIGHTS.PRECIPITATION_QUANTITY * precipQuantityAvg) +
      WEIGHTS.PRECIPITATION_PERCENT * precipAvg +
      WEIGHTS.WIND_SPEED * windSpeedAvg
    );
    return {
      score: 100 + Math.round(score),
      probabilityOfPrecipitation: precipAvg,
      windSpeed: windSpeedAvg,
      quantitativePrecipitation: precipQuantityAvg,
    };
  }
}

class Comparison {
  constructor({name, pointsToCompare}) {
    this.name = name;
    this.pointsToCompare = pointsToCompare;
  }

  async fetch() {
    await Promise.all(this.pointsToCompare.map(p => p.fetch()));
    return this;
  }

  getSortedPointsForDate(date) {
    const sorted = [...this.pointsToCompare];
    sorted.sort((p1, p2) => p2.getScoreForDate(date).score - p1.getScoreForDate(date).score);
    return sorted;
  }

  toJSON() {
    return {
      name: this.name,
      pointsToCompare: this.pointsToCompare.map(p => p.toJSON()),
    };
  }

  static fromJSON(data) {
    return new Comparison({
      ...data,
      pointsToCompare: data.pointsToCompare.map(p => PointToCompare.fromJSON(p)),
    });
  }

  saveToFile() {
    fs.writeFileSync(this.filename, JSON.stringify(this.toJSON(), null, 2));
  }

  get filename() {
    return `${this.name}.comparison.json`;
  }

  static async loadFromFile({name, pointsToCompare}) {
    const backup = Comparison.fromJSON({name, pointsToCompare});
    try {
      const result = Comparison.fromJSON(
        JSON.parse(fs.readFileSync(`${name}.comparison.json`))
      );
      if (result.pointsToCompare.length !== pointsToCompare.length) {
        return backup.fetch();
      }
      return result;
    } catch (e) {
      console.warn(e.message);
      return backup.fetch();
    }
  }
}

async function run() {
  const comparison = await Comparison.loadFromFile({
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
    ],
  });

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = moment(new Date()).add(dayOffset, 'days').toDate();

    const sorted = comparison.getSortedPointsForDate(date);
    console.log('');
    console.log(chalk.underline(chalk.bold(moment(date).format('dddd, MMMM Do'))));
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
          Precip: isNaN(score.quantitativePrecipitation) ? '-' : Math.round(score.quantitativePrecipitation*100)/100,
          Forecast: day.shortForecast,
        };
      })
    );
  }
  comparison.saveToFile();
}

run();
