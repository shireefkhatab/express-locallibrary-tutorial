const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var BookSchema = new Schema({
    title: { type: String, required: true},
    author: { type: Schema.Types.ObjectId, ref: 'Author', required: true},
    summary: { type: String, required: true},
    isbn: {type: String, required: true},
    genre: [{type: Schema.Types.ObjectId, ref: 'Genre'}]
}, {collection: 'Book'});

// Virtual for book's url
BookSchema
.virtual('url')
.get( function () {
    return '/catalog/book/' + this._id;
});

module.exports = mongoose.model('Book', BookSchema);