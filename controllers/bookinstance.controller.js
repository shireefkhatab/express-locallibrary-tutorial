var BookInstance = require('../models/bookinstance.model');
const Book = require('../models/book.model');
var async = require('async');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
// Display list of all BookInstances.
exports.bookinstance_list = function(req, res, next) {

    BookInstance.find()
      .populate('book')
      .exec(function (err, bookinstance_list) {
        if (err) { return next(err); }
        // Successful, so render
        res.render('bookinstance_list', { title: 'Book Instance List', bookinstance_list: bookinstance_list });
      });
    
  };

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = function(req, res) {
    BookInstance.findById(req.params.id)
    .populate('book')
    .exec( function(err, bookinstance){
        if(err) {return next(err)}
        else if (bookinstance == null) {
            let err = new Error('No book instances found')
            err.status(404)
            return next(err)
        }
        else
        res.render('bookinstance_detail', {title: 'Book instances detial', bookinstance: bookinstance});
    })
};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = function(req, res, next) {       

    Book.find({},'title')
    .exec(function (err, books) {
      if (err) { return next(err); }
      // Successful, so render.
      res.render('bookinstance_form', {title: 'Create BookInstance', book_list:books});
    });
}

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [

    // Validate fields.
    body('book', 'Book must be specified').isLength({ min: 1 }).trim(),
    body('imprint', 'Imprint must be specified').isLength({ min: 1 }).trim(),
    body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),
    
    // Sanitize fields.
    sanitizeBody('book').trim().escape(),
    sanitizeBody('imprint').trim().escape(),
    sanitizeBody('status').trim().escape(),
    sanitizeBody('due_back').toDate(),
    
    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a BookInstance object with escaped and trimmed data.
        var bookinstance = new BookInstance(
          { book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values and error messages.
            Book.find({},'title')
                .exec(function (err, books) {
                    if (err) { return next(err); }
                    // Successful, so render.
                    res.render('bookinstance_form', { title: 'Create BookInstance', book_list : books, selected_book : bookinstance.book._id , errors: errors.array(), bookinstance:bookinstance });
            });
            return;
        }
        else {
            // Data from form is valid.
            bookinstance.save(function (err) {
                if (err) { return next(err); }
                   // Successful - redirect to new record.
                   res.redirect(bookinstance.url);
                });
        }
    }
];
// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = function(req, res, next) {
    BookInstance.findById(req.params.id)
    .populate('book').exec( function(err, bookinstance){
        if (err) { return next(err) }
        res.render('bookinstance_delete', { title: 'Delete book instance', bookinstance: bookinstance})
    })
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = function(req, res, next) {
    BookInstance.findByIdAndRemove(req.body.bookinstanceid, function (err){
        if (err) { return next(err) }
        res.redirect('/catalog/bookinstances')
    })
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = function(req, res, next) {
    async.parallel({
        bookinstance: function(cb){
            BookInstance.findById(req.params.id)
            .populate('book').exec(cb);
        },
        book_list: function(cb){
            Book.find(cb)
        }
    },
    function(err, results){
        if(err) { return next(err) }
        // Success
        res.render('bookinstance_form', { title: 'Update Book instance', bookinstance: results.bookinstance, book_list: results.book_list});
    })
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = function(req, res, next) {
    // Validate fields.
    body('book', 'Book must be specified').isLength({ min: 1 }).trim();
    body('imprint', 'Imprint must be specified').isLength({ min: 1 }).trim();
    body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601();
    
    // Sanitize fields.
    sanitizeBody('book').trim().escape();
    sanitizeBody('imprint').trim().escape();
    sanitizeBody('status').trim().escape();
    sanitizeBody('due_back').toDate();

    const errors = validationResult(req);

    var bookinstance = new BookInstance({
        book: req.body.book,
        imprint: req.body.imprint,
        status: req.body.status,
        due_back: req.body.due_back,
        _id: req.params.id
    })

    if(!errors.isEmpty()){
        // There are errors. Render form again with sanitized values and error messages.
        Book.find().exec( function (err, books){
            if (err) { return next(err) }
            // Success..
            res.render('bookinstance_form', { title: 'Update Book instance', bookinstance: bookinstance, book_list: books});
        })
    } else {
        BookInstance.findByIdAndUpdate(req.params.id, bookinstance, {}, function(err, theBookinstance){
            if (err) { return next(err) }
            // Success ..
            else {console.log(theBookinstance.url)
            res.redirect(theBookinstance.url);}
        })
    }

};