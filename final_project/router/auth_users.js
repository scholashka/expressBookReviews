const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
    {
    'username': 'scholashka',
    'password': "1234"
    }
];

const isValid = (username)=>{ //returns boolean
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username,password)=>{ //returns boolean
// Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60});

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
   const isbn = req.params.isbn; // Get the ISBN from the URL parameters
    const { review } = req.query; // Get the review from the request query
    const username = req.session.authorization.username; // Simulate logged-in user via session
    console.log('req',req.query);
    // Validate if the user is logged in
    if (!username) {
        return res.status(401).send("You must be logged in to post a review.");
    }

    // Validate if a review is provided
    if (!review) {
        return res.status(400).send("Review is required.");
    }

    // Check if the book exists
    const book = books[isbn];
    if (!book) {
        return res.status(404).send(`Book not found with ISBN: ${isbn}`);
    }

    // Add or modify the review for the logged-in user
    book.reviews[username] = review;

    res.status(200).send(`Review by user '${username}' has been added/updated for book with ISBN: ${isbn}`);
});
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn; // Get the ISBN from the route parameter
    const username = req.session.authorization.username; // Get the logged-in username from session

    // Check if the user is logged in
    if (!username) {
        return res.status(401).send("You must be logged in to delete a review.");
    }

    // Check if the book exists
    const book = books[isbn];
    console.log('book',book);
    if (!book) {
        return res.status(404).send(`Book not found with ISBN: ${isbn}`);
    }

    // Check if the user has already posted a review
    if (!book.reviews[username]) {
        return res.status(404).send("You have not posted a review for this book.");
    }

    // Delete the review for the logged-in user
    delete book.reviews[username];

    // Respond with a success message
    res.status(200).send(`Review by user '${username}' has been deleted for book with ISBN: ${isbn}`);
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
