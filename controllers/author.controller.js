var Author = require('../models/author.model');
var Book = require('../models/book.model');
var async = require('async');
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display list of all Authors.
exports.author_list = function(req, res) {
    // res.send('NOT IMPLEMENTED: Author list');
    Author.find().sort([['family_name', 'ascending']]).populate('books')
    .exec( (err, author_list) => {
        if (err) {return next(err)};
        //Successful, so render
        res.render('author_list', { title: 'list_author page', author_list: author_list});
    })
};

// Display detail page for a specific Author.
exports.author_detail = function(req, res, next) {
    async.parallel({
        author: function(cb){
            Author.findById(req.params.id)
            .exec(cb)
        },
        author_books: function(cb){
            Book.find({'author': req.params.id}, 'title summary')
            .exec(cb)
        }
    }, function(err, results){
        if (err) {return next(err)}
        else if (results.author == null) {
            let err = new Error('No author found')
            res.status(404)
            return next(err)
        }
        else // Successful, so render
        res.render('author_detail', { title: 'Author detail', author: results.author, author_books: results.author_books })
    });
};

// Display Author create form on GET.
exports.author_create_get = function(req, res) {
    res.render('author_form', { title: 'Author form'})
};

// Handle Author create on POST.
exports.author_create_post = [
     // Validate fields.
     body('first_name').isLength({ min: 1 }).trim().withMessage('First name must be specified.')
     .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
 body('family_name').isLength({ min: 1 }).trim().withMessage('Family name must be specified.')
     .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
 body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601(),
 body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601(),

 // Sanitize fields.
 sanitizeBody('first_name').trim().escape(),
 sanitizeBody('family_name').trim().escape(),
 sanitizeBody('date_of_birth').toDate(),
 sanitizeBody('date_of_death').toDate(),

 // Process request after validation and sanitization.
 (req, res, next) => {

     // Extract the validation errors from a request.
     const errors = validationResult(req);

     if (!errors.isEmpty()) {
         // There are errors. Render form again with sanitized values/errors messages.
         res.render('author_form', { title: 'Create Author', author: req.body, errors: errors.array() });
         return;
     }
     else {
         // Data from form is valid.

         // Create an Author object with escaped and trimmed data.
         var author = new Author(
             {
                 first_name: req.body.first_name,
                 family_name: req.body.family_name,
                 date_of_birth: req.body.date_of_birth,
                 date_of_death: req.body.date_of_death
             });
         author.save(function (err) {
             if (err) { return next(err); }
             // Successful - redirect to new author record.
             res.redirect(author.url);
         });
     }
 }
];

// Display Author delete form on GET.
exports.author_delete_get = function(req, res, next) {
	
    async.parallel({
        author: function(callback){
            Author.findById(req.params.id).exec(callback);
        },
        authors_books: function(callback){
            Book.find({'author': req.params.id}).exec(callback)
        }
    }, function(err, results){
            if(err){  return next(err);  }
            if (results.author == null){
                res.redirect('/catalog/authors');
            }
             // Success, so render..
                res.render('author_delete', { title: 'Delete Author', author: results.author, author_books: results.authors_books});
    })
};

// Handle Author delete on POST.
exports.author_delete_post = function(req, res, next) {
    async.parallel({
        author: function (cb){
            Author.findById(req.body.authorid).exec(cb)
        },
        author_books: function(cb){
            Book.find({'author': req.body.authorid}).exec(cb)
        }
    }, function(err, results){
        if(err) {
            return next(err)
        }
        // Success
        if (results.author_books.length > 0){
            res.render('author_delete', { title: 'Author delete', author: results.author, author_books: results.author_books})
            return;
        } else {
            Author.findByIdAndRemove(req.body.authorid, function(err){
                if (err) { return next(err)}
                else { res.redirect('/catalog/authors')}
            })
        }
    });
};

// Display Author update form on GET.
exports.author_update_get = function(req, res, next) {
    Author.findById(req.params.id).exec( function(err, author) {
        if (err) { return next(err)}
        // Success ..
        res.render('author_form', { title: 'Author Update', author: author});
    })
};

// Handle Author update on POST.
exports.author_update_post = function(req, res, next) {
   body('first_name', 'First name must be specified').isLength({ min: 1}).trim();
   body('family_name', 'Family name must be specified').isLength({ min: 1}).trim();
   body('date_of_birth',  'Invalid date').optional({ checkFalsy: true }).isISO8601();
   body('date_of_death', 'Invalid date').optional({ checkFalsy: true }).isISO8601();

   sanitizeBody('first_name').trim();
   sanitizeBody('family_name').trim();
   sanitizeBody('date_of_birth').toDate();
   sanitizeBody('date_of_death').toDate();

   const errors = validationResult(req);

   var author = new Author({
    first_name : req.body.first_name,
    family_name : req.body.family_name,
    date_of_birth : req.body.date_of_birth,
    date_of_death : req.body.date_of_death,
    _id: req.params.id
   })
    
   if (!errors.isEmpty()){
       Author.findById(req.params.id).exec(function(err){
           if (err) { return next(err) }
           // Success..
           res.render('author_form', { title: 'Author Update', author: author});
       })
   }
   else {
       Author.findByIdAndUpdate(req.params.id, author, {}, function(err, the_author){
           if (err){ return next(err) }
           //Success..
           res.redirect(the_author.url);
       })
   }
   
    // Author.findByIdAndUpdate
};
