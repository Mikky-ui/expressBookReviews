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
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(JSON.stringify(books));
    }, 1000);
  })
  .then(booksJSON => {
    res.status(200).send(booksJSON);
  })
  .catch(error => {
    res.status(500).json({ message: "Error fetching books", error: error.message });
  });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',async function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  try {
    const book = await new Promise((resolve, reject) => {
      setTimeout(() => {
        const book = books[isbn];
        if (book) {
          resolve(book);
        } else {
          reject(new Error("Book not found"));
        }
      }, 1000);
    });
    res.json(book);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;
    new Promise((resolve, reject) => {
      setTimeout(() => {
        const authorBooks = Object.values(books).filter(book => book.author === author);
        if (authorBooks.length > 0) {
          resolve(authorBooks);
        } else {
          reject(new Error("Could not find - No Books by this Author"));
        }
      }, 1000);
    })
    .then(authorBooks => {
      res.json(authorBooks);
    })
    .catch(error => {
      res.status(404).json({ message: error.message });
    });
});

// Get all books based on title
public_users.get('/title/:title',async function (req, res) {
    const title = req.params.title.toLowerCase();
    try {
      const titleBooks = await new Promise((resolve, reject) => {
        setTimeout(() => {
          const filteredBooks = Object.entries(books)
            .map(([isbn, book]) => ({ isbn, ...book }))
            .filter(book => book.title.toLowerCase().includes(title));
          if (filteredBooks.length > 0) {
            resolve(filteredBooks);
          } else {
            reject(new Error("No books found with this title"));
          }
        }, 1000);
      });
      res.json(titleBooks);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
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
