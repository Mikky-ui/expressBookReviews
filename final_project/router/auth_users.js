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
    const token = jwt.sign({username}, 'your_secret_key', {expiresIn: 60 * 60});
    req.session.username = username;
    // Save the token in the session
    /*req.session.authorization = {
      token,
      username
    };*/

    return res.status(200).json({ message: "Login successful", token: token });
  } else {
    return res.status(401).json({ message: "Invalid username or password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  /*const isbn = req.params.isbn;
  let filtered_book = books[isbn]
  if (filtered_book) {
      let review = req.query.review;
      let reviewer = req.session.authorization['username'];
      if(review) {
          filtered_book['reviews'][reviewer] = review;
          books[isbn] = filtered_book;
      }
      res.send(`The review for the book with ISBN  ${isbn} has been added/updated.`);
  }
  else{
      res.send("Unable to find this ISBN!");
  }*/
  const {isbn} = req.params;
  const{review} = req.query;
  const username = req.session.username; //retrieve username from session

  if(!username){
    return res.status(401).json({message: "User not logged in"});
  }
  if (!isbn || !review) {
    return res.status(400).json({message: "ISBN and review are required in query"});
  }

  const bookIndex = findBookIndexByISBN(isbn);

  if (bookIndex === undefined) {
    return res.status(404).json({message: "Book not found"});
  }

  const reviewIndex = findReviewIndexByUsernameAndISBN(username, isbn);

  if(reviewIndex === -1){
        // If the user has already reviewed the book, modify the existing review
        books[isbn].reviews[reviewIndex].review = review;
        books[isbn].reviews[reviewIndex].timestamp = Date.now();
        return res.status(200).json({ message: "Review modified successfully" });
  } else {
        // If the user hasn't reviewed the book, add a new review
        books[isbn].reviews.push({ username, review, timestamp: Date.now() });
        return res.status(201).json({ message: "Review added successfully" });
  }
});

// Task 9 - Deleting a book review

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    let reviewer = req.session.authorization['username'];
    let filtered_review = books[isbn]["reviews"];
    if (filtered_review[reviewer]){
        delete filtered_review[reviewer];
        res.send(`Reviews for the ISBN  ${isbn} posted by the user ${reviewer} deleted.`);
    }
    else{
        res.send("Can't delete, as this review has been posted by a different user");
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
