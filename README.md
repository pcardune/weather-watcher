[![CircleCI](https://circleci.com/gh/pcardune/weather-watcher.svg?style=svg&circle-token=d9f403879cecac090c18e04bb9602d41aace1d7b)](https://circleci.com/gh/pcardune/weather-watcher)

# weather-watcher

## Structure

### [functions-cron](functions-cron/readme.md)
* a Google App Engine app
* publishes a message to Google Pub/Sub every hour which triggers an update of forecast

### [cloud-functions](cloud-functions/README.md)
* a NPM package that gets deployed to Google firebase and serves as a server backend
* contains the functions that listen to the pub sub messages that get sent every hour
* these functions do the update of the forecast

### [weather-watcher-webapp](weather-watcher-webapp/docs/README.md)
* a React application that uses Yarn for Javascript package management
* spits out JS and HTML files that are compressed and served up by the Firebase static file server

## Domain Name Ideas:

* radweather.com
* myadventureweather.com
* pleasentweather.com
* balmyweather.com
* sendingweather.com
* goldilocksweather.com
* searchforthesun.com
