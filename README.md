# [SnailJS](//github.com/snailjs/).[APX](//github.com/snailjs/apx/)

[![Build Status](https://travis-ci.org/snailjs/apx.png?branch=master)](https://travis-ci.org/snailjs/apx)

![Logo](snail-apx.png)

## APX API Server

APX *(pronounced 'apex')* is a modern API server designed to serve multiple communication mediums.
That relies on modern popular packages such as
[express](https://github.com/visionmedia/express),
[kue](https://github.com/learnboost/kue),
[socket.io](https://github.com/learnboost/socket.io),
[winston](https://github.com/flatiron/winston),
[object-manage](https://github.com/snailjs/object-manage)
to make configuration and two-way communication a breeze.

APX is built to be test friendly out of the box and comes with a `testing`
setting in the configuration that will use mock services and increase testing speed.

## Why

Well we have evaluated and contributed to several other API servers and just kept
running into deficiencies or failure to use a popular library or not light weight enough.

Thus, we created APX. Its lightweight uses lots of modern packages and wires them all
together in an extensible loading environment.

## Usage

APX can be used homogeneously or through our
[generator](https://github.com/snailjs/generator-apx).

### Homogeneous
```
$ npm install apx
```
**app.js**
```js
var Apx = require('apx')

var server = new Apx({
  config: ['config.json'],
  tasks: ['tasks/*.js'],
  translators: [require('apx-express')]
  winston: {file: 'foo.log'}
})
```

### Generator

Our [generator](https://github.com/snailjs/generator-apx)
is a [yeoman](https://github.com/yeoman) generator instance
that will scaffold your entire API server.

```
//install the generator
$ npm install generator-apx
//scaffold the initial app
$ yo apx
//scaffold a new action (with test)
$ yo apx:action <name>
//scaffold a new helper (with test)
$ yo apx:helper <name>
//scaffold a new initializer
$ yo apx:initializer <name>
//scaffold a new model
$ yo apx:model <name>
//scaffold a new service (with test)
$ yo apx:service <name>
//scaffold a new test (with test)
$ yo apx:task <name>
//scaffold a new translator
$ yo apx:translator <name>
```

## Structure

APX consists of several well known idioms

* actions
* helpers
* initializers
* models
* services
* tasks
* translators

### Actions

Actions are the bread and butter of an API server they serve all
requests and build responses. Actions are also in charge of firing
non periodic tasks and utilizing services.

### Helpers

Helpers do not get loaded by the APX loading service however helpers
are meant to be common modules that assist actions and tasks. Generally
these are libraries that augment the `req`,`res` variables.

### Initializers

Initializers get executed when the server starts up and are only executed
once. These are useful for setting up database connections and loading
additional items into the environment.

### Models

Models are optional, but since using models to store data has become so common
it seems silly not to support them in context and generators. Models do
not get loaded by the Apx framework but can be added during an initializer
or per action or task.

### Services

Services are just libraries that are treated as singletons. Services should
be used to maintain in memory information and provide access to data providers.
Models are services but services are not necessarily models.

### Tasks

Tasks are jobs that are ran either periodically or scheduled to run by an action.
Tasks are considered headless and while they consume request data. They do not
provide response data. They can, however, log using [winston](https://github.com/flatiron/winston).

### Translators

In other frameworks these are sometimes called "servers". Translators are the
middleware that consumes connections and produce generic `Request` and `Response`
objects. An example of a translator would be an *express HTTP server*.

## Clustering

Clustering in APX is a breeze. Simply use
[cluster-master](https://github.com/isaacs/cluster-master)

Here is a quick example

**app.js**
```js
var Apx = require('./apx')

new Apx({
  cwd: __dirname + '/app',
  cluster: ('production' === process.env.NODE_ENV),
  config: ['config.json'],
  initializers: ['initializers/*.js'],
  tasks: ['tasks/*.js'],
  translators: ['translators/*.js']
})
```

**server.js**
```js
var clusterMaster = require('cluster-master')

clusterMaster({
  exec: 'app.js',
  env: {NODE_ENV: 'production'},
  repl: {address: '127.0.0.1', port: 3002}
})
```

To start the cluster simply run

```
$ node server
```

## Configuration

APX uses [object-manage](https://github.com/snailjs/object-manage) to load
and manage configuration data.

### Schema

#### Testing
* Variable `testing`
* Default `false`

Testing mode will use [fakeredis](https://github.com/hdachev/fakeredis)
as much as possible and will not start listening on
any ports. However it will still offer a full featured
environment for writing tests. Testing mode will also
not start Kue which should not be needed to test tasks.

#### CWD (current working directory)
* Variable `cwd`
* Default `''`

The current working directory is used when loading
actions, services, and tasks.

#### Kue

##### Port
* Variable `kue.port`
* Default `3001

The port that the kue web interface will listen on.

##### Title
* Variable `kue.title`
* Default `APX Job Status`

The title of the Kue web interface

#### Initializers
* Variable `initializers`
* Default `[]`

An array of [globs](https://github.com/isaacs/node-glob)
or objects or absolute file paths. That should be
executed when the server is started.

#### Tasks
* Variable `tasks`
* Default `[]`

An array of [globs](https://github.com/isaacs/node-glob)
or objects or absolute file paths. That will resolve
to tasks.

This must be provided at config time to they can be
loaded into Kue and scheduled if needed.

#### Translators
* Variable `translators`
* Default `[]`

An array of [globs](https://github.com/isaacs/node-glob)
or objects or absolute file paths. That will resolve
to translators that should be started when the
server is started

#### Winston

Below configuration options allow for basic
winston transport configuration. Additional
transports should be set in `initializers`.

##### Console
* Variable `winston.console`
* Default `true`

Enables the console transport for [winston](https://github.com/flatiron/winston).

##### File
* Variable `winston.file`
* Default `''`

Filename for [winston](https://github.com/flatiron/winston)
file transport to point to.

## Changelog

### 0.2.1
* Fixes #1

### 0.2.0
* Dropped convict in favor of object-manage

### 0.1.0
* Initial release