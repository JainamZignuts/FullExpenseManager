/**
 * Transactions.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    type: {
      type: 'string',
      isIn: ['income', 'expense'],
      required: true,
    },
    description: {
      type: 'string',
    },
    amount: {
      type: 'number',
      required: true,
    },
    //reference to user
    user:{
      model: 'users'
    },

    //reference to account
    owneraccount: {
      model: 'account',
    },
  },
};
