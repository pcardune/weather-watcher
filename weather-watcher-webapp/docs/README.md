# Weather-watcher-webapp

## Table of Contents

- [General](general)
  - [**CLI Commands**](general/commands.md)
  - [Introduction ](general/introduction.md)
  - [Tool Configuration](general/files.md)
  - [Server Configurations](general/server-configs.md)
  - [Deployment](general/deployment.md) *(currently Heroku specific)*
  - [FAQ](general/faq.md)
  - [Gotchas](general/gotchas.md)
  - [Remove](general/remove.md)
  - [Extracting components](general/components.md)
- [Testing](testing)
  - [Unit Testing](testing/unit-testing.md)
  - [Component Testing](testing/component-testing.md)
  - [Remote Testing](testing/remote-testing.md)
- [CSS](css)
  - [`styled-components`](css/styled-components.md)
  - [sanitize.css](css/sanitize.md)
  - [Using Sass](css/sass.md)
- [JS](js)
  - [Redux](js/redux.md)
  - [ImmutableJS](js/immutablejs.md)
  - [reselect](js/reselect.md)
  - [redux-saga](js/redux-saga.md)
  - [i18n](js/i18n.md)
  - [routing](js/routing.md)

## Overview
weather-watcher-webapp is a React web application built from react-boilerplate.
It uses Yarn for JavaScript package management.

There is no server in this codebase - html and js files are served up by
Firebase's static file hosting.
Continuous deployment does not exist yet.
A manual script needs to be run to update the files on Firebase
in order for the latest code changes to be deployed.

### Quickstart
make sure you have the latest version of node installed
```
nvm install stable
```

in the webapp directory:
* install yarn

```
cd weather-watcher-webapp
yarn
```

in the cloud-functions directory:
* install yarn
* setup a yarn link

```
cd ../cloud-functions
yarn
yarn link
```

back in the webapp directory:
* hook up the yarn link
* start the app!
```
cd ../weather-watcher-webapp
yarn link "weather-watcher-cloud-functions"
yarn start
```

* visit localhost:3000 in a web browser
* install React devtools
* install Redux devtools

### Structure

The [`app/`](../../../tree/master/app) directory contains your entire application code, including CSS,
JavaScript, HTML and tests.

The rest of the folders and files only exist to make your life easier, and
should not need to be touched.


### CSS

Utilising [tagged template literals](https://github.com/styled-components/styled-components/blob/master/docs/tagged-template-literals.md)
(a recent addition to JavaScript) and the [power of CSS](https://github.com/styled-components/styled-components/blob/master/docs/css-we-support.md),
`styled-components` allows you to write actual CSS code to style your components.
It also removes the mapping between components and styles – using components as a
low-level styling construct could not be easier!

See the [CSS documentation](./css/README.md) for more information.

### JS

We bundle all your clientside scripts and chunk them into several files using
code splitting where possible. We then automatically optimize your code when
building for production so you don't have to worry about that.

See the [JS documentation](./js/README.md) for more information about the
JavaScript side of things.

### SEO

We use [react-helmet](https://github.com/nfl/react-helmet) for managing document head tags. Examples on how to
write head tags can be found [here](https://github.com/nfl/react-helmet#examples).

### Testing

For a thorough explanation of the testing procedure, see the
[testing documentation](./testing/README.md)!

#### Browser testing

`yarn run start:tunnel` makes your locally-running app globally available on the web
via a temporary URL: great for testing on different devices, client demos, etc!

#### Unit testing

Unit tests live in `test/` directories right next to the components being tested
and are run with `yarn run test`.
