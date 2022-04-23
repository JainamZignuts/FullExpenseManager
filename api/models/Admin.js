/**
 * Admin.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    firstname: {
      type: 'string',
      required: true
    },
    lastname: {
      type: 'string',
      required: true
    },
    email: {
      type: 'string',
      required: true,
      unique: true,
      isEmail: true,
    },
    password: {
      type: 'string',
      required: true
    },
    token: {
      type: 'string',
      allowNull: true
    },
    isSuperAdmin: {
      type: 'boolean',
      defaultsTo: false
    },
    isActive: {
      type: 'boolean',
      defaultsTo: false
    },
  },

};

