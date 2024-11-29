const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

public_users.post('/register', function (req, res) {
    const { username, password } = req.body; // Extract username and password from request body

    // Check if both username and password are provided
    if (!username || !password) {
        return res.status(400).send("Username and password are required.");
    }

    // Check if the username already exists
    if (users[username]) {
        return res.status(409).send("Username already exists. Please choose another.");
    }

    // Register the new user
    users[username] = { password }; // Store the user with their password
    res.status(201).send("User registered successfully.");
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
        // Making an asynchronous call to get the book list from an external source
        const response = await axios.get('https://scholashka-6000.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/');
        res.status(200).json(response.data); // Send the fetched books as a JSON response
    } catch (error) {
        res.status(500).send("Error fetching book list.");
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',async function (req, res) {
    const isbn = req.params.isbn;
    try {
        // Making an asynchronous call to fetch book details by ISBN
        const response = await axios.get(`https://scholashka-6000.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/isbn/${isbn}`);
        console.log('response',response);
        if (response.data) {
            res.status(200).json(response.data);  // Send the fetched book details as a JSON response
        } else {
            res.status(404).send(`No book found with ISBN: ${isbn}`);
        }
    } catch (error) {
        res.status(500).send(`Error fetching book details for ISBN: ${isbn}`);
    }
 });
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author; // Get author name from URL parameters
    try {
        // Making an asynchronous call to fetch books by author
        const response = await axios.get(`https://scholashka-6000.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/author/${author}`);
        const bookDetails = response.data;

        if (bookDetails.length > 0) {
            res.status(200).json(bookDetails);  // Send the fetched books by author as a JSON response
        } else {
            res.status(404).send(`No books found for author: ${author}`);
        }
    } catch (error) {
        res.status(500).send(`Error fetching books for author: ${author}`);
    }
});
// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title;
    try {
        // Making an asynchronous call to fetch books by title
        const response = await axios.get(`https://scholashka-6000.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/title/${title}`);
        const bookDetails = response.data;

        if (bookDetails.length > 0) {
            res.status(200).json(bookDetails);  // Send the fetched books by title as a JSON response
        } else {
            res.status(404).send(`No books found for title: ${title}`);
        }
    } catch (error) {
        res.status(500).send(`Error fetching books for title: ${title}`);
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (book) {
        // If the book exists, send the reviews
        res.status(200).json(book.reviews);
    } else {
        // If the book doesn't exist, send a 404 status with an error message
        res.status(404).send(`Book not found with ISBN: ${isbn}`);
    }
});

module.exports.general = public_users;
