/**
 * check for authorization.
 * Apply on that routes which contains account's id in url.
 */

const rescode = sails.config.constants.httpStatusCode;
const msg = sails.config.messages.Authorization;
const msg1 = sails.config.getMessages;

module.exports = async (req, res, proceed) => {
  const lang = req.getLocale();
  try {
    const id = req.params.accid;
    //finds account details with owners
    let rec = await Account.findOne({ id: id }).populate('owners');
    if(rec){
      let uid = false;
      //loops through owners of accounts
      for (data of rec.owners) {
        //gets owners ids
        console.log(data.id);
        //matches it with logged in user
        if (data.id === req.userData.userId) {
          //if any id matches the loop breaks
          uid = true;
          console.log(uid);
          break;
        }
      }
      if (uid) {
        //if logged in user is one of the owners of account
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
        error: msg1('AccountNotFound', lang)
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(rescode.UNAUTHORIZED).json({
      message: msg1('AuthError', lang),
    });
  }
};
