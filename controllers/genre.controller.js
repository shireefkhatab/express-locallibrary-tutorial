var Genre = require('../models/genre.model');
var Book = require('../models/book.model');
var async = require('async');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');



// Display list of all Genre.
exports.genre_list = function(req, res, next) {
    Genre.find().sort([['name', 'ascending']]).exec( (err, genre_list) => {
        if (err) { return next(err) }
        // Success, so render..
        res.render('genre_list.pug', {title: 'Genres list page', genre_list: genre_list})
    })
};

// Display detail page for a specific Genre.
exports.genre_detail = function(req, res, next) {
    async.parallel({
        genre: function(cb){
            Genre.findById(req.params.id)
            .exec(cb)
        },
        genre_books: function(cb){
            Book.find({'genre': req.params.id})
            .exec(cb)
        }
    },
    function(err, results){
        if(err) {return next(err)}
        else if (results.genre == null){ // No result
            var err = new Error('Genre not found')
            err.status(404)
            return next(err)
        }
        else { // Succesful, so render
            res.render('genre_detail', {title: 'Genre detail', genre: results.genre, genre_books: results.genre_books})
        }
    })
};

// Display Genre create form on GET.
exports.genre_create_get = function(req, res) {
    res.render('genre_form', { title: 'Create Genre' });
};

// Handle Genre create on POST.
exports.genre_create_post = [
    body('name', 'Name can\'t be empty').isLength({min: 1}).trim(),
    sanitizeBody('name').trim().escape(),
    function(req, res, next) {
        const errors = validationResult(req);
        var genre = new Genre({'name': req.body.name})
        if (!errors.isEmpty()) {
            return res.render('genre_form', { title: 'Create Genre', genre: genre, errors: errors.array() });
        } else {
            // Check if the name already exists
            Genre.findOne({'name': req.body.name})
            .exec( function(err, found_genre){
                if (err) { return next(err); }
                else if (found_genre) {
                    // Genre exists, redirect to its detail page.
                    res.redirect(found_genre.url);
                } else {
                    genre.save( function(err){
                        if(err){ return next(err) }
                        // Genre saved. Redirect to genre detail page.
                        res.redirect(genre.url);
                    })
                }
            })
        }
    }
]

// Display Genre delete form on GET.
exports.genre_delete_get = function(req, res, next) {
    Genre.findById(req.params.id).exec( function (err, genre){
        if (err) { return next(err) }
        res.render('genre_delete', { title: 'Delete genre', genre: genre});
    })
};

// Handle Genre delete on POST.
exports.genre_delete_post = function(req, res, next) {
    Genre.findByIdAndRemove(req.body.genreid, function(err){
        if (err) { return next(err) }
        res.redirect('/catalog/genres');
    })
};

// Display Genre update form on GET.
exports.genre_update_get = function(req, res, next) {
    Genre.findById(req.params.id).exec( function (err, genre){
        if (err) { return next(err); }
        // Success
        res.render('genre_form', { title: 'Update Genre', genre: genre });
    })

};

// Handle Genre update on POST.
exports.genre_update_post = function(req, res) {
    body('name', 'Name must not be empty').isLength({ min: 1}).trim();
    sanitizeBody('name').trim().escape();

    const errors = validationResult(req);

    var genre = new Genre({
        'name': req.body.name,
        _id: req.params.id //This is required, or a new ID will be assigned!
    })

    if (!errors.isEmpty()){
        // There are errors. Render form again with sanitized values/error messages.
        Genre.findById(req.params.id).exec( function(err, genre){
            if (err) { return next(err)}
            res.render('genre_form', { 'title': 'Update Genre', genre: genre});
        });
    } else {
        // Data from form is valid. Update the record.
        Genre.findByIdAndUpdate(req.params.id, genre, {}, function(err, theGenre){
            if (err) { return next(err) }
             // Successful - redirect to book detail page.
            res.redirect(theGenre.url)
        })
    }
};