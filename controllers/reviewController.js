const Review = require('./../models/reviewModel');
//const factory = require('./handlerFactory');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
exports.getAllReviews = catchAsync(async (req, res, next) => {
  //as it may get executed for:
  //if the route is GET: /reviews
  //or the route is GET: /tours/5qa................/reviews         because of use of const router = express.Router({ mergeParams: true });
  // but for second case we would need review for only that particular tour
  // thats why we have filter
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };

  const reviews = await Review.find(filter);

  res.status(200).json({
    status: 'success',
    result: reviews.length,
    data: {
      reviews,
    },
  });
});
exports.setTourUserIds = (req, res, next) => {
  //Allow nested Routes
  // console.log(req.user.id);
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
