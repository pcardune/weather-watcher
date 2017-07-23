# Cloud-functions
cloud-functions is a npm package that gets deployed to google firebase and serves as a server backend.
When deployed it contains the functions that listen to the pub sub messages that gets sent every hour.
These functions do the update of the forecast.

### Externals
* The phrase "cloud-functions" is terminology specific to firebase
* Google auto-scales machines to execute functions for however many events need to happen.