# weather-watcher

## Structure

### [functions-cron]/functions-cron/README.md)
* a google app-engine app
* publishes a message to google pub sub every hour which triggers an update of forecasts

### [cloud-functions](cloud-functions/README.md)
* an npm package that gets deployed to google firebase and serves as a server backend
* contains the functions that listen to the pub sub messages that gets sent every hour
* these functions do the update of the forecast

### [weather-watcher-webapp](weather-watcher-app/docs/README.md)
* a React application that uses Yarn for Javascript package management
* spits out js and html files that are compressed and served up by the Firebase static file server

## Domain Name Ideas:

* radweather.com
* myadventureweather.com