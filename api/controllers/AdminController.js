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
      req.addFlash('error', msg1('InvalidEmailPassword', lang));
      res.status(rescode.UNAUTHORIZED);
      return res.redirect('/admin/login');
    }
    //comparing passwords
    bcrypt.compare(req.body.password, admin.password, async (err, result) => {
      if (err) {
        req.addFlash('error', msg1('InvalidEmailPassword', lang));
        res.status(rescode.UNAUTHORIZED);
        return res.redirect('/admin/login');
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
              expiresIn: '2h',
            }
        );
          //updating token for user
        await Admin.updateOne({ id: users.id }).set({
          token: token,
        });
        res.cookie('token', token, { maxAge:  7*24*60*60*1000});
        req.addFlash('success', msg1('Login', lang));
        return res.redirect('/admin/dashboard');
      }
      req.addFlash('error', msg1('InvalidEmailPassword', lang));
      res.status(rescode.UNAUTHORIZED);
      return res.redirect('/admin/login');
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
adminLogout = async (req, res) => {
  const lang = req.getLocale();
  try {
    //update token value to null in user's data
    await Admin.updateOne({ id: req.userData.userId }).set({
      token: null,
    });
    res.clearCookie('token');
    req.addFlash('success', msg1('Logout', lang));
    return res.redirect('/');
  } catch (error) {
    console.log(error);
    res.status(rescode.SERVER_ERROR);
    res.view('500', {error});
  }
};

createSubAdmin = async (req, res) => {
  const lang = req.getLocale();
  try {
    let admin = await Admin.findOne({ email:req.body.email});
    let pattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (req.body.firstname.trim().length <= 0) {
      //checks for empty input field
      req.addFlash('error', msg1('EmptyFirstName', lang));
      res.status(rescode.BAD_REQUEST);
      return res.redirect('');

    } else if (req.body.lastname.trim().length <= 0) {
      //checks for empty input field
      req.addFlash('error', msg1('EmptyLastName', lang));
      res.status(rescode.BAD_REQUEST);
      return res.redirect('');

    } else if (!pattern.test(req.body.email)) {
      req.addFlash('error', msg1('InvalidEmail', lang));
      res.status(rescode.BAD_REQUEST);
      return res.redirect('');

    } else if (admin) {
      //if user found
      req.addFlash('error', msg1('DuplicateEmail', lang));
      res.status(rescode.CONFLICT);
      return res.redirect('');

    } else if (req.body.password.length < 8) {
      //checks for password length
      req.addFlash('error', msg1('MinPasswordLength', lang));
      res.status(rescode.BAD_REQUEST);
      return res.redirect('');

    } else {
      let hashpassword = await sails.helpers.hashPassword.with({
        password: req.body.password,
      });
      await Admin.create({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        password: hashpassword
      });
      req.addFlash('success', msg1('SubAdminCreated', lang));
      res.status(rescode.CREATED);
      res.redirect('/admin');
    }
  } catch (error) {
    console.log(error);
    res.status(rescode.SERVER_ERROR);
    res.view('500', {error});
  }
};

deleteSubAdmin = async (req, res) => {
  const lang = req.getLocale();
  try {
    const id  = req.params.uid;
    await Admin.destroyOne({ id:id });
    req.addFlash('success', msg1('SubAdminDeleted', lang));
    res.status(rescode.OK);
    res.redirect('/admin');
  } catch (error) {
    console.log(error);
    res.status(rescode.SERVER_ERROR);
    res.view('500', {error});
  }
};

getUsers = async (req, res) => {
  const lang = req.getLocale();
  try {
    let users = await Users.find();
    res.view('pages/admin/dashboard', {users});
  } catch (error) {
    console.log(error);
    res.status(rescode.SERVER_ERROR);
    res.view('500', {error});
  }
};

userUpdate = async (req, res) => {
  const lang = req.getLocale();
  try {
    const id = req.params.uid;
    let {firstname, lastname, email, password} = req.body;
    let hashpassword = await sails.helpers.hashPassword.with({
      password: password,
    });
    await Users.updateOne({ id:id }).set({
      firstname: firstname,
      lastname: lastname,
      email: email,
      password: hashpassword
    });
    res.status(rescode.OK);
    req.addFlash('success', msg1('UserUpdated', lang));
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.log(error);
    res.status(rescode.SERVER_ERROR);
    res.view('500', {error});
  }
};

userDelete = async (req,res) => {
  try {
    const lang = req.getLocale();
    const id = req.params.uid;
    await Users.destroyOne({ id:id });
    req.addFlash('success', msg1('UserDeleted',lang));
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.log(error);
    res.status(rescode.SERVER_ERROR);
    res.view('500', {error});
  }
};

module.exports = {
  adminLogin,
  adminLogout,
  createSubAdmin,
  deleteSubAdmin,
  getUsers,
  userUpdate,
  userDelete
};

