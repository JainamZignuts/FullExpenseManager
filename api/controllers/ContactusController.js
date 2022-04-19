/**
 * ContactusController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const rescode = sails.config.constants.httpStatusCode;
const msg = sails.config.getMessages;
const msg1 = sails.config.getMessages;

module.exports = {
  contactUs: async (req, res) => {
    try {
      const lang = req.getLocale();
      let { firstname, lastname, email, message } = req.body;
      let pattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

      if (firstname.trim().length <= 0) {
        //checks for empty input field
        req.addFlash("error", msg1("EmptyFirstName", lang));
        res.status(rescode.BAD_REQUEST);
        return res.redirect("/contactus");
      } else if (lastname.trim().length <= 0) {
        //checks for empty input field
        req.addFlash("error", msg1("EmptyLastName", lang));
        res.status(rescode.BAD_REQUEST);
        return res.redirect("/contactus");
      } else if (!pattern.test(email)) {
        //checks for email pattern
        req.addFlash("error", msg1("InvalidEmail", lang));
        res.status(rescode.BAD_REQUEST);
        return res.redirect("/contactus");  
      } else {
        //inserts contact us data in database

        await Contactus.create({
          firstname,
          lastname,
          email,
          message,
        }).fetch();
      
      req.addFlash("success", msg1("ContactUs", lang));
      res.status(rescode.OK);
      res.redirect("/contactus");
    }
    } catch (error) {
      console.log(error);
      res.status(rescode.SERVER_ERROR);
      res.view("500", { error });
    }
  },
};
