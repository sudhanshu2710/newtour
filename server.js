const dotenv = require('dotenv');
const mongoose = require('mongoose');
process.on('uncaughtException', (err) => {
  //catching uncaugth exception --- alwasy write at top
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});
//console.log(x);              this is related to process.on('uncaughtException', (err) => {  ........    abhi koi error will be catch by fun even if u try to get not definde varialble anywherer in the application
dotenv.config({ path: './config.env' });

const app = require('./app'); // app should be below dotenv
//console.log(process.env);
//console.log(process.env.NODE_ENV);
const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((con) => {
    //  console.log(con.connections);
    console.log('DB connected');
  });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});

//koi bhi external error like database se connect nhi ho rha ya kuch bhi sabko handle karne k liye. (asynchronous ones)
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);

  server.close(() => {
    process.exit(1);
  });
});
