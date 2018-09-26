var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index.route');
var usersRouter = require('./routes/users.route');
var catalogRouter = require('./routes/catalog.route');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
const mongoose = require('mongoose');
var db = 'mongodb://localhost:27017/test';

var db = process.env.MONGODB_URI || 'mongodb://reef:maryam15@ds041494.mlab.com:41494/locallibrary';
// mongoose.connect(db, { useNewUrlParser: true } ).then(() => {
//   console.log('App is connected to database successfully');
// }, (err) => {
//   console.log('An error has occured! ', err);
// });
mongoose.connect(db, { useNewUrlParser: true }, (err) => {
  if(err) console.log(err)
  else console.log('App is connected to database successfully');
})
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/catalog', catalogRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;
