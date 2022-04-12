/**
 *  Get the token, checks it in database and verify it.
 */

const rescode = sails.config.constants.httpStatusCode;
const msg = sails.config.messages.Authorization;
const msg1 = sails.config.getMessages;
const jwt = require('jsonwebtoken');

module.exports = async (req, res, proceed) => {
  const lang = req.getLocale();
  try {
    //get token from headers with 1st part that splitted with whitespace
    //eg. Bearer 'TOKEN'
    const token = req.headers.authorization.split(' ')[1];

    //verify token
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    req.userData = decoded;

    //finds user by id got from token
    let result = await Users.findOne({ id: req.userData.userId });

    //stores token from user's database
    const tokendb = result.token;

    //matching both token
    if (token !== tokendb) {
      //if token mismatches
      return res.status(rescode.BAD_REQUEST).json({
        message: msg1('TokenMismatched', lang),
      });
    } else {
      return proceed();
    }
  } catch (err) {
    //if token expired
    if (err instanceof jwt.TokenExpiredError) {
      return res.send(msg1('TokenExpired', lang));
    } else {
      return res.status(rescode.UNAUTHORIZED).json({
        message: msg1('AuthError', lang),
      });
    }
  }
};
