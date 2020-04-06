const express = require('express')
const router = express.Router()
module.exports = router 

router.post('/recipes', (request, response) => {
    
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


router.get('/recipes', (request, response) => {
    queries.listAll().then(recipes => response.send(recipes))
})