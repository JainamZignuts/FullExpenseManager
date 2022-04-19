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
    let admin = await Admin.findOne({id:req.userData.userId});
    if(admin) {
      return proceed();
    }
    const id = req.params.accid;
    //finds account details with owners
    let rec = await Account.findOne({ id: id }).populate('members');
    if(rec){
      let uid = false;
      //loops through owners of accounts
      for (data of rec.members) {
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
      req.addFlash('error', msg1('AccountNotFound', lang));
      res.status(rescode.NOT_FOUND);
      return res.redirect('/home');
    }
  } catch (err) {
    console.log(err);
    res.status(rescode.UNAUTHORIZED);
    res.redirect('/login');
  }
};
