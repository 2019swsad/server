
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

API
=======
### Session
Auth will check when access some personal info
When fail,it will return ```{status:'session fail'}```

### Render
#### get mainpage
```sh
$ curl -XGET 'http://localhost:8081/
```

#### get testpage
```sh
$ curl -XGET 'http://localhost:8081/test
```

### User Part

#### get user self (Need Auth and self)
```sh
$ curl -XGET "http://localhost:8081/users/self/"

#return
{"_id":"5ce554fba2229c3a88b1fc15",
"username":"test1",
"password":"15ds5ad",
"email":"asd@mail.com",
"phone":"13800138000",
"uid":"676271cb-ca17-4fcb-98de-174a21c6b1f7"}
#or redirect to /
```
#### get user info by uid (future Need Auth)
```sh
$ curl -XGET "http://localhost:8081/users/info/:id"

#return
{
  uid
  username
  credit
  phone
  url}
#or redirect to /
```

#### Check name is avaliable
```sh
$ curl -XGET "http://localhost:8081/users/checkname/:name"

#return
True #or
False
```


#### get all users (deprecated)
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

#return states 201
#return
True #or
False
```

#### Login
```sh
$ curl -XPOST "http://localhost:8081/users/login" -d '{"username":"test","password":"123"}' -H 'Content-Type: application/json' -c cookies.txt

#success return {"status": "success"}
#fail return {"status": "error"}
```

#### Logout
```sh
$ curl -XGET "http://localhost:8081/users/logout"

#success redirect to /test
#fail redirect to /
```

#### Edit user by id (Need Auth)
```sh
$ curl -XPOST "http://localhost:8081/users/" -d '{"uid":"92fb1730-2ec7-4db9-8fcb-7b35d0bd0fe3","password":"123123"}' -H 'Content-Type: application/json'

#return
True #or
False
```

#### Delete user by id  (Need Auth)
```sh
$ curl -XGET "http://localhost:8081/users/676271cb-ca17-4fcb-98de-174a21c6b1f7"

#return 204
#return
True #or
False
```

### Wallet Part
All need to Auth
#### Create wallet
```sh
$ curl -XGET "http://localhost:8081/wallet/create"
```

#### get balance
```sh
$ curl -XGET "http://localhost:8081/wallet/balance"
# return int
```

#### charge to self wallet
```sh
$ curl -XGET "http://localhost:8081/wallet/deposit/:amount"
#return boolean
```

#### list transaction
```sh
$ curl -XGET "http://localhost:8081/wallet/transaction"
#return list of transaction
```

#### make transaction
```sh
$ curl -XPOST "http://localhost:8081/wallet/transaction" -d '{
  sender:"(uuid)",
  receiver:"(uuid)",
  amount:(int)
  }' -H 'Content-Type: application/json'
#return boolean
```

### Task Part

#### Create task
Need to Auth
```sh
$ curl -XPOST "http://localhost:8081/task/create" -d '{"title":"test task","type":"Questionaire","salary":"20","description":"task for test","beginTime":"8-20-2019","expireTime":"8-22-2019","participantNum":"1","tags":"Testing"}' -H 'Content-Type: application/json'
```

#### Get All Task

```sh
$ curl -XGET "http://localhost:8081/task/all"
```

#### Get one task
```sh
$curl -XGET "http://localhost:8081/task/get/id"
```

#### Query Task By element
```sh
curl -XPOST "http://localhost:8081/task/query"  -d '{"title":"test task"}' -H 'Content-Type: application/json'
```

#### Get finish number

Parameter:getTaskbyID

```sh
curl -XGET "http://localhost:8081/task/number/:id"
```

#### Select participator

```sh
curl -XPOST "http://localhost:8081/task/participate" -d '{"tid":"...","uid":"..."}' -H 'Content-Type: application/json'
```

Test Module
=====
use postman team


**Tested API:**

- All of User
- All of Wallet


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
