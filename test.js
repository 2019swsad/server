curl -XPOST "http://localhost:8081/users" -d '{
    "date":"time",
    "uid":1,
    "username":"test1",
    "password":"123",
    "email":"asd@mail.com",
    "phone":"13800138000",
    "address":["a","b"],
    "paymentpwd":"456",
    "balance":3,
    "credit":10,
    "selftag":["nipple","dick"],
    "systemtag":["asshole"]
}' -H 'Content-Type: application/json'