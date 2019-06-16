[[TOC]]


# Quick start

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

# API

### Session
Auth will check when access some personal info
When fail,it will return ```{status:'session fail'}```

### Render
#### get mainpage
```sh
$ curl -XGET 'https://www.volley99.com/
```

#### get testpage
```sh
$ curl -XGET 'https://www.volley99.com/test
```

### User Part

#### get user self (Need Auth and self)
```sh
$ curl -XGET "https://www.volley99.com/users/self/"

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
$ curl -XGET "https://www.volley99.com/users/info/:id"

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
$ curl -XGET "https://www.volley99.com/users/checkname/:name"

#return
True #or
False
```


#### get all users (deprecated)
```sh
$ curl -XGET "https://www.volley99.com/users"

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
$ curl -XPOST "https://www.volley99.com/users/reg" -d '{"username":"test","password":"123","phone":"13800138000","email":"example@mail.com"}' -H 'Content-Type: application/json'

#return states 201
#return
True #or
False
```

#### Login
```sh
$ curl -XPOST "https://www.volley99.com/users/login" -d '{"username":"test","password":"123"}' -H 'Content-Type: application/json' -c cookies.txt

#success return {"status": "success"}
#fail return {"status": "error"}
```

#### Logout
```sh
$ curl -XGET "https://www.volley99.com/users/logout"

#success redirect to /test
#fail redirect to /
```

#### Edit user by id (Need Auth)
```sh
$ curl -XPOST "https://www.volley99.com/users/" -d '{"uid":"92fb1730-2ec7-4db9-8fcb-7b35d0bd0fe3","password":"123123"}' -H 'Content-Type: application/json'

#return
True #or
False
```

#### Delete user by id  (Need Auth)
```sh
$ curl -XGET "https://www.volley99.com/users/676271cb-ca17-4fcb-98de-174a21c6b1f7"

#return 204
#return
True #or
False
```

### Wallet Part
All need to Auth
#### Create wallet
```sh
$ curl -XGET "https://www.volley99.com/wallet/create"
```

#### get balance
```sh
$ curl -XGET "https://www.volley99.com/wallet/balance"
# return int
```

#### charge to self wallet
```sh
$ curl -XGET "https://www.volley99.com/wallet/deposit/:amount"
#return boolean
```

#### list transaction
```sh
$ curl -XGET "https://www.volley99.com/wallet/transaction"
#return list of transaction
```

#### make transaction
```sh
$ curl -XPOST "https://www.volley99.com/wallet/transaction" -d '{
  sender:"(uuid)",
  receiver:"(uuid)",
  amount:(int)
  }' -H 'Content-Type: application/json'
#return boolean
```

### Task Part

#### Create task
Need to Auth
POST https://www.volley99.com/task/create
```
{
  "title":"test task",
  "type":"Questionaire",
  "salary":"20",
  "description":"task for test",
  "beginTime":"8-20-2019",
  "expireTime":"8-22-2019",
  "participantNum":"1",
  "tags":"Testing",
  position:"test"
}
```

#### Get All Task

```sh
$ curl -XGET "https://www.volley99.com/task/all"
```

#### Get one task
```sh
$curl -XGET "https://www.volley99.com/task/get/id"
```

#### Query Task By element
```sh
curl -XPOST "https://www.volley99.com/task/query"  -d '{"title":"test task"}' -H 'Content-Type: application/json'
# Allow element
#title
#type
#salary
#description
#beginTime
#expireTime
#participantNum
#tags
#uid
```

<<<<<<< HEAD
#### Get create task
=======
#### Get created task
>>>>>>> ac1d3c997b1478679db5444ddc3916d3d8402847
GET https://www.volley99.com/task/getCreate/  
Return
```
[{
  ...
}]
```

#### Get order task
GET https://www.volley99.com/task/getJjoin/  
Return
```
[{
  ...
}]
```

#### Get finish number

Parameter:getTaskbyID

```sh
curl -XGET "https://www.volley99.com/task/number/:id"
```

#### Select participator

```sh
curl -XPOST "https://www.volley99.com/task/participate" -d '{"tid":"...","uid":"..."}' -H 'Content-Type: application/json'
```

#### Change task status

Parameter: id: task id
Return: task status

Set to 已结束:
```sh
curl -XGET "https://www.volley99.com/task/finish/:id"
```

Set to 进行中:
```sh
curl -XGET "https://www.volley99.com/task/ongoing/:id"
```

Set to 未开始:
```sh
curl -XGET "https://www.volley99.com/task/start/:id"
```

### Order part(All need auth)

#### create
POST http://www.volley99.com/order/create  
```json
{
  tid:'xxx',
  message:'xxx',
}
```
Return
```
{status:'success'},code 200
#or
{status:'fail'} code 400
```

#### Get all order of oneself
GET http://www.volley99.com/order/all  
Return
```json
[{
  oid:x,
  tid:x,
  status:open/end,
  uid:x,
  createTime:x,
  message:'asshole',
  price:1
}]
```

#### Get all order of a task
GET http://www.volley99.com/order/bytask/:id  
Return
```json
[{
  oid:x,
  tid:x,
  status:open/end,
  uid:x,
  createTime:x,
  message:'asshole',
  price:1
}]
```

#### Finish order
GET http://www.volley99.com/order/finish/:id  
Return
```
{status:'success'},code 200
#or
{status:'fail'} code 400
```

#### Cancel one order
GET http://www.volley99.com/order/cancel/:id  
Return
204


#### Get order by id
GET http://www.volley99.com/order/get/:id  
Return
```
order info,code 200
# or
{status:'fail'} code 400
```

### Massage part(All need auth)

#### Get a receiver's msg list
Get http://www.volley99.com/msg/list

#### Create a comment
POST http://www.volley99.com/msg/comment
```
{uid:"...",
msg:"test"}
```

uid is recerver's id

#### Create a Massage

POST http://www.volley99.com/msg/create

```json
 {uid:"...",type:"comment",msg:"test"}
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
