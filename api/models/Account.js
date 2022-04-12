/**
 * Account.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    accountname: {
      type: 'string',
      unique: true,
    },
    balance: {
      type: 'number',
      defaultsTo: 0,
    },

    //reference to User
    owners: {
      collection: 'users',
      via: 'account',
      through: 'accountuser',
    },

    //reference to Transactions
    transactions: {
      collection: 'transactions',
      via: 'owneraccount',
    },
  },
};
