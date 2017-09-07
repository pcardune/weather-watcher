import 'isomorphic-fetch';

export function coordinateArrayToFirebaseKey(coordinates) {
  return coordinates.join('|').replace(/\./g, ',');
}

class NOAAGridDataForecast {
  constructor({data}) {
    this.data = data;
  }

  getFirebaseId() {
    return [
      this.data.properties.gridId,
      this.data.properties.gridX,
      this.data.properties.gridY,
    ].join('|');
  }

  static getFirebasePath(id) {
    return ['noaaGridForecasts', id].join('/');
  }

  getFirebasePath() {
    return [
      NOAAGridDataForecast.getFirebasePath(this.getFirebaseId()),
      this.data.properties.updateTime,
    ].join('/');
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

  getFirebaseId() {
    return coordinateArrayToFirebaseKey(this.data.geometry.coordinates);
  }

  static getFirebasePath(id) {
    return ['noaaDailyForecasts', id].join('/');
  }

  getFirebasePath() {
    return [
      NOAADailyForecast.getFirebasePath(this.getFirebaseId()),
      this.data.properties.updated,
    ].join('/');
  }

  static async fetchForPoint(noaaPoint) {
    const data = await NOAAClient.fetch(noaaPoint.dailyForecastUrl);
    return new NOAADailyForecast({data});
  }
}

class NOAAAlert {
  constructor({data}) {
    this.data = data;
  }

  getFirebasePath() {
    return ['nooaAlerts', this.data.properties.id].join('/');
  }
}

class NOAAAlertsForecast {
  constructor({data, forecastZoneId}) {
    this.data = data;
    this.forecastZoneId = forecastZoneId;
  }

  getFirebaseId() {
    return this.forecastZoneId;
  }

  get alertIds() {
    return this.data.features.map(feature => feature.properties.id);
  }

  getAlerts() {
    return this.data.features.map(data => new NOAAAlert({data}));
  }

  static getFirebasePath(id) {
    return ['noaaAlertsForecasts', id].join('/');
  }

  getFirebasePath() {
    return [NOAAAlertsForecast.getFirebasePath(this.getFirebaseId())].join('/');
  }

  static async fetchForPoint(noaaPoint) {
    const data = await NOAAClient.fetch(noaaPoint.alertsForecastUrl);
    return new NOAAAlertsForecast({
      forecastZoneId: noaaPoint.forecastZoneId,
      data,
    });
  }
}

class NOAAHourlyForecast {
  constructor({data}) {
    this.data = data;
  }

  getFirebaseId() {
    return coordinateArrayToFirebaseKey(this.data.geometry.coordinates);
  }

  static getFirebasePath(id) {
    return ['noaaHourlyForecasts', id].join('/');
  }

  getFirebasePath() {
    return [
      NOAAHourlyForecast.getFirebasePath(this.getFirebaseId()),
      this.data.properties.updated,
    ].join('/');
  }

  static async fetchForPoint(noaaPoint) {
    const data = await NOAAClient.fetch(noaaPoint.hourlyForecastUrl);
    return new NOAAHourlyForecast({data});
  }
}

export class NOAAPoint {
  constructor({
    data,
    dailyForecast,
    hourlyForecast,
    gridDataForecast,
    alertsForecast,
  }) {
    this.data = data;
    this.dailyForecast = dailyForecast;
    this.hourlyForecast = hourlyForecast;
    this.gridDataForecast = gridDataForecast;
    this.alertsForecast = alertsForecast;
  }

  toJSON() {
    return {
      data: this.data,
      dailyForecast: this.dailyForecast ? this.dailyForecast.data : null,
      hourlyForecast: this.hourlyForecast ? this.hourlyForecast.data : null,
      alertsForecast: this.alertsForecast ? this.alertsForecast.data : null,
      gridDataForecast: this.gridDataForecast
        ? this.gridDataForecast.data
        : null,
    };
  }

  getFirebaseId() {
    return coordinateArrayToFirebaseKey(this.data.geometry.coordinates);
  }

  static getFirebasePath(noaaPointId) {
    return ['noaaPoints', noaaPointId].join('/');
  }

  getFirebasePath() {
    return NOAAPoint.getFirebasePath(this.getFirebaseId());
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
      alertsForecast: data.alertsForecast
        ? new NOAAAlertsForecast({
            data: data.alertsForecast,
            forecastZoneId: NOAAPoint.getForecastZoneId(data.data),
          })
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

  static getForecastZoneId(data) {
    return data.properties.forecastZone.split('/').slice(-1)[0];
  }

  get forecastZoneId() {
    return NOAAPoint.getForecastZoneId(this.data);
  }

  get alertsForecastUrl() {
    return `https://api.weather.gov/alerts?zone=${this.forecastZoneId}`;
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
      this.fetchAlertsForecast(),
    ]);
  }

  async fetchAlertsForecast() {
    if (!this.alertsForecast) {
      this.alertsForecast = await NOAAAlertsForecast.fetchForPoint(this);
    }
    return this.alertsForecast;
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

  static fetchNOAAPoint({latitude, longitude}) {
    return NOAAClient.fetchPath(`points/${latitude},${longitude}`);
  }
}
