# Cloud-functions
cloud-functions is a NPM package that gets deployed to Google Firebase and serves as a server backend.
When deployed it contains the functions that listen to the Pub/Sub messages that gets sent every hour.
These functions do the update of the forecast.

### Externals
* The phrase "cloud-functions" is terminology specific to Firebase
* Google auto-scales machines to execute functions for however many events need to happen.