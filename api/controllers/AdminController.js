const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rescode = sails.config.constants.httpStatusCode;
const msg = sails.config.messages.User;
// const msg1 = require('../../config/locales/en.json');
const msg1 = sails.config.getMessages;

/**
 * AdminController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

adminLogin = async (req, res) => {
  const lang = req.getLocale();
  try {
    //check for user in database
    let admin = await Admin.findOne({ email: req.body.email });
    if (!admin) {
      //user not in database
      return res.status(rescode.UNAUTHORIZED).json({
        message: msg1('AuthError', lang),
      });
    }
    //comparing passwords
    bcrypt.compare(req.body.password, admin.password, async (err, result) => {
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
              email: admin.email,
              userId: admin.id,
            },
            //secret key
            process.env.JWT_KEY,
            //expiration time
            {
              expiresIn: '1h',
            }
        );
          //updating token for user
        await Admin.updateOne({ id: users.id }).set({
          token: token,
        });
        res.cookie('token', token, { maxAge:  7*24*60*60*1000});
        return res.redirect('/admin/home');
        // return res.status(rescode.OK).json({
        //   message: msg1('Login', lang),
        //   token: token,
        // });
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
adminLogout = async (req, res) => {
  const lang = req.getLocale();
  try {
    //update token value to null in user's data
    await Admin.updateOne({ id: req.userData.userId }).set({
      token: null,
    });
    res.clearCookie('token');
    res.redirect('/');
    // res.status(rescode.OK).json({
    //   message: msg1('Logout', lang),
    // });
  } catch (error) {
    console.log(error);
    res.status(rescode.SERVER_ERROR).json({
      error: error,
    });
  }
};

module.exports = {
  adminLogin,
  adminLogout,
};

