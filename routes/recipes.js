const express = require('express')
const router = express.Router()
const queries = require('../queries');
const knex = require('knex');
const config = require('../knexfile')[process.env.NODE_ENV || "development"];
const database = knex(config);
module.exports = router 

router.post('/', (request, response) => {
    
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


router.get('/', (request, response) => {
    queries.listAll().then(recipes => response.send(recipes))
})