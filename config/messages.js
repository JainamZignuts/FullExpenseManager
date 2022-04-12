module.exports.messages = {
  User: {
    DuplicateEmail: 'This email already exists!.',
    MinPasswordLength: 'Password must have min 8 character.',
    UserCreated: 'User created.',
    WelcomeEmail: 'Welcome Email sent to user.',
    DefaultAccount: 'User\'s default account created.',
    AuthError: 'Auth failed.',
    EmptyFirstName: 'firstname can not be blank.',
    EmptyLastName: 'lastname can not be blank',
    InvalidEmail: 'Invalid input email',
    Login: 'Logged in successfully.',
    Logout: 'Logged out successfully.'
  },
  Authorization: {
    TokenMismatched: 'Token mismatched! Please Login.',
    TokenExpired: 'Token expired! \n Please login again.',
    AuthError: 'Auth failed.',
    AccessDenied: 'Access Denied.',
    AccountNotFound: 'Account not found.',
    TransactionNotFound: 'Transaction not found.'
  },
  Account: {
    AccountCreated: 'Account Created successfully.',
    AccountUpdated: 'Account Updated successfully.',
    AccountDeleted: 'Account Deleted successfully.',
    EmptyAccountName: 'Accountname can not be blank.'
  },
  Member: {
    MemberExists: 'Member already exists.',
    MemberAdded: 'Member Added.',
    MemberDeleted: 'Member Deleted.',
    UserNotExists: 'This User does not exist.',
    MemberNotFound: 'Member not found.'
  },
  Transaction: {
    TransactionNotFound: 'There isn\'t any transaction in this account yet.',
    TransactionCreated: 'Transaction created and Balance updated in account.',
    TransactionUpdate: 'Transaction Updated.',
    TransactionDeleted: 'Transaction Deleted.',
    InvalidType: 'Type must be of income or expense.',
    InvalidAmount: 'Amount must be greater than zero.'
  }
};
