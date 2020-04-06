const connection = require('./knexfile')[process.env.NODE_ENV || 'development']
const database = require('knex')(connection)

module.exports = {
    listAll(user) {
        return database('recipes')
        .where('user_id', user.id)
    },

    listUser(user) {
        return database('user')
        .where('user_id', user.id)
    }

}