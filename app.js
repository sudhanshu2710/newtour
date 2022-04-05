const express = require('express');
const morgan = require('morgan'); // fir the logs
const AppError = require('./utils/appError');
const tourRouter = require('./Routes/tourRoutes');
const reviewRouter = require('./Routes/reviewRoutes');
const userRouter = require('./Routes/usersRoutes');
const globalErrorHandler = require('./controllers/errorController');
const cors = require('cors');
const app = express();
app.use(cors());
//1) middle ware
//morgan is a Node.js and Express middleware to log HTTP requests and errors,
//and simplifies the process. In Node.js and Express, middleware is a function
//that has access to the request and response lifecycle methods, and the next()
//method to continue logic in your Express server.
console.log(process.env.NODE_ENV, 'this is NODE_ENV');
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json()); // this is acting as middleware for now, requestes is being processed in post request.
app.use(express.static(`${__dirname}/public`)); // to get access to static files
app.use((req, res, next) => {
  // console.log("helo from middleware");
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// app.get("/", (req, res) => {
//   res.status(404).json({ message: "hello from server side!!", app: "Natours" });
// });
// app.post("/", (req, noderes) => {
//   res.send("you can post to this endpoint....");
// });

//2) route handler

//3) routes

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter); //these(tourRouter,userRouter) are actually middleware but only for the given respectiv routes
app.use('/api/v1/reviews', reviewRouter);
// we are using all as we want this default url to run for all requests that is get put patch delete, not just for only one.
//NOTE: this will run for every url except the above two, and if u write this above all then not matter what
//this will only run for all the url even if it is correct.
app.all('*', (req, res, next) => {
  //===============================================================================
  // const err = new Error(`can't find ${req.originalUrl} on this server!`);
  // err.status = 'fail';
  // err.statusCode = 400;
  //next(err); // if you pass anything in next() then it will take is as error and skip all the comming middleware if there is any and
  //  go directly to error handling global middleware.
  // console.log(err);
  //===============================================================================
  // res.status(404).json({
  //   status: 'fail',
  //   message: `can't find ${req.originalUrl} on this server!`,
  // });
  // next();
  //=================================================================================
  next(new AppError(`can't find ${req.originalUrl} on this server!`, 404));
});

//implementing a global error handling Middleware.
app.use(globalErrorHandler);
module.exports = app;
