const path = require('path');

module.exports.getMessages =  (key, lang) => {
  let localeFile = path.join(__dirname, 'locales', `${lang}.json`);
  let msgs = require(localeFile);
  return msgs[key];
};
