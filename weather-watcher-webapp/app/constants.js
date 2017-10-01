export const FORECAST_BAD = 60;
export const FORECAST_OK = 85;
export const NUM_FORECAST_DAYS = 9;
export const NUM_FORECAST_DAYS_AHEAD = 7;
export const NUM_FORECAST_DAYS_BACK = 3;
export const OUR_EMAIL = 'thebears@goldilocksweather.com';
export const OUR_URL = 'goldilocksweather.com';
export const SCORE_COMPONENTS = {
  temp: {
    name: 'Temperature',
    high: 'hot',
    low: 'cold',
  },
  wind: {
    name: 'Wind Speed',
    high: 'windy',
    low: 'calm',
  },
  precip: {
    name: 'Chance of Rain',
    high: 'rainy',
    low: 'dry',
  },
  precipQuantity: {
    name: 'Amount of Rain',
    high: 'rainy',
    low: 'dry',
  },
};

export const SCORE_MULTIPLIERS = {
  red: 0,
  yellow: 2,
  green: 3,
};

export const DEFAULT_SCORE_CONFIG = {
  tempRange: [32, 45, 65, 75, 85],
  windRange: [0, 0, 0, 5, 20],
  precipRange: [0, 0, 0, 20, 50],
  quantityRange: [0, 0, 0, 0.03, 0.1],
};

export const DEFAULT_COMPARISON_ID = 'wa-climb-crags';

export const FB_APP_ID = '270286390143694';

export const firebaseConfig = {
  apiKey: 'AIzaSyA9dBTF1MZE3jyhjwG37unYMhbQEGurZF4',
  authDomain: 'weather-watcher-170701.firebaseapp.com',
  databaseURL: 'https://weather-watcher-170701.firebaseio.com',
  projectId: 'weather-watcher-170701',
  storageBucket: 'weather-watcher-170701.appspot.com',
  messagingSenderId: '936791071551',
};
