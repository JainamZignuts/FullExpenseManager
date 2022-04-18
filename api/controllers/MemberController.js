/**
 * MembercontrollerController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const rescode = sails.config.constants.httpStatusCode;
const msg = sails.config.messages.Member;
const msg1 = sails.config.getMessages;

getAddMember = async (req, res) => {
  try {
    const id = req.params.accid;
    let record = await Account.findOne({id:id});
    res.status(rescode.OK);
    res.view('pages/addMember',{record});
  } catch (error) {
    res.status(rescode.SERVER_ERROR);
    res.view('500',{error});
  }
};

/**
  * Adds member to a particular account with user's email
  *
  * (POST /home/addmember/:accid)
  */
addMembers = async (req, res) => {
  const lang = req.getLocale();
  try {
    let pattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!pattern.test(req.body.email)) {
      req.addFlash('error', msg1('InvalidEmail', lang));
      res.status(rescode.BAD_REQUEST);
      return res.redirect(req.url);
    }
    let record = await Users.findOne({ email: req.body.email });
    if (record) {
      //if user found
      //checks for existing member
      let data = await AccountUser.findOne({
        account: req.params.accid,
        members: record.id,
      });
      if (data) {
        //if given user is member of thst account already
        req.addFlash('error', msg1('MemberExists', lang));
        res.status(rescode.CONFLICT);
        return res.redirect(req.url);
      } else {
        //adds user to the account as member
        await Account.addToCollection(req.params.accid, 'members').members([
          record.id,
        ]);
        req.addFlash('success', msg1('MemberAdded', lang));
        res.status(rescode.CREATED);
        res.redirect('/home/account/'+req.params.accid);
      }
    } else {
      //user does not exists in database
      req.addFlash('error', msg1('UserNotExists', lang));
      res.status(rescode.NOT_FOUND);
      return res.redirect(req.url);
    }
  } catch (error) {
    console.log(error);
    res.status(rescode.SERVER_ERROR);
    res.view('500',{error});
  }
};

/**
  * Deletes a particular member from a particular account
  *
  * (POST /home/deletemember/:accid)
  */
deleteMembers = async (req, res) => {
  const lang = req.getLocale();
  try {
    await Account.findOne({ id: req.params.accid });
    //find the user in database from input
    let record = await Users.findOne({ id: req.params.uid });
    if (record) {
      let data = await AccountUser.find({
        account: req.params.accid,
        members: record.id,
      });
      if (data) {
        //if user is part of the account
        //removes the particular member from account.
        await Account.removeFromCollection(req.params.accid, 'members').members([
          record.id,
        ]);
        req.addFlash('success', msg1('MemberDeleted', lang));
        res.status(rescode.OK);
        res.redirect('/home/account/'+req.params.accid);
      } else {
        //given user is not the member of that accoount
        req.addFlash('error', msg1('MemberNotFound', lang));
        res.status(rescode.NOT_FOUND);
        return res.redirect(req.url);
      }
    } else {
      //user does not exists in database
      req.addFlash('error', msg1('UserNotExists', lang));
      res.status(rescode.NOT_FOUND);
      return res.redirect(req.url);
    }
  } catch (error) {
    console.log(error);
    res.status(rescode.SERVER_ERROR);
    res.view('500',{error});
  }
};

module.exports = {
  getAddMember,
  addMembers,
  deleteMembers,
};
