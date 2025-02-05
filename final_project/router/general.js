const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    if (users.find((user) => user.username === username)) {
      return res.status(409).json({ message: "Username already exists" });
    }
    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully" });
});
  
// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  return res.status(200).send(JSON.stringify(books));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    res.json(book);
  } else {
    res.status(404).json({ message: "Book not found" });
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;
    const authorBooks = Object.values(books).filter(book => book.author === author);
    if (authorBooks.length > 0) {
      res.json(authorBooks);
    } else {
      res.status(404).json({ message: "Could not find - No Books by this Author" });
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title.toLowerCase();
    const titleBooks = Object.entries(books)
      .map(([isbn, book]) => ({ isbn, ...book }))
      .filter(book => book.title.toLowerCase().includes(title));
  
    titleBooks.length
      ? res.json(titleBooks)
      : res.status(404).json({ message: "No books found with this title" });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book && book.reviews && book.reviews.length>0) {
    res.json(book.reviews);
  } else {
    res.status(404).json({ message: "No reviews found for this book. Be the first to review" });
  }
});

module.exports.general = public_users;
