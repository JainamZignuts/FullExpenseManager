/**
 * check for authorization.
 * Apply on that routes which contains account's id in url.
 */

 const rescode = sails.config.constants.httpStatusCode;
 const msg = sails.config.messages.Authorization;
 const msg1 = sails.config.getMessages;
 const jwt = require('jsonwebtoken');

module.exports = async (req, res, proceed) => {
    const lang = req.getLocale();
    try {
        const token = req.cookies.token;
        let tokendb;
        //verify token
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        req.adminData = decoded;
    
        //finds user by id got from token
          let result = await Admin.findOne({ id: req.adminData.adminId });
          //stores token from user's database
          tokendb = result.token;
          
        //matching both token
        if (token !== tokendb) {
          //if token mismatches
          req.addFlash('error', msg1('TokenMismatched', lang));
          res.status(rescode.BAD_REQUEST);
          return res.redirect('/admin/login');
        } else {
          return proceed();
        }
    } catch (error) {
         //if token expired
    if (error instanceof jwt.TokenExpiredError) {
        // return res.send(msg1('TokenExpired', lang));
        req.addFlash('error', msg1('TokenExpired', lang));
        await Admin.updateOne({ id: req.adminData.adminId}).set({
          token:null,
          isActive:false
        });
        return res.redirect('/admin/login');
      } else {
        res.status(rescode.UNAUTHORIZED);
        res.redirect('/admin/login');
      }
    }
};

