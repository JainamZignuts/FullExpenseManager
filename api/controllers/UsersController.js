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
    if (req.body.firstname.trim().length <= 0) {
      //checks for empty input field
      req.addFlash('error', msg1('EmptyFirstName', lang));
      res.status(rescode.BAD_REQUEST);
      return res.redirect('/signup');


    } else if (req.body.lastname.trim().length <= 0) {
      //checks for empty input field
      req.addFlash('error', msg1('EmptyLastName', lang));
      res.status(rescode.BAD_REQUEST);
      return res.redirect('/signup');


    } else if (!pattern.test(req.body.email)) {
      req.addFlash('error', msg1('InvalidEmail', lang));
      res.status(rescode.BAD_REQUEST);
      return res.redirect('/signup');

    } else if (user) {
      //if user found
      req.addFlash('error', msg1('DuplicateEmail', lang));
      res.status(rescode.CONFLICT);
      return res.redirect('/signup');

    } else if (req.body.password.length < 8) {
      //checks for password length
      req.addFlash('error', msg1('MinPasswordLength', lang));
      res.status(rescode.BAD_REQUEST);
      return res.redirect('/signup');

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
      req.addFlash('success', msg1('UserCreated', lang));
      res.status(rescode.CREATED);
      return res.redirect('/login');
      // res.send(
      //       msg1('UserCreated', lang) +
      //         '\n' +
      //         msg1('WelcomeEmail', lang) +
      //         '\n' +
      //         msg1('DefaultAccount', lang)
      // );
    }
  } catch (error) {
    console.log(error);
    res.status(rescode.SERVER_ERROR);
    res.view('500', {error});
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
      req.addFlash('error', msg1('InvalidEmailPassword', lang));
      res.status(rescode.UNAUTHORIZED);
      return res.redirect('/login');
    }
    //comparing passwords
    bcrypt.compare(req.body.password, users.password, async (err, result) => {
      if (err) {
        req.addFlash('error', msg1('InvalidEmailPassword', lang));
        res.status(rescode.UNAUTHORIZED);
        return res.redirect('/login');
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
          isActive: true,
          token: token,
        });
        res.cookie('token', token, { maxAge:  7*24*60*60*1000});
        req.addFlash('success', msg1('Login', lang));
        return res.redirect('/home');
        // return res.status(rescode.OK).json({
        //   message: msg1('Login', lang),
        //   token: token,
        // });
      }
      req.addFlash('error', msg1('InvalidEmailPassword', lang));
      res.status(rescode.UNAUTHORIZED);
      return res.redirect('/login');
    });
  } catch (error) {
    console.log(error);
    res.status(rescode.SERVER_ERROR);
    res.view('500', {error});
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
      isActive: false,
      token: null,
    });
    res.clearCookie('token');
    req.addFlash('success', msg1('Logout', lang));
    return res.redirect('/');
    // res.status(rescode.OK).json({
    //   message: msg1('Logout', lang),
    // });
  } catch (error) {
    console.log(error);
    res.status(rescode.SERVER_ERROR);
    res.view('500', {error});
  }
};

module.exports = {
  userSignup,
  userLogin,
  userLogout,
};
