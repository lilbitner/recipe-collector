require("dotenv").config()

const express = require('express')
const app = express()
const queries = require('./queries')
const cors = require('cors')
app.use(cors());
const bodyParser = require('body-parser')
app.use(bodyParser.json())
const bcrypt = require("bcrypt")
const knex = require('knex')
const config = require('./knexfile')[process.env.NODE_ENV || "development"]
const database = knex(config)
const jwt = require('jsonwebtoken')

const recipes = require('./routes/recipes')
app.use("/recipes", recipes)

const users = require('./routes/user')
app.use("/users", users)
app.use("/login", users)



// app.get('/user', authenticate, (request, response) => {

//     queries.listUser(user).then(user => response.send(user))

// })



async function authenticate(request, response, next) {
    const token = request.headers.authorization.split(" ")[1]

    if(!token) {
        response.sendStatus(401)
    }

    let id  
    try {
        id  = jwt.verify(token, process.env.SECRET).id 
    } catch(error) {
        response.sendStatus(403)
    }

    const user = await database("user")
        .select()
        .where("id", id)
        .first()

    request.user = user 

    next()
}





app.listen(process.env.PORT || 5000, () => console.log('listening'))