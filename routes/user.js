const express = require('express')
const router = express.Router()
const bcrypt = require("bcrypt");
const knex = require('knex');
const config = require('../knexfile')[process.env.NODE_ENV || "development"];
const database = knex(config);
const jwt = require('jsonwebtoken');
// module.exports = router 



router.post("/", async (request, response) => {
    
    const { username, password } = request.body
    
    const foundUser = await database('user')
        .select()
        .where('username', username)
        .first()

    if (!foundUser){
        if (password.length < 5) {response.status(406).json({status: 406})}
        else {
    bcrypt.hash(password, 12).then(hashedPassword => {
        database('user')
        .insert({
            username, 
            password_hash: hashedPassword
        }).returning('*')
        .then(users => {
            response.status(201).json({...users[0]})
        })
    })}}


    if(foundUser) {
        response.status(401).json({status: 401})
    }
})


router.post('/login', async (request, response) => {
    const { username, password } = request.body
    const foundUser = await database('user')
        .select()
        .where('username', username)
        .first()
    if (!foundUser) {
        response.status(401).json({status: 401})
    }

    const isPasswordMatch = await bcrypt.compare(password, foundUser.password_hash)

    if (!isPasswordMatch) {
        response.status(401).json({status: 401})
    }

   const token =  jwt.sign({
    id: foundUser.id,
    username: foundUser.username
   }, process.env.SECRET)

   
   response.status(200).json(
       {token, foundUser} );

})

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


module.exports = router 
