
Quick start
===========

**Install modules**
```sh
$ npm install
#or
$ cnpm i
```

**Start app:**
```sh
$ node ./index.js
```

Example
===
[Example](https://github.com/koajs/examples)

testing
=======

**Manual testing your REST service:**

You can also manual check the serviceability of your service with bash and [curl](https://curl.haxx.se/)

###### get user id 1
```sh
$ curl -XGET "http://localhost:8081/users/1"
```
###### get all users
```sh
$ curl -XGET "http://localhost:8081/users"
```

###### add new user
```sh
$ curl -XPOST "http://localhost:8081/users" -d '{"name":"New record 1"}' -H 'Content-Type: application/json'
```

###### edit user id 3
```sh
$ curl -XPUT "http://localhost:8081/users/3" -d '{"name":"New record 3"}' -H 'Content-Type: application/json'
```

###### delete user id 3
```sh
$ curl -XDELETE "http://localhost:8081/users/3"
```



console api
===========

```sh
Usage: /usr/bin/node ./console.js --section [string] [--action [string]] [--opt [object]]

Options:
  --opt, --options  example --opt.app=mobile --opt.s=1  [default: {}]
  --section                                             [required]
  --action                                              [default: "index"]
```

For example 
```sh
$ ./console.js --section=default --opt.hello=world
Hello world defaultController & index action with options: {"hello":"world"}
```

rabbitmq api
============

```sh
Usage: NODE_WORKER_NAME=[worker_name] NODE_QUEUE_NAME=[queue_name] /usr/bin/node --harmony ./worker.js
```

For example 
```sh
$ NODE_WORKER_NAME=example NODE_QUEUE_NAME=example /usr/bin/node --harmony ./worker.js
```

kubernetes api
==============

Several new features have been added that can be used in conjunction with kubernetes
  * **Auto shutdown**. Set the environment variable **NODE_LIFE_TIME** to specify 
    the time at which the service will suspend its work, for exsmple:
    NODE_LIFE_TIME=24h или NODE_LIFE_TIME=30m
    
    If the variable is not set, then "Auto shutdown" is disabled
  * **Redy state**. Your app can tell the kubernetes system that it 
    is temporarily not ready to accept new requests. How to do this is 
    described in the example below
    ```javascript
       const {setReady} = require('../controllers/kubernetesController');
       // ...
       // setReady(false) // to temporary disable new requests
       // ...
       // setReady(true) // to restore accept new requests
   
    ```
    This should be configured in the config of kubernetes pod, 
    the address on which poll is created: **/redyz**
  * **Health state**. Your app can tell the kubernetes system that it 
    is temporarry broken. How to do this is described in the example below
    ```javascript
       const {setHealth} = require('../controllers/kubernetesController');
       // ...
       // setHealth(false) // to tell kubernetes: "app is broken" 
       // ...
       // setHealth(true) // to tell kubernetes: "app is live"
   
    ```
    This should be configured in the config of kubernetes pod, 
    the address on which poll is created: **/healthz**


In order to avoid cluttering the minimal code of our REST-service, additional 
functionality will be available when running the app via **index.kubernetes.js**: 
```sh
$ node ./index.kubernetes.js
```
