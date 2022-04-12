const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rescode = sails.config.constants.httpStatusCode;
const msg = sails.config.messages.User;
// const msg1 = require('../../config/locales/en.json');
const msg1 = sails.config.getMessages;

/**
 * signup the user and store data in database
 *
 * (POST /signup)
 */
userSignup = async (req, res) => {
  const lang = req.getLocale();
  try {
    //check for existing user
    let user = await Users.findOne({ email: req.body.email });
    let pattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (user) {
      //if user found
      return res.status(rescode.CONFLICT).json({
        // message: msg.DuplicateEmail,
        message: msg1('DuplicateEmail', lang),
      });
      //checks for password length
    } else if (req.body.password.length < 8) {
      return res.status(400).json({
        message: msg1('MinPasswordLength', lang),
      });
      //checks for empty input field
    } else if (req.body.firstname.trim().length <= 0) {
      return res.send(msg1('EmptyFirstName', lang));
    } else if (req.body.lastname.trim().length <= 0) {
      return res.send(msg1('EmptyLastName'), lang);
    } else if (!pattern.test(req.body.email)) {
      return res.badRequest(msg1('InvalidEmail', lang));
    } else {
      //calling helper to hash the password
      let hash = await sails.helpers.hashPassword.with({
        password: req.body.password,
      });
      //creates user
      let result = await Users.create({
        firstname: req.body.firstname.trim(),
        lastname: req.body.lastname,
        email: req.body.email,
        password: hash,
      }).fetch();
      res.status(rescode.CREATED);
      res.send(
            msg1('UserCreated', lang) +
              '\n' +
              msg1('WelcomeEmail', lang) +
              '\n' +
              msg1('DefaultAccount', lang)
      );

    }
  } catch (error) {
    console.log(error);
    res.status(rescode.SERVER_ERROR).json({
      error: error.toString(),
    });
  }
};

/**
 * login the specified user and generates a token.
 *
 * (POST /login)
 */
userLogin = async (req, res) => {
  const lang = req.getLocale();
  try {
    //check for user in database
    let users = await Users.findOne({ email: req.body.email });
    if (!users) {
      //user not in database
      return res.status(rescode.UNAUTHORIZED).json({
        message: msg1('AuthError', lang),
      });
    }
    //comparing passwords
    bcrypt.compare(req.body.password, users.password, async (err, result) => {
      if (err) {
        return res.status(rescode.UNAUTHORIZED).json({
          message: msg1('AuthError', lang),
        });
      }
      if (result) {
        //generating token
        const token = jwt.sign(
          //payload
          {
            email: users.email,
            userId: users.id,
          },
          //secret key
          process.env.JWT_KEY,
          //expiration time
          {
            expiresIn: '1h',
          }
        );
        //updating token for user
        await Users.updateOne({ id: users.id }).set({
          token: token,
        });
        return res.status(rescode.OK).json({
          message: msg1('Login', lang),
          token: token,
        });
      }
      res.status(rescode.UNAUTHORIZED).json({
        message: msg1('AuthError', lang),
      });
    });
  } catch (error) {
    console.log(error);
    res.status(rescode.SERVER_ERROR).json({
      error: error,
    });
  }
};

/**
 * logout the specified user and set token value to null for that user
 *
 * (POST /logout)
 */
userLogout = async (req, res) => {
  const lang = req.getLocale();
  try {
    //update token value to null in user's data
    await Users.updateOne({ id: req.userData.userId }).set({
      token: null,
    });
    res.status(rescode.OK).json({
      message: msg1('Logout', lang),
    });
  } catch (error) {
    console.log(error);
    res.status(rescode.SERVER_ERROR).json({
      error: error,
    });
  }
};

module.exports = {
  userSignup,
  userLogin,
  userLogout,
};
