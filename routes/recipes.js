const express = require('express')
const router = express.Router()
const queries = require('../queries');
const knex = require('knex');
const config = require('../knexfile')[process.env.NODE_ENV || "development"];
const database = knex(config);
module.exports = router 

router.post('/', (request, response) => {
    
    const { title, description, category, url, image, user_id } = request.body 
    
    database('recipes')
    .insert({
        title,
        description,
        category,
        url,
        image, 
        user_id
    }).returning('*')
    .then(recipes => {
        response.status(201).json({...recipes[0]})
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

router.get('/:id', async (request, response) => {
    const userId = Number(request.params.id)
    const recipes = await database('recipes')
    .select()
    .where('user_id', userId)

    response.json({recipes})
    // queries.listUser(userId).then(user => response.send(user))
})

router.delete('/delete/:id',  (request, response)=> {
    const recipeId = Number(request.params.id)
    database('recipes')
    .delete()
    .where('id', recipeId)
    .then(
        
        // delete recipes[0] 
        response.json({status: 200})
    )
    
    // delete recipe 
    

    // response.json({status: 200})
})

// router.put('/put/:id', async (request, response) => {
//     const recipeId = Number(request.params.id)
//     onst recipe = await database('recipes')
//     .select()
//     .where('id', recipeId)
// })


// router.get('/', (request, response) => {
//     queries.listAll().then(recipes => response.send(recipes))
// })


