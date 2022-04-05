const mongoose = require('mongoose');
const slugify = require('slugify');
//const validator = require('validator');

//here first we are actually discribing the data type for the data.
const tourSchema = new mongoose.Schema(
  {
    // name: String,
    name: {
      type: String,
      required: [true, 'A tour must have a name'], // validator
      unique: true,
      maxlength: [40, 'A tour must have max of 40 char'],
      minlength: [10, 'A tour must have min of 40 char'],
      // validate: [validator.isAlpha, 'Tour name must only contains characters without space'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },

    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        // custom validator:
        //NOTE :  HERE WE USED this KEYWORD BUT THIS WILL HAVE THE ACCESS TO THE PRICE ONLY WHEN WE ARE CREATING THE NEW DOC
        //IF WE ARE JUST UPDATING THE DOC WITH priceDiscount THEN IT WONT HAVE THE ACCESS TO price VIA this.price
        //NOTE: niche jo validator likha hai that is a syntax
        validator: function (val) {
          return val < this.price;
        },
        message: 'Discount can not be more that the original price itself.',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secreateTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
//durationWeeks is virtual property that is derived, so we can not filter by these key in url
//main motive is so we dont store unnessecary info in db which actually can be derived.
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review', //schema name
  foreignField: 'tour', // Review schema me kis key name se ya hai
  localField: '_id', //jo bhi use schema me save hai vo yha kis name se jana jata hai?
});

//like we have middleware in Express  same way we have middleware for documents also in mongo

//DOCUMENT MIDDLEWARE: runs before .save() and .create() only not for update.  ie post request pe ----     pre() is actually a defined middleware
tourSchema.pre('save', function (next) {
  //here this keyword will reffer to the document
  //console.log(this); //ye use samay ka deta dikhayega ....post req marne k just pehale
  this.slug = slugify(this.name, { lower: true }); // slugify ak key ko liya and kuch operation kiya and data me ak key or bhi zor diya that is slug
  next();
});

//DOCUMENT MIDDLEWARE: runs before .save() and .create() only  not for update. ie post request pe  ----     post() is actually a defined middleware
tourSchema.post('save', function (doc, next) {
  //console.log(doc); // ye post k bad chlta hai , ye bhi ak middle ware hi hai.
  next();
});

//QUERY MIDDLEWARE: fires before the query is executed if we dont want to show secreate tour to the users
//tourSchema.pre('find', function (next) {     // pehale aise likha tha but this will only run for .find() not for .findOne() ......but we need this to follow for each find type so we will use regular expression in place of find ....so it will run for all methods starting with the word find
tourSchema.pre(/^find/, function (next) {
  //here this keyword will reffer to the query object
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});
tourSchema.post(/^find/, function (doc, next) {
  //here this keyword will reffer to the query object
  console.log(`Query took ${Date.now() - this.start} milisec!`);
  next();
});

//AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function (next) {
  //console.log(this); // here this will point to current aggregation object
  // we want to exclude the secreateTour but it is being included by while aggregation
  //console.log(this.pipeline)
  this.pipeline().unshift({
    $match: { secreateTour: { $ne: true } },
  });

  next();
});
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
