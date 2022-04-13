/**
 * TransactionsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const rescode = sails.config.constants.httpStatusCode;
const msg = sails.config.getMessages;

getAddTransaction = async (req, res) => {
  try {
    let id = req.params.accid;
    let result = await Account.findOne({id:id});
    res.status(rescode.OK);
    res.view('pages/addTransaction', {result});
  } catch (error) {
    res.status(rescode.SERVER_ERROR);
    res.view('500', {error});
  }
};

getUpdateTransaction = async (req, res) => {
  try {
    const id = req.params.transid;
    let record = await Transactions.findOne({id:id});
    console.log(record);
    res.status(rescode.OK);
    res.view('pages/updateTransaction', {record});
  } catch (error) {
    res.status(rescode.SERVER_ERROR);
    res.view('500', {error});
  }
};

/**
  * Display all transactions for a particular account
  *
  * (GET /home/account/:accid/transactions)
  */
getTransactions = async (req, res) => {
  const lang = req.getLocale();
  try {
    id = req.params.accid;
    //finds transactions and sort by date descending
    let result = await Transactions.find({ where: { owneraccount: id }, sort: 'createdAt DESC' })
     .populate('user');
    //if transaction found
    if(result.length > 0) {
      res.status(rescode.OK).json({
        Transactions: result
      });
    } else {
      //if there isn't any transaction yet
      res.status(rescode.NOT_FOUND).json({
        message: msg('TransactionNotFound', lang)
      });
    }
  } catch (error) {
    console.log(error);
    res.status(rescode.SERVER_ERROR).json({
      error: error
    });
  }
};

/**
  * Creates a transaction and update balance in account accordingly
  *
  * (POST /home/transaction/create/:accid)
  */
createTransaction = async (req, res) => {
  const lang = req.getLocale();
  try {
    //gets account details
    let accountData = await Account.findOne({ id: req.params.accid });
    //gets account's current balance
    let balance = accountData.balance;
    let { description, amount } = req.body;
    console.log(description);
    console.log(amount);
    const type = req.body.type.toLowerCase();
    //checks for input amount
    if(amount > 0){
      amount = amount;
    } else {
      //if amount is negative sends error
      return res.status(rescode.BAD_REQUEST).json({
        error: msg('InvalidAmount', lang)
      });
    }
    //checks the type of transaction
    if (type === 'income') {
      balance += Number(amount);
    } else if (type === 'expense') {
      balance -= Number(amount);
    } else {
      //if type is other than income or expense
      return res.status(rescode.BAD_REQUEST).json({
        error: msg('InvalidType', type)
      });
    }
    //creates the transaction
    let result = await Transactions.create({
      type: type,
      description: description,
      amount: amount,
      owneraccount: accountData.id,
      user: req.userData.userId
    }).fetch();
    //updates balance in account
    let upd = await Account.updateOne({ id: req.params.accid })
     .set({ balance: balance });
    res.status(rescode.OK).json({
      message: msg('TransactionCreated', lang),
      result: result,
      account: upd,
    });
  } catch (error) {
    res.status(rescode.SERVER_ERROR);
    res.view('500', {error});
  }
};

/**
  * Updates a transaction and update balance in account accordingly
  *
  * (PATCH /home/transaction/update/:transid)
  */
updateTransaction = async (req, res) => {
  const lang = req.getLocale();
  try {
    const id = req.params.transid;
    let result = await Transactions.findOne({ id: id });
    let data = await Account.findOne({ id: result.owneraccount });
    //gets current balance from account
    let balance = data.balance;
    let { description, amount } = req.body;
    let type = req.body.type.toLowerCase();
    console.log(type);
    //checks for input amount
    if(amount >= 0){
      amount = amount;
    } else {
      //if amount is negative sends error
      return res.status(rescode.BAD_REQUEST).json({
        error: msg('InvalidAmount', lang)
      });
    }
    //checks the type of transaction from input
    if(type === 'income' || type === 'expense') {
      type = type;
    } else {
      //if type is other than income or expense
      return res.status(rescode.BAD_REQUEST).json({
        error: msg('InvalidType', lang)
      });
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
       user: req.userData.userId
     });
    //updates balance in account
    let upd = await Account.updateOne({ id: result.owneraccount })
     .set({ balance: balance });
    res.status(rescode.OK).json({
      message: msg('TransactionUpdate', lang),
      record: record,
      upd: upd
    });
  } catch (error) {
    console.log(error);
    res.status(rescode.SERVER_ERROR).json({
      error: error
    });
  }
};

/**
  * Deletes a particular transaction and update balance in account
  *
  * (DELETE /home/transaction/delete/:transid)
  */
deleteTransaction = async (req, res) => {
  const lang = req.getLocale();
  try {
    let id = req.params.id;
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
    res.status(rescode.OK).json({
      message: msg('TransactionDeleted', lang),
      account:record,
      DeletedTransaction: del
    });
  } catch (error) {
    res.status(rescode.SERVER_ERROR).json({
      error: error
    });
  }
};

module.exports = {
  getAddTransaction,
  getUpdateTransaction,
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
