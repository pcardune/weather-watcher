import 'isomorphic-fetch';
import moment from 'moment-mini';

export function filterNOAAValuesByDate(values, date) {
  const filtered = values
    .filter(value =>
      moment(new Date(value.validTime.split('/')[0])).isSame(date, 'day'))
    .map(v => v.value);
  return filtered;
}

function average(nums) {
  let s = 0;
  nums.forEach(n => {
    s += n;
  });
  return s / nums.length;
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

export class NOAAPoint {
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

export class NOAAClient {
  static async fetch(url) {
    const response = await fetch(url);
    if (response.status < 400) {
      const data = await response.json();
      if (data) {
        return data;
      }
      console.error('error collecting data', data);
    } else {
      console.error('failed to get url', response);
    }
    return null;
  }

  static fetchPath(path) {
    const url = `https://api.weather.gov/${path}`;
    return NOAAClient.fetch(url);
  }

  static async fetchNOAAPoint({latitude, longitude}) {
    const data = await NOAAClient.fetchPath(`points/${latitude},${longitude}`);
    return new NOAAPoint({data});
  }
}
