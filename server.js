
var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var app = express();
var Schema = mongoose.Schema;

app.use(bodyParser.json());

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/booksAuthors');

var AuthorSchema = new mongoose.Schema({
    first_name: {type: String, required: true, minlength: 2},
    last_name: {type: String, required: true, minlength: 2},
    birthdate: {type: Date , required:true},
    books: [{type: Schema.Types.ObjectId, ref:'Books'}]
}, {timestamps:true});

var BookSchema = new mongoose.Schema({
    title: {type: String, required: true, minlength: 2},
    publication_year: {type: Number, max: 2018, required: true, minlength:4},
    _author: { type: Schema.Types.ObjectId, ref: 'Authors' }
}, {timestamps:true});

mongoose.model('Authors', AuthorSchema);
mongoose.model('Books', BookSchema);

var Author = mongoose.model('Authors');
var Book = mongoose.model('Books');

app.get('/authors', function(req, res) {
    Author.find({}, function(err, authors) {
        if (err) {
            console.log(err);
            res.json({message: "Error", error: err });
        } else {
            res.json({message: "Success", data: authors});
        }
    })
})

app.get('/authors/:id', function(req, res) {
    Author.findOne({_id: req.params.id}, function(err) {
        if (err){
            console.log(err);
            res.json({message: "Error", error: err});
        }
    })
    .populate('books')
    .exec(function(err, author) {
        if (err){
            console.log(err);
            res.json({message: "Error", error: err});
        } else {
            res.json({message: "Success", author: author});
        }
    })
})

app.post('/authors', function(req, res) {
    var dob = new Date(req.body.birthdate);
    let author = new Author({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        birthdate: dob,
    });
    author.save(function(err, author) {
        if (err) {
            console.log(err);
            res.json({message: "Error", error: err});
        } else {
            res.json({message: "Successfully saved new author: ", author: author});
        }
    })
})

app.post('/authors/:id/new_book', function(req, res) {
    Author.findOne({_id: req.params.id}, function(err, author) {
        if(err) {
            console.log(err);
            res.json({message: "Error", error: err});
        } else {
            var book = new Book({
                title: req.body.title,
                publication_year: req.body.publication_year,
            });
            book._author = author._id;
            book.save(function(err, book) {
                if (err) {
                    console.log(err);
                    res.json({message: "Error", error: err});
                } else {
                    author.books.push(book);
                    author.save(function(err) {
                        if(err) {
                            console.log(err);
                            res.json({message: "Error", error: err});
                        } else {
                            res.json({message: "Successfully added a new book!", book: book});
                        }
                    })
                }
            })
        }
    })
})

app.put('/authors/:id', function(req, res) {
    var dob = new Date(req.body.birthdate);
    Author.updateOne({_id: req.params.id}, {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        birthdate: dob,
    }, function(err, author) {
        if (err) {
            console.log(err);
            res.json({message: "Error", error: err});
        } else {
            res.json({message: "Successfully updated", dbResponse: author});
        }
    });
})

app.delete('/authors/:id', function(req, res) {
    Author.findOneAndRemove({_id: req.params.id}, function(err) {
        if (err) {
            console.log(err);
            res.json({message: "Error", error: err});
        } else {
            res.json({message: "Author deleted from the db"});
        }
    })
})

app.listen(8000, function() {
    console.log('listening on port 8000');
})