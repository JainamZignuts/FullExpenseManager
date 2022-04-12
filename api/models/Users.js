module.exports = {
  attributes: {
    firstname: {
      type: 'string',
      required: true,
    },
    lastname: {
      type: 'string',
      required: true,
    },
    email: {
      type: 'string',
      required: true,
      isEmail: true,
    },
    password: {
      type: 'string',
      required: true,
      minLength: 8,
    },
    token: {
      type: 'string',
      allowNull: true
    },

    //reference to account
    accounts: {
      collection: 'account',
      via: 'owners',
      through: 'accountuser',
    },
  },

  customToJSON: function(){
    return _.omit(this, ['createdAt', 'updatedAt', 'password', 'token']);
  },

  afterCreate: async function (users, proceed) {
    try {
      //calling welcome email helper
      await sails.helpers.sendWelcomeEmail.with({
        to: users.email,
        firstname: users.firstname,
        lastname: users.lastname,
      });
      //creates user's default account
      let acc = await Account.create({
        accountname: users.firstname + ' default',
        owners: users.id,
      }).fetch();
    } catch (err) {
      console.log(err);
    }
    proceed();
  },
};
