curl -XPOST "http://localhost:8081/users" -d '{
    "username":"test1",
    "password":"15ds5ad",
    "email":"asd@mail.com",
    "phone":"13800138000"
}' -H 'Content-Type: application/json'