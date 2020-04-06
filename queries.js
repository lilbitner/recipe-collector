const connection = require('./knexfile')[process.env.NODE_ENV || 'development']
const database = require('knex')(connection)

module.exports = {
    listAll() {
        return database('recipes')
        // .where('user_id', user.id)
    },

    listUser(userId) {
        return database('user')
        .where('user_id', userId)
    }

}