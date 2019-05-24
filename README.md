
Quick start
===========

**Install modules**
```sh
$ npm install
#or
$ cnpm i #recommend
```

**Start app:**
```sh
$ node ./index.js
```

Testing
=======

**Manual testing your REST service:**

You can also manual check the serviceability of your service with bash and [curl](https://curl.haxx.se/)


#### Get mainpage

```sh
$ curl -XGET 'http://localhost:8081/
```

#### get user id 1 (Need Auth)
```sh
$ curl -XGET "http://localhost:8081/users/test/:id"
```

#### Check name is avaliable
```sh
$ curl -XGET "http://localhost:8081/checkname/:name"

#return
True #or
False
```


#### ~~get all users~~
```sh
$ curl -XGET "http://localhost:8081/users"

#return like
[{
  "_id":"5ce554fba2229c3a88b1fc15",
  "username":"test1",
  "password":"15ds5ad",
  "email":"asd@mail.com",
  "phone":"13800138000",
  "uid":"676271cb-ca17-4fcb-98de-174a21c6b1f7"
}]
```

#### Add new user / Register
```sh
$ curl -XPOST "http://localhost:8081/users/reg" -d '{"username":"test","password":"123","phone":"13800138000","email":"example@mail.com"}' -H 'Content-Type: application/json'

#return 201
```

#### Login
```sh
$ curl -XPOST "http://localhost:8081/users/login" -d '{"username":"test","password":"123"}' -H 'Content-Type: application/json' -c cookies.txt
```

#### Logout
```sh
$ curl -XGET "http://localhost:8081/users/logout"
```

#### Edit user id 3 (Need Auth)
```sh
$ curl -XPUT "http://localhost:8081/users/3" -d '{"name":"New record 3"}' -H 'Content-Type: application/json'
```

#### Delete user id 3 (Need Auth)
```sh
$ curl -XDELETE "http://localhost:8081/users/3"

#return 204
```


Doc
===
## KOA
[Example](https://github.com/koajs/examples)

## MONK
[Monk](https://automattic.github.io/monk/docs/GETTING_STARTED.html)

## Hapi Joi
[Link](https://github.com/hapijs/joi)
[API](https://github.com/hapijs/joi/blob/v15.0.3/API.md)

## Chinese Tutorials
[This](https://chenshenhai.github.io/koa2-note/)

## Koa session
[This](https://github.com/koajs/session)

## Koa Passport
[This](https://github.com/rkusa/koa-passport)

## Auth example
[This](https://mherman.org/blog/user-authentication-with-passport-and-koa/)


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
