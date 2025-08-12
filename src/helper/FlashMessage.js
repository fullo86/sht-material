const FlashMessages = (req, res, next) => {
  res.locals.status = req.flash('status');
  res.locals.msg = req.flash('msg');
  next();
};

module.exports = FlashMessages;
