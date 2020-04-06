const express = require('express')
const router = express.Router()
module.exports = router 


router.post("/users", (request, response) => {
    
    const { username, password } = request.body 

    bcrypt.hash(password, 12).then(hashedPassword => {
        database('user')
        .insert({
            username, 
            password_hash: hashedPassword
        }).returning('*')
        .then(console.log)
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
   
   response.status(200).json({
       token,
       
    });

})
