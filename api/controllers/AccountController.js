/**
 * AccountController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const rescode = sails.config.constants.httpStatusCode;
const msg = sails.config.messages.Account;
const msg1 = sails.config.getMessages;
/**
  * Display logged in user's all accounts
  *
  * (GET /home)
  */
getAccounts = async (req, res) => {
  try {
    //get all account's details associated with logged in user.
    let result = await Users.findOne({
      where: { id: req.userData.userId },
      select: ['email', 'firstname', 'lastname'],
    }).populate('accounts');
    res.status(rescode.OK);
    res.view('pages/home',{result});
  } catch (error) {
    console.log(error);
    res.status(rescode.SERVER_ERROR).json({
      error: error,
    });
  }
};

/**
  * Display particular account's details along with user and transaction details.
  *
  * (GET /home/account/:accid)
  */
getParticularAccount = async (req, res) => {
  try {
    //get particular account's details along with its transactions and owners.
    let result = await Account.findOne({ id: req.params.accid })
       .populate('owners', { select: ['firstname', 'lastname', 'email'] })
       .populate('transactions', {sort: 'createdAt DESC'});
    console.log(result);
    res.status(rescode.OK);
    res.view('pages/accountDetails', {result});
  } catch (error) {
    console.log(error);
    res.status(rescode.SERVER_ERROR).json({
      error: error,
    });
  }
};

/**
  * Create an account for logged in user
  *
  * (POST /home)
  */
createAccount = async (req, res) => {
  const lang = req.getLocale();
  try {
    let name = req.body.accountname;
    let accname = name.trim();
    //checks for empty input value
    if(accname.length > 0){
      accname = accname;
    } else {
      return res.send(msg1('EmptyAccountName', lang));
    }
    //creates an account
    let result = await Account.create({
      accountname: accname,
      owners: req.userData.userId,
    }).fetch();
    // res.status(rescode.CREATED).json({
    //   message: msg('AccountCreated', lang),
    //   result,
    // });
    res.redirect('/home');
  } catch (error) {
    console.log(error);
    res.status(rescode.SERVER_ERROR).json({
      error: error,
    });
  }
};

getUpdateAccount = async (req, res) => {
  const id = req.params.accid;
  let result = await Account.findOne({id:id});
  res.status(rescode.OK);
  res.view('pages/updateAccount', {result});
};

/**
  * Updates the accountname of an account
  *
  * (PATCH /home/update/:accid)
  */
updateAccount = async (req, res) => {
  const lang = req.getLocale();
  try {
    const id = req.params.accid;
    //checks for empty input value
    if(req.body.accountname.trim().length <= 0){
      return res.send(msg1('EmptyAccountName'), lang);
    }
    //updates accountname
    let result = await Account.updateOne({ id: id }).set({
      accountname: req.body.accountname.trim(),
    });
    // res.status(rescode.OK).json({
    //   message: msg1('AccountUpdated', lang),
    //   result,
    // });
    res.redirect('/home');
  } catch (error) {
    console.log(error);
    res.status(rescode.SERVER_ERROR).json({
      error: error,
    });
  }
};

/**
  * Delete a particular account and also deletes all transactions related to it
  *
  * (DELETE /home/delete/:accid)
  */
deleteAccount = async (req, res) => {
  const lang = req.getLocale();
  try {
    const id = req.params.accid;
    //deletes transactions from database associated with the account that is going to be deleted.
    let record = await Transactions.destroy({ owneraccount: id }).fetch();
    //deletes the requested account
    let result = await Account.destroyOne({ id: id });
    // res.status(rescode.OK).json({
    //   message: msg1('AccountDeleted', lang),
    // });
    res.redirect('/home');
  } catch (error) {
    console.log(error);
    res.status(rescode.SERVER_ERROR).json({
      error: error,
    });
  }
};

module.exports = {
  getAccounts,
  getParticularAccount,
  createAccount,
  getUpdateAccount,
  updateAccount,
  deleteAccount,
};
