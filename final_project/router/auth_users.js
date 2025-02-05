const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  return users.some((user) => user.username === username)
}

const authenticatedUser = (username,password)=>{ //returns boolean
  return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  username = req.body.username
  password = req.body.password
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (authenticatedUser(username, password)) {
    // Generate a JWT token
    const token = jwt.sign({ username: username }, 'your_secret_key', { expiresIn: '3600h' });

    // Save the token in the session
    req.session.authorization = {
      token: token
    };

    return res.status(200).json({ message: "Login successful", token: token });
  } else {
    return res.status(401).json({ message: "Invalid username or password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    try {
        // Check if the user is authenticated
        if (!req.session.authorization) {
          return res.status(401).json({ message: "User not authenticated" });
        }
    
        const isbn = req.params.isbn;
        const review = req.query.review;
        const username = req.session.authorization.username;
    
        if (!isbn || !review) {
          return res.status(400).json({ message: "ISBN and review are required" });
        }
    
        // Check if the book exists
        if (!books[isbn]) {
          return res.status(404).json({ message: "Book not found" });
        }
    
        // Initialize reviews array if it doesn't exist
        if (!books[isbn].reviews) {
          books[isbn].reviews = [];
        }
    
        // Check if the user has already posted a review
        const existingReviewIndex = books[isbn].reviews.findIndex(r => r.username === username);
    
        if (existingReviewIndex !== -1) {
          // Modify existing review
          books[isbn].reviews[existingReviewIndex].review = review;
          return res.status(200).json({ message: "Review updated successfully" });
        } else {
          // Add new review
          books[isbn].reviews.push({ username, review });
          return res.status(201).json({ message: "Review added successfully" });
        }
      } catch (error) {
        console.error('Error in /auth/review/:isbn:', error);
        return res.status(500).json({ message: "An unexpected error occurred" });
      }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
