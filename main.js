const express = require('express');
const app = express();
const PORT = 5100;
const users = [
    {name: 'vasya', age: 31, status: false},
    {name: 'petya', age: 30, status: true},
    {name: 'kolya', age: 29, status: true},
    {name: 'olya', age: 28, status: false},
    {name: 'max', age: 30, status: true},
    {name: 'anya', age: 31, status: false},
    {name: 'oleg', age: 28, status: false},
    {name: 'andrey', age: 29, status: true},
    {name: 'masha', age: 30, status: true},
    {name: 'olya', age: 31, status: false},
    {name: 'max', age: 31, status: true}
];

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get("/users", (req, res) => {
    res.json(users)
})

app.post("/users", (req, res) => {
    const newUser = req.body
    users.push(newUser)
    res.json({message: "user was created"})
})
app.listen(PORT, () => {
    console.log("Server started on port: " + PORT);
})

app.put("/users/:id", (req, res) => {
    const {id} = req.params;
    const updateStateUser = req.body;
    users[+id] = updateStateUser
    res.status(200).json({
        message: "user was updated",
        data: updateStateUser[id]
    })
})

app.delete("/users/:id", (req, res) => {
    const {id} = req.params;
    users.splice(+id, 1);
    res.status(200).json({message: "user was deleted", data: id})
})