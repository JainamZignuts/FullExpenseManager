module.exports = {


  friendlyName: 'Hash password',


  description: 'Convert password into hash using bcrypt',


  inputs: {
    password:{
      type: 'string',
      required: true
    }
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },

  fn: async function (inputs,exits) {
    let bcrypt = require('bcrypt');
    //hash the password with 10 salt rounds
    await bcrypt.hash(inputs.password, 10, async (err, hash) => {
      if (err) {
        return res.status(500).json({
          error: err,
        });
      } else {
        return exits.success(hash);
      }
    });
  }

};
