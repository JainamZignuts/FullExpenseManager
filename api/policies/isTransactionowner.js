/**
 * check for authorization.
 * Apply on that routes which contains transaction's id in url.
 */

const rescode = sails.config.constants.httpStatusCode;
const msg = sails.config.messages.Authorization;
const msg1 = sails.config.getMessages;

module.exports = async (req, res, proceed) => {
  const lang = req.getLocale();
  try {
    const id = req.params.transid;
    //find transaction from the id from url
    let result = await Transactions.findOne({ id: id });
    if(result){
      //find account details with owners details associated with the transaction
      let record = await Account.findOne({ id: result.owneraccount })
       .populate('members');
      let uid = false;
      //loops through owners
      for (data of record.members) {
        console.log(data.id);
        //matches owner ids with logged in user
        if (data.id === req.userData.userId) {
          uid = true;
          break;
        }
        console.log(uid);
      }
      if (uid) {
        //if logged in user is one of the owner of the account
        //give access to that user
        return proceed();
      } else {
        //deny access to that user
        return res.status(rescode.FORBIDDEN).json({
          message: msg1('AccessDenied', lang),
        });
      }
    } else {
      return res.status(rescode.NOT_FOUND).json({
        error: msg1('TransactionNotFound', lang)
      });
    }
  } catch (error) {
    res.status(rescode.UNAUTHORIZED);
    res.redirect('/login');
  }
};
