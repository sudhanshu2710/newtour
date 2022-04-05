module.exports = (fn) => {
  // see video for this catchAsync function
  return (req, res, next) => {
    fn(req, res, next).catch((err) => {
      next(err);
    });
  };
};
