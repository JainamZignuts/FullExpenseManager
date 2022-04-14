/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` your home page.            *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

  '/': {
    view: 'pages/homepage',
    locals: {
      layout: 'layouts/prelayout'
    }
  },
  '/signup': {
    view: 'pages/signup',
    locals: {
      layout: 'layouts/prelayout'
    }
  },
  '/login': {
    view: 'pages/login',
    locals: {
      layout: 'layouts/prelayout'
    }
  },
  'GET /logout' : 'UsersController.userLogout',
  '/home': { view: 'pages/home' },
  '/home/updateaccount': { view: 'pages/updateAccount' },
  'GET /home' : 'AccountController.getAccounts',
  'POST /signup' : 'UsersController.userSignup',
  'POST /login' : 'UsersController.userLogin',
  'POST /home/addaccount' : 'AccountController.createAccount',
  'GET /home/updateaccount/:accid' : 'AccountController.getUpdateAccount',
  'POST /home/updateaccount/:accid' : 'AccountController.updateAccount',
  'GET /home/deleteaccount/:accid' : 'AccountController.deleteAccount',
  'GET /home/addmember/:accid' : 'MemberController.getAddMember',
  'POST /home/addmember/:accid' : 'MemberController.addMembers',
  'GET /home/transaction/create/:accid' : 'TransactionsController.getAddTransaction',
  'POST /home/transaction/create/:accid' : 'TransactionsController.createTransaction',
  'GET /home/transaction/update/:transid' : 'TransactionsController.getUpdateTransaction',
  'POST /home/transaction/update/:transid' : 'TransactionsController.updateTransaction',
  'GET /home/transaction/delete/:transid' : 'TransactionsController.deleteTransaction',
  'GET /home/account/:accid' : 'AccountController.getParticularAccount',


  /***************************************************************************
  *                                                                          *
  * More custom routes here...                                               *
  * (See https://sailsjs.com/config/routes for examples.)                    *
  *                                                                          *
  * If a request to a URL doesn't match any of the routes in this file, it   *
  * is matched against "shadow routes" (e.g. blueprint routes).  If it does  *
  * not match any of those, it is matched against static assets.             *
  *                                                                          *
  ***************************************************************************/


};
