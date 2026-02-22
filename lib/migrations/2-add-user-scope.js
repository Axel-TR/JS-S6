'use strict';

exports.up = async (knex) => {

    await knex.schema.alterTable('user', (table) => {

        table.json('scope').nullable();
    });

    await knex('user').update({

        scope: JSON.stringify(['user'])
    });

    await knex.schema.alterTable('user', (table) => {

        table.json('scope').notNullable().alter();
    });
};

exports.down = async (knex) => {

    await knex.schema.alterTable('user', (table) => {

        table.dropColumn('scope');
    });
};

