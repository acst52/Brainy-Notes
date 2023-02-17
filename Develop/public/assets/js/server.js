// first lets import the modules we will be using:
const express = require("express");
const path = require("path");
const fs = require("fs");
const util = require('util');

// Helper method for generating unique ids
const uuid = require('./helpers/uuid');

// so we don't share our port when when we push to GitHub
require('dotenv').config();

// create .env with PORT=**** & "npm i dotenv" in node.js to protect port, OR specify PORT if .env not found:
const PORT = process.env.PORT || 3001;

// call the express method, assign to var "app":
const app = express();


// to serve static pages, use middleware: fcn that takes argument that calls next fcn:
    // Middleware for parsing application/json and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

// GET Route for homepage
app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);

// normally, we use JSON method to create classic API obj output:
    // where will the notes be stored? in the database JSON file. 
    // Use sendFile method: when working w/ static files, want to give absolute path. Use path module (imported at top) join method which joins 2 strings to form a path / route. console.log __dirname --> gives us path to directory we are working on. then we can join it to the relative path = currentDir/fileName.  
// GET route for notes page:
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, 'db/db.json')) 
})


// GET request for retrieving ALL reviews
app.get('/api/notes', (req, res) => {
    // Log our request to the terminal
    console.info(`${req.method} request received for notes`);
    readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)));
  });
  
// POST Route for a new notes
app.post('/api/notes', (req, res) => {
    console.info(`${req.method} request received to add a tip`);
  
    const { title, topic } = req.body;
  
    if (req.body) {
      const newNote = {
        title,
        topic,
        note_id: uuid(),
      };
  
      readAndAppend(newNote, './db/tips.json');
      res.json(`Notes added successfully 🚀`);
    } else {
      res.error('Error in adding notes');
    }
  });
  
// GET Route for retrieving all the feedback
app.get('/api/feedback', (req, res) => {
    console.info(`${req.method} request received for feedback`);
  
    readFromFile('./db/feedback.json').then((data) => res.json(JSON.parse(data)));
});



// POST Route for submitting feedback
app.post('/api/feedback', (req, res) => {
    // Log that a POST request was received
    console.info(`${req.method} request received to submit feedback`);
  
    // Destructuring assignment for the items in req.body
    const { email, feedbackType, feedback } = req.body;
  
    // If all the required properties are present
    if (email && feedbackType && feedback) {
      // Variable for the object we will save
      const newFeedback = {
        email,
        feedbackType,
        feedback,
        feedback_id: uuid(),
      };
  
      readAndAppend(newFeedback, './db/feedback.json');
  
      const response = {
        status: 'success',
        body: newFeedback,
      };
  
      res.json(response);
    } else {
      res.json('Error in posting notes');
    }
});
  
app.listen(PORT, () =>
    console.log(`App listening at http://localhost:${PORT} 🚀`)
);



// ***** HEROKU *****
// Heroku helps us host our APIs
// we can take our code base, push to GitHub, then connect Heroku to GitHub so that latest commit is deployed to our project.
// heroku has its own CLI .. cant host node.js on github pages b/c not yet supported
// heroku --version should tell you version if its installed properly
  // for auth run: heroku auth:login
  // to run page: npm start 
  // then can do git add, it commit -m "initial commit" ETC
  // to create heroky page, type: heroku create
    // gens random name for URL
    // then check to see if git has remote pulls: git remote -v
    // now instead of git push origin main, we do git push heroku main (to push everything to our heroku acct)
    // heroku open (deploys page @ the herokuappdeployment URL)
  // heroku logs --tail
// npm install -g heroku. heroku --version. heroku auth:login. heroku create (creates link). git push heroku main. heroku open (opens deployed app from CLI)
  // make sure git is initialized. heroku auth:login. heroku create (creates link). git push heroku main. heroku open (opens deployed app from CLI)
  // config vars in heroku, can add API keys. in our code if we have process.env.APIKEY --> heroku will find it in config vars