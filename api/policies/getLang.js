module.exports = async (req, res, proceed) => {
  const lang = req.headers.lang;
  if(lang){
    req.setLocale(lang);
  }
  else{
    req.setLocale('en');
  }
  return proceed();
};
