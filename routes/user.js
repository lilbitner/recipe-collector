const express = require('express')
const router = express.Router()
const bcrypt = require("bcrypt");
const knex = require('knex');
const config = require('../knexfile')[process.env.NODE_ENV || "development"];
const database = knex(config);
const jwt = require('jsonwebtoken');
// module.exports = router 



router.post("/", (request, response) => {
    
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


router.post('/login', async (request, response) => {
    const { username, password } = request.body
    const foundUser = await database('user')
        .select()
        .where('username', username)
        .first()
    if (!foundUser) {
        // response.statusCode = 401
        response.status(401).json({status: 401})
    }

    const isPasswordMatch = await bcrypt.compare(password, foundUser.password_hash)

    if (!isPasswordMatch) {
        // response.statusCode = 401;
        // response.sendStatus(401)
        response.status(401).json({status: 401})
    }

   const token =  jwt.sign({
    id: foundUser.id,
    username: foundUser.username
   }, process.env.SECRET)

   
   response.status(200).json(
       {token, foundUser} );

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

router.get('/authenticate', async (request, response) => {
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
    response.json({user})
    request.user = user 
})


router.get('/:id', authenticate, async (request, response) => {
    const userId = Number(request.params.id)
    const user = await database('user')
    .select()
    .where('id', userId)

    response.json({user})
    // queries.listUser(userId).then(user => response.send(user))
})

module.exports = router 
