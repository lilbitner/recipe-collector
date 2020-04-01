
exports.up = function(knex) {
    return knex.schema.createTable('recipes', (recipe) => {
        recipe.increments('id')
        recipe.string('title').notNullable();
        recipe.string('category').notNullable();
        recipe.string('image').notNullable();
        recipe.integer('user_id').references('id').inTable('user')
    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists("recipes")
};
