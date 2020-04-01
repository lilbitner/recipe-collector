require("dotenv").config()

const express = require('express')
const app = express()
const queries = require('./queries')

const bodyParser = require('body-parser')

app.use(bodyParser.json())

const bcrypt = require("bcrypt")
const knex = require('knex')
const config = require('./knexfile')[process.env.NODE_ENV || "development"]
const database = knex(config)
const jwt = require('jsonwebtoken')


app.post("/users", (request, response) => {
    const { username, password } = request.body 

    bcrypt.hash(password, 12).then(hashedPassword => {
        database('user')
        .insert({
            username, 
            password_hash: hashedPassword
        }).returning('*')
        .then(users => {
            response.status(201).json({...users[0]})
        })
    })

})

app.post('/login', async (request, response) => {
    const { username, password } = request.body
    const foundUser = await database('user')
        .select()
        .where('username', username)
        .first()
    if (!foundUser) {
        response.sendStatus(401)
    }

    const isPasswordMatch = await bcrypt.compare(password, foundUser.password_hash)

    if (!isPasswordMatch) {
        response.sendStatus(401)
    }

   const token =  jwt.sign({
    id: foundUser.id,
    username: foundUser.username
   }, process.env.SECRET)
   response.json({token})

})

app.get("/secrets", authenticate, (request, response) => {
    console.log(request.user)
    response.json({
        secretInfo: "here you go"
    })
})

app.get('/other-secrets', authenticate, (request, response) => {
    response.json({
        secretInfo: 'here you also go!'
    })
})


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

app.post('/recipes', (request, response) => {
    
    const { title, category, image, user_id } = request.body 
    
    database('recipes')
    .insert({
        title,
        category,
        image, 
        user_id
    }).returning('*')
    .then(recipes => {
        response.status(201).json({...recipes[0]})
    })
})


app.get('/recipes', (request, response) => {
    queries.listAll().then(recipes => response.send(recipes))
})

app.listen(process.env.PORT || 4000, () => console.log('listening'))