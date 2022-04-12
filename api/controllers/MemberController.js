/**
 * MembercontrollerController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const rescode = sails.config.constants.httpStatusCode;
const msg = sails.config.messages.Member;
const msg1 = sails.config.getMessages;

/**
  * Adds member to a particular account with user's email
  *
  * (POST /home/addmember/:accid)
  */
addMembers = async (req, res) => {
  const lang = req.getLocale();
  try {
    let record = await Users.findOne({ email: req.body.email });
    if (record) {
      //if user found
      //checks for existing member
      let data = await AccountUser.findOne({
        account: req.params.id,
        owners: record.id,
      });
      if (data) {
        //if given user is member of thst account already
        res.status(rescode.CONFLICT).json({
          message: msg1('MemberExists', lang),
        });
      } else {
        //adds user to the account as member
        await Account.addToCollection(req.params.id, 'owners').members([
          record.id,
        ]);
        res.status(rescode.CREATED).json({
          message: msg1('MemberAdded', lang),
        });
      }
    } else {
      //user does not exists in database
      return res.status(rescode.NOT_FOUND).json({
        error: msg('UserNotExists', lang),
      });
    }
  } catch (error) {
    console.log(error);
    res.status(rescode.SERVER_ERROR).json({
      error: error,
    });
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
    await Account.findOne({ id: req.params.id });
    //find the user in database from input
    let record = await Users.findOne({ email: req.body.email });
    if (record) {
      let data = await AccountUser.find({
        account: req.params.id,
        owners: record.id,
      });
      if (data) {
        //if user is part of the account
        //removes the particular member from account.
        await Account.removeFromCollection(req.params.id, 'owners').members([
          record.id,
        ]);
        res.status(rescode.OK).json({
          message: msg1('MemberDeleted', lang),
        });
      } else {
        //given user is not the member of that accoount
        res.status(rescode.NOT_FOUND).json({
          message: msg('MemberNotFound', lang),
        });
      }
    } else {
      //user does not exists in database
      return res.status(rescode.NOT_FOUND).json({
        error: msg('UserNotExists', lang),
      });
    }
  } catch (error) {
    console.log(error);
    res.status(rescode.SERVER_ERROR).json({
      error: err,
    });
  }
};

module.exports = {
  addMembers,
  deleteMembers,
};
