const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');
var AuthorSchema = new Schema({
    first_name: {type: String, required: true, max: 100},
    family_name: {type: String, required: true, max: 100},
    date_of_birth: {type: Date},
    date_of_death: {type: Date}
}, {collection: 'Author'});

// Virtual for author's name
AuthorSchema
.virtual('name')
.get( function () {
    return this.family_name + ', ' + this.first_name;
})
// Virtual for author's url
AuthorSchema.virtual('url')
.get( function () {
    return '/catalog/author/' + this._id;
});
AuthorSchema
.virtual('lifespan_formatted')
.get ( function() {
    let DOB = this.date_of_birth? moment(this.date_of_birth).format('YYYY') : 'Missing';
    let DOD = this.date_of_death? moment(this.date_of_death).format('YYYY') : 'Missing';
    return  DOB + ' - ' + DOD;
})

module.exports = mongoose.model('Author', AuthorSchema);