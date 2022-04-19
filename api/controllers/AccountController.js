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
    res.status(rescode.SERVER_ERROR);
    res.view('500', {error});
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
       .populate('members', { select: ['firstname', 'lastname', 'email'] })
       .populate('owner')
       .populate('transactions', {sort: 'createdAt DESC'});
    let rec = await Transactions.find({owneraccount:req.params.accid})
    .sort('createdAt DESC')
    .populate('user');
    let record = rec.map((data) => {
      return {
        id: data.user.id,
        firstname: data.user.firstname,
        lastname: data.user.lastname
      };
    });
    res.status(rescode.OK);
    res.view('pages/accountDetails', {result,record});
  } catch (error) {
    console.log(error);
    res.status(rescode.SERVER_ERROR);
    res.view('500', {error});
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
      req.addFlash('error', msg1('EmptyAccountName', lang));
      res.status(rescode.BAD_REQUEST);
      return res.redirect('/home');
    }
    //creates an account
    let result = await Account.create({
      accountname: accname,
      owner: req.userData.userId,
      members: req.userData.userId,
    }).fetch();
    // res.status(rescode.CREATED).json({
    //   message: msg('AccountCreated', lang),
    //   result,
    // });
    req.addFlash('success', msg1('AccountCreated', lang));
    res.status(rescode.CREATED);
    res.redirect('/home');
  } catch (error) {
    console.log(error);
    res.status(rescode.SERVER_ERROR);
    res.view('500', {error});
  }
};

getUpdateAccount = async (req, res) => {
  try {
    const id = req.params.accid;
    let result = await Account.findOne({id:id});
    res.status(rescode.OK);
    res.view('pages/updateAccount', {result});
  } catch (error) {
    console.log(error);
    res.status(rescode.SERVER_ERROR);
    res.view('500', {error});
  }
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
      req.addFlash('error', msg1('EmptyAccountName', lang));
      res.status(rescode.BAD_REQUEST);
      return res.redirect(req.url);
    }
    //updates accountname
    let result = await Account.updateOne({ id: id }).set({
      accountname: req.body.accountname.trim(),
    });
    // res.status(rescode.OK).json({
    //   message: msg1('AccountUpdated', lang),
    //   result,
    // });
    req.addFlash('success', msg1('AccountUpdated', lang));
    res.status(rescode.OK);
    res.redirect('/home');
  } catch (error) {
    console.log(error);
    res.status(rescode.SERVER_ERROR);
    res.view('500', {error});
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
    req.addFlash('success', msg1('AccountDeleted', lang));
    res.status(rescode.OK);
    res.redirect('/home');
  } catch (error) {
    console.log(error);
    res.status(rescode.SERVER_ERROR);
    res.view('500', {error});
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
