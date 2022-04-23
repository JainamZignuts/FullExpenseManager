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

getAll = async (req, res) => {
  const lang = req.getLocale();
  try {
    let users = await Users.count();
    let accounts = await Account.count();
    let transactions = await Transactions.count();

    res.status(rescode.OK);
    res.view('pages/admin/dashboard', {layout: 'layouts/admin',users,accounts,transactions});
  } catch (error) {
    console.log(error);
    res.status(rescode.SERVER_ERROR);
    res.view('500', {error});
  }
};

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
              adminId: admin.id,
              superAdmin: admin.isSuperAdmin
            },
            //secret key
            process.env.JWT_KEY,
            //expiration time
            {
              expiresIn: '2h',
            }
        );
          //updating token for user
        await Admin.updateOne({ id: admin.id }).set({
          token: token,
          isActive: true
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
    await Admin.updateOne({ id: req.adminData.adminId }).set({
      token: null,
      isActive: false
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

getSubAdmin = async (req, res) => {
  const lang = req.getLocale();
  try {
    let subAdmins = await Admin.find({ isSuperAdmin:false });
    res.view('pages/admin/subAdminList', {layout: 'layouts/admin',subAdmins});
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
      return res.redirect('/admin/subAdminList');

    } else if (req.body.lastname.trim().length <= 0) {
      //checks for empty input field
      req.addFlash('error', msg1('EmptyLastName', lang));
      res.status(rescode.BAD_REQUEST);
      return res.redirect('/admin/subAdminList');

    } else if (!pattern.test(req.body.email)) {
      req.addFlash('error', msg1('InvalidEmail', lang));
      res.status(rescode.BAD_REQUEST);
      return res.redirect('/admin/subAdminList');

    } else if (admin) {
      //if user found
      req.addFlash('error', msg1('DuplicateEmail', lang));
      res.status(rescode.CONFLICT);
      return res.redirect('/admin/subAdminList');

    } else if (req.body.password.length < 8) {
      //checks for password length
      req.addFlash('error', msg1('MinPasswordLength', lang));
      res.status(rescode.BAD_REQUEST);
      return res.redirect('/admin/subAdminList');

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
      res.redirect('/admin/subAdminList');
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
    const id  = req.params.aid;
    await Admin.destroyOne({ id:id });
    req.addFlash('success', msg1('SubAdminDeleted', lang));
    res.status(rescode.OK);
    res.redirect('/admin/subAdminList');
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
    res.view('pages/admin/users', {layout: 'layouts/admin',users});
  } catch (error) {
    console.log(error);
    res.status(rescode.SERVER_ERROR);
    res.view('500', {error});
  }
};

getAccounts = async (req, res) => {
  const lang = req.getLocale();
  try {
    let accounts = await Account.find().populate('owner');
    res.view('pages/admin/accounts', {layout: 'layouts/admin',accounts});
  } catch (error) {
    console.log(error);
    res.status(rescode.SERVER_ERROR);
    res.view('500', {error});
  }
};

getTransactions = async (req, res) => {
  const lang = req.getLocale();
  try {
    let transactions = await Transactions.find().populate('user').populate('owneraccount');
    res.view('pages/admin/transactions', {layout: 'layouts/admin',transactions});
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
    // let hashpassword = await sails.helpers.hashPassword.with({
    //   password: password,
    // });
    if (req.body.firstname.trim().length <= 0) {
      //checks for empty input field
      req.addFlash('error', msg1('EmptyFirstName', lang));
      res.status(rescode.BAD_REQUEST);
      return res.redirect('/admin/users');
    } 
     if (req.body.lastname.trim().length <= 0) {
      //checks for empty input field
      req.addFlash('error', msg1('EmptyLastName', lang));
      res.status(rescode.BAD_REQUEST);
      return res.redirect('/admin/users');
    }
    await Users.updateOne({ id:id }).set({
      firstname: firstname,
      lastname: lastname,
      email: email,
      // password: hashpassword
    });
    res.status(rescode.OK);
    req.addFlash('success', msg1('UserUpdated', lang));
    res.redirect('/admin/users');
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
    let account = await Account.find({ owner:id});
    account.forEach(async (data) => {
      await Transactions.destroy({owneraccount:data.id});
    });
    await Account.destroy({ owner:id});
    await Users.destroyOne({ id:id });
    req.addFlash('success', msg1('UserDeleted',lang));
    res.redirect('/admin/users');
  } catch (error) {
    console.log(error);
    res.status(rescode.SERVER_ERROR);
    res.view('500', {error});
  }
};

accountUpdate = async (req, res) => {
  const lang = req.getLocale();
  try {
    const id = req.params.accid;
    if (req.body.accountname.trim().length <= 0) {
      //checks for empty input field
      req.addFlash('error', msg1('EmptyAccountName', lang));
      res.status(rescode.BAD_REQUEST);
      return res.redirect('/admin/accounts');
    } 
    await Account.updateOne({ id:id }).set({
      accountname:req.body.accountname
    });
    res.status(rescode.OK);
    req.addFlash('success', msg1('AccountUpdated', lang));
    res.redirect('/admin/accounts');
  } catch (error) {
    console.log(error);
    res.status(rescode.SERVER_ERROR);
    res.view('500', {error});
  }
};

accountDelete = async (req,res) => {
  try {
    const lang = req.getLocale();
    const id = req.params.accid;
    await Account.findOne({ id:id});
    await Transactions.destroy({owneraccount:id});
    await Account.destroy({ id:id});
    req.addFlash('success', msg1('AccountDeleted',lang));
    res.redirect('/admin/accounts');
  } catch (error) {
    console.log(error);
    res.status(rescode.SERVER_ERROR);
    res.view('500', {error});
  }
};

transactionUpdate = async (req, res) => {
  const lang = req.getLocale();
  try {
    const id = req.params.transid;
    let result = await Transactions.findOne({ id: id });
    let data = await Account.findOne({ id: result.owneraccount });
    //gets current balance from account
    let balance = data.balance;
    let { description, amount } = req.body;
    amount = Number(amount);
    let type = req.body.type.toLowerCase();
    //checks for input amount
    if(amount > 0){
      amount = amount;
    } else {
      //if amount is negative sends error
      req.addFlash('error', msg1('InvalidAmount', lang));
      res.status(rescode.BAD_REQUEST);
      return res.redirect('/admin/transactions');
    }
    //checks the type of transaction from input
    if(type === 'income' || type === 'expense') {
      type = type;
    } else {
      //if type is other than income or expense
      req.addFlash('error', msg1('InvalidType', lang));
      res.status(rescode.BAD_REQUEST);
      return res.redirect('/admin/transactions');
    }
    //gets existing transaction's type
    if (result.type === 'income') {
      //check for updating transaction's type
      if (type === 'income'){
        balance -= result.amount;
        balance += amount;
      } else if (type === 'expense') {
        balance -= result.amount;
        balance -= amount;
      }
    } else if (result.type === 'expense') {
      if (type === 'income') {
        balance += result.amount;
        balance += amount;
      } else if (type === 'expense') {
        balance += result.amount;
        balance -= amount;
      }
    }
    //updates the transaction
    let record = await Transactions.updateOne({ id: id })
     .set({
       type: type,
       description: description,
       amount: amount,
     });
    //updates balance in account
    let upd = await Account.updateOne({ id: result.owneraccount })
     .set({ balance: balance });
    req.addFlash('success', msg1('TransactionUpdated', lang));
    res.status(rescode.OK);
    res.redirect('/admin/transactions');
  } catch (error) {
    console.log(error);
    res.status(rescode.SERVER_ERROR);
    res.view('500', {error});
  }
};

transactionDelete = async (req, res) => {
  const lang = req.getLocale();
  try {
    let id = req.params.transid;
    let result = await Transactions.findOne({ id: id });
    let data = await Account.findOne({ id: result.owneraccount });
    //gets current balance from account
    let balance = data.balance;
    //checks for transaction type
    if (result.type === 'income') {
      balance -= result.amount;
    } else if (result.type === 'expense') {
      balance += result.amount;
    }
    //updates balance in account
    let record = await Account.updateOne({ id: result.owneraccount })
     .set({ balance: balance });
    //deletes the transaction
    let del = await Transactions.destroyOne({ id: id });
    req.addFlash('success', msg1('TransactionDeleted', lang));
    res.status(rescode.OK);
    res.redirect('/admin/transactions');
  } catch (error) {
    console.log(error);
    res.status(rescode.SERVER_ERROR);
    res.view('500', {error});
  }
};

module.exports = {
  getAll,
  adminLogin,
  adminLogout,
  getSubAdmin,
  createSubAdmin,
  deleteSubAdmin,
  getUsers,
  getAccounts,
  getTransactions,
  userUpdate,
  userDelete,
  accountUpdate,
  accountDelete,
  transactionUpdate,
  transactionDelete
};

